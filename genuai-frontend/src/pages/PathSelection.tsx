
import { useState } from 'react';

interface Props { user: any; onSelect: (path: 'practice' | 'search' | 'test' | 'career-profile') => void; onLogout: () => void; }

export default function PathSelection({ user, onSelect, onLogout }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const name = user?.user?.name || user?.name || 'Candidate';

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: '44px', height: '44px', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.4))' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#0F172A', letterSpacing: '-0.3px' }}>GenuAI Technologies</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>AI-Powered Recruitment Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' }}>{name[0]?.toUpperCase()}</div>
          <div style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>{name}</div>
          <button onClick={onLogout} style={{ padding: '7px 16px', background: 'transparent', border: '1.5px solid #EF4444', color: '#EF4444', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '72px 24px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '20px', padding: '6px 16px', marginBottom: '24px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
            <span style={{ color: '#2563EB', fontSize: '13px', fontWeight: '600' }}>Welcome, {name}</span>
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#0F172A', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.15' }}>Choose Your Path</h1>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>Select how you'd like to use the GenuAI platform today</p>
        </div>

        {/* Cards — 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* 1. Practice Path */}
          <div
            onMouseEnter={() => setHovered('practice')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('practice')}
            style={{ background: hovered === 'practice' ? 'linear-gradient(135deg,#2563EB,#7C3AED)' : '#fff', border: hovered === 'practice' ? '2px solid transparent' : '2px solid #E5E7EB', borderRadius: '24px', padding: '32px 28px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: hovered === 'practice' ? '0 20px 60px rgba(37,99,235,0.25)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hovered === 'practice' ? 'translateY(-4px)' : 'none' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: hovered === 'practice' ? 'rgba(255,255,255,0.2)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
              <img src="/icons/cat_english.png" alt="Practice" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode: hovered === 'practice' ? 'normal' : 'multiply', opacity: hovered === 'practice' ? 0.9 : 1 }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: hovered === 'practice' ? '#fff' : '#0F172A', margin: '0 0 10px', letterSpacing: '-0.4px' }}>Practice Path</h2>
            <p style={{ fontSize: '13px', color: hovered === 'practice' ? 'rgba(255,255,255,0.8)' : '#64748B', lineHeight: '1.7', margin: '0 0 20px' }}>Build skills at your own pace with AI-powered tools, mock interviews, and resume builders.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {text: 'AI Mock Interview', icon: '/icons/ai_mock_interview.png'},
                {text: 'Skill Practice', icon: '/icons/skill_test.png'},
                {text: 'Resume Builder', icon: '/icons/resume_gen.png'},
                {text: 'Cover Letter', icon: '/icons/cover_letter.png'},
                {text: 'Inclusive Learning', icon: '/icons/learning_brain.png'},
                {text: 'Progress Tracker', icon: '/icons/cat_logical.png'}
              ].map((item, i) => (
                <div key={i} style={{ background: hovered === 'practice' ? 'rgba(255,255,255,0.15)' : '#F8FAFC', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', color: hovered === 'practice' ? '#fff' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={item.icon} alt="" style={{width:"14px", height:"14px", borderRadius:"2px"}} />{item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '2px', background: hovered === 'practice' ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: hovered === 'practice' ? '#fff' : '#2563EB' }}>Start Learning →</span>
            </div>
          </div>

          {/* 2. Search Path (middle) */}
          <div
            onMouseEnter={() => setHovered('search')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('search')}
            style={{ background: hovered === 'search' ? 'linear-gradient(135deg,#F59E0B,#EF4444)' : '#fff', border: hovered === 'search' ? '2px solid transparent' : '2px solid #E5E7EB', borderRadius: '24px', padding: '32px 28px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: hovered === 'search' ? '0 20px 60px rgba(245,158,11,0.3)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hovered === 'search' ? 'translateY(-4px)' : 'none' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: hovered === 'search' ? 'rgba(255,255,255,0.2)' : '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
              <img src="/icons/icon_globe.png" alt="Search" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode: hovered === 'search' ? 'normal' : 'multiply', opacity: hovered === 'search' ? 0.9 : 1 }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: hovered === 'search' ? '#fff' : '#0F172A', margin: '0 0 10px', letterSpacing: '-0.4px' }}>Search Hub</h2>
            <p style={{ fontSize: '13px', color: hovered === 'search' ? 'rgba(255,255,255,0.8)' : '#64748B', lineHeight: '1.7', margin: '0 0 20px' }}>Explore jobs, connect with professionals, participate in hackathons, and stay updated with the latest news.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {text: 'Professional Network', icon: '/icons/cat_english.png'},
                {text: 'Global Job Board', icon: '/icons/icon_globe.png'},
                {text: 'Competitions & Events', icon: '/icons/icon_hackathon.png'},
                {text: 'PM Internships', icon: '/icons/learning_brain.png'},
                {text: 'Tech & Company News', icon: '/icons/cat_logical.png'},
                {text: 'Instant Connect', icon: '/icons/svar_mic.png'}
              ].map((item, i) => (
                <div key={i} style={{ background: hovered === 'search' ? 'rgba(255,255,255,0.15)' : '#FFF7ED', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', color: hovered === 'search' ? '#fff' : '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={item.icon} alt="" style={{width:"14px", height:"14px", borderRadius:"2px"}} />{item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '2px', background: hovered === 'search' ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: hovered === 'search' ? '#fff' : '#F59E0B' }}>Enter Search Hub →</span>
            </div>
          </div>

          {/* 3. Assessment Test */}
          <div
            onMouseEnter={() => setHovered('test')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('test')}
            style={{ background: hovered === 'test' ? 'linear-gradient(135deg,#059669,#0891B2)' : '#fff', border: hovered === 'test' ? '2px solid transparent' : '2px solid #E5E7EB', borderRadius: '24px', padding: '32px 28px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: hovered === 'test' ? '0 20px 60px rgba(5,150,105,0.25)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hovered === 'test' ? 'translateY(-4px)' : 'none' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: hovered === 'test' ? 'rgba(255,255,255,0.2)' : '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
              <img src="/icons/icon_stopwatch.png" alt="Test" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode: hovered === 'test' ? 'normal' : 'multiply', opacity: hovered === 'test' ? 0.9 : 1 }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: hovered === 'test' ? '#fff' : '#0F172A', margin: '0 0 10px', letterSpacing: '-0.4px' }}>Assessment Test</h2>
            <p style={{ fontSize: '13px', color: hovered === 'test' ? 'rgba(255,255,255,0.8)' : '#64748B', lineHeight: '1.7', margin: '0 0 20px' }}>Take the official GenuAI recruitment assessment — timed, proctored, and fully evaluated by AI.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {text: 'Verified Identity', icon: '/icons/icon_globe.png'},
                {text: 'Profile & Resume', icon: '/icons/resume_gen.png'},
                {text: 'GenuAI Skill Test', icon: '/icons/skill_test.png'},
                {text: 'SVAR Verbal', icon: '/icons/svar_mic.png'},
                {text: 'Hackathon', icon: '/icons/icon_hackathon.png'},
                {text: 'AI Interview', icon: '/icons/ai_mock_interview.png'}
              ].map((item, i) => (
                <div key={i} style={{ background: hovered === 'test' ? 'rgba(255,255,255,0.15)' : '#F8FAFC', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', color: hovered === 'test' ? '#fff' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={item.icon} alt="" style={{width:"14px", height:"14px", borderRadius:"2px"}} />{item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '2px', background: hovered === 'test' ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: hovered === 'test' ? '#fff' : '#059669' }}>Begin Assessment →</span>
            </div>
          </div>

          {/* 4. Career Profile Hub */}
          <div
            onMouseEnter={() => setHovered('career')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('career-profile')}
            style={{ background: hovered === 'career' ? 'linear-gradient(135deg,#0F172A,#334155)' : '#fff', border: hovered === 'career' ? '2px solid transparent' : '2px solid #E5E7EB', borderRadius: '24px', padding: '32px 28px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: hovered === 'career' ? '0 20px 60px rgba(15,23,42,0.25)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hovered === 'career' ? 'translateY(-4px)' : 'none' }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: hovered === 'career' ? 'rgba(255,255,255,0.2)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', overflow: 'hidden' }}>
              <img src="/icons/resume_gen.png" alt="Career" style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode: hovered === 'career' ? 'normal' : 'multiply', opacity: hovered === 'career' ? 0.9 : 1 }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: hovered === 'career' ? '#fff' : '#0F172A', margin: '0 0 10px', letterSpacing: '-0.4px' }}>Career Profile Hub</h2>
            <p style={{ fontSize: '13px', color: hovered === 'career' ? 'rgba(255,255,255,0.8)' : '#64748B', lineHeight: '1.7', margin: '0 0 20px' }}>Build and manage your professional identity with AI-optimized resumes and cover letters.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {text: 'AI Resume Builder', icon: '/icons/resume_gen.png'},
                {text: 'Cover Letter Generator', icon: '/icons/cover_letter.png'},
                {text: 'Portfolio Manager', icon: '/icons/cat_logical.png'},
                {text: 'ATS Optimization', icon: '/icons/learning_brain.png'}
              ].map((item, i) => (
                <div key={i} style={{ background: hovered === 'career' ? 'rgba(255,255,255,0.15)' : '#F8FAFC', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: '600', color: hovered === 'career' ? '#fff' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={item.icon} alt="" style={{width:"14px", height:"14px", borderRadius:"2px"}} />{item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '2px', background: hovered === 'career' ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: hovered === 'career' ? '#fff' : '#475569' }}>Manage Profile →</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', marginTop: '40px' }}>© 2025 GenuAI Technologies · AI-Powered Recruitment Intelligence Platform</p>
      </div>
    </div>
  );
}
