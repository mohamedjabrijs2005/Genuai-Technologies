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

  return (
    <div className="min-h-screen bg-background quantum-gradient relative font-sans flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto p-lg md:p-xl flex-1 flex flex-col">
      {/* Navigation Bar */}
      <nav className="glass border-b border-surface-container px-lg md:px-xl h-20 flex items-center justify-between shadow-sm sticky top-4 z-40 rounded-2xl mb-xl">
        <div className="flex items-center gap-md">
          <img src="/logo.png" alt="GenuAI" className="w-12 h-12 object-contain drop-shadow-md" />
          <div>
            <div className="font-black text-body-lg text-on-surface">Genu<span className="text-indigo-brand">AI</span></div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">ADMINISTRATION & INTEGRITY</div>
          </div>
        </div>
        <div className="flex gap-md items-center">
          <span className="text-on-surface-variant text-sm font-bold">{userName}</span>
          <div className="w-px h-6 bg-surface-container mx-0.5" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-brand to-[#764BA2] flex items-center justify-center font-black text-white text-sm overflow-hidden shadow-sm shrink-0">
            {userName.charAt(0)}
          </div>
          <button onClick={onLogout} className="px-sm py-1.5 bg-error/10 border border-error/20 text-error rounded-lg cursor-pointer text-xs font-bold transition-all hover:bg-error hover:text-white">Logout</button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl animate-[fadeIn_0.4s_ease]">
        {[
          ["Total Assessments", stats?.total || candidates.length, "text-indigo-brand"],
          ["Avg Platform Score", stats?.avgScore ? stats.avgScore + "%" : "0%", "text-warning"],
          ["Verified Candidates", candidates.filter(c => c.triangle_status !== "FLAGGED").length, "text-success"],
          ["Flagged for Cheating", flagged.length, "text-error"]
        ].map(([l, v, c]: any) => (
          <div key={l} className="glass p-lg rounded-2xl flex flex-col justify-center shadow-sm border border-surface-container hover:-translate-y-1 transition-transform">
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-xs">{l}</div>
            <div className={`text-4xl font-black ${c} leading-none drop-shadow-sm`}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass p-xs rounded-xl flex flex-wrap gap-xs mb-xl border border-surface-container shadow-sm animate-[fadeIn_0.4s_ease]">
        {["platform health", "flagged violations", "all candidates", "system audit"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-lg py-sm rounded-lg capitalize font-bold text-sm cursor-pointer transition-all ${tab === t ? "bg-gradient-to-r from-indigo-brand to-[#764BA2] text-white shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface"}`}>{t}</button>
        ))}
        <button onClick={loadData} className="px-lg py-sm bg-surface-container/50 border-none rounded-lg text-on-surface-variant ml-auto font-bold text-sm cursor-pointer transition-colors hover:bg-surface-container flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">refresh</span> Refresh Data</button>
      </div>

      {loading ? (
        <div className="text-center p-xxxl text-on-surface-variant text-body-base bg-surface-bright/50 rounded-2xl border border-surface-container font-medium animate-pulse">Loading Platform Data...</div>
      ) : (
        <div className="animate-[fadeIn_0.4s_ease]">
          {tab === "platform health" && (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-lg">
              <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container">
                <h3 className="text-title-md font-black text-on-surface m-0 mb-lg flex items-center gap-xs"><span className="material-symbols-outlined text-[24px] text-info-dark">trending_up</span> Role-wise Analytics</h3>
                {roleAnalytics.length === 0 ? (
                  <div className="text-on-surface-variant text-sm font-medium">No role data available yet.</div>
                ) : (
                  <div className="rounded-xl overflow-x-auto border border-surface-container bg-surface-bright/50">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-surface-container/50 text-on-surface-variant text-xs text-left uppercase tracking-wider font-bold">
                          <th className="p-md">Job Role</th>
                          <th className="p-md">Total Applicants</th>
                          <th className="p-md">Avg Score</th>
                          <th className="p-md">Hire Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roleAnalytics.map((r, i) => (
                          <tr key={i} className="border-b border-surface-container hover:bg-surface-container/20 transition-colors">
                            <td className="p-md font-bold text-on-surface">{r.role}</td>
                            <td className="p-md text-on-surface-variant font-medium">{r.total}</td>
                            <td className="p-md font-black text-success">{r.avg_score}%</td>
                            <td className="p-md">
                              <div className="flex items-center gap-sm">
                                <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                                  <div className="bg-indigo-brand h-full rounded-full" style={{ width: (r.hired / r.total * 100) + "%" }} />
                                </div>
                                <span className="text-xs text-on-surface-variant font-bold">{Math.round(r.hired / r.total * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container h-max">
                <h3 className="text-title-md font-black text-on-surface m-0 mb-lg flex items-center gap-xs"><span className="material-symbols-outlined text-[24px] text-indigo-brand">shield</span> Trust Triangle Status</h3>
                <div className="text-center py-xl">
                  <div className={`text-7xl font-black drop-shadow-sm leading-none ${flagged.length > 0 ? "text-error" : "text-success"}`}>
                    {candidates.length > 0 ? Math.round(((candidates.length - flagged.length) / candidates.length) * 100) : 100}%
                  </div>
                  <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-sm">Overall Platform Integrity</div>
                </div>
                <div className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center p-md bg-success/10 rounded-xl border border-success/20">
                    <span className="text-success-dark font-bold text-sm">Verified Accounts</span>
                    <span className="text-success-dark font-black text-sm">{candidates.length - flagged.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-md bg-error/10 rounded-xl border border-error/20">
                    <span className="text-error font-bold text-sm">Flagged Accounts</span>
                    <span className="text-error font-black text-sm">{flagged.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "flagged violations" && (
            <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="text-title-md font-black text-on-surface m-0 flex items-center gap-xs"><span className="material-symbols-outlined text-[24px] text-error">flag</span> Trust Triangle Violations ({flagged.length})</h3>
              </div>
              {flagged.length === 0 ? (
                <div className="text-center p-xxxl bg-success/10 border border-success/30 border-dashed rounded-2xl text-success-dark font-bold text-body-base shadow-sm">
                  All clean! No active violations detected on the platform.
                </div>
              ) : (
                <div className="rounded-xl overflow-x-auto border border-error/20 bg-error/5">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-error/10 text-error-dark text-xs text-left uppercase tracking-wider font-bold">
                        <th className="p-md">Candidate</th>
                        <th className="p-md">ATS / Test / Int</th>
                        <th className="p-md">Consistency Score</th>
                        <th className="p-md">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flagged.map((c, i) => (
                        <tr key={i} className="border-b border-error/10 hover:bg-error/10 transition-colors">
                          <td className="p-md">
                            <div className="font-bold text-on-surface text-sm">{c.name}</div>
                            <div className="text-xs text-on-surface-variant font-medium mt-0.5">{c.email}</div>
                          </td>
                          <td className="p-md text-on-surface-variant text-sm font-bold">{c.ats_score}% / {c.test_score}% / {c.interview_score}%</td>
                          <td className="p-md font-black text-error text-body-base">{c.consistency_score}%</td>
                          <td className="p-md">
                            <button className="px-md py-sm bg-surface-bright border border-surface-container rounded-lg text-xs cursor-pointer font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shadow-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> Investigate</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "all candidates" && (
            <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container">
              <div className="flex gap-md mb-lg">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-xl pr-md py-md bg-surface-bright border border-surface-container rounded-xl text-body-base font-medium text-on-surface focus:outline-none focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all shadow-sm" />
                </div>
              </div>
              <div className="rounded-xl overflow-x-auto border border-surface-container bg-surface-bright/50">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container/50 text-on-surface-variant text-xs text-left uppercase tracking-wider font-bold">
                      <th className="p-md">Name</th>
                      <th className="p-md">Email</th>
                      <th className="p-md">Overall</th>
                      <th className="p-md">Verdict</th>
                      <th className="p-md text-center">Security</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b border-surface-container hover:bg-surface-container/20 transition-colors">
                        <td className="p-md font-bold text-on-surface text-sm">{c.name}</td>
                        <td className="p-md text-on-surface-variant font-medium text-sm">{c.email}</td>
                        <td className="p-md font-black text-success text-body-base">{c.overall_score}%</td>
                        <td className="p-md"><span className="px-sm py-1 bg-surface-container rounded-md text-[10px] font-black text-on-surface-variant uppercase tracking-wider">{c.verdict || "PENDING"}</span></td>
                        <td className="p-md text-center">
                          {c.triangle_status === "FLAGGED" ? <span className="material-symbols-outlined text-error text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span> : <span className="material-symbols-outlined text-success text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "system audit" && (
            <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container">
              <h3 className="text-title-md font-black text-on-surface m-0 mb-lg flex items-center gap-xs"><span className="material-symbols-outlined text-[24px] text-indigo-brand">history</span> Live System Audit Log</h3>
              {alerts.length === 0 && <div className="text-center p-xxxl text-on-surface-variant text-body-base bg-surface-bright/50 rounded-2xl border border-surface-container font-medium">Waiting for system events...</div>}
              <div className="flex flex-col gap-sm">
                {alerts.map(a => (
                  <div key={a.id} className="p-md bg-surface-bright/80 border-l-4 border-indigo-brand rounded-r-xl border-t border-b border-r border-surface-container shadow-sm flex items-center gap-md">
                    <div className="text-xs text-on-surface-variant font-bold min-w-[80px]">{a.time}</div>
                    <div className="text-sm font-bold text-on-surface flex-1">{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Footer / Founder Info */}
      <div className="mt-xxxl pt-xl border-t border-surface-container/50 flex flex-col md:flex-row items-center justify-between animate-[fadeIn_0.5s_ease]">
        <div className="flex items-center gap-md mb-md md:mb-0">
          <img src="https://ui-avatars.com/api/?name=Mohamed+Jabri+J+S&background=1E293B&color=667EEA&size=150" alt="Mohamed Jabri J S" className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-brand/40 shadow-sm hover:scale-105 transition-transform" />
          <div>
            <div className="text-body-base font-black text-on-surface">Mohamed Jabri J S</div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Founder & CEO, GenuAI Technologies</div>
          </div>
        </div>
        <div className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">copyright</span> {new Date().getFullYear()} GenuAI Technologies.
        </div>
      </div>
      </div>
    </div>
  );
}
