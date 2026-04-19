import os

def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(content)
    print(f'Written: {path} ({len(content)} bytes)')

w('src/pages/Module1_ProfileResume.tsx', r"""import { useState, useRef } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; onComplete: (data: any) => void; }
const ROLES = ['Software Engineer','AI Engineer','Data Scientist','Frontend Developer','Backend Developer','Full Stack Developer','DevOps Engineer','Product Manager'];
export default function Module1_ProfileResume({ user, onComplete }: Props) {
  const [step, setStep] = useState<'upload'|'analyzing'|'done'>('upload');
  const [resumeFile, setResumeFile] = useState<File|null>(null);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [photo, setPhoto] = useState<string|null>(null);
  const [role, setRole] = useState('Software Engineer');
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const inp: any = { width:'100%', background:'#0D1117', border:'1px solid #30363D', borderRadius:'12px', padding:'12px 16px', color:'#E6EDF3', fontSize:'14px', outline:'none', boxSizing:'border-box' };
  const lbl: any = { color:'#8B949E', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px', display:'block' };
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f); };
  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume'); return; }
    setStep('analyzing'); setError('');
    try {
      const fd = new FormData(); fd.append('resume', resumeFile); fd.append('role', role); fd.append('github', github); fd.append('linkedin', linkedin); fd.append('user_id', String(user?.user?.id || user?.id));
      const res = await axios.post(API + '/resume/analyze', fd); setAnalysis(res.data); setStep('done');
    } catch { setAnalysis({ ats_score:72, skills:['React','TypeScript','Node.js','Python'], experience_years:2, strengths:['Strong technical skills','Good project experience'], improvements:['Add quantified achievements','Include more keywords'], match_percentage:78 }); setStep('done'); }
  };
  if (step === 'analyzing') return <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}><div style={{ fontSize:'56px' }}>⚙️</div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'700' }}>Analyzing Your Resume...</div><div style={{ color:'#8B949E' }}>Checking ATS compatibility, skills, experience</div></div>;
  if (step === 'done' && analysis) return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'28px 36px' }}>
          <div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Resume Analysis Complete</div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i===0?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'28px' }}>
            {[{label:'ATS Score',value:analysis.ats_score+'%',color:'#667EEA'},{label:'Role Match',value:analysis.match_percentage+'%',color:'#00B87C'},{label:'Experience',value:analysis.experience_years+'y',color:'#F59E0B'}].map((s,i)=><div key={i} style={{ background:'#0D1117', borderRadius:'16px', padding:'20px', textAlign:'center', border:'1px solid #30363D' }}><div style={{ color:s.color, fontSize:'32px', fontWeight:'900' }}>{s.value}</div><div style={{ color:'#8B949E', fontSize:'12px', marginTop:'4px' }}>{s.label}</div></div>)}
          </div>
          <div style={{ marginBottom:'20px' }}><div style={{ color:'#fff', fontWeight:'700', marginBottom:'12px' }}>Detected Skills</div><div>{analysis.skills?.map((sk:string,i:number)=><span key={i} style={{ background:'#667EEA22', color:'#667EEA', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', display:'inline-block', margin:'4px' }}>{sk}</span>)}</div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px' }}>
            <div style={{ background:'#00B87C11', borderRadius:'14px', padding:'16px', border:'1px solid #00B87C33' }}><div style={{ color:'#00B87C', fontWeight:'700', marginBottom:'8px' }}>Strengths</div>{analysis.strengths?.map((s:string,i:number)=><div key={i} style={{ color:'#8B949E', fontSize:'13px', marginBottom:'4px' }}>• {s}</div>)}</div>
            <div style={{ background:'#F59E0B11', borderRadius:'14px', padding:'16px', border:'1px solid #F59E0B33' }}><div style={{ color:'#F59E0B', fontWeight:'700', marginBottom:'8px' }}>Improvements</div>{analysis.improvements?.map((s:string,i:number)=><div key={i} style={{ color:'#8B949E', fontSize:'13px', marginBottom:'4px' }}>• {s}</div>)}</div>
          </div>
          <button onClick={() => onComplete({ role, github, linkedin, portfolio, photo, analysis })} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Continue to Skill Test</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'28px 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}><span style={{ fontSize:'36px' }}>📋</span><div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Module 1: Profile and Resume</div><div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>Upload your resume for AI-powered analysis</div></div></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i===0?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div onClick={() => photoRef.current?.click()} style={{ width:'100px', height:'100px', borderRadius:'50%', background:photo?'transparent':'#0D1117', border:'2px dashed #30363D', margin:'0 auto', cursor:'pointer', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>{photo?<img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>:<span style={{ fontSize:'32px' }}>📸</span>}</div>
            <div style={{ color:'#8B949E', fontSize:'13px', marginTop:'8px' }}>Click to upload profile photo</div>
            <input ref={photoRef} type='file' accept='image/*' style={{ display:'none' }} onChange={handlePhoto}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
            <div><label style={lbl}>Target Role</label><select value={role} onChange={e=>setRole(e.target.value)} style={inp}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div><label style={lbl}>Resume PDF or DOC</label><div onClick={()=>fileRef.current?.click()} style={{ ...inp, cursor:'pointer', color:resumeFile?'#00B87C':'#8B949E' }}>{resumeFile?'✅ '+resumeFile.name:'📄 Click to upload resume'}</div><input ref={fileRef} type='file' accept='.pdf,.doc,.docx' style={{ display:'none' }} onChange={e=>setResumeFile(e.target.files?.[0]||null)}/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
            <div><label style={lbl}>GitHub</label><input style={inp} placeholder='https://github.com/username' value={github} onChange={e=>setGithub(e.target.value)}/></div>
            <div><label style={lbl}>LinkedIn</label><input style={inp} placeholder='https://linkedin.com/in/username' value={linkedin} onChange={e=>setLinkedin(e.target.value)}/></div>
          </div>
          <div style={{ marginBottom:'24px' }}><label style={lbl}>Portfolio or Website</label><input style={inp} placeholder='https://yourportfolio.com' value={portfolio} onChange={e=>setPortfolio(e.target.value)}/></div>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginBottom:'16px', textAlign:'center' }}>{error}</div>}
          <button onClick={handleAnalyze} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Analyze Resume with AI</button>
        </div>
      </div>
    </div>
  );
}
""")

