import { useState } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const LANGUAGES = [
  { code: "en-US", label: "English (US)", native: "English" },
  { code: "hi-IN", label: "Hindi (India)", native: "हिंदी" },
  { code: "ta-IN", label: "Tamil (India)", native: "தமிழ்" },
  { code: "te-IN", label: "Telugu (India)", native: "తెలుగు" },
  { code: "zh-CN", label: "Mandarin (China)", native: "中文" },
  { code: "ja-JP", label: "Japanese (Japan)", native: "日本語" },
  { code: "es-ES", label: "Spanish (Spain)", native: "Español" },
  { code: "fr-FR", label: "French (France)", native: "Français" },
];

interface Module { id: string; title: string; description: string; }

export default function InclusiveLearningHub({ user, onBack }: Props) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  
  const [syllabus, setSyllabus] = useState<Module[]>([]);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  
  const [content, setContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const generateSyllabus = async () => {
    if (!searchQuery.trim()) return;
    setSyllabusLoading(true);
    setSyllabus([]);
    setActiveModule(null);
    setContent("");
    setCurrentSkill(searchQuery.trim());
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const prompt = `The user wants to learn about the skill/concept: "${searchQuery}". 
Generate a comprehensive 5-module learning syllabus covering this topic from beginner to advanced. 
Return the result strictly as a JSON object with this exact format:
{
  "modules": [
    { "id": "m1", "title": "Module Title", "description": "Brief 1-sentence description" }
  ]
}`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, max_tokens: 500, response_format: { type: "json_object" }
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      const data = JSON.parse(res.data.choices[0].message.content);
      setSyllabus(data.modules || []);
    } catch (e) {
      console.error(e);
      alert("Failed to generate syllabus. Please check your API key.");
    }
    setSyllabusLoading(false);
  };

  const fetchLesson = async (mod: Module, lang: typeof LANGUAGES[0]) => {
    setActiveModule(mod);
    setLessonLoading(true);
    setContent("");
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const prompt = `You are an expert tech educator. 
The student is learning the overall skill: "${currentSkill}".
The specific module is: "${mod.title}" - ${mod.description}.

CRITICAL INSTRUCTION: You MUST explain this concept entirely in the ${lang.native} language. 
Use simple analogies. If code is needed, keep the code snippets in standard English syntax.
Format the output using simple Markdown (## headers, **bold**, and \`\`\` for code).`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, max_tokens: 1000
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setContent(res.data.choices[0].message.content);
    } catch (e) {
      console.error(e);
      setContent("Failed to generate lesson content. Please check your API key and internet connection.");
    }
    setLessonLoading(false);
  };

  const handleLanguageChange = (code: string) => {
    const newLang = LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
    setLanguage(newLang);
    if (activeModule) {
      fetchLesson(activeModule, newLang);
    }
  };

  const playVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const cleanText = content.replace(/[#*`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language.code;
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column" }}>
      
      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 4px rgba(0,0,0,0.03)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ background:"#FFFBEB", padding:"10px", borderRadius:"12px", fontSize:"24px", border:"1px solid #FEF3C7" }}>🧠</div>
          <div>
            <div style={{ fontWeight:"900", fontSize:"18px", color:"#0F172A" }}>Inclusive Learning Hub</div>
            <div style={{ fontSize:"13px", color:"#64748B", fontWeight:"500", marginTop:"2px" }}>Dynamic AI Education Engine</div>
          </div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"24px", flex:1, maxWidth:"500px", margin:"0 32px" }}>
          <div style={{ display:"flex", width:"100%", background:"#F8FAFC", borderRadius:"12px", border:"1px solid #E2E8F0", overflow:"hidden" }}>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && generateSyllabus()}
              placeholder="What do you want to learn? (e.g. React Hooks, System Design, DevOps)" 
              style={{ flex:1, padding:"12px 16px", border:"none", background:"transparent", outline:"none", fontSize:"14px", color:"#0F172A" }}
            />
            <button onClick={generateSyllabus} disabled={syllabusLoading || !searchQuery.trim()} style={{ background:"#0F172A", color:"#fff", border:"none", padding:"0 24px", fontWeight:"700", cursor:(syllabusLoading||!searchQuery.trim())?"not-allowed":"pointer" }}>
              {syllabusLoading ? "Searching..." : "Learn"}
            </button>
          </div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#F8FAFC", padding:"6px 12px", borderRadius:"12px", border:"1px solid #E2E8F0" }}>
            <span style={{ fontSize:"16px" }}>🌐</span>
            <select value={language.code} onChange={e => handleLanguageChange(e.target.value)} style={{ background:"transparent", border:"none", fontSize:"14px", fontWeight:"700", color:"#0F172A", cursor:"pointer", outline:"none" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} - {l.native}</option>)}
            </select>
          </div>
          <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} style={{ padding:"8px 16px", border:"1.5px solid #E2E8F0", borderRadius:"10px", background:"#fff", fontSize:"13px", color:"#475569", cursor:"pointer", fontWeight:"700" }}>
            Exit Hub
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", padding:"32px", gap:"32px", maxWidth:"1500px", margin:"0 auto", width:"100%" }}>
        
        {/* Left Sidebar: Dynamic Syllabus */}
        <div style={{ width:"340px", display:"flex", flexDirection:"column", gap:"24px", flexShrink:0 }}>
          
          <div style={{ background:"linear-gradient(135deg,#2563EB,#1E40AF)", borderRadius:"20px", padding:"24px", color:"#fff", boxShadow:"0 8px 24px rgba(37,99,235,0.2)" }}>
            <div style={{ fontSize:"28px", marginBottom:"12px" }}>🤖</div>
            <div style={{ fontWeight:"800", fontSize:"16px", marginBottom:"8px" }}>AI Dynamic Syllabus</div>
            <div style={{ fontSize:"13px", lineHeight:"1.6", opacity:0.9 }}>
              Search for any skill. The AI generates a structured syllabus and explains concepts natively to reduce cognitive load.
            </div>
          </div>

          {syllabus.length > 0 && (
            <div style={{ background:"#fff", borderRadius:"20px", padding:"24px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
              <h3 style={{ fontSize:"14px", fontWeight:"800", color:"#0F172A", margin:"0 0 16px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{currentSkill} Syllabus</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {syllabus.map((mod, index) => (
                  <button 
                    key={mod.id} 
                    onClick={() => fetchLesson(mod, language)}
                    style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"16px", background:activeModule?.id === mod.id ? "#EFF6FF" : "#F8FAFC", border:activeModule?.id === mod.id ? "1.5px solid #3B82F6" : "1px solid #E2E8F0", borderRadius:"14px", cursor:"pointer", textAlign:"left", transition:"all 0.2s", width:"100%" }}
                  >
                    <div style={{ fontSize:"16px", fontWeight:"900", color:activeModule?.id===mod.id?"#2563EB":"#94A3B8", background:"#fff", padding:"4px 10px", borderRadius:"8px", boxShadow:"0 2px 4px rgba(0,0,0,0.05)" }}>{index+1}</div>
                    <div>
                      <div style={{ color:"#0F172A", fontWeight:"700", fontSize:"14px", lineHeight:"1.4", marginBottom:"4px" }}>{mod.title}</div>
                      <div style={{ color:"#64748B", fontSize:"11px", lineHeight:"1.5" }}>{mod.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area: Multimodal Lesson */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"24px" }}>
          {!activeModule ? (
            <div style={{ background:"#fff", borderRadius:"24px", padding:"60px 40px", border:"1px dashed #CBD5E1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", flex:1 }}>
              <div style={{ fontSize:"64px", marginBottom:"24px" }}>🔍</div>
              <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", marginBottom:"12px" }}>Search to generate a syllabus</h2>
              <p style={{ color:"#64748B", fontSize:"15px", maxWidth:"450px", lineHeight:"1.6" }}>
                Enter a topic above (e.g. "REST APIs", "Machine Learning Basics") and select a module to generate an AI Native Language lesson with Voice and Visual references.
              </p>
            </div>
          ) : (
            <>
              {/* Visual Learning Row (YouTube/Search Integration) */}
              <div style={{ background:"#fff", borderRadius:"24px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <span style={{ fontSize:"24px" }}>📺</span>
                    <h2 style={{ fontSize:"18px", fontWeight:"800", color:"#0F172A", margin:0 }}>Visual Learning</h2>
                  </div>
                  <div style={{ color:"#64748B", fontSize:"14px", lineHeight:"1.6" }}>Find the best video tutorials for <strong>{activeModule.title}</strong> in {language.native}.</div>
                </div>
                <div style={{ display:"flex", gap:"12px" }}>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activeModule.title} in ${language.native}`)}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none", padding:"14px 24px", background:"#FEF2F2", color:"#DC2626", border:"1px solid #FCA5A5", borderRadius:"12px", fontWeight:"800", fontSize:"14px", display:"flex", alignItems:"center", gap:"8px", transition:"transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                    ▶ Search YouTube
                  </a>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(`${activeModule.title} tutorial in ${language.native}`)}`} target="_blank" rel="noreferrer" style={{ textDecoration:"none", padding:"14px 24px", background:"#F8FAFC", color:"#475569", border:"1px solid #E2E8F0", borderRadius:"12px", fontWeight:"800", fontSize:"14px", display:"flex", alignItems:"center", gap:"8px", transition:"transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                    🔍 Google Search
                  </a>
                </div>
              </div>

              {/* Text/Voice Translation Area */}
              <div style={{ background:"#fff", borderRadius:"24px", padding:"40px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
                
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"32px", paddingBottom:"24px", borderBottom:"1px solid #F1F5F9" }}>
                  <div>
                    <h2 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:"0 0 8px" }}>{activeModule.title}</h2>
                    <div style={{ color:"#2563EB", fontSize:"14px", fontWeight:"700", display:"flex", alignItems:"center", gap:"6px" }}>
                      <span className="pulse-dot" style={{ width:"8px", height:"8px", background:"#2563EB", borderRadius:"50%", display:"inline-block" }}></span>
                      AI Generated Content ({language.native})
                    </div>
                  </div>
                  <button onClick={playVoice} disabled={lessonLoading || !content} style={{ padding:"12px 24px", background:isPlaying?"#FEF2F2":"#0F172A", color:isPlaying?"#DC2626":"#fff", border:isPlaying?"1px solid #FCA5A5":"none", borderRadius:"12px", fontWeight:"800", fontSize:"14px", cursor:(lessonLoading||!content)?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.2s", boxShadow:isPlaying?"none":"0 4px 12px rgba(15,23,42,0.2)" }}>
                    {isPlaying ? "⏹ Stop Voice Tutor" : "🗣️ Listen Aloud"}
                  </button>
                </div>

                {lessonLoading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, padding:"40px" }}>
                    <div style={{ width:"48px", height:"48px", border:"4px solid #E2E8F0", borderTop:"4px solid #2563EB", borderRadius:"50%", animation:"spin 1s linear infinite", marginBottom:"16px" }}></div>
                    <div style={{ color:"#0F172A", fontWeight:"800", fontSize:"16px", marginBottom:"4px" }}>Generating Module...</div>
                    <div style={{ color:"#64748B", fontSize:"14px" }}>NLP Engine translating concept to {language.native}</div>
                  </div>
                ) : (
                  <div className="markdown-body" style={{ color:"#334155", fontSize:"16px", lineHeight:"1.8" }}>
                    {content ? content.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) return <h4 key={i} style={{ color:"#0F172A", marginTop:"24px", marginBottom:"12px", fontSize:"18px", fontWeight:"800" }}>{line.replace('### ','')}</h4>;
                      if (line.startsWith('## ')) return <h3 key={i} style={{ color:"#0F172A", marginTop:"32px", marginBottom:"16px", fontSize:"22px", fontWeight:"900" }}>{line.replace('## ','')}</h3>;
                      if (line.startsWith('# ')) return <h2 key={i} style={{ color:"#0F172A", marginTop:"32px", marginBottom:"20px", fontSize:"26px", fontWeight:"900" }}>{line.replace('# ','')}</h2>;
                      if (line.startsWith('```')) return <div key={i} style={{ background:"#0F172A", color:"#E2E8F0", padding:"20px", borderRadius:"12px", fontFamily:"monospace", fontSize:"14px", overflowX:"auto", margin:"20px 0", boxShadow:"inset 0 2px 4px rgba(0,0,0,0.2)" }}>// Code block formatting active</div>; 
                      if (line.trim() === '') return <br key={i} />;
                      
                      const boldParts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i} style={{ marginBottom:"14px" }}>
                          {boldParts.map((part, j) => 
                            part.startsWith('**') && part.endsWith('**') ? 
                            <strong key={j} style={{ color:"#0F172A", fontWeight:"700" }}>{part.slice(2,-2)}</strong> : 
                            part
                          )}
                        </p>
                      );
                    }) : "No content generated."}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .pulse-dot { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}
