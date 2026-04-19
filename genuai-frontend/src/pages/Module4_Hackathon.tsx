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
  const inp: any = { width:'100%', background:'#0D1117', border:'1px solid #30363D', borderRadius:'12px', padding:'12px 16px', color:'#E6EDF3', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'16px' };
  const lbl: any = { color:'#8B949E', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', marginBottom:'6px', display:'block' };
  const diffColor = (d:string) => d==='Hard'?'#EF4444':d==='Medium'?'#F59E0B':'#00B87C';
  const handleSubmit = async () => {
    if(!githubLink) { setError('GitHub link is required'); return; }
    setSubmitting(true); setError('');
    try { await axios.post(API+'/hackathon/submit', { user_id:user?.user?.id||user?.id, problem_id:selected.id, role, ppt_link:pptLink, github_link:githubLink, web_link:webLink, video_link:videoLink, description }); } catch {}
    setSubmitting(false); setPhase('done'); onComplete({ problem:selected, githubLink, webLink, videoLink, pptLink });
  };
  if(phase==='intro') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#00B87C,#00D4AA)', padding:'28px 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}><span style={{ fontSize:'36px' }}>🏆</span><div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Module 4: Hackathon Challenge</div><div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px' }}>Solve a real-world problem. Showcase your skills.</div></div></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i<=3?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ color:'#fff', fontSize:'16px', fontWeight:'700', marginBottom:'20px' }}>Choose Your Problem Statement</div>
          <div style={{ display:'grid', gap:'16px', marginBottom:'28px' }}>
            {problems.map((p,i)=>(
              <div key={i} onClick={()=>setSelected(p)} style={{ background:selected?.id===p.id?'#00B87C11':'#0D1117', borderRadius:'16px', padding:'24px', border:selected?.id===p.id?'2px solid #00B87C':'1px solid #30363D', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div style={{ color:'#fff', fontWeight:'700', fontSize:'16px' }}>{p.title}</div>
                  <div style={{ display:'flex', gap:'8px' }}><span style={{ background:diffColor(p.difficulty)+'22', color:diffColor(p.difficulty), padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{p.difficulty}</span><span style={{ background:'#667EEA22', color:'#667EEA', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>{p.points}pts</span></div>
                </div>
                <div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.7', marginBottom:'12px' }}>{p.description}</div>
                <div style={{ display:'flex', gap:'8px' }}>{p.tags.map((t:string,j:number)=><span key={j} style={{ background:'#30363D', color:'#C9D1D9', padding:'4px 10px', borderRadius:'8px', fontSize:'12px' }}>{t}</span>)}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#00B87C11', borderRadius:'12px', padding:'16px', marginBottom:'24px', border:'1px solid #00B87C33' }}><div style={{ color:'#00B87C', fontWeight:'700', fontSize:'13px', marginBottom:'8px' }}>Submission Requirements</div><div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.8' }}>Project Pitch PPT link required. GitHub repository link required. Live demo link optional. Demo video link optional.</div></div>
          <button onClick={()=>{ if(!selected){setError('Please select a problem');return;} setError(''); setPhase('submit'); }} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Accept Challenge</button>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginTop:'12px', textAlign:'center' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
  if(phase==='submit') return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'700px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#00B87C,#00D4AA)', padding:'28px 36px' }}><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Submit Your Solution</div><div style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px', marginTop:'4px' }}>{selected?.title}</div></div>
        <div style={{ padding:'36px' }}>
          <label style={lbl}>Project Pitch PPT Link</label><input style={inp} placeholder='https://docs.google.com/presentation/...' value={pptLink} onChange={e=>setPptLink(e.target.value)}/>
          <label style={lbl}>GitHub Repository Link (required)</label><input style={inp} placeholder='https://github.com/username/project' value={githubLink} onChange={e=>setGithubLink(e.target.value)}/>
          <label style={lbl}>Live Demo or Web Link</label><input style={inp} placeholder='https://yourproject.vercel.app' value={webLink} onChange={e=>setWebLink(e.target.value)}/>
          <label style={lbl}>Demo Video Link</label><input style={inp} placeholder='https://youtube.com/watch?v=...' value={videoLink} onChange={e=>setVideoLink(e.target.value)}/>
          <label style={lbl}>Project Description</label>
          <textarea style={{ ...inp, height:'100px', resize:'vertical' as any }} placeholder='Briefly describe your solution, architecture, and key features...' value={description} onChange={e=>setDescription(e.target.value)}/>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginBottom:'12px' }}>{error}</div>}
          <button onClick={handleSubmit} disabled={submitting} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#00B87C,#00D4AA)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:submitting?'not-allowed':'pointer' }}>{submitting?'Submitting...':'Submit Solution'}</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px' }}>
      <div style={{ maxWidth:'500px', width:'100%', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', padding:'48px', textAlign:'center' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <div style={{ color:'#fff', fontSize:'24px', fontWeight:'800', marginBottom:'8px' }}>Solution Submitted!</div>
        <div style={{ color:'#8B949E', fontSize:'14px', marginBottom:'32px' }}>Your project has been submitted for evaluation. Proceeding to the interview stage.</div>
        <div style={{ background:'#0D1117', borderRadius:'14px', padding:'20px', marginBottom:'28px', border:'1px solid #30363D', textAlign:'left' }}>
          <div style={{ color:'#00B87C', fontWeight:'700', marginBottom:'12px' }}>Submitted</div>
          {githubLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>GitHub: {githubLink}</div>}
          {webLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>Demo: {webLink}</div>}
          {videoLink && <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'6px' }}>Video: {videoLink}</div>}
        </div>
      </div>
    </div>
  );
}
