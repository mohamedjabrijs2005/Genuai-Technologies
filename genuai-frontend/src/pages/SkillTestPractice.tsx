import { useState, useEffect } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const CATEGORIES = [
  { id: 'logical', name: 'Logical Reasoning', imgSrc: '/icons/cat_logical.png', color: '#2563EB', bg: '#EFF6FF', desc: 'Syllogisms, blood relations, patterns' },
  { id: 'quantitative', name: 'Quantitative Aptitude', imgSrc: '/icons/cat_quant.png', color: '#059669', bg: '#ECFDF5', desc: 'Permutations, probability, algebra' },
  { id: 'english', name: 'English Comprehension', imgSrc: '/icons/cat_english.png', color: '#D97706', bg: '#FFFBEB', desc: 'Grammar, vocabulary, reading comp' },
  { id: 'automata_fix', name: 'GenuAI Automata Fix', imgSrc: '/icons/cat_autofix.png', color: '#DC2626', bg: '#FEF2F2', desc: 'Debug logical and syntax errors in C/C++/Java' },
  { id: 'automata', name: 'GenuAI Automata', imgSrc: '/icons/cat_automata.png', color: '#7C3AED', bg: '#F5F3FF', desc: 'Live competitive programming assessment' },
  { id: 'core', name: 'Core Computer Science', imgSrc: '/icons/learning_brain.png', color: '#0891B2', bg: '#ECFEFF', desc: 'OS, DBMS, Computer Networks, OOPS' },
];

