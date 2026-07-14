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
    <div className="cover-gen-page" style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"40px 20px" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-cover, #printable-cover * { visibility: visible; }
          #printable-cover { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
          .cover-gen-page { padding: 0 !important; background: white !important; }
        }
        textarea:focus, input:focus { border-color: #059669 !important; background: #fff !important; }
      `}</style>

      <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
        
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", border:"1px solid #D1FAE5" }}>✉️</div>
            <div>
              <h1 style={{ fontSize:"24px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px" }}>Pro Cover Letter Generator</h1>
              <p style={{ color:"#64748B", fontSize:"14px", margin:0 }}>Construct a highly tailored, persuasive cover letter structured for success.</p>
            </div>
          </div>
          <button onClick={onBack} style={{ padding:"10px 16px", background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"10px", fontWeight:"700", fontSize:"14px", color:"#64748B", cursor:"pointer", boxShadow:"0 2px 4px rgba(0,0,0,0.02)" }}>← Back to Hub</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"480px 1fr", gap:"24px" }}>
          
          {/* Form */}
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", border:"1px solid #E2E8F0", boxShadow:"0 4px 12px rgba(0,0,0,0.02)", height:"calc(100vh - 180px)", overflowY:"auto" }}>
            
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

            <div style={{ position:"sticky", bottom:"-28px", background:"#fff", padding:"20px 0", borderTop:"1px solid #E2E8F0", marginTop:"32px" }}>
              <button onClick={generate} disabled={loading} style={{ width:"100%", padding:"16px", background:loading?"#E2E8F0":"linear-gradient(135deg,#059669,#10B981)", color:loading?"#94A3B8":"#fff", border:"none", borderRadius:"12px", fontWeight:"800", fontSize:"15px", cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 8px 24px rgba(5,150,105,0.3)", transition:"transform 0.2s" }} onMouseEnter={e=>!loading && (e.currentTarget.style.transform="scale(1.02)")} onMouseLeave={e=>!loading && (e.currentTarget.style.transform="scale(1)")}>
                {loading ? "Drafting Letter..." : "✨ Generate Cover Letter"}
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
                    <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding:"8px 14px", background:"#F1F5F9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#0F172A", cursor:"pointer", transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#E2E8F0"} onMouseLeave={e=>e.currentTarget.style.background="#F1F5F9"}>📋 Copy Text</button>
                    <button onClick={downloadPDF} style={{ padding:"8px 16px", background:"#0F172A", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer", boxShadow:"0 4px 12px rgba(15,23,42,0.2)" }}>🖨️ Save as PDF</button>
                  </>
                )}
              </div>
            </div>

            <div id="printable-cover" style={{ flex:1, background:"#fff", borderRadius:"12px", padding:"40px 50px", border:"1px solid #E2E8F0", overflowY:"auto", boxShadow:"0 10px 25px rgba(0, 0, 0, 0.03) inset", whiteSpace:"pre-wrap", color:"#1E293B", fontSize:"15px", lineHeight:"1.7", fontFamily:"'Georgia', serif" }}>
              {result ? result : (
                <div style={{ color:"#94A3B8", textAlign:"center", marginTop:"200px", fontSize:"15px", fontFamily:"'Inter', sans-serif" }}>
                  <div style={{ fontSize:"48px", marginBottom:"16px", opacity:0.5 }}>✉️</div>
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
