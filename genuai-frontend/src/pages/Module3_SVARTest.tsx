import { useState, useRef, useEffect } from 'react';
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
