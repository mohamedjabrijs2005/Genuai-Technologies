import { useState } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; role: string; onComplete: (data: any) => void; }
const PROBLEMS: Record<string,any[]> = {
  'Software Engineer':[{id:1,title:'Real-Time Collaboration Tool',difficulty:'Hard',description:'Build a real-time collaborative code editor with conflict resolution, user cursors, and session management. Support at least 5 concurrent users with sub-100ms sync latency.',tags:['WebSockets','React','Node.js'],points:100},{id:2,title:'Microservices API Gateway',difficulty:'Medium',description:'Design and implement an API gateway that handles authentication, rate limiting, load balancing, and request routing for a microservices architecture.',tags:['Docker','REST','Redis'],points:80}],
  'AI Engineer':[{id:1,title:'AI Resume Screener',difficulty:'Hard',description:'Build an AI-powered resume screening system that ranks candidates based on job descriptions using NLP and ML techniques.',tags:['Python','NLP','ML'],points:100},{id:2,title:'Chatbot with RAG',difficulty:'Medium',description:'Build a retrieval-augmented generation chatbot that answers questions from a custom knowledge base with source citations.',tags:['LangChain','Vector DB','LLM'],points:80}],
  'default':[{id:1,title:'Smart Task Manager',difficulty:'Medium',description:'Build a full-stack task management application with AI-powered priority suggestions, team collaboration features, and real-time notifications.',tags:['React','Node.js','AI'],points:80},{id:2,title:'Data Dashboard',difficulty:'Easy',description:'Create an interactive data visualization dashboard that ingests CSV data and generates dynamic charts and exportable reports.',tags:['React','D3.js','REST'],points:60}],
};
export default function Module4_Hackathon({ user, role, onComplete }: Props) {
  const problems = PROBLEMS[role] || PROBLEMS['default'];
  const [phase, setPhase] = useState<'intro'|'submit'|'done'>('intro');
  const [selected, setSelected] = useState<any>(null);
  const [pptLink, setPptLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [webLink, setWebLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inp = "w-full bg-surface-bright border border-surface-container rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all mb-md";
  const lbl = "text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 block";
  const diffColor = (d:string) => d==='Hard'?'text-error bg-error/10 border-error/20':d==='Medium'?'text-warning-dark bg-warning/10 border-warning/20':'text-success-dark bg-success/10 border-success/20';
  
  const handleSubmit = async () => {
    if(!githubLink) { setError('GitHub link is required'); return; }
    setSubmitting(true); setError('');
    try { await axios.post(API+'/hackathon/submit', { user_id:user?.user?.id||user?.id, problem_id:selected.id, role, ppt_link:pptLink, github_link:githubLink, web_link:webLink, video_link:videoLink, description }); } catch {}
    setSubmitting(false); setPhase('done'); onComplete({ problem:selected, githubLink, webLink, videoLink, pptLink });
  };

  if(phase==='intro') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-4xl w-full mx-auto rounded-xxxl overflow-hidden shadow-sm border border-surface-container animate-[slideUp_0.4s_ease]">
        <div className="bg-gradient-to-r from-success to-success-dark p-xl">
          <div className="flex items-center gap-md">
            <span className="text-4xl drop-shadow-md">🏆</span>
            <div>
              <div className="text-white text-xl font-black drop-shadow-sm">Module 4: Hackathon Challenge</div>
              <div className="text-white/80 text-sm font-semibold mt-1">Solve a real-world problem. Showcase your skills.</div>
            </div>
          </div>
          <div className="flex gap-xs mt-lg">{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} className={`flex-1 h-1.5 rounded-full ${i<=3?'bg-white':'bg-white/20'}`}/>)}</div>
        </div>
        <div className="p-xl md:p-xxl bg-white/50 backdrop-blur-sm">
          <div className="text-on-surface text-lg font-black mb-lg">Choose Your Problem Statement</div>
          <div className="grid gap-md mb-xl">
            {problems.map((p,i)=>(
              <div key={i} onClick={()=>setSelected(p)} className={`rounded-2xl p-xl border-2 transition-all cursor-pointer hover:scale-[1.01] ${selected?.id===p.id?'bg-success/5 border-success shadow-sm':'bg-surface-bright border-surface-container hover:border-surface-container-high'}`}>
                <div className="flex justify-between items-start mb-md">
                  <div className="text-on-surface font-bold text-lg">{p.title}</div>
                  <div className="flex gap-xs">
                    <span className={`border px-sm py-1 rounded-full text-xs font-bold ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
                    <span className="bg-indigo-brand/10 border border-indigo-brand/20 text-indigo-brand px-sm py-1 rounded-full text-xs font-bold">{p.points}pts</span>
                  </div>
                </div>
                <div className="text-on-surface-variant text-sm font-medium leading-relaxed mb-md">{p.description}</div>
                <div className="flex flex-wrap gap-xs">
                  {p.tags.map((t:string,j:number)=><span key={j} className="bg-surface-container/50 text-on-surface-variant border border-surface-container px-3 py-1 rounded-lg text-xs font-bold">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-success/5 rounded-2xl p-md mb-xl border border-success/20 flex gap-md items-start">
            <span className="material-symbols-outlined text-success mt-1">info</span>
            <div>
              <div className="text-success-dark font-black text-sm mb-1 uppercase tracking-wide">Submission Requirements</div>
              <div className="text-on-surface-variant text-sm font-medium leading-relaxed">
                Project Pitch PPT link required. GitHub repository link required. Live demo link optional. Demo video link optional.
              </div>
            </div>
          </div>
          <button onClick={()=>{ if(!selected){setError('Please select a problem');return;} setError(''); setPhase('submit'); }} className="w-full py-md bg-gradient-to-r from-success to-success-dark text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(0,184,124,0.4)] hover:scale-[1.01] transition-all">Accept Challenge →</button>
          {error && <div className="text-error bg-error/10 border border-error/30 rounded-xl p-sm text-sm font-bold mt-md text-center animate-[shake_0.5s_ease-in-out]">{error}</div>}
        </div>
      </div>
    </div>
  );

  if(phase==='submit') return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-3xl w-full mx-auto rounded-xxxl overflow-hidden shadow-sm border border-surface-container animate-[slideUp_0.4s_ease]">
        <div className="bg-gradient-to-r from-success to-success-dark p-xl">
          <div className="text-white text-xl font-black drop-shadow-sm">Submit Your Solution</div>
          <div className="text-white/80 text-sm font-semibold mt-1">{selected?.title}</div>
        </div>
        <div className="p-xl md:p-xxl bg-white/50 backdrop-blur-sm">
          <label className={lbl}>Project Pitch PPT Link</label>
          <input className={inp} placeholder='https://docs.google.com/presentation/...' value={pptLink} onChange={e=>setPptLink(e.target.value)}/>
          
          <label className={lbl}>GitHub Repository Link <span className="text-error">*</span></label>
          <input className={inp} placeholder='https://github.com/username/project' value={githubLink} onChange={e=>setGithubLink(e.target.value)}/>
          
          <label className={lbl}>Live Demo or Web Link</label>
          <input className={inp} placeholder='https://yourproject.vercel.app' value={webLink} onChange={e=>setWebLink(e.target.value)}/>
          
          <label className={lbl}>Demo Video Link</label>
          <input className={inp} placeholder='https://youtube.com/watch?v=...' value={videoLink} onChange={e=>setVideoLink(e.target.value)}/>
          
          <label className={lbl}>Project Description</label>
          <textarea className={`${inp} h-32 resize-y`} placeholder='Briefly describe your solution, architecture, and key features...' value={description} onChange={e=>setDescription(e.target.value)}/>
          
          {error && <div className="text-error bg-error/10 border border-error/30 rounded-xl p-sm text-sm font-bold mb-md text-center">{error}</div>}
          
          <button onClick={handleSubmit} disabled={submitting} className={`w-full py-md text-white rounded-xl font-bold text-body-base transition-all ${submitting ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-success to-success-dark hover:shadow-[0_4px_15px_rgba(0,184,124,0.4)] hover:scale-[1.01]'}`}>
            {submitting ? 'Submitting...' : 'Submit Solution ✓'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="glass max-w-xl w-full mx-auto rounded-xxxl p-xl md:p-xxl border border-surface-container shadow-sm text-center animate-[slideUp_0.4s_ease] relative z-10">
        <div className="text-6xl mb-md drop-shadow-sm">🎉</div>
        <div className="text-headline-sm font-headline-sm text-on-surface m-0 mb-xs">Solution Submitted!</div>
        <div className="text-on-surface-variant font-medium mb-xl">Your project has been submitted for evaluation. Proceeding to the interview stage.</div>
        
        <div className="bg-surface-bright rounded-2xl p-lg border border-surface-container text-left mb-xl">
          <div className="text-success-dark font-black text-xs uppercase tracking-wide mb-md flex items-center gap-xs"><span className="material-symbols-outlined text-sm">check_circle</span> Submitted Details</div>
          
          <div className="space-y-sm">
            {githubLink && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">GitHub</span>
                <span className="text-indigo-brand font-medium text-sm break-all">{githubLink}</span>
              </div>
            )}
            {webLink && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Demo</span>
                <span className="text-indigo-brand font-medium text-sm break-all">{webLink}</span>
              </div>
            )}
            {videoLink && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Video</span>
                <span className="text-indigo-brand font-medium text-sm break-all">{videoLink}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
