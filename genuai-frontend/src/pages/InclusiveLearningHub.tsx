import { useState } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const LANGUAGES = [
  { code: "en-US", label: "English (US)", native: "English" },
  { code: "hi-IN", label: "Hindi (India)", native: "हिंदी" },
  { code: "es-ES", label: "Spanish (Spain)", native: "Español" },
  { code: "fr-FR", label: "French (France)", native: "Français" },
  { code: "zh-CN", label: "Mandarin (China)", native: "中文" },
  { code: "ar-SA", label: "Arabic (Saudi Arabia)", native: "العربية" },
  { code: "ru-RU", label: "Russian (Russia)", native: "Русский" },
  { code: "pt-BR", label: "Portuguese (Brazil)", native: "Português" },
  { code: "de-DE", label: "German (Germany)", native: "Deutsch" },
  { code: "ja-JP", label: "Japanese (Japan)", native: "日本語" },
  { code: "ko-KR", label: "Korean (South Korea)", native: "한국어" },
  { code: "it-IT", label: "Italian (Italy)", native: "Italiano" },
  { code: "tr-TR", label: "Turkish (Turkey)", native: "Türkçe" },
  { code: "vi-VN", label: "Vietnamese (Vietnam)", native: "Tiếng Việt" },
  { code: "ta-IN", label: "Tamil (India)", native: "தமிழ்" },
  { code: "te-IN", label: "Telugu (India)", native: "తెలుగు" },
  { code: "bn-IN", label: "Bengali (India)", native: "বাংলা" },
  { code: "ur-PK", label: "Urdu (Pakistan)", native: "اردو" },
  { code: "sw-KE", label: "Swahili (Kenya)", native: "Kiswahili" },
  { code: "nl-NL", label: "Dutch (Netherlands)", native: "Nederlands" },
  { code: "el-GR", label: "Greek (Greece)", native: "Ελληνικά" },
  { code: "he-IL", label: "Hebrew (Israel)", native: "עברית" },
  { code: "pl-PL", label: "Polish (Poland)", native: "Polski" },
  { code: "th-TH", label: "Thai (Thailand)", native: "ไทย" },
  { code: "id-ID", label: "Indonesian (Indonesia)", native: "Bahasa Indonesia" },
  { code: "ms-MY", label: "Malay (Malaysia)", native: "Bahasa Melayu" },
  { code: "tl-PH", label: "Tagalog (Philippines)", native: "Tagalog" },
  { code: "sv-SE", label: "Swedish (Sweden)", native: "Svenska" },
  { code: "da-DK", label: "Danish (Denmark)", native: "Dansk" },
  { code: "no-NO", label: "Norwegian (Norway)", native: "Norsk" },
  { code: "fi-FI", label: "Finnish (Finland)", native: "Suomi" },
  { code: "cs-CZ", label: "Czech (Czechia)", native: "Čeština" },
  { code: "hu-HU", label: "Hungarian (Hungary)", native: "Magyar" },
  { code: "ro-RO", label: "Romanian (Romania)", native: "Română" },
  { code: "uk-UA", label: "Ukrainian (Ukraine)", native: "Українська" },
  { code: "ml-IN", label: "Malayalam (India)", native: "മലയാളം" },
  { code: "kn-IN", label: "Kannada (India)", native: "ಕನ್ನಡ" },
  { code: "mr-IN", label: "Marathi (India)", native: "मराठी" },
  { code: "gu-IN", label: "Gujarati (India)", native: "ગુજરાતી" },
  { code: "pa-IN", label: "Punjabi (India)", native: "ਪੰਜਾਬੀ" }
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

  const generateSyllabus = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;
    
    if (overrideQuery) setSearchQuery(overrideQuery);

    setSyllabusLoading(true);
    setSyllabus([]);
    setActiveModule(null);
    setContent("");
    setCurrentSkill(query.trim());
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const prompt = `The user wants to learn about the skill/concept: "${query}". 
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
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
      {/* Decorative */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-brand/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-gold/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-20 glass border-b border-surface-container/50 px-xl py-sm flex items-center justify-between shadow-sm sticky top-0">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 bg-indigo-brand/10 rounded-xl border border-indigo-brand/20 flex items-center justify-center overflow-hidden">
            <img src="/icons/learning_brain.png" alt="Brain" className="w-full h-full object-cover mix-blend-multiply" />
          </div>
          <div className="hidden sm:block">
            <div className="font-black text-lg text-on-surface">Inclusive Learning Hub</div>
            <div className="text-xs text-on-surface-variant font-bold mt-0.5">Dynamic AI Education Engine</div>
          </div>
        </div>
        
        <div className="flex items-center gap-md flex-1 max-w-[500px] mx-xl">
          <div className="flex w-full bg-surface-bright/50 rounded-xl border border-surface-container overflow-hidden shadow-inner group focus-within:border-indigo-brand/50 focus-within:bg-surface-bright transition-colors">
            <div className="pl-sm flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && generateSyllabus()}
              placeholder="What do you want to learn? (e.g. React Hooks)" 
              className="flex-1 py-sm px-sm border-none bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50"
            />
            <button 
              onClick={() => generateSyllabus()} 
              disabled={syllabusLoading || !searchQuery.trim()} 
              className="bg-indigo-brand text-white border-none px-md font-bold text-sm disabled:bg-surface-container disabled:text-on-surface-variant transition-colors hover:bg-indigo-brand/90"
            >
              {syllabusLoading ? <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span> : "Learn"}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs bg-surface-bright/50 px-sm py-1 rounded-xl border border-surface-container shadow-sm">
            <span className="material-symbols-outlined text-indigo-brand text-[20px]">public</span>
            <select 
              value={language.code} 
              onChange={e => handleLanguageChange(e.target.value)} 
              className="bg-transparent border-none text-sm font-bold text-on-surface cursor-pointer outline-none w-full appearance-none pr-sm"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-on-surface bg-surface-bright">{l.label} - {l.native}</option>)}
            </select>
          </div>
          <button 
            onClick={() => { window.speechSynthesis.cancel(); onBack(); }} 
            className="px-sm py-1.5 border border-surface-container-high rounded-xl bg-transparent text-xs text-on-surface-variant font-bold hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">exit_to_app</span> Exit Hub
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row px-margin-mobile md:px-margin-desktop py-xl gap-xl max-w-screen-2xl mx-auto w-full">
        
        {/* Left Sidebar: Dynamic Syllabus */}
        <div className="w-full lg:w-[360px] flex flex-col gap-lg flex-shrink-0">
          
          <div className="bg-gradient-to-br from-indigo-brand to-indigo-800 rounded-xxxl p-lg text-white shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
            <div className="w-12 h-12 mb-sm overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1">
              <img src="/icons/ai_mock_interview.png" alt="AI" className="w-full h-full object-cover mix-blend-screen opacity-90" />
            </div>
            <div className="font-black text-lg mb-xs relative z-10">AI Dynamic Syllabus</div>
            <div className="text-xs font-medium leading-relaxed opacity-90 relative z-10">
              Search for any skill. The AI generates a structured syllabus and explains concepts natively to reduce cognitive load.
            </div>
          </div>

          {syllabus.length > 0 ? (
            <div className="glass rounded-xxxl p-lg border border-surface-container shadow-sm flex-1 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
              <h3 className="text-xs font-black text-on-surface-variant mb-md uppercase tracking-widest flex items-center gap-xs sticky top-0 bg-background/80 backdrop-blur-md py-1 z-10">
                <span className="material-symbols-outlined text-[16px]">menu_book</span> {currentSkill} Syllabus
              </h3>
              <div className="flex flex-col gap-sm">
                {syllabus.map((mod, index) => (
                  <button 
                    key={mod.id} 
                    onClick={() => fetchLesson(mod, language)}
                    className={`flex items-start gap-md p-md rounded-xl cursor-pointer text-left transition-all duration-200 border-2 ${activeModule?.id === mod.id ? 'border-indigo-brand bg-indigo-brand/5 shadow-sm transform -translate-y-0.5' : 'border-transparent bg-surface-bright/50 hover:bg-surface-container/50'}`}
                  >
                    <div className={`text-sm font-black w-8 h-8 flex items-center justify-center shrink-0 rounded-lg shadow-sm border ${activeModule?.id === mod.id ? 'bg-indigo-brand text-white border-indigo-brand' : 'bg-white text-on-surface-variant border-surface-container'}`}>{index+1}</div>
                    <div>
                      <div className={`font-bold text-sm leading-snug mb-0.5 ${activeModule?.id === mod.id ? 'text-indigo-brand' : 'text-on-surface'}`}>{mod.title}</div>
                      <div className="text-xs font-medium text-on-surface-variant line-clamp-2 leading-relaxed">{mod.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xxxl p-lg border border-surface-container shadow-sm flex-1 overflow-y-auto custom-scrollbar">
               <h3 className="text-xs font-black text-on-surface-variant mb-md uppercase tracking-widest flex items-center gap-xs">
                 <span className="material-symbols-outlined text-[16px]">local_fire_department</span> Popular Topics
               </h3>
               <div className="flex flex-col gap-xs">
                 {["System Design", "Dynamic Programming", "React Hooks", "Docker Basics", "Microservices", "Machine Learning", "GraphQL APIs", "Cybersecurity", "Blockchain Basics", "Kubernetes", "AWS Cloud Concepts"].map(t => (
                    <button 
                      key={t} 
                      onClick={() => generateSyllabus(t)} 
                      className="px-md py-sm bg-surface-bright/50 border border-transparent hover:border-surface-container rounded-xl text-left cursor-pointer font-bold text-sm text-on-surface hover:bg-surface-container/30 transition-all flex justify-between items-center group"
                    >
                      <span>{t}</span>
                      <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity text-[18px]">arrow_forward</span>
                    </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Right Content Area: Multimodal Lesson */}
        <div className="flex-1 flex flex-col gap-lg overflow-hidden">
          {!activeModule ? (
            <div className="glass rounded-xxxl p-xl lg:p-xxl border border-surface-container shadow-lg flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="w-16 h-16 mb-lg overflow-hidden rounded-2xl bg-indigo-brand/10 p-2 border border-indigo-brand/20">
                <img src="/icons/icon_globe.png" alt="Globe" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <h2 className="text-display-sm-mobile md:text-display-sm-desktop font-black text-on-surface mb-md tracking-tight">Welcome to the <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-brand to-purple-500">Inclusive Learning Hub</span></h2>
              <p className="text-body-lg text-on-surface-variant/90 font-medium leading-relaxed max-w-3xl mb-xl">
                This AI-powered education engine is designed to dramatically lower your cognitive load. By learning complex engineering concepts in your Native Language first, you can increase retention and grasp abstract logic significantly faster. Currently supporting {LANGUAGES.length} global languages!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
                <div className="bg-indigo-brand/5 p-md rounded-2xl border border-indigo-brand/20">
                  <div className="w-10 h-10 mb-sm overflow-hidden rounded-xl bg-indigo-brand/10 p-1">
                    <img src="/icons/svar_mic.png" alt="Mic" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="font-black text-body-base text-indigo-brand mb-xs">Native NLP</div>
                  <div className="text-sm font-medium text-indigo-brand/80 leading-relaxed">Lessons are dynamically generated and translated into {LANGUAGES.length} languages on the fly.</div>
                </div>
                <div className="bg-success/5 p-md rounded-2xl border border-success/20">
                  <div className="w-10 h-10 mb-sm overflow-hidden rounded-xl bg-success/10 p-1">
                    <img src="/icons/icon_tv.png" alt="TV" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="font-black text-body-base text-success mb-xs">Visual Searching</div>
                  <div className="text-sm font-medium text-success/80 leading-relaxed">We automatically query YouTube for the best localized video tutorials based on your exact module.</div>
                </div>
                <div className="bg-error/5 p-md rounded-2xl border border-error/20">
                  <div className="w-10 h-10 mb-sm overflow-hidden rounded-xl bg-error/10 p-1 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-2xl">record_voice_over</span>
                  </div>
                  <div className="font-black text-body-base text-error mb-xs">Text-to-Speech</div>
                  <div className="text-sm font-medium text-error/80 leading-relaxed">Listen to the AI tutor read the explanations aloud natively using browser synthesis technology.</div>
                </div>
              </div>

              {/* Popular Topics Grid to fill space */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-title-lg font-black text-on-surface mb-md">Featured Learning Tracks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
                  {[
                    { icon: "science", title: "React Fundamentals", desc: "Hooks, State, & Props", color: "info" },
                    { icon: "directions_boat", title: "Docker Mastery", desc: "Containers & Images", color: "indigo-brand" },
                    { icon: "account_tree", title: "System Design", desc: "Scale & Architecture", color: "success" },
                    { icon: "security", title: "Cybersecurity", desc: "Threats & Defenses", color: "error" },
                    { icon: "code_blocks", title: "Python Basics", desc: "Syntax & Structures", color: "warning-dark" },
                    { icon: "psychology", title: "Machine Learning", desc: "Models & Training", color: "purple-500" },
                    { icon: "cloud", title: "AWS Cloud", desc: "EC2, S3, & VPCs", color: "accent-gold" },
                    { icon: "bolt", title: "GraphQL", desc: "Queries & Mutations", color: "pink-500" }
                  ].map(track => (
                    <button 
                      key={track.title} 
                      onClick={() => generateSyllabus(track.title)} 
                      className="bg-surface-bright/50 border border-surface-container p-md rounded-2xl text-left cursor-pointer hover:shadow-md hover:bg-surface-container/30 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-${track.color}/10 text-${track.color} flex items-center justify-center mb-sm group-hover:scale-110 transition-transform`}>
                         <span className="material-symbols-outlined text-2xl">{track.icon}</span>
                      </div>
                      <div className="font-bold text-on-surface text-sm mb-xs">{track.title}</div>
                      <div className="text-on-surface-variant text-xs font-medium">{track.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <>
              {/* Visual Learning Row (YouTube/Search Integration) */}
              <div className="glass rounded-2xl p-md border border-surface-container shadow-sm flex flex-col sm:flex-row items-center justify-between gap-md shrink-0">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 overflow-hidden rounded-xl bg-success/10 p-1.5 shrink-0 border border-success/20">
                    <img src="/icons/icon_tv.png" alt="TV" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div>
                    <h2 className="text-title-md font-black text-on-surface mb-0.5">Visual Learning</h2>
                    <div className="text-on-surface-variant text-xs font-medium leading-snug">Find the best video tutorials for <strong className="text-on-surface">{activeModule.title}</strong> in {language.native}.</div>
                  </div>
                </div>
                <div className="flex gap-sm w-full sm:w-auto">
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${activeModule.title} in ${language.native}`)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 sm:flex-none text-decoration-none px-md py-sm bg-error/10 text-error border border-error/20 rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-error/20 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span> Search YouTube
                  </a>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${activeModule.title} tutorial in ${language.native}`)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-1 sm:flex-none text-decoration-none px-md py-sm glass text-on-surface border border-surface-container rounded-xl font-bold text-sm flex items-center justify-center gap-xs hover:bg-surface-container/50 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span> Google Search
                  </a>
                </div>
              </div>

              {/* Text/Voice Translation Area */}
              <div className="glass rounded-xxxl p-lg md:p-xl border border-surface-container shadow-lg flex-1 overflow-hidden flex flex-col">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-md pb-md border-b border-surface-container/50 shrink-0">
                  <div>
                    <h2 className="text-title-lg font-black text-on-surface mb-xs">{activeModule.title}</h2>
                    <div className="text-indigo-brand text-xs font-bold flex items-center gap-xs bg-indigo-brand/10 px-sm py-0.5 rounded border border-indigo-brand/20 self-start">
                      <span className="w-2 h-2 bg-indigo-brand rounded-full animate-[pulse_2s_infinite] shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
                      AI Generated Content ({language.native})
                    </div>
                  </div>
                  <button 
                    onClick={playVoice} 
                    disabled={lessonLoading || !content} 
                    className={`px-md py-sm rounded-xl font-bold text-sm flex items-center gap-xs transition-all shadow-sm ${isPlaying ? 'bg-error/10 text-error border border-error/20' : 'bg-on-surface text-surface border border-transparent'} ${(lessonLoading||!content) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{isPlaying ? 'stop_circle' : 'record_voice_over'}</span>
                    {isPlaying ? "Stop Voice Tutor" : "Listen Aloud"}
                  </button>
                </div>

                {lessonLoading ? (
                  <div className="flex flex-col items-center justify-center flex-1 p-xl">
                    <span className="material-symbols-outlined text-5xl text-indigo-brand animate-spin mb-md">autorenew</span>
                    <div className="text-on-surface font-black text-title-md mb-xs">Generating Module...</div>
                    <div className="text-on-surface-variant text-sm font-medium">NLP Engine translating concept to {language.native}</div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-sm text-body-lg text-on-surface-variant font-medium leading-relaxed">
                    {content ? content.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) return <h4 key={i} className="text-on-surface mt-lg mb-sm text-title-md font-black">{line.replace('### ','')}</h4>;
                      if (line.startsWith('## ')) return <h3 key={i} className="text-on-surface mt-xl mb-md text-title-lg font-black">{line.replace('## ','')}</h3>;
                      if (line.startsWith('# ')) return <h2 key={i} className="text-on-surface mt-xl mb-md text-headline-sm font-black">{line.replace('# ','')}</h2>;
                      if (line.startsWith('```')) return <div key={i} className="bg-[#0B1120] text-slate-300 p-md rounded-xl font-mono text-sm overflow-x-auto my-md shadow-inner border border-[#1E293B]">// Code block formatting active</div>; 
                      if (line.trim() === '') return <br key={i} />;
                      
                      const boldParts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i} className="mb-sm">
                          {boldParts.map((part, j) => 
                            part.startsWith('**') && part.endsWith('**') ? 
                            <strong key={j} className="text-on-surface font-bold">{part.slice(2,-2)}</strong> : 
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
    </div>
  );
}
