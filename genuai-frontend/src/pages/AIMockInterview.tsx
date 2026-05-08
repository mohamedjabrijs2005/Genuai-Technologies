import { useState, useRef } from "react";
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
  const prompt = `Generate ONE ${type} interview question for a ${role} candidate. ${prev} Return ONLY the question text, nothing else.`;
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
  const [isRecording, setIsRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const name = user?.user?.name || user?.name || "Candidate";

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
    setLoading(true);
    try {
      const fb = await evaluateAnswer(currentQ, answer, role);
      setFeedback(fb);
    } catch { setFeedback({ score:70, rating:"Good", strengths:["Clear answer"], improvements:["Add more detail"], ideal_answer:"Provide a structured response with examples." }); }
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

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => { setAnswer(a => a + " [Voice recorded — type your answer above]"); };
      mr.start(); mediaRef.current = mr; setIsRecording(true);
    } catch { alert("Microphone not available. Please type your answer."); }
  };
  const stopVoice = () => { mediaRef.current?.stop(); setIsRecording(false); };

  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + (h.fb?.score || 0), 0) / history.length) : 0;
  const scoreColor = avgScore >= 80 ? "#16A34A" : avgScore >= 60 ? "#F59E0B" : "#DC2626";
  const inp: any = { width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", boxSizing:"border-box", outline:"none" };

  // ── SETUP ──
  if (phase === "setup") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0F172A,#1E3A8A,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"40px", maxWidth:"560px", width:"100%", boxShadow:"0 25px 60px rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"13px", cursor:"pointer", marginBottom:"20px", fontWeight:"600" }}>← Back to Practice Hub</button>
        <div style={{ width:"60px", height:"60px", borderRadius:"16px", background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", marginBottom:"20px" }}>🤖</div>
        <h1 style={{ fontSize:"26px", fontWeight:"900", color:"#0F172A", margin:"0 0 8px" }}>AI Mock Interview</h1>
        <p style={{ color:"#64748B", fontSize:"14px", margin:"0 0 28px" }}>Practice with an AI interviewer. Get instant feedback on every answer.</p>

        <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"6px" }}>Your Target Role</label>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, marginBottom:"16px" }}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>

        <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"10px" }}>Interview Type</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"20px" }}>
          {TYPES.map(t => (
            <div key={t.key} onClick={() => setType(t.key)} style={{ padding:"14px 10px", border:`2px solid ${type===t.key?"#2563EB":"#E2E8F0"}`, borderRadius:"12px", cursor:"pointer", textAlign:"center", background:type===t.key?"#EFF6FF":"#fff", transition:"all 0.2s" }}>
              <div style={{ fontSize:"22px", marginBottom:"6px" }}>{t.emoji}</div>
              <div style={{ fontWeight:"700", fontSize:"12px", color:type===t.key?"#2563EB":"#0F172A" }}>{t.label}</div>
              <div style={{ fontSize:"10px", color:"#94A3B8", marginTop:"3px" }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"10px" }}>Number of Questions: <span style={{ color:"#2563EB" }}>{questionCount}</span></label>
        <input type="range" min={3} max={10} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} style={{ width:"100%", marginBottom:"24px" }} />

        <button onClick={startInterview} disabled={loading} style={{ width:"100%", padding:"14px", background:loading?"#E2E8F0":"linear-gradient(135deg,#2563EB,#7C3AED)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"16px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(37,99,235,0.35)" }}>
          {loading ? "Generating Question..." : `Start ${questionCount}-Question Interview →`}
        </button>
      </div>
    </div>
  );

  // ── RESULTS ──
  if (phase === "results") return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
      <div style={{ maxWidth:"720px", margin:"0 auto" }}>
        <div style={{ background:"linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius:"20px", padding:"32px", textAlign:"center", marginBottom:"24px", color:"#fff" }}>
          <div style={{ fontSize:"48px", fontWeight:"900", marginBottom:"8px" }}>{avgScore}%</div>
          <div style={{ fontSize:"20px", fontWeight:"800", marginBottom:"4px" }}>Interview Complete!</div>
          <div style={{ opacity:0.8, fontSize:"14px" }}>{role} · {type} Round · {history.length} Questions</div>
          <div style={{ marginTop:"16px", display:"inline-block", background:"rgba(255,255,255,0.2)", borderRadius:"20px", padding:"6px 20px", fontSize:"13px", fontWeight:"700" }}>
            {avgScore >= 80 ? "🟢 Excellent — Ready for the real thing!" : avgScore >= 60 ? "🟡 Good — Keep practising!" : "🔴 Needs improvement — Practice more"}
          </div>
        </div>

        {history.map((h, i) => (
          <div key={i} style={{ background:"#fff", borderRadius:"16px", padding:"24px", marginBottom:"16px", border:"1.5px solid #E2E8F0" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px" }}>
              <div style={{ fontWeight:"700", color:"#64748B", fontSize:"12px" }}>Q{i+1}</div>
              <div style={{ fontWeight:"800", color:h.fb?.score >= 80 ? "#16A34A" : h.fb?.score >= 60 ? "#F59E0B" : "#DC2626", fontSize:"14px" }}>{h.fb?.score || 0}% — {h.fb?.rating}</div>
            </div>
            <div style={{ fontWeight:"700", color:"#0F172A", marginBottom:"8px", fontSize:"14px" }}>{h.q}</div>
            <div style={{ color:"#64748B", fontSize:"13px", marginBottom:"12px", background:"#F8FAFC", padding:"10px 12px", borderRadius:"8px" }}><em>Your answer:</em> {h.a}</div>
            {h.fb?.ideal_answer && <div style={{ color:"#16A34A", fontSize:"13px", background:"#F0FDF4", padding:"10px 12px", borderRadius:"8px", fontWeight:"600" }}>✅ Ideal: {h.fb.ideal_answer}</div>}
          </div>
        ))}

        <div style={{ display:"flex", gap:"12px", marginTop:"8px" }}>
          <button onClick={() => { setPhase("setup"); setHistory([]); setQIndex(0); }} style={{ flex:1, padding:"14px", background:"linear-gradient(135deg,#2563EB,#7C3AED)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer" }}>🔄 Try Again</button>
          <button onClick={onBack} style={{ flex:1, padding:"14px", background:"#fff", color:"#64748B", border:"1.5px solid #E2E8F0", borderRadius:"12px", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>← Back to Hub</button>
        </div>
      </div>
    </div>
  );

  // ── INTERVIEW ──
  const progress = ((qIndex) / questionCount) * 100;
  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"0 32px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"22px" }}>🤖</span>
          <div>
            <div style={{ fontWeight:"800", fontSize:"15px", color:"#0F172A" }}>AI Mock Interview</div>
            <div style={{ fontSize:"11px", color:"#94A3B8" }}>{role} · {type} Round</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ fontSize:"13px", color:"#64748B", fontWeight:"600" }}>Q{qIndex+1} / {questionCount}</div>
          <div style={{ width:"120px", height:"6px", background:"#E2E8F0", borderRadius:"3px" }}>
            <div style={{ width:`${progress}%`, height:"100%", background:"linear-gradient(90deg,#2563EB,#7C3AED)", borderRadius:"3px", transition:"width 0.4s" }} />
          </div>
          <button onClick={onBack} style={{ padding:"6px 14px", border:"1px solid #E2E8F0", borderRadius:"8px", background:"#fff", fontSize:"12px", color:"#64748B", cursor:"pointer", fontWeight:"600" }}>Exit</button>
        </div>
      </div>

      <div style={{ maxWidth:"720px", margin:"0 auto", padding:"32px 20px" }}>
        {/* Question */}
        <div style={{ background:"linear-gradient(135deg,#EFF6FF,#F5F3FF)", border:"1.5px solid #C7D2FE", borderRadius:"20px", padding:"28px", marginBottom:"24px" }}>
          <div style={{ display:"flex", gap:"10px", marginBottom:"12px" }}>
            <span style={{ background:"#2563EB", color:"#fff", fontSize:"11px", fontWeight:"800", padding:"3px 12px", borderRadius:"20px" }}>{type}</span>
            <span style={{ background:"#F1F5F9", color:"#64748B", fontSize:"11px", fontWeight:"600", padding:"3px 12px", borderRadius:"20px" }}>Question {qIndex+1}</span>
          </div>
          <p style={{ fontSize:"18px", fontWeight:"700", color:"#0F172A", margin:0, lineHeight:"1.6" }}>{currentQ}</p>
        </div>

        {/* Answer input */}
        {!feedback && (
          <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", border:"1.5px solid #E2E8F0", marginBottom:"16px" }}>
            <label style={{ color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"8px" }}>Your Answer</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer here... Be specific, use examples (STAR method for behavioral questions)" rows={6} style={{ ...inp, resize:"vertical", lineHeight:"1.7" }} />
            <div style={{ display:"flex", gap:"10px", marginTop:"12px" }}>
              <button onClick={isRecording ? stopVoice : startVoice} style={{ padding:"10px 18px", background:isRecording?"#FEF2F2":"#F1F5F9", border:`1.5px solid ${isRecording?"#FECACA":"#E2E8F0"}`, borderRadius:"10px", color:isRecording?"#DC2626":"#64748B", fontWeight:"700", fontSize:"13px", cursor:"pointer" }}>
                {isRecording ? "⏹ Stop Recording" : "🎙️ Voice Answer"}
              </button>
              <button onClick={submitAnswer} disabled={!answer.trim() || loading} style={{ flex:1, padding:"10px", background:answer.trim()&&!loading?"linear-gradient(135deg,#2563EB,#7C3AED)":"#E2E8F0", color:answer.trim()&&!loading?"#fff":"#94A3B8", border:"none", borderRadius:"10px", fontWeight:"800", fontSize:"14px", cursor:answer.trim()&&!loading?"pointer":"not-allowed" }}>
                {loading ? "Evaluating..." : "Submit Answer →"}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", border:"1.5px solid #E2E8F0", marginBottom:"16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div style={{ fontWeight:"800", fontSize:"16px", color:"#0F172A" }}>AI Feedback</div>
              <div style={{ fontSize:"28px", fontWeight:"900", color:scoreColor }}>{feedback.score}%</div>
            </div>
            <div style={{ display:"inline-block", padding:"4px 14px", borderRadius:"20px", background:scoreColor+"22", color:scoreColor, fontWeight:"700", fontSize:"13px", marginBottom:"16px" }}>{feedback.rating}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
              <div style={{ background:"#F0FDF4", borderRadius:"12px", padding:"14px" }}>
                <div style={{ fontSize:"12px", fontWeight:"700", color:"#16A34A", marginBottom:"8px" }}>✅ Strengths</div>
                {(feedback.strengths||[]).map((s:string,i:number) => <div key={i} style={{ fontSize:"13px", color:"#166534", marginBottom:"4px" }}>• {s}</div>)}
              </div>
              <div style={{ background:"#FFF7ED", borderRadius:"12px", padding:"14px" }}>
                <div style={{ fontSize:"12px", fontWeight:"700", color:"#F59E0B", marginBottom:"8px" }}>📈 Improve</div>
                {(feedback.improvements||[]).map((s:string,i:number) => <div key={i} style={{ fontSize:"13px", color:"#92400E", marginBottom:"4px" }}>• {s}</div>)}
              </div>
            </div>
            {feedback.ideal_answer && <div style={{ background:"#EFF6FF", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#2563EB", marginBottom:"6px" }}>💡 Ideal Answer</div>
              <div style={{ fontSize:"13px", color:"#1E40AF", lineHeight:"1.6" }}>{feedback.ideal_answer}</div>
            </div>}
            <button onClick={nextQuestion} disabled={loading} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#2563EB,#7C3AED)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer" }}>
              {loading ? "Loading next..." : qIndex + 1 >= questionCount ? "Finish & See Results →" : `Next Question (${qIndex+2}/${questionCount}) →`}
            </button>
          </div>
        )}

        {/* Your answer preview */}
        {feedback && <div style={{ background:"#F8FAFC", borderRadius:"12px", padding:"14px 16px", border:"1px solid #E2E8F0", fontSize:"13px", color:"#475569" }}>
          <strong>Your answer:</strong> {answer}
        </div>}
      </div>
    </div>
  );
}
