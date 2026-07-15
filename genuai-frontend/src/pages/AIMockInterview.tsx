import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const ROLES = ["Software Engineer","Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","AI Engineer","DevOps Engineer","Product Manager","UI/UX Designer","Data Analyst"];
const TYPES = [
  { key:"HR",         label:"HR Round",       emoji:"👔", desc:"Personal, background & motivation questions" },
  { key:"Technical",  label:"Technical Round", emoji:"💻", desc:"Coding, system design & tech concepts" },
  { key:"Behavioral", label:"Behavioral Round",emoji:"🧠", desc:"Situation-based & soft skill questions" },
];

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

async function generateQuestion(role: string, type: string, previousQs: string[]): Promise<string> {
  const prev = previousQs.length ? `Avoid repeating these: ${previousQs.slice(-3).join("; ")}` : "";
  const prompt = `Generate ONE ${type} interview question for a ${role} candidate. ${prev} Return ONLY the question text, nothing else. Make it a realistic, challenging interview question.`;
  const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8, max_tokens: 120
  }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
  return res.data.choices[0].message.content.trim();
}

async function evaluateAnswer(question: string, answer: string, role: string): Promise<any> {
  const prompt = `You are a strict interviewer evaluating a ${role} candidate.
Question: "${question}"
Candidate Answer: "${answer}"
Rate this answer and return ONLY valid JSON:
{"score":85,"rating":"Good","strengths":["point1","point2"],"improvements":["point1"],"ideal_answer":"Brief ideal answer in 2 sentences."}`;
  const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3, max_tokens: 400
  }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
  return JSON.parse(res.data.choices[0].message.content);
}

