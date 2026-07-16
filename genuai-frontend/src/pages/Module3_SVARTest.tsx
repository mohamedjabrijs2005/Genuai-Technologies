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
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-warning/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-3xl w-full mx-auto rounded-xxxl overflow-hidden shadow-sm border border-surface-container animate-[slideUp_0.4s_ease]">
        <div className="bg-gradient-to-r from-warning to-error p-xl">
          <div className="flex items-center gap-md">
            <span className="text-4xl drop-shadow-md">🎙️</span>
            <div>
              <div className="text-white text-xl font-black drop-shadow-sm">Module 3: SVAR Verbal Assessment</div>
              <div className="text-white/80 text-sm font-semibold mt-1">Speaking, Listening and Language Fluency Test</div>
            </div>
          </div>
          <div className="flex gap-xs mt-lg">{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} className={`flex-1 h-1.5 rounded-full ${i<=2?'bg-white':'bg-white/20'}`}/>)}</div>
        </div>
        <div className="p-xl md:p-xxl bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-xl">
            {TASKS.map((t,i)=>(
              <div key={i} className="bg-surface-bright rounded-2xl p-md border border-surface-container">
                <div className="text-warning-dark font-black text-xs uppercase tracking-wide mb-1">Task {i+1} — {t.type}</div>
                <div className="text-on-surface text-sm font-bold">{t.title}</div>
                <div className="text-on-surface-variant text-xs mt-1 font-medium flex items-center gap-xs"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>timer</span> {t.duration}s</div>
              </div>
            ))}
          </div>
          <div className="bg-warning/5 rounded-2xl p-md mb-xl border border-warning/20">
            <p className="text-warning-dark font-black text-sm mb-xs flex items-center gap-xs"><span className="material-symbols-outlined">warning</span> Rules</p>
            <div className="text-on-surface-variant text-sm font-medium leading-relaxed">
              Microphone and camera must be ON. Speak clearly at natural pace. Do not switch tabs. <span className="text-error font-bold">3 violations</span> means auto termination.
            </div>
          </div>
          <button onClick={startTest} className="w-full py-md bg-gradient-to-r from-warning to-error text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:scale-[1.01] transition-all">Start SVAR Test →</button>
        </div>
      </div>
    </div>
  );
  if(phase==='result') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-warning/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-2xl w-full mx-auto rounded-xxxl p-xl md:p-xxl border border-surface-container shadow-sm animate-[slideUp_0.4s_ease] relative z-10">
        <div className="text-center mb-xl">
          <div className="text-6xl drop-shadow-sm mb-sm">📊</div>
          <h2 className="text-headline-sm font-headline-sm m-0 text-on-surface">SVAR Test Complete!</h2>
        </div>
        <div className="grid gap-sm">
          {scores.map((sc,i)=>(
            <div key={i} className="bg-surface-bright rounded-2xl p-md border border-surface-container flex justify-between items-center transition-all hover:border-surface-container-high">
              <div>
                <div className="text-on-surface font-bold text-sm">{sc.task}</div>
                <div className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">{sc.type}</div>
              </div>
              <div className={`text-2xl font-black ${sc.score>=70?'text-success':sc.score>=50?'text-warning':'text-error'}`}>{sc.score}%</div>
            </div>
          ))}
        </div>
        <div className="bg-surface-bright rounded-2xl p-xl mt-lg text-center border border-surface-container">
          <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Overall SVAR Score</div>
          <div className="text-warning-dark text-5xl font-black drop-shadow-sm">
            {Math.round(scores.reduce((a,s)=>a+s.score,0)/Math.max(scores.length,1))}%
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="h-screen bg-background quantum-gradient flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-warning/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="glass border-b border-surface-container flex justify-between items-center p-sm px-lg shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-sm">
          <span className="text-3xl drop-shadow-md">🎙️</span>
          <div>
            <div className="text-on-surface font-bold text-sm">SVAR Task {taskIdx+1}/{TASKS.length}: <span className="text-warning-dark">{task.title}</span></div>
            <div className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">{task.type} task</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          {violations>0 && (
            <div className="bg-error/10 border border-error/30 text-error px-sm py-1 rounded-lg text-xs font-bold animate-[pulse_2s_ease-in-out_infinite]">
              {violations}/3 Violations
            </div>
          )}
          <div className="bg-surface-bright rounded-xl px-md py-xs border-2" style={{ borderColor: timerColor }}>
            <span className="font-mono font-black text-xl" style={{ color: timerColor }}>{fmt(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden z-10">
        <div className="flex-1 p-lg md:p-xl overflow-y-auto custom-scrollbar">
          <div className="glass rounded-3xl p-xl border border-surface-container shadow-sm animate-[fadeIn_0.3s_ease]">
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-md mb-xl flex items-center gap-sm">
              <span className="material-symbols-outlined text-warning-dark">info</span>
              <div className="text-warning-dark font-bold text-sm">{task.instruction}</div>
            </div>

            {task.audioText && (
              <div className="mb-xl">
                <button onClick={()=>playAudio(task.audioText)} disabled={isPlaying} className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold text-sm transition-all ${isPlaying ? 'bg-surface-container/50 text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white hover:scale-105 shadow-sm hover:shadow-[0_4px_15px_rgba(102,126,234,0.4)]'}`}>
                  <span className="material-symbols-outlined">{isPlaying ? 'graphic_eq' : 'play_arrow'}</span> {isPlaying ? 'Playing...' : 'Play Audio'}
                </button>
              </div>
            )}
            
            {task.passage && (
              <div className="bg-surface-bright border border-surface-container rounded-2xl p-xl mb-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-warning-dark" />
                <div className="text-on-surface text-lg font-medium leading-relaxed font-serif pl-sm">{task.passage}</div>
              </div>
            )}
            
            <div className="text-on-surface text-lg font-bold mb-xl">{task.question}</div>
            
            {task.type==='listening' && task.options.length>0 && (
              <div className="grid gap-sm mb-xl">
                {task.options.map((opt,i)=>{
                  const letter=String.fromCharCode(65+i);
                  const sel=selected===letter;
                  return (
                    <button key={i} onClick={()=>setSelected(letter)} className={`text-left p-md rounded-2xl border-2 transition-all flex items-center gap-md hover:scale-[1.01] ${sel ? 'bg-indigo-brand/5 border-indigo-brand text-indigo-brand shadow-sm' : 'bg-surface-bright border-surface-container text-on-surface hover:border-surface-container-high'}`}>
                      <span className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${sel ? 'bg-indigo-brand text-white' : 'bg-surface-container/50 text-on-surface-variant'}`}>{letter}</span>
                      <span className={`text-sm ${sel ? 'font-bold' : 'font-medium'}`}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {(task.type==='repeat'||task.type==='speaking'||task.type==='fluency') && (
              <div className="mt-md mb-xl flex items-center gap-md bg-surface-bright p-md rounded-2xl border border-surface-container">
                {!isRecording&&!recorded&&<button onClick={startRecording} className="flex items-center gap-xs px-lg py-sm bg-error text-white rounded-xl font-bold text-sm hover:bg-error/90 hover:scale-105 transition-all shadow-sm"><span className="material-symbols-outlined">mic</span> Start Recording</button>}
                {isRecording&&<button onClick={stopRecording} className="flex items-center gap-xs px-lg py-sm bg-error/10 text-error border-2 border-error/50 rounded-xl font-bold text-sm hover:bg-error/20 transition-all animate-pulse"><span className="material-symbols-outlined">stop_circle</span> Stop Recording</button>}
                {recorded&&<div className="flex items-center gap-xs text-success font-bold bg-success/10 px-md py-sm rounded-xl border border-success/30"><span className="material-symbols-outlined">check_circle</span> Recording saved</div>}
              </div>
            )}
            
            <div className="border-t border-surface-container/50 pt-lg mt-md flex justify-end">
              <button onClick={handleNext} className="px-xl py-sm bg-gradient-to-r from-warning to-error text-white rounded-xl font-bold text-sm hover:shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all">
                {taskIdx<TASKS.length-1 ? 'Next Task →' : 'Submit Test ✓'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Proctoring Sidebar */}
        <div className="w-[220px] glass border-l border-surface-container p-md flex flex-col gap-md shrink-0">
          <div className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest text-center">Proctoring Active</div>
          <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-surface-container shadow-inner aspect-[4/3] flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-bright/90 backdrop-blur-sm p-sm">
                <div className="text-3xl mb-1">📷</div>
                <div className="text-error font-bold text-xs text-center">Camera required</div>
              </div>
            )}
          </div>
          <div className="bg-surface-bright rounded-xl p-sm border border-surface-container text-center">
            <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Violations</div>
            <div className={`font-black text-2xl ${violations===0?'text-success':violations===1?'text-warning':'text-error'}`}>{violations}/3</div>
          </div>
          <div className="bg-surface-bright rounded-xl p-sm border border-surface-container text-center">
            <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">Task</div>
            <div className="text-warning-dark font-black text-2xl">{taskIdx+1}<span className="text-on-surface-variant/50 text-sm">/{TASKS.length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
