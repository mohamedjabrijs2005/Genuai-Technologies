import { useState, useEffect } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const CATEGORIES = [
  { id: 'logical', name: 'Logical Reasoning', imgSrc: '/icons/cat_logical.png', color: 'indigo-brand', bg: 'indigo-brand/10', desc: 'Syllogisms, blood relations, patterns' },
  { id: 'quantitative', name: 'Quantitative Aptitude', imgSrc: '/icons/cat_quant.png', color: 'success', bg: 'success/10', desc: 'Permutations, probability, algebra' },
  { id: 'english', name: 'English Comprehension', imgSrc: '/icons/cat_english.png', color: 'warning-dark', bg: 'warning/10', desc: 'Grammar, vocabulary, reading comp' },
  { id: 'automata_fix', name: 'GenuAI Automata Fix', imgSrc: '/icons/cat_autofix.png', color: 'error', bg: 'error/10', desc: 'Debug logical and syntax errors in C/C++/Java' },
  { id: 'automata', name: 'GenuAI Automata', imgSrc: '/icons/cat_automata.png', color: '[#7C3AED]', bg: '[#7C3AED]/10', desc: 'Live competitive programming assessment' },
  { id: 'core', name: 'Core Computer Science', imgSrc: '/icons/learning_brain.png', color: 'info', bg: 'info/10', desc: 'OS, DBMS, Computer Networks, OOPS' },
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
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl py-sm flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors font-bold text-sm">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to Practice Hub
        </button>
        <div className="font-black text-on-surface text-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-accent-gold">school</span>
          GenuAI Skill Test
        </div>
        <div className="w-32"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xxl gap-xl">
        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-lg animate-[float_4s_ease-in-out_infinite]">
             <span className="material-symbols-outlined text-7xl text-indigo-brand drop-shadow-md">target</span>
          </div>
          <h1 className="text-display-lg-mobile md:text-display-lg-desktop font-black text-on-surface mb-md leading-tight tracking-tight">
            Master Your Next<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-brand via-purple-500 to-cyan-500 drop-shadow-sm">Assessment</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant/90 font-medium mb-xl max-w-xl leading-relaxed">
            Experience a highly realistic, AI-driven GenuAI simulation. Features strict timers, adaptive difficulty (CAT methodology), and intelligent compiler evaluation for Automata.
          </p>
          <div className="flex flex-wrap gap-md">
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-error flex items-center gap-xs shadow-sm border border-error/20">
               <span className="material-symbols-outlined text-lg">timer</span> Strict Timers
             </div>
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-success flex items-center gap-xs shadow-sm border border-success/20">
               <span className="material-symbols-outlined text-lg">trending_up</span> Adaptive AI (CAT)
             </div>
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-indigo-brand flex items-center gap-xs shadow-sm border border-indigo-brand/20">
               <span className="material-symbols-outlined text-lg">terminal</span> Live Code Compiler
             </div>
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-[#9333EA] flex items-center gap-xs shadow-sm border border-[#9333EA]/20">
               <span className="material-symbols-outlined text-lg">bolt</span> Real-time Scoring
             </div>
          </div>
        </div>
        
        {/* Right Content - Config Card */}
        <div className="flex-1 max-w-[500px] w-full mt-xl lg:mt-0">
          <div className="glass p-xxl rounded-xxxl shadow-md border border-surface-container relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-brand/5 to-transparent pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-title-lg font-black text-on-surface mb-lg">Select Module</h2>
              
              <div className="flex flex-col gap-sm mb-xl max-h-[400px] overflow-y-auto pr-sm custom-scrollbar">
                {CATEGORIES.map(c => (
                  <div key={c.id} onClick={() => setCategory(c.id)} className={`flex items-center gap-md p-md border-2 rounded-xl cursor-pointer transition-all duration-300 ${category === c.id ? 'border-indigo-brand bg-indigo-brand/5 shadow-sm transform -translate-y-1' : 'border-surface-container bg-surface-bright hover:border-surface-container-high hover:bg-surface-container/50'}`}>
                    <div className={`w-12 h-12 rounded-xl bg-${c.bg} flex items-center justify-center overflow-hidden shrink-0`}>
                      <img src={c.imgSrc} alt={c.name} className="w-8 h-8 object-cover mix-blend-multiply drop-shadow-sm" />
                    </div>
                    <div>
                      <div className={`font-bold text-sm mb-1 ${category === c.id ? 'text-indigo-brand' : 'text-on-surface'}`}>{c.name}</div>
                      <div className="text-xs font-medium text-on-surface-variant leading-snug">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={startTest} className="w-full py-md rounded-xl font-black text-body-base flex items-center justify-center gap-sm bg-gradient-to-r from-indigo-brand to-[#764BA2] text-white hover:shadow-[0_8px_25px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                Start Simulation <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS PHASE ──
  if (phase === "results") {
    const correctCount = history.filter(h => h.isCorrect).length;
    const scoreColor = correctCount >= 16 ? "text-success" : correctCount >= 8 ? "text-warning" : "text-error";
    return (
      <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
        {/* Decorative */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-gold/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 glass border-b border-surface-container/50 pt-xxl pb-xl px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-4xl mx-auto">
             <div className="text-6xl mb-md drop-shadow-sm animate-[bounce_2s_infinite]">🏆</div>
             <h1 className="text-display-sm-mobile md:text-display-sm-desktop font-black text-on-surface mb-xs">Assessment Complete</h1>
             <div className="text-title-md font-bold text-on-surface-variant/80 mb-lg flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined">class</span> {currentCatData.name} Module
             </div>
             
             <div className="inline-flex items-center gap-md glass p-md rounded-xxl border border-surface-container shadow-md">
               <span className={`text-5xl font-black ${scoreColor}`}>{correctCount}/20</span>
               <div className="text-left border-l-2 border-surface-container pl-md">
                 <div className="text-sm font-black text-on-surface uppercase tracking-widest">Final Score</div>
                 <div className={`font-bold text-sm ${scoreColor}`}>
                   {correctCount >= 16 ? "Excellent Adaptive Performance!" : "Keep practicing to master harder difficulties."}
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex-1 pb-xxxl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-xl gap-md">
            <h2 className="text-title-lg font-black text-on-surface flex items-center gap-sm">
              <span className="material-symbols-outlined text-accent-gold text-3xl">analytics</span>
              Adaptive Breakdown
            </h2>
            <div className="flex gap-sm">
              <button onClick={() => setPhase("setup")} className="px-md py-sm bg-indigo-brand text-white rounded-xl font-bold text-sm hover:bg-indigo-brand/90 transition-colors shadow-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">refresh</span> Retake
              </button>
              <button onClick={onBack} className="px-md py-sm glass rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container/50 transition-colors border border-surface-container flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">exit_to_app</span> Exit
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-lg">
            {history.map((h, i) => (
              <div key={i} className="glass rounded-xxl p-lg border border-surface-container shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-lg pb-md border-b border-surface-container/50">
                  <div className="flex items-center gap-md">
                    <span className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase text-xs">Question {i+1}</span>
                    <span className="bg-warning/10 text-warning-dark font-bold text-xs px-sm py-1 rounded-md border border-warning/20 flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">speed</span> {h.difficulty} Level
                    </span>
                  </div>
                  <div className={`font-black text-sm px-md py-1.5 rounded-lg flex items-center gap-xs ${h.isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    <span className="material-symbols-outlined text-[16px]">{h.isCorrect ? 'check_circle' : 'cancel'}</span> {h.isCorrect ? "Correct" : "Incorrect"}
                  </div>
                </div>

                {h.question.type === "mcq" ? (
                  <>
                    <div className="font-bold text-title-md text-on-surface mb-lg leading-snug">{h.question.question}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                      <div className="bg-surface-bright/80 p-md rounded-xl border border-surface-container">
                        <div className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-sm flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">person</span> Your Answer</div>
                        <div className={`font-bold text-sm ${h.isCorrect ? "text-success" : "text-error"}`}>{h.userAnswer}</div>
                      </div>
                      {!h.isCorrect && (
                        <div className="bg-success/5 p-md rounded-xl border border-success/20">
                          <div className="text-xs font-black text-success uppercase tracking-widest mb-sm flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">verified</span> Correct Answer</div>
                          <div className="font-bold text-sm text-success/90">{h.question.options[h.question.correctIndex]}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-indigo-brand/5 p-md rounded-xl border border-indigo-brand/20">
                      <div className="text-xs font-black text-indigo-brand uppercase tracking-widest mb-sm flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">lightbulb</span> Explanation</div>
                      <div className="font-medium text-sm text-indigo-brand/80 leading-relaxed">{h.question.explanation}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-black text-title-lg text-on-surface mb-xs flex items-center gap-sm"><span className="material-symbols-outlined text-indigo-brand">code</span> {h.question.title}</div>
                    <div className="text-body-base font-medium text-on-surface-variant mb-lg leading-relaxed">{h.question.description}</div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-md mb-md">
                      <div className="bg-[#0B1120] rounded-xl p-md border border-surface-container overflow-x-auto shadow-inner">
                        <div className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-md flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">terminal</span> Your Submitted Code</div>
                        <pre className="m-0 text-white font-mono text-sm">{h.userAnswer}</pre>
                      </div>
                      
                      <div className={`p-md rounded-xl border ${h.isCorrect ? "bg-success/5 border-success/20" : "bg-error/5 border-error/20"}`}>
                        <div className={`text-xs font-black uppercase tracking-widest mb-md flex items-center gap-xs ${h.isCorrect ? "text-success" : "text-error"}`}>
                          <span className="material-symbols-outlined text-[16px]">psychology</span> Compiler AI Evaluation
                        </div>
                        <div className={`font-medium text-sm leading-relaxed whitespace-pre-wrap ${h.isCorrect ? "text-success/90" : "text-error/90"}`}>{h.evaluation?.feedback}</div>
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
    <div className="h-screen bg-background font-body-base text-on-background flex flex-col overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute inset-0 quantum-gradient opacity-50 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-gold/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* HackerRank Style Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-md">
          <div className="font-black text-lg text-on-surface flex items-center gap-xs tracking-tight">
             <div className={`w-8 h-8 rounded-lg bg-${currentCatData.bg} flex items-center justify-center overflow-hidden shrink-0`}>
                <img src={currentCatData.imgSrc} alt={currentCatData.name} className="w-full h-full object-cover mix-blend-multiply" />
             </div> 
             GenuAI Assessment
          </div>
          <div className="bg-surface-container-high/50 px-sm py-0.5 rounded-md text-xs font-bold text-on-surface-variant hidden sm:block">
            {currentCatData.name}
          </div>
        </div>
        
        <div className="flex items-center gap-xl">
          <div className="flex items-center gap-md">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Question {currentQIndex+1}/20</div>
            <div className="bg-indigo-brand/10 text-indigo-brand px-sm py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border border-indigo-brand/20 hidden sm:block">{difficulty}</div>
            
            <div className={`px-md py-1 rounded-lg flex items-center gap-xs transition-colors border ${timeLeft < 120 ? "bg-error/10 text-error border-error/20 animate-pulse" : "bg-surface-container/50 text-on-surface border-surface-container"}`}>
              <span className="material-symbols-outlined text-sm">timer</span>
              <span className="font-black text-sm font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {loading || !question ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="glass rounded-xxxl p-xxl border border-surface-container text-center shadow-lg max-w-md w-full mx-md animate-[fadeIn_0.5s_ease-out]">
              <span className="material-symbols-outlined text-5xl text-indigo-brand animate-spin mb-md">autorenew</span>
              <h2 className="text-title-lg font-black text-on-surface mb-xs">Generating {difficulty} Question...</h2>
              <p className="text-body-base font-medium text-on-surface-variant">The AI is analyzing your performance and scaling the difficulty dynamically.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Left Pane - Question Info */}
            <div className="w-full lg:w-5/12 glass border-b lg:border-b-0 lg:border-r border-surface-container/50 p-xl lg:p-xxl flex flex-col overflow-y-auto">
              {question.type === "mcq" ? (
                <>
                  <div className="text-xs font-black text-success uppercase tracking-widest bg-success/10 px-sm py-1 rounded-md border border-success/20 self-start mb-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">quiz</span> Aptitude Question
                  </div>
                  <p className="text-title-lg md:text-headline-sm font-black text-on-surface leading-snug m-0">{question.question}</p>
                </>
              ) : (
                <>
                  <div className="text-xs font-black text-indigo-brand uppercase tracking-widest bg-indigo-brand/10 px-sm py-1 rounded-md border border-indigo-brand/20 self-start mb-lg flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">code_blocks</span> Coding Challenge
                  </div>
                  <h2 className="text-headline-sm font-black text-on-surface mb-md">{question.title}</h2>
                  <p className="text-body-lg font-medium text-on-surface-variant leading-relaxed m-0">{question.description}</p>
                </>
              )}
            </div>

            {/* Right Pane - Interactive Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-surface-bright/30">
              <div className="flex-1 p-xl lg:p-xxl overflow-y-auto">
                {question.type === "mcq" ? (
                  <div className="flex flex-col gap-md max-w-2xl mx-auto">
                    {question.options.map((opt, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedOption(i)} 
                        className={`p-lg border-2 rounded-xl cursor-pointer font-bold text-body-lg flex items-center gap-md transition-all duration-200 ${selectedOption === i ? "border-indigo-brand bg-indigo-brand/5 text-indigo-brand shadow-md" : "border-surface-container bg-surface-bright text-on-surface hover:border-surface-container-high hover:bg-surface-container/50"}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedOption === i ? "border-indigo-brand bg-indigo-brand" : "border-surface-container-high bg-transparent"}`}>
                          {selectedOption === i && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div className="leading-snug">{opt}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full rounded-xl overflow-hidden border border-surface-container shadow-lg">
                    <div className="px-md py-sm bg-[#0B1120] border-b border-surface-container flex justify-between items-center">
                      <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">terminal</span> GenuAI IDE</span>
                      <span className="text-xs font-bold text-info bg-info/10 px-xs py-0.5 rounded-md border border-info/20">{question.language}</span>
                    </div>
                    <textarea 
                      value={userCode} 
                      onChange={e => setUserCode(e.target.value)} 
                      spellCheck={false}
                      className="flex-1 w-full bg-[#0F172A] text-white font-mono text-sm p-lg resize-none outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-brand transition-shadow" 
                    />
                  </div>
                )}
              </div>
              
              <div className="glass px-xl py-md border-t border-surface-container/50 flex justify-between items-center z-10">
                <div className="text-sm font-bold text-warning flex items-center gap-xs">
                  <span className="material-symbols-outlined">warning</span> You cannot return to this question.
                </div>
                <button 
                  onClick={submitAnswer} 
                  className="px-xl py-sm bg-on-surface text-surface rounded-xl font-black text-sm hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all flex items-center gap-xs"
                >
                  Submit & Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
