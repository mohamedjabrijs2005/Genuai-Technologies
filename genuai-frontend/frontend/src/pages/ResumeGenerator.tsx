import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Props {
  user: any;
  onBack: () => void;
}

export default function ResumeGenerator({ user, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverForm, setCoverForm] = useState({ company: "", role: "", hiring_manager: "Hiring Manager" });
  const [activeTab, setActiveTab] = useState<"resume"|"cover">("resume");
  const [form, setForm] = useState({
    name: user?.user?.name || user?.name || "",
    email: user?.user?.email || user?.email || "",
    phone: "", location: "", linkedin: "", github: "",
    summary: "", experience: "", education: "",
    skills: "", projects: "", achievements: "", certifications: ""
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inp: any = { width: "100%", padding: "10px 14px", marginBottom: "12px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px", boxSizing: "border-box", outline: "none" };
  const lbl: any = { color: "#64748B", fontSize: "12px", display: "block", marginBottom: "5px" };
  const btn: any = { padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" };

  const getAISuggestions = async () => {
    setAiLoading(true);
    try {
      const skillsArr = form.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      const missingSkills = ["Docker","Kubernetes","CI/CD","System Design","REST APIs","Git","Agile","Unit Testing"].filter(s => !skillsArr.includes(s));
      setSuggestions({
        summaryTip: form.summary.length < 100 ? "Your summary is too short. Add 2-3 sentences about your expertise and career goals." : form.summary.length > 500 ? "Your summary is too long. Keep it under 4 sentences for best ATS results." : "Your summary length is good!",
        experienceTip: !form.experience ? "Add work experience or internships. Even college projects count!" : form.experience.split("\n").length < 3 ? "Add bullet points with measurable achievements. Example: Reduced load time by 40%" : "Good experience section!",
        skillsTip: skillsArr.length < 5 ? "Add more skills! Aim for 8-12 skills for better ATS scoring." : skillsArr.length > 15 ? "Too many skills. Focus on your top 10-12 most relevant ones." : "Good skills count!",
        missingSkills: missingSkills.slice(0, 4),
        projectsTip: !form.projects ? "Add at least 2-3 projects with tech stack and impact." : "Good projects section!",
        achievementsTip: !form.achievements ? "Add achievements and awards — they significantly boost your profile!" : "Great achievements section!",
        atsScore: Math.min(100, Math.round((form.summary ? 15 : 0) + (form.experience ? 25 : 0) + (form.education ? 15 : 0) + (skillsArr.length >= 5 ? 20 : skillsArr.length * 4) + (form.projects ? 15 : 0) + (form.achievements ? 10 : 0))),
      });
    } catch { setSuggestions({ summaryTip: "Add a strong professional summary", experienceTip: "Add your work experience", skillsTip: "Add your technical skills", missingSkills: ["Docker","Git","Agile","REST APIs"], projectsTip: "Add your projects", achievementsTip: "Add achievements", atsScore: 50 }); }
    setAiLoading(false);
  };

  const generateCoverLetter = () => {
    setCoverLoading(true);
    setTimeout(() => {
      const skills3 = (form.skills || "software development").split(",").slice(0,3).join(", ");
      const projects3 = form.projects ? form.projects.split("\n").slice(0,3).join("\n") : "I have built multiple full-stack applications using modern technologies.";
      const lines = [
        "Dear " + coverForm.hiring_manager + ",",
        "",
        "I am writing to express my strong interest in the " + coverForm.role + " position at " + coverForm.company + ". With my background in " + (form.skills || "software development") + " and hands-on experience building real-world projects, I am confident in my ability to contribute meaningfully to your team.",
        "",
        form.summary || "I am a passionate developer with a strong foundation in computer science and a drive to build impactful products.",
        "",
        "During my journey, I have worked on key projects:",
        projects3,
        "",
        form.achievements ? "Key achievements:\n" + form.achievements : "I am a quick learner who thrives in challenging environments and consistently delivers high-quality work.",
        "",
        "I am particularly drawn to " + coverForm.company + " because of its commitment to innovation. My skills in " + skills3 + " align perfectly with your requirements.",
        "",
        "I would welcome the opportunity to discuss how my background can contribute to " + coverForm.company + "'s success. Thank you for considering my application.",
        "",
        "Warm regards,",
        form.name,
        form.email + (form.phone ? " | " + form.phone : ""),
        form.linkedin || ""
      ];
      setCoverLetter(lines.join("\n"));
      setCoverLoading(false);
    }, 1500);
  };

  const generateResume = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); setStep(3); }, 1500);
  };

  const downloadResume = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; } .header { border-bottom: 3px solid #00B87C; padding-bottom: 16px; margin-bottom: 16px; } .name { font-size: 28pt; font-weight: bold; color: #0A0A0F; } .contact { display: flex; gap: 20px; flex-wrap: wrap; font-size: 10pt; color: #444; margin-top: 8px; } .section { margin-bottom: 16px; } .section-title { font-size: 13pt; font-weight: bold; color: #00B87C; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 8px; } .content { font-size: 11pt; line-height: 1.6; color: #333; white-space: pre-wrap; } .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; } .skill-tag { background: #f0faf5; border: 1px solid #00B87C; color: #00B87C; padding: 3px 10px; border-radius: 12px; font-size: 10pt; font-weight: bold; } .footer { margin-top: 24px; text-align: center; font-size: 9pt; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }</style></head><body><div class="header"><div class="name">${form.name.toUpperCase()}</div><div class="contact">${form.email ? "<span>📧 " + form.email + "</span>" : ""}${form.phone ? "<span>📱 " + form.phone + "</span>" : ""}${form.location ? "<span>📍 " + form.location + "</span>" : ""}${form.linkedin ? "<span>🔗 " + form.linkedin + "</span>" : ""}${form.github ? "<span>💻 " + form.github + "</span>" : ""}</div></div>${form.summary ? '<div class="section"><div class="section-title">Professional Summary</div><div class="content">' + form.summary + "</div></div>" : ""}${form.experience ? '<div class="section"><div class="section-title">Work Experience</div><div class="content">' + form.experience + "</div></div>" : ""}${form.education ? '<div class="section"><div class="section-title">Education</div><div class="content">' + form.education + "</div></div>" : ""}${form.skills ? '<div class="section"><div class="section-title">Technical Skills</div><div class="skills-grid">' + form.skills.split(",").map((s: string) => '<span class="skill-tag">' + s.trim() + "</span>").join("") + "</div></div>" : ""}${form.projects ? '<div class="section"><div class="section-title">Projects</div><div class="content">' + form.projects + "</div></div>" : ""}${form.achievements ? '<div class="section"><div class="section-title">Achievements</div><div class="content">' + form.achievements + "</div></div>" : ""}${form.certifications ? '<div class="section"><div class="section-title">Certifications</div><div class="content">' + form.certifications + "</div></div>" : ""}<div class="footer">Generated by GenuAI Technologies</div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = form.name.replace(/ /g, "_") + "_Resume.html"; a.click();
    URL.revokeObjectURL(url);
  };

  const printResume = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body { font-family: Calibri, sans-serif; font-size: 11pt; padding: 40px; max-width: 800px; margin: 0 auto; } .header { border-bottom: 3px solid #00B87C; padding-bottom: 16px; margin-bottom: 16px; } .name { font-size: 28pt; font-weight: bold; } .contact { display: flex; gap: 20px; flex-wrap: wrap; font-size: 10pt; color: #444; margin-top: 8px; } .section { margin-bottom: 16px; } .section-title { font-size: 13pt; font-weight: bold; color: #00B87C; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-bottom: 8px; } .content { font-size: 11pt; line-height: 1.6; white-space: pre-wrap; } .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; } .skill-tag { background: #f0faf5; border: 1px solid #00B87C; color: #00B87C; padding: 3px 10px; border-radius: 12px; font-size: 10pt; font-weight: bold; } .footer { margin-top: 24px; text-align: center; font-size: 9pt; color: #aaa; }</style></head><body><div class="header"><div class="name">${form.name.toUpperCase()}</div><div class="contact">${form.email ? "<span>📧 " + form.email + "</span>" : ""}${form.phone ? "<span>📱 " + form.phone + "</span>" : ""}${form.location ? "<span>📍 " + form.location + "</span>" : ""}${form.linkedin ? "<span>🔗 " + form.linkedin + "</span>" : ""}${form.github ? "<span>💻 " + form.github + "</span>" : ""}</div></div>${form.summary ? '<div class="section"><div class="section-title">Professional Summary</div><div class="content">' + form.summary + "</div></div>" : ""}${form.experience ? '<div class="section"><div class="section-title">Work Experience</div><div class="content">' + form.experience + "</div></div>" : ""}${form.education ? '<div class="section"><div class="section-title">Education</div><div class="content">' + form.education + "</div></div>" : ""}${form.skills ? '<div class="section"><div class="section-title">Technical Skills</div><div class="skills-grid">' + form.skills.split(",").map((s: string) => '<span class="skill-tag">' + s.trim() + "</span>").join("") + "</div></div>" : ""}${form.projects ? '<div class="section"><div class="section-title">Projects</div><div class="content">' + form.projects + "</div></div>" : ""}${form.achievements ? '<div class="section"><div class="section-title">Achievements</div><div class="content">' + form.achievements + "</div></div>" : ""}${form.certifications ? '<div class="section"><div class="section-title">Certifications</div><div class="content">' + form.certifications + "</div></div>" : ""}<div class="footer">Generated by GenuAI Technologies</div></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, color: "#00B87C" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "16px" }}>Resume Generator</span></h1>
        <button onClick={onBack} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B" }}>Back</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("resume")} style={{ ...btn, background: activeTab === "resume" ? "#00B87C" : "#161B22", border: "1.5px solid #E2E8F0", color: activeTab === "resume" ? "#000" : "#64748B" }}>Resume Generator</button>
        <button onClick={() => setActiveTab("cover")} style={{ ...btn, background: activeTab === "cover" ? "#A78BFA" : "#161B22", border: "1.5px solid #E2E8F0", color: activeTab === "cover" ? "#000" : "#64748B" }}>AI Cover Letter</button>
      </div>

      {activeTab === "cover" ? (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #A78BFA", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ color: "#A78BFA", marginTop: 0 }}>AI Cover Letter Generator</h3>
            <label style={lbl}>Company Name *</label>
            <input value={coverForm.company} onChange={e => setCoverForm(p => ({ ...p, company: e.target.value }))} placeholder="Google, Amazon, TCS..." style={inp} />
            <label style={lbl}>Job Role *</label>
            <input value={coverForm.role} onChange={e => setCoverForm(p => ({ ...p, role: e.target.value }))} placeholder="Software Engineer, Data Scientist..." style={inp} />
            <label style={lbl}>Hiring Manager Name</label>
            <input value={coverForm.hiring_manager} onChange={e => setCoverForm(p => ({ ...p, hiring_manager: e.target.value }))} placeholder="Hiring Manager" style={inp} />
            <button onClick={generateCoverLetter} disabled={coverLoading || !coverForm.company || !coverForm.role} style={{ ...btn, background: "#A78BFA", color: "#000", width: "100%", padding: "14px" }}>{coverLoading ? "Generating Cover Letter..." : "Generate Cover Letter"}</button>
          </div>
          {coverLetter ? (
            <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ color: "#00B87C", margin: 0 }}>Your Cover Letter</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => navigator.clipboard.writeText(coverLetter)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px", padding: "6px 12px" }}>Copy</button>
                  <button onClick={() => { const blob = new Blob([coverLetter], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "CoverLetter_" + coverForm.company + ".txt"; a.click(); }} style={{ ...btn, background: "#00B87C", color: "#000", fontSize: "12px", padding: "6px 12px" }}>Download</button>
                </div>
              </div>
              <pre style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.8", whiteSpace: "pre-wrap", fontFamily: "sans-serif" }}>{coverLetter}</pre>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>✉️</div>
              <p>Fill in your resume details first, then generate a personalized cover letter!</p>
              <button onClick={() => setActiveTab("resume")} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", marginTop: "12px" }}>Go to Resume Generator</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Progress */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
            {["Personal Info", "Experience & Skills", "Preview & Download"].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "8px", textAlign: "center", borderRadius: "8px", background: step === i+1 ? "#00B87C" : step > i+1 ? "#1a4a3a" : "#161B22", color: step === i+1 ? "#000" : step > i+1 ? "#00B87C" : "#64748B", fontSize: "12px", fontWeight: "bold" }}>{i+1}. {s}</div>
            ))}
          </div>

          {step === 1 && (
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ color: "#00B87C", marginTop: 0 }}>Personal Information</h3>
              <label style={lbl}>Full Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" style={inp} />
              <label style={lbl}>Email *</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" style={inp} />
              <label style={lbl}>Phone *</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" style={inp} />
              <label style={lbl}>Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Chennai, Tamil Nadu" style={inp} />
              <label style={lbl}>LinkedIn URL</label>
              <input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inp} />
              <label style={lbl}>GitHub URL</label>
              <input value={form.github} onChange={e => set("github", e.target.value)} placeholder="https://github.com/yourname" style={inp} />
              <label style={lbl}>Professional Summary</label>
              <textarea value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Brief summary about yourself..." rows={4} style={inp} />
              <button onClick={() => setStep(2)} disabled={!form.name || !form.email} style={{ ...btn, background: "#00B87C", color: "#000", width: "100%", padding: "14px" }}>Next — Experience & Skills</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ color: "#00B87C", marginTop: 0 }}>Experience, Education & Skills</h3>
              <label style={lbl}>Work Experience</label>
              <textarea value={form.experience} onChange={e => set("experience", e.target.value)} placeholder={"Software Engineer — TCS (2023-Present)\n• Developed REST APIs using Node.js"} rows={6} style={inp} />
              <label style={lbl}>Education</label>
              <textarea value={form.education} onChange={e => set("education", e.target.value)} placeholder={"B.Tech Computer Science — Sri Sairam Institute of Technology (2021-2025)\nCGPA: 8.5/10"} rows={4} style={inp} />
              <label style={lbl}>Technical Skills (comma separated)</label>
              <input value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="Python, React, Node.js, AWS, SQL" style={inp} />
              <label style={lbl}>Projects</label>
              <textarea value={form.projects} onChange={e => set("projects", e.target.value)} placeholder={"GenuAI Technologies — AI Recruitment Platform\n• Built end-to-end AI recruitment system on AWS"} rows={5} style={inp} />
              <label style={lbl}>Achievements & Awards</label>
              <textarea value={form.achievements} onChange={e => set("achievements", e.target.value)} placeholder={"• 1st Rank — AI-PrepPulse Hackathon (60,000+ participants)"} rows={3} style={inp} />
              <label style={lbl}>Certifications</label>
              <textarea value={form.certifications} onChange={e => set("certifications", e.target.value)} placeholder={"• AWS Cloud Practitioner"} rows={3} style={inp} />

              <button onClick={getAISuggestions} disabled={aiLoading} style={{ ...btn, background: "#A78BFA", color: "#000", width: "100%", padding: "12px", marginBottom: "16px" }}>{aiLoading ? "Analyzing Resume..." : "Get AI Suggestions"}</button>

              {suggestions && (
                <div style={{ background: "#FFFFFF", border: "1px solid #A78BFA", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ color: "#A78BFA", margin: 0 }}>AI Resume Analysis</h4>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "28px", fontWeight: "bold", color: suggestions.atsScore >= 80 ? "#00B87C" : suggestions.atsScore >= 60 ? "#F59E0B" : "#FF4444" }}>{suggestions.atsScore}%</div>
                      <div style={{ color: "#64748B", fontSize: "11px" }}>ATS Score</div>
                    </div>
                  </div>
                  {[["Professional Summary", suggestions.summaryTip, "#00D4FF"], ["Work Experience", suggestions.experienceTip, "#00B87C"], ["Technical Skills", suggestions.skillsTip, "#F59E0B"], ["Projects", suggestions.projectsTip, "#A78BFA"], ["Achievements", suggestions.achievementsTip, "#FF6B6B"]].map(([label, tip, color]: any) => (
                    <div key={label} style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid " + color }}>
                      <div style={{ color: color, fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>{label}</div>
                      <div style={{ color: "#64748B", fontSize: "13px" }}>{tip}</div>
                    </div>
                  ))}
                  {suggestions.missingSkills.length > 0 && (
                    <div style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "8px", borderLeft: "3px solid #F59E0B" }}>
                      <div style={{ color: "#F59E0B", fontWeight: "bold", fontSize: "12px", marginBottom: "6px" }}>Missing In-Demand Skills</div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {suggestions.missingSkills.map((s: string) => (
                          <span key={s} onClick={() => set("skills", form.skills ? form.skills + ", " + s : s)} style={{ padding: "3px 10px", background: "#F59E0B22", border: "1px solid #F59E0B", borderRadius: "12px", color: "#F59E0B", fontSize: "12px", cursor: "pointer" }}>+ {s}</span>
                        ))}
                      </div>
                      <div style={{ color: "#64748B", fontSize: "11px", marginTop: "6px" }}>Click to add to your skills</div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setStep(1)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", flex: 1, padding: "12px" }}>Back</button>
                <button onClick={generateResume} disabled={loading} style={{ ...btn, background: "#00B87C", color: "#000", flex: 2, padding: "12px" }}>{loading ? "Generating..." : "Generate Resume"}</button>
              </div>
            </div>
          )}

          {step === 3 && generated && (
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
                <div style={{ borderBottom: "3px solid #00B87C", paddingBottom: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1E293B" }}>{form.name.toUpperCase()}</div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px", fontSize: "13px", color: "#64748B" }}>
                    {form.email && <span>📧 {form.email}</span>}
                    {form.phone && <span>📱 {form.phone}</span>}
                    {form.location && <span>📍 {form.location}</span>}
                    {form.linkedin && <span>🔗 LinkedIn</span>}
                    {form.github && <span>💻 GitHub</span>}
                  </div>
                </div>
                {form.summary && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>PROFESSIONAL SUMMARY</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6" }}>{form.summary}</div></div>}
                {form.experience && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>WORK EXPERIENCE</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{form.experience}</div></div>}
                {form.education && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>EDUCATION</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{form.education}</div></div>}
                {form.skills && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>TECHNICAL SKILLS</div><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{form.skills.split(",").map((s: string, i: number) => <span key={i} style={{ background: "#DCFCE7", color: "#00B87C", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>{s.trim()}</span>)}</div></div>}
                {form.projects && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>PROJECTS</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{form.projects}</div></div>}
                {form.achievements && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>ACHIEVEMENTS</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{form.achievements}</div></div>}
                {form.certifications && <div style={{ marginBottom: "14px" }}><div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>CERTIFICATIONS</div><div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{form.certifications}</div></div>}
                <div style={{ marginTop: "16px", textAlign: "center", color: "#30363D", fontSize: "11px" }}>Generated by GenuAI Technologies · AI-Powered Recruitment Intelligence</div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={printResume} style={{ ...btn, background: "#00B87C", color: "#000", flex: 1, padding: "14px" }}>Print / Save as PDF</button>
                <button onClick={downloadResume} style={{ ...btn, background: "#00D4FF", color: "#000", flex: 1, padding: "14px" }}>Download HTML</button>
                <button onClick={() => setStep(2)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", flex: 1, padding: "14px" }}>Edit</button>
              </div>
              <p style={{ color: "#64748B", fontSize: "12px", textAlign: "center", marginTop: "12px" }}>Tip: Click Print / Save as PDF → Select Save as PDF in the print dialog</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "40px", paddingTop: "20px", paddingBottom: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: "0 0 4px" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#CBD5E1", fontSize: "11px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved. · Built by Mohamed Jabri Jaffar Sadiq · Sri Sairam Institute of Technology, Chennai</p>
      </div>
    </div>
  );
}
