import { useState } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const LANGUAGES = [
  { code: "en-US", label: "English (US)", native: "English" },
  { code: "hi-IN", label: "Hindi (India)", native: "हिंदी" },
  { code: "ta-IN", label: "Tamil (India)", native: "தமிழ்" },
  { code: "zh-CN", label: "Mandarin (China)", native: "中文" },
  { code: "ja-JP", label: "Japanese (Japan)", native: "日本語" },
  { code: "es-ES", label: "Spanish (Spain)", native: "Español" },
  { code: "fr-FR", label: "French (France)", native: "Français" },
];

const TOPICS = [
  { id: "binary-search", category: "DSA", title: "Binary Search Algorithm", icon: "🔍", videoId: "P3YJC7G_A9g", prompt: "Explain the Binary Search algorithm. How does it work? What is its time complexity? Provide a simple code example." },
  { id: "dp", category: "DSA", title: "Dynamic Programming", icon: "🧠", videoId: "oBt53YbR9Kk", prompt: "Explain Dynamic Programming (Memoization and Tabulation). Why is it useful? Give a classic example like Fibonacci." },
  { id: "system-design", category: "Architecture", title: "Load Balancing", icon: "⚖️", videoId: "bBTPZ9NdSk8", prompt: "Explain Load Balancing in System Design. What is it, why do we need it, and what are the common algorithms (e.g., Round Robin)?" },
  { id: "behavioral", category: "Interview Prep", title: "The STAR Method", icon: "⭐", videoId: "WrlxU1D0Bmc", prompt: "Explain the STAR method for behavioral interviews (Situation, Task, Action, Result). Give a brief example of how to use it." },
];

