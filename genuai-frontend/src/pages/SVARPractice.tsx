import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const TASKS = [
  { id:1, type:'reading', title:'Reading Fluency', instruction:'Read the passage below aloud clearly and at a natural pace.', text:'Artificial intelligence is transforming the way businesses operate. From automating routine tasks to providing deep analytical insights, AI technologies are enabling organizations to make better decisions faster.', duration: 45 },
  { id:2, type:'repeating', title:'Sentence Repetition', instruction:'Listen to the sentence and repeat it exactly as you heard it.', audioText:'The implementation of agile methodology significantly improved our team collaboration and delivery speed.', duration: 30 },
  { id:3, type:'qna', title:'Questions & Answers', instruction:'Listen to the question and speak a concise answer.', audioText:'What is your primary motivation for seeking a new opportunity at this time?', duration: 45 },
  { id:4, type:'grammar', title:'Grammar Correction', instruction:'Identify the error in the sentence below and speak the grammatically correct version.', text:'"He do not have any experience in digital marketing campaigns."', duration: 30 },
  { id:5, type:'listening', title:'Listening Comprehension', instruction:'Listen to the audio passage, then select the correct answer below.', audioText:'The meeting is scheduled for Thursday at 3 PM in Conference Room B. Please bring your project proposal and the latest financial reports.', question:'Where is the meeting scheduled?', options:['Conference Room A','Conference Room B','Online via Zoom','CEO office'], answer:'Conference Room B', duration: 45 },
  { id:6, type:'extempore', title:'Free Speech / Extempore', instruction:'Speak continuously for 45 seconds on the given topic.', text:'Describe a challenging project you worked on, how you handled the obstacles, and what the outcome was.', duration: 60 },
];

