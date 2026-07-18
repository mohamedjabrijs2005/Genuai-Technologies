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
    <div className="max-w-[1100px] mx-auto w-full p-lg md:p-xl">
      <button onClick={onBack} className="text-on-surface-variant font-bold text-sm mb-lg hover:text-on-surface flex items-center gap-xs transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Search Hub
      </button>
      <div className="bg-gradient-to-br from-warning to-error rounded-3xl p-xl text-white mb-xl flex justify-between items-center shadow-lg shadow-warning/20">
        <div>
          <h1 className="text-headline-sm font-headline-sm mb-xs">Find Your Next Opportunity</h1>
          <p className="text-sm opacity-90 font-medium max-w-lg leading-relaxed">Explore open roles at GenuAI Technologies and our partner network. Apply directly with your GenuAI profile.</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30 shrink-0">
          <img src="/icons/resume_gen.png" alt="Jobs" className="w-12 h-12 object-contain mix-blend-multiply" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-xl">
        <div>
          <div className="glass rounded-2xl border border-surface-container p-lg mb-lg">
            <div className="font-black text-title-sm text-on-surface mb-lg">Filters</div>
            <div className="mb-lg">
              <label className="text-xs font-bold text-on-surface-variant block mb-xs">Search Role or Skill</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="e.g. React" className="w-full pl-[40px] pr-md py-sm bg-background border border-surface-container rounded-xl text-sm font-medium focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand outline-none transition-all" />
              </div>
            </div>
            <div className="mb-lg">
              <label className="text-xs font-bold text-on-surface-variant block mb-xs">Work Mode</label>
              <div className="flex flex-col gap-sm">
                {['All', 'Remote', 'Hybrid', 'On-site', 'Internships'].map(mode => (
                  <label key={mode} className="flex items-center gap-sm text-sm font-medium text-on-surface cursor-pointer">
                    <input type="radio" checked={filterMode === mode} onChange={() => setFilterMode(mode)} className="cursor-pointer accent-indigo-brand" />
                    {mode}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-lg">
              <label className="text-xs font-bold text-on-surface-variant block mb-xs">Experience Level</label>
              <div className="flex flex-col gap-sm">
                {['Any Experience', 'Entry-level (0-2 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)', 'Leadership'].map((exp, i) => (
                  <label key={exp} className="flex items-center gap-sm text-sm font-medium text-on-surface cursor-pointer">
                    <input type="radio" name="exp" defaultChecked={i === 0} className="cursor-pointer accent-indigo-brand" />
                    {exp}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-xs">Expected Salary</label>
              <select className="w-full px-md py-sm bg-background border border-surface-container rounded-xl text-sm font-medium focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand outline-none transition-all cursor-pointer">
                <option>Any Salary</option>
                <option>$50k - $100k</option>
                <option>$100k - $150k</option>
                <option>$150k+</option>
              </select>
            </div>
          </div>
          <div className="bg-info/10 rounded-2xl border border-info/20 p-lg mb-lg">
            <div className="text-2xl mb-xs text-info flex items-center"><span className="material-symbols-outlined text-[24px]">lightbulb</span></div>
            <div className="font-black text-sm text-info-dark mb-xs">AI Match Score</div>
            <div className="text-xs font-medium text-info-dark/80 leading-relaxed">We analyze your resume and test scores to show you how well you match each role.</div>
          </div>
          <div className="bg-[#7C3AED]/10 rounded-2xl border border-[#7C3AED]/20 p-lg">
            <div className="text-2xl mb-xs text-[#7C3AED] flex items-center"><span className="material-symbols-outlined text-[24px]">track_changes</span></div>
            <div className="font-black text-sm text-[#7C3AED] mb-xs">AI Skill Gap Analyzer</div>
            <div className="text-xs font-medium text-[#7C3AED]/80 leading-relaxed mb-md">See exactly which skills you need to learn to increase your match score for top roles.</div>
            <button className="w-full bg-[#7C3AED] text-white rounded-xl py-sm font-bold text-xs hover:bg-[#6D28D9] transition-all hover:shadow-md hover:-translate-y-0.5">Analyze My Gaps</button>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-md">
            <div className="font-bold text-sm text-on-surface-variant">Showing {filteredJobs.length} open roles</div>
          </div>
          <div className="flex flex-col gap-lg">
            {filteredJobs.length === 0 ? (
              <div className="glass rounded-2xl p-xxl text-center border border-surface-container">
                <div className="flex justify-center mb-md text-on-surface-variant"><span className="material-symbols-outlined text-[40px]">inbox</span></div>
                <div className="font-bold text-title-sm text-on-surface">No jobs found</div>
                <div className="text-sm font-medium text-on-surface-variant mt-xs">Try adjusting your filters</div>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className={`glass rounded-2xl border ${selectedJob === job.id ? 'border-indigo-brand shadow-md scale-[1.01]' : 'border-surface-container hover:border-surface-container-high hover:-translate-y-0.5'} p-lg transition-all duration-300`}>
                  <div className="flex justify-between items-start mb-md">
                    <div className="flex gap-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-bright border border-surface-container flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="" className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-title-sm font-title-sm text-on-surface mb-xs">{job.role}</h3>
                        <div className="text-xs font-medium text-on-surface-variant flex items-center gap-xs">
                          <span className="font-bold text-on-surface">{job.company}</span><span>•</span><span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">location_on</span> {job.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-xs">
                      <div className="bg-success/10 text-success-dark px-sm py-1 rounded-full text-xs font-black flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">stars</span> {job.matched}% Match
                      </div>
                      <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{job.posted}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-xs mb-lg">
                    <span className="bg-surface-bright text-on-surface-variant px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-surface-container">{job.mode}</span>
                    <span className="bg-surface-bright text-on-surface-variant px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-surface-container">{job.type}</span>
                    {job.tags.map(t => <span key={t} className="bg-indigo-brand/10 text-indigo-brand px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-brand/20">{t}</span>)}
                  </div>
                  <div className="pt-md border-t border-surface-container flex justify-between items-center">
                    {selectedJob === job.id ? (
                      <div className="text-xs font-bold text-success flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">check_circle</span> Application submitted successfully!</div>
                    ) : (
                      <button onClick={() => setSelectedJob(job.id)} className="px-lg py-sm bg-gradient-to-br from-warning to-error text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Apply Now →</button>
                    )}
                    <button className="text-on-surface-variant hover:text-warning transition-colors"><span className="material-symbols-outlined text-[20px]">star</span></button>
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
    <div className="max-w-[1200px] mx-auto p-lg md:p-xl grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-xl">
      {/* Left Column: Profile Snapshot */}
      <div className="flex flex-col gap-lg">
        <button onClick={onBack} className="text-on-surface-variant font-bold text-sm mb-xs hover:text-on-surface flex items-center gap-xs transition-colors self-start">← Back to Hub</button>
        
        {/* Profile Card */}
        <div className="glass rounded-2xl border border-surface-container overflow-hidden shadow-sm">
          <div className="h-20 bg-gradient-to-br from-info-dark to-indigo-brand"></div>
          <div className="px-lg pb-lg text-center -mt-10">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center mx-auto mb-sm shadow-md overflow-hidden shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-brand to-primary flex items-center justify-center text-white font-black text-headline-sm">{name[0]?.toUpperCase()}</div>
            </div>
            <h2 className="text-title-sm font-black text-on-surface mb-xs">{name}</h2>
            <div className="text-xs font-medium text-on-surface-variant mb-md">AI-Assessed Tech Professional</div>
            <div className="bg-info/10 text-info-dark px-sm py-1.5 rounded-lg text-xs font-bold mb-md">GenuAI Readiness Score: 92/100</div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant border-t border-surface-container pt-sm pb-sm cursor-pointer hover:bg-surface-bright/50 transition-colors">
              <span className="font-medium">Profile Viewers</span>
              <span className="text-info-dark font-black">34</span>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant cursor-pointer hover:bg-surface-bright/50 transition-colors pb-xs">
              <span className="font-medium">Network Connections</span>
              <span className="text-info-dark font-black">142</span>
            </div>
          </div>
        </div>

        {/* My Items Card */}
        <div className="glass rounded-2xl border border-surface-container overflow-hidden shadow-sm">
           <div className="p-md border-b border-surface-container font-black text-sm text-on-surface">My GenuAI Dashboard</div>
           <div className="flex flex-col">
             <div className="px-md py-sm flex items-center gap-sm cursor-pointer text-on-surface-variant text-xs font-bold hover:bg-surface-bright/50 transition-colors">
               <span className="material-symbols-outlined text-[18px]">bookmark</span> Saved Jobs (4)
             </div>
             <div className="px-md py-sm flex items-center gap-sm cursor-pointer text-on-surface-variant text-xs font-bold hover:bg-surface-bright/50 transition-colors">
               <span className="material-symbols-outlined text-[18px]">assignment</span> Active Assessments
             </div>
             <div className="px-md py-sm flex items-center gap-sm cursor-pointer text-on-surface-variant text-xs font-bold hover:bg-surface-bright/50 transition-colors">
               <span className="material-symbols-outlined text-[18px]">military_tech</span> Skill Badges (3)
             </div>
           </div>
        </div>

        {/* Communities Card */}
        <div className="glass rounded-2xl border border-surface-container overflow-hidden shadow-sm">
           <div className="p-md border-b border-surface-container font-black text-sm text-on-surface">Communities & Tags</div>
           <div className="p-md flex flex-col gap-sm">
             <div className="text-info-dark text-xs font-bold cursor-pointer hover:underline">Groups</div>
             <div className="flex items-center gap-xs text-on-surface-variant text-xs font-medium cursor-pointer hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[16px]">group</span> GenuAI Frontend Devs</div>
             <div className="flex items-center gap-xs text-on-surface-variant text-xs font-medium cursor-pointer hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[16px]">group</span> AI Engineers Hub</div>
             <div className="text-info-dark text-xs font-bold cursor-pointer mt-xs hover:underline">Followed Tags</div>
             <div className="flex flex-wrap gap-xs">
               <span className="text-[10px] font-bold text-on-surface-variant bg-surface-bright px-xs py-1 rounded-full border border-surface-container cursor-pointer hover:border-surface-container-high transition-colors">#ReactJS</span>
               <span className="text-[10px] font-bold text-on-surface-variant bg-surface-bright px-xs py-1 rounded-full border border-surface-container cursor-pointer hover:border-surface-container-high transition-colors">#SystemDesign</span>
             </div>
           </div>
           <div className="p-sm border-t border-surface-container text-center text-on-surface-variant text-xs font-bold cursor-pointer hover:bg-surface-bright/50 transition-colors">
             Discover More
           </div>
        </div>
      </div>

      {/* Middle Column: Feed */}
      <div className="flex flex-col gap-xl mt-xl lg:mt-10">
        <div className="glass rounded-2xl border border-surface-container p-lg shadow-sm">
          <div className="flex gap-md mb-md">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-brand to-primary flex items-center justify-center text-white font-black text-title-sm shrink-0 shadow-sm">{name[0]?.toUpperCase()}</div>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Share your latest GenuAI achievement or technical project..." className="flex-1 bg-background border border-surface-container rounded-3xl px-lg py-sm text-sm font-medium outline-none resize-none min-h-[60px] focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all"></textarea>
          </div>
          <div className="flex justify-between items-center px-sm">
            <div className="flex gap-md">
              <button className="text-on-surface-variant font-bold text-xs flex items-center gap-xs cursor-pointer hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">image</span> Media</button>
              <button className="text-on-surface-variant font-bold text-xs flex items-center gap-xs cursor-pointer hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">work</span> Job Update</button>
            </div>
            <button className="bg-info-dark hover:bg-info text-white rounded-full px-lg py-xs font-bold text-xs transition-colors shadow-sm">Post</button>
          </div>
        </div>
        
        {/* Post 1: GenuAI Insight */}
        <div className="glass rounded-2xl border border-surface-container p-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="flex gap-md">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center overflow-hidden shrink-0 border border-info/20">
                <img src="/icons/learning_brain.png" alt="AI" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
              <div>
                <div className="font-black text-on-surface text-sm flex items-center">GenuAI Insights Engine <span className="text-[10px] bg-success/10 text-success-dark px-xs py-0.5 rounded-full ml-xs uppercase tracking-wider font-bold border border-success/20">Verified</span></div>
                <div className="text-xs font-medium text-on-surface-variant">System Analytics • 2h ago</div>
              </div>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface cursor-pointer font-black px-xs"><span className="material-symbols-outlined">more_horiz</span></button>
          </div>
          <p className="text-on-surface text-sm font-medium leading-relaxed mb-md">
            Based on our platform-wide data, candidates who complete at least 3 SVAR speaking simulations on the GenuAI platform increase their technical round pass rate by 42%. Have you tested your communication skills today?
          </p>
          <div className="bg-surface-bright/50 p-md rounded-xl border border-surface-container mb-md flex items-center gap-md">
             <div className="text-on-surface-variant"><span className="material-symbols-outlined text-[28px]">mic</span></div>
             <div>
               <div className="font-black text-on-surface text-xs">SVAR Communication Simulator</div>
               <div className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">GenuAI Practice Hub • 15 min module</div>
             </div>
          </div>
          <div className="flex gap-xl border-t border-surface-container pt-md">
             <button className="text-on-surface-variant font-bold text-xs cursor-pointer flex items-center gap-xs hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">thumb_up</span> 1,204 Likes</button>
             <button className="text-on-surface-variant font-bold text-xs cursor-pointer flex items-center gap-xs hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">chat_bubble</span> 89 Comments</button>
          </div>
        </div>

        {/* Post 2: User Post */}
        <div className="glass rounded-2xl border border-surface-container p-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-md">
            <div className="flex gap-md">
              <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white font-black text-title-sm shrink-0 shadow-sm">R</div>
              <div>
                <div className="font-black text-on-surface text-sm">Rahul S.</div>
                <div className="text-xs font-medium text-on-surface-variant">Frontend Developer at TechNova • 4h ago</div>
              </div>
            </div>
            <button className="text-info-dark font-bold text-xs cursor-pointer hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">add</span> Follow</button>
          </div>
          <p className="text-on-surface text-sm font-medium leading-relaxed mb-md">
            Thrilled to announce that I just cleared the GenuAI Automata Pro coding assessment with a perfect score! The realistic environment in the Practice Hub completely eliminated my interview anxiety. Next stop: The HR round! <span className="material-symbols-outlined text-[14px] align-middle ml-1">rocket_launch</span><span className="material-symbols-outlined text-[14px] align-middle">laptop_mac</span>
          </p>
          <div className="flex gap-xl border-t border-surface-container pt-md">
             <button className="text-on-surface-variant font-bold text-xs cursor-pointer flex items-center gap-xs hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">thumb_up</span> 342 Likes</button>
             <button className="text-on-surface-variant font-bold text-xs cursor-pointer flex items-center gap-xs hover:text-info-dark transition-colors"><span className="material-symbols-outlined text-[18px]">chat_bubble</span> 12 Comments</button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Connections & Trending */}
      <div className="mt-xl lg:mt-10 flex flex-col gap-xl">
        <div className="glass rounded-2xl border border-surface-container p-lg shadow-sm">
          <div className="font-black text-sm text-on-surface mb-md flex items-center justify-between">
            AI Match Connections
            <span className="text-[10px] bg-info/10 text-info-dark px-xs py-0.5 rounded-full font-bold uppercase tracking-wider border border-info/20">High Synergy</span>
          </div>
          <div className="flex flex-col gap-lg">
            {[
              { n: 'Sarah Jenkins', r: 'Senior Recruiter', m: 'Hiring React Devs' },
              { n: 'Amit Patel', r: 'Lead Engineer', m: 'Alumni Network' },
              { n: 'Elena Rodriguez', r: 'Product Manager', m: 'Similar Skills' }
            ].map((c, i) => (
              <div key={i} className={`flex flex-col gap-sm pb-lg ${i !== 2 ? 'border-b border-surface-container' : 'pb-0'}`}>
                <div className="flex gap-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner">{c.n[0]}</div>
                  <div>
                    <div className="font-bold text-on-surface text-xs">{c.n}</div>
                    <div className="text-[10px] font-medium text-on-surface-variant">{c.r}</div>
                    <div className="text-[10px] text-success-dark mt-0.5 font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">stars</span> Match: {c.m}</div>
                  </div>
                </div>
                <div className="flex gap-xs">
                  <button className="flex-1 border border-info-dark text-info-dark rounded-full py-1 text-[10px] font-bold cursor-pointer hover:bg-info/10 transition-colors">Connect</button>
                  <button title="Let AI draft your first message!" className="flex-1 border-none bg-gradient-to-br from-[#7C3AED] to-indigo-brand text-white rounded-full py-1 text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow"><span className="material-symbols-outlined text-[12px]">auto_fix_high</span> Icebreaker</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl border border-surface-container p-lg shadow-sm">
          <div className="font-black text-sm text-on-surface mb-md">GenuAI Trending</div>
          <div className="flex flex-col gap-md">
            {[
              { t: 'The rise of AI-driven technical interviews', p: '10.5k readers' },
              { t: 'Why GenuAI Automata is replacing traditional whiteboarding', p: '8.2k readers' },
              { t: 'Mastering the HR behavioral round with Voice AI', p: '5.1k readers' }
            ].map((n, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="font-bold text-on-surface-variant text-xs mb-0.5 group-hover:text-info-dark transition-colors flex items-start gap-1"><span className="text-info-dark mt-[2px]">•</span> <span>{n.t}</span></div>
                <div className="text-[10px] font-medium text-on-surface-variant/70 pl-3">{n.p}</div>
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
  { id:'network', imgSrc:'/icons/cat_english.png', title:'Professional Network', desc:'Connect with professionals, share updates, and build your profile.', color:'info-dark', bg:'info/10', tags:['GenuAI Hub','Connections'], ready:true, filter:'All' },
  { id:'jobs', imgSrc:'/icons/icon_globe.png', title:'Global Job Board', desc:'Search thousands of job listings across top platforms.', color:'indigo-brand', bg:'indigo-brand/10', tags:['Global Roles','Careers'], ready:true, filter:'All' },
  { id:'events', imgSrc:'/icons/icon_hackathon.png', title:'Competitions & Events', desc:'Participate in hackathons and university case studies.', color:'warning-dark', bg:'warning/10', tags:['Unstop Platform','Hackathons'], ready:false, filter:'All' },
  { id:'pm', imgSrc:'/icons/learning_brain.png', title:'PM Internship Allocation', desc:'AI-based matching scheme for Product Management internships.', color:'[#8B5CF6]', bg:'[#8B5CF6]/10', tags:['AI Matching','Product Management'], ready:false, filter:'All' },
  { id:'news', imgSrc:'/icons/cat_logical.png', title:'Tech & Company News', desc:'Stay updated with the latest in tech, business, and startups.', color:'success-dark', bg:'success/10', tags:['Tech News','Company Updates'], ready:true, filter:'News' },
  { id:'chat', imgSrc:'/icons/svar_mic.png', title:'Instant Connect', desc:'Real-time messenger to connect with recruiters and peers.', color:'[#25D366]', bg:'success/10', tags:['WhatsApp Style','Messaging'], ready:true, filter:'Chat' },
];

export default function SearchDashboard({ user, onBack }: Props) {
  const [active, setActive] = useState<string|null>(null);
  const [openTool, setOpenTool] = useState<typeof TOOLS[0] | null>(null);
  const [toast, setToast] = useState('');
  const name = user?.user?.name || user?.name || 'Candidate';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleOpen = (tool: typeof TOOLS[0]) => {
    if (tool.ready) setOpenTool(tool);
    else showToast(`${tool.title} — Coming Soon!`);
  };

  return (
    <div className="min-h-screen bg-background quantum-gradient relative overflow-hidden flex flex-col">
      {toast && (
        <div className="fixed top-xl left-1/2 -translate-x-1/2 bg-surface-container-highest text-white px-xl py-sm rounded-xl font-bold text-sm z-50 shadow-md animate-[slideDown_0.3s_ease]">
          {toast}
        </div>
      )}

      {/* Header */}
      <nav className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-sm">
          <img src="/logo.png" alt="GenuAI" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <div className="font-black text-sm text-on-surface">GenuAI Technologies</div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Search Hub</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={onBack} className="bg-surface-bright border border-surface-container rounded-lg px-md py-xs text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-surface-container-high transition-colors">
            ← Change Path
          </button>
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warning to-error flex items-center justify-center text-white font-black text-xs shadow-sm">
              {name[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-bold text-on-surface hidden sm:block">{name}</span>
          </div>
        </div>
      </nav>

      {openTool ? (
        openTool.id === 'network' ? (
          <NetworkView user={user} onBack={() => setOpenTool(null)} />
        ) : openTool.id === 'news' ? (
          <div className="max-w-[800px] mx-auto p-lg md:p-xl w-full">
            <button onClick={() => setOpenTool(null)} className="text-on-surface-variant font-bold text-sm mb-lg hover:text-on-surface flex items-center gap-xs transition-colors">← Back to Search Hub</button>
            <div className="bg-gradient-to-br from-success to-success-dark rounded-3xl p-xl text-white mb-xl flex justify-between items-center shadow-lg shadow-success/20">
              <div>
                <h1 className="text-headline-sm font-headline-sm mb-xs">Tech & Company News</h1>
                <p className="text-sm opacity-90 font-medium">The latest updates relevant to your career.</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30 shrink-0">
                <img src="/icons/cat_logical.png" alt="News" className="w-10 h-10 object-contain mix-blend-multiply" />
              </div>
            </div>
            <div className="flex flex-col gap-md">
              {[
                { tag: "AI Trends", title: "OpenAI Announces New Advanced Reasoning Models", src: "TechCrunch", time: "2 hours ago" },
                { tag: "Hiring", title: "Top 10 Tech Companies Actively Hiring Remote Product Managers", src: "Forbes", time: "5 hours ago" },
                { tag: "Startups", title: "GenuAI Technologies Secures Funding to Revolutionize AI Recruitment", src: "Tech Radar", time: "1 day ago" },
                { tag: "Development", title: "React 19 Release: What Frontend Engineers Need to Know", src: "Dev.to", time: "2 days ago" },
              ].map((news, i) => (
                <div key={i} className="glass rounded-2xl p-lg border border-surface-container flex flex-col gap-xs transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer">
                  <span className="text-[10px] font-black text-success uppercase tracking-wider bg-success/10 px-sm py-0.5 rounded-full self-start border border-success/20">{news.tag}</span>
                  <h4 className="text-title-md font-title-md text-on-surface">{news.title}</h4>
                  <div className="text-xs font-medium text-on-surface-variant">{news.src} • {news.time}</div>
                </div>
              ))}
            </div>
          </div>
        ) : openTool.id === 'chat' ? (
          <div className="max-w-[1000px] mx-auto p-lg md:p-xl h-[85vh] flex flex-col w-full">
            <button onClick={() => setOpenTool(null)} className="text-on-surface-variant font-bold text-sm mb-lg hover:text-on-surface flex items-center gap-xs transition-colors self-start">← Back to Search Hub</button>
            <div className="flex flex-1 glass rounded-3xl border border-surface-container overflow-hidden shadow-sm">
              <div className="w-72 bg-surface-bright/50 border-r border-surface-container flex flex-col">
                <div className="p-lg border-b border-surface-container font-black text-title-sm text-on-surface bg-surface-bright">Instant Connect</div>
                <div className="p-md bg-surface-container/30 flex items-center gap-md border-b border-surface-container cursor-pointer hover:bg-surface-container/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">HR</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold text-on-surface">GenuAI Recruiting</div>
                    <div className="text-xs font-medium text-on-surface-variant truncate">Are you available for an...</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col bg-background/50 relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="p-lg bg-surface-bright/80 backdrop-blur-md border-b border-surface-container flex items-center gap-md relative z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">HR</div>
                  <div>
                    <div className="font-black text-title-sm text-on-surface">GenuAI Recruiting</div>
                    <div className="text-xs font-bold text-[#25D366]">Online</div>
                  </div>
                </div>
                <div className="flex-1 p-xl overflow-y-auto flex flex-col gap-md relative z-10">
                  <div className="self-center bg-surface-container text-on-surface-variant px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Today</div>
                  <div className="self-start glass px-md py-sm rounded-2xl rounded-tl-sm max-w-[70%] shadow-sm border border-surface-container">
                    <div className="text-sm font-medium text-on-surface leading-relaxed">Hi {name}! We reviewed your impressive assessment score and would love to schedule a technical interview. Are you available sometime tomorrow?</div>
                    <div className="text-[10px] font-bold text-on-surface-variant mt-xs text-right">10:42 AM</div>
                  </div>
                </div>
                <div className="p-lg bg-surface-bright/80 backdrop-blur-md border-t border-surface-container flex gap-md items-center relative z-10">
                  <button className="text-xl opacity-60 hover:opacity-100 transition-opacity flex items-center"><span className="material-symbols-outlined">attach_file</span></button>
                  <input placeholder="Type your message..." className="flex-1 px-lg py-sm bg-surface-container/50 border border-surface-container rounded-full outline-none text-sm font-medium focus:border-indigo-brand/50 focus:bg-white transition-all" />
                  <button className="bg-[#25D366] hover:bg-[#1DA851] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors shrink-0">
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
        <div className="max-w-[1200px] mx-auto w-full p-lg md:p-xl flex-1 flex flex-col">
          {/* Background decorations */}
          <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-info/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-success/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center mb-xl relative z-10">
            <h1 className="text-headline-md font-headline-md text-on-surface mb-xs drop-shadow-sm">Global <span className="text-info-dark">Search Hub</span></h1>
            <p className="text-on-surface-variant font-medium text-body-lg">Explore jobs, connect with peers, and discover new opportunities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl relative z-10">
            {TOOLS.map(tool => {
              const isHover = active === tool.id;
              return (
                <div key={tool.id} onMouseEnter={() => setActive(tool.id)} onMouseLeave={() => setActive(null)}
                  className={`glass rounded-3xl p-xl flex flex-col relative transition-all duration-300 cursor-pointer border-2 ${isHover ? `border-${tool.color} shadow-[0_16px_40px_rgba(0,0,0,0.08)] scale-[1.02] bg-white` : 'border-surface-container hover:border-surface-container-high'}`}>
                  
                  {!tool.ready && (
                    <div className="absolute top-md right-md bg-warning/20 text-warning-dark text-[10px] font-black px-xs py-0.5 rounded-full uppercase tracking-widest border border-warning/30">
                      SOON
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl bg-${tool.bg} flex items-center justify-center mb-md overflow-hidden shrink-0`}>
                    <img src={tool.imgSrc} alt={tool.title} className="w-10 h-10 object-contain mix-blend-multiply drop-shadow-sm" />
                  </div>
                  
                  <h3 className="text-title-md font-title-md text-on-surface mb-xs">{tool.title}</h3>
                  <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-md flex-1">{tool.desc}</p>
                  
                  <div className="flex flex-wrap gap-xs mb-lg">
                    {tool.tags.map((t,i) => (
                      <span key={i} className={`bg-${tool.bg} text-${tool.color} text-xs font-bold px-sm py-1 rounded-full border border-${tool.color}/20`}>{t}</span>
                    ))}
                  </div>
                  
                  <button onClick={() => handleOpen(tool)} className={`w-full py-sm rounded-xl font-bold text-sm flex items-center justify-center gap-xs transition-all ${tool.ready ? (isHover ? `bg-${tool.color} text-white shadow-md` : `bg-transparent text-${tool.color} border border-${tool.color}`) : 'bg-surface-bright text-on-surface-variant border border-surface-container cursor-not-allowed'}`}>
                    {tool.ready ? (isHover ? <>Launch <span className="material-symbols-outlined text-[16px]">rocket_launch</span></> : 'Open Tool') : 'Coming Soon'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Search Hub Overview Banner */}
          <div className="glass rounded-3xl p-xl md:p-xxl border border-surface-container shadow-sm flex flex-col md:flex-row items-center gap-xl relative overflow-hidden z-10 mt-auto">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-info/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-success/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-md mb-md">
                <div className="w-14 h-14 bg-info/10 rounded-2xl flex items-center justify-center border border-info/20">
                   <img src="/icons/icon_globe.png" alt="Globe" className="w-8 h-8 object-contain mix-blend-multiply" />
                </div>
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface m-0 mb-1">Global Search Hub</h2>
                  <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Your AI-powered career launchpad</p>
                </div>
              </div>
              
              <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-lg max-w-3xl">
                Welcome to the GenuAI Search Hub. This powerful ecosystem utilizes our proprietary matching algorithms to connect you with top-tier opportunities. Whether you're networking with industry professionals, exploring our curated Global Job Board, or staying updated on the latest AI trends, your next career move starts here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md max-w-4xl">
                <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                  <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-info">ads_click</span> Precision Matching</div>
                  <div className="text-on-surface-variant text-xs font-medium">Our AI analyzes your skills and resume for the perfect fit.</div>
                </div>
                <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                  <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-indigo-brand">group</span> GenuAI Network</div>
                  <div className="text-on-surface-variant text-xs font-medium">Connect seamlessly with peers and tech recruiters.</div>
                </div>
                <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                  <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-success">trending_up</span> Career Insights</div>
                  <div className="text-on-surface-variant text-xs font-medium">Stay informed with tailored technology and company news.</div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-72 bg-surface-bright/90 backdrop-blur-md rounded-2xl border border-surface-container p-xl flex flex-col items-center justify-center relative z-10 shadow-sm shrink-0">
              <div className="text-on-surface-variant font-bold text-xs uppercase tracking-widest mb-md">Your Search Status</div>
              <div className="flex w-full justify-around">
                <div className="text-center">
                  <div className="text-4xl font-black text-info-dark drop-shadow-sm mb-1">3</div>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Active Apps</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-success drop-shadow-sm mb-1">12+</div>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