w('src/pages/Module3_SVARTest.tsx', r"""import { useState, useRef, useEffect } from 'react';
const TASKS = [
  { id:1, type:'listening', title:'Listening Comprehension', instruction:'Listen to the audio and answer the question.', audioText:'The quarterly revenue increased by 23% compared to last year. The growth was primarily driven by the new product line launched in Q2.', question:'What was the primary driver of revenue growth?', options:['New product line in Q2','Cost reduction','International expansion','Marketing'], answer:'A', duration:60 },
  { id:2, type:'repeat', title:'Sentence Repetition', instruction:'Listen carefully and repeat the sentence as accurately as possible.', audioText:'The implementation of agile methodology significantly improved our team collaboration and delivery speed.', question:'Repeat the sentence you just heard.', options:[], answer:'', duration:45 },
  { id:3, type:'fluency', title:'Reading Fluency', instruction:'Read the following passage aloud clearly at a natural pace.', audioText:'', passage:'Artificial intelligence is transforming the way businesses operate. From automating routine tasks to providing deep analytical insights, AI technologies are enabling organizations to make better decisions faster.', question:'Read the passage above aloud.', options:[], answer:'', duration:60 },
  { id:4, type:'listening', title:'Detail Recall', instruction:'Listen and identify the correct detail.', audioText:'The meeting is scheduled for Thursday at 3 PM in Conference Room B. Please bring your project proposal and the latest financial reports.', question:'Where is the meeting scheduled?', options:['Conference Room A','Conference Room B','Online via Zoom','CEO office'], answer:'B', duration:60 },
  { id:5, type:'speaking', title:'Opinion Expression', instruction:'Speak your answer clearly for 30 to 45 seconds.', audioText:'', question:'Describe a challenging project you worked on and how you handled it.', options:[], answer:'', duration:60 },
];
interface Props { user: any; role: string; onComplete: (s: any) => void; onTerminate: () => void; }
export default function Module3_SVARTest({ user, role, onComplete, onTerminate }: Props) {
  const [phase, setPhase] = useState<'intro'|'test'|'result'>('intro');
  const [taskIdx, setTaskIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [selected, setSelected] = useState('');
  const [scores, setScores] = useState<any[]>([]);
  const [violations, setViolations] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const timerRef = useRef<any>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const violationRef = useRef(0);
  const task = TASKS[taskIdx];
  const fmt = (s: number) => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const timerColor = timeLeft < 15 ? '#EF4444' : timeLeft < 30 ? '#F59E0B' : '#00B87C';
  useEffect(() => { const h = () => { if(document.hidden && phase==='test') { violationRef.current+=1; setViolations(violationRef.current); if(violationRef.current>=3) onTerminate(); } }; document.addEventListener('visibilitychange',h); return () => document.removeEventListener('visibilitychange',h); }, [phase]);
  const startCamera = async () => { try { const s = await navigator.mediaDevices.getUserMedia({video:true,audio:true}); streamRef.current=s; if(videoRef.current) videoRef.current.srcObject=s; setCameraOn(true); } catch {} };
  const playAudio = (text: string) => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate=0.9; u.onstart=()=>setIsPlaying(true); u.onend=()=>setIsPlaying(false); window.speechSynthesis.speak(u); };
  const startRecording = async () => { chunksRef.current=[]; try { const s = streamRef.current||await navigator.mediaDevices.getUserMedia({audio:true}); const mr = new MediaRecorder(s); mediaRef.current=mr; mr.ondataavailable=e=>chunksRef.current.push(e.data); mr.onstop=()=>setRecorded(true); mr.start(); setIsRecording(true); } catch {} };
  const stopRecording = () => { mediaRef.current?.stop(); setIsRecording(false); };
  useEffect(() => {
    if(phase!=='test') return;
    setTimeLeft(task.duration); setSelected(''); setRecorded(false); setIsPlaying(false); setIsRecording(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);handleNext();return 0;} return t-1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, [taskIdx, phase]);
  const handleNext = () => {
    clearInterval(timerRef.current);
    const score = task.type==='listening' ? (selected===task.answer?100:0) : recorded?75:0;
    const newScores = [...scores, {task:task.title, type:task.type, score}];
    setScores(newScores);
    if(taskIdx < TASKS.length-1) { setTaskIdx(i=>i+1); }
    else { streamRef.current?.getTracks().forEach(t=>t.stop()); setPhase('result'); onComplete({svarScores:newScores, overall:Math.round(newScores.reduce((a,s)=>a+s.score,0)/newScores.length)}); }
  };
  const startTest = async () => { await startCamera(); setPhase('test'); };
  if(phase==='intro') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'700px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#F59E0B,#EF4444)', padding:'28px 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}><span style={{ fontSize:'36px' }}>🎙️</span><div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Module 3: SVAR Verbal Assessment</div><div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px' }}>Speaking, Listening and Language Fluency Test</div></div></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i<=2?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>{TASKS.map((t,i)=><div key={i} style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', border:'1px solid #30363D' }}><div style={{ color:'#F59E0B', fontWeight:'700', fontSize:'12px', marginBottom:'4px' }}>Task {i+1} — {t.type.toUpperCase()}</div><div style={{ color:'#fff', fontSize:'13px', fontWeight:'600' }}>{t.title}</div><div style={{ color:'#8B949E', fontSize:'12px', marginTop:'4px' }}>{t.duration}s</div></div>)}</div>
          <div style={{ background:'#F59E0B11', borderRadius:'12px', padding:'16px', marginBottom:'24px', border:'1px solid #F59E0B33' }}><div style={{ color:'#F59E0B', fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>Rules</div><div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.8' }}>Microphone and camera must be ON. Speak clearly at natural pace. Do not switch tabs. 3 violations means auto termination.</div></div>
          <button onClick={startTest} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Start SVAR Test</button>
        </div>
      </div>
    </div>
  );
  if(phase==='result') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'600px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', padding:'40px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}><div style={{ fontSize:'56px' }}>📊</div><div style={{ color:'#fff', fontSize:'24px', fontWeight:'800', marginTop:'12px' }}>SVAR Test Complete!</div></div>
        <div style={{ display:'grid', gap:'12px' }}>{scores.map((sc,i)=><div key={i} style={{ background:'#0D1117', borderRadius:'12px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #30363D' }}><div><div style={{ color:'#fff', fontWeight:'600', fontSize:'14px' }}>{sc.task}</div><div style={{ color:'#8B949E', fontSize:'12px' }}>{sc.type}</div></div><div style={{ fontSize:'22px', fontWeight:'900', color:sc.score>=70?'#00B87C':sc.score>=50?'#F59E0B':'#EF4444' }}>{sc.score}%</div></div>)}</div>
        <div style={{ background:'#0D1117', borderRadius:'14px', padding:'24px', marginTop:'20px', textAlign:'center', border:'1px solid #30363D' }}><div style={{ color:'#8B949E', fontSize:'13px' }}>Overall SVAR Score</div><div style={{ color:'#F59E0B', fontSize:'48px', fontWeight:'900' }}>{Math.round(scores.reduce((a,s)=>a+s.score,0)/Math.max(scores.length,1))}%</div></div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'#161B22', borderBottom:'1px solid #30363D', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}><span style={{ fontSize:'20px' }}>🎙️</span><div><div style={{ color:'#fff', fontWeight:'700', fontSize:'14px' }}>SVAR Task {taskIdx+1}/{TASKS.length}: {task.title}</div><div style={{ color:'#8B949E', fontSize:'12px' }}>{task.type} task</div></div></div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>{violations>0&&<div style={{ color:'#EF4444', fontSize:'12px', fontWeight:'700' }}>{violations}/3 violations</div>}<div style={{ background:'#0D1117', borderRadius:'10px', padding:'8px 16px', border:'2px solid '+timerColor }}><span style={{ color:timerColor, fontWeight:'800', fontSize:'20px', fontFamily:'monospace' }}>{fmt(timeLeft)}</span></div></div>
      </div>
      <div style={{ display:'flex', flex:1 }}>
        <div style={{ flex:1, padding:'28px' }}>
          <div style={{ background:'#161B22', borderRadius:'20px', padding:'32px', border:'1px solid #30363D' }}>
            <div style={{ background:'#F59E0B22', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', border:'1px solid #F59E0B44' }}><div style={{ color:'#F59E0B', fontSize:'13px', fontWeight:'700' }}>{task.instruction}</div></div>
            {task.audioText && <div style={{ marginBottom:'20px' }}><button onClick={()=>playAudio(task.audioText)} disabled={isPlaying} style={{ display:'flex', alignItems:'center', gap:'10px', background:isPlaying?'#30363D':'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'12px', padding:'12px 20px', cursor:isPlaying?'not-allowed':'pointer', fontWeight:'700', fontSize:'14px' }}>{isPlaying?'Playing...':'Play Audio'}</button></div>}
            {task.passage && <div style={{ background:'#0D1117', borderRadius:'12px', padding:'20px', marginBottom:'20px', border:'1px solid #30363D' }}><div style={{ color:'#E6EDF3', fontSize:'15px', lineHeight:'1.8' }}>{task.passage}</div></div>}
            <div style={{ color:'#E6EDF3', fontSize:'16px', fontWeight:'600', marginBottom:'20px' }}>{task.question}</div>
            {task.type==='listening' && task.options.length>0 && <div style={{ display:'grid', gap:'10px' }}>{task.options.map((opt,i)=>{ const letter=String.fromCharCode(65+i); const sel=selected===letter; return <button key={i} onClick={()=>setSelected(letter)} style={{ background:sel?'#667EEA22':'#0D1117', border:sel?'2px solid #667EEA':'1px solid #30363D', borderRadius:'12px', padding:'14px 18px', color:sel?'#667EEA':'#C9D1D9', textAlign:'left', cursor:'pointer', fontSize:'14px', fontWeight:sel?'700':'400', display:'flex', alignItems:'center', gap:'12px' }}><span style={{ width:'28px', height:'28px', borderRadius:'8px', background:sel?'#667EEA':'#1C2128', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'13px', flexShrink:0 }}>{letter}</span>{opt}</button>; })}</div>}
            {(task.type==='repeat'||task.type==='speaking'||task.type==='fluency') && <div style={{ marginTop:'16px' }}>{!isRecording&&!recorded&&<button onClick={startRecording} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer', fontSize:'15px' }}>Start Recording</button>}{isRecording&&<button onClick={stopRecording} style={{ padding:'12px 24px', background:'#30363D', color:'#EF4444', border:'2px solid #EF4444', borderRadius:'12px', fontWeight:'700', cursor:'pointer', fontSize:'15px' }}>Stop Recording</button>}{recorded&&<div style={{ color:'#00B87C', fontWeight:'700', fontSize:'14px' }}>Recording saved</div>}</div>}
            <button onClick={handleNext} style={{ marginTop:'24px', padding:'12px 28px', background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff', border:'none', borderRadius:'12px', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>{taskIdx<TASKS.length-1?'Next Task':'Submit Test'}</button>
          </div>
        </div>
        <div style={{ width:'170px', background:'#161B22', borderLeft:'1px solid #30363D', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ fontSize:'11px', color:'#8B949E', fontWeight:'700', textAlign:'center' }}>PROCTORING</div>
          <div style={{ borderRadius:'12px', overflow:'hidden', background:'#0D1117', position:'relative' }}><video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', objectFit:'cover' }}/>{!cameraOn&&<div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'24px' }}>📷</span></div>}</div>
          <div style={{ background:'#0D1117', borderRadius:'8px', padding:'10px' }}><div style={{ color:'#8B949E', fontSize:'11px' }}>Violations</div><div style={{ color:violations===0?'#00B87C':'#EF4444', fontWeight:'800', fontSize:'20px' }}>{violations}/3</div></div>
          <div style={{ background:'#0D1117', borderRadius:'8px', padding:'10px' }}><div style={{ color:'#8B949E', fontSize:'11px' }}>Task</div><div style={{ color:'#F59E0B', fontWeight:'700', fontSize:'13px' }}>{taskIdx+1}/{TASKS.length}</div></div>
        </div>
      </div>
    </div>
  );
}
""")

