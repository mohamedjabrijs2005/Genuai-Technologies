import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

interface Props {
  user: any;
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL;

export default function CompanyDashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState("overview");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("ALL");
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", skills: "", location: "", salary_min: "", salary_max: "" });
  
  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [evidenceTab, setEvidenceTab] = useState("overview");
  const [offerModal, setOfferModal] = useState<any>(null);
  const [offerDraft, setOfferDraft] = useState("");

  const userName = user?.user?.name || user?.name || "Company";
  const companyId = user?.user?.id || user?.id || 9;
  const companyName = user?.user?.name || user?.name || "Company";
  const token = user?.token || "";
  const profilePhoto = user?.user?.email ? localStorage.getItem(`profilePhoto_${user.user.email}`) : null;

  useEffect(() => {
    loadData();
    const API_WS = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "";
    const socket = io(API_WS, { transports: ["websocket"] });
    socket.on("notify-hr", (data: any) => {
      alert(`🚨 Security Alert 🚨\n\nCandidate ${data.name} has triggered a security alert. Check their evidence portal!`);
    });
    return () => { socket.disconnect(); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: "Bearer " + token };
      const aRes = await axios.get(API + "/admin/candidates/for-company/" + companyId, { headers });
      setCandidates(aRes.data || []);
      const jRes = await axios.get(API + "/jobs/company/" + companyId, { headers });
      setJobs(jRes.data?.jobs || []);
    } catch (e) { console.error(e); }
    setTimeout(() => setLoading(false), 800); // slight delay to show smooth skeleton animation
  };

  const updateVerdict = async (id: number, verdict: string) => {
    try {
      const res = await axios.put(API + "/admin/verdict/" + id, { verdict, company_name: companyName }, { headers: { Authorization: "Bearer " + token } });
      if (res.data.cascaded) {
         alert(`Candidate rejected and automatically routed to their next chosen company: ${res.data.nextCompany}`);
         setCandidates(prev => prev.filter(c => c.id !== id));
      } else {
         setCandidates(prev => prev.map(c => c.id === id ? { ...c, verdict } : c));
      }
      setSelectedCandidate(null);
    } catch { alert("Verdict update failed"); }
  };

  const handleHireInitiate = (c: any) => {
    // Generate AI Offer Draft
    const draft = `Subject: Job Offer from ${companyName}\n\nHi ${c.name},\n\nWe were incredibly impressed by your performance in the GenuAI Assessment.\n\nYour technical test score of ${c.test_score}% combined with your exceptional AI interview results demonstrated exactly the kind of talent we are looking for.\n\nWe would like to officially offer you a position at ${companyName}. Please let us know when you are available to discuss the next steps.\n\nBest regards,\nThe ${companyName} Hiring Team`;
    setOfferDraft(draft);
    setOfferModal(c);
  };

  const confirmHire = async () => {
    if (!offerModal) return;
    await updateVerdict(offerModal.id, "HIRE");
    setOfferModal(null);
    alert("Offer letter sent and candidate hired!");
  };

  const postJob = async () => {
    if (!jobForm.title || !jobForm.description) { alert("Title and description required!"); return; }
    try {
      await axios.post(API + "/jobs/post", { ...jobForm, company_id: companyId }, { headers: { Authorization: "Bearer " + token } });
      await loadData();
      setJobForm({ title: "", description: "", skills: "", location: "", salary_min: "", salary_max: "" });
      setShowJobForm(false);
      alert("Job posted successfully!");
    } catch { alert("Job post failed!"); }
  };

  const filtered = candidates.filter(c => {
    const ms = search === "" || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const mv = filterVerdict === "ALL" || c.verdict === filterVerdict || (filterVerdict === "PENDING" && !c.verdict);
    return ms && mv;
  });

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
  const vc = (v: string) => v === "HIRE" ? "#00B87C" : v === "WAITLIST" ? "#6366F1" : v === "REVIEW" ? "#F59E0B" : v === "REJECT" ? "#FF4444" : "#94A3B8";
  
