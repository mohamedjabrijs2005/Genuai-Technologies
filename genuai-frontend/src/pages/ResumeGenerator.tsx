import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export default function ResumeGenerator({ user, onBack }: Props) {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  const name = user?.user?.name || user?.name || "Candidate Name";
  const email = user?.user?.email || user?.email || "candidate@example.com";

  const generate = async () => {
    if (!role || !skills) {
      alert("Please fill in at least the target role and skills.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a professional, ATS-optimized resume in clean Markdown format.
Candidate Name: ${name}
Email: ${email}
Target Role: ${role}
Skills: ${skills}
Experience: ${experience || "Not provided"}
Education: ${education || "Not provided"}
Projects: ${projects || "Not provided"}

Instructions:
- Use standard markdown headers (## Experience, ## Education, etc.)
- Add a professional summary at the top based on the role and skills.
- Format experience and projects with bullet points focusing on action verbs and results.
- Keep the format clean and highly readable.
- Do NOT output any text other than the markdown resume itself.`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, max_tokens: 1500
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setResult(res.data.choices[0].message.content.trim());
    } catch (e) {
      console.error(e);
      alert("Failed to generate resume. Check your API key.");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    window.print(); // Simple way to let users save as PDF from browser
  };

  const inp: any = { width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", boxSizing:"border-box", outline:"none", marginBottom:"16px" };
  const lbl: any = { color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"6px" };

  return (
    <div className="resume-gen-page" style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-resume, #printable-resume * { visibility: visible; }
          #printable-resume { position: absolute; left: 0; top: 0; width: 100%; }
          .resume-gen-page { padding: 0 !important; background: white !important; }
        }
        .markdown-body h1 { font-size: 24px; margin-bottom: 8px; color: #0F172A; }
        .markdown-body h2 { font-size: 18px; margin-top: 20px; margin-bottom: 12px; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; }
        .markdown-body h3 { font-size: 15px; margin-top: 16px; margin-bottom: 8px; color: #334155; }
        .markdown-body p { margin-bottom: 12px; line-height: 1.6; color: #475569; font-size: 14px; }
        .markdown-body ul { margin-bottom: 16px; padding-left: 20px; color: #475569; font-size: 14px; }
        .markdown-body li { margin-bottom: 6px; line-height: 1.5; }
        .markdown-body strong { color: #0F172A; }
      `}</style>

      <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
        
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"#ECFEFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>📄</div>
            <div>
              <h1 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px" }}>Resume Generator</h1>
              <p style={{ color:"#64748B", fontSize:"14px", margin:0 }}>Build a professional, ATS-optimized markdown resume.</p>
            </div>
          </div>
          <button onClick={onBack} style={{ padding:"10px 16px", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontWeight:"700", fontSize:"14px", color:"#64748B", cursor:"pointer" }}>← Back to Hub</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:"24px" }}>
          
          {/* Form */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", height:"calc(100vh - 180px)", overflowY:"auto" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:"0 0 20px" }}>Profile Details</h2>
            
            <label style={lbl}>Target Role *</label>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Full Stack Developer" style={inp} />

            <label style={lbl}>Skills (comma separated) *</label>
            <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python, AWS..." rows={3} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Experience</label>
            <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. Software Engineer at TechCorp (2020-2023). Built..." rows={4} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Education</label>
            <textarea value={education} onChange={e=>setEducation(e.target.value)} placeholder="e.g. B.Tech in Computer Science, XYZ University, 2024" rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Key Projects</label>
            <textarea value={projects} onChange={e=>setProjects(e.target.value)} placeholder="e.g. E-commerce App: Built using MERN stack..." rows={3} style={{...inp, resize:"vertical"}} />

            <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"14px", background:loading?"#E2E8F0":"linear-gradient(135deg,#0891B2,#06B6D4)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(8,145,178,0.3)", marginTop:"10px" }}>
              {loading ? "Generating..." : "✨ Generate Resume"}
            </button>
          </div>

          {/* Result Preview */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:0 }}>Resume Preview</h2>
              <div style={{ display:"flex", gap:"10px" }}>
                {result && (
                  <>
                    <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding:"8px 14px", background:"#F1F5F9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#0F172A", cursor:"pointer" }}>📋 Copy Markdown</button>
                    <button onClick={downloadPDF} style={{ padding:"8px 14px", background:"#0F172A", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>🖨️ Print to PDF</button>
                  </>
                )}
              </div>
            </div>

            <div id="printable-resume" className="markdown-body" style={{ flex:1, background:"#fff", borderRadius:"12px", padding:"32px", border:"1px solid #E2E8F0", overflowY:"auto", boxShadow:"0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}>
              {result ? (
                <ReactMarkdown>{result}</ReactMarkdown>
              ) : (
                <div style={{ color:"#94A3B8", textAlign:"center", marginTop:"150px" }}>Fill in the details and click generate to create your resume.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
