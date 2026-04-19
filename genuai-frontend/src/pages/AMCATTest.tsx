import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  k_level: number;
  marks: number;
}

interface Section {
  name: string;
  category: string;
  duration: number;
  questions: Question[];
}

interface Props {
  user: any;
  role: string;
  assessmentId?: number;
  onComplete: (scores: any) => void;
  onTerminate: () => void;
}

const SECTIONS_CONFIG = [
  { name: 'Coding & Technical', category: 'role', duration: 30 * 60 },
  { name: 'Aptitude', category: 'Aptitude', duration: 20 * 60 },
  { name: 'English Grammar', category: 'English', duration: 15 * 60 },
  { name: 'Automata & Theory', category: 'Automata', duration: 15 * 60 },
];

export default function AMCATTest({ user, role, assessmentId, onComplete, onTerminate }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [violations, setViolations] = useState(0);
  const [violationMsg, setViolationMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'intro'|'test'|'break'|'result'>('intro');
  const [sectionScores, setSectionScores] = useState<any[]>([]);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const violationRef = useRef(0);

  useEffect(() => { loadSections(); }, []);

  const loadSections = async () => {
    setLoading(true);
    const loaded: Section[] = [];
    for (const cfg of SECTIONS_CONFIG) {
      try {
        const cat = cfg.category === 'role' ? encodeURIComponent(role) : cfg.category;
        const res = await axios.get(`${API}/skill/amcat/${cat}`);
        loaded.push({ name: cfg.name, category: cfg.category, duration: cfg.duration, questions: res.data || [] });
      } catch {
        loaded.push({ name: cfg.name, category: cfg.category, duration: cfg.duration, questions: [] });
      }
    }
    setSections(loaded);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraAllowed(true);
    } catch { setCameraAllowed(false); }
  };

  useEffect(() => {
    if (phase !== 'test') return;
    const handleVisibility = () => { if (document.hidden) triggerViolation('Tab switch detected'); };
    const handleBlur = () => triggerViolation('Window focus lost');
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'test') return;
    const prevent = (e: Event) => { e.preventDefault(); triggerViolation('Copy/paste attempt'); };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
    };
  }, [phase]);

  const triggerViolation = useCallback((reason: string) => {
    violationRef.current += 1;
    setViolations(violationRef.current);
    setViolationMsg('Warning ' + violationRef.current + '/3: ' + reason);
    axios.post(API + '/skill/violation', { user_id: user.id, assessment_id: assessmentId, violation_type: reason, count: violationRef.current, auto_terminated: violationRef.current >= 3 }).catch(() => {});
    if (violationRef.current >= 3) autoTerminate();
    else setTimeout(() => setViolationMsg(''), 4000);
  }, [user, assessmentId]);

  const autoTerminate = () => {
    setTerminated(true);
    setPhase('result');
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
    onTerminate();
  };

  useEffect(() => {
    if (phase !== 'test' || sections.length === 0) return;
    setTimeLeft(sections[currentSection]?.duration || 0);
  }, [currentSection, phase]);

  useEffect(() => {
    if (phase !== 'test' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSectionEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, phase, currentSection]);

  const handleSectionEnd = async () => {
    clearInterval(timerRef.current);
    const sec = sections[currentSection];
    const answerList = sec.questions.map(q => ({ id: q.id, answer: answers[q.id] || '' }));
    let score = 0, total = 0, percentage = 0;
    try {
      const res = await axios.post(API + '/skill/evaluate', { answers: answerList });
      score = res.data.score; total = res.data.total; percentage = res.data.percentage;
    } catch {}
    const newScores = [...sectionScores, { name: sec.name, score, total, percentage }];
    setSectionScores(newScores);
    if (currentSection < sections.length - 1) {
      setPhase('break'); setAnswers({}); setCurrentQ(0);
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop());
      setPhase('result');
      const overall = Math.round(newScores.reduce((a, s) => a + s.percentage, 0) / newScores.length);
      onComplete({ sectionScores: newScores, overall });
    }
  };

  const startTest = async () => { await startCamera(); setPhase('test'); setCurrentSection(0); setCurrentQ(0); setAnswers({}); };
  const nextSection = () => { setCurrentSection(s => s + 1); setPhase('test'); };
  const fmt = (s: number) => String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : '#00B87C';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0A0A0F', color:'#fff', flexDirection:'column', gap:'16px' }}>
      <p>Loading AMCAT Test...</p>
    </div>
  );

  if (phase === 'intro') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0A0A0F,#1a1a2e)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ maxWidth:'600px', width:'100%', background:'#161B22', borderRadius:'20px', padding:'40px', border:'1px solid #30363D' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎯</div>
          <h1 style={{ color:'#fff', fontSize:'24px', margin:'0 0 8px' }}>AMCAT-Style Skill Assessment</h1>
          <p style={{ color:'#8B949E', fontSize:'14px' }}>Role: {role}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'28px' }}>
          {SECTIONS_CONFIG.map((s, i) => (
            <div key={i} style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', border:'1px solid #30363D' }}>
              <div style={{ color:'#667EEA', fontWeight:'700', fontSize:'13px', marginBottom:'4px' }}>Section {i+1}</div>
              <div style={{ color:'#fff', fontSize:'14px', fontWeight:'600' }}>{s.name}</div>
              <div style={{ color:'#8B949E', fontSize:'12px', marginTop:'4px' }}>Timer: {s.duration/60} min</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', marginBottom:'28px', border:'1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ color:'#F59E0B', fontWeight:'700', fontSize:'13px', margin:'0 0 8px' }}>Important Rules</p>
          <div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.8' }}>
            Camera must be ON throughout the test<br/>
            Do NOT switch tabs or windows<br/>
            Do NOT right-click or copy/paste<br/>
            3 violations = automatic termination<br/>
            Each section has its own timer
          </div>
        </div>
        <button onClick={startTest} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'16px', cursor:'pointer' }}>
          Start Test
        </button>
      </div>
    </div>
  );

  if (phase === 'break') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0A0A0F,#1a1a2e)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ maxWidth:'500px', width:'100%', background:'#161B22', borderRadius:'20px', padding:'40px', border:'1px solid #30363D', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
        <h2 style={{ color:'#fff', margin:'0 0 8px' }}>Section {currentSection + 1} Complete!</h2>
        <p style={{ color:'#8B949E', marginBottom:'24px' }}>Score: {sectionScores[sectionScores.length-1]?.percentage || 0}%</p>
        <div style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', marginBottom:'24px' }}>
          <p style={{ color:'#667EEA', fontWeight:'700', margin:'0 0 8px' }}>Next: {sections[currentSection+1]?.name}</p>
          <p style={{ color:'#8B949E', fontSize:'13px', margin:0 }}>Duration: {SECTIONS_CONFIG[currentSection+1]?.duration/60} minutes</p>
        </div>
        <button onClick={nextSection} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'15px', cursor:'pointer' }}>
          Continue to Next Section
        </button>
      </div>
    </div>
  );

  if (phase === 'result') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0A0A0F,#1a1a2e)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ maxWidth:'600px', width:'100%', background:'#161B22', borderRadius:'20px', padding:'40px', border:'1px solid #30363D' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'48px' }}>{terminated ? '🚫' : '📊'}</div>
          <h2 style={{ color: terminated ? '#EF4444' : '#fff', margin:'8px 0' }}>{terminated ? 'Test Terminated' : 'Test Complete!'}</h2>
          {terminated && <p style={{ color:'#8B949E' }}>Maximum violations reached. Your result has been reported.</p>}
        </div>
        {!terminated && (
          <>
            <div style={{ display:'grid', gap:'12px' }}>
              {sectionScores.map((s, i) => (
                <div key={i} style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ color:'#fff', fontWeight:'600', fontSize:'14px' }}>{s.name}</div>
                    <div style={{ color:'#8B949E', fontSize:'12px' }}>{s.score}/{s.total} marks</div>
                  </div>
                  <div style={{ fontSize:'20px', fontWeight:'800', color: s.percentage >= 70 ? '#00B87C' : s.percentage >= 50 ? '#F59E0B' : '#EF4444' }}>{s.percentage}%</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#0D1117', borderRadius:'12px', padding:'20px', marginTop:'20px', textAlign:'center' }}>
              <div style={{ color:'#8B949E', fontSize:'13px' }}>Overall Score</div>
              <div style={{ color:'#667EEA', fontSize:'40px', fontWeight:'900' }}>
                {Math.round(sectionScores.reduce((a,s) => a+s.percentage,0)/Math.max(sectionScores.length,1))}%
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const sec = sections[currentSection];
  const q = sec?.questions[currentQ];

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#161B22', borderBottom:'1px solid #30363D', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <img src='/logo.png' style={{ width:'32px', height:'32px', borderRadius:'8px' }} alt='logo' />
          <div>
            <div style={{ color:'#fff', fontWeight:'700', fontSize:'14px' }}>Section {currentSection+1}/4: {sec?.name}</div>
            <div style={{ color:'#8B949E', fontSize:'12px' }}>Q{currentQ+1} of {sec?.questions.length} - {role}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {violations > 0 && (
            <div style={{ background:'rgba(239,68,68,0.13)', border:'1px solid #EF4444', borderRadius:'8px', padding:'4px 12px', color:'#EF4444', fontSize:'12px', fontWeight:'700' }}>
              {violations}/3 Violations
            </div>
          )}
          <div style={{ background:'#0D1117', borderRadius:'10px', padding:'8px 16px', border:'2px solid ' + timerColor }}>
            <span style={{ color:timerColor, fontWeight:'800', fontSize:'20px', fontFamily:'monospace' }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </div>

      {violationMsg && (
        <div style={{ background:'rgba(239,68,68,0.13)', border:'1px solid #EF4444', padding:'12px 20px', color:'#EF4444', fontWeight:'700', textAlign:'center', fontSize:'14px' }}>
          {violationMsg}
        </div>
      )}

      <div style={{ display:'flex', flex:1 }}>
        <div style={{ flex:1, padding:'24px', overflowY:'auto' }}>
          <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
            {sec?.questions.map((_qq, i) => (
              <div key={i} onClick={() => setCurrentQ(i)} style={{
                width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center',
                background: answers[sec.questions[i]?.id] ? '#00B87C' : i === currentQ ? '#667EEA' : '#1C2128',
                color:'#fff', fontSize:'12px', fontWeight:'700', cursor:'pointer',
                border: i === currentQ ? '2px solid #667EEA' : '1px solid #30363D'
              }}>{i+1}</div>
            ))}
          </div>

          {q && (
            <div style={{ background:'#161B22', borderRadius:'16px', padding:'28px', border:'1px solid #30363D' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                <span style={{ background:'rgba(102,126,234,0.13)', color:'#667EEA', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>K-Level {q.k_level}</span>
                <span style={{ background:'rgba(245,158,11,0.13)', color:'#F59E0B', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
              </div>
              <p style={{ color:'#E6EDF3', fontSize:'16px', lineHeight:'1.7', marginBottom:'24px', fontWeight:'500' }}>{q.question_text}</p>
              <div style={{ display:'grid', gap:'12px' }}>
                {(['A','B','C','D'] as const).map(opt => {
                  const key = ('option_' + opt.toLowerCase()) as keyof Question;
                  const val = q[key] as string;
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                      style={{ background: selected ? 'rgba(102,126,234,0.13)' : '#0D1117', border: selected ? '2px solid #667EEA' : '1px solid #30363D', borderRadius:'12px', padding:'14px 18px', color: selected ? '#667EEA' : '#C9D1D9', textAlign:'left', cursor:'pointer', fontSize:'14px', fontWeight: selected ? '700' : '400', display:'flex', alignItems:'center', gap:'12px' }}>
                      <span style={{ width:'28px', height:'28px', borderRadius:'8px', background: selected ? '#667EEA' : '#1C2128', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>{opt}</span>
                      {val}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:'24px' }}>
                <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
                  style={{ padding:'10px 20px', background:'#1C2128', color:'#8B949E', border:'1px solid #30363D', borderRadius:'10px', cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontWeight:'600' }}>
                  Previous
                </button>
                {currentQ < sec.questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(q => q+1)}
                    style={{ padding:'10px 24px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700' }}>
                    Next
                  </button>
                ) : (
                  <button onClick={handleSectionEnd}
                    style={{ padding:'10px 24px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700' }}>
                    Submit Section
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ width:'180px', background:'#161B22', borderLeft:'1px solid #30363D', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ fontSize:'12px', color:'#8B949E', fontWeight:'700', textAlign:'center' }}>PROCTORING</div>
          <div style={{ position:'relative', borderRadius:'12px', overflow:'hidden', background:'#0D1117' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', display:'block' }} />
            {!cameraAllowed && (
              <div style={{ padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px' }}>
                <div style={{ fontSize:'24px' }}>📷</div>
                <div style={{ color:'#EF4444', fontSize:'11px', textAlign:'center' }}>Camera required</div>
              </div>
            )}
          </div>
          <div style={{ background:'#0D1117', borderRadius:'8px', padding:'10px' }}>
            <div style={{ color:'#8B949E', fontSize:'11px', marginBottom:'4px' }}>Violations</div>
            <div style={{ color: violations === 0 ? '#00B87C' : violations === 1 ? '#F59E0B' : '#EF4444', fontWeight:'800', fontSize:'20px' }}>{violations}/3</div>
          </div>
          <div style={{ background:'#0D1117', borderRadius:'8px', padding:'10px' }}>
            <div style={{ color:'#8B949E', fontSize:'11px', marginBottom:'4px' }}>Answered</div>
            <div style={{ color:'#667EEA', fontWeight:'700', fontSize:'13px' }}>{Object.keys(answers).length}/{sec?.questions.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
