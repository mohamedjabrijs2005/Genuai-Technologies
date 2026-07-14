import { useState, useEffect } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const CATEGORIES = [
  { id: "Logical", title: "Logical Reasoning", icon: "🧩", desc: "Deductive logic, coding-decoding, and directional sense." },
  { id: "Quantitative", title: "Quantitative Aptitude", icon: "📐", desc: "Numerical ability, probability, time & speed." },
  { id: "English", title: "English Grammar", icon: "📖", desc: "Vocabulary, sentence correction, and reading comprehension." },
  { id: "AutomataFix", title: "Automata Fix (Debugging)", icon: "🐛", desc: "Find and fix logical or syntax errors in existing code." },
  { id: "Automata", title: "Automata (Live Coding)", icon: "💻", desc: "Write full algorithms from scratch (Arrays, Strings, Recursion)." },
  { id: "CoreCS", title: "Core CS Fundamentals", icon: "🖥️", desc: "Operating Systems, DBMS, Computer Networks, and Architecture." }
];

const SUB_TOPICS: Record<string, string[]> = {
  Logical: ["Coding-Decoding", "Blood Relations", "Directional Sense", "Data Sufficiency", "Logical Sequences", "Syllogism", "Seating Arrangement", "Clocks & Calendars"],
  Quantitative: ["Number System", "HCF & LCM", "Divisibility", "Percentages", "Profit & Loss", "Time-Speed-Distance", "Probability", "Permutations & Combinations", "Simple & Compound Interest"],
  English: ["Vocabulary Synonyms", "Vocabulary Antonyms", "Error Identification", "Sentence Correction", "Sentence Improvement", "Prepositions & Articles", "Active/Passive Voice"],
  AutomataFix: ["Array Manipulation", "String Parsing", "Loop Logic", "Conditional Logic", "Recursion Base Case", "Basic Math Logic", "Off-by-one errors"],
  Automata: ["Arrays", "Strings", "Linked Lists", "Recursion", "Sorting", "Searching", "Matrix Manipulation", "Basic Hash Maps"],
  CoreCS: ["Operating Systems", "DBMS & SQL", "Computer Networks", "Computer Architecture", "Software Engineering", "Deadlocks & Concurrency", "OSI Model"]
};

interface MCQQuestion { type: "mcq"; question: string; options: string[]; correctIndex: number; explanation: string; }
interface CodeQuestion { type: "code"; title: string; description: string; codeTemplate: string; language: string; }
type Question = MCQQuestion | CodeQuestion;