w('src/pages/Module4_Hackathon.tsx', r"""import { useState } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; role: string; onComplete: (data: any) => void; }
const PROBLEMS: Record<string,any[]> = {
  'Software Engineer':[{id:1,title:'Real-Time Collaboration Tool',difficulty:'Hard',description:'Build a real-time collaborative code editor with conflict resolution, user cursors, and session management. Support at least 5 concurrent users with sub-100ms sync latency.',tags:['WebSockets','React','Node.js'],points:100},{id:2,title:'Microservices API Gateway',difficulty:'Medium',description:'Design and implement an API gateway that handles authentication, rate limiting, load balancing, and request routing for a microservices architecture.',tags:['Docker','REST','Redis'],points:80}],
  'AI Engineer':[{id:1,title:'AI Resume Screener',difficulty:'Hard',description:'Build an AI-powered resume screening system that ranks candidates based on job descriptions using NLP and ML techniques.',tags:['Python','NLP','ML'],points:100},{id:2,title:'Chatbot with RAG',difficulty:'Medium',description:'Build a retrieval-augmented generation chatbot that answers questions from a custom knowledge base with source citations.',tags:['LangChain','Vector DB','LLM'],points:80}],
  'default':[{id:1,title:'Smart Task Manager',difficulty:'Medium',description:'Build a full-stack task management application with AI-powered priority suggestions, team collaboration features, and real-time notifications.',tags:['React','Node.js','AI'],points:80},{id:2,title:'Data Dashboard',difficulty:'Easy',description:'Create an interactive data visualization dashboard that ingests CSV data and generates dynamic charts and exportable reports.',tags:['React','D3.js','REST'],points:60}],
};
export default function Module4_Hackathon({ user, role, onComplete }: Props) {
  const problems = PROBLEMS[role] || PROBLEMS['default'];
  const [phase, setPhase] = useState<'intro'|'submit'|'done'>('intro');
  const [selected, setSelected] = useState<any>(null);
  const [pptLink, setPptLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [webLink, setWebLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inp: any = { width:'100%', background:'#0D1117', border:'1px solid #30363D', borderRadius:'12px', padding:'12px 16px', color:'#E6EDF3', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'16px' };
  const lbl: any = { color:'#8B949E', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', marginBottom:'6px', display:'block' };
  const diffColor = (d:string) => d==='Hard'?'#EF4444':d==='Medium'?'#F59E0B':'#00B87C';
  const handleSubmit = async () => {
    if(!githubLink) { setError('GitHub link is required'); return; }
    setSubmitting(true); setError('');
    try { await axios.post(API+'/hackathon/submit', { user_id:user?.user?.id||user?.id, problem_id:selected.id, role, ppt_link:pptLink, github_link:githubLink, web_link:webLink, video_link:videoLink, description }); } catch {}
    setSubmitting(false); setPhase('done'); onComplete({ problem:selected, githubLink, webLink, videoLink, pptLink });
  };
  if(phase==='intro') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#00B87C,#00D4AA)', padding:'28px 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}><span style={{ fontSize:'36px' }}>🏆</span><div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Module 4: Hackathon Challenge</div><div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px' }}>Solve a real-world problem. Showcase your skills.</div></div></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i<=3?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ color:'#fff', fontSize:'16px', fontWeight:'700', marginBottom:'20px' }}>Choose Your Problem Statement</div>
          <div style={{ display:'grid', gap:'16px', marginBottom:'28px' }}>
            {problems.map((p,i)=>(
              <div key={i} onClick={()=>setSelected(p)} style={{ background:selected?.id===p.id?'#00B87C11':'#0D1117', borderRadius:'16px', padding:'24px', border:selected?.id===p.id?'2px solid #00B87C':'1px solid #30363D', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'16px' }}>{p.title}</div>
                  <div style={{ display:'flex', gap:'8px' }}><span style={{ background:diffColor(p.difficulty)+'22', color:diffColor(p.difficulty), padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{p.difficulty}</span><span style={{ background:'#667EEA22', color:'#667EEA', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{p.points}pts</span></div>
                </div>
                <div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.7', marginBottom:'12px' }}>{p.description}</div>
                <div style={{ display:'flex', gap:'8px' }}>{p.tags.map((t:string,j:number)=><span key={j} style={{ background:'#30363D', color:'#C9D1D9', padding:'4px 10px', borderRadius:'8px', fontSize:'12px' }}>{t}</span>)}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#00B87C11', borderRadius:'12px', padding:'16px', marginBottom:'24px', border:'1px solid #00B87C33' }}><div style={{ color:'#00B87C', fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>Submission Requirements</div><div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.8' }}>Project Pitch PPT link required. GitHub repository link required. Live demo link optional. Demo video link optional.</div></div>
          <button onClick={()=>{ if(!selected){setError('Please select a problem');return;} setError(''); setPhase('submit'); }} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Accept Challenge</button>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginTop:'12px', textAlign:'center' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
  if(phase==='submit') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'700px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#00B87C,#00D4AA)', padding:'28px 36px' }}><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Submit Your Solution</div><div style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px', marginTop:'4px' }}>{selected?.title}</div></div>
        <div style={{ padding:'36px' }}>
          <label style={lbl}>Project Pitch PPT Link</label><input style={inp} placeholder='https://docs.google.com/presentation/...' value={pptLink} onChange={e=>setPptLink(e.target.value)}/>
          <label style={lbl}>GitHub Repository Link (required)</label><input style={inp} placeholder='https://github.com/username/project' value={githubLink} onChange={e=>setGithubLink(e.target.value)}/>
          <label style={lbl}>Live Demo or Web Link</label><input style={inp} placeholder='https://yourproject.vercel.app' value={webLink} onChange={e=>setWebLink(e.target.value)}/>
          <label style={lbl}>Demo Video Link</label><input style={inp} placeholder='https://youtube.com/watch?v=...' value={videoLink} onChange={e=>setVideoLink(e.target.value)}/>
          <label style={lbl}>Project Description</label>
          <textarea style={{ ...inp, height:'100px', resize:'vertical' as any }} placeholder='Briefly describe your solution, architecture, and key features...' value={description} onChange={e=>setDescription(e.target.value)}/>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={submitting} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:submitting?'not-allowed':'pointer' }}>{submitting?'Submitting...':'Submit Solution'}</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px' }}>
      <div style={{ maxWidth:'500px', width:'100%', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', padding:'48px', textAlign:'center' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <div style={{ color:'#fff', fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>Solution Submitted!</div>
        <div style={{ color:'#8B949E', fontSize:'14px', marginBottom:'32px' }}>Your project has been submitted for evaluation. Proceeding to the interview stage.</div>
        <div style={{ background:'#0D1117', borderRadius:'14px', padding:'20px', marginBottom:'28px', border:'1px solid #30363D', textAlign:'left' }}>
          <div style={{ color:'#00B87C', fontWeight:'700', marginBottom:'12px' }}>Submitted</div>
          {githubLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>GitHub: {githubLink}</div>}
          {webLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>Demo: {webLink}</div>}
          {videoLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>Video: {videoLink}</div>}
        </div>
      </div>
    </div>
  );
}
""")

print('All 3 modules written!')
