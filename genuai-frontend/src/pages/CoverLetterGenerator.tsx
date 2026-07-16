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

  return (
    <div className="cover-gen-page h-screen bg-background quantum-gradient flex flex-col overflow-hidden">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-cover, #printable-cover * { visibility: visible; }
          #printable-cover { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; padding: 0 !important; }
          .cover-gen-page { padding: 0 !important; background: white !important; }
        }
      `}</style>

      {/* Header */}
      <div className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-md">
          <div className="font-black text-title-sm text-on-surface flex items-center gap-sm">
            <span>✉️</span> Pro Cover Letter Generator
          </div>
          <div className="bg-surface-container text-on-surface-variant px-sm py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest hidden sm:block">AI Drafting Engine</div>
        </div>
        <button onClick={onBack} className="bg-surface-bright border border-surface-container text-on-surface-variant px-md py-xs rounded-lg font-bold text-xs hover:text-on-surface hover:border-surface-container-high transition-colors">
          Exit to Hub
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        
        {/* Left Pane - Form */}
        <div className="w-full md:w-[35%] md:min-w-[400px] md:max-w-[550px] glass border-r border-surface-container flex flex-col overflow-hidden shadow-md z-10">
          <div className="flex-1 overflow-y-auto p-lg md:p-xl space-y-md">
            
            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mb-sm">1. Headers & Details</h2>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Applicant Information</label>
              <textarea value={applicantInfo} onChange={e=>setApplicantInfo(e.target.value)} placeholder="Name, Phone, Email, LinkedIn..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Recipient / Company Information</label>
              <textarea value={companyInfo} onChange={e=>setCompanyInfo(e.target.value)} placeholder="Hiring Manager Name, Title, Company Name, Address..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Job Details *</label>
              <input value={jobDetails} onChange={e=>setJobDetails(e.target.value)} placeholder="e.g. Senior Frontend Engineer at TechCorp" className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Salutation</label>
              <input value={salutation} onChange={e=>setSalutation(e.target.value)} placeholder="Dear Hiring Manager," className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mt-xl mb-sm">2. Body & Content</h2>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Opening / Introduction</label>
              <textarea value={opening} onChange={e=>setOpening(e.target.value)} placeholder="Hook the reader. State what role you are applying for and why you are excited." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Skills & Qualifications *</label>
              <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, TypeScript, System Design, Team Leadership..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Relevant Experience *</label>
              <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="3 years at XYZ building scalable web apps..." rows={3} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Key Achievements</label>
              <textarea value={achievements} onChange={e=>setAchievements(e.target.value)} placeholder="Increased conversion by 20%, won Employee of the Year..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Motivation / Why This Company</label>
              <textarea value={motivation} onChange={e=>setMotivation(e.target.value)} placeholder="I admire your commitment to open-source and sustainability..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Value Proposition</label>
              <textarea value={valueProp} onChange={e=>setValueProp(e.target.value)} placeholder="My blend of design and engineering will help your team ship faster..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <h2 className="text-title-sm font-black text-on-surface border-b border-surface-container pb-xs mt-xl mb-sm">3. Conclusion</h2>
            
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Closing Statement</label>
              <textarea value={closing} onChange={e=>setClosing(e.target.value)} placeholder="Thank you for considering my application." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Call to Action</label>
              <textarea value={cta} onChange={e=>setCta(e.target.value)} placeholder="I would welcome the opportunity to discuss this further..." rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs block">Sign-Off / Signature</label>
              <textarea value={signOff} onChange={e=>setSignOff(e.target.value)} placeholder="Sincerely,\nJohn Doe" rows={2} className="w-full p-sm bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all" />
            </div>
          </div>
          
          <div className="p-lg md:p-xl border-t border-surface-container bg-surface-bright/30">
            <button onClick={generate} disabled={loading} className={`w-full p-md rounded-xl font-black text-sm transition-all ${loading ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-success to-[#10B981] text-white shadow-md hover:shadow-lg hover:shadow-success/20 hover:scale-[1.02] cursor-pointer'}`}>
              {loading ? "Drafting Letter..." : "✨ Generate Cover Letter"}
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
                  <button onClick={() => navigator.clipboard.writeText(result)} className="bg-surface-bright border border-surface-container text-on-surface px-md py-xs rounded-lg font-bold text-xs hover:bg-surface-bright/80 transition-colors shadow-sm">📋 Copy Text</button>
                  <button onClick={downloadPDF} className="bg-on-surface text-background px-md py-xs rounded-lg font-bold text-xs hover:bg-on-surface/90 transition-colors shadow-sm">🖨️ Save as PDF</button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 p-xl md:p-xxl overflow-y-auto flex justify-center pb-xxl">
            <div id="printable-cover" className={`w-full max-w-[850px] bg-white rounded-3xl px-xl py-[60px] md:px-[80px] md:py-[80px] shadow-lg border border-surface-container whitespace-pre-wrap text-on-surface text-[15px] leading-relaxed font-serif ${!result ? 'flex items-center justify-center bg-transparent border-none shadow-none' : ''}`}>
              {result ? result : (
                <div className="text-on-surface-variant/70 text-center font-sans font-medium">
                  <div className="text-[64px] mb-lg opacity-30">✉️</div>
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
