import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  user: any;
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL;

export default function CompanyDashboard({ user, onLogout }: Props) {
  const [tab, setTab] = useState("overview");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("ALL");
  const [overriding, setOverriding] = useState<number | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", skills: "", location: "", salary_min: "", salary_max: "" });
  const [interviewForm, setInterviewForm] = useState({ candidate_id: "", job_title: "", scheduled_at: "", meeting_link: "", notes: "" });
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

  useEffect(() => { loadData(); }, []);

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
      await axios.post(API + "/interviews/schedule", { ...interviewForm, company_id: companyId, job_title: interviewForm.job_title }, { headers: { Authorization: "Bearer " + token } });
      await loadData();
      setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", meeting_link: "", notes: "" });
      setShowInterviewForm(false);
      alert("Interview scheduled and email sent!");
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

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i+1);
  const vc = (v: string) => v === "HIRE" ? "#00B87C" : v === "REVIEW" ? "#F59E0B" : "#FF4444";
  const badge = (score: number) => score >= 85 ? ["🥇 GOLD", "#FFD700"] : score >= 70 ? ["🥈 SILVER", "#C0C0C0"] : score >= 50 ? ["🥉 BRONZE", "#CD7F32"] : ["⚠️ LOW", "#FF4444"];
  const inp: any = { width: "100%", padding: "10px 14px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" };
  const btn: any = { padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px" };

  const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((s, c) => s + (c.overall_score || 0), 0) / candidates.length) : 0;
  const hireRate = candidates.length > 0 ? Math.round((candidates.filter(c => c.verdict === "HIRE").length / candidates.length) * 100) : 0;
  const roleData = candidates.reduce((acc: any, c) => { const r = c.role || "Unknown"; acc[r] = (acc[r] || 0) + 1; return acc; }, {});

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, color: "#00B87C" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "16px" }}>Company Dashboard</span></h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#64748B", fontSize: "13px" }}>Welcome, {userName}</span>
          <button onClick={exportCSV} style={{ ...btn, background: "#F1F5F9", border: "1px solid #00B87C", color: "#00B87C" }}>⬇ Export CSV</button>
          <button onClick={onLogout} style={{ ...btn, background: "transparent", border: "1px solid #FF4444", color: "#FF4444" }}>Logout</button>
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
          <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: c }}>{v}</div>
            <div style={{ color: "#64748B", fontSize: "12px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["overview", "leaderboard", "all candidates", "job postings", "interviews", "intelligence", "compare"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...btn, background: tab === t ? "#00B87C" : "#161B22", color: tab === t ? "#000" : "#64748B", border: "1.5px solid #E2E8F0", textTransform: "capitalize" }}>{t}</button>
        ))}
        <button onClick={loadData} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", marginLeft: "auto" }}>Refresh</button>
      </div>

      {/* Search and Filter */}
      {(tab === "leaderboard" || tab === "all candidates") && (
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ color: "#00B87C", marginTop: 0 }}>Top Candidates</h3>
                  {candidates.slice(0, 5).map((c, i) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
                      <span style={{ fontSize: "18px" }}>{medal(i)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#1E293B", fontSize: "13px", fontWeight: "bold" }}>{c.name || "N/A"}</div>
                        <div style={{ color: "#64748B", fontSize: "11px" }}>{c.email}</div>
                      </div>
                      <span style={{ color: "#00B87C", fontWeight: "bold" }}>{c.overall_score || 0}%</span>
                      <span style={{ padding: "3px 8px", borderRadius: "10px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontSize: "11px" }}>{c.verdict}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ color: "#00D4FF", marginTop: 0 }}>Score Distribution</h3>
                  {[["Gold (85+)", candidates.filter(c => c.overall_score >= 85).length, "#FFD700"],
                    ["Silver (70-84)", candidates.filter(c => c.overall_score >= 70 && c.overall_score < 85).length, "#C0C0C0"],
                    ["Bronze (50-69)", candidates.filter(c => c.overall_score >= 50 && c.overall_score < 70).length, "#CD7F32"],
                    ["Low (<50)", candidates.filter(c => c.overall_score < 50).length, "#FF4444"],
                  ].map(([l, v, c]: any) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <span style={{ color: "#64748B", fontSize: "13px", minWidth: "100px" }}>{l}</span>
                      <div style={{ flex: 1, background: "#F1F5F9", borderRadius: "4px", height: "8px" }}>
                        <div style={{ width: (candidates.length > 0 ? (v / candidates.length * 100) : 0) + "%", background: c, height: "8px", borderRadius: "4px" }}/>
                      </div>
                      <span style={{ color: c, fontWeight: "bold", fontSize: "13px", minWidth: "20px" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {tab === "leaderboard" && (
            <div>
              <h3 style={{ color: "#F59E0B", marginBottom: "16px" }}>Candidate Leaderboard</h3>
              {filtered.slice(0, 20).map((c, i) => {
                const [badgeText, badgeColor] = badge(c.overall_score || 0);
                return (
                  <div key={c.id} style={{ background: "#FFFFFF", border: "1px solid " + (i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#30363D"), borderRadius: "12px", padding: "16px 20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ fontSize: i < 3 ? "28px" : "16px", minWidth: "40px", textAlign: "center", fontWeight: "bold" }}>{medal(i)}</div>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <div style={{ fontWeight: "bold", color: "#1E293B", marginBottom: "2px" }}>{c.name || "Candidate"}</div>
                      <div style={{ color: "#64748B", fontSize: "12px" }}>{c.email}</div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "11px" }}>
                        <span style={{ color: "#64748B" }}>ATS: <span style={{ color: "#00D4FF" }}>{c.ats_score || 0}%</span></span>
                        <span style={{ color: "#64748B" }}>Test: <span style={{ color: "#F59E0B" }}>{c.test_score || 0}%</span></span>
                        <span style={{ color: "#64748B" }}>Interview: <span style={{ color: "#A78BFA" }}>{c.interview_score || 0}%</span></span>
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "26px", fontWeight: "bold", color: "#00B87C" }}>{c.overall_score || 0}%</div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>Overall</div>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: badgeColor + "33", color: badgeColor, fontWeight: "bold", fontSize: "12px" }}>{badgeText}</span>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontWeight: "bold", fontSize: "12px" }}>{c.verdict}</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {c.resume_url && <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#00D4FF", textDecoration: "none", fontSize: "12px" }}>Resume</a>}
                      <button onClick={() => sendVerdictEmail(c, "HIRE")} style={{ ...btn, background: "#00B87C22", border: "1px solid #00B87C", color: "#00B87C", fontSize: "11px", padding: "5px 8px" }}>✉ Hire</button>
                      <button onClick={() => sendVerdictEmail(c, "REJECT")} style={{ ...btn, background: "#FF444422", border: "1px solid #FF4444", color: "#FF4444", fontSize: "11px", padding: "5px 8px" }}>✉ Reject</button>
                    </div>
                    {overriding === c.id ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#000", fontSize: "11px", padding: "5px 8px" }}>{v}</button>)}
                        <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#30363D", color: "#1E293B", fontSize: "11px", padding: "5px 8px" }}>X</button>
                      </div>
                    ) : (
                      <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "11px" }}>Override</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* All Candidates Tab */}
          {tab === "all candidates" && (
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "#00D4FF", margin: 0 }}>All Candidates ({filtered.length})</h3>
                <button onClick={exportCSV} style={{ ...btn, background: "#00B87C", color: "#000" }}>⬇ Export CSV</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9" }}>
                    {["Rank","Name","Email","ATS","Test","Interview","Overall","Badge","Verdict","Email","Action"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748B", fontSize: "12px", borderBottom: "1.5px solid #E2E8F0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const [badgeText, badgeColor] = badge(c.overall_score || 0);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "10px 12px", color: "#64748B" }}>{medal(i)}</td>
                        <td style={{ padding: "10px 12px", color: "#1E293B", fontWeight: "bold", fontSize: "13px" }}>{c.name || "N/A"}</td>
                        <td style={{ padding: "10px 12px", color: "#64748B", fontSize: "12px" }}>{c.email}</td>
                        <td style={{ padding: "10px 12px", color: "#00D4FF" }}>{c.ats_score || 0}%</td>
                        <td style={{ padding: "10px 12px", color: "#F59E0B" }}>{c.test_score || 0}%</td>
                        <td style={{ padding: "10px 12px", color: "#A78BFA" }}>{c.interview_score || 0}%</td>
                        <td style={{ padding: "10px 12px", color: "#00B87C", fontWeight: "bold" }}>{c.overall_score || 0}%</td>
                        <td style={{ padding: "10px 12px" }}><span style={{ padding: "3px 8px", borderRadius: "10px", background: badgeColor + "33", color: badgeColor, fontSize: "11px", fontWeight: "bold" }}>{badgeText}</span></td>
                        <td style={{ padding: "10px 12px" }}><span style={{ padding: "3px 8px", borderRadius: "10px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontSize: "11px", fontWeight: "bold" }}>{c.verdict}</span></td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: "3px" }}>
                            <button onClick={() => sendVerdictEmail(c, "HIRE")} style={{ ...btn, background: "#00B87C22", border: "1px solid #00B87C", color: "#00B87C", fontSize: "10px", padding: "3px 6px" }}>✉H</button>
                            <button onClick={() => sendVerdictEmail(c, "REJECT")} style={{ ...btn, background: "#FF444422", border: "1px solid #FF4444", color: "#FF4444", fontSize: "10px", padding: "3px 6px" }}>✉R</button>
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {overriding === c.id ? (
                            <div style={{ display: "flex", gap: "3px" }}>
                              {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#000", fontSize: "10px", padding: "3px 6px" }}>{v}</button>)}
                              <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#30363D", color: "#1E293B", fontSize: "10px", padding: "3px 6px" }}>X</button>
                            </div>
                          ) : (
                            <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "11px", padding: "5px 8px" }}>Override</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Job Postings Tab */}
          {tab === "job postings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "#00B87C", margin: 0 }}>Job Postings ({jobs.length})</h3>
                <button onClick={() => setShowJobForm(!showJobForm)} style={{ ...btn, background: "#00B87C", color: "#000" }}>+ Post New Job</button>
              </div>
              {showJobForm && (
                <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <h4 style={{ color: "#00B87C", marginTop: 0 }}>New Job Posting</h4>
                  <input placeholder="Job Title *" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} style={inp} />
                  <textarea placeholder="Job Description *" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={4} style={inp} />
                  <input placeholder="Required Skills (comma separated)" value={jobForm.skills} onChange={e => setJobForm(p => ({ ...p, skills: e.target.value }))} style={inp} />
                  <input placeholder="Location (e.g. Chennai, Remote)" value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} style={inp} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input placeholder="Min Salary (LPA)" value={jobForm.salary_min} onChange={e => setJobForm(p => ({ ...p, salary_min: e.target.value }))} style={inp} />
                    <input placeholder="Max Salary (LPA)" value={jobForm.salary_max} onChange={e => setJobForm(p => ({ ...p, salary_max: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={postJob} style={{ ...btn, background: "#00B87C", color: "#000", flex: 1, padding: "12px" }}>Post Job</button>
                    <button onClick={() => setShowJobForm(false)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", flex: 1, padding: "12px" }}>Cancel</button>
                  </div>
                </div>
              )}
              {jobs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
                  <div>No jobs posted yet. Click Post New Job to start!</div>
                </div>
              ) : (
                jobs.map((job: any, i: number) => (
                  <div key={i} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ color: "#00B87C", margin: "0 0 6px" }}>{job.title}</h4>
                        <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 8px" }}>{job.description}</p>
                        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#64748B" }}>
                          {job.location && <span>📍 {job.location}</span>}
                          {job.skills && <span>🛠️ {job.skills}</span>}
                          {job.salary_min && <span>💰 Rs.{job.salary_min}L - Rs.{job.salary_max}L</span>}
                        </div>
                      </div>
                      <span style={{ color: "#64748B", fontSize: "12px" }}>{new Date(job.created_at || job.posted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Interviews Tab */}
          {tab === "interviews" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "#A78BFA", margin: 0 }}>Scheduled Interviews ({interviews.length})</h3>
                <button onClick={() => setShowInterviewForm(!showInterviewForm)} style={{ ...btn, background: "#A78BFA", color: "#000" }}>+ Schedule Interview</button>
              </div>
              {showInterviewForm && (
                <div style={{ background: "#FFFFFF", border: "1px solid #A78BFA", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                  <h4 style={{ color: "#A78BFA", marginTop: 0 }}>Schedule New Interview</h4>
                  <select value={interviewForm.candidate_id} onChange={e => setInterviewForm(p => ({ ...p, candidate_id: e.target.value }))} style={inp}>
                    <option value="">Select Candidate *</option>
                    {candidates.map(c => <option key={c.id} value={c.user_id || c.id}>{c.name} — {c.email} ({c.overall_score}%)</option>)}
                  </select>
                  <input placeholder="Job Title" value={interviewForm.job_title} onChange={e => setInterviewForm(p => ({ ...p, job_title: e.target.value }))} style={inp} />
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ color: "#64748B", fontSize: "12px", display: "block", marginBottom: "6px" }}>Interview Date & Time *</label>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px" }}>
                      <input type="date" value={intDate} onChange={e => {
                        setIntDate(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = e.target.value + "T" + String(h).padStart(2,"0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0 }} />
                      <select value={intHour} onChange={e => {
                        setIntHour(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(e.target.value) === 12 ? 12 : parseInt(e.target.value) + 12) : (parseInt(e.target.value) === 12 ? 0 : parseInt(e.target.value));
                        const dt = intDate + "T" + String(h).padStart(2,"0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0 }}>
                        {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <select value={intMin} onChange={e => {
                        setIntMin(e.target.value);
                        const h = intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = intDate + "T" + String(h).padStart(2,"0") + ":" + e.target.value + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0 }}>
                        {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={intAmPm} onChange={e => {
                        setIntAmPm(e.target.value);
                        const h = e.target.value === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour));
                        const dt = intDate + "T" + String(h).padStart(2,"0") + ":" + intMin + ":00";
                        setInterviewForm(p => ({ ...p, scheduled_at: dt }));
                      }} style={{ ...inp, marginBottom: 0 }}>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {intDate && <div style={{ color: "#A78BFA", fontSize: "12px", marginTop: "6px" }}>
                      Scheduled: {new Date(intDate + "T" + String(intAmPm === "PM" ? (parseInt(intHour) === 12 ? 12 : parseInt(intHour) + 12) : (parseInt(intHour) === 12 ? 0 : parseInt(intHour))).padStart(2,"0") + ":" + intMin + ":00").toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
                    </div>}
                  </div>
                  <input placeholder="Meeting Link (Google Meet / Zoom)" value={interviewForm.meeting_link} onChange={e => setInterviewForm(p => ({ ...p, meeting_link: e.target.value }))} style={inp} />
                  <textarea placeholder="Notes (optional)" value={interviewForm.notes} onChange={e => setInterviewForm(p => ({ ...p, notes: e.target.value }))} rows={3} style={inp} />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={scheduleInterview} style={{ ...btn, background: "#A78BFA", color: "#000", flex: 1, padding: "12px" }}>Schedule & Send Email</button>
                    <button onClick={() => setShowInterviewForm(false)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", flex: 1, padding: "12px" }}>Cancel</button>
                  </div>
                </div>
              )}
              {interviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>📅</div>
                  <div>No interviews scheduled yet.</div>
                </div>
              ) : (
                interviews.map((iv: any, i: number) => (
                  <div key={i} style={{ background: "#FFFFFF", border: "1px solid #A78BFA44", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <h4 style={{ color: "#A78BFA", margin: "0 0 6px" }}>{iv.candidate_name}</h4>
                        <div style={{ color: "#64748B", fontSize: "12px", marginBottom: "4px" }}>{iv.candidate_email}</div>
                        <div style={{ color: "#64748B", fontSize: "13px" }}>📋 {iv.job_title || "General Interview"}</div>
                        {iv.meeting_link && <div style={{ marginTop: "6px" }}><a href={iv.meeting_link} target="_blank" rel="noreferrer" style={{ color: "#00D4FF", fontSize: "12px" }}>🔗 Join Meeting</a></div>}
                        {iv.notes && <div style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>📝 {iv.notes}</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#F59E0B", fontWeight: "bold" }}>📅 {new Date(iv.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                        <span style={{ padding: "3px 10px", borderRadius: "10px", background: "#A78BFA22", color: "#A78BFA", fontSize: "12px", fontWeight: "bold" }}>{iv.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Intelligence Dashboard Tab */}
          {tab === "intelligence" && (
            <div>
              <h3 style={{ color: "#00D4FF", marginBottom: "20px" }}>🧠 Company Intelligence Dashboard</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ color: "#00B87C", marginTop: 0 }}>📊 Hiring Funnel</h4>
                  {[
                    ["Total Applied", candidates.length, "#00D4FF", 100],
                    ["Passed ATS", candidates.filter(c => (c.ats_score || 0) >= 50).length, "#00B87C", candidates.length > 0 ? (candidates.filter(c => (c.ats_score || 0) >= 50).length / candidates.length * 100) : 0],
                    ["Passed Test", candidates.filter(c => (c.test_score || 0) >= 50).length, "#F59E0B", candidates.length > 0 ? (candidates.filter(c => (c.test_score || 0) >= 50).length / candidates.length * 100) : 0],
                    ["Hired", candidates.filter(c => c.verdict === "HIRE").length, "#A78BFA", candidates.length > 0 ? (candidates.filter(c => c.verdict === "HIRE").length / candidates.length * 100) : 0],
                  ].map(([l, v, c, pct]: any) => (
                    <div key={l} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#64748B", fontSize: "12px" }}>{l}</span>
                        <span style={{ color: c, fontWeight: "bold", fontSize: "12px" }}>{v}</span>
                      </div>
                      <div style={{ background: "#F1F5F9", borderRadius: "4px", height: "6px" }}>
                        <div style={{ width: pct + "%", background: c, height: "6px", borderRadius: "4px" }}/>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ color: "#F59E0B", marginTop: 0 }}>🎯 Candidates by Role</h4>
                  {Object.entries(roleData).length === 0 ? (
                    <div style={{ color: "#64748B", fontSize: "13px" }}>No role data available</div>
                  ) : (
                    Object.entries(roleData).map(([role, count]: any) => (
                      <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                        <span style={{ color: "#64748B", fontSize: "12px" }}>{role}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ background: "#F1F5F9", borderRadius: "4px", height: "6px", width: "60px" }}>
                            <div style={{ width: (candidates.length > 0 ? count / candidates.length * 100 : 0) + "%", background: "#F59E0B", height: "6px", borderRadius: "4px" }}/>
                          </div>
                          <span style={{ color: "#F59E0B", fontWeight: "bold", fontSize: "12px" }}>{count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ color: "#A78BFA", marginTop: 0 }}>📈 Key Metrics</h4>
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
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <span style={{ color: "#64748B", fontSize: "12px" }}>{l}</span>
                      <span style={{ color: c, fontWeight: "bold", fontSize: "13px" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                <h4 style={{ color: "#00D4FF", marginTop: 0 }}>🏆 Triangle Consistency Analysis</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    ["✅ Consistent", candidates.filter(c => c.triangle_status === "CONSISTENT").length, "#00B87C"],
                    ["⚠️ Review", candidates.filter(c => c.triangle_status === "REVIEW").length, "#F59E0B"],
                    ["🚨 Flagged Fake", candidates.filter(c => c.triangle_status === "FLAGGED").length, "#FF4444"],
                  ].map(([l, v, c]: any) => (
                    <div key={l} style={{ textAlign: "center", padding: "20px", background: "#F1F5F9", borderRadius: "10px", border: "1px solid " + c + "44" }}>
                      <div style={{ fontSize: "32px", fontWeight: "bold", color: c }}>{v}</div>
                      <div style={{ color: "#64748B", fontSize: "13px", marginTop: "4px" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "compare" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ color: "#00D4FF", margin: 0 }}>Candidate Comparison Tool</h3>
                {compareList.length > 0 && <button onClick={() => setCompareList([])} style={{ ...btn, background: "#FF444422", border: "1px solid #FF4444", color: "#FF4444", fontSize: "12px" }}>Clear All</button>}
              </div>
              <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "16px" }}>Select up to 3 candidates to compare side by side. Click + to add.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", maxHeight: "400px", overflowY: "auto" }}>
                  <h4 style={{ color: "#64748B", marginTop: 0, fontSize: "13px" }}>All Candidates — Click + to compare</h4>
                  {candidates.map((c: any) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#1E293B", fontSize: "13px", fontWeight: "bold" }}>{c.name}</div>
                        <div style={{ color: "#64748B", fontSize: "11px" }}>{c.overall_score}% — {c.verdict}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {compareList.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", background: "#FFFFFF", borderRadius: "12px", border: "1px dashed #30363D", color: "#64748B" }}>
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
                      <div>Add candidates from the left to compare</div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: compareList.length === 1 ? "1fr" : compareList.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr", gap: "10px" }}>
                      {compareList.map((c: any) => {
                        const vc2 = c.verdict === "HIRE" ? "#00B87C" : c.verdict === "REVIEW" ? "#F59E0B" : "#FF4444";
                        return (
                          <div key={c.id} style={{ background: "#FFFFFF", border: "2px solid " + vc2, borderRadius: "12px", padding: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                              <div style={{ color: "#1E293B", fontWeight: "bold", fontSize: "13px" }}>{c.name}</div>
                              <button onClick={() => setCompareList(prev => prev.filter((x: any) => x.id !== c.id))} style={{ ...btn, background: "transparent", color: "#FF4444", fontSize: "11px", padding: "2px 6px" }}>✕</button>
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: vc2, textAlign: "center", marginBottom: "12px" }}>{c.overall_score}%</div>
                            <span style={{ display: "block", textAlign: "center", padding: "4px 10px", borderRadius: "10px", background: vc2 + "22", color: vc2, fontSize: "12px", fontWeight: "bold", marginBottom: "12px" }}>{c.verdict}</span>
                            {[["ATS Score", c.ats_score, "#00D4FF"], ["Test Score", c.test_score, "#F59E0B"], ["Interview", c.interview_score || 70, "#A78BFA"], ["Authenticity", c.authenticity_score, "#00B87C"]].map(([label, val, color]: any) => (
                              <div key={label} style={{ marginBottom: "8px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                  <span style={{ color: "#64748B", fontSize: "11px" }}>{label}</span>
                                  <span style={{ color: color, fontSize: "11px", fontWeight: "bold" }}>{val}%</span>
                                </div>
                                <div style={{ background: "#F1F5F9", borderRadius: "4px", height: "5px" }}>
                                  <div style={{ width: val + "%", background: color, height: "5px", borderRadius: "4px" }}/>
                                </div>
                              </div>
                            ))}
                            <div style={{ marginTop: "10px", padding: "8px", background: "#F1F5F9", borderRadius: "8px" }}>
                              <div style={{ color: "#64748B", fontSize: "10px", marginBottom: "4px" }}>Triangle Status</div>
                              <div style={{ color: c.triangle_status === "CONSISTENT" ? "#00B87C" : "#FF4444", fontSize: "12px", fontWeight: "bold" }}>{c.triangle_status}</div>
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
          <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: "0 0 4px" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#CBD5E1", fontSize: "11px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved. · Built by Mohamed Jabri Jaffar Sadiq · Sri Sairam Institute of Technology, Chennai</p>
      </div>
    </div>
  );
}
