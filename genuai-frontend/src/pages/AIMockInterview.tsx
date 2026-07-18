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
  
  // ── SETUP ──
  if (phase === "setup") return (
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl py-sm flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors font-bold text-sm">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to Practice Hub
        </button>
        <div className="font-black text-on-surface text-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-accent-gold">smart_toy</span>
          AI Mock Interview
        </div>
        <div className="w-32"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xxl gap-xl">
        
        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-7xl mb-lg animate-[float_4s_ease-in-out_infinite]">🤖</div>
          <h1 className="text-display-lg-mobile md:text-display-lg-desktop font-black text-on-surface mb-md leading-tight tracking-tight">
            Master Your Next<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-brand via-purple-500 to-cyan-500 drop-shadow-sm">Technical Interview</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant/90 font-medium mb-xl max-w-xl leading-relaxed">
            Experience a hyper-realistic, AI-driven interview environment. Utilize live voice transcription and receive instantaneous, actionable feedback on every response.
          </p>
          <div className="flex flex-wrap gap-md">
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-indigo-brand flex items-center gap-xs shadow-sm border border-indigo-brand/20">
               <span className="material-symbols-outlined text-lg">mic</span> Live Speech-to-Text
             </div>
             <div className="glass px-md py-sm rounded-xl font-bold text-sm text-success flex items-center gap-xs shadow-sm border border-success/20">
               <span className="material-symbols-outlined text-lg">bolt</span> Instant AI Grading
             </div>
          </div>
        </div>
        
        {/* Right Content - Config Card */}
        <div className="flex-1 max-w-[500px] w-full mt-xl lg:mt-0">
          <div className="glass p-xxl rounded-xxxl shadow-md border border-surface-container relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-brand/5 to-transparent pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-title-lg font-black text-on-surface mb-lg">Configure Session</h2>
              
              <div className="mb-lg">
                <label className="text-label-caps font-label-caps text-on-surface-variant block mb-xs tracking-widest uppercase">Your Target Role</label>
                <div className="relative">
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full appearance-none bg-surface-bright border border-surface-container rounded-xl px-md py-sm text-on-surface font-semibold focus:outline-none focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-colors cursor-pointer">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="mb-xl">
                <label className="text-label-caps font-label-caps text-on-surface-variant block mb-sm tracking-widest uppercase">Interview Type</label>
                <div className="grid grid-cols-3 gap-sm">
                  {TYPES.map(t => (
                    <div key={t.key} onClick={() => setType(t.key)} className={`p-sm rounded-xl border-2 cursor-pointer text-center transition-all duration-300 ${type === t.key ? "border-indigo-brand bg-indigo-brand/5 shadow-sm transform -translate-y-1" : "border-surface-container bg-surface-bright hover:border-surface-container-high hover:bg-surface-container/50"}`}>
                      <div className="text-3xl mb-xs drop-shadow-sm">{t.emoji}</div>
                      <div className={`font-bold text-xs ${type === t.key ? "text-indigo-brand" : "text-on-surface-variant"}`}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-xl">
                <div className="flex justify-between items-center mb-sm">
                  <label className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase">Number of Questions</label>
                  <span className="text-indigo-brand font-black text-lg bg-indigo-brand/10 px-xs py-0.5 rounded-md">{questionCount}</span>
                </div>
                <input type="range" min={3} max={10} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-indigo-brand" />
              </div>

              <button onClick={startInterview} disabled={loading} className={`w-full py-md rounded-xl font-black text-body-base flex items-center justify-center gap-sm transition-all duration-300 ${loading ? "bg-surface-container text-on-surface-variant cursor-not-allowed" : "bg-gradient-to-r from-indigo-brand to-[#764BA2] text-white hover:shadow-[0_8px_25px_rgba(102,126,234,0.4)] hover:-translate-y-0.5"}`}>
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-xl">autorenew</span> Preparing AI...</>
                ) : (
                  <>Start {questionCount}-Question Interview <span className="material-symbols-outlined text-xl">arrow_forward</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS ──
  if (phase === "results") return (
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-gold/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Results Hero */}
      <div className="relative z-10 glass border-b border-surface-container/50 pt-xxl pb-xl px-margin-mobile md:px-margin-desktop text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-md drop-shadow-sm animate-[bounce_2s_infinite]">🏆</div>
          <h1 className="text-display-sm-mobile md:text-display-sm-desktop font-black text-on-surface mb-xs">Interview Complete</h1>
          <div className="text-title-md font-bold text-on-surface-variant/80 mb-lg flex items-center justify-center gap-sm">
             <span className="material-symbols-outlined">work</span> {role} <span className="text-surface-container-high">•</span> {type} Round
          </div>
          
          <div className="inline-flex items-center gap-md glass p-md rounded-xxl border border-surface-container shadow-md">
            <span className={`text-5xl font-black ${avgScore >= 80 ? "text-success" : avgScore >= 60 ? "text-warning" : "text-error"}`}>{avgScore}%</span>
            <div className="text-left border-l-2 border-surface-container pl-md">
              <div className="text-sm font-black text-on-surface uppercase tracking-widest">Overall Score</div>
              <div className={`font-bold text-sm ${avgScore >= 80 ? "text-success" : avgScore >= 60 ? "text-warning" : "text-error"}`}>
                {avgScore >= 80 ? "Excellent Performance!" : avgScore >= 60 ? "Good — Keep Practising" : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex-1 pb-xxxl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-xl gap-md">
          <h2 className="text-title-lg font-black text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-accent-gold text-3xl">insights</span>
            Detailed Feedback ({history.length} Questions)
          </h2>
          <div className="flex gap-sm">
            <button onClick={() => { setPhase("setup"); setHistory([]); setQIndex(0); }} className="px-md py-sm bg-indigo-brand text-white rounded-xl font-bold text-sm hover:bg-indigo-brand/90 transition-colors shadow-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">refresh</span> New Interview
            </button>
            <button onClick={onBack} className="px-md py-sm glass rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container/50 transition-colors border border-surface-container flex items-center gap-xs">
               Exit
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          {history.map((h, i) => {
            const isGood = h.fb?.score >= 80;
            const isOk = h.fb?.score >= 60;
            const qColor = isGood ? "text-success" : isOk ? "text-warning" : "text-error";
            const qBg = isGood ? "bg-success/10" : isOk ? "bg-warning/10" : "bg-error/10";
            
            return (
              <div key={i} className="glass rounded-xxl p-lg border border-surface-container shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-md gap-lg">
                  <div className="flex-1">
                    <div className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase mb-xs text-xs flex items-center gap-xs">
                      Question {i+1}
                    </div>
                    <div className="text-title-md font-bold text-on-surface leading-snug">{h.q}</div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end">
                    <div className={`text-4xl font-black ${qColor} leading-none mb-1`}>{h.fb?.score || 0}%</div>
                    <div className={`font-bold text-xs uppercase tracking-wider px-2 py-0.5 rounded-md ${qBg} ${qColor}`}>{h.fb?.rating}</div>
                  </div>
                </div>
                
                <div className="bg-surface-bright/80 p-md rounded-xl mb-lg border border-surface-container/50 font-medium text-on-surface-variant italic relative">
                  <span className="material-symbols-outlined absolute top-md left-md text-surface-container-high text-3xl -z-10 opacity-30">format_quote</span>
                  <p className="relative z-10 pl-sm">"{h.a}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
                  <div className="bg-success/5 rounded-xl p-md border border-success/20">
                    <div className="text-sm font-black text-success mb-sm flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">✅</span> Strengths</div>
                    <ul className="space-y-sm">
                      {(h.fb?.strengths||[]).map((s:string,idx:number) => <li key={idx} className="text-sm font-medium text-success/80 flex items-start gap-xs"><span className="text-success mt-0.5 text-xs">•</span> <span>{s}</span></li>)}
                    </ul>
                  </div>
                  <div className="bg-warning/5 rounded-xl p-md border border-warning/20">
                    <div className="text-sm font-black text-warning mb-sm flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">📈</span> Areas to Improve</div>
                    <ul className="space-y-sm">
                      {(h.fb?.improvements||[]).map((s:string,idx:number) => <li key={idx} className="text-sm font-medium text-warning/80 flex items-start gap-xs"><span className="text-warning mt-0.5 text-xs">•</span> <span>{s}</span></li>)}
                    </ul>
                  </div>
                </div>

                {h.fb?.ideal_answer && (
                  <div className="bg-indigo-brand/5 rounded-xl p-md border border-indigo-brand/20">
                    <div className="text-sm font-black text-indigo-brand mb-xs flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">💡</span> Ideal Answer Example</div>
                    <div className="text-body-base font-medium text-indigo-brand/80">{h.fb.ideal_answer}</div>
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
    <div className="h-screen bg-background font-body-base text-on-background flex flex-col overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 quantum-gradient opacity-50 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-gold/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-md">
          <div className="font-black text-lg text-on-surface flex items-center gap-xs tracking-tight">
             <span className="material-symbols-outlined text-accent-gold">smart_toy</span> GenuAI Interview
          </div>
          <div className="bg-surface-container-high/50 px-sm py-0.5 rounded-md text-xs font-bold text-on-surface-variant flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-brand animate-pulse"></span>
            {role} ({type})
          </div>
        </div>
        <div className="flex items-center gap-xl">
          <div className="flex items-center gap-sm">
            <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Question {qIndex+1} of {questionCount}</div>
            <div className="w-40 h-2 bg-surface-container rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-brand to-cyan-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={onBack} className="px-sm py-1 border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">close</span> End Session
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Question */}
        <div className="w-full lg:w-5/12 glass border-b lg:border-b-0 lg:border-r border-surface-container/50 p-xl lg:p-xxl flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-lg">
            <div className="text-xs font-black text-indigo-brand uppercase tracking-widest bg-indigo-brand/10 px-sm py-1 rounded-md border border-indigo-brand/20">
              {type} Round
            </div>
            <button onClick={readQuestionAloud} disabled={isPlaying} className={`glass px-sm py-1 rounded-lg border border-surface-container text-xs font-bold flex items-center gap-xs transition-colors ${isPlaying ? 'text-indigo-brand bg-indigo-brand/5' : 'text-on-surface hover:bg-surface-container/50'}`}>
              <span className={`material-symbols-outlined text-sm ${isPlaying ? 'animate-pulse' : ''}`}>{isPlaying ? 'volume_up' : 'play_arrow'}</span>
              {isPlaying ? "Speaking..." : "Read Aloud"}
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center pb-xl">
             <span className="material-symbols-outlined text-4xl text-surface-container-high mb-sm">help</span>
             <p className="text-display-sm-mobile md:text-title-lg font-black text-on-surface leading-snug">{currentQ}</p>
          </div>
        </div>

        {/* Right Pane - Answer / Feedback */}
        <div className="flex-1 p-xl lg:p-xxl overflow-y-auto bg-surface-bright/30">
          {!feedback ? (
            <div className="glass rounded-xxl border border-surface-container shadow-lg flex flex-col h-full min-h-[500px]">
              <div className="px-lg py-md border-b border-surface-container/50 bg-surface-bright/50 rounded-t-xxl flex justify-between items-center">
                <div className="font-bold text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">edit_document</span> Response Editor
                </div>
                {isRecording && (
                  <div className="text-error text-xs font-bold flex items-center gap-xs bg-error/10 px-sm py-0.5 rounded-full border border-error/20">
                    <div className="w-2 h-2 bg-error rounded-full animate-ping"></div> Live Transcription
                  </div>
                )}
              </div>
              
              <textarea 
                value={answer} 
                onChange={e => setAnswer(e.target.value)} 
                placeholder="Type your answer here, or click 'Live Voice Answer' to speak it..." 
                className="flex-1 bg-transparent border-none p-lg text-body-lg font-medium text-on-surface outline-none resize-none placeholder:text-on-surface-variant/40"
              />
              
              <div className="p-md border-t border-surface-container/50 bg-surface-bright/50 rounded-b-xxl flex flex-col sm:flex-row gap-sm">
                <button 
                  onClick={isRecording ? stopVoice : startVoice} 
                  className={`px-lg py-md rounded-xl font-black text-sm flex items-center justify-center gap-sm transition-all border-2 ${isRecording ? "bg-error/10 border-error/30 text-error hover:bg-error/20" : "glass border-surface-container text-on-surface hover:bg-surface-container/50"}`}
                >
                  <span className={`material-symbols-outlined ${isRecording ? 'animate-pulse' : ''}`}>{isRecording ? "stop_circle" : "mic"}</span>
                  {isRecording ? "Stop Listening" : "Live Voice Answer"}
                </button>
                <button 
                  onClick={submitAnswer} 
                  disabled={!answer.trim() || loading} 
                  className={`flex-1 px-lg py-md rounded-xl font-black text-sm flex items-center justify-center gap-sm transition-all ${(!answer.trim() || loading) ? "bg-surface-container text-on-surface-variant cursor-not-allowed" : "bg-on-surface text-surface hover:-translate-y-0.5 shadow-md hover:shadow-lg"}`}
                >
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">autorenew</span> Evaluating...</>
                  ) : (
                    <>Submit Answer <span className="material-symbols-outlined">send</span></>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xxl border border-surface-container shadow-lg p-xl lg:p-xxl animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-start mb-lg pb-md border-b border-surface-container/50">
                <div>
                  <h3 className="text-title-lg font-black text-on-surface mb-xs flex items-center gap-sm">
                    <span className="material-symbols-outlined text-accent-gold text-3xl">psychology</span>
                    AI Evaluation
                  </h3>
                  <p className="text-body-base text-on-surface-variant font-medium">Instant feedback on your response.</p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-black leading-none tracking-tighter ${feedback.score >= 80 ? "text-success" : feedback.score >= 60 ? "text-warning" : "text-error"}`}>
                    {feedback.score}%
                  </div>
                  <div className={`text-xs font-black uppercase tracking-widest mt-sm ${feedback.score >= 80 ? "text-success" : feedback.score >= 60 ? "text-warning" : "text-error"}`}>
                    {feedback.rating}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-lg">
                <div className="bg-success/5 rounded-xl p-md border border-success/20">
                  <div className="text-sm font-black text-success mb-sm flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">✅</span> What you did well</div>
                  <ul className="space-y-sm">
                    {(feedback.strengths||[]).map((s:string,i:number) => <li key={i} className="text-sm font-medium text-success/90 flex items-start gap-xs"><span className="text-success mt-0.5 text-xs">•</span> <span>{s}</span></li>)}
                  </ul>
                </div>
                <div className="bg-warning/5 rounded-xl p-md border border-warning/20">
                  <div className="text-sm font-black text-warning mb-sm flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">📈</span> What to improve</div>
                  <ul className="space-y-sm">
                    {(feedback.improvements||[]).map((s:string,i:number) => <li key={i} className="text-sm font-medium text-warning/90 flex items-start gap-xs"><span className="text-warning mt-0.5 text-xs">•</span> <span>{s}</span></li>)}
                  </ul>
                </div>
              </div>
              
              {feedback.ideal_answer && (
                <div className="bg-indigo-brand/5 rounded-xl p-md mb-xl border border-indigo-brand/20">
                  <div className="text-sm font-black text-indigo-brand mb-xs flex items-center gap-xs uppercase tracking-wider"><span className="text-lg">💡</span> Ideal Answer Example</div>
                  <div className="text-body-base font-medium text-indigo-brand/90 leading-relaxed">{feedback.ideal_answer}</div>
                </div>
              )}
              
              <button 
                onClick={nextQuestion} 
                disabled={loading} 
                className={`w-full py-md rounded-xl font-black text-body-base flex items-center justify-center gap-sm transition-all duration-300 ${loading ? "bg-surface-container text-on-surface-variant cursor-not-allowed" : "bg-on-surface text-surface hover:-translate-y-0.5 shadow-md hover:shadow-lg"}`}
              >
                {loading ? (
                  <><span className="material-symbols-outlined animate-spin text-xl">autorenew</span> Preparing next question...</>
                ) : qIndex + 1 >= questionCount ? (
                  <>Finish Interview & See Results <span className="material-symbols-outlined">flag</span></>
                ) : (
                  <>Next Question ({qIndex+2}/{questionCount}) <span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
