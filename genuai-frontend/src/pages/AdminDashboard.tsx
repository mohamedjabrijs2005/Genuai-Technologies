import { useState, useEffect } from "react";
import { getCandidates, getStats } from "../services/api";
import axios from "axios";

interface Props {
  user: any;
  onLogout: () => void;
}

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard({ user, onLogout }: Props) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState("ALL");
  const [overriding, setOverriding] = useState<number | null>(null);
  const [tab, setTab] = useState("leaderboard");
  const userName = user?.user?.name || user?.name || "Admin";

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([getCandidates(), getStats()]);
      const sorted = (cRes.data || []).sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0));
      setCandidates(sorted);
      setStats(sRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const overrideVerdict = async (id: number, verdict: string) => {
    try {
      await axios.put(API + "/admin/verdict/" + id, { verdict });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, verdict } : c));
      setOverriding(null);
    } catch { alert("Override failed"); }
  };

  const filtered = candidates.filter(c => {
    const ms = search === "" || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const mv = filterVerdict === "ALL" || c.verdict === filterVerdict;
    return ms && mv;
  });

  const medal = (i: number) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i+1);
  const vc = (v: string) => v === "HIRE" ? "#00B87C" : v === "REVIEW" ? "#F59E0B" : "#FF4444";
  const inp: any = { padding: "10px 14px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px" };
  const btn: any = { padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px" };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "40px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <img src="/logo.png" alt="GenuAI" style={{ width:'44px', height:'44px', objectFit:'contain', filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.4))' }} />
          <div>
            <h1 style={{ margin: 0, color: "#1E293B", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>Genu<span style={{ color: "#00B87C" }}>AI</span></h1>
            <div style={{ color: "#64748B", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "#FFFFFF", padding: "8px 16px", borderRadius: "20px", border: "1.5px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#00D4FF,#00B87C)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>
            {userName.charAt(0)}
          </div>
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>{userName}</span>
          <div style={{ width: "1px", height: "24px", background: "#E2E8F0" }} />
          <button onClick={onLogout} style={{ ...btn, background: "#FFF0F0", border: "none", color: "#FF4444", fontSize: "12px", padding: "6px 12px", borderRadius: "8px" }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
        {[["Total Candidates", candidates.length, "#00D4FF"], ["Hired", candidates.filter(c => c.verdict === "HIRE").length, "#00B87C"], ["In Review", candidates.filter(c => c.verdict === "REVIEW").length, "#F59E0B"], ["Rejected", candidates.filter(c => c.verdict === "REJECT").length, "#FF4444"]].map(([l, v, c]: any) => (
          <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ color: "#64748B", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{l}</div>
            <div style={{ fontSize: "40px", fontWeight: "900", color: c, lineHeight: "1" }}>{v}</div>
            <div style={{ marginTop: "12px", background: "#F1F5F9", borderRadius: "6px", height: "6px", width: "100%" }}>
              <div style={{ width: (candidates.length > 0 ? (v / candidates.length) * 100 : 0) + "%", background: c, height: "6px", borderRadius: "6px" }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", background: "#FFFFFF", padding: "6px", borderRadius: "16px", border: "1.5px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          {["leaderboard", "all candidates"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...btn, background: tab === t ? "linear-gradient(135deg,#00B87C,#00D4AA)" : "transparent", color: tab === t ? "#fff" : "#64748B", border: "none", borderRadius: "12px", padding: "10px 24px", textTransform: "capitalize", fontSize: "14px", fontWeight: "800", transition: "all 0.2s", boxShadow: tab === t ? "0 4px 12px rgba(0,184,124,0.3)" : "none" }}>{t}</button>
          ))}
        </div>
        <button onClick={loadData} style={{ ...btn, background: "#FFFFFF", border: "1.5px solid #E2E8F0", color: "#64748B", padding: "10px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>🔄 Refresh Data</button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", background: "#FFFFFF", padding: "20px", borderRadius: "20px", border: "1.5px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <input placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1, borderRadius: "12px", border: "2px solid #F1F5F9", padding: "14px 20px", fontSize: "15px", background: "#F8FAFC" }} />
        <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} style={{ ...inp, borderRadius: "12px", border: "2px solid #F1F5F9", padding: "14px 20px", fontSize: "15px", background: "#F8FAFC", minWidth: "200px" }}>
          <option value="ALL">All Verdicts</option>
          <option value="HIRE">HIRE</option>
          <option value="REVIEW">REVIEW</option>
          <option value="REJECT">REJECT</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>Loading candidates...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748B" }}>No candidates found</div>
      ) : tab === "leaderboard" ? (
        <div>
          <h3 style={{ color: "#1E293B", marginBottom: "20px", fontSize: "20px", fontWeight: "900" }}>🏆 Top 20 Candidates</h3>
          {filtered.slice(0, 20).map((c, i) => (
            <div key={c.id} style={{ background: "#FFFFFF", border: "2px solid " + (i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#E2E8F0"), borderRadius: "20px", padding: "20px 24px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", boxShadow: i < 3 ? "0 8px 24px " + (i === 0 ? "rgba(255,215,0,0.15)" : i === 1 ? "rgba(192,192,192,0.15)" : "rgba(205,127,50,0.15)") : "0 4px 15px rgba(0,0,0,0.03)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ fontSize: i < 3 ? "32px" : "18px", minWidth: "48px", textAlign: "center", fontWeight: "900", color: i < 3 ? "inherit" : "#94A3B8" }}>{medal(i)}</div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontWeight: "800", color: "#1E293B", marginBottom: "6px", fontSize: "16px" }}>{c.name || "Candidate"}</div>
                <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "10px" }}>{c.email}</div>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                  <span style={{ color: "#64748B", fontWeight: "600" }}>ATS: <span style={{ color: "#00D4FF", fontWeight: "800" }}>{c.ats_score || 0}%</span></span>
                  <span style={{ color: "#64748B", fontWeight: "600" }}>Test: <span style={{ color: "#F59E0B", fontWeight: "800" }}>{c.test_score || 0}%</span></span>
                  <span style={{ color: "#64748B", fontWeight: "600" }}>Interview: <span style={{ color: "#A78BFA", fontWeight: "800" }}>{c.interview_score || 0}%</span></span>
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 24px", background: "#F8FAFC", borderRadius: "16px", border: "1.5px solid #E2E8F0" }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#00B87C", lineHeight: "1" }}>{c.overall_score || 0}%</div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", marginTop: "4px", textTransform: "uppercase" }}>Overall</div>
              </div>
              <div style={{ padding: "8px 16px", borderRadius: "12px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontWeight: "800", fontSize: "13px", letterSpacing: "0.05em" }}>{c.verdict}</div>
              {c.resume_url && <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ ...btn, background: "#F0F9FF", border: "1.5px solid #BAE6FD", color: "#0284C7", textDecoration: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "13px" }}>📄 Resume</a>}
              {overriding === c.id ? (
                <div style={{ display: "flex", gap: "8px", background: "#F1F5F9", padding: "6px", borderRadius: "12px" }}>
                  {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#fff", fontSize: "11px", padding: "6px 12px", borderRadius: "8px" }}>{v}</button>)}
                  <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#E2E8F0", color: "#64748B", fontSize: "11px", padding: "6px 10px", borderRadius: "8px" }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F8FAFC", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "13px", padding: "10px 16px", borderRadius: "12px" }}>⚙️ Override</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          <h3 style={{ color: "#1E293B", marginBottom: "20px", fontSize: "20px", fontWeight: "900" }}>📋 All Candidates ({filtered.length})</h3>
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1.5px solid #E2E8F0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  {["Rank","Name","Email","ATS","Test","Interview","Overall","Verdict","Resume","Action"].map(h => (
                    <th key={h} style={{ padding: "16px", textAlign: "left", color: "#64748B", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #E2E8F0", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px", color: "#94A3B8", fontWeight: "700" }}>{medal(i)}</td>
                    <td style={{ padding: "16px", color: "#1E293B", fontWeight: "800" }}>{c.name || "N/A"}</td>
                    <td style={{ padding: "16px", color: "#64748B", fontSize: "14px" }}>{c.email}</td>
                    <td style={{ padding: "16px", color: "#00D4FF", fontWeight: "700" }}>{c.ats_score || 0}%</td>
                    <td style={{ padding: "16px", color: "#F59E0B", fontWeight: "700" }}>{c.test_score || 0}%</td>
                    <td style={{ padding: "16px", color: "#A78BFA", fontWeight: "700" }}>{c.interview_score || 0}%</td>
                    <td style={{ padding: "16px", color: "#00B87C", fontWeight: "900", fontSize: "15px" }}>{c.overall_score || 0}%</td>
                    <td style={{ padding: "16px" }}><span style={{ padding: "6px 12px", borderRadius: "8px", background: vc(c.verdict) + "15", color: vc(c.verdict), fontSize: "12px", fontWeight: "800", letterSpacing: "0.05em" }}>{c.verdict}</span></td>
                    <td style={{ padding: "16px" }}>{c.resume_url ? <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ color: "#0284C7", fontSize: "13px", fontWeight: "700", textDecoration: "none", background: "#F0F9FF", padding: "6px 10px", borderRadius: "8px" }}>📄 Link</a> : <span style={{ color: "#94A3B8", fontSize: "13px" }}>N/A</span>}</td>
                    <td style={{ padding: "16px" }}>
                      {overriding === c.id ? (
                        <div style={{ display: "flex", gap: "6px", background: "#F1F5F9", padding: "4px", borderRadius: "10px", width: "max-content" }}>
                          {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#fff", fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>{v}</button>)}
                          <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#E2E8F0", color: "#64748B", fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px", padding: "6px 12px", borderRadius: "8px" }}>⚙️ Override</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "60px", padding: "30px 0", textAlign: "center", borderTop: "1.5px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          <span style={{ color: "#1E293B", fontWeight: "800", fontSize: "16px", letterSpacing: "-0.5px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 8px", fontWeight: "600" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved.</p>
      </div>
    </div>
  );
}
