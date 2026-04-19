
interface Props { user: any; onStartTest: () => void; }

const MODULES = [
  { icon:'📋', title:'Profile & Resume', desc:'AI resume analysis, ATS scoring, skill extraction', color:'#2563EB' },
  { icon:'💡', title:'AMCAT Skill Test', desc:'Coding, Aptitude, English & Automata — timed', color:'#7C3AED' },
  { icon:'🎙️', title:'SVAR Verbal Test', desc:'Speaking, listening, fluency — proctored', color:'#DC2626' },
  { icon:'🏆', title:'Hackathon Challenge', desc:'Real-world problem solving with code submission', color:'#059669' },
  { icon:'🤖', title:'AI Interview', desc:'Live interview with AI scoring on 10+ parameters', color:'#0891B2' },
  { icon:'📊', title:'Final Results', desc:'Comprehensive scorecard shared with company HR', color:'#D97706' },
];

const STATS = [
  { val:'50K+', label:'Candidates Assessed' },
  { val:'200+', label:'Partner Companies' },
  { val:'94%', label:'Accuracy Rate' },
  { val:'8 min', label:'Avg. Evaluation Time' },
];

export default function CompanyOverview({ user, onStartTest }: Props) {
  const name = user?.user?.name || user?.name || 'Candidate';

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'900', fontSize:'16px' }}>G</div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B' }}>AI Recruitment Platform</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'14px' }}>{name[0]?.toUpperCase()}</div>
          <span style={{ fontSize:'14px', color:'#374151', fontWeight:'600' }}>{name}</span>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ background:'linear-gradient(135deg,#1E3A8A,#2563EB,#7C3AED)', padding:'72px 40px', textAlign:'center' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'22px', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', border:'1px solid rgba(255,255,255,0.25)' }}>
          <span style={{ fontSize:'40px', fontWeight:'900', color:'#fff' }}>G</span>
        </div>
        <h1 style={{ fontSize:'42px', fontWeight:'900', color:'#fff', margin:'0 0 12px', letterSpacing:'-1px' }}>GenuAI Technologies</h1>
        <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.8)', margin:'0 0 8px' }}>AI-Powered End-to-End Recruitment Assessment Platform</p>
        <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', maxWidth:'560px', margin:'0 auto' }}>
          We transform traditional hiring by evaluating candidates across six dimensions — skills, communication, problem-solving, aptitude, and personality — all powered by cutting-edge AI.
        </p>

        {/* Stats */}
        <div style={{ display:'flex', justifyContent:'center', gap:'40px', marginTop:'48px' }}>
          {STATS.map((s,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'30px', fontWeight:'900', color:'#fff' }}>{s.val}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', fontWeight:'600', marginTop:'4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Modules */}
      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'60px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <span style={{ background:'#EFF6FF', color:'#2563EB', fontSize:'12px', fontWeight:'700', padding:'6px 16px', borderRadius:'20px', border:'1px solid #BFDBFE' }}>ASSESSMENT PIPELINE</span>
          <h2 style={{ fontSize:'28px', fontWeight:'900', color:'#0F172A', margin:'16px 0 8px', letterSpacing:'-0.5px' }}>Your 6-Module Journey</h2>
          <p style={{ color:'#64748B', fontSize:'14px' }}>Each module is carefully designed to evaluate a different competency</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'40px' }}>
          {MODULES.map((m,i)=>(
            <div key={i} style={{ background:'#fff', borderRadius:'16px', padding:'24px', border:'1px solid #E5E7EB', display:'flex', gap:'16px', alignItems:'flex-start' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:m.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{m.icon}</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <span style={{ background:m.color+'15', color:m.color, fontSize:'10px', fontWeight:'800', padding:'2px 8px', borderRadius:'10px' }}>Step {i+1}</span>
                </div>
                <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'14px', marginBottom:'4px' }}>{m.title}</div>
                <div style={{ color:'#64748B', fontSize:'12px', lineHeight:'1.5' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules box */}
        <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #E5E7EB', padding:'32px', marginBottom:'32px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0F172A', margin:'0 0 16px' }}>📋 Assessment Rules</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            {[
              '✅ Stable internet connection required',
              '✅ Laptop/desktop with camera and mic',
              '✅ Quiet, well-lit environment',
              '✅ Valid resume in PDF/DOC format',
              '⛔ No tab switching during test',
              '⛔ No mobile phone visible on camera',
              '⛔ No additional persons in frame',
              '⛔ Session auto-terminates on 3 violations',
            ].map((r,i)=>(
              <div key={i} style={{ background:'#F8FAFC', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#374151', fontWeight:'500' }}>{r}</div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'14px', color:'#64748B', marginBottom:'20px' }}>You have read and understood all the rules. Ready to begin?</div>
          <button
            onClick={onStartTest}
            style={{ padding:'16px 56px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer', boxShadow:'0 8px 24px rgba(37,99,235,0.3)', letterSpacing:'0.2px' }}
          >
            Begin Official Assessment →
          </button>
          <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'16px' }}>© 2025 GenuAI Technologies · All rights reserved</div>
        </div>
      </div>
    </div>
  );
}