const SUB_TOPICS: Record<string, string[]> = {
  logical: ["Coding-Decoding", "Blood Relations", "Directional Sense", "Data Sufficiency", "Logical Sequences", "Syllogism", "Seating Arrangement", "Clocks & Calendars"],
  quantitative: ["Number System", "HCF & LCM", "Divisibility", "Percentages", "Profit & Loss", "Time-Speed-Distance", "Probability", "Permutations & Combinations", "Simple & Compound Interest"],
  english: ["Vocabulary Synonyms", "Vocabulary Antonyms", "Error Identification", "Sentence Correction", "Sentence Improvement", "Prepositions & Articles", "Active/Passive Voice"],
  automata_fix: ["Array Manipulation", "String Parsing", "Loop Logic", "Conditional Logic", "Recursion Base Case", "Basic Math Logic", "Off-by-one errors"],
  automata: ["Arrays", "Strings", "Linked Lists", "Recursion", "Sorting", "Searching", "Matrix Manipulation", "Basic Hash Maps"],
  core: ["Operating Systems", "DBMS & SQL", "Computer Networks", "Computer Architecture", "Software Engineering", "Deadlocks & Concurrency", "OSI Model"]
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
      if (cat !== "automata_fix" && cat !== "automata") {
        prompt = `Generate a unique, highly challenging ${diff} level GenuAI-style Multiple Choice Question for the category: ${cat}.
Specifically focus on the sub-topic: **${randomTopic}**. ${prevQ}
Return ONLY valid JSON with this exact structure:
{
  "type": "mcq",
  "question": "The actual question text...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Detailed explanation of the correct logic."
}`;
      } else if (cat === "automata_fix") {
        prompt = `Generate a unique ${diff} level GenuAI Automata Fix (Debugging) question focusing on **${randomTopic}**. ${prevQ}
Provide a short snippet of code with a deliberate syntax or logical bug.
Return ONLY valid JSON with this exact structure:
{
  "type": "code",
  "title": "Fix the Bug: [Specific Concept Name]",
  "description": "Explain what the code is SUPPOSED to do, but mention there is a bug.",
  "codeTemplate": "def find_max(arr):\\n    max_val = 0 # Bug here if array has negative numbers\\n    for i in arr:\\n        if i > max_val:\\n            max_val = i\\n    return max_val",
  "language": "python"
}`;
      } else if (cat === "automata") {
        prompt = `Generate a unique ${diff} level GenuAI Automata (Live Coding) competitive programming question focusing on **${randomTopic}**. ${prevQ}
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
      const prompt = `You are an automated GenuAI compiler. Evaluate the following candidate code for the problem: "${q.title}".
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
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", fontWeight:"700", padding:0 }}>← Back to Practice Hub</button>
        <div style={{ fontWeight:"800", color:"#0F172A", fontSize:"18px" }}>GenuAI Skill Test</div>
        <div style={{ width:"120px" }}></div>
      </div>
      <div style={{ flex:1, display:"flex", maxWidth:"1100px", margin:"0 auto", width:"100%", padding:"60px 40px", alignItems:"center" }}>
        <div style={{ flex:1, paddingRight:"60px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ fontSize:"56px", marginBottom:"24px" }}>🎯</div>
          <h1 style={{ fontSize:"40px", fontWeight:"900", color:"#0F172A", marginBottom:"24px", letterSpacing:"-1px", lineHeight:"1.1" }}>Master Your Next<br/>Assessment</h1>
          <p style={{ color:"#475569", fontSize:"16px", lineHeight:"1.6", marginBottom:"40px", maxWidth:"500px" }}>
            Experience a highly realistic, AI-driven GenuAI simulation. Features strict timers, adaptive difficulty (CAT methodology), and intelligent compiler evaluation for Automata.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"12px" }}>
             <div style={{ background:"#FEF2F2", color:"#DC2626", padding:"10px 16px", borderRadius:"10px", fontWeight:"700", fontSize:"13px" }}>✓ Strict Timers</div>
             <div style={{ background:"#F0FDF4", color:"#16A34A", padding:"10px 16px", borderRadius:"10px", fontWeight:"700", fontSize:"13px" }}>✓ Adaptive AI (CAT)</div>
             <div style={{ background:"#EFF6FF", color:"#2563EB", padding:"10px 16px", borderRadius:"10px", fontWeight:"700", fontSize:"13px" }}>✓ Live Code Compiler</div>
             <div style={{ background:"#F3E8FF", color:"#9333EA", padding:"10px 16px", borderRadius:"10px", fontWeight:"700", fontSize:"13px" }}>✓ Real-time Scoring</div>
             <div style={{ background:"#FEF3C7", color:"#D97706", padding:"10px 16px", borderRadius:"10px", fontWeight:"700", fontSize:"13px" }}>✓ GenuAI Curriculum</div>
          </div>
        </div>
        
        <div style={{ flex:1, maxWidth:"500px" }}>
          <div style={{ background:"#fff", borderRadius:"24px", padding:"40px", boxShadow:"0 20px 40px rgba(0,0,0,0.04)", border:"1px solid #E2E8F0" }}>
            <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#0F172A", marginBottom:"24px" }}>Select Module</h2>
            
            <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"12px", marginBottom:"32px", maxHeight:"400px", overflowY:"auto", paddingRight:"8px" }}>
              {CATEGORIES.map(c => (
                <div key={c.id} onClick={() => setCategory(c.id)} style={{ display:"flex", alignItems:"center", gap:"16px", padding:"16px", border:`2px solid ${category===c.id?"#2563EB":"#F1F5F9"}`, borderRadius:"16px", cursor:"pointer", background:category===c.id?"#EFF6FF":"#fff", transition:"all 0.2s" }}>
                  <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                    <img src={c.imgSrc} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:"800", fontSize:"15px", color:category===c.id?"#1E3A8A":"#0F172A", marginBottom:"4px" }}>{c.name}</div>
                    <div style={{ fontSize:"12px", color:"#64748B", lineHeight:"1.4" }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={startTest} style={{ width:"100%", padding:"16px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:"pointer", boxShadow:"0 12px 24px rgba(15,23,42,0.15)", transition:"all 0.2s" }}>
              Start Simulation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS PHASE ──
  if (phase === "results") {
    const correctCount = history.filter(h => h.isCorrect).length;
    const scoreColor = correctCount >= 16 ? "#10B981" : correctCount >= 8 ? "#F59E0B" : "#EF4444";
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
        <div style={{ background:"#0F172A", color:"#fff", padding:"60px 40px", textAlign:"center" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <div style={{ fontSize:"64px", marginBottom:"16px" }}>🏆</div>
            <h1 style={{ fontSize:"40px", fontWeight:"900", margin:"0 0 12px" }}>Assessment Complete</h1>
            <div style={{ fontSize:"20px", color:"#94A3B8", marginBottom:"32px" }}>{currentCatData.name} Module</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"16px", background:"#1E293B", padding:"12px 32px", borderRadius:"24px" }}>
              <span style={{ fontSize:"48px", fontWeight:"900", color:scoreColor }}>{correctCount}/20</span>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#F8FAFC", fontWeight:"800", fontSize:"16px" }}>Final Score</div>
                <div style={{ color:scoreColor, fontWeight:"700", fontSize:"14px" }}>
                  {correctCount >= 16 ? "Excellent Adaptive Performance!" : "Keep practicing to master harder difficulties."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"60px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
            <h2 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:0 }}>Adaptive Breakdown</h2>
            <div style={{ display:"flex", gap:"12px" }}>
              <button onClick={() => setPhase("setup")} style={{ padding:"12px 24px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>🔄 Retake</button>
              <button onClick={onBack} style={{ padding:"12px 24px", background:"#fff", color:"#475569", border:"1px solid #E2E8F0", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:"pointer" }}>Exit</button>
            </div>
          </div>

          <div style={{ display:"grid", gap:"24px" }}>
            {history.map((h, i) => (
              <div key={i} style={{ background:"#fff", borderRadius:"20px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", paddingBottom:"16px", borderBottom:"1px solid #F1F5F9" }}>
                  <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                    <span style={{ color:"#475569", fontWeight:"800", fontSize:"13px", textTransform:"uppercase", letterSpacing:"1px" }}>Question {i+1}</span>
                    <span style={{ background:"#FFFBEB", color:"#D97706", fontWeight:"800", fontSize:"12px", padding:"4px 10px", borderRadius:"6px", border:"1px solid #FEF3C7" }}>{h.difficulty} Level</span>
                  </div>
                  <div style={{ fontWeight:"900", color:h.isCorrect?"#10B981":"#EF4444", fontSize:"16px", background:h.isCorrect?"#D1FAE5":"#FEE2E2", padding:"6px 16px", borderRadius:"8px" }}>
                    {h.isCorrect ? "Correct" : "Incorrect"}
                  </div>
                </div>

                {h.question.type === "mcq" ? (
                  <>
                    <div style={{ fontWeight:"700", color:"#0F172A", marginBottom:"24px", fontSize:"18px", lineHeight:"1.6" }}>{h.question.question}</div>
                    
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"24px" }}>
                      <div style={{ background:"#F8FAFC", padding:"20px", borderRadius:"12px", border:"1px solid #F1F5F9" }}>
                        <div style={{ color:"#64748B", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Your Answer</div>
                        <div style={{ color:h.isCorrect?"#10B981":"#EF4444", fontWeight:"700", fontSize:"15px" }}>{h.userAnswer}</div>
                      </div>
                      {!h.isCorrect && (
                        <div style={{ background:"#F0FDF4", padding:"20px", borderRadius:"12px", border:"1px solid #DCFCE7" }}>
                          <div style={{ color:"#16A34A", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Correct Answer</div>
                          <div style={{ color:"#15803D", fontWeight:"700", fontSize:"15px" }}>{h.question.options[h.question.correctIndex]}</div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ background:"#EFF6FF", padding:"20px", borderRadius:"12px", border:"1px solid #BFDBFE" }}>
                      <div style={{ color:"#1D4ED8", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"8px" }}>Explanation</div>
                      <div style={{ color:"#1E3A8A", fontSize:"15px", lineHeight:"1.6" }}>{h.question.explanation}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight:"800", color:"#0F172A", marginBottom:"8px", fontSize:"20px" }}>{h.question.title}</div>
                    <div style={{ color:"#475569", marginBottom:"24px", fontSize:"15px", lineHeight:"1.6" }}>{h.question.description}</div>
                    
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"20px" }}>
                      <div style={{ background:"#0F172A", borderRadius:"12px", padding:"24px", overflowX:"auto" }}>
                        <div style={{ color:"#94A3B8", fontSize:"11px", fontWeight:"800", textTransform:"uppercase", marginBottom:"12px", letterSpacing:"1px" }}>Your Submitted Code</div>
                        <pre style={{ margin:0, color:"#F8FAFC", fontSize:"14px", fontFamily:"'Fira Code', monospace" }}>{h.userAnswer}</pre>
                      </div>
                      
                      <div style={{ background:h.isCorrect?"#F0FDF4":"#FEF2F2", padding:"24px", borderRadius:"12px", border:`1px solid ${h.isCorrect?"#DCFCE7":"#FECACA"}` }}>
                        <div style={{ color:h.isCorrect?"#16A34A":"#DC2626", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", marginBottom:"12px" }}>Compiler AI Evaluation</div>
                        <div style={{ color:h.isCorrect?"#15803D":"#991B1B", fontSize:"15px", lineHeight:"1.7", whiteSpace:"pre-wrap" }}>{h.evaluation?.feedback}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── TEST PHASE ──
  return (
    <div style={{ height:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* HackerRank Style Header */}
      <div style={{ background:"#0F172A", color:"#fff", padding:"0 32px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ fontWeight:"800", fontSize:"16px", letterSpacing:"0.5px", display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"24px", height:"24px", borderRadius:"6px", background:currentCatData.bg, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
               <img src={currentCatData.imgSrc} alt={currentCatData.name} style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply" }} />
            </div> GenuAI Assessment Environment
          </div>
          <div style={{ background:"#1E293B", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700", color:"#94A3B8" }}>{currentCatData.name}</div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ fontSize:"13px", color:"#94A3B8", fontWeight:"700" }}>Question {currentQIndex+1}/20</div>
            <div style={{ background:"#334155", color:"#F8FAFC", padding:"4px 10px", borderRadius:"6px", fontSize:"12px", fontWeight:"700" }}>{difficulty}</div>
            
            <div style={{ background:timeLeft < 120 ? "#7F1D1D" : "#1E293B", padding:"6px 16px", borderRadius:"8px", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.3s" }}>
              <span style={{ fontSize:"14px" }}>⌛</span>
              <span style={{ fontWeight:"800", fontSize:"14px", color:timeLeft < 120 ? "#FCA5A5" : "#F8FAFC", fontVariantNumeric:"tabular-nums" }}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {loading || !question ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:"#fff", borderRadius:"24px", padding:"80px 40px", border:"1px solid #E2E8F0", textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", maxWidth:"500px", width:"100%" }}>
              <div style={{ width:"48px", height:"48px", border:"4px solid #F1F5F9", borderTop:"4px solid #2563EB", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 24px" }}></div>
              <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#0F172A", marginBottom:"8px" }}>Generating {difficulty} Question...</h2>
              <p style={{ color:"#64748B", fontSize:"14px" }}>The AI is analyzing your performance and scaling the difficulty.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left Pane - Question Info */}
            <div style={{ width:"45%", background:"#fff", borderRight:"1px solid #E2E8F0", padding:"48px", overflowY:"auto", display:"flex", flexDirection:"column" }}>
              {question.type === "mcq" ? (
                <>
                  <div style={{ fontSize:"13px", fontWeight:"900", color:"#2563EB", textTransform:"uppercase", letterSpacing:"1px", background:"#EFF6FF", padding:"6px 12px", borderRadius:"8px", alignSelf:"flex-start", marginBottom:"24px" }}>Aptitude Question</div>
                  <p style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", margin:0, lineHeight:"1.6" }}>{question.question}</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize:"13px", fontWeight:"900", color:"#16A34A", textTransform:"uppercase", letterSpacing:"1px", background:"#F0FDF4", padding:"6px 12px", borderRadius:"8px", alignSelf:"flex-start", marginBottom:"24px" }}>Coding Challenge</div>
                  <h2 style={{ fontSize:"28px", fontWeight:"800", color:"#0F172A", marginBottom:"16px" }}>{question.title}</h2>
                  <p style={{ fontSize:"16px", color:"#475569", lineHeight:"1.7", margin:0 }}>{question.description}</p>
                </>
              )}
            </div>

            {/* Right Pane - Interactive Area */}
            <div style={{ flex:1, background:"#F8FAFC", display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ flex:1, padding:"48px", overflowY:"auto" }}>
                {question.type === "mcq" ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px", maxWidth:"700px", margin:"0 auto" }}>
                    {question.options.map((opt, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedOption(i)} 
                        style={{ padding:"24px", border:`2px solid ${selectedOption===i?"#2563EB":"#E2E8F0"}`, borderRadius:"16px", cursor:"pointer", background:selectedOption===i?"#EFF6FF":"#fff", fontSize:"16px", fontWeight:"600", color:"#334155", display:"flex", alignItems:"center", gap:"20px", transition:"all 0.2s", boxShadow:selectedOption===i?"0 4px 12px rgba(37,99,235,0.1)":"0 2px 4px rgba(0,0,0,0.02)" }}
                      >
                        <div style={{ width:"24px", height:"24px", borderRadius:"50%", border:`2px solid ${selectedOption===i?"#2563EB":"#CBD5E1"}`, background:selectedOption===i?"#2563EB":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {selectedOption===i && <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#fff" }}/>}
                        </div>
                        <div style={{ lineHeight:"1.5" }}>{opt}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
                    <div style={{ background:"#0F172A", borderRadius:"16px", display:"flex", flexDirection:"column", flex:1, overflow:"hidden", border:"1px solid #334155", boxShadow:"0 10px 25px rgba(0,0,0,0.1)" }}>
                      <div style={{ padding:"12px 20px", borderBottom:"1px solid #1E293B", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0B1120" }}>
                        <span style={{ color:"#94A3B8", fontSize:"12px", fontWeight:"800", textTransform:"uppercase", letterSpacing:"1px" }}>GenuAI IDE</span>
                        <span style={{ color:"#38BDF8", fontSize:"12px", fontWeight:"700", background:"#0C4A6E", padding:"4px 10px", borderRadius:"6px" }}>{question.language}</span>
                      </div>
                      <textarea 
                        value={userCode} 
                        onChange={e => setUserCode(e.target.value)} 
                        spellCheck={false}
                        style={{ flex:1, width:"100%", background:"transparent", color:"#F8FAFC", border:"none", padding:"24px", fontFamily:"'Fira Code', monospace", fontSize:"15px", lineHeight:"1.6", resize:"none", outline:"none" }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ background:"#fff", padding:"24px 48px", borderTop:"1px solid #E2E8F0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ color:"#64748B", fontSize:"14px", fontWeight:"600", display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"18px" }}>⚠️</span> You cannot return to this question after submitting.
                </div>
                <button onClick={submitAnswer} style={{ padding:"16px 32px", background:"#0F172A", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 12px rgba(15,23,42,0.2)", transition:"transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  Submit & Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