export default function InclusiveLearningHub({ user, onBack }: Props) {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [activeTopic, setActiveTopic] = useState<typeof TOPICS[0] | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchLesson = async (topic: typeof TOPICS[0], lang: typeof LANGUAGES[0]) => {
    setActiveTopic(topic);
    setLoading(true);
    setContent("");
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const prompt = `You are an expert tech educator. 
The student is learning about: "${topic.title}".
Instruction: ${topic.prompt}
CRITICAL: You must explain the entire concept strictly in the ${lang.native} language. 
Only the code snippets (if any) should remain in standard English syntax.
Format the output using simple Markdown (## headers, **bold**, and \`\`\` for code).`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 800
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setContent(res.data.choices[0].message.content);
    } catch (e) {
      console.error(e);
      setContent("Failed to generate content. Please check your API key and internet connection.");
    }
    setLoading(false);
  };

  const handleLanguageChange = (code: string) => {
    const newLang = LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
    setLanguage(newLang);
    if (activeTopic) {
      // Re-fetch the current topic in the new language
      fetchLesson(activeTopic, newLang);
    }
  };

  const playVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    // Strip markdown characters for better text-to-speech reading
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
            <div style={{ fontSize:"13px", color:"#64748B", fontWeight:"500", marginTop:"2px" }}>Multimodal AI Education (Video, Text & Voice)</div>
          </div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#F8FAFC", padding:"6px 12px", borderRadius:"12px", border:"1px solid #E2E8F0" }}>
            <span style={{ fontSize:"16px" }}>🌐</span>
            <select value={language.code} onChange={e => handleLanguageChange(e.target.value)} style={{ background:"transparent", border:"none", fontSize:"14px", fontWeight:"700", color:"#0F172A", cursor:"pointer", outline:"none" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} - {l.native}</option>)}
            </select>
          </div>
          <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} style={{ padding:"8px 16px", border:"1.5px solid #E2E8F0", borderRadius:"10px", background:"#fff", fontSize:"13px", color:"#475569", cursor:"pointer", fontWeight:"700", transition:"all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#F1F5F9"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            Exit Hub
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", padding:"32px", gap:"32px", maxWidth:"1400px", margin:"0 auto", width:"100%" }}>
        
        {/* Left Sidebar: Topics */}
        <div style={{ width:"320px", display:"flex", flexDirection:"column", gap:"24px", flexShrink:0 }}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"24px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize:"15px", fontWeight:"800", color:"#0F172A", margin:"0 0 16px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Curated Topics</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {TOPICS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => fetchLesson(t, language)}
                  style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"16px", background:activeTopic?.id === t.id ? "#FEF3C7" : "#F8FAFC", border:activeTopic?.id === t.id ? "1.5px solid #F59E0B" : "1px solid #E2E8F0", borderRadius:"14px", cursor:"pointer", textAlign:"left", transition:"all 0.2s", width:"100%" }}
                >
                  <div style={{ fontSize:"24px", background:"#fff", padding:"8px", borderRadius:"10px", boxShadow:"0 2px 4px rgba(0,0,0,0.05)" }}>{t.icon}</div>
                  <div>
                    <div style={{ color:activeTopic?.id===t.id ? "#B45309" : "#64748B", fontSize:"11px", fontWeight:"800", textTransform:"uppercase", marginBottom:"4px" }}>{t.category}</div>
                    <div style={{ color:"#0F172A", fontWeight:"700", fontSize:"14px", lineHeight:"1.4" }}>{t.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ background:"linear-gradient(135deg,#D97706,#B45309)", borderRadius:"20px", padding:"24px", color:"#fff", boxShadow:"0 8px 24px rgba(217,119,6,0.3)" }}>
            <div style={{ fontSize:"28px", marginBottom:"12px" }}>💡</div>
            <div style={{ fontWeight:"800", fontSize:"16px", marginBottom:"8px" }}>Native Learning NLP</div>
            <div style={{ fontSize:"13px", lineHeight:"1.6", opacity:0.9 }}>
              Cognitive load is vastly reduced when complex technical concepts are introduced in your mother tongue. Use the globe icon above to switch languages instantly.
            </div>
          </div>
        </div>

        {/* Right Content Area: Multimodal Lesson */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"24px" }}>
          {!activeTopic ? (
            <div style={{ background:"#fff", borderRadius:"24px", padding:"60px 40px", border:"1px dashed #CBD5E1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", flex:1 }}>
              <div style={{ fontSize:"64px", marginBottom:"24px" }}>📚</div>
              <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#0F172A", marginBottom:"12px" }}>Select a topic to begin learning</h2>
              <p style={{ color:"#64748B", fontSize:"15px", maxWidth:"400px", lineHeight:"1.6" }}>
                Experience our multimodal learning engine. Every lesson includes a video tutorial, native language AI translation, and text-to-speech voice playback.
              </p>
            </div>
          ) : (
            <>
              {/* Multimodal Top Row: Video + Controls */}
              <div style={{ display:"flex", gap:"24px", height:"340px" }}>
                {/* Video Player */}
                <div style={{ flex:1, background:"#000", borderRadius:"24px", overflow:"hidden", boxShadow:"0 10px 25px rgba(0,0,0,0.1)" }}>
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${activeTopic.videoId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                
                {/* AI Voice & Language Control Panel */}
                <div style={{ width:"300px", background:"#fff", borderRadius:"24px", padding:"28px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", flexDirection:"column" }}>
                  <div style={{ fontWeight:"800", color:"#0F172A", fontSize:"18px", marginBottom:"8px" }}>AI Voice Tutor</div>
                  <div style={{ color:"#64748B", fontSize:"13px", marginBottom:"24px", lineHeight:"1.5" }}>Listen to the explanation aloud in <strong>{language.native}</strong> using NLP text-to-speech.</div>
                  
                  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#F8FAFC", borderRadius:"16px", border:"1px solid #F1F5F9", marginBottom:"24px" }}>
                    <div style={{ fontSize:"48px", animation:isPlaying ? "pulse 1.5s infinite" : "none", transition:"transform 0.2s" }}>🗣️</div>
                  </div>

                  <button onClick={playVoice} disabled={loading || !content} style={{ width:"100%", padding:"16px", background:isPlaying?"#FEF2F2":"#0F172A", color:isPlaying?"#DC2626":"#fff", border:isPlaying?"2px solid #FCA5A5":"none", borderRadius:"14px", fontWeight:"800", fontSize:"15px", cursor:(loading||!content)?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all 0.2s", boxShadow:isPlaying?"none":"0 4px 12px rgba(15,23,42,0.2)" }}>
                    {isPlaying ? "⏹ Stop Speaking" : "▶ Read Aloud"}
                  </button>
                </div>
              </div>

              {/* Text Translation Area */}
              <div style={{ background:"#fff", borderRadius:"24px", padding:"40px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", flex:1, overflowY:"auto" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px", paddingBottom:"20px", borderBottom:"1px solid #F1F5F9" }}>
                  <span style={{ fontSize:"24px" }}>📝</span>
                  <div>
                    <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#0F172A", margin:0 }}>{activeTopic.title}</h2>
                    <div style={{ color:"#2563EB", fontSize:"13px", fontWeight:"700", marginTop:"4px" }}>AI Translated Concept ({language.native})</div>
                  </div>
                </div>

                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px" }}>
                    <div style={{ width:"40px", height:"40px", border:"4px solid #E2E8F0", borderTop:"4px solid #D97706", borderRadius:"50%", animation:"spin 1s linear infinite", marginBottom:"16px" }}></div>
                    <div style={{ color:"#64748B", fontWeight:"600", fontSize:"14px" }}>NLP Engine translating concept to {language.native}...</div>
                  </div>
                ) : (
                  <div className="markdown-body" style={{ color:"#334155", fontSize:"16px", lineHeight:"1.8" }}>
                    {/* Basic Markdown parsing for the UI */}
                    {content ? content.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) return <h4 key={i} style={{ color:"#0F172A", marginTop:"24px", marginBottom:"12px", fontSize:"18px", fontWeight:"800" }}>{line.replace('### ','')}</h4>;
                      if (line.startsWith('## ')) return <h3 key={i} style={{ color:"#0F172A", marginTop:"28px", marginBottom:"16px", fontSize:"22px", fontWeight:"900" }}>{line.replace('## ','')}</h3>;
                      if (line.startsWith('# ')) return <h2 key={i} style={{ color:"#0F172A", marginTop:"32px", marginBottom:"20px", fontSize:"26px", fontWeight:"900" }}>{line.replace('# ','')}</h2>;
                      if (line.startsWith('```')) return <div key={i} style={{ background:"#0F172A", color:"#E2E8F0", padding:"16px", borderRadius:"12px", fontFamily:"monospace", fontSize:"14px", overflowX:"auto", margin:"16px 0" }}>Code Snippet</div>; // Note: In a real app we'd use a markdown parser library, keeping it simple here.
                      if (line.trim() === '') return <br key={i} />;
                      // Bold parsing
                      const boldParts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i} style={{ marginBottom:"12px" }}>
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
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
