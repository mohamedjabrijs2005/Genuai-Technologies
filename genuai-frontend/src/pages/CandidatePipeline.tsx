import { useState } from 'react';
import Module1_ProfileResume from './Module1_ProfileResume';
import AMCATTest from './AMCATTest';
import Module3_SVARTest from './Module3_SVARTest';
import Module4_Hackathon from './Module4_Hackathon';
import { submitAssessment } from '../services/api';
import { useEffect, useRef } from 'react';

interface Props {
  user: any;
  onLogout: () => void;
  onInterview: (roomId?: string) => void;   // was () => void
}

type Stage = 'overview' | 'module1' | 'module2' | 'module3' | 'module4' | 'module5' | 'module6';

const MODULES = [
  { id:1, title:'Profile & Resume', icon:'📋', desc:'Upload resume, AI analysis, ATS scoring', color:'#667EEA', stage:'module1' },
  { id:2, title:'AMCAT Skill Test', icon:'💻', desc:'Coding, Aptitude, English, Automata — timed sections', color:'#764BA2', stage:'module2' },
  { id:3, title:'SVAR Verbal Test', icon:'🎙️', desc:'Listening, speaking, fluency assessment', color:'#F59E0B', stage:'module3' },
  { id:4, title:'Hackathon', icon:'🏆', desc:'Real-world problem solving, project submission', color:'#00B87C', stage:'module4' },
  { id:5, title:'AI Interview', icon:'🤖', desc:'Voice and face verify, environment check, AI interview', color:'#EF4444', stage:'module5' },
  { id:6, title:'Final Results', icon:'📊', desc:'Comprehensive score across all modules', color:'#667EEA', stage:'module6' },
];