export default function SkillTestPractice({ user, onBack }: Props) {
  const [phase, setPhase] = useState<"setup"|"test"|"results">("setup");
  const [category, setCategory] = useState(CATEGORIES[0].id);
  
  // Test State
  const [loading, setLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<"Easy"|"Medium"|"Hard">("Medium");
  const [question, setQuestion] = useState<Question | null>(null);
  
  // Answers & History
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userCode, setUserCode] = useState("");
  const [history, setHistory] = useState<any[]>([]); // To store results of 3 questions
  
  // Timer (e.g. 20 minutes)
  const [timeLeft, setTimeLeft] = useState(1200);

  useEffect(() => {
    let timer: any;
    if (phase === "test" && timeLeft > 0 && !loading) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === "test") {
      finishTest();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, loading]);

  const generateQuestion = async (cat: string, diff: string) => {
    setLoading(true);
    setQuestion(null);
    setSelectedOption(null);
    setUserCode("");
    
    try {
      const topics = SUB_TOPICS[cat] || ["General Concepts"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      const prevQ = history.length > 0 ? `Avoid these previous questions: ${history.map(h => h.question.question || h.question.title).join('; ')}` : "";

      let prompt = "";
      if (cat === "Logical" || cat === "Quantitative" || cat === "English" || cat === "CoreCS") {
        prompt = `Generate a unique, highly challenging ${diff} level AMCAT-style Multiple Choice Question for the category: ${cat}.
Specifically focus on the sub-topic: **${randomTopic}**. ${prevQ}
Return ONLY valid JSON with this exact structure:
{
  "type": "mcq",
  "question": "The actual question text...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Detailed explanation of the correct logic."
}`;
      } else if (cat === "AutomataFix") {
        prompt = `Generate a unique ${diff} level AMCAT Automata Fix (Debugging) question focusing on **${randomTopic}**. ${prevQ}
Provide a short snippet of code with a deliberate syntax or logical bug.
Return ONLY valid JSON with this exact structure:
{
  "type": "code",
  "title": "Fix the Bug: [Specific Concept Name]",
  "description": "Explain what the code is SUPPOSED to do, but mention there is a bug.",
  "codeTemplate": "def find_max(arr):\\n    max_val = 0 # Bug here if array has negative numbers\\n    for i in arr:\\n        if i > max_val:\\n            max_val = i\\n    return max_val",
  "language": "python"
}`;
      } else if (cat === "Automata") {
        prompt = `Generate a unique ${diff} level AMCAT Automata (Live Coding) competitive programming question focusing on **${randomTopic}**. ${prevQ}
Return ONLY valid JSON with this exact structure:
{
  "type": "code",
  "title": "Problem Title",
  "description": "Full problem description, including input/output format and constraints.",
  "codeTemplate": "def solve(arr):\\n    # Write your code here\\n    pass",
  "language": "python"
}`;
      }

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, response_format: { type: "json_object" }
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      let responseText = res.data.choices[0].message.content.trim();
      if (responseText.startsWith("\`\`\`")) {
        responseText = responseText.replace(/^\`\`\`(json)?\n/, "").replace(/\n\`\`\`$/, "");
      }
      
      const q = JSON.parse(responseText);
      setQuestion(q);
      if (q.type === "code") setUserCode(q.codeTemplate);
    } catch (e) {
      console.error(e);
      alert("Failed to generate question. Retrying...");
    }
    setLoading(false);
  };

  const startTest = () => {
    setPhase("test");
    setHistory([]);
    setCurrentQIndex(0);
    setDifficulty("Medium");
    setTimeLeft(1200); // 20 mins
    generateQuestion(category, "Medium");
  };

  const evaluateCode = async (q: CodeQuestion, code: string) => {
    setLoading(true);
    try {
      const prompt = `You are an automated AMCAT compiler. Evaluate the following candidate code for the problem: "${q.title}".
Description: ${q.description}
Candidate Code:
\`\`\`${q.language}
${code}
\`\`\`
Evaluate if the code is logically correct, handles edge cases, and is time-complex efficient.
Return ONLY JSON:
{ "correct": true/false, "score": 85, "feedback": "Detailed feedback on correctness and complexity." }`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, response_format: { type: "json_object" }
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      const evalData = JSON.parse(res.data.choices[0].message.content);
      return evalData;
    } catch {
      return { correct: false, score: 50, feedback: "Evaluation failed due to network error." };
    }
  };

  const submitAnswer = async () => {
    if (!question) return;
    
    let isCorrect = false;
    let evalResult = null;
    let userAns = "";

    if (question.type === "mcq") {
      if (selectedOption === null) { alert("Select an option"); return; }
      isCorrect = (selectedOption === question.correctIndex);
      userAns = question.options[selectedOption];
    } else {
      if (!userCode.trim()) { alert("Write some code"); return; }
      evalResult = await evaluateCode(question as CodeQuestion, userCode);
      isCorrect = evalResult.correct;
      userAns = userCode;
    }

    const nextDiff = isCorrect ? (difficulty === "Easy" ? "Medium" : "Hard") : (difficulty === "Hard" ? "Medium" : "Easy");
    
    setHistory(prev => [...prev, {
      question,
      userAnswer: userAns,
      isCorrect,
      difficulty,
      evaluation: evalResult
    }]);

    if (currentQIndex + 1 >= 20) { // 20 questions per session
      finishTest();
    } else {
      setCurrentQIndex(i => i + 1);
      setDifficulty(nextDiff);
      generateQuestion(category, nextDiff);
    }
  };

  const finishTest = () => {
    setPhase("results");
    setLoading(false);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentCatData = CATEGORIES.find(c => c.id === category)!;

  // ── SETUP PHASE ──
  if (phase === "setup") return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", padding:"40px 20px", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:"24px", padding:"48px", maxWidth:"800px", width:"100%", boxShadow:"0 10px 25px rgba(0,0,0,0.03)", border:"1px solid #E2E8F0" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"32px", fontWeight:"700", padding:0 }}>
          ← Back to Practice Hub
        </button>
        
        <h1 style={{ fontSize:"32px", fontWeight:"900", color:"#0F172A", margin:"0 0 12px", letterSpacing:"-0.5px" }}>AMCAT Skill Test Practice</h1>
        <p style={{ color:"#475569", fontSize:"16px", margin:"0 0 40px", lineHeight:"1.6" }}>
          Experience a highly realistic, AI-driven AMCAT simulation. Features strict timers, adaptive difficulty (CAT methodology), and intelligent compiler evaluation for Automata.
        </p>

        <label style={{ color:"#64748B", fontSize:"13px", fontWeight:"800", display:"block", marginBottom:"16px", textTransform:"uppercase", letterSpacing:"1px" }}>Select Assessment Module</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"40px" }}>
          {CATEGORIES.map(c => (
            <div key={c.id} onClick={() => setCategory(c.id)} style={{ padding:"20px", border:`2px solid ${category===c.id?"#2563EB":"#E2E8F0"}`, borderRadius:"16px", cursor:"pointer", background:category===c.id?"#EFF6FF":"#fff", transition:"all 0.2s" }}>
              <div style={{ fontSize:"28px", marginBottom:"12px" }}>{c.icon}</div>
              <div style={{ fontWeight:"800", fontSize:"16px", color:category===c.id?"#1E3A8A":"#0F172A", marginBottom:"4px" }}>{c.title}</div>
              <div style={{ fontSize:"13px", color:"#64748B", lineHeight:"1.5" }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={startTest} style={{ width:"100%", padding:"18px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"16px", cursor:"pointer", boxShadow:"0 8px 24px rgba(15,23,42,0.2)" }}>
          Start Simulation →
        </button>
      </div>
    </div>
  );

  // ── RESULTS PHASE ──
  if (phase === "results") {
    const correctCount = history.filter(h => h.isCorrect).length;
    const scoreColor = correctCount >= 16 ? "#10B981" : correctCount >= 8 ? "#F59E0B" : "#EF4444";
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <div style={{ background:"#fff", borderRadius:"24px", padding:"48px", textAlign:"center", marginBottom:"24px", border:"1px solid #E2E8F0", boxShadow:"0 10px 25px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize:"64px", marginBottom:"16px" }}>🏆</div>
            <h1 style={{ fontSize:"32px", fontWeight:"900", color:"#0F172A", marginBottom:"8px" }}>Assessment Complete</h1>
            <div style={{ color:"#64748B", fontSize:"16px", fontWeight:"600", marginBottom:"24px" }}>{currentCatData.title} Module</div>
            
            <div style={{ fontSize:"56px", fontWeight:"900", color:scoreColor, marginBottom:"16px", lineHeight:1 }}>{correctCount}/20</div>
            <div style={{ display:"inline-block", background:scoreColor+"11", color:scoreColor, borderRadius:"20px", padding:"8px 24px", fontSize:"14px", fontWeight:"800", border:`1px solid ${scoreColor}33` }}>
              {correctCount >= 16 ? "Excellent Adaptive Performance!" : "Keep practicing to master harder difficulties."}
            </div>
          </div>

          <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#0F172A", marginBottom:"20px", paddingLeft:"8px" }}>Adaptive Question Breakdown</h2>

          {history.map((h, i) => (
            <div key={i} style={{ background:"#fff", borderRadius:"20px", padding:"32px", marginBottom:"24px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", paddingBottom:"16px", borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                  <span style={{ background:"#F1F5F9", color:"#475569", fontWeight:"800", fontSize:"13px", padding:"6px 12px", borderRadius:"8px" }}>Question {i+1}</span>
                  <span style={{ background:"#FFFBEB", color:"#D97706", fontWeight:"800", fontSize:"12px", padding:"4px 10px", borderRadius:"6px", border:"1px solid #FEF3C7" }}>{h.difficulty} Level</span>
                </div>
                <div style={{ fontWeight:"900", color:h.isCorrect?"#10B981":"#EF4444", fontSize:"16px", background:h.isCorrect?"#D1FAE5":"#FEE2E2", padding:"6px 16px", borderRadius:"8px" }}>
                  {h.isCorrect ? "Correct" : "Incorrect"}
                </div>
              </div>

              {h.question.type === "mcq" ? (
                <>
                  <div style={{ fontWeight:"700", color:"#0F172A", marginBottom:"20px", fontSize:"16px", lineHeight:"1.6" }}>{h.question.question}</div>
                  <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", marginBottom:"20px" }}>
                    <div style={{ color:"#64748B", fontSize:"12px", fontWeight:"700", textTransform:"uppercase", marginBottom:"8px" }}>Your Answer</div>
                    <div style={{ color:h.isCorrect?"#10B981":"#EF4444", fontWeight:"700", fontSize:"15px" }}>{h.userAnswer}</div>
                  </div>
                  {!h.isCorrect && (
                    <div style={{ background:"#F0FDF4", padding:"16px", borderRadius:"12px", marginBottom:"20px", border:"1px solid #DCFCE7" }}>
                      <div style={{ color:"#16A34A", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Correct Answer</div>
                      <div style={{ color:"#15803D", fontWeight:"700", fontSize:"15px" }}>{h.question.options[h.question.correctIndex]}</div>
                    </div>
                  )}
                  <div style={{ background:"#EFF6FF", padding:"20px", borderRadius:"12px", border:"1px solid #BFDBFE" }}>
                    <div style={{ color:"#1D4ED8", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Explanation</div>
                    <div style={{ color:"#1E3A8A", fontSize:"14px", lineHeight:"1.6" }}>{h.question.explanation}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight:"800", color:"#0F172A", marginBottom:"8px", fontSize:"18px" }}>{h.question.title}</div>
                  <div style={{ color:"#475569", marginBottom:"20px", fontSize:"14px", lineHeight:"1.6" }}>{h.question.description}</div>
                  
                  <div style={{ background:"#0F172A", borderRadius:"12px", padding:"20px", marginBottom:"20px", overflowX:"auto" }}>
                    <div style={{ color:"#94A3B8", fontSize:"11px", fontWeight:"800", textTransform:"uppercase", marginBottom:"12px", letterSpacing:"1px" }}>Your Submitted Code</div>
                    <pre style={{ margin:0, color:"#F8FAFC", fontSize:"13px", fontFamily:"monospace" }}>{h.userAnswer}</pre>
                  </div>
                  
                  <div style={{ background:h.isCorrect?"#F0FDF4":"#FEF2F2", padding:"20px", borderRadius:"12px", border:`1px solid ${h.isCorrect?"#DCFCE7":"#FECACA"}` }}>
                    <div style={{ color:h.isCorrect?"#16A34A":"#DC2626", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Compiler AI Evaluation</div>
                    <div style={{ color:h.isCorrect?"#15803D":"#991B1B", fontSize:"14px", lineHeight:"1.6", whiteSpace:"pre-wrap" }}>{h.evaluation?.feedback}</div>
                  </div>
                </>
              )}
            </div>
          ))}

          <div style={{ display:"flex", gap:"16px", marginTop:"32px" }}>
            <button onClick={() => setPhase("setup")} style={{ flex:1, padding:"16px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:"pointer" }}>🔄 Retake Assessment</button>
            <button onClick={onBack} style={{ flex:1, padding:"16px", background:"#fff", color:"#475569", border:"1.5px solid #E2E8F0", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:"pointer" }}>← Back to Practice Hub</button>
          </div>
        </div>
      </div>
    );
  }

  // ── TEST PHASE ──
  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      {/* Strict Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"0 32px", height:"72px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 8px rgba(0,0,0,0.02)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ background:"#EFF6FF", padding:"8px", borderRadius:"10px", fontSize:"20px" }}>{currentCatData.icon}</div>
          <div>
            <div style={{ fontWeight:"900", fontSize:"16px", color:"#0F172A" }}>{currentCatData.title}</div>
            <div style={{ fontSize:"12px", color:"#64748B", fontWeight:"700", marginTop:"2px", display:"flex", gap:"8px" }}>
              <span>Question {currentQIndex+1}/20</span>
              <span style={{ color:"#D97706" }}>• Adaptive: {difficulty}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"24px" }}>
          <div style={{ background:timeLeft < 120 ? "#FEF2F2" : "#F8FAFC", border:`2px solid ${timeLeft < 120 ? "#FCA5A5" : "#E2E8F0"}`, padding:"8px 16px", borderRadius:"10px", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.3s" }}>
            <span style={{ fontSize:"16px" }}>⏱️</span>
            <span style={{ fontWeight:"800", fontSize:"16px", color:timeLeft < 120 ? "#DC2626" : "#0F172A", fontVariantNumeric:"tabular-nums" }}>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ maxWidth:"900px", width:"100%" }}>
          {loading || !question ? (
            <div style={{ background:"#fff", borderRadius:"24px", padding:"80px 40px", border:"1px solid #E2E8F0", textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ width:"48px", height:"48px", border:"4px solid #F1F5F9", borderTop:"4px solid #2563EB", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 24px" }}></div>
              <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#0F172A", marginBottom:"8px" }}>Generating {difficulty} Adaptive Question...</h2>
              <p style={{ color:"#64748B", fontSize:"14px" }}>The AI is analyzing your performance and generating a bespoke challenge.</p>
            </div>
          ) : (
            <div style={{ background:"#fff", borderRadius:"24px", border:"1px solid #E2E8F0", boxShadow:"0 10px 25px rgba(0,0,0,0.03)", overflow:"hidden" }}>
              
              {question.type === "mcq" ? (
                <div style={{ padding:"48px" }}>
                  <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#0F172A", marginBottom:"32px", lineHeight:"1.6" }}>{question.question}</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px", marginBottom:"40px" }}>
                    {question.options.map((opt, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedOption(i)} 
                        style={{ padding:"20px 24px", border:`2px solid ${selectedOption===i?"#2563EB":"#E2E8F0"}`, borderRadius:"16px", cursor:"pointer", background:selectedOption===i?"#EFF6FF":"#fff", fontSize:"16px", fontWeight:"600", color:"#334155", display:"flex", alignItems:"center", gap:"16px", transition:"all 0.2s" }}
                      >
                        <div style={{ width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${selectedOption===i?"#2563EB":"#CBD5E1"}`, background:selectedOption===i?"#2563EB":"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {selectedOption===i && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#fff" }}/>}
                        </div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding:"48px", display:"flex", flexDirection:"column", gap:"24px" }}>
                  <div>
                    <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", marginBottom:"12px" }}>{question.title}</h2>
                    <p style={{ fontSize:"15px", color:"#475569", lineHeight:"1.6", margin:0 }}>{question.description}</p>
                  </div>
                  <div style={{ background:"#0F172A", borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", gap:"12px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ color:"#94A3B8", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", letterSpacing:"1px" }}>AMCAT Integrated IDE</span>
                      <span style={{ color:"#38BDF8", fontSize:"12px", fontWeight:"700", background:"#0C4A6E", padding:"4px 10px", borderRadius:"6px" }}>{question.language}</span>
                    </div>
                    <textarea 
                      value={userCode} 
                      onChange={e => setUserCode(e.target.value)} 
                      spellCheck={false}
                      style={{ width:"100%", minHeight:"300px", background:"#1E293B", color:"#F8FAFC", border:"1px solid #334155", borderRadius:"12px", padding:"16px", fontFamily:"'Fira Code', monospace", fontSize:"14px", lineHeight:"1.6", resize:"vertical", outline:"none", boxSizing:"border-box" }} 
                    />
                  </div>
                </div>
              )}

              <div style={{ background:"#F8FAFC", padding:"24px 48px", borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ color:"#64748B", fontSize:"13px", fontWeight:"600" }}>Note: You cannot return to this question after submitting.</div>
                <button onClick={submitAnswer} style={{ padding:"16px 32px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 12px rgba(15,23,42,0.2)" }}>
                  Submit & Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
