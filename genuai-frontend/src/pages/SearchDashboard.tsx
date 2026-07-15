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
        <div style={{ width: '80px', height: '80px', overflow: 'hidden', borderRadius: '16px', background: '#fff' }}>
          <img src="/icons/resume_gen.png" alt="Jobs" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
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
            <div style={{ marginBottom:'24px' }}>
              <label style={{ fontSize:'13px', fontWeight:'700', color:'#64748B', display:'block', marginBottom:'8px' }}>Experience Level</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {['Any Experience', 'Entry-level (0-2 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)', 'Leadership'].map((exp, i) => (
                  <label key={exp} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'14px', color:'#334155', cursor:'pointer' }}>
                    <input type="radio" name="exp" defaultChecked={i === 0} style={{ cursor:'pointer' }} />
                    {exp}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:'8px' }}>
              <label style={{ fontSize:'13px', fontWeight:'700', color:'#64748B', display:'block', marginBottom:'8px' }}>Expected Salary</label>
              <select style={{ width:'100%', padding:'10px', borderRadius:'10px', border:'1.5px solid #E2E8F0', outline:'none', fontSize:'14px', color:'#334155', background:'#fff', cursor:'pointer' }}>
                <option>Any Salary</option>
                <option>$50k - $100k</option>
                <option>$100k - $150k</option>
                <option>$150k+</option>
              </select>
            </div>
          </div>
          <div style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius:'16px', border:'1px solid #BFDBFE', padding:'24px', marginTop:'24px' }}>
            <div style={{ fontSize:'24px', marginBottom:'12px' }}>💡</div>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#1E3A8A', marginBottom:'8px' }}>AI Match Score</div>
            <div style={{ fontSize:'13px', color:'#1E40AF', lineHeight:'1.6' }}>We analyze your resume and test scores to show you how well you match each role.</div>
          </div>
          <div style={{ background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)', borderRadius:'16px', border:'1px solid #DDD6FE', padding:'24px', marginTop:'24px' }}>
            <div style={{ fontSize:'24px', marginBottom:'12px' }}>🎯</div>
            <div style={{ fontWeight:'800', fontSize:'15px', color:'#5B21B6', marginBottom:'8px' }}>AI Skill Gap Analyzer</div>
            <div style={{ fontSize:'13px', color:'#4C1D95', lineHeight:'1.6', marginBottom:'16px' }}>See exactly which skills you need to learn to increase your match score for top roles.</div>
            <button style={{ width:'100%', background:'#7C3AED', color:'#fff', border:'none', borderRadius:'8px', padding:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px rgba(124,58,237,0.3)', transition:'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>Analyze My Gaps</button>
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

// Professional Network Component
function NetworkView({ user, onBack }: { user: any, onBack: () => void }) {
  const name = user?.user?.name || user?.name || 'Candidate';
  const [newPost, setNewPost] = useState('');
  
  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px', display:'grid', gridTemplateColumns:'280px 1fr 300px', gap:'24px' }}>
      {/* Left Column: Profile Snapshot */}
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"8px", fontWeight:"700", display:'flex', alignItems:'center', gap:'8px' }}>← Back to Hub</button>
        
        {/* Profile Card */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ height:'80px', background:'linear-gradient(135deg,#0A66C2,#2563EB)' }}></div>
          <div style={{ padding:'0 20px 20px', textAlign:'center', marginTop:'-40px' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#fff', border:'4px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', boxShadow:'0 4px 8px rgba(0,0,0,0.1)', overflow:'hidden' }}>
              <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontSize:'32px' }}>{name[0]?.toUpperCase()}</div>
            </div>
            <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', margin:'0 0 4px' }}>{name}</h2>
            <div style={{ fontSize:'13px', color:'#64748B', marginBottom:'16px' }}>AI-Assessed Tech Professional</div>
            <div style={{ background:'#EFF6FF', color:'#1E3A8A', padding:'8px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', marginBottom:'16px' }}>GenuAI Readiness Score: 92/100</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748B', borderTop:'1px solid #F1F5F9', paddingTop:'12px', paddingBottom:'12px', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span>Profile Viewers</span>
              <span style={{ color:'#0A66C2', fontWeight:'700' }}>34</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748B', cursor:'pointer', paddingBottom:'4px' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span>Network Connections</span>
              <span style={{ color:'#0A66C2', fontWeight:'700' }}>142</span>
            </div>
          </div>
        </div>

        {/* My Items Card */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
           <div style={{ padding:'16px', borderBottom:'1px solid #F1F5F9', fontWeight:'700', fontSize:'14px', color:'#0F172A' }}>My GenuAI Dashboard</div>
           <div style={{ display:'flex', flexDirection:'column' }}>
             <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', color:'#475569', fontSize:'13px', fontWeight:'600', transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
               <span style={{ fontSize:'16px' }}>🔖</span> Saved Jobs (4)
             </div>
             <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', color:'#475569', fontSize:'13px', fontWeight:'600', transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
               <span style={{ fontSize:'16px' }}>📝</span> Active Assessments
             </div>
             <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', color:'#475569', fontSize:'13px', fontWeight:'600', transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
               <span style={{ fontSize:'16px' }}>🏅</span> Skill Badges (3)
             </div>
           </div>
        </div>

        {/* Communities Card */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
           <div style={{ padding:'16px', borderBottom:'1px solid #F1F5F9', fontWeight:'700', fontSize:'14px', color:'#0F172A' }}>Communities & Tags</div>
           <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
             <div style={{ color:'#0A66C2', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>Groups</div>
             <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#475569', fontSize:'13px', cursor:'pointer' }}><span>👥</span> GenuAI Frontend Devs</div>
             <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#475569', fontSize:'13px', cursor:'pointer' }}><span>👥</span> AI Engineers Hub</div>
             <div style={{ color:'#0A66C2', fontSize:'13px', fontWeight:'600', cursor:'pointer', marginTop:'8px' }}>Followed Tags</div>
             <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
               <span style={{ fontSize:'12px', color:'#64748B', background:'#F1F5F9', padding:'4px 8px', borderRadius:'12px' }}>#ReactJS</span>
               <span style={{ fontSize:'12px', color:'#64748B', background:'#F1F5F9', padding:'4px 8px', borderRadius:'12px' }}>#SystemDesign</span>
             </div>
           </div>
           <div style={{ padding:'12px 16px', borderTop:'1px solid #F1F5F9', textAlign:'center', color:'#64748B', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
             Discover More
           </div>
        </div>
      </div>

      {/* Middle Column: Feed */}
      <div style={{ display:'flex', flexDirection:'column', gap:'24px', marginTop:'40px' }}>
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'20px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display:'flex', gap:'12px', marginBottom:'16px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'18px', flexShrink:0 }}>{name[0]?.toUpperCase()}</div>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Share your latest GenuAI achievement or technical project..." style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:'24px', padding:'14px 20px', fontSize:'14px', outline:'none', resize:'none', fontFamily:'inherit', minHeight:'60px' }}></textarea>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 8px' }}>
            <div style={{ display:'flex', gap:'16px' }}>
              <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}><span>📷</span> Media</button>
              <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}><span>💼</span> Job Update</button>
            </div>
            <button style={{ background:'#0A66C2', color:'#fff', border:'none', borderRadius:'24px', padding:'8px 24px', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>Post</button>
          </div>
        </div>
        
        {/* Post 1: GenuAI Insight */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
            <div style={{ display:'flex', gap:'12px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/icons/learning_brain.png" alt="AI" style={{ width:'100%', height:'100%', objectFit:'cover', mixBlendMode:'multiply' }} />
              </div>
              <div>
                <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'15px' }}>GenuAI Insights Engine <span style={{ color:'#059669', fontSize:'12px', marginLeft:'4px' }}>✓ Verified</span></div>
                <div style={{ fontSize:'12px', color:'#64748B' }}>System Analytics • 2h ago</div>
              </div>
            </div>
            <button style={{ background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontWeight:'800' }}>...</button>
          </div>
          <p style={{ color:'#334155', fontSize:'15px', lineHeight:'1.6', margin:'0 0 16px' }}>
            Based on our platform-wide data, candidates who complete at least 3 SVAR speaking simulations on the GenuAI platform increase their technical round pass rate by 42%. Have you tested your communication skills today?
          </p>
          <div style={{ background:'#F8FAFC', padding:'16px', borderRadius:'12px', border:'1px solid #E2E8F0', marginBottom:'16px', display:'flex', alignItems:'center', gap:'16px' }}>
             <div style={{ fontSize:'32px' }}>🎙️</div>
             <div>
               <div style={{ fontWeight:'700', color:'#0F172A', fontSize:'14px' }}>SVAR Communication Simulator</div>
               <div style={{ color:'#64748B', fontSize:'12px' }}>GenuAI Practice Hub • 15 min module</div>
             </div>
          </div>
          <div style={{ display:'flex', gap:'24px', borderTop:'1px solid #F1F5F9', paddingTop:'16px' }}>
             <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}><span>👍</span> 1,204 Likes</button>
             <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}><span>💬</span> 89 Comments</button>
          </div>
        </div>

        {/* Post 2: User Post */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
            <div style={{ display:'flex', gap:'12px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontSize:'18px' }}>R</div>
              <div>
                <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'15px' }}>Rahul S.</div>
                <div style={{ fontSize:'12px', color:'#64748B' }}>Frontend Developer at TechNova • 4h ago</div>
              </div>
            </div>
            <button style={{ color:'#0A66C2', background:'none', border:'none', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>+ Follow</button>
          </div>
          <p style={{ color:'#334155', fontSize:'15px', lineHeight:'1.6', margin:'0 0 16px' }}>
            Thrilled to announce that I just cleared the GenuAI Automata Pro coding assessment with a perfect score! The realistic environment in the Practice Hub completely eliminated my interview anxiety. Next stop: The HR round! 🚀💻
          </p>
          <div style={{ display:'flex', gap:'24px', borderTop:'1px solid #F1F5F9', paddingTop:'16px' }}>
             <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}><span>👍</span> 342 Likes</button>
             <button style={{ background:'none', border:'none', color:'#64748B', fontWeight:'600', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}><span>💬</span> 12 Comments</button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Connections & Trending */}
      <div style={{ marginTop:'40px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            AI Match Connections
            <span style={{ fontSize:'12px', background:'#EFF6FF', color:'#0A66C2', padding:'4px 8px', borderRadius:'12px' }}>High Synergy</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            {[
              { n: 'Sarah Jenkins', r: 'Senior Recruiter', m: 'Hiring React Devs' },
              { n: 'Amit Patel', r: 'Lead Engineer', m: 'Alumni Network' },
              { n: 'Elena Rodriguez', r: 'Product Manager', m: 'Similar Skills' }
            ].map((c, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:'12px', paddingBottom: i !== 2 ? '20px' : '0', borderBottom: i !== 2 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ display:'flex', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#64748B', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', flexShrink:0 }}>{c.n[0]}</div>
                  <div>
                    <div style={{ fontWeight:'700', color:'#0F172A', fontSize:'14px' }}>{c.n}</div>
                    <div style={{ fontSize:'12px', color:'#64748B' }}>{c.r}</div>
                    <div style={{ fontSize:'11px', color:'#059669', marginTop:'4px', fontWeight:'600' }}>✨ Match: {c.m}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button style={{ flex:1, border:'1px solid #0A66C2', background:'transparent', color:'#0A66C2', borderRadius:'20px', padding:'6px', fontWeight:'700', fontSize:'13px', cursor:'pointer', transition:'background 0.2s' }}>Connect</button>
                  <button title="Let AI draft your first message!" style={{ flex:1, border:'none', background:'linear-gradient(135deg,#7C3AED,#3B82F6)', color:'#fff', borderRadius:'20px', padding:'6px', fontWeight:'700', fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}><span>🪄</span> Icebreaker</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A', marginBottom:'16px' }}>GenuAI Trending</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[
              { t: 'The rise of AI-driven technical interviews', p: '10.5k readers' },
              { t: 'Why GenuAI Automata is replacing traditional whiteboarding', p: '8.2k readers' },
              { t: 'Mastering the HR behavioral round with Voice AI', p: '5.1k readers' }
            ].map((n, i) => (
              <div key={i}>
                <div style={{ fontWeight:'700', color:'#334155', fontSize:'13px', marginBottom:'4px', cursor:'pointer' }}>• {n.t}</div>
                <div style={{ fontSize:'11px', color:'#94A3B8', paddingLeft:'12px' }}>{n.p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// The Hub (6 cards)
const TOOLS = [
  { id:'network', imgSrc:'/icons/cat_english.png', title:'Professional Network', desc:'Connect with professionals, share updates, and build your profile.', color:'#0A66C2', bg:'#EFF6FF', tags:['GenuAI Hub','Connections'], ready:true, filter:'All' },
  { id:'jobs', imgSrc:'/icons/icon_globe.png', title:'Global Job Board', desc:'Search thousands of job listings across top platforms.', color:'#2563EB', bg:'#EFF6FF', tags:['Global Roles','Careers'], ready:true, filter:'All' },
  { id:'events', imgSrc:'/icons/icon_hackathon.png', title:'Competitions & Events', desc:'Participate in hackathons and university case studies.', color:'#F59E0B', bg:'#FFFBEB', tags:['Unstop Platform','Hackathons'], ready:false, filter:'All' },
  { id:'pm', imgSrc:'/icons/learning_brain.png', title:'PM Internship Allocation', desc:'AI-based matching scheme for Product Management internships.', color:'#8B5CF6', bg:'#F5F3FF', tags:['AI Matching','Product Management'], ready:false, filter:'All' },
  { id:'news', imgSrc:'/icons/cat_logical.png', title:'Tech & Company News', desc:'Stay updated with the latest in tech, business, and startups.', color:'#10B981', bg:'#ECFDF5', tags:['Tech News','Company Updates'], ready:true, filter:'News' },
  { id:'chat', imgSrc:'/icons/svar_mic.png', title:'Instant Connect', desc:'Real-time messenger to connect with recruiters and peers.', color:'#25D366', bg:'#ECFDF5', tags:['WhatsApp Style','Messaging'], ready:true, filter:'Chat' },
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
        openTool.id === 'network' ? (
          <NetworkView user={user} onBack={() => setOpenTool(null)} />
        ) : openTool.id === 'news' ? (
          <div style={{ maxWidth:'800px', margin:'0 auto', padding:'40px 24px' }}>
            <button onClick={() => setOpenTool(null)} style={{ background:"none", border:"none", color:"#64748B", fontSize:"14px", cursor:"pointer", marginBottom:"24px", fontWeight:"700" }}>← Back to Search Hub</button>
            <div style={{ background:'linear-gradient(135deg,#10B981,#059669)', borderRadius:'24px', padding:'32px', color:'#fff', marginBottom:'32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h1 style={{ fontSize:'28px', fontWeight:'900', margin:'0 0 8px' }}>Tech & Company News</h1>
                <p style={{ fontSize:'14px', opacity:0.9, margin:0 }}>The latest updates relevant to your career.</p>
              </div>
              <div style={{ width: '64px', height: '64px', overflow: 'hidden', borderRadius: '12px', background: '#fff' }}>
                <img src="/icons/cat_logical.png" alt="News" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
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
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:tool.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', overflow: 'hidden' }}>
                    <img src={tool.imgSrc} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} />
                  </div>
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

          {/* Search Hub Overview Banner */}
          <div style={{ marginTop:'64px', background:'#fff', borderRadius:'24px', padding:'48px', display:'flex', gap:'48px', alignItems:'center', border:'1px solid #E2E8F0', boxShadow:'0 12px 30px rgba(0,0,0,0.02)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:"absolute", top:"-50px", right:"-50px", width:"300px", height:"300px", background:"radial-gradient(circle, rgba(14,165,233,0.06) 0%, rgba(255,255,255,0) 70%)" }}></div>
            <div style={{ position:"absolute", bottom:"-50px", left:"-50px", width:"200px", height:"200px", background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(255,255,255,0) 70%)" }}></div>
            
            <div style={{ flex:1, paddingRight:"40px", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>
                <div style={{ width: '56px', height: '56px', overflow: 'hidden', borderRadius: '12px' }}>
                   <img src="/icons/icon_globe.png" alt="Globe" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply" }} />
                </div>
                <div>
                  <h1 style={{ fontSize:"36px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px", letterSpacing:"-1px" }}>Global Search Hub</h1>
                  <p style={{ color:"#64748B", fontSize:"16px", margin:0, fontWeight:"600" }}>Your AI-powered career launchpad</p>
                </div>
              </div>
              
              <p style={{ color:"#475569", fontSize:"16px", lineHeight:"1.7", maxWidth:"700px", marginBottom:"32px" }}>
                Welcome to the GenuAI Search Hub. This powerful ecosystem utilizes our proprietary matching algorithms to connect you with top-tier opportunities. Whether you're networking with industry professionals, exploring our curated Global Job Board, or staying updated on the latest AI trends, your next career move starts here.
              </p>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"16px", maxWidth:"800px" }}>
                <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                  <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}>🎯 Precision Matching</div>
                  <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Our AI analyzes your skills and resume for the perfect fit.</div>
                </div>
                <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                  <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}>🤝 GenuAI Network</div>
                  <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Connect seamlessly with peers and tech recruiters.</div>
                </div>
                <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                  <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}>📈 Career Insights</div>
                  <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Stay informed with tailored technology and company news.</div>
                </div>
              </div>
            </div>
            
            <div style={{ width:"280px", background:'#F8FAFC', borderRadius:'16px', border:'1px solid #E5E7EB', padding:'24px', display:'flex', flexDirection:"column", alignItems:'center', justifyContent:'center', zIndex:1, boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
              <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'16px', marginBottom:"20px", textAlign:"center" }}>Your Search Status</div>
              <div style={{ display:'flex', width:"100%", justifyContent:"space-around" }}>
                {[{label:'Active Apps',val:'3',color:'#0A66C2'},{label:'Matches',val:'12+',color:'#059669'}].map((s,i) => (
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'24px', fontWeight:'900', color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:'12px', color:'#94A3B8', fontWeight:'700', textTransform:"uppercase", marginTop:"4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