export default function CandidatePipeline({ user, onLogout, onInterview }: Props) {
  const [stage, setStage] = useState<Stage>('overview');
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [moduleData, setModuleData] = useState<Record<number,any>>({});
  const [role, setRole] = useState('Software Engineer');
  const submittedRef = useRef(false);

  useEffect(() => {
    if (stage === 'module6' && !submittedRef.current) {
      submittedRef.current = true;
      const d1 = moduleData[1] || {};
      const score = Math.round(completedModules.reduce((acc, mid) => acc + (moduleData[mid]?.overall || moduleData[mid]?.ats_score || 75), 0) / Math.max(completedModules.length, 1));
      
      submitAssessment({
        user_id: user?.user?.id || user?.id || 1,
        job_id: null,
        resume_text: d1.analysis?.skills?.join(', ') || 'N/A',
        skills: d1.analysis?.skills?.join(', ') || '',
        ats_score: d1.analysis?.ats_score || 75,
        resume_score: d1.analysis?.ats_score || 75,
        test_score: moduleData[2]?.overall || 70,
        interview_score: 80,
        consistency_score: 85,
        overall_score: score,
        authenticity_score: 90,
        verdict: score >= 75 ? 'HIRE' : score >= 60 ? 'REVIEW' : 'REJECT',
        triangle_status: 'VERIFIED',
        company_ids: d1.company_ids || []
      }).catch(console.error);
    }
  }, [stage, moduleData, user, completedModules]);

  const completeModule = (moduleNum: number, data: any) => {
    setCompletedModules(prev => [...prev, moduleNum]);
    setModuleData(prev => ({ ...prev, [moduleNum]: data }));
    setStage('overview');
  };

  const canAccess = (moduleId: number) => {
    if (moduleId === 1) return true;
    return completedModules.includes(moduleId - 1);
  };

  const isCompleted = (moduleId: number) => completedModules.includes(moduleId);
  const userName = user?.user?.name || user?.name || 'Candidate';

  if (stage === 'module1') return <Module1_ProfileResume user={user} onComplete={data => { setRole(data.role || 'Software Engineer'); completeModule(1, data); }}/>;
  if (stage === 'module2') return <AMCATTest user={user?.user||user} role={role} onComplete={data => completeModule(2, data)} onTerminate={() => setStage('overview')}/>;
  if (stage === 'module3') return <Module3_SVARTest user={user} role={role} onComplete={data => completeModule(3, data)} onTerminate={() => setStage('overview')}/>;
  if (stage === 'module4') return <Module4_Hackathon user={user} role={role} onComplete={data => completeModule(4, data)}/>;
  if (stage === 'module5') {
  const roomId = 'room-' + (user?.user?.id || user?.id || 'candidate') + '-' + Date.now();
  onInterview(roomId);
  return null;
}

  if (stage === 'module6') return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <div style={{ background:'#fff', borderRadius:'24px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'32px 36px', textAlign:'center' }}>
            <div style={{ fontSize:'56px', marginBottom:'12px' }}>🎓</div>
            <div style={{ color:'#fff', fontSize:'24px', fontWeight:'800' }}>Assessment Complete!</div>
            <div style={{ color:'rgba(255,255,255,0.9)', fontSize:'14px', marginTop:'4px' }}>Your comprehensive evaluation report</div>
          </div>
          <div style={{ padding:'36px' }}>
            <div style={{ display:'grid', gap:'16px' }}>
              {MODULES.slice(0,5).map((m,i) => {
                const data = moduleData[m.id];
                const done = isCompleted(m.id);
                const score = data?.overall || data?.ats_score || (done ? 75 : 0);
                return (
                  <div key={i} style={{ background:'#F8FAFC', borderRadius:'16px', padding:'20px', border:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                      <span style={{ fontSize:'28px' }}>{m.icon}</span>
                      <div><div style={{ color:'#0F172A', fontWeight:'700', fontSize:'15px' }}>{m.title}</div><div style={{ color:'#64748B', fontSize:'12px' }}>{done ? 'Completed' : 'Not attempted'}</div></div>
                    </div>
                    <div style={{ fontSize:'28px', fontWeight:'900', color: score>=70?'#00B87C':score>=50?'#F59E0B':'#EF4444' }}>{done ? score+'%' : '-'}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:'#F8FAFC', borderRadius:'16px', padding:'24px', marginTop:'20px', textAlign:'center', border:'1px solid #E2E8F0' }}>
              <div style={{ color:'#64748B', fontSize:'13px', marginBottom:'8px' }}>Overall Assessment Score</div>
              <div style={{ color:'#667EEA', fontSize:'56px', fontWeight:'900' }}>
                {completedModules.length > 0 ? Math.round(completedModules.reduce((acc, mid) => { const d = moduleData[mid]; const s = d?.overall || d?.ats_score || 75; return acc + s; }, 0) / completedModules.length) : 0}%
              </div>
              <div style={{ color:'#64748B', fontSize:'13px', marginTop:'4px' }}>{completedModules.length}/5 modules completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', overflow:'hidden' }}>
            <img src="/logo.png" alt="GenuAI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div><div style={{ color:'#0F172A', fontWeight:'800', fontSize:'15px' }}>GenuAI Assessment</div><div style={{ color:'#64748B', fontSize:'12px', fontWeight:'500' }}>Candidate Pipeline</div></div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ color:'#64748B', fontSize:'13px', fontWeight:'600' }}>👤 {userName}</div>
          <button onClick={onLogout} style={{ background:'#F1F5F9', color:'#EF4444', border:'1px solid #FECACA', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontSize:'13px', fontWeight:'700' }}>Logout</button>
        </div>
      </div>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ color:'#0F172A', fontSize:'28px', fontWeight:'900', marginBottom:'8px', letterSpacing:'-0.5px' }}>Welcome, {userName} 👋</div>
          <div style={{ color:'#64748B', fontSize:'15px' }}>Complete all modules to get your comprehensive assessment score</div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginBottom:'40px', alignItems:'center' }}>
          {MODULES.map((m,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', flex:1 }}>
              <div style={{ flex:1, display:'flex', flexDirection:'column' as any, alignItems:'center', gap:'6px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: isCompleted(m.id)?m.color:canAccess(m.id)?m.color+'22':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', border: isCompleted(m.id)?'2px solid '+m.color:'2px solid transparent' }}>{isCompleted(m.id)?'✓':m.icon}</div>
                <div style={{ color: isCompleted(m.id)?'#0F172A':canAccess(m.id)?'#64748B':'#94A3B8', fontSize:'11px', fontWeight:'700', textAlign:'center', maxWidth:'70px' }}>{m.title}</div>
              </div>
              {i < MODULES.length-1 && <div style={{ width:'24px', height:'2px', background: isCompleted(m.id)?m.color:'#E2E8F0', flexShrink:0 }}/>}
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
          {MODULES.map((m, i) => {
            const done = isCompleted(m.id);
            const accessible = canAccess(m.id);
            const data = moduleData[m.id];
            const score = data?.overall || data?.ats_score || null;
            return (
              <div key={i} style={{ background:'#fff', borderRadius:'20px', border: done ? '2px solid '+m.color+'44' : '1px solid #E2E8F0', padding:'24px', opacity: accessible?1:0.6, boxShadow: accessible ? '0 4px 12px rgba(0,0,0,0.02)' : 'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <div style={{ width:'48px', height:'48px', background:m.color+'15', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>{m.icon}</div>
                  {done ? <span style={{ background:'#D1FAE5', color:'#059669', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Done {score ? score+'%' : ''}</span>
                  : accessible ? <span style={{ background:m.color+'15', color:m.color, padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Ready</span>
                  : <span style={{ background:'#F1F5F9', color:'#94A3B8', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Locked</span>}
                </div>
                <div style={{ color:'#0F172A', fontWeight:'800', fontSize:'16px', marginBottom:'6px' }}>Module {m.id}: {m.title}</div>
                <div style={{ color:'#64748B', fontSize:'13px', lineHeight:'1.6', marginBottom:'20px' }}>{m.desc}</div>
                <button onClick={() => accessible && setStage(m.stage as Stage)} disabled={!accessible}
                  style={{ width:'100%', padding:'12px', background: done?'#F1F5F9':accessible?'linear-gradient(135deg,'+m.color+','+m.color+'dd)':'#F8FAFC', color: done?'#64748B':accessible?'#fff':'#94A3B8', border: done||!accessible?'1px solid #E2E8F0':'none', borderRadius:'12px', fontWeight:'700', fontSize:'14px', cursor:accessible?'pointer':'not-allowed', transition:'all 0.2s', boxShadow: accessible&&!done?'0 4px 12px '+m.color+'44':'none' }}>
                  {done ? 'Completed' : accessible ? 'Start Module '+m.id+' →' : 'Complete Module '+(m.id-1)+' first'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
