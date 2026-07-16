import { useState } from 'react';
import AIMockInterview from './AIMockInterview';
import ProjectBuildingPractice from './ProjectBuildingPractice';
import GroupDiscussionPractice from './GroupDiscussionPractice';
import SVARPractice from './SVARPractice';
import InclusiveLearningHub from './InclusiveLearningHub';
import SkillTestPractice from './SkillTestPractice';

interface Props { user: any; onBack: () => void; }

const TOOLS = [
  { id:'mock',     imgSrc:'/icons/ai_mock_interview.png', title:'AI Mock Interview',      desc:'Practice with an AI interviewer tailored to your role. Get instant feedback on answers, tone, and clarity.',    color:'#2563EB', bg:'#EFF6FF', tags:['HR Round','Technical','Behavioral'], ready:true },
  { id:'skills',   imgSrc:'/icons/skill_test.png', title:'Skill Test Practice',    desc:'Attempt GenuAI-style coding, aptitude, English, and automata questions with detailed explanations.',              color:'#7C3AED', bg:'#F5F3FF', tags:['Coding','Aptitude','English','Automata'], ready:true },
  { id:'projects', imgSrc:'/icons/cat_logical.png', title:'Project Building Practice', desc:'Practice building full-stack projects with AI-guided requirements and automated code reviews.', color:'#0891B2', bg:'#ECFEFF', tags:['Full Stack','Code Review'], ready:true },
  { id:'group_discussion', imgSrc:'/icons/cat_automata.png', title:'Group Discussion', desc:'Simulate multiplayer group discussions with AI participants to test leadership and debate skills.', color:'#059669', bg:'#ECFDF5', tags:['Leadership','Communication'], ready:true },
  { id:'svar',     imgSrc:'/icons/svar_mic.png', title:'SVAR Speaking Practice', desc:'Improve your verbal communication, fluency, and listening comprehension with scored exercises.',                  color:'#DC2626', bg:'#FEF2F2', tags:['Speaking','Listening','Fluency'], ready:true },
  { id:'learning', imgSrc:'/icons/learning_brain.png', title:'Inclusive Learning Hub', desc:'Access curated courses, video tutorials, DSA sheets, coding challenges, and interview prep guides.',             color:'#D97706', bg:'#FFFBEB', tags:['DSA','System Design','Interview Prep','Video'], ready:true },
];

