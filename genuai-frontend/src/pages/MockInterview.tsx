import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Props {
  user: any;
  onBack: () => void;
}

const ROLES = ["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"];
const ROUNDS = ["Technical","Behavioral","HR","System Design","Case Study"];

export default function MockInterview({ user, onBack }: Props) {
  const [role, setRole] = useState("Software Engineer");
  const [round, setRound] = useState("Technical");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const userName = user?.user?.name || user?.name || "Candidate";

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API + "/coach/interview-questions", { role, round });
      setQuestions(res.data.questions || []);
      setCurrentQ(0); setAnswer(""); setEvaluation(null); setScores([]); setFinished(false);
      setStarted(true);
    } catch { alert("Failed to load questions. Please try again."); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { alert("Please type your answer!"); return; }
    setLoading(true);
    try {
      const res = await axios.post(API + "/coach/evaluate-answer", {
        question: questions[currentQ]?.question,
        answer,
        role
      });
      setEvaluation(res.data);
      setScores(prev => [...prev, res.data.score || 0]);
    } catch { alert("Evaluation failed. Please try again."); }
    setLoading(false);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(p => p + 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
  const diffColor = (d: string) => d === "Hard" ? "#EF4444" : d === "Medium" ? "#F59E0B" : "#22C55E";
  const scoreColor = (s: number) => s >= 80 ? "#00B87C" : s >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" }}>

      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid #E2E8F0", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <button onClick={onBack} style={{ padding:"8px 16px", background:"#F1F5F9", border:"1.5px solid #E2E8F0", borderRadius:"10px", cursor:"pointer", fontWeight:"700", color:"#64748B", fontSize:"13px" }}>← Back</button>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"38px", height:"38px", background:"linear-gradient(135deg,#A78BFA,#7C3AED)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>🎓</div>
            <div>
              <div style={{ fontWeight:"800", fontSize:"18px", color:"#1E293B" }}>AI Mock Interview</div>
              <div style={{ fontSize:"12px", color:"#94A3B8" }}>Practice with AI — no pressure, instant feedback</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {started && !finished && (
            <div style={{ display:"flex", gap:"6px" }}>
              {questions.map((_,i) => (
                <div key={i} style={{ width:"28px", height:"6px", borderRadius:"3px", background: i < currentQ ? "#00B87C" : i === currentQ ? "#A78BFA" : "#E2E8F0" }}/>
              ))}
            </div>
          )}
          <span style={{ color:"#94A3B8", fontSize:"13px" }}>Welcome, {userName}</span>
        </div>
      </div>

      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"32px 20px" }}>

        {/* ── NOT STARTED: Setup Screen ── */}
        {!started && !finished && (
          <div>
            {/* Hero */}
            <div style={{ background:"linear-gradient(135deg,#7C3AED,#A78BFA)", borderRadius:"24px", padding:"40px", textAlign:"center", marginBottom:"28px", color:"#fff" }}>
              <div style={{ fontSize:"64px", marginBottom:"16px" }}>🎯</div>
              <h1 style={{ margin:"0 0 10px", fontSize:"28px", fontWeight:"900" }}>AI Mock Interview Coach</h1>
              <p style={{ margin:"0 0 24px", fontSize:"15px", opacity:0.9, lineHeight:"1.6" }}>
                Practice real interview questions with AI feedback.<br/>
                Get scored, see what you did well, and learn model answers.
              </p>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                {[["🎯","STAR Method Guided","Answer structure tips"],["⚡","Instant AI Scoring","0–100 score per answer"],["📚","Model Answers","See expert-level responses"],["🔄","Unlimited Practice","No limits, no pressure"]].map(([icon,title,sub]) => (
                  <div key={title} style={{ background:"rgba(255,255,255,0.15)", borderRadius:"12px", padding:"12px 16px", minWidth:"140px" }}>
                    <div style={{ fontSize:"20px", marginBottom:"4px" }}>{icon}</div>
                    <div style={{ fontWeight:"700", fontSize:"13px" }}>{title}</div>
                    <div style={{ fontSize:"11px", opacity:0.8 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Config */}
            <div style={{ background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"20px", padding:"32px", boxShadow:"0 4px 20px rgba(0,0,0,0.06)", marginBottom:"24px" }}>
              <h2 style={{ color:"#1E293B", margin:"0 0 24px", fontSize:"18px", fontWeight:"800" }}>⚙️ Configure Your Session</h2>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" }}>
                <div>
                  <label style={{ display:"block", color:"#64748B", fontSize:"13px", fontWeight:"700", marginBottom:"8px" }}>🎭 Target Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"12px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", cursor:"pointer" }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", color:"#64748B", fontSize:"13px", fontWeight:"700", marginBottom:"8px" }}>🔄 Interview Round</label>
                  <select value={round} onChange={e => setRound(e.target.value)}
                    style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"12px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", cursor:"pointer" }}>
                    {ROUNDS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Round descriptions */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"24px" }}>
                {[
                  {r:"Technical", icon:"💻", desc:"DSA, coding, system concepts"},
                  {r:"Behavioral", icon:"🤝", desc:"Teamwork, leadership, conflict"},
                  {r:"HR", icon:"👔", desc:"Culture fit, salary, motivation"},
                  {r:"System Design", icon:"🏗️", desc:"Architecture, scalability"},
                  {r:"Case Study", icon:"📊", desc:"Problem solving, analysis"},
                ].map(({r,icon,desc}) => (
                  <div key={r} onClick={() => setRound(r)}
                    style={{ padding:"12px", borderRadius:"12px", border:"1.5px solid " + (round===r?"#A78BFA":"#E2E8F0"), background:round===r?"#F5F3FF":"#F8FAFC", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ fontSize:"20px", marginBottom:"4px" }}>{icon}</div>
                    <div style={{ fontWeight:"700", fontSize:"12px", color:round===r?"#7C3AED":"#1E293B" }}>{r}</div>
                    <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:"2px" }}>{desc}</div>
                  </div>
                ))}
              </div>

              <button onClick={startSession} disabled={loading}
                style={{ width:"100%", padding:"16px", background:loading?"#E2E8F0":"linear-gradient(135deg,#A78BFA,#7C3AED)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"16px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" }}>
                {loading ? "⏳ Loading Questions..." : "🚀 Start Mock Interview"}
              </button>
            </div>

            {/* Tips */}
            <div style={{ background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"20px", padding:"24px", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
              <h3 style={{ color:"#1E293B", margin:"0 0 16px", fontSize:"15px", fontWeight:"800" }}>💡 Tips for Best Results</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                {[
                  {icon:"⭐", tip:"Use the STAR Method", desc:"Situation → Task → Action → Result"},
                  {icon:"📏", tip:"Aim for 150–250 words", desc:"Detailed but concise answers score higher"},
                  {icon:"🔢", tip:"Use specific numbers", desc:"'Improved performance by 40%' beats 'improved a lot'"},
                  {icon:"🔄", tip:"Practice multiple rounds", desc:"Technical + Behavioral = complete prep"},
                ].map(({icon,tip,desc}) => (
                  <div key={tip} style={{ display:"flex", gap:"12px", padding:"12px", background:"#F8FAFC", borderRadius:"12px" }}>
                    <span style={{ fontSize:"20px", flexShrink:0 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight:"700", fontSize:"13px", color:"#1E293B" }}>{tip}</div>
                      <div style={{ fontSize:"12px", color:"#64748B", marginTop:"2px" }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FINISHED: Results Screen ── */}
        {finished && (
          <div style={{ textAlign:"center" }}>
            <div style={{ background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"24px", padding:"40px", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", marginBottom:"20px" }}>
              <div style={{ fontSize:"64px", marginBottom:"16px" }}>🏆</div>
              <h2 style={{ color:"#1E293B", margin:"0 0 8px", fontSize:"24px", fontWeight:"800" }}>Session Complete!</h2>
              <div style={{ fontSize:"72px", fontWeight:"900", color:scoreColor(avgScore), margin:"16px 0", lineHeight:1 }}>{avgScore}%</div>
              <div style={{ display:"inline-block", padding:"6px 20px", borderRadius:"20px", background:scoreColor(avgScore)+"22", color:scoreColor(avgScore), fontWeight:"700", fontSize:"15px", marginBottom:"24px" }}>
                {avgScore >= 80 ? "🥇 Excellent Performance" : avgScore >= 60 ? "🥈 Good Effort" : "🥉 Needs Improvement"}
              </div>

              <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"28px", flexWrap:"wrap" }}>
                {scores.map((s,i) => (
                  <div key={i} style={{ padding:"8px 14px", background:scoreColor(s)+"15", border:"1.5px solid "+scoreColor(s)+"44", borderRadius:"10px", textAlign:"center" }}>
                    <div style={{ fontSize:"11px", color:"#94A3B8" }}>Q{i+1}</div>
                    <div style={{ fontSize:"18px", fontWeight:"800", color:scoreColor(s) }}>{s}%</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                <button onClick={() => { setStarted(false); setFinished(false); setScores([]); }}
                  style={{ padding:"14px 28px", background:"#F1F5F9", color:"#64748B", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontSize:"14px" }}>
                  Change Role / Round
                </button>
                <button onClick={startSession} disabled={loading}
                  style={{ padding:"14px 28px", background:"linear-gradient(135deg,#A78BFA,#7C3AED)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"700", cursor:"pointer", fontSize:"14px", boxShadow:"0 4px 15px rgba(124,58,237,0.3)" }}>
                  {loading ? "Loading..." : "🔄 Practice Again"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVE: Question + Answer ── */}
        {started && !finished && questions.length > 0 && (
          <div>
            {/* Progress bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div style={{ fontSize:"14px", color:"#64748B", fontWeight:"600" }}>
                Question <span style={{ color:"#A78BFA", fontWeight:"800" }}>{currentQ+1}</span> of {questions.length}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ padding:"4px 12px", background:diffColor(questions[currentQ]?.difficulty)+"15", border:"1.5px solid "+diffColor(questions[currentQ]?.difficulty)+"44", borderRadius:"20px", fontSize:"12px", color:diffColor(questions[currentQ]?.difficulty), fontWeight:"700" }}>
                  {questions[currentQ]?.difficulty}
                </div>
                <div style={{ padding:"4px 12px", background:"#EDE9FE", borderRadius:"20px", fontSize:"12px", color:"#7C3AED", fontWeight:"600" }}>
                  {questions[currentQ]?.type}
                </div>
              </div>
            </div>

            {/* Question card */}
            <div style={{ background:"#fff", border:"2px solid #A78BFA33", borderRadius:"20px", padding:"28px", marginBottom:"20px", boxShadow:"0 4px 20px rgba(167,139,250,0.1)" }}>
              <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap" }}>
                <span style={{ padding:"4px 12px", background:"linear-gradient(135deg,#A78BFA,#7C3AED)", borderRadius:"20px", color:"#fff", fontSize:"12px", fontWeight:"700" }}>{round} Round</span>
                <span style={{ padding:"4px 12px", background:"#EEF2FF", borderRadius:"20px", color:"#667EEA", fontSize:"12px", fontWeight:"600" }}>{role}</span>
              </div>
              <h2 style={{ color:"#1E293B", margin:"0 0 16px", fontSize:"18px", fontWeight:"700", lineHeight:"1.5" }}>
                {questions[currentQ]?.question}
              </h2>
              {questions[currentQ]?.hint && (
                <div style={{ padding:"12px 16px", background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"10px", fontSize:"13px", color:"#92400E" }}>
                  💡 <strong>Hint:</strong> {questions[currentQ]?.hint}
                </div>
              )}
            </div>

            {/* STAR guide */}
            {!evaluation && (
              <div style={{ background:"#F5F3FF", border:"1.5px solid #DDD6FE", borderRadius:"16px", padding:"16px 20px", marginBottom:"16px" }}>
                <div style={{ fontWeight:"700", color:"#7C3AED", fontSize:"13px", marginBottom:"10px" }}>⭐ STAR Method Guide</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px" }}>
                  {[["S","Situation","Set the context"],["T","Task","Your responsibility"],["A","Action","What you did"],["R","Result","The outcome"]].map(([l,w,d]) => (
                    <div key={l} style={{ background:"#fff", borderRadius:"10px", padding:"10px", textAlign:"center" }}>
                      <div style={{ width:"28px", height:"28px", background:"linear-gradient(135deg,#A78BFA,#7C3AED)", borderRadius:"50%", margin:"0 auto 6px", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"900", fontSize:"13px" }}>{l}</div>
                      <div style={{ fontWeight:"700", fontSize:"12px", color:"#7C3AED" }}>{w}</div>
                      <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:"2px" }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {evaluation ? (
              <div>
                <div style={{ background:"#fff", border:"2px solid "+scoreColor(evaluation.score)+"44", borderRadius:"20px", padding:"28px", marginBottom:"16px", boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
                    <div>
                      <h3 style={{ color:"#1E293B", margin:"0 0 4px", fontSize:"16px", fontWeight:"800" }}>🤖 AI Feedback</h3>
                      <div style={{ fontSize:"13px", color:"#64748B" }}>{evaluation.rating}</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"48px", fontWeight:"900", color:scoreColor(evaluation.score), lineHeight:1 }}>{evaluation.score}%</div>
                      <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:"4px" }}>Score</div>
                    </div>
                  </div>

                  <div style={{ background:"#F8FAFC", borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
                    <p style={{ color:"#475569", fontSize:"14px", margin:0, lineHeight:"1.6" }}>{evaluation.feedback}</p>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
                    <div style={{ padding:"14px", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"12px" }}>
                      <div style={{ color:"#16A34A", fontWeight:"700", fontSize:"12px", marginBottom:"8px" }}>✅ What Was Good</div>
                      <div style={{ color:"#166534", fontSize:"13px", lineHeight:"1.5" }}>{evaluation.what_was_good}</div>
                    </div>
                    <div style={{ padding:"14px", background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"12px" }}>
                      <div style={{ color:"#D97706", fontWeight:"700", fontSize:"12px", marginBottom:"8px" }}>📈 Improve This</div>
                      <div style={{ color:"#92400E", fontSize:"13px", lineHeight:"1.5" }}>{evaluation.what_to_improve}</div>
                    </div>
                  </div>

                  <div style={{ padding:"16px", background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:"12px" }}>
                    <div style={{ color:"#667EEA", fontWeight:"700", fontSize:"13px", marginBottom:"8px" }}>🏆 Model Answer</div>
                    <div style={{ color:"#1E293B", fontSize:"13px", lineHeight:"1.7" }}>{evaluation.model_answer}</div>
                  </div>
                </div>

                <button onClick={nextQuestion}
                  style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#00B87C,#00D4AA)", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 15px rgba(0,184,124,0.4)" }}>
                  {currentQ + 1 >= questions.length ? "🏆 Finish Session" : "Next Question →"}
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here using the STAR method...&#10;&#10;Situation: Describe the context...&#10;Task: What was your responsibility...&#10;Action: What steps did you take...&#10;Result: What was the outcome..."
                  rows={8}
                  style={{ width:"100%", padding:"16px", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"14px", fontSize:"14px", color:"#1E293B", lineHeight:"1.7", resize:"vertical", boxSizing:"border-box", outline:"none", marginBottom:"8px", fontFamily:"inherit" }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                  <div style={{ fontSize:"12px", color: answer.split(/\s+/).filter(Boolean).length >= 150 ? "#00B87C" : "#94A3B8" }}>
                    {answer.split(/\s+/).filter(Boolean).length} words {answer.split(/\s+/).filter(Boolean).length < 150 ? "(aim for 150+)" : "✓ Good length"}
                  </div>
                  <button onClick={() => setAnswer("")} style={{ padding:"4px 12px", background:"#F1F5F9", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"12px", color:"#64748B" }}>Clear</button>
                </div>
                <button onClick={submitAnswer} disabled={loading || !answer.trim()}
                  style={{ width:"100%", padding:"16px", background:loading||!answer.trim()?"#E2E8F0":"linear-gradient(135deg,#A78BFA,#7C3AED)", color:loading||!answer.trim()?"#94A3B8":"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"16px", cursor:loading||!answer.trim()?"not-allowed":"pointer", boxShadow:loading?"none":"0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" }}>
                  {loading ? "⏳ AI is evaluating your answer..." : "Submit Answer & Get Feedback →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
