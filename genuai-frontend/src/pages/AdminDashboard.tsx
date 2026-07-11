import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

interface Props {
  user: any;
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard({ user, onLogout }: Props) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [roleAnalytics, setRoleAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("platform health");
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const userName = user?.user?.name || user?.name || "Admin";

  useEffect(() => { 
    loadData(); 

    const API_WS = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "";
    const socket = io(API_WS, { transports: ["websocket"] });
    socket.on("notify-hr", (data: any) => {
      setAlerts(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), message: `Security violation detected for ${data.name}` }, ...prev].slice(0, 50));
    });
    return () => { socket.disconnect(); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, rRes] = await Promise.all([
        axios.get(API + "/admin/candidates"),
        axios.get(API + "/admin/stats"),
        axios.get(API + "/admin/role-analytics").catch(() => ({ data: [] }))
      ]);
      const sorted = (cRes.data || []).sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0));
      setCandidates(sorted);
      setStats(sRes.data);
      setRoleAnalytics(rRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = candidates.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));
  const flagged = candidates.filter(c => c.triangle_status === "FLAGGED");

  const btn: any = { padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "12px" };
  const inp: any = { padding: "12px 16px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "10px", color: "#1E293B", fontSize: "14px", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      {/* Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#fff", borderRadius: "16px", padding: "12px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "44px", height: "44px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(102,126,234,0.4))" }} />
          <div>
            <div style={{ fontWeight: "900", fontSize: "18px", color: "#1E293B", lineHeight: "1.1", letterSpacing: "-0.5px" }}>Genu<span style={{ color: "#667EEA" }}>AI</span></div>
            <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", letterSpacing: "0.08em" }}>ADMINISTRATION & INTEGRITY</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>{userName}</span>
          <div style={{ width: "1px", height: "24px", background: "#E2E8F0", margin: "0 2px" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#667EEA,#764BA2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#fff", fontSize: "15px" }}>
            {userName.charAt(0)}
          </div>
          <button onClick={onLogout} style={{ ...btn, background: "transparent", border: "1.5px solid #FF4444", color: "#FF4444" }}>Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          ["Total Assessments", stats?.total || candidates.length, "#667EEA"],
          ["Avg Platform Score", stats?.avgScore ? stats.avgScore + "%" : "0%", "#F59E0B"],
          ["Verified Candidates", candidates.filter(c => c.triangle_status !== "FLAGGED").length, "#00B87C"],
          ["Flagged for Cheating", flagged.length, "#FF4444"]
        ].map(([l, v, c]: any) => (
          <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{l}</div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: c, lineHeight: "1" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "#fff", padding: "8px", borderRadius: "16px", border: "1.5px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}>
        {["platform health", "flagged violations", "all candidates", "system audit"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: tab === t ? "linear-gradient(135deg,#667EEA,#764BA2)" : "transparent", color: tab === t ? "#fff" : "#64748B", border: "none", borderRadius: "10px", textTransform: "capitalize", fontWeight: "800", fontSize: "13px", cursor: "pointer", boxShadow: tab === t ? "0 4px 12px rgba(102,126,234,0.3)" : "none", transition: "all 0.2s" }}>{t}</button>
        ))}
        <button onClick={loadData} style={{ padding: "10px 16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "10px", color: "#64748B", marginLeft: "auto", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>↻ Refresh Data</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>Loading Platform Data...</div>
      ) : (
        <>
          {tab === "platform health" && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <h3 style={{ color: "#1E293B", marginTop: 0, fontSize: "18px", marginBottom: "20px" }}>📈 Role-wise Analytics</h3>
                {roleAnalytics.length === 0 ? (
                  <div style={{ color: "#94A3B8", fontSize: "14px" }}>No role data available yet.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", color: "#64748B", fontSize: "12px", textAlign: "left" }}>
                        <th style={{ padding: "12px" }}>Job Role</th>
                        <th style={{ padding: "12px" }}>Total Applicants</th>
                        <th style={{ padding: "12px" }}>Avg Score</th>
                        <th style={{ padding: "12px" }}>Hire Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleAnalytics.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "12px", fontWeight: "700", color: "#1E293B" }}>{r.role}</td>
                          <td style={{ padding: "12px", color: "#64748B" }}>{r.total}</td>
                          <td style={{ padding: "12px", color: "#00B87C", fontWeight: "800" }}>{r.avg_score}%</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flex: 1, background: "#E2E8F0", height: "6px", borderRadius: "3px" }}>
                                <div style={{ width: (r.hired / r.total * 100) + "%", background: "#667EEA", height: "6px", borderRadius: "3px" }} />
                              </div>
                              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "700" }}>{Math.round(r.hired / r.total * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                <h3 style={{ color: "#1E293B", marginTop: 0, fontSize: "18px", marginBottom: "20px" }}>🛡️ Trust Triangle Status</h3>
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{ fontSize: "64px", fontWeight: "900", color: flagged.length > 0 ? "#FF4444" : "#00B87C", lineHeight: "1" }}>
                    {candidates.length > 0 ? Math.round(((candidates.length - flagged.length) / candidates.length) * 100) : 100}%
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", marginTop: "8px" }}>Overall Platform Integrity</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#F8FAFC", borderRadius: "12px" }}>
                  <span style={{ color: "#64748B", fontWeight: "600", fontSize: "14px" }}>Verified Accounts</span>
                  <span style={{ color: "#00B87C", fontWeight: "800", fontSize: "14px" }}>{candidates.length - flagged.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", background: "#FEF2F2", borderRadius: "12px", marginTop: "8px" }}>
                  <span style={{ color: "#DC2626", fontWeight: "600", fontSize: "14px" }}>Flagged Accounts</span>
                  <span style={{ color: "#DC2626", fontWeight: "800", fontSize: "14px" }}>{flagged.length}</span>
                </div>
              </div>
            </div>
          )}

          {tab === "flagged violations" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ color: "#1E293B", margin: 0, fontSize: "18px" }}>🚩 Trust Triangle Violations ({flagged.length})</h3>
              </div>
              {flagged.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#00B87C", fontWeight: "600", background: "#F0FDF4", borderRadius: "16px", border: "1.5px dashed #00B87C" }}>
                  All clean! No active violations detected on the platform.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "12px", textAlign: "left" }}>
                      <th style={{ padding: "12px" }}>Candidate</th>
                      <th style={{ padding: "12px" }}>ATS / Test / Int</th>
                      <th style={{ padding: "12px" }}>Consistency Score</th>
                      <th style={{ padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flagged.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: "#1E293B" }}>{c.name}<br/><span style={{ fontSize: "12px", color: "#64748B", fontWeight: "400" }}>{c.email}</span></td>
                        <td style={{ padding: "12px", color: "#64748B", fontSize: "13px", fontWeight: "600" }}>{c.ats_score}% / {c.test_score}% / {c.interview_score}%</td>
                        <td style={{ padding: "12px", color: "#FF4444", fontWeight: "800" }}>{c.consistency_score}%</td>
                        <td style={{ padding: "12px" }}>
                          <button style={{ padding: "6px 12px", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: "#1E293B", cursor: "pointer" }}>Investigate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "all candidates" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} style={inp} />
              </div>
              <div style={{ overflowX: "auto", borderRadius: "12px", border: "1.5px solid #E2E8F0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left", color: "#64748B", fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "14px" }}>Name</th>
                      <th style={{ padding: "14px" }}>Email</th>
                      <th style={{ padding: "14px" }}>Overall</th>
                      <th style={{ padding: "14px" }}>Verdict</th>
                      <th style={{ padding: "14px" }}>Security</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px", fontWeight: "800", color: "#1E293B" }}>{c.name}</td>
                        <td style={{ padding: "14px", color: "#64748B", fontSize: "13px" }}>{c.email}</td>
                        <td style={{ padding: "14px", color: "#00B87C", fontWeight: "900", fontSize: "15px" }}>{c.overall_score}%</td>
                        <td style={{ padding: "14px" }}><span style={{ padding: "4px 8px", background: "#F1F5F9", borderRadius: "6px", fontSize: "11px", fontWeight: "700", color: "#64748B" }}>{c.verdict || "PENDING"}</span></td>
                        <td style={{ padding: "14px" }}>{c.triangle_status === "FLAGGED" ? "🚩" : "✅"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "system audit" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <h3 style={{ color: "#1E293B", margin: "0 0 16px", fontSize: "18px" }}>📜 Live System Audit Log</h3>
              {alerts.length === 0 && <div style={{ color: "#94A3B8", fontSize: "14px", padding: "20px", textAlign: "center", background: "#F8FAFC", borderRadius: "12px" }}>Waiting for system events...</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {alerts.map(a => (
                  <div key={a.id} style={{ padding: "16px", background: "#F8FAFC", borderLeft: "4px solid #667EEA", borderRadius: "8px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ color: "#94A3B8", fontSize: "12px", minWidth: "80px", fontWeight: "600" }}>{a.time}</div>
                    <div style={{ color: "#1E293B", fontSize: "14px", fontWeight: "600" }}>{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