export default function PracticeDashboard({ user, onBack }: Props) {
  const [active, setActive]   = useState<string|null>(null);
  const [openTool, setOpenTool] = useState<string|null>(null);
  const [toast, setToast]     = useState('');
  const name = user?.user?.name || user?.name || 'Candidate';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleOpen = (tool: typeof TOOLS[0]) => {
    if (tool.ready) setOpenTool(tool.id);
    else showToast(`${tool.title} — Coming Soon! ðŸš§`);
  };

  // ── Route to tool ──
  if (openTool === 'mock') return <AIMockInterview user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'skills') return <SkillTestPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'projects') return <ProjectBuildingPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'group_discussion') return <GroupDiscussionPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'svar') return <SVARPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'learning') return <InclusiveLearningHub user={user} onBack={() => setOpenTool(null)} />;

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background:'#1E293B', color:'#fff', padding:'12px 24px', borderRadius:'12px', fontSize:'14px', fontWeight:'600', zIndex:9999, boxShadow:'0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <img src="/logo.png" alt="GenuAI" style={{ width:'44px', height:'44px', objectFit:'contain', filter:'drop-shadow(0 2px 6px rgba(212,175,55,0.4))' }} />
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B' }}>Practice Hub</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={onBack} style={{ background:'none', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', color:'#64748B', cursor:'pointer', fontWeight:'600' }}>← Change Path</button>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize:'14px', color:'#374151', fontWeight:'600' }}>{name}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 24px' }}>
        


        {/* Modules Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }}>
          {TOOLS.map(tool => {
            const isHover = active === tool.id;
            return (
              <div key={tool.id} onMouseEnter={() => setActive(tool.id)} onMouseLeave={() => setActive(null)}
                style={{ background:'#fff', borderRadius:'24px', border: isHover ? '2px solid ' + tool.color : '2px solid #E5E7EB', padding:'32px', cursor:'pointer', transition:'all 0.2s ease', boxShadow: isHover ? '0 16px 40px ' + tool.color + '33' : '0 4px 12px rgba(0,0,0,0.03)', transform: isHover ? 'translateY(-4px)' : 'none', position:'relative', display:"flex", flexDirection:"column" }}>
                {!tool.ready && <div style={{ position:'absolute', top:'16px', right:'16px', background:'#FEF3C7', color:'#92400E', fontSize:'11px', fontWeight:'900', padding:'4px 10px', borderRadius:'20px', letterSpacing:"0.5px" }}>SOON</div>}
                
                <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:tool.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px', overflow:'hidden' }}>
                  <img src={tool.imgSrc} alt={tool.title} style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply" }} />
                </div>
                
                <h3 style={{ fontSize:'18px', fontWeight:'900', color:'#0F172A', margin:'0 0 12px' }}>{tool.title}</h3>
                <p style={{ fontSize:'14px', color:'#475569', lineHeight:'1.6', margin:'0 0 24px', flex:1 }}>{tool.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'24px' }}>
                  {tool.tags.map((t,i) => <span key={i} style={{ background:tool.bg, color:tool.color, fontSize:'12px', fontWeight:'700', padding:'4px 12px', borderRadius:'20px' }}>{t}</span>)}
                </div>
                <button onClick={() => handleOpen(tool)} style={{ width:'100%', padding:'14px', background: isHover ? tool.color : '#F8FAFC', border:'none', borderRadius:'14px', color: isHover ? '#fff' : '#0F172A', fontWeight:'800', fontSize:'14px', cursor:'pointer', transition:'all 0.2s' }}>
                  {tool.ready ? (isHover ? 'Launch Module →' : 'Open Module') : 'Coming Soon'}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Banner (Overview) */}
        <div style={{ background:"#fff", borderRadius:"24px", padding:"48px", border:"1px solid #E2E8F0", boxShadow:"0 10px 25px rgba(0,0,0,0.03)", marginTop:"48px", display:"flex", alignItems:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-50px", right:"-50px", width:"300px", height:"300px", background:"radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(255,255,255,0) 70%)" }}></div>
          <div style={{ position:"absolute", bottom:"-50px", left:"-50px", width:"200px", height:"200px", background:"radial-gradient(circle, rgba(124,58,237,0.06) 0%, rgba(255,255,255,0) 70%)" }}></div>
          
          <div style={{ flex:1, paddingRight:"40px", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>
              <div style={{ width: '56px', height: '56px', overflow: 'hidden', borderRadius: '12px' }}>
                 <img src="/icons/learning_brain.png" alt="Brain" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply" }} />
              </div>
              <div>
                <h1 style={{ fontSize:"36px", fontWeight:"900", color:"#0F172A", margin:"0 0 4px", letterSpacing:"-1px" }}>Candidate Practice Hub</h1>
                <p style={{ color:"#64748B", fontSize:"16px", margin:0, fontWeight:"600" }}>The ultimate AI-powered preparation environment</p>
              </div>
            </div>
            
            <p style={{ color:"#475569", fontSize:"16px", lineHeight:"1.7", maxWidth:"700px", marginBottom:"32px" }}>
              Welcome to your personal training ground. This multimodal hub leverages advanced Natural Language Processing (NLP) to help you master every stage of the hiring process. From generating ATS-optimized resumes to simulating high-pressure live coding tests and conducting voice-to-voice mock interviews, everything you need is right here.
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"16px", maxWidth:"800px" }}>
              <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}><img src="/icons/svar_mic.png" alt="Mic" style={{ width:"20px", height:"20px", objectFit:"cover", mixBlendMode:"multiply" }} /> Voice-First Tech</div>
                <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Practice communication with STT and TTS feedback.</div>
              </div>
              <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}><img src="/icons/icon_globe.png" alt="Globe" style={{ width:"20px", height:"20px", objectFit:"cover", mixBlendMode:"multiply" }} /> Native Learning</div>
                <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Lower cognitive load by learning in your native language.</div>
              </div>
              <div style={{ background:"#F8FAFC", padding:"16px", borderRadius:"12px", border:"1px dashed #CBD5E1" }}>
                <div style={{ color:"#334155", fontWeight:"800", fontSize:"14px", marginBottom:"4px", display: "flex", alignItems: "center", gap: "6px" }}><img src="/icons/icon_stopwatch.png" alt="Timer" style={{ width:"20px", height:"20px", objectFit:"cover", mixBlendMode:"multiply" }} /> Stress Simulation</div>
                <div style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>Replicate real proctored tests to build true confidence.</div>
              </div>
            </div>
          </div>
          
          <div style={{ width:"280px", background:'#F8FAFC', borderRadius:'16px', border:'1px solid #E5E7EB', padding:'24px', display:'flex', flexDirection:"column", alignItems:'center', justifyContent:'center', zIndex:1, boxShadow:"0 4px 12px rgba(0,0,0,0.02)" }}>
            <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'16px', marginBottom:"20px", textAlign:"center" }}>Your Learning Progress</div>
            <div style={{ display:'flex', width:"100%", justifyContent:"space-around" }}>
              {[{label:'Modules',val:'6/6',color:'#2563EB'},{label:'Readiness',val:'AI Ready',color:'#059669'}].map((s,i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'24px', fontWeight:'900', color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:'12px', color:'#94A3B8', fontWeight:'700', textTransform:"uppercase", marginTop:"4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

