import { useState } from 'react';
import AIMockInterview from './AIMockInterview';
import ResumeGenerator from './ResumeGenerator';
import CoverLetterGenerator from './CoverLetterGenerator';
import SVARPractice from './SVARPractice';

interface Props { user: any; onBack: () => void; }

const TOOLS = [
  { id:'mock',     icon:'🤖', title:'AI Mock Interview',      desc:'Practice with an AI interviewer tailored to your role. Get instant feedback on answers, tone, and clarity.',    color:'#2563EB', bg:'#EFF6FF', tags:['HR Round','Technical','Behavioral'], ready:true },
  { id:'skills',   icon:'💡', title:'Skill Test Practice',    desc:'Attempt AMCAT-style coding, aptitude, English, and automata questions with detailed explanations.',              color:'#7C3AED', bg:'#F5F3FF', tags:['Coding','Aptitude','English','Automata'], ready:false },
  { id:'resume',   icon:'📄', title:'Resume Generator',       desc:'Build a professional ATS-optimized resume using AI. Tailored to your target role and skills.',                   color:'#0891B2', bg:'#ECFEFF', tags:['ATS Optimized','PDF Export','Role Tailored'], ready:true },
  { id:'cover',    icon:'✉️', title:'Cover Letter Generator', desc:'Generate compelling, personalized cover letters for any job posting in under 30 seconds.',                       color:'#059669', bg:'#ECFDF5', tags:['Personalized','Job-specific','Instant'], ready:true },
  { id:'svar',     icon:'🎙️', title:'SVAR Speaking Practice', desc:'Improve your verbal communication, fluency, and listening comprehension with scored exercises.',                  color:'#DC2626', bg:'#FEF2F2', tags:['Speaking','Listening','Fluency'], ready:true },
  { id:'learning', icon:'🧠', title:'Inclusive Learning Hub', desc:'Access curated courses, video tutorials, DSA sheets, coding challenges, and interview prep guides.',             color:'#D97706', bg:'#FFFBEB', tags:['DSA','System Design','Interview Prep','Video'], ready:false },
];

export default function PracticeDashboard({ user, onBack }: Props) {
  const [active, setActive]   = useState<string|null>(null);
  const [openTool, setOpenTool] = useState<string|null>(null);
  const [toast, setToast]     = useState('');
  const name = user?.user?.name || user?.name || 'Candidate';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleOpen = (tool: typeof TOOLS[0]) => {
    if (tool.ready) setOpenTool(tool.id);
    else showToast(`${tool.title} — Coming Soon! 🚧`);
  };

  // ── Route to tool ──
  if (openTool === 'mock') return <AIMockInterview user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'resume') return <ResumeGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'cover') return <CoverLetterGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'svar') return <SVARPractice user={user} onBack={() => setOpenTool(null)} />;

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

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'48px 24px' }}>
        <div style={{ marginBottom:'40px' }}>
          <h1 style={{ fontSize:'32px', fontWeight:'900', color:'#0F172A', margin:'0 0 8px', letterSpacing:'-0.6px' }}>Practice Hub</h1>
          <p style={{ color:'#64748B', fontSize:'15px', margin:0 }}>Sharpen every skill before your official assessment</p>
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

        <div style={{ marginTop:'32px', background:'#fff', borderRadius:'16px', border:'1px solid #E5E7EB', padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'16px' }}>Your Learning Progress</div>
            <div style={{ color:'#64748B', fontSize:'13px', marginTop:'4px' }}>Complete practice modules to boost your assessment readiness score</div>
          </div>
          <div style={{ display:'flex', gap:'24px' }}>
            {[{label:'Available',val:'1/6',color:'#2563EB'},{label:'Readiness',val:'AI Ready',color:'#059669'}].map((s,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'22px', fontWeight:'900', color:s.color }}>{s.val}</div>
                <div style={{ fontSize:'12px', color:'#94A3B8', fontWeight:'600' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

