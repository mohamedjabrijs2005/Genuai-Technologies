import { useState } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export default function CoverLetterGenerator({ user, onBack }: Props) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [tone, setTone] = useState("Professional");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  
  const name = user?.user?.name || user?.name || "Candidate";
  const email = user?.user?.email || user?.email || "candidate@example.com";

  const generate = async () => {
    if (!role || !company || !skills) {
      alert("Please fill in the role, company, and skills.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a highly professional and compelling cover letter for the role of ${role} at ${company}.
Candidate Name: ${name}
Candidate Email: ${email}
Key Skills: ${skills}
Experience/Background: ${experience}
Tone: ${tone}

The cover letter should be formatted nicely with paragraphs, have a strong opening, highlight the skills, and end with a confident call to action. Do not use placeholders like [Date], just write the letter body directly starting with "Dear Hiring Manager," or similar.`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6, max_tokens: 800
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setResult(res.data.choices[0].message.content.trim());
    } catch (e) {
      console.error(e);
      alert("Failed to generate cover letter. Check your API key.");
    }
    setLoading(false);
  };

  const inp: any = { width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", boxSizing:"border-box", outline:"none", marginBottom:"16px" };
  const lbl: any = { color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"6px" };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
      <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
        
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>✉️</div>
            <div>
              <h1 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px" }}>Cover Letter Generator</h1>
              <p style={{ color:"#64748B", fontSize:"14px", margin:0 }}>Generate compelling, personalized cover letters in seconds.</p>
            </div>
          </div>
          <button onClick={onBack} style={{ padding:"10px 16px", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontWeight:"700", fontSize:"14px", color:"#64748B", cursor:"pointer" }}>← Back to Hub</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"350px 1fr", gap:"24px" }}>
          
          {/* Form */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:"0 0 20px" }}>Job Details</h2>
            
            <label style={lbl}>Target Role</label>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Frontend Developer" style={inp} />

            <label style={lbl}>Company Name</label>
            <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google" style={inp} />

            <label style={lbl}>Key Skills (comma separated)</label>
            <input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. React, TypeScript, Node.js" style={inp} />

            <label style={lbl}>Brief Experience / Projects</label>
            <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. 3 years building scalable web apps..." rows={4} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Tone</label>
            <select value={tone} onChange={e=>setTone(e.target.value)} style={inp}>
              <option>Professional & Confident</option>
              <option>Enthusiastic & Energetic</option>
              <option>Direct & Concise</option>
            </select>

            <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"14px", background:loading?"#E2E8F0":"linear-gradient(135deg,#059669,#10B981)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(5,150,105,0.3)" }}>
              {loading ? "Generating..." : "✨ Generate Cover Letter"}
            </button>
          </div>

          {/* Result */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:0 }}>Generated Result</h2>
              {result && (
                <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding:"8px 14px", background:"#F1F5F9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#0F172A", cursor:"pointer" }}>📋 Copy Text</button>
              )}
            </div>

            <div style={{ flex:1, background:"#F8FAFC", borderRadius:"12px", padding:"24px", border:"1px solid #E2E8F0", whiteSpace:"pre-wrap", color:"#334155", fontSize:"15px", lineHeight:"1.7", overflowY:"auto", minHeight:"400px" }}>
              {result || <div style={{ color:"#94A3B8", textAlign:"center", marginTop:"100px" }}>Fill in the details and click generate to create your cover letter.</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