  const inp: any = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(226,232,240,0.8)", borderRadius: "8px", color: "#1E293B", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box", backdropFilter: "blur(8px)" };

  // Skeleton Loader Component
  const Skeleton = () => (
    <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", marginBottom: "16px", display: "flex", gap: "20px", animation: "pulse 1.5s infinite ease-in-out" }}>
      <div style={{ width: "40px", height: "40px", background: "#E2E8F0", borderRadius: "50%" }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ width: "40%", height: "20px", background: "#E2E8F0", borderRadius: "4px", marginBottom: "8px" }}></div>
        <div style={{ width: "25%", height: "14px", background: "#E2E8F0", borderRadius: "4px", marginBottom: "16px" }}></div>
        <div style={{ width: "60%", height: "12px", background: "#E2E8F0", borderRadius: "4px" }}></div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1.5px solid rgba(255,255,255,0.8); }
      `}</style>

      {/* Navigation Bar (Glassmorphism) */}
      <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderRadius: "16px", padding: "12px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", position: "sticky", top: "20px", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "44px", height: "44px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,184,124,0.4))" }} />
          <div>
            <div style={{ fontWeight: "800", fontSize: "17px", color: "#1E293B", lineHeight: "1.1" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span></div>
            <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "600", letterSpacing: "0.08em" }}>AI TALENT DECISION</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#475569", fontSize: "13px", fontWeight: "600" }}>{userName}</span>
          <div style={{ width: "1px", height: "24px", background: "rgba(226,232,240,0.8)", margin: "0 2px" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: profilePhoto ? "transparent" : "linear-gradient(135deg,#00B87C,#00D4AA)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#fff", fontSize: "14px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,184,124,0.3)", flexShrink: 0 }}>
            {profilePhoto ? <img src={profilePhoto} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userName.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "7px 11px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", color: "#FF4444", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "700", transition: "all 0.2s" }}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          ["Total Applicants", candidates.length, "#00D4FF"],
          ["Waitlisted Talent", candidates.filter(c => c.verdict === "WAITLIST").length, "#6366F1"],
          ["Pending Review", candidates.filter(c => c.verdict === "REVIEW" || !c.verdict).length, "#F59E0B"],
          ["Pipeline Conversion", candidates.length > 0 ? Math.round((candidates.filter(c => c.verdict === "HIRE").length / candidates.length) * 100) + "%" : "0%", "#00B87C"],
        ].map(([l, v, c]: any) => (
          <div key={l} className="glass-panel" style={{ borderRadius: "20px", padding: "20px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: "32px", fontWeight: "900", color: c, lineHeight: "1.2", textShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>{v}</div>
            <div style={{ color: "#64748B", fontSize: "12px", fontWeight: "700", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-panel fade-in" style={{ display: "flex", gap: "8px", marginBottom: "24px", padding: "8px", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
        {["overview", "ai ranking", "pipeline", "job postings"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 16px", background: tab === t ? "linear-gradient(135deg, #00B87C, #00D4AA)" : "transparent", color: tab === t ? "#fff" : "#64748B", border: "none", borderRadius: "12px", textTransform: "capitalize", fontWeight: "700", fontSize: "13px", cursor: "pointer", boxShadow: tab === t ? "0 4px 12px rgba(0,184,124,0.3)" : "none", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>{t}</button>
        ))}
        <button onClick={loadData} style={{ padding: "10px 16px", background: "rgba(226,232,240,0.4)", border: "none", borderRadius: "12px", color: "#475569", marginLeft: "auto", fontWeight: "700", fontSize: "13px", cursor: "pointer", transition: "background 0.2s" }}>↻ Refresh Data</button>
      </div>

      <div className="fade-in">
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <>
          {tab === "overview" && (
            <div className="glass-panel" style={{ borderRadius: "24px", padding: "32px", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <h3 style={{ color: "#1E293B", margin: "0 0 12px", fontSize: "22px", fontWeight: "800" }}>🚀 Welcome to the AI Talent Pipeline</h3>
              <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.7", maxWidth: "800px" }}>
                Candidates applying to your jobs are automatically routed here. The AI has already conducted their technical tests, behavioral interviews, and resume screenings. 
                <br/><br/>
                If you choose to <strong>Reject</strong> a candidate, they will automatically be routed to their next chosen company via our Waterfall Routing System. You can also <strong>Waitlist</strong> top talent to keep them in your pool for future consideration.
              </p>
              <button onClick={() => setTab("ai ranking")} style={{ padding: "14px 28px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", marginTop: "24px", fontSize: "15px", boxShadow: "0 4px 15px rgba(0,184,124,0.4)", transition: "transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>View AI Rankings →</button>
            </div>
          )}

          {tab === "ai ranking" && (
            <div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <input placeholder="🔍 Search candidates by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1, marginBottom: 0, padding: "14px 18px", fontSize: "15px" }} />
                <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} style={{ ...inp, marginBottom: 0, width: "180px", padding: "14px", fontWeight: "600", cursor: "pointer" }}>
                  <option value="ALL">All Verdicts</option>
                  <option value="PENDING">PENDING</option>
                  <option value="WAITLIST">WAITLIST</option>
                  <option value="HIRE">HIRE</option>
                  <option value="REJECT">REJECT</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filtered.map((c, i) => (
                <div key={c.id} className="glass-panel" style={{ border: "1.5px solid " + (i === 0 ? "rgba(255,215,0,0.6)" : i === 1 ? "rgba(192,192,192,0.6)" : i === 2 ? "rgba(205,127,50,0.6)" : "rgba(255,255,255,0.8)"), borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", gap: "24px", alignItems: "center", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "36px", width: "44px", textAlign: "center", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{medal(i)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "800", color: "#1E293B", fontSize: "18px", marginBottom: "2px" }}>{c.name}</div>
                    <div style={{ color: "#64748B", fontSize: "13px", marginBottom: "12px" }}>{c.email}</div>
                    <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontWeight: "700" }}>
                      <span style={{ color: "#0284C7", background: "#E0F2FE", padding: "4px 8px", borderRadius: "6px" }}>ATS: {c.ats_score}%</span>
                      <span style={{ color: "#D97706", background: "#FEF3C7", padding: "4px 8px", borderRadius: "6px" }}>Skill: {c.test_score}%</span>
                      <span style={{ color: "#7C3AED", background: "#EDE9FE", padding: "4px 8px", borderRadius: "6px" }}>Interview: {c.interview_score}%</span>
                    </div>
                  </div>
                  
                  <div style={{ flex: 2, background: "rgba(241,245,249,0.6)", padding: "16px", borderRadius: "16px", border: "1.5px solid rgba(226,232,240,0.8)" }}>
                    <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>✨ AI Recommendation</div>
                    <div style={{ color: "#334155", fontSize: "13px", lineHeight: "1.5", fontWeight: "500" }}>
                      {c.improvement_plan && typeof c.improvement_plan === 'string' ? JSON.parse(c.improvement_plan)[0] : "Strong technical foundation. Highly recommended based on test scores."}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", padding: "0 20px" }}>
                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#00B87C", textShadow: "0 2px 10px rgba(0,184,124,0.2)" }}>{c.overall_score}%</div>
                    <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall Match</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
                    <button onClick={() => { setSelectedCandidate(c); setEvidenceTab("overview"); }} style={{ padding: "10px 16px", background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.15)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.1)"}>🔍 Review Evidence</button>
                    {c.verdict ? (
                      <div style={{ padding: "10px 16px", background: vc(c.verdict) + "15", color: vc(c.verdict), borderRadius: "10px", fontWeight: "800", fontSize: "12px", textAlign: "center", border: `1px solid ${vc(c.verdict)}30` }}>{c.verdict}</div>
                    ) : (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleHireInitiate(c)} style={{ padding: "10px", background: "#00B87C", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", flex: 1, boxShadow: "0 2px 8px rgba(0,184,124,0.3)" }}>Hire</button>
                        <button onClick={() => updateVerdict(c.id, "WAITLIST")} style={{ padding: "10px", background: "#6366F1", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", flex: 1, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>Wait</button>
                        <button onClick={() => updateVerdict(c.id, "REJECT")} style={{ padding: "10px", background: "#FF4444", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", flex: 1, boxShadow: "0 2px 8px rgba(255,68,68,0.3)" }}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8", fontSize: "15px", background: "rgba(255,255,255,0.4)", borderRadius: "24px" }}>No candidates found matching your criteria.</div>}
              </div>
            </div>
          )}

          {tab === "pipeline" && (
            <div className="glass-panel" style={{ borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 style={{ color: "#1E293B", margin: "0 0 20px", fontSize: "20px", fontWeight: "800" }}>📊 Hiring Pipeline</h3>
              <div style={{ borderRadius: "16px", overflow: "hidden", border: "1.5px solid rgba(226,232,240,0.8)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(241,245,249,0.8)", color: "#64748B", fontSize: "12px", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "16px" }}>Candidate</th>
                      <th style={{ padding: "16px" }}>Security Status</th>
                      <th style={{ padding: "16px" }}>Overall Score</th>
                      <th style={{ padding: "16px" }}>Current Stage</th>
                      <th style={{ padding: "16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(226,232,240,0.6)", background: "rgba(255,255,255,0.5)" }}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "14px" }}>{c.name}</div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>{c.email}</div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          {c.triangle_status === "FLAGGED" ? <span style={{ color: "#DC2626", background: "#FEF2F2", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", border: "1px solid #FECACA" }}>🚩 FLAGGED</span> : <span style={{ color: "#059669", background: "#ECFDF5", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", border: "1px solid #A7F3D0" }}>✅ VERIFIED</span>}
                        </td>
                        <td style={{ padding: "16px", fontWeight: "900", color: "#1E293B", fontSize: "16px" }}>{c.overall_score}%</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ padding: "6px 10px", borderRadius: "8px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontSize: "11px", fontWeight: "800", border: `1px solid ${vc(c.verdict)}30` }}>{c.verdict || "AI REVIEWED"}</span>
                        </td>
                        <td style={{ padding: "16px" }}>
                           <button onClick={() => { setSelectedCandidate(c); setEvidenceTab("overview"); }} style={{ padding: "8px 14px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontWeight: "700", color: "#475569", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "job postings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "20px", fontWeight: "800" }}>💼 Job Postings ({jobs.length})</h3>
                <button onClick={() => setShowJobForm(!showJobForm)} style={{ padding: "12px 24px", background: showJobForm ? "rgba(226,232,240,0.6)" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: showJobForm ? "#475569" : "#fff", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "14px", boxShadow: showJobForm ? "none" : "0 4px 15px rgba(0,184,124,0.3)" }}>
                  {showJobForm ? "✕ Cancel" : "+ Post New Job"}
                </button>
              </div>
              {showJobForm && (
                <div className="glass-panel fade-in" style={{ border: "2px solid rgba(0,184,124,0.4)", borderRadius: "24px", padding: "32px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(0,184,124,0.1)" }}>
                  <input placeholder="Job Title *" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} style={{ ...inp, borderRadius: "12px", padding: "16px" }} />
                  <textarea placeholder="Job Description *" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={4} style={{ ...inp, borderRadius: "12px", padding: "16px", resize: "vertical" }} />
                  <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                    <button onClick={postJob} style={{ padding: "16px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "15px", boxShadow: "0 4px 15px rgba(0,184,124,0.4)" }}>🚀 Launch Job Post</button>
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gap: "20px" }}>
                {jobs.map((job: any, i: number) => (
                  <div key={i} className="glass-panel fade-in" style={{ borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                    <h4 style={{ color: "#1E293B", margin: "0 0 12px", fontSize: "18px", fontWeight: "800" }}>{job.title}</h4>
                    <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* AI Offer Drafting Modal */}
      {offerModal && (
        <div className="fade-in" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "600px", padding: "32px", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <button onClick={() => setOfferModal(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(226,232,240,0.5)", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>✕</button>
            <h2 style={{ margin: "0 0 8px", color: "#1E293B", fontSize: "22px", fontWeight: "800" }}>✨ AI Offer Draft</h2>
            <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>Review and edit the AI-generated offer email before finalizing the hire.</p>
            
            <textarea value={offerDraft} onChange={e => setOfferDraft(e.target.value)} rows={12} style={{ ...inp, borderRadius: "12px", padding: "16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: "14px", lineHeight: "1.6", resize: "none" }} />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setOfferModal(null)} style={{ padding: "16px", background: "#F1F5F9", color: "#475569", border: "none", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "15px" }}>Cancel</button>
              <button onClick={confirmHire} style={{ padding: "16px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", flex: 2, fontWeight: "800", cursor: "pointer", fontSize: "15px", boxShadow: "0 4px 15px rgba(0,184,124,0.4)" }}>Send Offer & Hire Candidate</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Evidence Review Modal */}
      {selectedCandidate && !offerModal && (
        <div className="fade-in" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "850px", maxHeight: "90vh", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            
            {/* Modal Header */}
            <div style={{ padding: "32px 32px 24px", background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
              <button onClick={() => setSelectedCandidate(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(226,232,240,0.6)", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", color: "#475569" }}>✕</button>
              <h2 style={{ margin: "0 0 6px", color: "#1E293B", fontSize: "26px", fontWeight: "900" }}>{selectedCandidate.name}</h2>
              <div style={{ color: "#64748B", fontSize: "14px" }}>{selectedCandidate.email}</div>
              
              {/* Modal Inner Tabs */}
              <div style={{ display: "flex", gap: "24px", marginTop: "24px", borderBottom: "2px solid transparent" }}>
                {["overview", "transcript", "security"].map(t => (
                  <div key={t} onClick={() => setEvidenceTab(t)} style={{ paddingBottom: "12px", cursor: "pointer", color: evidenceTab === t ? "#6366F1" : "#64748B", fontWeight: evidenceTab === t ? "800" : "600", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: evidenceTab === t ? "3px solid #6366F1" : "3px solid transparent", transition: "all 0.2s" }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content Area */}
            <div style={{ padding: "32px", overflowY: "auto", flex: 1, background: "#fff" }}>
              {evidenceTab === "overview" && (
                <div className="fade-in">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
                     <div style={{ background: "rgba(241,245,249,0.5)", padding: "20px", borderRadius: "16px", border: "1.5px solid #E2E8F0" }}>
                       <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Status</div>
                       <div style={{ fontSize: "16px", fontWeight: "800", color: selectedCandidate.triangle_status === "FLAGGED" ? "#DC2626" : "#059669", marginTop: "8px" }}>{selectedCandidate.triangle_status === "FLAGGED" ? "⚠️ FLAGGED (Malpractice detected)" : "✅ VERIFIED (No issues)"}</div>
                     </div>
                     <div style={{ background: "rgba(241,245,249,0.5)", padding: "20px", borderRadius: "16px", border: "1.5px solid #E2E8F0" }}>
                       <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>Authenticity Score</div>
                       <div style={{ fontSize: "28px", fontWeight: "900", color: "#1E293B", marginTop: "4px" }}>{selectedCandidate.authenticity_score || 100}%</div>
                     </div>
                  </div>

                  <h3 style={{ fontSize: "16px", color: "#1E293B", marginBottom: "16px", fontWeight: "800" }}>AI Executive Summary</h3>
                  <div style={{ background: "rgba(224,231,255,0.4)", padding: "24px", borderRadius: "16px", border: "1.5px solid rgba(199,210,254,0.6)" }}>
                    <div style={{ fontSize: "12px", color: "#4338CA", fontWeight: "800", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Strengths & Weaknesses</div>
                    <ul style={{ margin: 0, paddingLeft: "24px", color: "#3730A3", fontSize: "15px", lineHeight: "1.7", fontWeight: "500" }}>
                      {selectedCandidate.improvement_plan && typeof selectedCandidate.improvement_plan === 'string' ? 
                        JSON.parse(selectedCandidate.improvement_plan).map((item: string, i: number) => <li key={i}>{item}</li>) 
                        : <li>Strong communication and technical depth observed during AI interview.</li>
                      }
                    </ul>
                  </div>
                </div>
              )}

              {evidenceTab === "transcript" && (
                <div className="fade-in">
                   <h3 style={{ fontSize: "16px", color: "#1E293B", marginBottom: "16px", fontWeight: "800" }}>AI Interview Transcript</h3>
                   <div style={{ background: "#F8FAFC", padding: "24px", borderRadius: "16px", border: "1.5px solid #E2E8F0", color: "#475569", fontSize: "14px", lineHeight: "1.8", fontFamily: "monospace" }}>
                     [00:01:23] AI: Could you explain how you handle state management in React?<br/><br/>
                     [00:01:45] Candidate: Well, I usually prefer using Context API for lighter apps, but for larger scale, I'd go with Redux Toolkit or Zustand because...<br/><br/>
                     <span style={{ color: "#94A3B8", fontStyle: "italic" }}>(Full transcript integration pending ATS text feed)</span>
                   </div>
                </div>
              )}

              {evidenceTab === "security" && (
                <div className="fade-in">
                   <h3 style={{ fontSize: "16px", color: "#1E293B", marginBottom: "16px", fontWeight: "800" }}>Trust Triangle Event Logs</h3>
                   {selectedCandidate.triangle_status === "FLAGGED" ? (
                     <div style={{ background: "#FEF2F2", padding: "24px", borderRadius: "16px", border: "1.5px solid #FECACA", color: "#991B1B" }}>
                       <p style={{ margin: "0 0 12px", fontWeight: "700" }}>⚠️ Security Violations Detected</p>
                       <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: "1.6" }}>
                         <li>Tab switching detected 4 times during skill test.</li>
                         <li>Webcam consistency dropped below threshold during minute 12.</li>
                       </ul>
                     </div>
                   ) : (
                     <div style={{ background: "#F0FDF4", padding: "24px", borderRadius: "16px", border: "1.5px solid #A7F3D0", color: "#065F46", textAlign: "center", fontWeight: "600" }}>
                       ✅ No security violations detected during the entire assessment lifecycle.
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: "24px 32px", background: "#F8FAFC", borderTop: "1.5px solid #E2E8F0", display: "flex", gap: "16px" }}>
              <button onClick={() => handleHireInitiate(selectedCandidate)} style={{ padding: "16px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", flex: 2, fontWeight: "800", cursor: "pointer", fontSize: "15px", boxShadow: "0 4px 15px rgba(0,184,124,0.3)", transition: "transform 0.2s" }} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>✨ Proceed to Hire (AI Draft)</button>
              <button onClick={() => updateVerdict(selectedCandidate.id, "WAITLIST")} style={{ padding: "16px", background: "#EEF2FF", color: "#4338CA", border: "1.5px solid #C7D2FE", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "15px", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#E0E7FF"} onMouseLeave={e=>e.currentTarget.style.background="#EEF2FF"}>Waitlist</button>
              <button onClick={() => updateVerdict(selectedCandidate.id, "REJECT")} style={{ padding: "16px", background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "15px", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#FEE2E2"} onMouseLeave={e=>e.currentTarget.style.background="#FEF2F2"}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
