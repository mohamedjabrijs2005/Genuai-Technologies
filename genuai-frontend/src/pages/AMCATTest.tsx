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
    <div className="min-h-screen bg-background quantum-gradient flex flex-col items-center justify-center gap-md">
      <div className="text-4xl animate-spin">⚙️</div>
      <p className="text-on-surface font-bold">Loading GenuAI Skill Test...</p>
    </div>
  );

  if (phase === 'intro') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="glass max-w-2xl w-full mx-auto rounded-xxxl p-xl md:p-xxl border border-surface-container shadow-sm animate-[slideUp_0.4s_ease] relative z-10">
        <div className="text-center mb-xl">
          <div className="text-5xl mb-md drop-shadow-sm">🎯</div>
          <h1 className="text-headline-sm font-headline-sm text-on-surface m-0 mb-xs">GenuAI Skill Assessment</h1>
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Role: <span className="text-indigo-brand">{role}</span></p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-xl">
          {SECTIONS_CONFIG.map((s, i) => (
            <div key={i} className="bg-surface-bright rounded-2xl p-md border border-surface-container flex flex-col justify-center">
              <div className="text-indigo-brand font-black text-xs uppercase tracking-wide mb-1">Section {i+1}</div>
              <div className="text-on-surface text-sm font-bold">{s.name}</div>
              <div className="text-on-surface-variant text-xs mt-1 font-medium flex items-center gap-xs"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>timer</span> {s.duration/60} min</div>
            </div>
          ))}
        </div>
        <div className="bg-warning/5 rounded-2xl p-md mb-xl border border-warning/20">
          <p className="text-warning-dark font-black text-sm mb-xs flex items-center gap-xs"><span className="material-symbols-outlined">warning</span> Important Rules</p>
          <div className="text-on-surface-variant text-sm font-medium leading-relaxed">
            <ul className="list-disc pl-5 m-0 space-y-1">
              <li>Camera must be ON throughout the test</li>
              <li>Do NOT switch tabs or windows</li>
              <li>Do NOT right-click or copy/paste</li>
              <li><span className="text-error font-bold">3 violations</span> = automatic termination</li>
              <li>Each section has its own timer</li>
            </ul>
          </div>
        </div>
        <button onClick={startTest} className="w-full py-md bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:scale-[1.01] transition-all">
          Start Test →
        </button>
      </div>
    </div>
  );

  if (phase === 'break') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-lg w-full mx-auto rounded-xxxl p-xl md:p-xxl border border-surface-container shadow-sm text-center animate-[slideUp_0.4s_ease] relative z-10">
        <div className="text-6xl mb-md drop-shadow-sm">✅</div>
        <h2 className="text-headline-sm font-headline-sm text-on-surface m-0 mb-xs">Section {currentSection + 1} Complete!</h2>
        <p className="text-on-surface-variant font-bold mb-xl">Score: <span className="text-success">{sectionScores[sectionScores.length-1]?.percentage || 0}%</span></p>
        <div className="bg-surface-bright rounded-2xl p-md mb-xl border border-surface-container">
          <p className="text-indigo-brand font-black text-sm uppercase tracking-wide m-0 mb-1">Next: {sections[currentSection+1]?.name}</p>
          <p className="text-on-surface-variant text-sm font-medium m-0 flex justify-center items-center gap-xs"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>timer</span> {SECTIONS_CONFIG[currentSection+1]?.duration/60} minutes</p>
        </div>
        <button onClick={nextSection} className="w-full py-md bg-gradient-to-r from-success to-success-dark text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(0,184,124,0.3)] hover:scale-[1.01] transition-all">
          Continue to Next Section →
        </button>
      </div>
    </div>
  );

  if (phase === 'result') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className={`absolute top-[-10%] ${terminated ? 'left-[-10%] bg-error/10' : 'right-[-10%] bg-indigo-brand/10'} w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none`} />
      <div className="glass max-w-2xl w-full mx-auto rounded-xxxl p-xl md:p-xxl border border-surface-container shadow-sm animate-[slideUp_0.4s_ease] relative z-10">
        <div className="text-center mb-xl">
          <div className="text-6xl drop-shadow-sm mb-sm">{terminated ? '🚫' : '📊'}</div>
          <h2 className={`text-headline-sm font-headline-sm m-0 ${terminated ? 'text-error' : 'text-on-surface'}`}>{terminated ? 'Test Terminated' : 'Test Complete!'}</h2>
          {terminated && <p className="text-on-surface-variant text-sm font-semibold mt-xs bg-error/10 text-error p-xs rounded-lg inline-block">Maximum violations reached. Your result has been reported.</p>}
        </div>
        {!terminated && (
          <>
            <div className="grid gap-sm">
              {sectionScores.map((s, i) => (
                <div key={i} className="bg-surface-bright rounded-2xl p-md border border-surface-container flex justify-between items-center transition-all hover:border-surface-container-high">
                  <div>
                    <div className="text-on-surface font-bold text-sm">{s.name}</div>
                    <div className="text-on-surface-variant text-xs font-medium">{s.score}/{s.total} marks</div>
                  </div>
                  <div className={`text-2xl font-black ${s.percentage >= 70 ? 'text-success' : s.percentage >= 50 ? 'text-warning' : 'text-error'}`}>{s.percentage}%</div>
                </div>
              ))}
            </div>
            <div className="bg-surface-bright rounded-2xl p-xl mt-lg text-center border border-surface-container">
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Overall Score</div>
              <div className="text-indigo-brand text-5xl font-black drop-shadow-sm">
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
    <div className="h-screen bg-background quantum-gradient flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-brand/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="glass border-b border-surface-container flex justify-between items-center p-sm px-lg shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-sm">
          <img src='/logo.png' className="w-10 h-10 object-contain gold-glow-subtle" alt='logo' />
          <div>
            <div className="text-on-surface font-bold text-sm">Section {currentSection+1}/4: <span className="text-indigo-brand">{sec?.name}</span></div>
            <div className="text-on-surface-variant text-xs font-semibold">Q{currentQ+1} of {sec?.questions.length} — {role}</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          {violations > 0 && (
            <div className="bg-error/10 border border-error/30 text-error px-sm py-1 rounded-lg text-xs font-bold animate-[pulse_2s_ease-in-out_infinite]">
              {violations}/3 Violations
            </div>
          )}
          <div className="bg-surface-bright rounded-xl px-md py-xs border-2" style={{ borderColor: timerColor }}>
            <span className="font-mono font-black text-xl" style={{ color: timerColor }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </div>

      {violationMsg && (
        <div className="bg-error text-white font-bold text-center text-sm py-xs shrink-0 shadow-sm z-20 animate-[slideDown_0.3s_ease]">
          {violationMsg}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden z-10">
        {/* Question Area */}
        <div className="flex-1 p-lg md:p-xl overflow-y-auto custom-scrollbar">
          {/* Question Navigator */}
          <div className="flex gap-xs mb-xl flex-wrap">
            {sec?.questions.map((_qq, i) => (
              <div key={i} onClick={() => setCurrentQ(i)} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer transition-all hover:scale-105 ${answers[sec.questions[i]?.id] ? 'bg-success text-white border-2 border-success shadow-sm' : i === currentQ ? 'bg-indigo-brand text-white border-2 border-indigo-brand shadow-sm scale-110' : 'bg-surface-bright text-on-surface-variant border border-surface-container hover:border-surface-container-high'}`}>
                {i+1}
              </div>
            ))}
          </div>

          {q && (
            <div className="glass rounded-3xl p-xl border border-surface-container shadow-sm animate-[fadeIn_0.3s_ease]">
              <div className="flex justify-between items-center mb-lg">
                <span className="bg-indigo-brand/10 text-indigo-brand border border-indigo-brand/20 px-sm py-1 rounded-full text-xs font-bold">K-Level {q.k_level}</span>
                <span className="bg-warning/10 text-warning-dark border border-warning/20 px-sm py-1 rounded-full text-xs font-bold">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
              </div>
              <p className="text-on-surface text-lg font-bold leading-relaxed mb-xl">{q.question_text}</p>
              
              <div className="grid gap-sm mb-xl">
                {(['A','B','C','D'] as const).map(opt => {
                  const key = ('option_' + opt.toLowerCase()) as keyof Question;
                  const val = q[key] as string;
                  const selected = answers[q.id] === opt;
                  return (
                    <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                      className={`text-left p-md rounded-2xl border-2 transition-all flex items-center gap-md hover:scale-[1.01] ${selected ? 'bg-indigo-brand/5 border-indigo-brand text-indigo-brand shadow-sm' : 'bg-surface-bright border-surface-container text-on-surface hover:border-surface-container-high'}`}>
                      <span className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${selected ? 'bg-indigo-brand text-white' : 'bg-surface-container/50 text-on-surface-variant'}`}>{opt}</span>
                      <span className={`text-sm ${selected ? 'font-bold' : 'font-medium'}`}>{val}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-xl border-t border-surface-container/50 pt-lg">
                <button onClick={() => setCurrentQ(q => Math.max(0, q-1))} disabled={currentQ === 0}
                  className={`px-lg py-sm rounded-xl font-bold text-sm transition-all ${currentQ === 0 ? 'bg-surface-container/30 text-on-surface-variant/50 cursor-not-allowed' : 'bg-surface-container/50 text-on-surface-variant hover:bg-surface-container'}`}>
                  ← Previous
                </button>
                {currentQ < sec.questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(q => q+1)}
                    className="px-xl py-sm bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white rounded-xl font-bold text-sm hover:shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:scale-[1.02] transition-all">
                    Next →
                  </button>
                ) : (
                  <button onClick={handleSectionEnd}
                    className="px-xl py-sm bg-gradient-to-r from-success to-success-dark text-white rounded-xl font-bold text-sm hover:shadow-[0_4px_15px_rgba(0,184,124,0.3)] hover:scale-[1.02] transition-all">
                    Submit Section ✓
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Proctoring Sidebar */}
        <div className="w-[220px] glass border-l border-surface-container p-md flex flex-col gap-md shrink-0">
          <div className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest text-center">Proctoring Active</div>
          
          <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-surface-container shadow-inner aspect-[4/3] flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!cameraAllowed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-bright/90 backdrop-blur-sm p-sm">
                <div className="text-3xl mb-1">📷</div>
                <div className="text-error font-bold text-xs text-center">Camera required</div>
              </div>
            )}
          </div>
          
          <div className="bg-surface-bright rounded-xl p-sm border border-surface-container text-center">
            <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Violations</div>
            <div className={`font-black text-2xl ${violations === 0 ? 'text-success' : violations === 1 ? 'text-warning' : 'text-error'}`}>{violations}/3</div>
          </div>
          
          <div className="bg-surface-bright rounded-xl p-sm border border-surface-container text-center">
            <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Answered</div>
            <div className="text-indigo-brand font-black text-2xl">{Object.keys(answers).length}<span className="text-on-surface-variant/50 text-sm">/{sec?.questions.length || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
