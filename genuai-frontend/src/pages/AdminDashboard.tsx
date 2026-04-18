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
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, color: "#00B87C" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "18px" }}>Admin</span></h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#64748B" }}>Welcome, {userName}</span>
          <button onClick={onLogout} style={{ ...btn, background: "transparent", border: "1px solid #FF4444", color: "#FF4444" }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[["Total", candidates.length, "#00D4FF"], ["Hired", candidates.filter(c => c.verdict === "HIRE").length, "#00B87C"], ["Review", candidates.filter(c => c.verdict === "REVIEW").length, "#F59E0B"], ["Rejected", candidates.filter(c => c.verdict === "REJECT").length, "#FF4444"]].map(([l, v, c]: any) => (
          <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", fontWeight: "bold", color: c }}>{v}</div>
            <div style={{ color: "#64748B", fontSize: "14px" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["leaderboard", "all candidates"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...btn, background: tab === t ? "#00B87C" : "#161B22", color: tab === t ? "#000" : "#64748B", border: "1.5px solid #E2E8F0", textTransform: "capitalize" }}>{t}</button>
        ))}
        <button onClick={loadData} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", marginLeft: "auto" }}>Refresh</button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
        <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} style={inp}>
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
          <h3 style={{ color: "#F59E0B", marginBottom: "16px" }}>Candidate Leaderboard</h3>
          {filtered.slice(0, 20).map((c, i) => (
            <div key={c.id} style={{ background: "#FFFFFF", border: "1px solid " + (i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#30363D"), borderRadius: "12px", padding: "16px 20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ fontSize: i < 3 ? "28px" : "16px", minWidth: "40px", textAlign: "center", fontWeight: "bold" }}>{medal(i)}</div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ fontWeight: "bold", color: "#1E293B", marginBottom: "4px" }}>{c.name || "Candidate"}</div>
                <div style={{ color: "#64748B", fontSize: "13px" }}>{c.email}</div>
                <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "12px" }}>
                  <span style={{ color: "#64748B" }}>ATS: <span style={{ color: "#00D4FF" }}>{c.ats_score || 0}%</span></span>
                  <span style={{ color: "#64748B" }}>Test: <span style={{ color: "#F59E0B" }}>{c.test_score || 0}%</span></span>
                  <span style={{ color: "#64748B" }}>Interview: <span style={{ color: "#A78BFA" }}>{c.interview_score || 0}%</span></span>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00B87C" }}>{c.overall_score || 0}%</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>Overall</div>
              </div>
              <div style={{ padding: "6px 14px", borderRadius: "20px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontWeight: "bold", fontSize: "13px" }}>{c.verdict}</div>
              {c.resume_url && <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#00D4FF", textDecoration: "none" }}>Resume</a>}
              {overriding === c.id ? (
                <div style={{ display: "flex", gap: "6px" }}>
                  {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#000", fontSize: "11px", padding: "6px 10px" }}>{v}</button>)}
                  <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#30363D", color: "#1E293B", fontSize: "11px", padding: "6px 10px" }}>X</button>
                </div>
              ) : (
                <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px" }}>Override</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h3 style={{ color: "#00D4FF", marginBottom: "16px" }}>All Candidates ({filtered.length})</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["Rank","Name","Email","ATS","Test","Interview","Overall","Verdict","Resume","Action"].map(h => (
                    <th key={h} style={{ padding: "12px", textAlign: "left", color: "#64748B", fontSize: "13px", borderBottom: "1.5px solid #E2E8F0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px", color: "#64748B" }}>{medal(i)}</td>
                    <td style={{ padding: "12px", color: "#1E293B", fontWeight: "bold" }}>{c.name || "N/A"}</td>
                    <td style={{ padding: "12px", color: "#64748B", fontSize: "13px" }}>{c.email}</td>
                    <td style={{ padding: "12px", color: "#00D4FF" }}>{c.ats_score || 0}%</td>
                    <td style={{ padding: "12px", color: "#F59E0B" }}>{c.test_score || 0}%</td>
                    <td style={{ padding: "12px", color: "#A78BFA" }}>{c.interview_score || 0}%</td>
                    <td style={{ padding: "12px", color: "#00B87C", fontWeight: "bold" }}>{c.overall_score || 0}%</td>
                    <td style={{ padding: "12px" }}><span style={{ padding: "4px 10px", borderRadius: "12px", background: vc(c.verdict) + "22", color: vc(c.verdict), fontSize: "12px", fontWeight: "bold" }}>{c.verdict}</span></td>
                    <td style={{ padding: "12px" }}>{c.resume_url ? <a href={c.resume_url} target="_blank" rel="noreferrer" style={{ color: "#00D4FF", fontSize: "13px" }}>Download</a> : <span style={{ color: "#30363D" }}>N/A</span>}</td>
                    <td style={{ padding: "12px" }}>
                      {overriding === c.id ? (
                        <div style={{ display: "flex", gap: "4px" }}>
                          {["HIRE","REVIEW","REJECT"].map(v => <button key={v} onClick={() => overrideVerdict(c.id, v)} style={{ ...btn, background: vc(v), color: "#000", fontSize: "11px", padding: "4px 8px" }}>{v}</button>)}
                          <button onClick={() => setOverriding(null)} style={{ ...btn, background: "#30363D", color: "#1E293B", fontSize: "11px", padding: "4px 8px" }}>X</button>
                        </div>
                      ) : (
                        <button onClick={() => setOverriding(c.id)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px" }}>Override</button>
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
      <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "40px", paddingTop: "20px", paddingBottom: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: "0 0 4px" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#CBD5E1", fontSize: "11px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved. · Built by Mohamed Jabri Jaffar Sadiq · Sri Sairam Institute of Technology, Chennai</p>
      </div>
    </div>
  );
}
