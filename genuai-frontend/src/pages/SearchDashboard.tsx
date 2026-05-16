import { useState } from 'react';

interface Props { user: any; onBack: () => void; }

// The actual Job Board component
function JobBoard({ user, onBack, initialFilter = 'All' }: { user: any, onBack: () => void, initialFilter?: string }) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState(initialFilter);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const JOBS = [
    { id:1, role:'Frontend Developer', company:'GenuAI Technologies', location:'Chennai, India', mode:'Hybrid', type:'Full-time', tags:['React','TypeScript','Tailwind'], posted:'2 days ago', matched: 94 },
    { id:2, role:'Backend Engineer', company:'GenuAI Technologies', location:'Remote', mode:'Remote', type:'Full-time', tags:['Node.js','PostgreSQL','AWS'], posted:'1 week ago', matched: 88 },
    { id:3, role:'Data Scientist Intern', company:'GenuAI Technologies', location:'Bangalore, India', mode:'On-site', type:'Internship', tags:['Python','Machine Learning','SQL'], posted:'3 days ago', matched: 82 },
    { id:4, role:'UI/UX Designer', company:'GenuAI Technologies', location:'Remote', mode:'Remote', type:'Contract', tags:['Figma','Prototyping','User Research'], posted:'5 days ago', matched: 76 },
    { id:5, role:'Product Manager', company:'GenuAI Technologies', location:'Chennai, India', mode:'Hybrid', type:'Full-time', tags:['Agile','Jira','Roadmapping'], posted:'Just now', matched: 91 },
    { id:6, role:'DevOps Engineer', company:'GenuAI Technologies', location:'Bangalore, India', mode:'Hybrid', type:'Full-time', tags:['Docker','Kubernetes','CI/CD'], posted:'2 weeks ago', matched: 79 },
  ];

  const filteredJobs = JOBS.filter(j => {
    if (filterMode !== 'All' && filterMode !== 'Internships' && j.mode !== filterMode) return false;
    if (filterMode === 'Internships' && j.type !== 'Internship') return false;
    if (search && !j.role.toLowerCase().includes(search.toLowerCase()) && !j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 24px' }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"24px", fontWeight:"700" }}>← Back to Search Hub</button>
      <div style={{ background:'linear-gradient(135deg,#F59E0B,#EF4444)', borderRadius:'24px', padding:'40px', color:'#fff', marginBottom:'32px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 12px 30px rgba(245,158,11,0.2)' }}>
        <div>
          <h1 style={{ fontSize:'32px', fontWeight:'900', margin:'0 0 12px', letterSpacing:'-0.5px' }}>Find Your Next Opportunity</h1>
          <p style={{ fontSize:'15px', opacity:0.9, margin:0, maxWidth:'500px', lineHeight:'1.6' }}>Explore open roles at GenuAI Technologies and our partner network. Apply directly with your GenuAI profile.</p>
        </div>
        <div style={{ fontSize:'64px' }}>💼</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'32px' }}>
        <div>
          <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px' }}>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A', marginBottom:'20px' }}>Filters</div>
            <div style={{ marginBottom:'24px' }}>
              <label style={{ fontSize:'13px', fontWeight:'700', color:'#64748B', display:'block', marginBottom:'8px' }}>Search Role or Skill</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'12px', top:'10px', color:'#94A3B8' }}>🔍</span>
                <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="e.g. React" style={{ width:'100%', padding:'10px 12px 10px 36px', border:'1.5px solid #E2E8F0', borderRadius:'10px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={{ fontSize:'13px', fontWeight:'700', color:'#64748B', display:'block', marginBottom:'8px' }}>Work Mode</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['All', 'Remote', 'Hybrid', 'On-site', 'Internships'].map(mode => (
                  <label key={mode} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', color:'#334155', cursor:'pointer' }}>
                    <input type="radio" checked={filterMode === mode} onChange={() => setFilterMode(mode)} style={{ cursor:'pointer' }} />
                    {mode}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius:'16px', border:'1px solid #BFDBFE', padding:'24px', marginTop:'24px' }}>
            <div style={{ fontSize:'24px', marginBottom:'12px' }}>💡</div>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#1E3A8A', marginBottom:'8px' }}>AI Match Score</div>
            <div style={{ fontSize:'13px', color:'#1E40AF', lineHeight:'1.6' }}>We analyze your resume and test scores to show you how well you match each role.</div>
          </div>
        </div>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <div style={{ fontWeight:'700', color:'#475569', fontSize:'15px' }}>Showing {filteredJobs.length} open roles</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {filteredJobs.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:'16px', padding:'48px', textAlign:'center', border:'1px solid #E2E8F0' }}>
                <div style={{ fontSize:'32px', marginBottom:'16px' }}>📭</div>
                <div style={{ fontWeight:'700', fontSize:'16px', color:'#0F172A' }}>No jobs found</div>
                <div style={{ fontSize:'14px', color:'#64748B', marginTop:'4px' }}>Try adjusting your filters</div>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px', transition:'all 0.2s', boxShadow: selectedJob === job.id ? '0 12px 24px rgba(0,0,0,0.06)' : 'none', transform: selectedJob === job.id ? 'translateY(-2px)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:'16px' }}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'12px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                        <img src="/logo.png" alt="" style={{ width:'80%', height:'80%', objectFit:'contain' }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', margin:'0 0 4px' }}>{job.role}</h3>
                        <div style={{ fontSize:'14px', color:'#64748B', display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ fontWeight:'600' }}>{job.company}</span><span>•</span><span>📍 {job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'#ECFDF5', color:'#059669', padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'800' }}>
                        ✨ {job.matched}% Match
                      </div>
                      <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'8px' }}>{job.posted}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', marginTop:'20px', flexWrap:'wrap' }}>
                    <span style={{ background:'#F1F5F9', color:'#475569', padding:'4px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600' }}>{job.mode}</span>
                    <span style={{ background:'#F1F5F9', color:'#475569', padding:'4px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600' }}>{job.type}</span>
                    {job.tags.map(t => <span key={t} style={{ background:'#EEF2FF', color:'#4F46E5', padding:'4px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'600' }}>{t}</span>)}
                  </div>
                  <div style={{ marginTop:'24px', paddingTop:'20px', borderTop:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    {selectedJob === job.id ? (
                      <div style={{ fontSize:'13px', color:'#059669', fontWeight:'700' }}>✅ Application submitted successfully!</div>
                    ) : (
                      <button onClick={() => setSelectedJob(job.id)} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'700', cursor:'pointer' }}>Apply Now →</button>
                    )}
                    <button style={{ padding:'10px', background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontSize:'18px' }}>⭐</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// The Hub (6 cards)
const TOOLS = [
  { id:'network', icon:'🤝', title:'Professional Network', desc:'Connect with professionals, share updates, and build your profile.', color:'#0A66C2', bg:'#EFF6FF', tags:['LinkedIn Style','Networking'], ready:false, filter:'All' },
  { id:'jobs', icon:'🌍', title:'Global Job Board', desc:'Search thousands of job listings across top platforms.', color:'#2563EB', bg:'#EFF6FF', tags:['Indeed / NaukriGulf','Jobs'], ready:true, filter:'All' },
  { id:'events', icon:'🏆', title:'Competitions & Events', desc:'Participate in hackathons and university case studies.', color:'#F59E0B', bg:'#FFFBEB', tags:['Unstop Platform','Hackathons'], ready:false, filter:'All' },
  { id:'pm', icon:'🧠', title:'PM Internship Allocation', desc:'AI-based matching scheme for Product Management internships.', color:'#8B5CF6', bg:'#F5F3FF', tags:['AI Matching','Product Management'], ready:false, filter:'All' },
  { id:'news', icon:'📰', title:'Tech & Company News', desc:'Stay updated with the latest in tech, business, and startups.', color:'#10B981', bg:'#ECFDF5', tags:['Tech News','Company Updates'], ready:true, filter:'News' },
  { id:'chat', icon:'💬', title:'Instant Connect', desc:'Real-time messenger to connect with recruiters and peers.', color:'#25D366', bg:'#ECFDF5', tags:['WhatsApp Style','Messaging'], ready:true, filter:'Chat' },
];

export default function SearchDashboard({ user, onBack }: Props) {
  const [active, setActive] = useState<string|null>(null);
  const [openTool, setOpenTool] = useState<typeof TOOLS[0] | null>(null);
  const [toast, setToast] = useState('');
  const name = user?.user?.name || user?.name || 'Candidate';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleOpen = (tool: typeof TOOLS[0]) => {
    if (tool.ready) setOpenTool(tool);
    else showToast(`${tool.title} — Coming Soon! 🚧`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {toast && (
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background:'#1E293B', color:'#fff', padding:'12px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', zIndex:9999, boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <img src="/logo.png" alt="GenuAI" style={{ width:'44px', height:'44px', objectFit:'contain', filter:'drop-shadow(0 2px 6px rgba(212,175,55,0.4))' }} />
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B' }}>Search Path</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={onBack} style={{ background:'none', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', color:'#64748B', cursor:'pointer', fontWeight:'600' }}>← Change Path</button>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#F59E0B,#EF4444)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize:'14px', color:'#374151', fontWeight:'600' }}>{name}</span>
          </div>
        </div>
      </nav>

      {openTool ? (
        openTool.id === 'news' ? (
          <div style={{ maxWidth:'800px', margin:'0 auto', padding:'40px 24px' }}>
            <button onClick={() => setOpenTool(null)} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"24px", fontWeight:"700" }}>← Back to Search Hub</button>
            <div style={{ background:'linear-gradient(135deg,#10B981,#059669)', borderRadius:'24px', padding:'32px', color:'#fff', marginBottom:'32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h1 style={{ fontSize:'28px', fontWeight:'900', margin:'0 0 8px' }}>Tech & Company News</h1>
                <p style={{ fontSize:'14px', opacity:0.9, margin:0 }}>The latest updates relevant to your career.</p>
              </div>
              <div style={{ fontSize:'48px' }}>📰</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { tag: "AI Trends", title: "OpenAI Announces New Advanced Reasoning Models", src: "TechCrunch", time: "2 hours ago" },
                { tag: "Hiring", title: "Top 10 Tech Companies Actively Hiring Remote Product Managers", src: "Forbes", time: "5 hours ago" },
                { tag: "Startups", title: "GenuAI Technologies Secures Funding to Revolutionize AI Recruitment", src: "Tech Radar", time: "1 day ago" },
                { tag: "Development", title: "React 19 Release: What Frontend Engineers Need to Know", src: "Dev.to", time: "2 days ago" },
              ].map((news, i) => (
                <div key={i} style={{ padding: "20px", background: "#fff", border: "1px solid #E2E8F0", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "10px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#10B981", background: "#10B98115", padding: "4px 10px", borderRadius: "6px", alignSelf: "flex-start" }}>{news.tag}</span>
                  <h4 style={{ margin: 0, color: "#1E293B", fontSize: "18px" }}>{news.title}</h4>
                  <div style={{ fontSize: "13px", color: "#94A3B8" }}>{news.src} • {news.time}</div>
                </div>
              ))}
            </div>
          </div>
        ) : openTool.id === 'chat' ? (
          <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'40px 24px', height:'85vh', display:'flex', flexDirection:'column' }}>
            <button onClick={() => setOpenTool(null)} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"24px", fontWeight:"700", alignSelf:'flex-start' }}>← Back to Search Hub</button>
            <div style={{ display: "flex", flex:1, border: "1.5px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", background:'#fff', boxShadow:'0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ width: "280px", background: "#F8FAFC", borderRight: "1.5px solid #E2E8F0", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px", borderBottom: "1.5px solid #E2E8F0", fontWeight: "800", color: "#1E293B", fontSize: "16px", background:'#fff' }}>Instant Connect</div>
                <div style={{ padding: "16px", background: "#E2E8F055", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #E2E8F0", cursor: "pointer" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#128C7E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "14px" }}>HR</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B" }}>GenuAI Recruiting</div>
                    <div style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Are you available for an...</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F1F5F9" }}>
                <div style={{ padding: "20px", background: "#fff", borderBottom: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#25D366,#128C7E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "14px" }}>HR</div>
                  <div>
                    <div style={{ fontWeight: "800", color: "#1E293B", fontSize: "16px" }}>GenuAI Recruiting</div>
                    <div style={{ fontSize: "12px", color: "#25D366", fontWeight: "700" }}>Online</div>
                  </div>
                </div>
                <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ alignSelf: "center", background: "#E2E8F0", color: "#64748B", padding: "6px 14px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>Today</div>
                  <div style={{ alignSelf: "flex-start", background: "#fff", padding: "14px 18px", borderRadius: "16px 16px 16px 0", maxWidth: "70%", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "15px", color: "#1E293B", lineHeight: "1.5" }}>Hi {name}! We reviewed your impressive assessment score and would love to schedule a technical interview. Are you available sometime tomorrow?</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "8px", textAlign: "right" }}>10:42 AM</div>
                  </div>
                </div>
                <div style={{ padding: "20px", background: "#fff", borderTop: "1.5px solid #E2E8F0", display: "flex", gap: "16px", alignItems: "center" }}>
                  <button style={{ background: "transparent", border: "none", fontSize: "24px", cursor: "pointer", opacity: 0.6 }}>📎</button>
                  <input placeholder="Type your message..." style={{ flex: 1, padding: "14px 20px", border: "1.5px solid #E2E8F0", borderRadius: "24px", outline: "none", fontSize: "15px", background: "#F8FAFC" }} />
                  <button style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: "50%", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <JobBoard user={user} onBack={() => setOpenTool(null)} initialFilter={openTool.filter} />
        )
      ) : (
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'48px 24px' }}>
          <div style={{ marginBottom:'40px' }}>
            <h1 style={{ fontSize:'32px', fontWeight:'900', color:'#0F172A', margin:'0 0 8px', letterSpacing:'-0.6px' }}>Search Hub</h1>
            <p style={{ color:'#64748B', fontSize:'15px', margin:0 }}>Explore jobs and internships tailored to your skills</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }}>
            {TOOLS.map(tool => {
              const isHover = active === tool.id;
              return (
                <div key={tool.id} onMouseEnter={() => setActive(tool.id)} onMouseLeave={() => setActive(null)}
                  style={{ background:'#fff', borderRadius:'20px', border: isHover ? '2px solid ' + tool.color : '2px solid #E5E7EB', padding:'28px', cursor:'pointer', transition:'all 0.2s ease', boxShadow: isHover ? '0 12px 40px ' + tool.color + '33' : '0 2px 8px rgba(0,0,0,0.04)', transform: isHover ? 'translateY(-3px)' : 'none', position:'relative' }}>
                  {!tool.ready && <div style={{ position:'absolute', top:'14px', right:'14px', background:'#FEF3C7', color:'#92400E', fontSize:'10px', fontWeight:'800', padding:'3px 8px', borderRadius:'20px' }}>SOON</div>}
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:tool.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'16px' }}>{tool.icon}</div>
                  <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>{tool.title}</h3>
                  <p style={{ fontSize:'13px', color:'#64748B', lineHeight:'1.6', margin:'0 0 16px' }}>{tool.desc}</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px' }}>
                    {tool.tags.map((t,i) => <span key={i} style={{ background:tool.bg, color:tool.color, fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px' }}>{t}</span>)}
                  </div>
                  <button onClick={() => handleOpen(tool)} style={{ width:'100%', padding:'10px', background: isHover ? tool.color : 'transparent', border:'1px solid ' + tool.color, borderRadius:'10px', color: isHover ? '#fff' : tool.color, fontWeight:'700', fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}>
                    {tool.ready ? (isHover ? 'Launch →' : 'Open Tool') : 'Coming Soon'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
