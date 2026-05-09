import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
interface Props {
  user: any;
  onLogout: () => void;
  onInterview?: (roomId: string) => void;
}

const API = import.meta.env.VITE_API_URL;

export default function CompanyDashboard({ user, onLogout, onInterview }: Props) {
  const [tab, setTab] = useState("overview");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("ALL");
  const [overriding, setOverriding] = useState<number | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", skills: "", location: "", salary_min: "", salary_max: "" });
  const [interviewForm, setInterviewForm] = useState({ candidate_id: "", job_title: "", scheduled_at: "", notes: "" });
  const [scheduledRoomId, setScheduledRoomId] = useState("");
  const [intDate, setIntDate] = useState("");
  const [intHour, setIntHour] = useState("10");
  const [intMin, setIntMin] = useState("00");
  const [intAmPm, setIntAmPm] = useState("AM");
  const [emailStatus, setEmailStatus] = useState<string>("");
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const userName = user?.user?.name || user?.name || "Company";
  const companyId = user?.user?.id || user?.id || 9;
  const companyName = user?.user?.name || user?.name || "Company";
  const token = user?.token || "";

  useEffect(() => {
    loadData();

    const API_WS = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "";
    const socket = io(API_WS, { transports: ["websocket"] });

    socket.on("notify-hr", (data: any) => {
      alert(`🚨 HR ALERT 🚨\n\nCandidate ${data.name} just joined Room: ${data.roomId}\n\nSecurity: ${data.camerasExpected === 2 ? "MEDIUM/HIGH RISK" : "LOW RISK"}\nCameras Required: ${data.camerasExpected}\n\nYou can click 'Start Room / Join' in your Interviews tab!`);
    });

    return () => { socket.disconnect(); };
  }, []);


  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: "Bearer " + token };
      const [cRes, sRes] = await Promise.all([
        axios.get(API + "/admin/candidates", { headers }),
        axios.get(API + "/admin/stats", { headers }),
      ]);
      const sorted = (cRes.data || []).sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0));
      setCandidates(sorted);
      setStats(sRes.data);
      try {
        const jRes = await axios.get(API + "/jobs/company/" + companyId, { headers });
        setJobs(jRes.data?.jobs || []);
      } catch { setJobs([]); }
      try {
        const iRes = await axios.get(API + "/interviews/company/" + companyId, { headers });
        setInterviews(iRes.data?.interviews || []);
      } catch { setInterviews([]); }
      try {
        const aRes = await axios.get(API + "/admin/candidates/for-company/" + companyId, { headers });
        setApplications(aRes.data || []);
      } catch { setApplications([]); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const overrideVerdict = async (id: number, verdict: string) => {
    try {
      await axios.put(API + "/admin/verdict/" + id, { verdict }, { headers: { Authorization: "Bearer " + token } });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, verdict } : c));
      setOverriding(null);
    } catch { alert("Override failed"); }
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

  const scheduleInterview = async () => {
    if (!interviewForm.candidate_id || !interviewForm.scheduled_at) { alert("Candidate and date required!"); return; }
    try {
      const res = await axios.post(API + "/interviews/schedule", { ...interviewForm, company_id: companyId }, { headers: { Authorization: "Bearer " + token } });
      setScheduledRoomId(res.data.room_id);
      await loadData();
      setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", notes: "" });
      setShowInterviewForm(false);
    } catch (e: any) { alert("Schedule failed: " + e.message); }
  };

  const sendVerdictEmail = async (candidate: any, verdict: string) => {
    setEmailStatus("Sending...");
    try {
      await axios.post(API + "/email/verdict", {
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        verdict,
        companyName,
        jobTitle: "Software Engineer"
      }, { headers: { Authorization: "Bearer " + token } });
      setEmailStatus("Email sent to " + candidate.name + "!");
      setTimeout(() => setEmailStatus(""), 3000);
    } catch { setEmailStatus("Email failed — SES sandbox mode"); setTimeout(() => setEmailStatus(""), 3000); }
  };

  const exportCSV = () => {
    window.open(API + "/admin/export-csv", "_blank");
  };

  const filtered = candidates.filter(c => {
    const ms = search === "" || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const mv = filterVerdict === "ALL" || c.verdict === filterVerdict;
    return ms && mv;
  });

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
  const vc = (v: string) => v === "HIRE" ? "#00B87C" : v === "REVIEW" ? "#F59E0B" : "#FF4444";
  const badge = (score: number) => score >= 85 ? ["🥇 GOLD", "#FFD700"] : score >= 70 ? ["🥈 SILVER", "#C0C0C0"] : score >= 50 ? ["🥉 BRONZE", "#CD7F32"] : ["⚠️ LOW", "#FF4444"];
  const inp: any = { width: "100%", padding: "10px 14px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" };
  const btn: any = { padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px" };

  const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((s, c) => s + (c.overall_score || 0), 0) / candidates.length) : 0;
  const hireRate = candidates.length > 0 ? Math.round((candidates.filter(c => c.verdict === "HIRE").length / candidates.length) * 100) : 0;
  const roleData = candidates.reduce((acc: any, c) => { const r = c.role || "Unknown"; acc[r] = (acc[r] || 0) + 1; return acc; }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#fff", borderRadius: "16px", padding: "12px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 3px 12px rgba(0,184,124,0.4)" }} />
          <div>
            <div style={{ fontWeight: "800", fontSize: "17px", color: "#1E293B", lineHeight: "1.1" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span></div>
            <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "600", letterSpacing: "0.08em" }}>COMPANY DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>Welcome, {userName}</span>
          <button onClick={exportCSV} style={{ padding: "7px 11px", background: "#F0FDF4", color: "#00B87C", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>⬇ Export CSV</button>
          <div style={{ width: "1px", height: "24px", background: "#E2E8F0", margin: "0 2px" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#00B87C,#00D4AA)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#fff", fontSize: "14px", overflow: "hidden", border: "2px solid #E2E8F0", flexShrink: 0 }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "7px 11px", background: "transparent", border: "1px solid #FF4444", color: "#FF4444", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Logout</button>
        </div>
      </div>

      {emailStatus && (
        <div style={{ background: "#00B87C22", border: "1px solid #00B87C", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", color: "#00B87C" }}>
          ✅ {emailStatus}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          ["Total", candidates.length, "#00D4FF"],
          ["Hired", candidates.filter(c => c.verdict === "HIRE").length, "#00B87C"],
          ["Review", candidates.filter(c => c.verdict === "REVIEW").length, "#F59E0B"],
          ["Rejected", candidates.filter(c => c.verdict === "REJECT").length, "#FF4444"],
          ["Avg Score", avgScore + "%", "#A78BFA"],
          ["Hire Rate", hireRate + "%", "#00B87C"],
        ].map(([l, v, c]: any) => (
          <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "18px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: "28px", fontWeight: "900", color: c, lineHeight: "1.2" }}>{v}</div>
            <div style={{ color: "#64748B", fontSize: "12px", fontWeight: "600" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap", background: "#fff", padding: "8px", borderRadius: "16px", border: "1.5px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
        {["overview", "leaderboard", "all candidates", "applications", "job postings", "interviews", "intelligence", "compare"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 16px", background: tab === t ? "linear-gradient(135deg, #00B87C, #00D4AA)" : "transparent", color: tab === t ? "#fff" : "#64748B", border: "none", borderRadius: "12px", textTransform: "capitalize", fontWeight: "700", fontSize: "13px", cursor: "pointer", boxShadow: tab === t ? "0 4px 12px rgba(0,184,124,0.3)" : "none", transition: "all 0.2s" }}>{t}</button>
        ))}
        <button onClick={loadData} style={{ padding: "10px 16px", background: "#F1F5F9", border: "none", borderRadius: "12px", color: "#64748B", marginLeft: "auto", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>↻ Refresh</button>
      </div>

      {/* Search and Filter */}
      {(tab === "leaderboard" || tab === "all candidates" || tab === "applications") && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1, marginBottom: 0 }} />
          <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} style={{ ...inp, marginBottom: 0, width: "160px" }}>
            <option value="ALL">All Verdicts</option>
            <option value="HIRE">HIRE</option>
            <option value="REVIEW">REVIEW</option>
            <option value="REJECT">REJECT</option>
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>Loading...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ color: "#1E293B", marginTop: 0, fontSize: "18px" }}>🌟 Top Candidates</h3>
                  {candidates.slice(0, 5).map((c, i) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
                      <span style={{ fontSize: "20px", width: "24px", textAlign: "center" }}>{medal(i)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#1E293B", fontSize: "14px", fontWeight: "700" }}>{c.name || "N/A"}</div>
                        <div style={{ color: "#64748B", fontSize: "12px" }}>{c.email}</div>
                      </div>
                      <span style={{ color: "#00B87C", fontWeight: "800", fontSize: "16px" }}>{c.overall_score || 0}%</span>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontSize: "11px", fontWeight: "700" }}>{c.verdict}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ color: "#1E293B", marginTop: 0, fontSize: "18px" }}>📊 Score Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                    {[["Gold (85+)", candidates.filter(c => c.overall_score >= 85).length, "#FFD700"],
                    ["Silver (70-84)", candidates.filter(c => c.overall_score >= 70 && c.overall_score < 85).length, "#94A3B8"],
                    ["Bronze (50-69)", candidates.filter(c => c.overall_score >= 50 && c.overall_score < 70).length, "#CD7F32"],
                    ["Low (<50)", candidates.filter(c => c.overall_score < 50).length, "#FF4444"],
                    ].map(([l, v, c]: any) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", minWidth: "100px" }}>{l}</span>
                        <div style={{ flex: 1, background: "#F1F5F9", borderRadius: "6px", height: "10px" }}>
                          <div style={{ width: (candidates.length > 0 ? (v / candidates.length * 100) : 0) + "%", background: c, height: "10px", borderRadius: "6px", transition: "width 0.5s" }} />
                        </div>
                        <span style={{ color: c, fontWeight: "800", fontSize: "14px", minWidth: "24px", textAlign: "right" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {tab === "leaderboard" && (
            <div>
              <h3 style={{ color: "#1E293B", marginBottom: "20px", fontSize: "20px" }}>🏆 Candidate Leaderboard</h3>
              {filtered.slice(0, 20).map((c, i) => {
                const [badgeText, badgeColor] = badge(c.overall_score || 0);
                return (
                  <div key={c.id} style={{ background: "#FFFFFF", border: "1.5px solid " + (i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#E2E8F0"), borderRadius: "20px", padding: "20px 24px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: i < 3 ? "36px" : "20px", minWidth: "48px", textAlign: "center", fontWeight: "900", color: i >= 3 ? "#94A3B8" : "inherit" }}>{medal(i)}</div>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <div style={{ fontWeight: "800", color: "#1E293B", marginBottom: "4px", fontSize: "16px" }}>{c.name || "Candidate"}</div>
                      <div style={{ color: "#64748B", fontSize: "13px" }}>{c.email}</div>
                      <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "12px", fontWeight: "600" }}>
                        <span style={{ color: "#64748B" }}>ATS: <span style={{ color: "#00D4FF" }}>{c.ats_score || 0}%</span></span>
                        <span style={{ color: "#64748B" }}>Test: <span style={{ color: "#F59E0B" }}>{c.test_score || 0}%</span></span>
                        <span style={{ color: "#64748B" }}>Interview: <span style={{ color: "#A78BFA" }}>{c.interview_score || 0}%</span></span>
                      </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "0 16px", borderLeft: "1.5px solid #F1F5F9", borderRight: "1.5px solid #F1F5F9" }}>
                      <div style={{ fontSize: "32px", fontWeight: "900", color: "#00B87C", lineHeight: "1" }}>{c.overall_score || 0}%</div>
                      <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "700", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "100px" }}>
                      <span style={{ padding: "6px 12px", borderRadius: "12px", background: badgeColor + "15", color: badgeColor, fontWeight: "800", fontSize: "12px", textAlign: "center" }}>{badgeText}</span>
                      <span style={{ padding: "6px 12px", borderRadius: "12px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontWeight: "800", fontSize: "12px", textAlign: "center" }}>{c.verdict}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {c.resume_url && <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ padding: "8px 12px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", color: "#00D4FF", textDecoration: "none", fontSize: "12px", borderRadius: "8px", fontWeight: "700" }}>Resume</a>}
                        <button onClick={() => sendVerdictEmail(c, "HIRE")} style={{ padding: "8px 12px", background: "#00B87C15", border: "1.5px solid #00B87C44", color: "#00B87C", fontSize: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>✉ Hire</button>
                        <button onClick={() => sendVerdictEmail(c, "REJECT")} style={{ padding: "8px 12px", background: "#FF444415", border: "1.5px solid #FF444444", color: "#FF4444", fontSize: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>✉ Reject</button>
                      </div>
                      {overriding === c.id ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          {["HIRE", "REVIEW", "REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ padding: "6px 10px", background: vc(v), color: "#fff", fontSize: "11px", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>{v}</button>)}
                          <button onClick={() => setOverriding(null)} style={{ padding: "6px 10px", background: "#F1F5F9", color: "#64748B", fontSize: "11px", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>X</button>
                        </div>
                      ) : (
                        <button onClick={() => setOverriding(c.id)} style={{ padding: "8px 12px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Override Verdict</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All Candidates Tab */}
          {tab === "all candidates" && (
            <div style={{ overflowX: "auto", background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1.5px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "20px" }}>👥 All Candidates ({filtered.length})</h3>
                <button onClick={exportCSV} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>⬇ Export CSV</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Rank", "Name", "Email", "ATS", "Test", "Interview", "Overall", "Badge", "Verdict", "Email", "Action"].map((h, idx) => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#64748B", fontSize: "12px", borderBottom: "1.5px solid #E2E8F0", borderTopLeftRadius: idx === 0 ? "10px" : "0", borderTopRightRadius: idx === 10 ? "10px" : "0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const [badgeText, badgeColor] = badge(c.overall_score || 0);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 14px", color: "#64748B", fontSize: "16px", textAlign: "center" }}>{medal(i)}</td>
                        <td style={{ padding: "12px 14px", color: "#1E293B", fontWeight: "700", fontSize: "13px" }}>{c.name || "N/A"}</td>
                        <td style={{ padding: "12px 14px", color: "#64748B", fontSize: "12px" }}>{c.email}</td>
                        <td style={{ padding: "12px 14px", color: "#00D4FF", fontWeight: "600" }}>{c.ats_score || 0}%</td>
                        <td style={{ padding: "12px 14px", color: "#F59E0B", fontWeight: "600" }}>{c.test_score || 0}%</td>
                        <td style={{ padding: "12px 14px", color: "#A78BFA", fontWeight: "600" }}>{c.interview_score || 0}%</td>
                        <td style={{ padding: "12px 14px", color: "#00B87C", fontWeight: "800", fontSize: "14px" }}>{c.overall_score || 0}%</td>
                        <td style={{ padding: "12px 14px" }}><span style={{ padding: "4px 8px", borderRadius: "8px", background: badgeColor + "15", color: badgeColor, fontSize: "11px", fontWeight: "700" }}>{badgeText}</span></td>
                        <td style={{ padding: "12px 14px" }}><span style={{ padding: "4px 8px", borderRadius: "8px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontSize: "11px", fontWeight: "700" }}>{c.verdict}</span></td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => sendVerdictEmail(c, "HIRE")} style={{ background: "#00B87C15", border: "1px solid #00B87C", color: "#00B87C", fontSize: "10px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>✉H</button>
                            <button onClick={() => sendVerdictEmail(c, "REJECT")} style={{ background: "#FF444415", border: "1px solid #FF4444", color: "#FF4444", fontSize: "10px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>✉R</button>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {overriding === c.id ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              {["HIRE", "REVIEW", "REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ background: vc(v), color: "#fff", fontSize: "10px", padding: "4px 6px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>{v.charAt(0)}</button>)}
                              <button onClick={() => setOverriding(null)} style={{ background: "#E2E8F0", color: "#1E293B", fontSize: "10px", padding: "4px 6px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>X</button>
                            </div>
                          ) : (
                            <button onClick={() => setOverriding(c.id)} style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "11px", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>Override</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Applications Tab */}
          {tab === "applications" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "20px", borderBottom: "1.5px solid #E2E8F0", background: "#F8FAFC" }}>
                <h3 style={{ margin: 0, color: "#1E293B", fontSize: "18px" }}>📩 Direct Applications</h3>
                <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "13px" }}>Candidates who explicitly selected your company during their assessment.</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead style={{ background: "#F1F5F9", color: "#64748B", textAlign: "left", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <tr>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>Candidate</th>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>Role</th>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>Score</th>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>ATS / Test / Int</th>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>Status</th>
                    <th style={{ padding: "16px", borderBottom: "1.5px solid #E2E8F0" }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())).filter(c => filterVerdict === "ALL" || c.verdict === filterVerdict).map((c, i) => {
                    const vc = (v: string) => v === "HIRE" ? "#00B87C" : v === "REVIEW" ? "#F59E0B" : v === "REJECT" ? "#FF4444" : "#94A3B8";
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #E2E8F0", background: i % 2 === 0 ? "#fff" : "#FAFAFA", transition: "background 0.2s" }}>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "14px" }}>{c.name}</div>
                          <div style={{ color: "#94A3B8", fontSize: "12px" }}>{c.email}</div>
                          <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: "#667EEA", textDecoration: "none", marginTop: "4px", display: "inline-block", fontWeight: "600" }}>📄 View Resume</a>
                        </td>
                        <td style={{ padding: "16px", color: "#475569", fontWeight: "500" }}>{c.role || "Software Engineer"}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "18px", fontWeight: "900", color: vc(c.verdict) }}>{c.overall_score}%</span>
                        </td>
                        <td style={{ padding: "16px", color: "#64748B" }}>{c.ats_score}% / {c.test_score}% / {c.interview_score}%</td>
                        <td style={{ padding: "16px" }}>
                          {c.triangle_status === "FLAGGED" ? <span style={{ color: "#FF4444", background: "#FEF2F2", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>🚩 FLAGGED</span> : <span style={{ color: "#00B87C", background: "#F0FDF4", padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>✅ VERIFIED</span>}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "10px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontWeight: "800", fontSize: "12px" }}>{c.verdict}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                        No candidates have directly applied to your company yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Job Postings Tab */}
          {tab === "job postings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "20px" }}>💼 Job Postings ({jobs.length})</h3>
                <button onClick={() => setShowJobForm(!showJobForm)} style={{ padding: "10px 20px", background: showJobForm ? "#F1F5F9" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: showJobForm ? "#64748B" : "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  {showJobForm ? "✕ Cancel" : "+ Post New Job"}
                </button>
              </div>
              {showJobForm && (
                <div style={{ background: "#FFFFFF", border: "2px solid #00B87C", borderRadius: "20px", padding: "24px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(0,184,124,0.1)" }}>
                  <h4 style={{ color: "#00B87C", marginTop: 0, fontSize: "16px" }}>✨ Create New Job Posting</h4>
                  <input placeholder="Job Title *" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                  <textarea placeholder="Job Description *" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={4} style={{ ...inp, borderRadius: "12px" }} />
                  <input placeholder="Required Skills (comma separated)" value={jobForm.skills} onChange={e => setJobForm(p => ({ ...p, skills: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                  <input placeholder="Location (e.g. Chennai, Remote)" value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <input placeholder="Min Salary (LPA)" value={jobForm.salary_min} onChange={e => setJobForm(p => ({ ...p, salary_min: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                    <input placeholder="Max Salary (LPA)" value={jobForm.salary_max} onChange={e => setJobForm(p => ({ ...p, salary_max: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button onClick={postJob} style={{ padding: "14px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>🚀 Post Job</button>
                    <button onClick={() => setShowJobForm(false)} style={{ padding: "14px", background: "#F1F5F9", border: "none", color: "#64748B", borderRadius: "12px", flex: 1, fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                  </div>
                </div>
              )}
              {jobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "20px", border: "1.5px dashed #E2E8F0", color: "#64748B" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>No jobs posted yet.<br /><span style={{ fontWeight: "400", fontSize: "13px" }}>Click "Post New Job" to start recruiting!</span></div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {jobs.map((job: any, i: number) => (
                    <div key={i} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ color: "#1E293B", margin: "0 0 8px", fontSize: "18px", fontWeight: "800" }}>{job.title}</h4>
                          <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 12px", lineHeight: "1.5" }}>{job.description}</p>
                          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                            {job.location && <span style={{ background: "#F1F5F9", padding: "4px 10px", borderRadius: "8px" }}>📍 {job.location}</span>}
                            {job.skills && <span style={{ background: "#F1F5F9", padding: "4px 10px", borderRadius: "8px" }}>🛠️ {job.skills}</span>}
                            {job.salary_min && <span style={{ background: "#F0FDF4", color: "#00B87C", padding: "4px 10px", borderRadius: "8px" }}>💰 Rs.{job.salary_min}L - Rs.{job.salary_max}L</span>}
                          </div>
                        </div>
                        <span style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600" }}>Posted {new Date(job.created_at || job.posted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interviews Tab */}
          {tab === "interviews" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "20px" }}>📅 Scheduled Interviews ({interviews.length})</h3>
                <button onClick={() => setShowInterviewForm(!showInterviewForm)} style={{ padding: "10px 20px", background: showInterviewForm ? "#F1F5F9" : "linear-gradient(135deg,#A78BFA,#7C3AED)", color: showInterviewForm ? "#64748B" : "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
                  {showInterviewForm ? "✕ Cancel" : "+ Schedule Interview"}
                </button>
              </div>
              {scheduledRoomId && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #00B87C", borderRadius: "16px", padding: "20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 12px rgba(0,184,124,0.1)" }}>
                  <div>
                    <div style={{ color: "#16A34A", fontWeight: "800", fontSize: "16px", marginBottom: "4px" }}>✅ Interview Scheduled! Room ID Generated</div>
                    <div style={{ color: "#64748B", fontSize: "14px" }}>Room ID: <strong style={{ color: "#667EEA", fontSize: "18px" }}>{scheduledRoomId}</strong></div>
                    <div style={{ color: "#64748B", fontSize: "13px", marginTop: "4px" }}>Email sent to candidate with interview room link</div>
                  </div>
                  <button onClick={() => setScheduledRoomId("")} style={{ padding: "8px 12px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "8px", cursor: "pointer" }}>✕ Dismiss</button>
                </div>
              )}

              {showInterviewForm && (
                <div style={{ background: "#FFFFFF", border: "2px solid #A78BFA", borderRadius: "20px", padding: "24px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(167,139,250,0.1)" }}>
                  <h4 style={{ color: "#A78BFA", marginTop: 0, fontSize: "16px" }}>✨ Schedule New Interview</h4>
                  <select value={interviewForm.candidate_id} onChange={e => setInterviewForm(p => ({ ...p, candidate_id: e.target.value }))} style={{ ...inp, borderRadius: "12px" }}>
                    <option value="">Select Candidate *</option>
                    {candidates.map(c => <option key={c.id} value={c.user_id || c.id}>{c.name} — {c.email} ({c.overall_score}%)</option>)}
                  </select>
                  <input placeholder="Job Title" value={interviewForm.job_title} onChange={e => setInterviewForm(p => ({ ...p, job_title: e.target.value }))} style={{ ...inp, borderRadius: "12px" }} />
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ color: "#64748B", fontSize: "13px", display: "block", marginBottom: "8px", fontWeight: "600" }}>Interview Date & Time *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px" }}>
                      <input type="date" value={intDate} onChange={e => {
                        setIntDate(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = e.target.value + "T" + String(h).padStart(2, "0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0, borderRadius: "12px" }} />
                      <select value={intHour} onChange={e => {
                        setIntHour(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(e.target.value) === 12 ? 12 : parseInt(e.target.value) + 12) : (parseInt(e.target.value) === 12 ? 0 : parseInt(e.target.value));
                        const dt = intDate + "T" + String(h).padStart(2, "0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0, borderRadius: "12px" }}>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <select value={intMin} onChange={e => {
                        setIntMin(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = intDate + "T" + String(h).padStart(2, "0") + ":" + e.target.value + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0, borderRadius: "12px" }}>
                        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={intAmPm} onChange={e => {
                        setIntAmPm(e.target.value);
                        const h = e.target.value === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = intDate + "T" + String(h).padStart(2, "0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0, borderRadius: "12px" }}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {intDate && <div style={{ color: "#A78BFA", fontSize: "13px", marginTop: "8px", fontWeight: "600" }}>
                      Scheduled: {new Date(intDate + "T" + String(intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour))).padStart(2, "0") + ":" + intMin + ":00").toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
                    </div>}
                  </div>

                  <textarea placeholder="Notes (optional)" value={interviewForm.notes} onChange={e => setInterviewForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inp, borderRadius: "12px" }} />
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button onClick={scheduleInterview} style={{ padding: "14px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", flex: 1, fontWeight: "800", cursor: "pointer", fontSize: "14px" }}>📅 Schedule & Send Email</button>
                    <button onClick={() => setShowInterviewForm(false)} style={{ padding: "14px", background: "#F1F5F9", border: "none", color: "#64748B", borderRadius: "12px", flex: 1, fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                  </div>
                </div>
              )}
              {interviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "20px", border: "1.5px dashed #E2E8F0", color: "#64748B" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                  <div style={{ fontSize: "15px", fontWeight: "600" }}>No interviews scheduled yet.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {interviews.map((iv: any, i: number) => (
                    <div key={i} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                          <h4 style={{ color: "#1E293B", margin: "0 0 8px", fontSize: "18px", fontWeight: "800" }}>{iv.candidate_name}</h4>
                          <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "8px" }}>{iv.candidate_email}</div>
                          <div style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", padding: "4px 10px", background: "#F1F5F9", borderRadius: "8px", display: "inline-block" }}>📋 {iv.job_title || "General Interview"}</div>
                          {iv.room_id && <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "12px" }}><span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>Room ID:</span><span style={{ color: "#667EEA", fontWeight: "800", fontSize: "14px", background: "#EEF2FF", padding: "4px 8px", borderRadius: "6px" }}>{iv.room_id}</span><button onClick={() => onInterview && onInterview(iv.room_id)} style={{ background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", border: "none", cursor: "pointer", fontWeight: "700", boxShadow: "0 2px 8px rgba(0,184,124,0.3)" }}>🚀 Join Room</button></div>}
                          {iv.notes && <div style={{ color: "#64748B", fontSize: "13px", marginTop: "12px", fontStyle: "italic", borderLeft: "2px solid #E2E8F0", paddingLeft: "8px" }}>{iv.notes}</div>}
                        </div>
                        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <div style={{ color: "#F59E0B", fontWeight: "800", fontSize: "15px", background: "#FFFBEB", padding: "6px 12px", borderRadius: "10px" }}>📅 {new Date(iv.scheduled_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
                          {iv.room_id && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <span style={{ background: iv.room_status === "active" ? "#D1FAE5" : iv.room_status === "completed" ? "#F1F5F9" : "#FEF3C7", color: iv.room_status === "active" ? "#059669" : iv.room_status === "completed" ? "#475569" : "#D97706", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>{iv.room_status || "waiting"}</span>
                              <button onClick={() => {
                                axios.put(API + "/interviews/status/" + iv.id, { status: "active" }, { headers: { Authorization: "Bearer " + token } });
                                alert("Interview room activated! Candidate can now join Room: " + iv.room_id);
                              }} style={{ padding: "6px 14px", background: "#A78BFA", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "800", fontSize: "12px", boxShadow: "0 2px 8px rgba(167,139,250,0.3)" }}>
                                Start Room
                              </button>
                            </div>
                          )}
                          <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#F1F5F9", color: "#64748B", fontSize: "12px", fontWeight: "700" }}>{iv.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Intelligence Dashboard Tab */}
          {tab === "intelligence" && (
            <div>
              <h3 style={{ color: "#1E293B", marginBottom: "20px", fontSize: "20px" }}>🧠 Company Intelligence Dashboard</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <h4 style={{ color: "#1E293B", marginTop: 0, fontSize: "16px" }}>📊 Hiring Funnel</h4>
                  {[
                    ["Total Applied", candidates.length, "#00D4FF", 100],
                    ["Passed ATS", candidates.filter(c => (c.ats_score || 0) >= 50).length, "#00B87C", candidates.length > 0 ? (candidates.filter(c => (c.ats_score || 0) >= 50).length / candidates.length * 100) : 0],
                    ["Passed Test", candidates.filter(c => (c.test_score || 0) >= 50).length, "#F59E0B", candidates.length > 0 ? (candidates.filter(c => (c.test_score || 0) >= 50).length / candidates.length * 100) : 0],
                    ["Hired", candidates.filter(c => c.verdict === "HIRE").length, "#A78BFA", candidates.length > 0 ? (candidates.filter(c => c.verdict === "HIRE").length / candidates.length * 100) : 0],
                  ].map(([l, v, c, pct]: any) => (
                    <div key={l} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>{l}</span>
                        <span style={{ color: c, fontWeight: "800", fontSize: "13px" }}>{v}</span>
                      </div>
                      <div style={{ background: "#F1F5F9", borderRadius: "6px", height: "8px" }}>
                        <div style={{ width: pct + "%", background: c, height: "8px", borderRadius: "6px", transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <h4 style={{ color: "#1E293B", marginTop: 0, fontSize: "16px" }}>🎯 Candidates by Role</h4>
                  {Object.entries(roleData).length === 0 ? (
                    <div style={{ color: "#64748B", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>No role data available</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {Object.entries(roleData).map(([role, count]: any) => (
                        <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                          <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>{role}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "#F1F5F9", borderRadius: "6px", height: "8px", width: "80px" }}>
                              <div style={{ width: (candidates.length > 0 ? count / candidates.length * 100 : 0) + "%", background: "#F59E0B", height: "8px", borderRadius: "6px" }} />
                            </div>
                            <span style={{ color: "#F59E0B", fontWeight: "800", fontSize: "14px", minWidth: "20px", textAlign: "right" }}>{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <h4 style={{ color: "#1E293B", marginTop: 0, fontSize: "16px" }}>📈 Key Metrics</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      ["Avg ATS Score", Math.round(candidates.reduce((s, c) => s + (c.ats_score || 0), 0) / (candidates.length || 1)) + "%", "#00D4FF"],
                      ["Avg Test Score", Math.round(candidates.reduce((s, c) => s + (c.test_score || 0), 0) / (candidates.length || 1)) + "%", "#F59E0B"],
                      ["Avg Interview", Math.round(candidates.reduce((s, c) => s + (c.interview_score || 0), 0) / (candidates.length || 1)) + "%", "#A78BFA"],
                      ["Avg Overall", avgScore + "%", "#00B87C"],
                      ["Hire Rate", hireRate + "%", "#00B87C"],
                      ["Fake Detected", candidates.filter(c => c.triangle_status === "FLAGGED").length, "#FF4444"],
                      ["Jobs Posted", jobs.length, "#F59E0B"],
                      ["Interviews Scheduled", interviews.length, "#A78BFA"],
                    ].map(([l, v, c]: any) => (
                      <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                        <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>{l}</span>
                        <span style={{ color: c, fontWeight: "800", fontSize: "14px" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginTop: "20px" }}>
                <h4 style={{ color: "#1E293B", marginTop: 0, fontSize: "18px" }}>🏆 Triangle Consistency Analysis</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  {[
                    ["✅ Consistent", candidates.filter(c => c.triangle_status === "CONSISTENT").length, "#00B87C"],
                    ["⚠️ Review", candidates.filter(c => c.triangle_status === "REVIEW").length, "#F59E0B"],
                    ["🚨 Flagged Fake", candidates.filter(c => c.triangle_status === "FLAGGED").length, "#FF4444"],
                  ].map(([l, v, c]: any) => (
                    <div key={l} style={{ textAlign: "center", padding: "24px", background: "#F8FAFC", borderRadius: "16px", border: "1.5px solid " + c + "44", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div style={{ fontSize: "36px", fontWeight: "900", color: c, lineHeight: "1" }}>{v}</div>
                      <div style={{ color: "#64748B", fontSize: "14px", marginTop: "8px", fontWeight: "700" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "compare" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "20px" }}>⚖️ Candidate Comparison Tool</h3>
                {compareList.length > 0 && <button onClick={() => setCompareList([])} style={{ padding: "8px 12px", background: "#FFF0F0", border: "1.5px solid #FF444444", color: "#FF4444", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>✕ Clear All</button>}
              </div>
              <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>Select up to 3 candidates to compare side by side. Click + to add.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "20px", maxHeight: "500px", overflowY: "auto", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <h4 style={{ color: "#64748B", marginTop: 0, fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Candidates</h4>
                  {candidates.map((c: any) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <button onClick={() => {
                        if (compareList.find((x: any) => x.id === c.id)) return;
                        if (compareList.length >= 3) { alert("Max 3 candidates"); return; }
                        setCompareList((prev: any) => [...prev, c]);
                      }} style={{ width: "28px", height: "28px", background: "#F1F5F9", color: "#00B87C", border: "none", borderRadius: "50%", cursor: "pointer", fontWeight: "800", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#D1FAE5"} onMouseLeave={e => e.currentTarget.style.background = "#F1F5F9"}>+</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#1E293B", fontSize: "14px", fontWeight: "700" }}>{c.name}</div>
                        <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}><span style={{ fontWeight: "700", color: "#00B87C" }}>{c.overall_score}%</span> — <span style={{ padding: "2px 6px", background: vc(c.verdict) + "15", color: vc(c.verdict), borderRadius: "4px", fontSize: "10px", fontWeight: "700" }}>{c.verdict}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {compareList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px", background: "#FFFFFF", borderRadius: "20px", border: "2px dashed #E2E8F0", color: "#64748B", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", boxSizing: "border-box" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚖️</div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#1E293B" }}>Add candidates from the list to compare</div>
                      <div style={{ fontSize: "13px", marginTop: "8px" }}>Compare skills, scores, and authenticity metrics</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: compareList.length === 1 ? "1fr" : compareList.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr", gap: "16px" }}>
                      {compareList.map((c: any) => {
                        const vc2 = c.verdict === "HIRE" ? "#00B87C" : c.verdict === "REVIEW" ? "#F59E0B" : "#FF4444";
                        return (
                          <div key={c.id} style={{ background: "#FFFFFF", border: "2px solid " + vc2, borderRadius: "20px", padding: "20px", boxShadow: "0 8px 24px " + vc2 + "15" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                              <div style={{ color: "#1E293B", fontWeight: "800", fontSize: "15px", lineHeight: "1.2" }}>{c.name}</div>
                              <button onClick={() => setCompareList((prev: any) => prev.filter((x: any) => x.id !== c.id))} style={{ background: "#FFF0F0", color: "#FF4444", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px", fontWeight: "800" }}>✕</button>
                            </div>
                            <div style={{ fontSize: "40px", fontWeight: "900", color: vc2, textAlign: "center", marginBottom: "8px", lineHeight: "1" }}>{c.overall_score}%</div>
                            <div style={{ textAlign: "center", marginBottom: "20px" }}><span style={{ padding: "6px 16px", borderRadius: "12px", background: vc2 + "15", color: vc2, fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.verdict}</span></div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {[["ATS Score", c.ats_score, "#00D4FF"], ["Test Score", c.test_score, "#F59E0B"], ["Interview", c.interview_score || 70, "#A78BFA"], ["Authenticity", c.authenticity_score, "#00B87C"]].map(([label, val, color]: any) => (
                                <div key={label}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ color: "#64748B", fontSize: "12px", fontWeight: "600" }}>{label}</span>
                                    <span style={{ color: color, fontSize: "13px", fontWeight: "800" }}>{val}%</span>
                                  </div>
                                  <div style={{ background: "#F1F5F9", borderRadius: "6px", height: "8px" }}>
                                    <div style={{ width: val + "%", background: color, height: "8px", borderRadius: "6px" }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: "20px", padding: "12px", background: c.triangle_status === "CONSISTENT" ? "#F0FDF4" : "#FFF0F0", borderRadius: "12px", border: "1.5px solid " + (c.triangle_status === "CONSISTENT" ? "#00B87C" : "#FF4444") + "44" }}>
                              <div style={{ color: "#64748B", fontSize: "11px", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase" }}>Triangle Status</div>
                              <div style={{ color: c.triangle_status === "CONSISTENT" ? "#00B87C" : "#FF4444", fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                                {c.triangle_status === "CONSISTENT" ? "✅" : "🚨"} {c.triangle_status}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "40px", paddingTop: "20px", paddingBottom: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: "0 0 4px" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#CBD5E1", fontSize: "11px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved. · AI-Powered Recruitment Intelligence</p>
      </div>
    </div>
  );
}
