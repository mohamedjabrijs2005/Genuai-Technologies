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
      alert(`Security Alert: Candidate ${data.name} has triggered a security alert. Check their evidence portal!`);
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

  const getRankColor = (i: number) => i === 0 ? "text-warning" : i === 1 ? "text-surface-variant" : i === 2 ? "text-[#CD7F32]" : "text-on-surface-variant";
  const getVerdictClasses = (v: string) => {
    if (v === "HIRE") return "bg-success/10 text-success border-success/20";
    if (v === "WAITLIST") return "bg-indigo-brand/10 text-indigo-brand border-indigo-brand/20";
    if (v === "REVIEW") return "bg-warning/10 text-warning border-warning/20";
    if (v === "REJECT") return "bg-error/10 text-error border-error/20";
    return "bg-surface-container/50 text-on-surface-variant border-surface-container-high";
  };

  // Skeleton Loader Component
  const Skeleton = () => (
    <div className="glass p-lg mb-md rounded-2xl flex gap-lg animate-pulse">
      <div className="w-10 h-10 bg-surface-container rounded-full"></div>
      <div className="flex-1">
        <div className="w-2/5 h-5 bg-surface-container rounded mb-xs"></div>
        <div className="w-1/4 h-3 bg-surface-container rounded mb-md"></div>
        <div className="w-3/5 h-3 bg-surface-container rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background quantum-gradient relative font-sans flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto p-lg md:p-xl flex-1 flex flex-col">
      
      {/* Navigation Bar (Glassmorphism) */}
      <nav className="glass border-b border-surface-container px-lg md:px-xl h-20 flex items-center justify-between shadow-sm sticky top-4 z-40 rounded-2xl mb-xl">
        <div className="flex items-center gap-md">
          <img src="/logo.png" alt="GenuAI" className="w-12 h-12 object-contain drop-shadow-md" />
          <div>
            <div className="font-black text-body-lg text-on-surface">Genu<span className="text-info-dark">AI</span></div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">AI TALENT DECISION</div>
          </div>
        </div>
        <div className="flex gap-md items-center">
          <span className="text-on-surface-variant text-sm font-bold">{userName}</span>
          <div className="w-px h-6 bg-surface-container mx-0.5" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success-dark flex items-center justify-center font-black text-white text-sm overflow-hidden shadow-sm shrink-0">
            {profilePhoto ? <img src={profilePhoto} alt="logo" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} className="px-sm py-1.5 bg-error/10 border border-error/20 text-error rounded-lg cursor-pointer text-xs font-bold transition-all hover:bg-error hover:text-white">Logout</button>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl animate-[fadeIn_0.4s_ease]">
        {[
          ["Total Applicants", candidates.length, "text-info-dark"],
          ["Waitlisted Talent", candidates.filter(c => c.verdict === "WAITLIST").length, "text-indigo-brand"],
          ["Pending Review", candidates.filter(c => c.verdict === "REVIEW" || !c.verdict).length, "text-warning"],
          ["Pipeline Conversion", candidates.length > 0 ? Math.round((candidates.filter(c => c.verdict === "HIRE").length / candidates.length) * 100) + "%" : "0%", "text-success"],
        ].map(([l, v, c]: any) => (
          <div key={l} className="glass p-lg rounded-2xl text-center shadow-sm border border-surface-container hover:-translate-y-1 transition-transform">
            <div className={`text-3xl font-black ${c} drop-shadow-sm leading-tight`}>{v}</div>
            <div className="text-xs font-bold text-on-surface-variant mt-1 uppercase tracking-wider">{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass p-xs rounded-xl flex flex-wrap gap-xs mb-xl border border-surface-container shadow-sm animate-[fadeIn_0.4s_ease]">
        {["overview", "ai ranking", "pipeline", "job postings"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-lg py-sm rounded-lg capitalize font-bold text-sm cursor-pointer transition-all ${tab === t ? "bg-gradient-to-r from-success to-success-dark text-white shadow-sm" : "bg-transparent text-on-surface-variant hover:text-on-surface"}`}>{t}</button>
        ))}
        <button onClick={loadData} className="px-lg py-sm bg-surface-container/50 border-none rounded-lg text-on-surface-variant ml-auto font-bold text-sm cursor-pointer transition-colors hover:bg-surface-container flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">refresh</span> Refresh</button>
      </div>

      <div className="animate-[fadeIn_0.4s_ease]">
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <>
          {tab === "overview" && (
            <div className="glass p-xxl rounded-xxxl shadow-sm border border-surface-container">
              <h3 className="text-title-lg font-black text-on-surface m-0 mb-md flex items-center gap-xs"><span className="material-symbols-outlined text-[28px] text-info-dark">rocket_launch</span> Welcome to the AI Talent Pipeline</h3>
              <p className="text-on-surface-variant text-body-base leading-relaxed max-w-4xl">
                Candidates applying to your jobs are automatically routed here. The AI has already conducted their technical tests, behavioral interviews, and resume screenings. 
                <br/><br/>
                If you choose to <strong className="text-error">Reject</strong> a candidate, they will automatically be routed to their next chosen company via our Waterfall Routing System. You can also <strong className="text-indigo-brand">Waitlist</strong> top talent to keep them in your pool for future consideration.
              </p>
              <button onClick={() => setTab("ai ranking")} className="px-xl py-md bg-gradient-to-r from-success to-success-dark text-white border-none rounded-xl font-black cursor-pointer mt-xl text-body-base shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-xs">View AI Rankings <span className="material-symbols-outlined text-[20px]">arrow_forward</span></button>
            </div>
          )}

          {tab === "ai ranking" && (
            <div>
              <div className="flex gap-md mb-lg">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input placeholder="Search candidates by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-xl pr-md py-md bg-surface-bright border border-surface-container rounded-xl text-body-base font-medium text-on-surface focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-sm" />
                </div>
                <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} className="w-48 px-md py-md bg-surface-bright border border-surface-container rounded-xl text-body-base font-bold text-on-surface focus:outline-none focus:border-success focus:ring-1 focus:ring-success transition-all shadow-sm cursor-pointer">
                  <option value="ALL">All Verdicts</option>
                  <option value="PENDING">PENDING</option>
                  <option value="WAITLIST">WAITLIST</option>
                  <option value="HIRE">HIRE</option>
                  <option value="REJECT">REJECT</option>
                </select>
              </div>

              <div className="flex flex-col gap-md">
              {filtered.map((c, i) => (
                <div key={c.id} className="glass p-xl rounded-2xl shadow-sm border border-surface-container flex flex-col md:flex-row gap-xl items-center hover:-translate-y-0.5 transition-transform">
                  <div className={`text-4xl w-12 text-center drop-shadow-sm flex items-center justify-center ${getRankColor(i)}`}>
                    {i < 3 ? <span className="material-symbols-outlined text-[40px]" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span> : <span className="font-black text-xl">#{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-black text-on-surface text-title-sm mb-0.5">{c.name}</div>
                    <div className="text-on-surface-variant text-sm font-medium mb-md">{c.email}</div>
                    <div className="flex flex-wrap gap-sm text-xs font-bold">
                      <span className="text-info-dark bg-info/10 px-sm py-1 rounded-md border border-info/20">ATS: {c.ats_score}%</span>
                      <span className="text-warning-dark bg-warning/10 px-sm py-1 rounded-md border border-warning/20">Skill: {c.test_score}%</span>
                      <span className="text-indigo-brand bg-indigo-brand/10 px-sm py-1 rounded-md border border-indigo-brand/20">Interview: {c.interview_score}%</span>
                    </div>
                  </div>
                  
                  <div className="flex-[2] bg-surface-bright/50 p-md rounded-xl border border-surface-container min-w-[250px]">
                    <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Recommendation</div>
                    <div className="text-on-surface text-sm font-medium leading-relaxed">
                      {c.improvement_plan && typeof c.improvement_plan === 'string' ? JSON.parse(c.improvement_plan)[0] : "Strong technical foundation. Highly recommended based on test scores."}
                    </div>
                  </div>

                  <div className="text-center px-lg shrink-0">
                    <div className="text-4xl font-black text-success drop-shadow-sm leading-none mb-1">{c.overall_score}%</div>
                    <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Overall Match</div>
                  </div>

                  <div className="flex flex-col gap-sm shrink-0 w-32">
                    <button onClick={() => { setSelectedCandidate(c); setEvidenceTab("overview"); }} className="py-sm bg-indigo-brand/10 text-indigo-brand border border-indigo-brand/20 rounded-lg font-bold cursor-pointer text-xs hover:bg-indigo-brand/20 transition-colors flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> Review</button>
                    {c.verdict ? (
                      <div className={`py-sm rounded-lg font-black text-xs text-center uppercase tracking-wider border ${getVerdictClasses(c.verdict)}`}>{c.verdict}</div>
                    ) : (
                      <div className="flex gap-xs">
                        <button onClick={() => handleHireInitiate(c)} className="flex-1 py-sm bg-success text-white border-none rounded-lg font-black cursor-pointer text-[10px] shadow-sm hover:opacity-90">Hire</button>
                        <button onClick={() => updateVerdict(c.id, "WAITLIST")} className="flex-1 py-sm bg-indigo-brand text-white border-none rounded-lg font-black cursor-pointer text-[10px] shadow-sm hover:opacity-90">Wait</button>
                        <button onClick={() => updateVerdict(c.id, "REJECT")} className="flex-1 py-sm bg-error text-white border-none rounded-lg font-black cursor-pointer text-[10px] shadow-sm hover:opacity-90">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="text-center p-xxxl text-on-surface-variant text-body-base bg-surface-bright/50 rounded-2xl border border-surface-container font-medium">No candidates found matching your criteria.</div>}
              </div>
            </div>
          )}

          {tab === "pipeline" && (
            <div className="glass p-xl rounded-2xl shadow-sm border border-surface-container overflow-hidden">
              <h3 className="text-title-md font-black text-on-surface m-0 mb-lg flex items-center gap-xs"><span className="material-symbols-outlined text-[24px]">view_kanban</span> Hiring Pipeline</h3>
              <div className="rounded-xl overflow-x-auto border border-surface-container bg-surface-bright/50">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container/50 text-on-surface-variant text-xs text-left uppercase tracking-wider font-bold">
                      <th className="p-md">Candidate</th>
                      <th className="p-md">Security Status</th>
                      <th className="p-md">Overall Score</th>
                      <th className="p-md">Current Stage</th>
                      <th className="p-md">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b border-surface-container hover:bg-surface-container/20 transition-colors">
                        <td className="p-md">
                          <div className="font-bold text-on-surface text-sm">{c.name}</div>
                          <div className="text-xs text-on-surface-variant font-medium mt-0.5">{c.email}</div>
                        </td>
                        <td className="p-md">
                          {c.triangle_status === "FLAGGED" ? <span className="text-error bg-error/10 px-sm py-1 rounded-md text-[10px] font-black border border-error/20 flex items-center w-max gap-1"><span className="material-symbols-outlined text-[14px]">flag</span> FLAGGED</span> : <span className="text-success bg-success/10 px-sm py-1 rounded-md text-[10px] font-black border border-success/20 flex items-center w-max gap-1"><span className="material-symbols-outlined text-[14px]">verified</span> VERIFIED</span>}
                        </td>
                        <td className="p-md font-black text-on-surface text-body-lg">{c.overall_score}%</td>
                        <td className="p-md">
                          <span className={`px-sm py-1 rounded-md text-[10px] font-black uppercase tracking-wider w-max block text-center border ${getVerdictClasses(c.verdict || "")}`}>{c.verdict || "AI REVIEWED"}</span>
                        </td>
                        <td className="p-md">
                           <button onClick={() => { setSelectedCandidate(c); setEvidenceTab("overview"); }} className="px-md py-sm bg-surface-bright border border-surface-container rounded-lg text-xs cursor-pointer font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shadow-sm">View Details</button>
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
              <div className="flex justify-between items-center mb-lg">
                <h3 className="text-title-md font-black text-on-surface m-0 flex items-center gap-xs"><span className="material-symbols-outlined text-[24px]">work</span> Job Postings ({jobs.length})</h3>
                <button onClick={() => setShowJobForm(!showJobForm)} className={`px-xl py-sm rounded-xl font-bold cursor-pointer text-sm shadow-sm transition-all flex items-center gap-1 ${showJobForm ? "bg-surface-container/50 text-on-surface-variant hover:bg-surface-container" : "bg-gradient-to-r from-success to-success-dark text-white hover:scale-[1.02]"}`}>
                  {showJobForm ? <><span className="material-symbols-outlined text-[18px]">close</span> Cancel</> : <><span className="material-symbols-outlined text-[18px]">add</span> Post New Job</>}
                </button>
              </div>
              {showJobForm && (
                <div className="glass p-xl border-2 border-success/40 rounded-2xl mb-xl shadow-md animate-[slideDown_0.3s_ease]">
                  <input placeholder="Job Title *" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} className="w-full px-md py-md bg-surface-bright border border-surface-container rounded-xl mb-md text-sm font-medium text-on-surface focus:border-success focus:ring-1 focus:ring-success outline-none transition-all" />
                  <textarea placeholder="Job Description *" value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full px-md py-md bg-surface-bright border border-surface-container rounded-xl text-sm font-medium text-on-surface focus:border-success focus:ring-1 focus:ring-success outline-none transition-all resize-y" />
                  <div className="flex gap-md mt-md">
                    <button onClick={postJob} className="w-full py-md bg-gradient-to-r from-success to-success-dark text-white border-none rounded-xl font-black cursor-pointer text-sm shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-xs"><span className="material-symbols-outlined text-[20px]">rocket_launch</span> Launch Job Post</button>
                  </div>
                </div>
              )}
              <div className="grid gap-lg grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job: any, i: number) => (
                  <div key={i} className="glass p-lg rounded-2xl shadow-sm border border-surface-container hover:shadow-md transition-shadow">
                    <h4 className="text-body-lg font-black text-on-surface m-0 mb-sm">{job.title}</h4>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed m-0">{job.description}</p>
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-md animate-[fadeIn_0.2s_ease]">
          <div className="glass w-full max-w-2xl p-xl rounded-xxxl shadow-lg border border-surface-container relative animate-[slideUp_0.3s_ease]">
            <button onClick={() => setOfferModal(null)} className="absolute top-md right-md w-10 h-10 bg-surface-container/50 hover:bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant font-bold cursor-pointer transition-colors border-none"><span className="material-symbols-outlined text-[20px]">close</span></button>
            <h2 className="text-title-lg font-black text-on-surface m-0 mb-xs flex items-center gap-xs"><span className="material-symbols-outlined text-[28px] text-info-dark">auto_awesome</span> AI Offer Draft</h2>
            <p className="text-sm font-medium text-on-surface-variant mb-lg">Review and edit the AI-generated offer email before finalizing the hire.</p>
            
            <textarea value={offerDraft} onChange={e => setOfferDraft(e.target.value)} rows={12} className="w-full px-lg py-md bg-surface-bright/50 border border-surface-container rounded-2xl text-sm font-medium text-on-surface leading-relaxed focus:border-success focus:ring-1 focus:ring-success outline-none transition-all resize-none" />
            
            <div className="flex gap-md mt-lg">
              <button onClick={() => setOfferModal(null)} className="flex-1 py-md bg-surface-container border border-surface-container-high text-on-surface-variant rounded-xl font-bold cursor-pointer text-sm hover:bg-surface-container-high transition-colors">Cancel</button>
              <button onClick={confirmHire} className="flex-[2] py-md bg-gradient-to-r from-success to-success-dark text-white border-none rounded-xl font-black cursor-pointer text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-xs"><span className="material-symbols-outlined text-[20px]">send</span> Send Offer & Hire Candidate</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Evidence Review Modal */}
      {selectedCandidate && !offerModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-md animate-[fadeIn_0.2s_ease]">
          <div className="glass w-full max-w-4xl max-h-[90vh] rounded-xxxl shadow-lg border border-surface-container flex flex-col relative overflow-hidden animate-[slideUp_0.3s_ease]">
            
            {/* Modal Header */}
            <div className="p-xl bg-surface-bright/50 border-b border-surface-container relative">
              <button onClick={() => setSelectedCandidate(null)} className="absolute top-md right-md w-10 h-10 bg-surface-container/50 hover:bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant font-bold cursor-pointer transition-colors border-none"><span className="material-symbols-outlined text-[20px]">close</span></button>
              <h2 className="text-title-xl font-black text-on-surface m-0 mb-1">{selectedCandidate.name}</h2>
              <div className="text-sm font-medium text-on-surface-variant">{selectedCandidate.email}</div>
              
              {/* Modal Inner Tabs */}
              <div className="flex gap-lg mt-lg border-b border-surface-container/50">
                {["overview", "transcript", "security"].map(t => (
                  <button key={t} onClick={() => setEvidenceTab(t)} className={`pb-sm border-none bg-transparent cursor-pointer font-bold text-sm uppercase tracking-wider transition-all border-b-2 ${evidenceTab === t ? "text-indigo-brand border-indigo-brand" : "text-on-surface-variant border-transparent hover:text-on-surface"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content Area */}
            <div className="p-xl overflow-y-auto flex-1 bg-surface-bright/20 custom-scrollbar">
              {evidenceTab === "overview" && (
                <div className="animate-[fadeIn_0.3s_ease]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg mb-xl">
                     <div className="bg-surface-bright/50 p-lg rounded-2xl border border-surface-container shadow-sm">
                       <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">shield</span> Security Status</div>
                       <div className={`text-body-lg font-black mt-xs ${selectedCandidate.triangle_status === "FLAGGED" ? "text-error" : "text-success"} flex items-center gap-1`}>
                         {selectedCandidate.triangle_status === "FLAGGED" ? <><span className="material-symbols-outlined text-[20px]">warning</span> FLAGGED (Malpractice detected)</> : <><span className="material-symbols-outlined text-[20px]">verified_user</span> VERIFIED (No issues)</>}
                       </div>
                     </div>
                     <div className="bg-surface-bright/50 p-lg rounded-2xl border border-surface-container shadow-sm">
                       <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">fact_check</span> Authenticity Score</div>
                       <div className="text-headline-sm font-black text-on-surface mt-xs">{selectedCandidate.authenticity_score || 100}%</div>
                     </div>
                  </div>

                  <h3 className="text-title-sm font-black text-on-surface mb-md">AI Executive Summary</h3>
                  <div className="bg-indigo-brand/5 p-lg rounded-2xl border border-indigo-brand/20 shadow-sm">
                    <div className="text-[10px] text-indigo-brand font-bold uppercase tracking-wider mb-sm flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">analytics</span> Strengths & Weaknesses</div>
                    <ul className="m-0 pl-md text-indigo-brand/90 text-sm font-medium leading-relaxed">
                      {selectedCandidate.improvement_plan && typeof selectedCandidate.improvement_plan === 'string' ? 
                        JSON.parse(selectedCandidate.improvement_plan).map((item: string, i: number) => <li key={i} className="mb-xs">{item}</li>) 
                        : <li>Strong communication and technical depth observed during AI interview.</li>
                      }
                    </ul>
                  </div>
                </div>
              )}

              {evidenceTab === "transcript" && (
                <div className="animate-[fadeIn_0.3s_ease]">
                   <h3 className="text-title-sm font-black text-on-surface mb-md">AI Interview Transcript</h3>
                   <div className="bg-surface-container/20 p-lg rounded-2xl border border-surface-container text-on-surface-variant text-sm font-mono leading-relaxed shadow-inner">
                     <p><span className="font-bold text-on-surface">[00:01:23] AI:</span> Could you explain how you handle state management in React?</p>
                     <p className="mt-sm"><span className="font-bold text-indigo-brand">[00:01:45] Candidate:</span> Well, I usually prefer using Context API for lighter apps, but for larger scale, I'd go with Redux Toolkit or Zustand because...</p>
                     <p className="mt-xl text-xs italic opacity-70 text-center">(Full transcript integration pending ATS text feed)</p>
                   </div>
                </div>
              )}

              {evidenceTab === "security" && (
                <div className="animate-[fadeIn_0.3s_ease]">
                   <h3 className="text-title-sm font-black text-on-surface mb-md">Trust Triangle Event Logs</h3>
                   {selectedCandidate.triangle_status === "FLAGGED" ? (
                     <div className="bg-error/10 p-lg rounded-2xl border border-error/20 text-error-dark shadow-sm">
                       <p className="m-0 mb-md font-black flex items-center gap-xs text-error"><span className="material-symbols-outlined text-[20px]">warning</span> Security Violations Detected</p>
                       <ul className="m-0 pl-md text-sm font-medium leading-relaxed">
                         <li className="mb-xs">Tab switching detected 4 times during skill test.</li>
                         <li>Webcam consistency dropped below threshold during minute 12.</li>
                       </ul>
                     </div>
                   ) : (
                     <div className="bg-success/10 p-lg rounded-2xl border border-success/20 text-success-dark font-bold text-center shadow-sm flex items-center justify-center gap-sm text-sm">
                       <span className="material-symbols-outlined text-[20px] text-success">verified</span> No security violations detected during the entire assessment lifecycle.
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-xl bg-surface-bright/80 backdrop-blur-sm border-t border-surface-container flex gap-md items-center">
              <button onClick={() => handleHireInitiate(selectedCandidate)} className="flex-[2] py-md bg-gradient-to-r from-success to-success-dark text-white border-none rounded-xl font-black cursor-pointer text-sm shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-xs"><span className="material-symbols-outlined text-[20px]">auto_awesome</span> Proceed to Hire (AI Draft)</button>
              <button onClick={() => updateVerdict(selectedCandidate.id, "WAITLIST")} className="flex-1 py-md bg-indigo-brand/10 text-indigo-brand border border-indigo-brand/20 rounded-xl font-bold cursor-pointer text-sm hover:bg-indigo-brand/20 transition-colors">Waitlist</button>
              <button onClick={() => updateVerdict(selectedCandidate.id, "REJECT")} className="flex-1 py-md bg-error/10 text-error border border-error/20 rounded-xl font-bold cursor-pointer text-sm hover:bg-error/20 transition-colors">Reject</button>
            </div>
          </div>
        </div>
      )}
      {/* Footer / Founder Info */}
      <div className="mt-xxxl pt-xl border-t border-surface-container/50 flex flex-col md:flex-row items-center justify-between animate-[fadeIn_0.5s_ease]">
        <div className="flex items-center gap-md mb-md md:mb-0">
          <img src="https://ui-avatars.com/api/?name=Mohamed+Jabri+J+S&background=1E293B&color=00B87C&size=150" alt="Mohamed Jabri J S" className="w-12 h-12 rounded-full object-cover ring-2 ring-success/40 shadow-sm hover:scale-105 transition-transform" />
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