export default function AIMockInterview({ user, onBack }: Props) {
  const [phase, setPhase] = useState<"setup"|"interview"|"results">("setup");
  const [role, setRole] = useState("Software Engineer");
  const [type, setType] = useState("HR");
  const [questionCount, setQuestionCount] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  
  const [history, setHistory] = useState<{q:string;a:string;fb:any}[]>([]);
  const [qIndex, setQIndex] = useState(0);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition on mount
  useEffect(() => {
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
        // Update the textarea live
        setAnswer(current);
      };
      
      recognitionRef.current.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        if (e.error === 'not-allowed') alert("Microphone access denied.");
        setIsRecording(false);
      };
    }
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e){}
      window.speechSynthesis.cancel();
    };
  }, []);

  const startInterview = async () => {
    setLoading(true);
    setHistory([]); setQIndex(0); setFeedback(null); setAnswer("");
    try {
      const q = await generateQuestion(role, type, []);
      setCurrentQ(q);
      setPhase("interview");
    } catch { alert("Failed to generate question. Check your Groq API key in .env"); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    if (isRecording) stopVoice();
    window.speechSynthesis.cancel();
    
    setLoading(true);
    try {
      const fb = await evaluateAnswer(currentQ, answer, role);
      setFeedback(fb);
    } catch { 
      setFeedback({ score:70, rating:"Good", strengths:["Clear answer"], improvements:["Add more detail"], ideal_answer:"Provide a structured response with examples." }); 
    }
    setLoading(false);
  };

  const nextQuestion = async () => {
    const newHistory = [...history, { q: currentQ, a: answer, fb: feedback }];
    setHistory(newHistory);
    if (newHistory.length >= questionCount) { setPhase("results"); return; }
    
    setLoading(true);
    setAnswer(""); setFeedback(null);
    try {
      const q = await generateQuestion(role, type, newHistory.map(h => h.q));
      setCurrentQ(q);
      setQIndex(i => i + 1);
    } catch { alert("Failed to load next question"); }
    setLoading(false);
  };

  const startVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome/Edge or type your answer.");
      return;
    }
    setAnswer(""); // Clear previous text when starting a fresh voice recording
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch(e){}
  };

  const stopVoice = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch(e){}
  };

  const readQuestionAloud = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentQ);
    u.rate = 0.95;
    u.onstart = () => setIsPlaying(true);
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + (h.fb?.score || 0), 0) / history.length) : 0;
  const scoreColor = avgScore >= 80 ? "#10B981" : avgScore >= 60 ? "#F59E0B" : "#EF4444";
  
  const inp: any = { width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", boxSizing:"border-box", outline:"none", transition:"border 0.2s" };

  // ── SETUP ──
  if (phase === "setup") return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", fontWeight:"700", padding:0 }}>← Back to Practice Hub</button>
        <div style={{ fontWeight:"800", color:"#0F172A", fontSize:"18px" }}>AI Mock Interview</div>
        <div style={{ width:"120px" }}></div>
      </div>
      <div style={{ flex:1, display:"flex", maxWidth:"1400px", margin:"0 auto", width:"100%", padding:"60px 40px" }}>
        <div style={{ flex:1, paddingRight:"80px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ fontSize:"64px", marginBottom:"24px" }}>🤖</div>
          <h1 style={{ fontSize:"48px", fontWeight:"900", color:"#0F172A", marginBottom:"24px", letterSpacing:"-1px", lineHeight:"1.1" }}>Master Your Next<br/>Technical Interview</h1>
          <p style={{ color:"#475569", fontSize:"18px", lineHeight:"1.6", marginBottom:"40px", maxWidth:"500px" }}>
            Experience a hyper-realistic, AI-driven interview environment. Utilize live voice transcription and receive instantaneous, actionable feedback on every response.
          </p>
          <div style={{ display:"flex", gap:"16px" }}>
             <div style={{ background:"#EFF6FF", color:"#2563EB", padding:"12px 24px", borderRadius:"12px", fontWeight:"700", fontSize:"14px" }}>✓ Live Speech-to-Text</div>
             <div style={{ background:"#F0FDF4", color:"#16A34A", padding:"12px 24px", borderRadius:"12px", fontWeight:"700", fontSize:"14px" }}>✓ Instant AI Grading</div>
          </div>
        </div>
        
        <div style={{ flex:1, maxWidth:"600px" }}>
          <div style={{ background:"#fff", borderRadius:"24px", padding:"48px", boxShadow:"0 20px 40px rgba(0,0,0,0.04)", border:"1px solid #E2E8F0" }}>
            <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", marginBottom:"32px" }}>Configure Session</h2>
            
            <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"800", display:"block", marginBottom:"8px", textTransform:"uppercase" }}>Your Target Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, marginBottom:"28px", cursor:"pointer", background:"#F8FAFC", padding:"16px", borderRadius:"14px" }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>

            <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"800", display:"block", marginBottom:"12px", textTransform:"uppercase" }}>Interview Type</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"36px" }}>
              {TYPES.map(t => (
                <div key={t.key} onClick={() => setType(t.key)} style={{ padding:"20px 12px", border:`2px solid ${type===t.key?"#2563EB":"#F1F5F9"}`, borderRadius:"16px", cursor:"pointer", textAlign:"center", background:type===t.key?"#EFF6FF":"#fff", transition:"all 0.2s" }}>
                  <div style={{ fontSize:"28px", marginBottom:"12px" }}>{t.emoji}</div>
                  <div style={{ fontWeight:"800", fontSize:"13px", color:type===t.key?"#2563EB":"#334155" }}>{t.label}</div>
                </div>
              ))}
            </div>

            <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"800", display:"flex", justifyContent:"space-between", marginBottom:"16px", textTransform:"uppercase" }}>
              <span>Number of Questions</span>
              <span style={{ color:"#2563EB", fontWeight:"900", fontSize:"16px" }}>{questionCount}</span>
            </label>
            <input type="range" min={3} max={10} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} style={{ width:"100%", marginBottom:"40px", accentColor:"#2563EB", cursor:"pointer" }} />

            <button onClick={startInterview} disabled={loading} style={{ width:"100%", padding:"20px", background:loading?"#E2E8F0":"#0F172A", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"16px", fontWeight:"800", fontSize:"16px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 12px 24px rgba(15,23,42,0.15)", transition:"all 0.2s" }}>
              {loading ? "Preparing AI Interviewer..." : `Start ${questionCount}-Question Interview →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS ──
  if (phase === "results") return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background:"#0F172A", color:"#fff", padding:"60px 40px", textAlign:"center" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px" }}>🏆</div>
          <h1 style={{ fontSize:"40px", fontWeight:"900", margin:"0 0 12px" }}>Interview Complete</h1>
          <div style={{ fontSize:"20px", color:"#94A3B8", marginBottom:"32px" }}>{role} · {type} Round</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"16px", background:"#1E293B", padding:"12px 32px", borderRadius:"24px" }}>
            <span style={{ fontSize:"48px", fontWeight:"900", color:scoreColor }}>{avgScore}%</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ color:"#F8FAFC", fontWeight:"800", fontSize:"16px" }}>Overall Score</div>
              <div style={{ color:scoreColor, fontWeight:"700", fontSize:"14px" }}>
                {avgScore >= 80 ? "Excellent Performance!" : avgScore >= 60 ? "Good — Keep Practising" : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"60px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
          <h2 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:0 }}>Detailed Feedback ({history.length} Questions)</h2>
          <div style={{ display:"flex", gap:"12px" }}>
            <button onClick={() => { setPhase("setup"); setHistory([]); setQIndex(0); }} style={{ padding:"12px 24px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>🔄 New Interview</button>
            <button onClick={onBack} style={{ padding:"12px 24px", background:"#fff", color:"#475569", border:"1px solid #E2E8F0", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>Exit</button>
          </div>
        </div>

        <div style={{ display:"grid", gap:"24px" }}>
          {history.map((h, i) => {
            const qColor = h.fb?.score >= 80 ? "#10B981" : h.fb?.score >= 60 ? "#F59E0B" : "#EF4444";
            return (
              <div key={i} style={{ background:"#fff", borderRadius:"20px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
                  <div style={{ flex:1, paddingRight:"32px" }}>
                    <div style={{ color:"#64748B", fontWeight:"800", fontSize:"13px", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"8px" }}>Question {i+1}</div>
                    <div style={{ fontWeight:"800", color:"#0F172A", fontSize:"18px", lineHeight:"1.6" }}>{h.q}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:"900", color:qColor, fontSize:"28px", lineHeight:1 }}>{h.fb?.score || 0}%</div>
                    <div style={{ fontWeight:"700", color:qColor, fontSize:"12px", marginTop:"4px" }}>{h.fb?.rating}</div>
                  </div>
                </div>
                
                <div style={{ background:"#F8FAFC", padding:"20px", borderRadius:"12px", marginBottom:"24px", border:"1px solid #F1F5F9", fontStyle:"italic", color:"#334155", fontSize:"15px", lineHeight:"1.7" }}>
                  "{h.a}"
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"24px" }}>
                  <div style={{ background:"#F0FDF4", borderRadius:"16px", padding:"20px", border:"1px solid #DCFCE7" }}>
                    <div style={{ fontSize:"14px", fontWeight:"800", color:"#16A34A", marginBottom:"12px" }}>✅ Strengths</div>
                    {(h.fb?.strengths||[]).map((s:string,idx:number) => <div key={idx} style={{ fontSize:"14px", color:"#15803D", marginBottom:"8px", lineHeight:"1.5" }}>• {s}</div>)}
                  </div>
                  <div style={{ background:"#FFF7ED", borderRadius:"16px", padding:"20px", border:"1px solid #FFEDD5" }}>
                    <div style={{ fontSize:"14px", fontWeight:"800", color:"#F59E0B", marginBottom:"12px" }}>📈 Areas to Improve</div>
                    {(h.fb?.improvements||[]).map((s:string,idx:number) => <div key={idx} style={{ fontSize:"14px", color:"#B45309", marginBottom:"8px", lineHeight:"1.5" }}>• {s}</div>)}
                  </div>
                </div>

                {h.fb?.ideal_answer && (
                  <div style={{ background:"#EFF6FF", borderRadius:"16px", padding:"20px", border:"1px solid #DBEAFE" }}>
                    <div style={{ fontSize:"14px", fontWeight:"800", color:"#2563EB", marginBottom:"8px" }}>💡 Ideal Answer Example</div>
                    <div style={{ color:"#1E40AF", fontSize:"15px", lineHeight:"1.6" }}>{h.fb.ideal_answer}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── INTERVIEW ──
  const progress = ((qIndex) / questionCount) * 100;
  return (
    <div style={{ height:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* HackerRank Style Header */}
      <div style={{ background:"#0F172A", color:"#fff", padding:"0 32px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ fontWeight:"800", fontSize:"16px", letterSpacing:"0.5px" }}>GenuAI Interview Environment</div>
          <div style={{ background:"#1E293B", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700", color:"#94A3B8" }}>{role} ({type})</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ fontSize:"13px", color:"#94A3B8", fontWeight:"700" }}>Question {qIndex+1} of {questionCount}</div>
            <div style={{ width:"160px", height:"6px", background:"#334155", borderRadius:"3px", overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:"#3B82F6", borderRadius:"3px", transition:"width 0.4s ease" }} />
            </div>
          </div>
          <button onClick={onBack} style={{ padding:"8px 16px", border:"1px solid #334155", borderRadius:"8px", background:"transparent", fontSize:"13px", color:"#CBD5E1", cursor:"pointer", fontWeight:"600", transition:"all 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.background="#1E293B";e.currentTarget.style.color="#fff"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#CBD5E1"}}>
            End Session
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Left Pane - Question */}
        <div style={{ width:"45%", background:"#fff", borderRight:"1px solid #E2E8F0", padding:"48px", overflowY:"auto", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
            <div style={{ fontSize:"13px", fontWeight:"900", color:"#2563EB", textTransform:"uppercase", letterSpacing:"1px", background:"#EFF6FF", padding:"6px 12px", borderRadius:"8px" }}>{type} Round</div>
            <button onClick={readQuestionAloud} disabled={isPlaying} style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", color:"#0F172A", padding:"8px 16px", borderRadius:"12px", cursor:isPlaying?"not-allowed":"pointer", fontWeight:"700", fontSize:"13px", display:"flex", alignItems:"center", gap:"8px", transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"} onMouseLeave={e=>e.currentTarget.style.background="#F8FAFC"}>
              {isPlaying ? "🔊 Speaking..." : "▶ Read Question"}
            </button>
          </div>
          <p style={{ fontSize:"26px", fontWeight:"800", color:"#0F172A", margin:0, lineHeight:"1.6" }}>{currentQ}</p>
        </div>

        {/* Right Pane - Answer / Feedback */}
        <div style={{ flex:1, background:"#F8FAFC", padding:"48px", overflowY:"auto" }}>
          {!feedback ? (
            <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", flexDirection:"column", minHeight:"400px", height:"100%" }}>
              <div style={{ padding:"20px 24px", borderBottom:"1px solid #E2E8F0", background:"#F1F5F9", borderRadius:"16px 16px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontWeight:"800", color:"#334155", fontSize:"13px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Response Editor</div>
                {isRecording && <span style={{ color:"#DC2626", fontSize:"12px", fontWeight:"800", display:"flex", alignItems:"center", gap:"6px" }}><div style={{ width:"8px", height:"8px", background:"#DC2626", borderRadius:"50%" }} className="pulse-dot"></div> Live Transcription Active</span>}
              </div>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer, or click 'Live Voice Answer' to speak it..." style={{ flex:1, border:"none", padding:"32px", fontSize:"16px", lineHeight:"1.8", color:"#0F172A", outline:"none", resize:"none", fontFamily:"'Inter', sans-serif" }} />
              <div style={{ padding:"24px", borderTop:"1px solid #E2E8F0", background:"#F8FAFC", borderRadius:"0 0 16px 16px", display:"flex", gap:"16px" }}>
                <button onClick={isRecording ? stopVoice : startVoice} style={{ padding:"16px 24px", background:isRecording?"#FEF2F2":"#fff", border:`2px solid ${isRecording?"#FCA5A5":"#E2E8F0"}`, borderRadius:"12px", color:isRecording?"#DC2626":"#475569", fontWeight:"800", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.2s" }}>
                  {isRecording ? "⏹ Stop Listening" : "🎙️ Live Voice Answer"}
                </button>
                <button onClick={submitAnswer} disabled={!answer.trim() || loading} style={{ flex:1, padding:"16px", background:answer.trim()&&!loading?"#0F172A":"#E2E8F0", color:answer.trim()&&!loading?"#fff":"#94A3B8", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:answer.trim()&&!loading?"pointer":"not-allowed", transition:"all 0.2s", boxShadow:answer.trim()&&!loading?"0 4px 12px rgba(15,23,42,0.2)":"none" }}>
                  {loading ? "Evaluating Answer..." : "Submit Answer →"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E2E8F0", boxShadow:"0 10px 30px rgba(0,0,0,0.05)", padding:"40px", animation:"slideUp 0.3s ease-out" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"32px", paddingBottom:"24px", borderBottom:"1px solid #E2E8F0" }}>
                <div>
                  <div style={{ fontWeight:"900", fontSize:"28px", color:"#0F172A", marginBottom:"8px" }}>AI Evaluation</div>
                  <div style={{ color:"#64748B", fontSize:"15px", lineHeight:"1.6" }}>Instant feedback on your response.</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"56px", fontWeight:"900", color:scoreColor, lineHeight:"1" }}>{feedback.score}%</div>
                  <div style={{ color:scoreColor, fontWeight:"800", fontSize:"15px", marginTop:"8px" }}>{feedback.rating}</div>
                </div>
              </div>
              
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"32px" }}>
                <div style={{ background:"#F0FDF4", borderRadius:"16px", padding:"24px", border:"1px solid #DCFCE7" }}>
                  <div style={{ fontSize:"15px", fontWeight:"800", color:"#16A34A", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" }}><span style={{fontSize:"18px"}}>✅</span> What you did well</div>
                  {(feedback.strengths||[]).map((s:string,i:number) => <div key={i} style={{ fontSize:"14px", color:"#15803D", marginBottom:"12px", lineHeight:"1.6" }}>• {s}</div>)}
                </div>
                <div style={{ background:"#FFF7ED", borderRadius:"16px", padding:"24px", border:"1px solid #FFEDD5" }}>
                  <div style={{ fontSize:"15px", fontWeight:"800", color:"#F59E0B", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" }}><span style={{fontSize:"18px"}}>📈</span> What to improve</div>
                  {(feedback.improvements||[]).map((s:string,i:number) => <div key={i} style={{ fontSize:"14px", color:"#B45309", marginBottom:"12px", lineHeight:"1.6" }}>• {s}</div>)}
                </div>
              </div>
              
              {feedback.ideal_answer && (
                <div style={{ background:"#EFF6FF", borderRadius:"16px", padding:"24px", marginBottom:"32px", border:"1px solid #DBEAFE" }}>
                  <div style={{ fontSize:"15px", fontWeight:"800", color:"#2563EB", marginBottom:"12px", display:"flex", alignItems:"center", gap:"8px" }}><span style={{fontSize:"18px"}}>💡</span> Ideal Answer Example</div>
                  <div style={{ fontSize:"15px", color:"#1E40AF", lineHeight:"1.7" }}>{feedback.ideal_answer}</div>
                </div>
              )}
              
              <button onClick={nextQuestion} disabled={loading} style={{ width:"100%", padding:"20px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"16px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(15,23,42,0.2)", transition:"all 0.2s" }} onMouseEnter={e=>!loading&&(e.currentTarget.style.transform="scale(1.01)")} onMouseLeave={e=>!loading&&(e.currentTarget.style.transform="scale(1)")}>
                {loading ? "Preparing next question..." : qIndex + 1 >= questionCount ? "Finish Interview & See Results →" : `Next Question (${qIndex+2}/${questionCount}) →`}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea:focus, select:focus, input:focus { border-color: #2563EB !important; background: #fff !important; }
      `}</style>
    </div>
  );
}
