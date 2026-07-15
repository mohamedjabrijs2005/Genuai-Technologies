import { useState } from "react";
import axios from "axios";

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

export default function CoverLetterGenerator({ user, onBack }: Props) {
  // 1. Headers & Details
  const [applicantInfo, setApplicantInfo] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [salutation, setSalutation] = useState("Dear Hiring Manager,");
  
  // 2. Body & Content
  const [opening, setOpening] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [achievements, setAchievements] = useState("");
  const [motivation, setMotivation] = useState("");
  const [valueProp, setValueProp] = useState("");
  
  // 3. Conclusion
  const [closing, setClosing] = useState("");
  const [cta, setCta] = useState("I would welcome the opportunity to discuss how my background aligns with your needs.");
  const [signOff, setSignOff] = useState("Sincerely,\n[Your Name]");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!jobDetails || !skills || !experience) {
      alert("Please fill in at least Job Details, Skills, and Experience.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a highly professional, compelling, and perfectly formatted cover letter based strictly on the following inputs. Seamlessly weave these sections together so it reads like a natural, persuasive letter written by a top-tier candidate.

1. Applicant Information: ${applicantInfo || "Not provided (Format generally)"}
2. Recipient / Company Information: ${companyInfo || "Not provided (Format generally)"}
3. Job Details: ${jobDetails}
4. Salutation: ${salutation}
5. Opening / Introduction: ${opening || "Generate a strong, engaging opening statement expressing excitement for the role."}
6. Skills & Qualifications: ${skills}
7. Relevant Experience: ${experience}
8. Key Achievements: ${achievements || "Not provided (Focus on experience instead)"}
9. Motivation / Why This Company: ${motivation || "Generate a genuine-sounding reason for admiring the company based on the job details."}
10. Value Proposition: ${valueProp || "Summarize why the candidate is the perfect fit."}
11. Closing Statement: ${closing || "Express enthusiasm for the future."}
12. Call to Action: ${cta}
13. Sign-Off: ${signOff}

Instructions:
- Output ONLY the final cover letter text.
- Do NOT output conversational filler like "Here is your letter".
- Format it with clean paragraphs. If applicant and company info are provided, place them at the very top in a standard formal business letter layout.
- Ensure the tone is confident, professional, and enthusiastic.`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, max_tokens: 1500
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      setResult(res.data.choices[0].message.content.trim());
    } catch (e) {
      console.error(e);
      alert("Failed to generate cover letter. Check your API key or network connection.");
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
    <div className="cover-gen-page" style={{ height:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-cover, #printable-cover * { visibility: visible; }
          #printable-cover { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
          .cover-gen-page { padding: 0 !important; background: white !important; }
        }
        textarea:focus, input:focus { border-color: #059669 !important; background: #fff !important; }
      `}</style>

      {/* Header */}
      <div style={{ background:'#0F172A', color:'#fff', padding:'0 32px', height:"64px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"900", fontSize:"18px", letterSpacing:"0.5px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span>✉️</span> Pro Cover Letter Generator
          </div>
          <div style={{ background:"#1E293B", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700", color:"#94A3B8" }}>AI Drafting Engine</div>
        </div>
        <button onClick={onBack} style={{ background:'transparent', border:'1px solid #334155', color:'#94A3B8', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:"13px", transition:"all 0.2s" }}>
          Exit to Hub
        </button>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        
        {/* Left Pane - Form */}
        <div style={{ width:"35%", minWidth:"400px", maxWidth:"550px", background:"#fff", borderRight:"1px solid #E2E8F0", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"4px 0 24px rgba(0,0,0,0.02)" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"32px" }}>
            
            <h2 style={{...sectionHeader, marginTop: 0}}>1. Headers & Details</h2>
            <label style={lbl}>Applicant Information</label>
            <textarea value={applicantInfo} onChange={e=>setApplicantInfo(e.target.value)} placeholder="Name, Phone, Email, LinkedIn..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Recipient / Company Information</label>
            <textarea value={companyInfo} onChange={e=>setCompanyInfo(e.target.value)} placeholder="Hiring Manager Name, Title, Company Name, Address..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Job Details *</label>
            <input value={jobDetails} onChange={e=>setJobDetails(e.target.value)} placeholder="e.g. Senior Frontend Engineer at TechCorp" style={inp} />

            <label style={lbl}>Salutation</label>
            <input value={salutation} onChange={e=>setSalutation(e.target.value)} placeholder="Dear Hiring Manager," style={inp} />

            <h2 style={sectionHeader}>2. Body & Content</h2>
            <label style={lbl}>Opening / Introduction</label>
            <textarea value={opening} onChange={e=>setOpening(e.target.value)} placeholder="Hook the reader. State what role you are applying for and why you are excited." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Skills & Qualifications *</label>
            <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, TypeScript, System Design, Team Leadership..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Relevant Experience *</label>
            <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="3 years at XYZ building scalable web apps..." rows={3} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Key Achievements</label>
            <textarea value={achievements} onChange={e=>setAchievements(e.target.value)} placeholder="Increased conversion by 20%, won Employee of the Year..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Motivation / Why This Company</label>
            <textarea value={motivation} onChange={e=>setMotivation(e.target.value)} placeholder="I admire your commitment to open-source and sustainability..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Value Proposition</label>
            <textarea value={valueProp} onChange={e=>setValueProp(e.target.value)} placeholder="My blend of design and engineering will help your team ship faster..." rows={2} style={{...inp, resize:"vertical"}} />

            <h2 style={sectionHeader}>3. Conclusion</h2>
            <label style={lbl}>Closing Statement</label>
            <textarea value={closing} onChange={e=>setClosing(e.target.value)} placeholder="Thank you for considering my application." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Call to Action</label>
            <textarea value={cta} onChange={e=>setCta(e.target.value)} placeholder="I would welcome the opportunity to discuss this further..." rows={2} style={{...inp, resize:"vertical"}} />

            <label style={lbl}>Sign-Off / Signature</label>
            <textarea value={signOff} onChange={e=>setSignOff(e.target.value)} placeholder="Sincerely,\nJohn Doe" rows={2} style={{...inp, resize:"vertical"}} />
          </div>
          
          <div style={{ background:"#F8FAFC", padding:"24px 32px", borderTop:"1px solid #E2E8F0" }}>
            <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"16px", background:loading?"#E2E8F0":"linear-gradient(135deg,#059669,#10B981)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(5,150,105,0.3)", transition:"transform 0.2s" }} onMouseEnter={e=>!loading && (e.currentTarget.style.transform="scale(1.02)")} onMouseLeave={e=>!loading && (e.currentTarget.style.transform="scale(1)")}>
              {loading ? "Drafting Letter..." : "✨ Generate Cover Letter"}
            </button>
          </div>
        </div>

        {/* Right Pane - Result Preview */}
        <div style={{ flex:1, background:"#F8FAFC", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"24px 48px", borderBottom:"1px solid #E2E8F0", background:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0F172A", margin:0 }}>Live Preview</h2>
            <div style={{ display:"flex", gap:"12px" }}>
              {result && (
                <>
                  <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding:"10px 16px", background:"#F1F5F9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#0F172A", cursor:"pointer", transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#E2E8F0"} onMouseLeave={e=>e.currentTarget.style.background="#F1F5F9"}>📋 Copy Text</button>
                  <button onClick={downloadPDF} style={{ padding:"10px 16px", background:"#0F172A", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer", boxShadow:"0 4px 12px rgba(15,23,42,0.2)" }}>🖨️ Save as PDF</button>
                </>
              )}
            </div>
          </div>

          <div style={{ flex:1, padding:"48px", overflowY:"auto", display:"flex", justifyContent:"center" }}>
            <div id="printable-cover" style={{ width:"100%", maxWidth:"850px", background:"#fff", borderRadius:"12px", padding:"60px 80px", border:"1px solid #E2E8F0", boxShadow:"0 20px 40px rgba(0, 0, 0, 0.04)", whiteSpace:"pre-wrap", color:"#1E293B", fontSize:"15px", lineHeight:"1.7", fontFamily:"'Georgia', serif" }}>
              {result ? result : (
                <div style={{ color:"#94A3B8", textAlign:"center", marginTop:"150px", fontSize:"16px", fontFamily:"'Inter', sans-serif", fontWeight:"500" }}>
                  <div style={{ fontSize:"64px", marginBottom:"24px", opacity:0.3 }}>✉️</div>
                  Fill in your details on the left and click generate.<br/>Your tailored cover letter will appear here.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
