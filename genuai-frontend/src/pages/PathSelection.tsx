
import { useState } from 'react';

interface Props { user: any; onSelect: (path: 'practice' | 'test') => void; }

export default function PathSelection({ user, onSelect }: Props) {
  const [hovered, setHovered] = useState<string|null>(null);
  const name = user?.user?.name || user?.name || 'Candidate';

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'900', fontSize:'16px' }}>G</div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A', letterSpacing:'-0.3px' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B', fontWeight:'500' }}>Assessment Platform</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{name[0]?.toUpperCase()}</div>
          <div style={{ fontSize:'14px', color:'#374151', fontWeight:'600' }}>{name}</div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:'960px', margin:'0 auto', padding:'72px 24px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:'56px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'20px', padding:'6px 16px', marginBottom:'24px' }}>
            <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#2563EB', display:'inline-block' }}/>
            <span style={{ color:'#2563EB', fontSize:'13px', fontWeight:'600' }}>Welcome, {name}</span>
          </div>
          <h1 style={{ fontSize:'40px', fontWeight:'900', color:'#0F172A', margin:'0 0 16px', letterSpacing:'-1px', lineHeight:'1.15' }}>Choose Your Path</h1>
          <p style={{ fontSize:'16px', color:'#64748B', maxWidth:'480px', margin:'0 auto', lineHeight:'1.7' }}>Select how you'd like to use the GenuAI platform today</p>
        </div>

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
          {/* Practice Path */}
          <div
            onMouseEnter={()=>setHovered('practice')}
            onMouseLeave={()=>setHovered(null)}
            onClick={()=>onSelect('practice')}
            style={{ background:hovered==='practice'?'linear-gradient(135deg,#2563EB,#7C3AED)':'#fff', border:hovered==='practice'?'2px solid transparent':'2px solid #E5E7EB', borderRadius:'24px', padding:'40px 36px', cursor:'pointer', transition:'all 0.25s ease', boxShadow:hovered==='practice'?'0 20px 60px rgba(37,99,235,0.25)':'0 2px 12px rgba(0,0,0,0.06)', transform:hovered==='practice'?'translateY(-4px)':'none' }}
          >
            <div style={{ width:'60px', height:'60px', borderRadius:'18px', background:hovered==='practice'?'rgba(255,255,255,0.2)':'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'24px' }}>📚</div>
            <h2 style={{ fontSize:'22px', fontWeight:'800', color:hovered==='practice'?'#fff':'#0F172A', margin:'0 0 12px', letterSpacing:'-0.4px' }}>Practice Path</h2>
            <p style={{ fontSize:'14px', color:hovered==='practice'?'rgba(255,255,255,0.8)':'#64748B', lineHeight:'1.7', margin:'0 0 28px' }}>Build skills at your own pace with AI-powered tools, mock interviews, practice tests, and resume builders.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {['🤖 AI Mock Interview','📝 Skill Practice','📄 Resume Builder','✉️ Cover Letter','🧠 Inclusive Learning','📊 Progress Tracker'].map((item,i)=>(
                <div key={i} style={{ background:hovered==='practice'?'rgba(255,255,255,0.15)':'#F8FAFC', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', fontWeight:'600', color:hovered==='practice'?'#fff':'#475569' }}>{item}</div>
              ))}
            </div>
            <div style={{ marginTop:'32px', display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ flex:1, height:'2px', background:hovered==='practice'?'rgba(255,255,255,0.3)':'#E5E7EB' }}/>
              <span style={{ fontSize:'13px', fontWeight:'700', color:hovered==='practice'?'#fff':'#2563EB' }}>Start Learning →</span>
            </div>
          </div>

          {/* Test Path */}
          <div
            onMouseEnter={()=>setHovered('test')}
            onMouseLeave={()=>setHovered(null)}
            onClick={()=>onSelect('test')}
            style={{ background:hovered==='test'?'linear-gradient(135deg,#059669,#0891B2)':'#fff', border:hovered==='test'?'2px solid transparent':'2px solid #E5E7EB', borderRadius:'24px', padding:'40px 36px', cursor:'pointer', transition:'all 0.25s ease', boxShadow:hovered==='test'?'0 20px 60px rgba(5,150,105,0.25)':'0 2px 12px rgba(0,0,0,0.06)', transform:hovered==='test'?'translateY(-4px)':'none' }}
          >
            <div style={{ width:'60px', height:'60px', borderRadius:'18px', background:hovered==='test'?'rgba(255,255,255,0.2)':'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'24px' }}>🎯</div>
            <h2 style={{ fontSize:'22px', fontWeight:'800', color:hovered==='test'?'#fff':'#0F172A', margin:'0 0 12px', letterSpacing:'-0.4px' }}>Assessment Test</h2>
            <p style={{ fontSize:'14px', color:hovered==='test'?'rgba(255,255,255,0.8)':'#64748B', lineHeight:'1.7', margin:'0 0 28px' }}>Take the official GenuAI recruitment assessment — timed, proctored, and fully evaluated by AI.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {['🔐 Verified Identity','📋 Profile & Resume','💡 AMCAT Skill Test','🎙️ SVAR Verbal','🏆 Hackathon','🤝 AI Interview'].map((item,i)=>(
                <div key={i} style={{ background:hovered==='test'?'rgba(255,255,255,0.15)':'#F8FAFC', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', fontWeight:'600', color:hovered==='test'?'#fff':'#475569' }}>{item}</div>
              ))}
            </div>
            <div style={{ marginTop:'32px', display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ flex:1, height:'2px', background:hovered==='test'?'rgba(255,255,255,0.3)':'#E5E7EB' }}/>
              <span style={{ fontSize:'13px', fontWeight:'700', color:hovered==='test'?'#fff':'#059669' }}>Begin Assessment →</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign:'center', color:'#94A3B8', fontSize:'13px', marginTop:'40px' }}>© 2025 GenuAI Technologies · AI-Powered Recruitment Platform</p>
      </div>
    </div>
  );
}
