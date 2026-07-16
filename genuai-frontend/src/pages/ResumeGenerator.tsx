import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export default function ResumeGenerator({ user, onBack }: Props) {
  // Personal Info
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [links, setLinks] = useState("");
  
  // Professional Details
  const [role, setRole] = useState("");
  const [objective, setObjective] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");
  
  // Additional Sections
  const [certifications, setCertifications] = useState("");
  const [achievements, setAchievements] = useState("");
  const [leadership, setLeadership] = useState("");
  const [extracurricular, setExtracurricular] = useState("");
  const [languages, setLanguages] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Editable Name and Email - intentionally blank by default
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  
  // ATS Checker States
  const [atsChecking, setAtsChecking] = useState(false);
  const [atsResult, setAtsResult] = useState("");
  const [showAtsModal, setShowAtsModal] = useState(false);

  const generate = async () => {
    if (!role || !skills || !experience || !education) {
      alert("Please fill in at least the Target Role, Skills, Experience, and Education.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a professional, ATS-optimized resume in extremely clean Markdown format. 
You are an expert ATS resume writer. Format the output so Applicant Tracking Systems can easily parse it. DO NOT use markdown tables or complex formatting. Use standard headings (##), bullet points (-), and bold text (**) for emphasis.

Candidate Information:
- Name: ${candidateName || "Not provided"}
- Email: ${candidateEmail || "Not provided"}
- Phone: ${phone || "Not provided"}
- Location: ${location || "Not provided"}
- Links & Profiles (LinkedIn/GitHub/Portfolio): ${links || "Not provided"}

- Target Role: ${role}
- Career Objective / Professional Summary: ${objective || "Generate a strong professional summary based on the target role and skills."}

Core Sections:
- Skills: ${skills}
- Work Experience / Internships: ${experience}
- Education: ${education}
- Projects: ${projects || "Not provided"}

Additional Sections (Only include if provided):
- Certifications: ${certifications || "Not provided"}
- Achievements & Awards: ${achievements || "Not provided"}
- Positions of Responsibility / Leadership: ${leadership || "Not provided"}
- Extracurricular Activities: ${extracurricular || "Not provided"}
- Languages: ${languages || "Not provided"}

Instructions:
1. Start directly with the candidate's Name as an H1 (# Name), followed by contact info on a single line or simple list.
2. Add a '## Professional Summary' section.
3. Organize the rest using standard headers (## Skills, ## Experience, ## Education, etc.).
4. For Experience and Projects, use bullet points starting with strong Action Verbs and highlight measurable results/impact.
5. Ignore any section that says "Not provided".
6. Do NOT output any conversational text like "Here is your resume" or "Let me know if you need changes." ONLY output the markdown resume.`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, max_tokens: 2500
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setResult(res.data.choices[0].message.content.trim());
    } catch (e) {
      console.error(e);
      alert("Failed to generate resume. Check your API key or network connection.");
    }
    setLoading(false);
  };

  const checkATS = async () => {
    if (!result) return;
    setAtsChecking(true);
    setShowAtsModal(true);
    try {
      const prompt = `You are an expert ATS (Applicant Tracking System) software. Analyze the following resume against the target role: "${role}" and target skills: "${skills}".
      
Resume text:
${result}

Please provide a short analysis formatted in Markdown containing:
1. **ATS Match Score**: X/100 (e.g. 85/100)
2. **Missing Keywords**: List 3-5 important keywords missing from the resume based on the target role.
3. **Suggestions**: 2 brief actionable tips to improve the score.`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, max_tokens: 1000
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setAtsResult(res.data.choices[0].message.content.trim());
    } catch (e) {
      console.error(e);
      setAtsResult("Failed to check ATS score. Please try again.");
    }
    setAtsChecking(false);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="resume-gen-page h-screen bg-background quantum-gradient flex flex-col overflow-hidden">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-resume, #printable-resume * { visibility: visible; }
          #printable-resume { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
          .resume-gen-page { padding: 0 !important; background: white !important; }
        }
        .markdown-body { font-family: 'Inter', sans-serif; }
        .markdown-body h1 { font-size: 26px; margin-bottom: 8px; color: var(--color-on-surface); text-align: center; border-bottom: none; font-weight: 900; }
        .markdown-body h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; color: var(--color-on-surface); border-bottom: 2px solid var(--color-surface-container); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; }
        .markdown-body h3 { font-size: 15px; margin-top: 16px; margin-bottom: 4px; color: var(--color-on-surface); font-weight: 700; }
        .markdown-body p { margin-bottom: 12px; line-height: 1.6; color: var(--color-on-surface-variant); font-size: 13px; font-medium: 500; }
        .markdown-body ul { margin-bottom: 16px; padding-left: 20px; color: var(--color-on-surface-variant); font-size: 13px; }
        .markdown-body li { margin-bottom: 6px; line-height: 1.6; }
        .markdown-body strong { color: var(--color-on-surface); font-weight: 700; }
        .markdown-body em { font-style: normal; color: var(--color-on-surface-variant); font-size: 12px; opacity: 0.8; }
      `}</style>

      {/* ATS Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 bg-on-surface/60 z-[9999] flex items-center justify-center backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
          <div className="glass bg-surface-bright rounded-3xl w-[500px] max-w-[90%] p-xl shadow-2xl relative border border-surface-container animate-[slideUp_0.3s_ease]">
            <button onClick={() => setShowAtsModal(false)} className="absolute top-md right-md bg-transparent border-none text-xl cursor-pointer text-on-surface-variant hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container">✖</button>
            <h2 className="text-title-md font-black text-on-surface mb-lg flex items-center gap-xs"><span>🎯</span> AI ATS Analysis</h2>
            {atsChecking ? (
              <div className="text-center py-xl text-on-surface-variant font-bold animate-pulse">Analyzing against Applicant Tracking Systems...</div>
            ) : (
              <div className="markdown-body max-h-[400px] overflow-y-auto pr-xs custom-scrollbar">
                <ReactMarkdown>{atsResult || ""}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-md">
          <div className="font-black text-title-sm text-on-surface flex items-center gap-sm">
            <span>📄</span> ATS Resume Builder
          </div>
          <div className="bg-surface-container text-on-surface-variant px-sm py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest hidden sm:block">Professional Markdown Engine</div>
        </div>
        <button onClick={onBack} className="bg-surface-bright border border-surface-container text-on-surface-variant px-md py-xs rounded-lg font-bold text-xs hover:text-on-surface hover:border-surface-container-high transition-colors">
          Exit to Hub
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        
        {/* Left Pane - Form */}
        <div className="w-full md:w-[35%] md:min-w-[400px] md:max-w-[550px] glass border-r border-surface-container flex flex-col overflow-hidden shadow-md z-10">
          <div className="flex-1 overflow-y-auto p-lg md:p-xl space-y-md">
            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mb-sm">1. Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
               <div>
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Full Name *</label>
                 <input value={candidateName} onChange={e=>setCandidateName(e.target.value)} placeholder="e.g. John Doe" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Email Address *</label>
                 <input value={candidateEmail} onChange={e=>setCandidateEmail(e.target.value)} placeholder="e.g. john@example.com" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Phone Number</label>
                 <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Location</label>
                 <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="New York, NY" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
               </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Links & Profiles</label>
              <textarea value={links} onChange={e=>setLinks(e.target.value)} placeholder="LinkedIn, GitHub, LeetCode, Portfolio URLs..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mt-xl mb-sm">2. Core Details</h2>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Target Role *</label>
              <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Career Objective / Summary</label>
              <textarea value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Leave blank for AI to generate, or paste your custom summary here." rows={3} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Skills *</label>
              <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Node.js, Python, AWS, System Design..." rows={3} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Work Experience / Internships *</label>
              <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="Software Engineer at TechCorp (2020-2023). Developed microservices using Node.js..." rows={5} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Education *</label>
              <textarea value={education} onChange={e=>setEducation(e.target.value)} placeholder="B.Tech in Computer Science, XYZ University, GPA 3.8/4.0, 2024" rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Projects</label>
              <textarea value={projects} onChange={e=>setProjects(e.target.value)} placeholder="E-commerce App: Built using MERN stack. Integrated Stripe..." rows={4} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mt-xl mb-sm">3. Additional Sections</h2>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Certifications</label>
              <textarea value={certifications} onChange={e=>setCertifications(e.target.value)} placeholder="AWS Certified Solutions Architect, Google Cloud Professional..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Achievements & Awards</label>
              <textarea value={achievements} onChange={e=>setAchievements(e.target.value)} placeholder="1st Place Hackathon, Dean's List..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Positions of Responsibility / Leadership</label>
              <textarea value={leadership} onChange={e=>setLeadership(e.target.value)} placeholder="President of Computer Science Club..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Extracurricular Activities</label>
              <textarea value={extracurricular} onChange={e=>setExtracurricular(e.target.value)} placeholder="Volunteer at Tech4Good..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Languages</label>
              <textarea value={languages} onChange={e=>setLanguages(e.target.value)} placeholder="English (Native), Spanish (Conversational)..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all" />
            </div>
          </div>

          <div className="p-lg md:p-xl border-t border-surface-container bg-surface-bright/30">
            <button onClick={generate} disabled={loading} className={`w-full p-md rounded-xl font-black text-sm transition-all ${loading ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white shadow-md hover:shadow-lg hover:shadow-cyan-600/20 hover:scale-[1.02] cursor-pointer'}`}>
              {loading ? "Generating Resume..." : "✨ Generate ATS Resume"}
            </button>
          </div>
        </div>

        {/* Right Pane - Result Preview */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          <div className="p-lg md:px-xl border-b border-surface-container glass flex justify-between items-center shrink-0">
            <h2 className="text-sm font-black text-on-surface m-0">Live Preview</h2>
            <div className="flex gap-md">
              {result && (
                <>
                  <button onClick={checkATS} className="bg-gradient-to-br from-success to-[#059669] text-white px-md py-xs rounded-lg font-black text-xs hover:shadow-md hover:shadow-success/20 transition-all">🎯 Check ATS Score</button>
                  <button onClick={() => navigator.clipboard.writeText(result)} className="bg-surface-bright border border-surface-container text-on-surface px-md py-xs rounded-lg font-bold text-xs hover:bg-surface-bright/80 transition-colors shadow-sm hidden sm:block">📋 Copy Markdown</button>
                  <button onClick={downloadPDF} className="bg-on-surface text-background px-md py-xs rounded-lg font-bold text-xs hover:bg-on-surface/90 transition-colors shadow-sm">🖨️ Save as PDF</button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 p-xl md:p-xxl overflow-y-auto flex justify-center pb-xxl">
            <div id="printable-resume" className={`markdown-body w-full max-w-[850px] bg-white rounded-3xl px-xl py-[60px] md:px-[80px] md:py-[80px] shadow-lg border border-surface-container ${!result ? 'flex items-center justify-center bg-transparent border-none shadow-none' : ''}`}>
              {result ? (
                <ReactMarkdown>{result}</ReactMarkdown>
              ) : (
                <div className="text-on-surface-variant/70 text-center font-sans font-medium">
                  <div className="text-[64px] mb-lg opacity-30">📄</div>
                  Fill in your details on the left and click generate.<br/>Your ATS-friendly resume will appear here.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
