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
  
  const defaultName = user?.user?.name || user?.name || "Candidate Name";
  const defaultEmail = user?.user?.email || user?.email || "candidate@example.com";

  // Editable Name and Email
  const [candidateName, setCandidateName] = useState(defaultName);
  const [candidateEmail, setCandidateEmail] = useState(defaultEmail);

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

  const downloadPDF = () => {
    window.print();
  };

  const inp: any = { width:"100%", padding:"12px 14px", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontSize:"14px", color:"#1E293B", background:"#F8FAFC", boxSizing:"border-box", outline:"none", marginBottom:"16px", transition:"border 0.2s" };
  const lbl: any = { color:"#64748B", fontSize:"12px", fontWeight:"700", display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.05em" };
  const sectionHeader: any = { fontSize:"15px", fontWeight:"800", color:"#0F172A", margin:"24px 0 16px", paddingBottom:"8px", borderBottom:"2px solid #E2E8F0" };

  return (
    <div className="resume-gen-page" style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-resume, #printable-resume * { visibility: visible; }
          #printable-resume { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
          .resume-gen-page { padding: 0 !important; background: white !important; }
        }
        .markdown-body { font-family: 'Inter', sans-serif; }
        .markdown-body h1 { font-size: 26px; margin-bottom: 8px; color: #0F172A; text-align: center; border-bottom: none; }
        .markdown-body h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .markdown-body h3 { font-size: 15px; margin-top: 16px; margin-bottom: 4px; color: #0F172A; font-weight: 700; }
        .markdown-body p { margin-bottom: 12px; line-height: 1.6; color: #334155; font-size: 13px; }
        .markdown-body ul { margin-bottom: 16px; padding-left: 20px; color: #334155; font-size: 13px; }
        .markdown-body li { margin-bottom: 6px; line-height: 1.6; }
        .markdown-body strong { color: #0F172A; font-weight: 700; }
        .markdown-body em { font-style: normal; color: #64748B; font-size: 12px; }
        textarea:focus, input:focus { border-color: #0891B2 !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
        
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"#ECFEFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", border:"1px solid #CFFAFE" }}>📄</div>
            <div>
              <h1 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px" }}>ATS Resume Builder</h1>
              <p style={{ color:"#64748B", fontSize:"14px", margin:0 }}>Generate a professional, ATS-optimized markdown resume ready for applications.</p>
            </div>
          </div>
          <button onClick={onBack} style={{ padding:"10px 16px", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontWeight:"700", fontSize:"14px", color:"#64748B", cursor:"pointer", boxShadow:"0 2px 4px rgba(0,0,0,0.02)" }}>← Back to Hub</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"480px 1fr", gap:"24px" }}>
          
          {/* Form */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", height:"calc(100vh - 180px)", overflowY:"auto" }}>
            
            <h2 style={sectionHeader}>1. Personal Information</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
               <div>
                 <label style={lbl}>Full Name *</label>
                 <input value={candidateName} onChange={e=>setCandidateName(e.target.value)} placeholder="e.g. John Doe" style={inp} />
               </div>
               <div>
                 <label style={lbl}>Email Address *</label>
                 <input value={candidateEmail} onChange={e=>setCandidateEmail(e.target.value)} placeholder="e.g. john@example.com" style={inp} />
               </div>
               <div>
                 <label style={lbl}>Phone Number</label>
                 <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={inp} />
               </div>
               <div>
                 <label style={lbl}>Location</label>
                 <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="New York, NY" style={inp} />
               </div>
            </div>
            <label style={lbl}>Links & Profiles</label>
            <textarea value={links} onChange={e=>setLinks(e.target.value)} placeholder="LinkedIn, GitHub, LeetCode, Portfolio URLs..." rows={2} style={{...inp, resize:"vertical"}} />

            <h2 style={sectionHeader}>2. Core Details</h2>
            <label style={lbl}>Target Role *</label>
            <input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Senior Software Engineer" style={inp} />
            
            <label style={lbl}>Career Objective / Summary</label>
            <textarea value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Leave blank for AI to generate, or paste your custom summary here." rows={3} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Skills *</label>
            <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Node.js, Python, AWS, System Design..." rows={3} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Work Experience / Internships *</label>
            <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="Software Engineer at TechCorp (2020-2023). Developed microservices using Node.js..." rows={5} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Education *</label>
            <textarea value={education} onChange={e=>setEducation(e.target.value)} placeholder="B.Tech in Computer Science, XYZ University, GPA 3.8/4.0, 2024" rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Projects</label>
            <textarea value={projects} onChange={e=>setProjects(e.target.value)} placeholder="E-commerce App: Built using MERN stack. Integrated Stripe..." rows={4} style={{...inp, resize:"vertical"}} />

            <h2 style={sectionHeader}>3. Additional Sections</h2>
            <label style={lbl}>Certifications</label>
            <textarea value={certifications} onChange={e=>setCertifications(e.target.value)} placeholder="AWS Certified Solutions Architect, Google Cloud Professional..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Achievements & Awards</label>
            <textarea value={achievements} onChange={e=>setAchievements(e.target.value)} placeholder="1st Place Hackathon, Dean's List..." rows={2} style={{...inp, resize:"vertical"}} />
            
            <label style={lbl}>Positions of Responsibility / Leadership</label>
            <textarea value={leadership} onChange={e=>setLeadership(e.target.value)} placeholder="President of Computer Science Club..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Extracurricular Activities</label>
            <textarea value={extracurricular} onChange={e=>setExtracurricular(e.target.value)} placeholder="Volunteer at Tech4Good..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Languages</label>
            <textarea value={languages} onChange={e=>setLanguages(e.target.value)} placeholder="English (Native), Spanish (Conversational)..." rows={2} style={{...inp, resize:"vertical"}} />

            <div style={{ position:"sticky", bottom:"-28px", background:"#fff", padding:"20px 0", borderTop:"1px solid #E2E8F0", marginTop:"32px" }}>
              <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"16px", background:loading?"#E2E8F0":"linear-gradient(135deg,#0891B2,#06B6D4)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(8,145,178,0.3)", transition:"transform 0.2s" }} onMouseEnter={e=>!loading && (e.currentTarget.style.transform="scale(1.02)")} onMouseLeave={e=>!loading && (e.currentTarget.style.transform="scale(1)")}>
                {loading ? "Generating Resume..." : "✨ Generate ATS Resume"}
              </button>
            </div>
          </div>

          {/* Result Preview */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"32px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
              <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:0 }}>Live Preview</h2>
              <div style={{ display:"flex", gap:"10px" }}>
                {result && (
                  <>
                    <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding:"8px 14px", background:"#F1F5F9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#0F172A", cursor:"pointer", transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#E2E8F0"} onMouseLeave={e=>e.currentTarget.style.background="#F1F5F9"}>📋 Copy Markdown</button>
                    <button onClick={downloadPDF} style={{ padding:"8px 16px", background:"#0F172A", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer", boxShadow:"0 4px 12px rgba(15,23,42,0.2)" }}>🖨️ Save as PDF</button>
                  </>
                )}
              </div>
            </div>

            <div id="printable-resume" className="markdown-body" style={{ flex:1, background:"#fff", borderRadius:"12px", padding:"40px 50px", border:"1px solid #E2E8F0", overflowY:"auto", boxShadow:"0 10px 25px rgba(0, 0, 0, 0.03) inset" }}>
              {result ? (
                <ReactMarkdown>{result}</ReactMarkdown>
              ) : (
                <div style={{ color:"#94A3B8", textAlign:"center", marginTop:"200px", fontSize:"15px" }}>
                  <div style={{ fontSize:"48px", marginBottom:"16px", opacity:0.5 }}>📄</div>
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