export default function SVARPractice({ user, onBack }: Props) {
  const [phase, setPhase] = useState<'intro'|'test'|'result'>('intro');
  const [taskIdx, setTaskIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [evaluating, setEvaluating] = useState(false);
  const [scores, setScores] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState(''); // For listening task

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef('');

  const task = TASKS[taskIdx];

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        currentTranscriptRef.current = current;
      };
      
      recognitionRef.current.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        if (e.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone access to practice speaking.");
        }
      };
    } else {
      alert("Speech Recognition API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onstart = () => setIsPlaying(true);
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    currentTranscriptRef.current = '';
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch(e){}
  };

  const startTest = () => {
    setPhase('test');
    setupTask(0);
  };

  const setupTask = (idx: number) => {
    setTaskIdx(idx);
    const t = TASKS[idx];
    setTimeLeft(t.duration);
    setTranscript('');
    currentTranscriptRef.current = '';
    setSelectedOption('');
    setIsPlaying(false);
    setIsRecording(false);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNext(true); // Auto next on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const evaluateTaskWithAI = async (transcriptText: string, t: typeof TASKS[0]) => {
    if (!transcriptText || transcriptText.trim().length < 5) {
      return { score: 0, feedback: "No clear speech detected. Please speak louder and clearer." };
    }
    
    try {
      const prompt = `You are an expert English language evaluator scoring a candidate on an GenuAI SVAR test. 
Task Type: ${t.title}
Task Target/Prompt: ${t.text || t.audioText}
Candidate Spoken Transcript: "${transcriptText}"

Evaluate the candidate's spoken transcript. Provide a score from 0 to 100 based on accuracy, relevance, and fluency.
Return the result strictly as a JSON object: {"score": 85, "feedback": "Your 1-sentence specific feedback here."}`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, max_tokens: 150, response_format: { type: "json_object" }
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      const data = JSON.parse(res.data.choices[0].message.content);
      return { score: data.score || 0, feedback: data.feedback || "Evaluation completed." };
    } catch (e) {
      console.error(e);
      // Fallback scoring if API fails
      return { score: 60, feedback: "Basic evaluation recorded (AI evaluation failed)." };
    }
  };

  const handleNext = async (isTimeout = false) => {
    clearInterval(timerRef.current);
    if (isRecording) stopRecording();
    
    setEvaluating(true);
    let taskScore = 0;
    let taskFeedback = "";

    // Score Listening Comprehension (Multiple Choice)
    if (task.type === 'listening') {
      if (selectedOption === task.answer) {
        taskScore = 100;
        taskFeedback = "Correct answer selected.";
      } else {
        taskScore = 0;
        taskFeedback = `Incorrect. The correct answer was: ${task.answer}`;
      }
    } 
    // Score Speech Tasks via AI
    else {
      const result = await evaluateTaskWithAI(currentTranscriptRef.current, task);
      taskScore = result.score;
      taskFeedback = result.feedback;
    }

    const newScores = [...scores, { task: task.title, type: task.type, score: taskScore, feedback: taskFeedback, transcript: currentTranscriptRef.current }];
    setScores(newScores);
    setEvaluating(false);

    if (taskIdx < TASKS.length - 1) {
      setupTask(taskIdx + 1);
    } else {
      setPhase('result');
    }
  };

  const fmt = (s: number) => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const timerColor = timeLeft < 15 ? '#EF4444' : timeLeft < 30 ? '#F59E0B' : '#059669';

  if (phase === 'intro') {
    return (
      <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter',sans-serif", display:"flex", flexDirection:"column" }}>
        <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", fontWeight:"700", padding:0 }}>← Back to Practice Hub</button>
          <div style={{ fontWeight:"800", color:"#0F172A", fontSize:"18px" }}>SVAR Speaking Practice</div>
          <div style={{ width:"120px" }}></div>
        </div>
        <div style={{ flex:1, display:"flex", maxWidth:"1400px", margin:"0 auto", width:"100%", padding:"60px 40px" }}>
          <div style={{ flex:1, paddingRight:"80px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <div style={{ fontSize:"64px", marginBottom:"24px" }}>🎙️ </div>
            <h1 style={{ fontSize:"48px", fontWeight:"900", color:"#0F172A", marginBottom:"24px", letterSpacing:"-1px", lineHeight:"1.1" }}>Master Your Voice &<br/>Accent</h1>
            <p style={{ color:"#475569", fontSize:"18px", lineHeight:"1.6", marginBottom:"40px", maxWidth:"500px" }}>
              Prepare for your official GenuAI SVAR assessment. This interactive practice module uses browser speech recognition and Groq AI to instantly grade your verbal communication skills.
            </p>
            <div style={{ background:'#FEF2F2', borderRadius:'12px', padding:'20px', marginBottom:'24px', border:'1px solid #FCA5A5', maxWidth:"500px" }}>
              <div style={{ color:'#B91C1C', fontWeight:'800', fontSize:'14px', marginBottom:'8px' }}>⚠️ Requirements</div>
              <ul style={{ color:'#991B1B', fontSize:'13px', margin:0, paddingLeft:'20px', lineHeight:'1.6' }}>
                <li>You must use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</li>
                <li>Allow microphone permissions when prompted.</li>
                <li>Speak clearly and naturally at an even pace.</li>
              </ul>
            </div>
          </div>
          
          <div style={{ flex:1, maxWidth:"700px" }}>
            <div style={{ background:"#fff", borderRadius:"24px", padding:"48px", boxShadow:"0 20px 40px rgba(0,0,0,0.04)", border:"1px solid #E2E8F0" }}>
              <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", marginBottom:"32px" }}>Tasks Overview</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'40px' }}>
                {TASKS.map((t,i)=>(
                  <div key={i} style={{ background:'#F8FAFC', borderRadius:'12px', padding:'20px', border:'1px solid #E2E8F0' }}>
                    <div style={{ color:'#DC2626', fontWeight:'700', fontSize:'12px', marginBottom:'4px' }}>Task {i+1}</div>
                    <div style={{ color:'#0F172A', fontSize:'14px', fontWeight:'700' }}>{t.title}</div>
                    <div style={{ color:'#64748B', fontSize:'12px', marginTop:'4px' }}>{t.duration} seconds</div>
                  </div>
                ))}
              </div>
              <button onClick={startTest} style={{ width:"100%", padding:"20px", background:"linear-gradient(135deg,#DC2626,#991B1B)", color:"#fff", border:"none", borderRadius:"16px", fontWeight:"800", fontSize:"16px", cursor:"pointer", boxShadow:"0 12px 24px rgba(220,38,38,0.2)", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                Start Practice Session →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const overall = Math.round(scores.reduce((a,s)=>a+s.score,0) / Math.max(scores.length, 1));
    const scoreColor = overall >= 70 ? '#10B981' : overall >= 50 ? '#F59E0B' : '#DC2626';

    return (
      <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter',sans-serif" }}>
        <div style={{ background:"linear-gradient(135deg,#DC2626,#991B1B)", color:"#fff", padding:"60px 40px", textAlign:"center" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <div style={{ fontSize:"64px", marginBottom:"16px" }}>📊</div>
            <h1 style={{ fontSize:"40px", fontWeight:"900", margin:"0 0 12px" }}>SVAR Practice Complete!</h1>
            <div style={{ fontSize:"20px", color:"rgba(255,255,255,0.8)", marginBottom:"32px" }}>Here is your AI-generated feedback and performance breakdown.</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"16px", background:"rgba(0,0,0,0.2)", padding:"12px 32px", borderRadius:"24px" }}>
              <span style={{ fontSize:"48px", fontWeight:"900", color:scoreColor }}>{overall}%</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#F8FAFC", fontWeight:"800", fontSize:"16px" }}>Overall Score</div>
                <div style={{ color:scoreColor, fontWeight:"700", fontSize:"14px" }}>
                  {overall >= 70 ? "Excellent communication skills!" : "Keep practicing to improve clarity and accuracy."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"60px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
            <h2 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:0 }}>Task Breakdown</h2>
            <div style={{ display:"flex", gap:"12px" }}>
              <button onClick={() => setPhase('intro')} style={{ padding:"12px 24px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>🔄 Retake</button>
              <button onClick={onBack} style={{ padding:"12px 24px", background:"#fff", color:"#475569", border:"1px solid #E2E8F0", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>Exit</button>
            </div>
          </div>

          <div style={{ display:'grid', gap:'24px' }}>
            {scores.map((sc, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'20px', padding:'32px', border:'1px solid #E2E8F0', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', paddingBottom:"16px", borderBottom:"1px solid #F1F5F9" }}>
                  <div>
                    <div style={{ color:'#475569', fontSize:'13px', fontWeight:'800', textTransform:'uppercase', letterSpacing:"1px" }}>{sc.type}</div>
                    <div style={{ color:'#0F172A', fontWeight:'800', fontSize:'18px', marginTop:'4px' }}>{sc.task}</div>
                  </div>
                  <div style={{ fontSize:'20px', fontWeight:'900', color:sc.score>=70?'#059669':sc.score>=50?'#F59E0B':'#DC2626', background:sc.score>=70?'#ECFDF5':sc.score>=50?'#FEF3C7':'#FEF2F2', padding:'6px 16px', borderRadius:'8px' }}>
                    {sc.score}%
                  </div>
                </div>
                
                {sc.transcript && (
                  <div style={{ background:'#F8FAFC', padding:'20px', borderRadius:'12px', border:'1px solid #F1F5F9', marginBottom:'20px' }}>
                    <div style={{ color:'#64748B', fontSize:'12px', fontWeight:'800', textTransform:'uppercase', marginBottom:'8px' }}>Your Transcript</div>
                    <div style={{ color:'#334155', fontSize:'15px', fontStyle:'italic' }}>"{sc.transcript}"</div>
                  </div>
                )}
                
                <div style={{ background:"#EFF6FF", padding:"20px", borderRadius:"12px", border:"1px solid #BFDBFE" }}>
                  <div style={{ color:"#1D4ED8", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>AI Feedback</div>
                  <div style={{ color:'#1E3A8A', fontSize:'15px', lineHeight:'1.6' }}>{sc.feedback}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', fontFamily:"'Inter',sans-serif", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:'#0F172A', color:'#fff', padding:'0 32px', height:"64px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"800", fontSize:"16px", letterSpacing:"0.5px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span>🎙️ </span> SVAR Assessment Environment
          </div>
          <div style={{ background:"#1E293B", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700", color:"#94A3B8" }}>Task {taskIdx+1} of {TASKS.length}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ background:timeLeft < 15 ? "#7F1D1D" : "#1E293B", padding:"6px 16px", borderRadius:"8px", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.3s" }}>
              <span style={{ fontSize:"14px" }}>⏱️</span>
              <span style={{ fontWeight:"800", fontSize:"14px", color:timeLeft < 15 ? "#FCA5A5" : "#F8FAFC", fontVariantNumeric:"tabular-nums" }}>{fmt(timeLeft)}</span>
            </div>
            <button onClick={onBack} style={{ background:'transparent', border:'1px solid #334155', color:'#94A3B8', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:"13px" }}>Exit</button>
          </div>
        </div>
      </div>

      {/* Main Content Split Pane */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Left Pane - Instructions */}
        <div style={{ width:"45%", background:"#fff", borderRight:"1px solid #E2E8F0", padding:"48px", overflowY:"auto", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:"13px", fontWeight:"900", color:"#DC2626", textTransform:"uppercase", letterSpacing:"1px", background:"#FEF2F2", padding:"6px 12px", borderRadius:"8px", alignSelf:"flex-start", marginBottom:"24px" }}>{task.type}</div>
          <h2 style={{ fontSize:"28px", fontWeight:"800", color:"#0F172A", marginBottom:"24px" }}>{task.title}</h2>
          
          <div style={{ background:'#EFF6FF', borderRadius:'12px', padding:'20px', marginBottom:'32px', border:'1px solid #BFDBFE', display:'flex', alignItems:'flex-start', gap:'12px' }}>
            <span style={{ fontSize:'20px' }}>💡</span>
            <div style={{ color:'#1E3A8A', fontSize:'16px', fontWeight:'600', lineHeight:'1.5' }}>{task.instruction}</div>
          </div>

          {task.text && (
            <div style={{ background:'#F8FAFC', borderRadius:'16px', padding:'32px', border:'1px solid #E2E8F0', fontSize:'20px', color:'#0F172A', lineHeight:'1.8', fontWeight:'500', fontStyle:"italic" }}>
              "{task.text}"
            </div>
          )}

          {task.audioText && (
            <div style={{ textAlign:'center', padding:'40px 32px', background:'#F8FAFC', borderRadius:'16px', border:'1px dashed #CBD5E1' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎧</div>
              <button onClick={()=>playAudio(task.audioText)} disabled={isPlaying} style={{ background:isPlaying?'#E2E8F0':'#0F172A', color:isPlaying?'#94A3B8':'#fff', border:'none', borderRadius:'12px', padding:'16px 32px', cursor:isPlaying?'not-allowed':'pointer', fontWeight:'800', fontSize:'16px', display:'inline-flex', alignItems:'center', gap:'8px', transition:'transform 0.2s', boxShadow:isPlaying?"none":"0 4px 12px rgba(15,23,42,0.2)" }}>
                {isPlaying ? '🔊 Playing Audio...' : '▶ Play Audio Prompt'}
              </button>
              <div style={{ color:'#64748B', fontSize:'13px', marginTop:'16px' }}>Make sure your volume is turned up.</div>
            </div>
          )}
        </div>

        {/* Right Pane - Interaction */}
        <div style={{ flex:1, background:"#F8FAFC", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, padding:"48px", overflowY:"auto" }}>
            
            {/* Listening Options */}
            {task.type === 'listening' && task.options && (
              <div style={{ maxWidth:"700px", margin:"0 auto" }}>
                <div style={{ fontWeight:'800', fontSize:'20px', color:'#0F172A', marginBottom:'24px', lineHeight:"1.5" }}>{task.question}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {task.options.map((opt, i) => (
                    <button key={i} onClick={()=>setSelectedOption(opt)} style={{ textAlign:'left', padding:'24px', background:selectedOption===opt?'#EFF6FF':'#fff', border:selectedOption===opt?'2px solid #3B82F6':'2px solid #E2E8F0', borderRadius:'16px', cursor:'pointer', fontSize:'16px', fontWeight:selectedOption===opt?'700':'600', color:selectedOption===opt?'#1D4ED8':'#334155', transition:'all 0.2s', boxShadow:selectedOption===opt?"0 4px 12px rgba(59,130,246,0.1)":"0 2px 4px rgba(0,0,0,0.02)", display:"flex", alignItems:"center", gap:"20px" }}>
                      <div style={{ width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${selectedOption===opt?"#2563EB":"#CBD5E1"}`, background:selectedOption===opt?"#2563EB":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {selectedOption===opt && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#fff" }}/>}
                      </div>
                      <div style={{ lineHeight:"1.5" }}>{opt}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recording Controls */}
            {task.type !== 'listening' && (
              <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", flexDirection:"column", height:"100%" }}>
                <div style={{ display:'flex', gap:'16px', marginBottom:"32px" }}>
                  {!isRecording ? (
                    <button onClick={startRecording} style={{ flex:1, padding:'20px', background:'linear-gradient(135deg,#DC2626,#991B1B)', color:'#fff', border:'none', borderRadius:'16px', fontWeight:'900', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', boxShadow:'0 12px 24px rgba(220,38,38,0.2)' }}>
                      <div style={{ width:"16px", height:"16px", borderRadius:"50%", background:"#fff" }}></div> Start Recording
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="pulse-record" style={{ flex:1, padding:'20px', background:'#FEE2E2', color:'#DC2626', border:'2px solid #DC2626', borderRadius:'16px', fontWeight:'900', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                      <div style={{ width:"16px", height:"16px", background:"#DC2626", borderRadius:"4px" }}></div> Stop Recording
                    </button>
                  )}
                </div>
                
                {/* Live Transcript Box */}
                <div style={{ flex:1, background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 10px 25px rgba(0,0,0,0.03)" }}>
                  <div style={{ padding:"16px 24px", borderBottom:"1px solid #F1F5F9", background:"#F8FAFC" }}>
                    <div style={{ color:'#64748B', fontSize:'12px', fontWeight:'800', textTransform:'uppercase', letterSpacing:"1px" }}>Live Speech Recognition</div>
                  </div>
                  <div style={{ padding:"32px", flex:1, overflowY:"auto", color:transcript?'#0F172A':'#94A3B8', fontSize:'18px', lineHeight:'1.8', fontWeight:"500" }}>
                    {transcript || (isRecording ? "Listening carefully..." : "Click 'Start Recording' and begin speaking. Your words will appear here.")}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ background:"#fff", padding:"24px 48px", borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"flex-end" }}>
            <button onClick={() => handleNext(false)} disabled={evaluating} style={{ padding:'16px 32px', background:evaluating?'#E2E8F0':'#0F172A', color:evaluating?'#94A3B8':'#fff', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'15px', cursor:evaluating?'not-allowed':'pointer', boxShadow:evaluating?"none":"0 4px 12px rgba(15,23,42,0.2)", transition:"transform 0.2s" }} onMouseEnter={e=>!evaluating&&(e.currentTarget.style.transform='scale(1.02)')} onMouseLeave={e=>!evaluating&&(e.currentTarget.style.transform='scale(1)')}>
              {evaluating ? 'AI Evaluating...' : (taskIdx < TASKS.length-1 ? 'Next Task →' : 'Submit Practice →')}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .pulse-record { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}
