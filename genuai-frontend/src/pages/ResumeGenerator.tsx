import { useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY || "";

interface Props { user: any; onBack: () => void; }

export default function ResumeGenerator({ user, onBack }: Props) {
  const [tab, setTab] = useState<"resume"|"cover">("resume");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [coverGenerated, setCoverGenerated] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const [form, setForm] = useState({
    name: user?.user?.name || user?.name || "",
    email: user?.user?.email || user?.email || "",
    phone: "", location: "", linkedin: "", github: "", skillrack: "",
    cgpa: "", degree: "B.E. – Computer Science & Engineering",
    college: "", passYear: "2024 – 2028",
    hscSchool: "", hscYear: "2023 – 2024", hscPercent: "",
    sslcSchool: "", sslcYear: "2021 – 2022", sslcPercent: "",
    languages: "", frontend: "", backend: "", database: "",
    cloud: "", aiml: "", tools: "",
    projects: [{ title: "", subtitle: "", bullets: "" }],
    certifications: "",
    achievements: [{ title: "", org: "", year: "", bullet: "" }],
    competencies: "Leadership, Teamwork, Communication, Problem Solving, Analytics, Innovation, Collaboration, Pressure Handling",
  });

  const [cover, setCover] = useState({
    companyName: "", jobTitle: "", hiringManager: "Hiring Manager",
    whyCompany: "", keyStrength: "", availableDate: "immediately",
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const getAISuggestions = () => {
    setAiLoading(true);
    const allSkills = [form.frontend, form.backend, form.database, form.cloud, form.aiml, form.tools].filter(Boolean).join(",");
    const skillsArr = allSkills.split(",").map((s: string) => s.trim()).filter(Boolean);
    const missingSkills = ["Docker","Kubernetes","CI/CD","System Design","REST APIs","Git","Agile","AWS","TypeScript","Linux"].filter(s => !allSkills.toLowerCase().includes(s.toLowerCase()));
    const atsScore = Math.min(100, Math.round(
      (form.phone ? 5 : 0) +
      (form.linkedin ? 5 : 0) +
      (form.github ? 5 : 0) +
      (form.languages ? 10 : 0) +
      (form.frontend || form.backend ? 20 : 0) +
      (form.projects[0]?.title ? 25 : 0) +
      (form.certifications ? 10 : 0) +
      (form.achievements[0]?.title ? 10 : 0) +
      (form.cgpa ? 5 : 0) +
      (form.hscPercent ? 5 : 0)
    ));
    setTimeout(() => {
      setSuggestions({
        atsScore,
        contactTip: !form.phone ? "Add phone number — required for recruiters!" : !form.linkedin ? "Add LinkedIn URL — boosts credibility!" : !form.github ? "Add GitHub URL — shows your projects!" : "Contact info looks complete!",
        skillsTip: skillsArr.length < 5 ? "Add more technical skills in Frontend/Backend/Tools sections!" : skillsArr.length > 20 ? "Too many skills listed. Focus on most relevant ones." : `Good! ${skillsArr.length} skills listed.`,
        projectsTip: !form.projects[0]?.title ? "Add at least 2-3 projects — worth 25 ATS points!" : form.projects.length < 2 ? "Add one more project to strengthen your profile!" : "Good projects section!",
        certTip: !form.certifications ? "Add certifications — AWS, Google, or any online course certificates help!" : "Good certifications section!",
        achievementTip: !form.achievements[0]?.title ? "Add achievements/awards — they set you apart from other candidates!" : "Great achievements section!",
        cgpaTip: !form.cgpa ? "Add your CGPA — many companies filter by academic score!" : parseFloat(form.cgpa) >= 8 ? "Excellent CGPA! Highlight it prominently." : parseFloat(form.cgpa) >= 7 ? "Good CGPA. You are competitive for most companies." : "Consider highlighting your projects and skills more than CGPA.",
        missingSkills: missingSkills.slice(0, 5),
      });
      setAiLoading(false);
    }, 800);
  };
  const inp: any = { width: "100%", padding: "10px 12px", marginBottom: "10px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "13px", boxSizing: "border-box", outline: "none" };
  const lbl: any = { color: "#64748B", fontSize: "12px", display: "block", marginBottom: "4px", fontWeight: "600" };
  const sec: any = { marginBottom: "20px" };
  const sech: any = { color: "#667EEA", fontSize: "13px", fontWeight: "800", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #667EEA", paddingBottom: "4px" };

  const addProject = () => set("projects", [...form.projects, { title: "", subtitle: "", bullets: "" }]);
  const setProject = (i: number, k: string, v: string) => {
    const p = [...form.projects]; p[i] = { ...p[i], [k]: v }; set("projects", p);
  };
  const addAchievement = () => set("achievements", [...form.achievements, { title: "", org: "", year: "", bullet: "" }]);
  const setAchievement = (i: number, k: string, v: string) => {
    const a = [...form.achievements]; a[i] = { ...a[i], [k]: v }; set("achievements", a);
  };

  const generateCoverLetter = async () => {
    setLoading(true);
    try {
      const prompt = `Write a professional one-page cover letter for ${form.name} applying for ${cover.jobTitle} at ${cover.companyName}.
Candidate background: ${form.degree} at ${form.college}, CGPA ${form.cgpa}. Skills: ${form.languages}, ${form.frontend}, ${form.backend}.
Projects: ${form.projects.map(p => p.title).join(", ")}.
Why this company: ${cover.whyCompany}. Key strength: ${cover.keyStrength}. Available: ${cover.availableDate}.
Addressing: ${cover.hiringManager}.
Format: Professional business letter. 3 paragraphs. Confident tone. No placeholders. Sign off as ${form.name}.`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1000 })
      });
      const data = await res.json();
      setCoverLetter(data.choices?.[0]?.message?.content || "Failed to generate. Please try again.");
      setCoverGenerated(true);
    } catch { setCoverLetter("Generation failed. Please check your connection."); }
    setLoading(false);
  };

  const printResume = () => {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${form.name} Resume</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Arial',sans-serif;font-size:10.5pt;color:#1a1a1a;background:#fff;padding:18px 22px;}
h1{font-size:17pt;font-weight:900;color:#1a1a1a;margin-bottom:2px;}
.subtitle{font-size:9.5pt;color:#444;margin-bottom:4px;}
.contact{font-size:9pt;color:#333;margin-bottom:10px;}
a{color:#1a56db;text-decoration:none;}
.divider{border:none;border-top:1.5px solid #1a1a1a;margin:7px 0;}
.section-title{font-size:10pt;font-weight:900;text-transform:uppercase;letter-spacing:0.8px;color:#1a1a1a;margin:8px 0 4px;border-bottom:1px solid #ccc;padding-bottom:2px;}
.row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1px;}
.bold{font-weight:700;}
.italic{font-style:italic;color:#555;}
.date{font-size:9pt;color:#555;white-space:nowrap;}
ul{padding-left:14px;margin:2px 0;}
li{margin-bottom:1px;font-size:9.5pt;}
.skills-grid{display:grid;grid-template-columns:110px 1fr;gap:2px 8px;font-size:9.5pt;}
.skill-label{font-weight:700;color:#1a1a1a;}
.comp-row{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:9.5pt;}
.comp-item::before{content:"▸ ";}
@media print{body{padding:10px 14px;}}
</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  const printCover = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Cover Letter</title>
<style>body{font-family:'Arial',sans-serif;font-size:11pt;line-height:1.7;padding:40px 50px;color:#1a1a1a;max-width:700px;margin:0 auto;}
p{margin-bottom:14px;} @media print{body{padding:20px 30px;}}</style>
</head><body><pre style="font-family:Arial,sans-serif;font-size:11pt;white-space:pre-wrap;line-height:1.7">${coverLetter}</pre></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  const certs = form.certifications.split("\n").map(s => s.trim()).filter(Boolean);
  const comps = form.competencies.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ padding: "7px 14px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", color: "#64748B", fontWeight: "600", fontSize: "13px" }}>← Back</button>
          <span style={{ fontWeight: "800", fontSize: "16px", color: "#1E293B" }}>Resume & Cover Letter Generator</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setTab("resume")} style={{ padding: "7px 18px", background: tab === "resume" ? "linear-gradient(135deg,#667EEA,#764BA2)" : "#F1F5F9", color: tab === "resume" ? "#fff" : "#64748B", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>📄 Resume</button>
          <button onClick={() => setTab("cover")} style={{ padding: "7px 18px", background: tab === "cover" ? "linear-gradient(135deg,#00B87C,#00D4AA)" : "#F1F5F9", color: tab === "cover" ? "#fff" : "#64748B", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>✉️ Cover Letter</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>

        {tab === "resume" ? (
          <>
            {/* LEFT: Form */}
            <div style={{ width: "380px", flexShrink: 0 }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid #E2E8F0", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>

                <div style={sech}>Personal Info</div>
                <div style={sec}>
                  <label style={lbl}>Full Name</label>
                  <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Mohamed Jabri J S" />
                  <label style={lbl}>Email</label>
                  <input style={inp} value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" />
                  <label style={lbl}>Phone</label>
                  <input style={inp} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 9876543210" />
                  <label style={lbl}>Location</label>
                  <input style={inp} value={form.location} onChange={e => set("location", e.target.value)} placeholder="Chennai, Tamil Nadu" />
                  <label style={lbl}>Tagline / Role</label>
                  <input style={inp} value={form.degree} onChange={e => set("degree", e.target.value)} placeholder="Engineering Aspirant | CSE (IoT) Undergraduate" />
                  <label style={lbl}>LinkedIn URL</label>
                  <input style={inp} value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/yourname" />
                  <label style={lbl}>GitHub URL</label>
                  <input style={inp} value={form.github} onChange={e => set("github", e.target.value)} placeholder="github.com/yourusername" />
                  <label style={lbl}>SkillRack URL (optional)</label>
                  <input style={inp} value={form.skillrack} onChange={e => set("skillrack", e.target.value)} placeholder="skillrack.com/..." />
                </div>

                <div style={sech}>Education</div>
                <div style={sec}>
                  <label style={lbl}>Degree & Branch</label>
                  <input style={inp} value={form.degree} onChange={e => set("degree", e.target.value)} placeholder="B.E. – Computer Science & Engineering (IoT)" />
                  <label style={lbl}>College</label>
                  <input style={inp} value={form.college} onChange={e => set("college", e.target.value)} placeholder="Sri Sai Ram Institute of Technology, Chennai" />
                  <label style={lbl}>Year Range</label>
                  <input style={inp} value={form.passYear} onChange={e => set("passYear", e.target.value)} placeholder="2024 – 2028" />
                  <label style={lbl}>CGPA</label>
                  <input style={inp} value={form.cgpa} onChange={e => set("cgpa", e.target.value)} placeholder="9.46" />
                  <label style={lbl}>HSC School</label>
                  <input style={inp} value={form.hscSchool} onChange={e => set("hscSchool", e.target.value)} placeholder="School Name" />
                  <label style={lbl}>HSC Year & Percentage</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input style={{ ...inp, flex: 1 }} value={form.hscYear} onChange={e => set("hscYear", e.target.value)} placeholder="2023 – 2024" />
                    <input style={{ ...inp, flex: 1 }} value={form.hscPercent} onChange={e => set("hscPercent", e.target.value)} placeholder="90%" />
                  </div>
                  <label style={lbl}>SSLC School</label>
                  <input style={inp} value={form.sslcSchool} onChange={e => set("sslcSchool", e.target.value)} placeholder="School Name" />
                  <label style={lbl}>SSLC Year & Percentage</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input style={{ ...inp, flex: 1 }} value={form.sslcYear} onChange={e => set("sslcYear", e.target.value)} placeholder="2021 – 2022" />
                    <input style={{ ...inp, flex: 1 }} value={form.sslcPercent} onChange={e => set("sslcPercent", e.target.value)} placeholder="96%" />
                  </div>
                </div>

                <div style={sech}>Technical Skills</div>
                <div style={sec}>
                  {[["languages","Languages","Python, JavaScript, TypeScript"],["frontend","Frontend","React, Tailwind CSS, HTML, CSS"],["backend","Backend","Node.js, Express, Flask"],["database","Database","PostgreSQL, SQLite, DynamoDB"],["cloud","Cloud","AWS (EC2, RDS, S3, SES, Lambda)"],["aiml","AI/ML","Google Gemini AI, NLP, RAG"],["tools","Tools","Git, GitHub, VS Code, Docker"]].map(([k,label,ph]) => (
                    <div key={k}>
                      <label style={lbl}>{label}</label>
                      <input style={inp} value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder={ph} />
                    </div>
                  ))}
                </div>

                <div style={sech}>Projects</div>
                <div style={sec}>
                  {form.projects.map((p, i) => (
                    <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                      <label style={lbl}>Project Title</label>
                      <input style={inp} value={p.title} onChange={e => setProject(i, "title", e.target.value)} placeholder="GenuAI Technologies — AI Recruitment Platform" />
                      <label style={lbl}>Tech Stack / Subtitle</label>
                      <input style={inp} value={p.subtitle} onChange={e => setProject(i, "subtitle", e.target.value)} placeholder="React · TypeScript · AWS · Gemini AI" />
                      <label style={lbl}>Bullet Points (one per line)</label>
                      <textarea style={{ ...inp, height: "80px", resize: "vertical" }} value={p.bullets} onChange={e => setProject(i, "bullets", e.target.value)} placeholder={"Built end-to-end recruitment platform\nWon 1st rank among 60,000+ participants"} />
                    </div>
                  ))}
                  <button onClick={addProject} style={{ padding: "7px 14px", background: "#EEF2FF", border: "1px dashed #667EEA", borderRadius: "8px", color: "#667EEA", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>+ Add Project</button>
                </div>

                <div style={sech}>Certifications</div>
                <div style={sec}>
                  <label style={lbl}>One per line: Name — Issuer (Month Year)</label>
                  <textarea style={{ ...inp, height: "90px", resize: "vertical" }} value={form.certifications} onChange={e => set("certifications", e.target.value)} placeholder={"Python for Data Science, AI & Development — IBM (Coursera) Jul 2025\nFoundations: Data, Data, Everywhere — Google (Coursera) Jul 2025"} />
                </div>

                <div style={sech}>Achievements</div>
                <div style={sec}>
                  {form.achievements.map((a, i) => (
                    <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                      <label style={lbl}>Achievement Title</label>
                      <input style={inp} value={a.title} onChange={e => setAchievement(i, "title", e.target.value)} placeholder="1st Rank — AI-PrepPulse Hackathon" />
                      <label style={lbl}>Organisation</label>
                      <input style={inp} value={a.org} onChange={e => setAchievement(i, "org", e.target.value)} placeholder="60,000+ national participants" />
                      <label style={lbl}>Year</label>
                      <input style={inp} value={a.year} onChange={e => setAchievement(i, "year", e.target.value)} placeholder="2026" />
                      <label style={lbl}>Description</label>
                      <input style={inp} value={a.bullet} onChange={e => setAchievement(i, "bullet", e.target.value)} placeholder="Built GenuAI, an AI-powered recruitment platform..." />
                    </div>
                  ))}
                  <button onClick={addAchievement} style={{ padding: "7px 14px", background: "#F0FDF4", border: "1px dashed #22C55E", borderRadius: "8px", color: "#16A34A", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>+ Add Achievement</button>
                </div>

                <div style={sech}>Core Competencies</div>
                <div style={sec}>
                  <label style={lbl}>Comma separated</label>
                  <input style={inp} value={form.competencies} onChange={e => set("competencies", e.target.value)} placeholder="Leadership, Teamwork, Problem Solving..." />
                </div>

                <button onClick={getAISuggestions} disabled={aiLoading} style={{ width: "100%", padding: "12px", background: aiLoading ? "#E2E8F0" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: aiLoading ? "#94A3B8" : "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginBottom: "10px" }}>
                  {aiLoading ? "Analyzing..." : "🧠 Get AI Resume Suggestions"}
                </button>

                {suggestions && (
                  <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>🧠 AI Resume Analysis</span>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: suggestions.atsScore >= 80 ? "#00B87C" : suggestions.atsScore >= 60 ? "#F59E0B" : "#EF4444" }}>{suggestions.atsScore}%</span>
                        <span style={{ color: "#94A3B8", fontSize: "11px", marginLeft: "4px" }}>ATS Score</span>
                      </div>
                    </div>
                    <div style={{ background: "#E2E8F0", borderRadius: "6px", height: "6px", marginBottom: "14px" }}>
                      <div style={{ width: suggestions.atsScore + "%", background: suggestions.atsScore >= 80 ? "#00B87C" : suggestions.atsScore >= 60 ? "#F59E0B" : "#EF4444", height: "6px", borderRadius: "6px", transition: "width 1s" }}/>
                    </div>
                    {[
                      ["📞 Contact", suggestions.contactTip, "#667EEA"],
                      ["🛠️ Skills", suggestions.skillsTip, "#F59E0B"],
                      ["📁 Projects", suggestions.projectsTip, "#00B87C"],
                      ["🏅 Certifications", suggestions.certTip, "#A78BFA"],
                      ["🏆 Achievements", suggestions.achievementTip, "#EF4444"],
                      ["🎓 CGPA", suggestions.cgpaTip, "#00B87C"],
                    ].map(([label, tip, color]: any) => (
                      <div key={label} style={{ padding: "8px 12px", background: "#fff", borderRadius: "8px", marginBottom: "6px", borderLeft: "3px solid " + color }}>
                        <div style={{ color, fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}>{label}</div>
                        <div style={{ color: "#64748B", fontSize: "12px" }}>{tip}</div>
                      </div>
                    ))}
                    {suggestions.missingSkills.length > 0 && (
                      <div style={{ padding: "8px 12px", background: "#FFFBEB", borderRadius: "8px", borderLeft: "3px solid #F59E0B" }}>
                        <div style={{ color: "#F59E0B", fontWeight: "700", fontSize: "11px", marginBottom: "6px" }}>⚡ In-Demand Skills to Add</div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {suggestions.missingSkills.map((s: string) => (
                            <span key={s} style={{ padding: "2px 8px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "10px", color: "#92400E", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => setGenerated(true)} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginTop: "8px" }}>
                  ✨ Generate Resume Preview
                </button>
              </div>
            </div>

            {/* RIGHT: Preview */}
            <div style={{ flex: 1 }}>
              {generated ? (
                <div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                    <button onClick={printResume} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>🖨️ Print / Save as PDF</button>
                    <div style={{ padding: "10px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", color: "#EA580C", fontSize: "12px" }}>
                      Tip: In print dialog → Save as PDF → A4 size → No margins or Minimum margins
                    </div>
                  </div>

                  {/* A4 Preview */}
                  <div id="resume-preview" style={{ background: "#fff", width: "210mm", minHeight: "297mm", padding: "18mm 20mm", fontFamily: "Arial, sans-serif", fontSize: "10.5pt", color: "#1a1a1a", boxShadow: "0 4px 30px rgba(0,0,0,0.15)", borderRadius: "4px" }}>

                    {/* Name & Header */}
                    <div style={{ textAlign: "center", marginBottom: "6px" }}>
                      <h1 style={{ fontSize: "17pt", fontWeight: 900, margin: "0 0 2px", letterSpacing: "0.5px" }}>{form.name || "YOUR NAME"}</h1>
                      <div style={{ fontSize: "9.5pt", color: "#333", marginBottom: "3px" }}>{form.degree}</div>
                      <div style={{ fontSize: "9pt", color: "#333" }}>
                        {form.email && <span>✉ <a href={"mailto:" + form.email} style={{ color: "#1a56db" }}>{form.email}</a></span>}
                        {form.phone && <span> &nbsp;|&nbsp; {form.phone}</span>}
                        {form.location && <span> &nbsp;|&nbsp; {form.location}</span>}
                      </div>
                      <div style={{ fontSize: "9pt", color: "#333", marginTop: "2px" }}>
                        {form.linkedin && <span><a href={"https://" + form.linkedin} style={{ color: "#1a56db" }}>LinkedIn: {form.name}</a></span>}
                        {form.github && <span> &nbsp;|&nbsp; <a href={"https://" + form.github} style={{ color: "#1a56db" }}>GitHub: {form.github.split("/").pop()}</a></span>}
                        {form.skillrack && <span> &nbsp;|&nbsp; <a href={form.skillrack} style={{ color: "#1a56db" }}>SkillRack: View Profile</a></span>}
                      </div>
                    </div>

                    <hr style={{ border: "none", borderTop: "1.5px solid #1a1a1a", margin: "7px 0" }} />

                    {/* Education */}
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Education</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{form.degree}</span>
                        <span style={{ fontSize: "9pt", color: "#555" }}>{form.passYear}{form.cgpa ? " | CGPA: " + form.cgpa : ""}</span>
                      </div>
                      <div style={{ fontSize: "9pt", color: "#333", marginBottom: "3px" }}>{form.college}</div>
                      {form.hscSchool && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>Higher Secondary – Computer Science with Mathematics</span>
                            <span style={{ fontSize: "9pt", color: "#555" }}>{form.hscYear}{form.hscPercent ? " | " + form.hscPercent : ""}</span>
                          </div>
                          <div style={{ fontSize: "9pt", color: "#333", marginBottom: "3px" }}>{form.hscSchool}</div>
                        </>
                      )}
                      {form.sslcSchool && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>SSLC – Secondary School Leaving Certificate</span>
                            <span style={{ fontSize: "9pt", color: "#555" }}>{form.sslcYear}{form.sslcPercent ? " | " + form.sslcPercent : ""}</span>
                          </div>
                          <div style={{ fontSize: "9pt", color: "#333" }}>{form.sslcSchool}</div>
                        </>
                      )}
                    </div>

                    {/* Technical Skills */}
                    {(form.languages || form.frontend || form.backend) && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Technical Skills</div>
                        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "2px 8px", fontSize: "9.5pt" }}>
                          {form.languages && <><span style={{ fontWeight: 700 }}>Languages:</span><span>{form.languages}</span></>}
                          {form.frontend && <><span style={{ fontWeight: 700 }}>Frontend:</span><span>{form.frontend}</span></>}
                          {form.backend && <><span style={{ fontWeight: 700 }}>Backend:</span><span>{form.backend}</span></>}
                          {form.database && <><span style={{ fontWeight: 700 }}>Database:</span><span>{form.database}</span></>}
                          {form.cloud && <><span style={{ fontWeight: 700 }}>Cloud:</span><span>{form.cloud}</span></>}
                          {form.aiml && <><span style={{ fontWeight: 700 }}>AI/ML:</span><span>{form.aiml}</span></>}
                          {form.tools && <><span style={{ fontWeight: 700 }}>Tools:</span><span>{form.tools}</span></>}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {form.projects.some(p => p.title) && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Projects</div>
                        {form.projects.filter(p => p.title).map((p, i) => (
                          <div key={i} style={{ marginBottom: "5px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{p.title}</span>
                            </div>
                            {p.subtitle && <div style={{ fontSize: "9pt", color: "#555", fontStyle: "italic", marginBottom: "2px" }}>{p.subtitle}</div>}
                            {p.bullets && (
                              <ul style={{ paddingLeft: "14px", margin: "2px 0" }}>
                                {p.bullets.split("\n").filter(b => b.trim()).map((b, j) => (
                                  <li key={j} style={{ fontSize: "9.5pt", marginBottom: "1px" }}>{b.trim()}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {certs.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Certifications</div>
                        {certs.map((c, i) => {
                          const parts = c.split("—");
                          const name = parts[0]?.trim();
                          const rest = parts[1]?.trim();
                          const restParts = rest?.split(/\s(?=\w{3}\s\d{4})/);
                          const issuer = restParts?.[0];
                          const date = restParts?.[1];
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "2px" }}>
                              <span><span style={{ fontWeight: 700 }}>{name}</span>{issuer ? " — " + issuer : ""}</span>
                              {date && <span style={{ color: "#555", fontSize: "9pt" }}>{date}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Achievements */}
                    {form.achievements.some(a => a.title) && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Achievements & Competitions</div>
                        {form.achievements.filter(a => a.title).map((a, i) => (
                          <div key={i} style={{ marginBottom: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{"🎓 " + a.title}</span>
                              {a.year && <span style={{ fontSize: "9pt", color: "#555" }}>{a.year}</span>}
                            </div>
                            {a.org && <div style={{ fontSize: "9pt", color: "#555", marginBottom: "1px" }}>{a.org}</div>}
                            {a.bullet && <ul style={{ paddingLeft: "14px", margin: "1px 0" }}><li style={{ fontSize: "9.5pt" }}>{a.bullet}</li></ul>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Core Competencies */}
                    {comps.length > 0 && (
                      <div>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Core Competencies</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", fontSize: "9.5pt" }}>
                          {comps.map((c, i) => <span key={i}>▸ {c}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
                  <h3 style={{ color: "#1E293B", marginBottom: "8px" }}>Fill in the form and click Generate</h3>
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Your resume preview will appear here in the exact format of the sample — single page, hyperlinks, ATS-optimised.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* COVER LETTER TAB */
          <div style={{ display: "flex", gap: "20px", width: "100%" }}>
            <div style={{ width: "380px", flexShrink: 0 }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid #E2E8F0" }}>
                <div style={sech}>Cover Letter Details</div>
                <label style={lbl}>Company Name</label>
                <input style={inp} value={cover.companyName} onChange={e => setCover(p => ({ ...p, companyName: e.target.value }))} placeholder="Google, Infosys, Startup..." />
                <label style={lbl}>Job Title Applying For</label>
                <input style={inp} value={cover.jobTitle} onChange={e => setCover(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Software Engineer Intern" />
                <label style={lbl}>Hiring Manager Name</label>
                <input style={inp} value={cover.hiringManager} onChange={e => setCover(p => ({ ...p, hiringManager: e.target.value }))} placeholder="Hiring Manager" />
                <label style={lbl}>Why this company? (2-3 sentences)</label>
                <textarea style={{ ...inp, height: "80px", resize: "vertical" }} value={cover.whyCompany} onChange={e => setCover(p => ({ ...p, whyCompany: e.target.value }))} placeholder="I admire your work in AI and your culture of innovation..." />
                <label style={lbl}>Your Key Strength to Highlight</label>
                <input style={inp} value={cover.keyStrength} onChange={e => setCover(p => ({ ...p, keyStrength: e.target.value }))} placeholder="Full-stack AI development with AWS" />
                <label style={lbl}>Available From</label>
                <input style={inp} value={cover.availableDate} onChange={e => setCover(p => ({ ...p, availableDate: e.target.value }))} placeholder="immediately / June 2025" />
                <button onClick={generateCoverLetter} disabled={loading || !cover.companyName || !cover.jobTitle} style={{ width: "100%", padding: "13px", background: loading ? "#E2E8F0" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: loading ? "#94A3B8" : "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px" }}>
                  {loading ? "Generating with Gemini AI..." : "✨ Generate Cover Letter"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {coverGenerated ? (
                <div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                    <button onClick={printCover} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>🖨️ Print / Save as PDF</button>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "40px 50px", border: "1.5px solid #E2E8F0", fontFamily: "Arial, sans-serif", fontSize: "11pt", lineHeight: 1.7, color: "#1a1a1a", whiteSpace: "pre-wrap", minHeight: "297mm" }}>
                    {coverLetter}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>✉️</div>
                  <h3 style={{ color: "#1E293B", marginBottom: "8px" }}>AI-Powered Cover Letter</h3>
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Fill in the details and Gemini AI will write a professional, personalised cover letter using your resume data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
