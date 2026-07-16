import { useState } from 'react';
import ResumeGenerator from './ResumeGenerator';
import CoverLetterGenerator from './CoverLetterGenerator';
import ATSChecker from './ATSChecker';
import PortfolioManager from './PortfolioManager';

interface Props { user: any; onBack: () => void; }

const TOOLS = [
  { id:'resume', imgSrc:'/icons/resume_gen.png', title:'AI Resume Builder', desc:'Build a professional ATS-optimized resume using AI. Tailored to your target role.', color:'#0891B2', bg:'#ECFEFF', tags:['ATS Optimized','PDF Export'], ready:true },
  { id:'cover', imgSrc:'/icons/cover_letter.png', title:'Cover Letter Generator', desc:'Generate compelling, personalized cover letters for any job posting instantly.', color:'#059669', bg:'#ECFDF5', tags:['Personalized','Instant'], ready:true },
  { id:'ats', imgSrc:'/icons/learning_brain.png', title:'ATS Scanner', desc:'Paste your existing resume and a job description to get a comprehensive compatibility report.', color:'#7C3AED', bg:'#F5F3FF', tags:['Resume Scoring','Keyword Match'], ready:true },
  { id:'portfolio', imgSrc:'/icons/cat_logical.png', title:'Portfolio Manager', desc:'Connect your GitHub and LeetCode to auto-generate a stunning developer portfolio.', color:'#F59E0B', bg:'#FFFBEB', tags:['GitHub Sync','Projects'], ready:true },
];

export default function CareerProfileDashboard({ user, onBack }: Props) {
  const [openTool, setOpenTool] = useState<string | null>(null);
  const name = user?.user?.name || user?.name || 'Candidate';

  if (openTool === 'resume') return <ResumeGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'cover') return <CoverLetterGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'ats') return <ATSChecker user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'portfolio') return <PortfolioManager user={user} onBack={() => setOpenTool(null)} />;

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <img src="/logo.png" alt="GenuAI" style={{ width:'44px', height:'44px', objectFit:'contain', filter:'drop-shadow(0 2px 6px rgba(212,175,55,0.4))' }} />
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B' }}>Career Profile Hub</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={onBack} style={{ background:'none', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', color:'#64748B', cursor:'pointer', fontWeight:'600' }}>← Change Path</button>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#0F172A,#334155)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{name[0]?.toUpperCase()}</div>
            <span style={{ fontSize:'14px', color:'#374151', fontWeight:'600' }}>{name}</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ background:'linear-gradient(135deg,#0F172A,#334155)', borderRadius:'24px', padding:'48px', color:'#fff', marginBottom:'40px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 20px 40px rgba(15,23,42,0.15)' }}>
          <div>
            <h1 style={{ fontSize:'36px', fontWeight:'900', margin:'0 0 12px', letterSpacing:'-1px' }}>Career Profile Hub</h1>
            <p style={{ fontSize:'16px', color:'#94A3B8', margin:0, maxWidth:'500px', lineHeight:'1.6' }}>Build and manage your professional identity. Use our AI-powered tools to create ATS-friendly resumes and tailored cover letters that stand out.</p>
          </div>
          <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter:'blur(10px)' }}>
             <img src="/icons/resume_gen.png" alt="Career" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'24px' }}>
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              onClick={() => tool.ready ? setOpenTool(tool.id) : null}
              style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', cursor: tool.ready ? 'pointer' : 'not-allowed', transition:'all 0.2s', boxShadow:'0 4px 12px rgba(0,0,0,0.02)', display:'flex', flexDirection:'column', opacity: tool.ready ? 1 : 0.6 }}
              onMouseEnter={(e) => {
                if (!tool.ready) return;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = tool.color;
              }}
              onMouseLeave={(e) => {
                if (!tool.ready) return;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'12px', background: tool.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={tool.imgSrc} alt={tool.title} style={{ width:'24px', height:'24px', objectFit:'contain' }} />
                </div>
                <div>
                  <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>{tool.title}</div>
                </div>
              </div>
              <p style={{ color:'#64748B', fontSize:'13px', lineHeight:'1.6', margin:'0 0 20px', flex:1 }}>{tool.desc}</p>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {tool.tags.map((tag, i) => (
                  <span key={i} style={{ background:'#F1F5F9', color:'#475569', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'700' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
