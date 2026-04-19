import { useState } from 'react';
import Module1_ProfileResume from './Module1_ProfileResume';
import AMCATTest from './AMCATTest';
import Module3_SVARTest from './Module3_SVARTest';
import Module4_Hackathon from './Module4_Hackathon';

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
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto' }}>
        <div style={{ background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
          <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'32px 36px', textAlign:'center' }}>
            <div style={{ fontSize:'56px', marginBottom:'12px' }}>🎓</div>
            <div style={{ color:'#fff', fontSize:'24px', fontWeight:'800' }}>Assessment Complete!</div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'14px', marginTop:'4px' }}>Your comprehensive evaluation report</div>
          </div>
          <div style={{ padding:'36px' }}>
            <div style={{ display:'grid', gap:'16px' }}>
              {MODULES.slice(0,5).map((m,i) => {
                const data = moduleData[m.id];
                const done = isCompleted(m.id);
                const score = data?.overall || data?.ats_score || (done ? 75 : 0);
                return (
                  <div key={i} style={{ background:'#0D1117', borderRadius:'16px', padding:'20px', border:'1px solid #30363D', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                      <span style={{ fontSize:'28px' }}>{m.icon}</span>
                      <div><div style={{ color:'#fff', fontWeight:'700', fontSize:'15px' }}>{m.title}</div><div style={{ color:'#8B949E', fontSize:'12px' }}>{done ? 'Completed' : 'Not attempted'}</div></div>
                    </div>
                    <div style={{ fontSize:'28px', fontWeight:'900', color: score>=70?'#00B87C':score>=50?'#F59E0B':'#EF4444' }}>{done ? score+'%' : '-'}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:'#0D1117', borderRadius:'16px', padding:'24px', marginTop:'20px', textAlign:'center', border:'1px solid #30363D' }}>
              <div style={{ color:'#8B949E', fontSize:'13px', marginBottom:'8px' }}>Overall Assessment Score</div>
              <div style={{ color:'#667EEA', fontSize:'56px', fontWeight:'900' }}>
                {completedModules.length > 0 ? Math.round(completedModules.reduce((acc, mid) => { const d = moduleData[mid]; const s = d?.overall || d?.ats_score || 75; return acc + s; }, 0) / completedModules.length) : 0}%
              </div>
              <div style={{ color:'#8B949E', fontSize:'13px', marginTop:'4px' }}>{completedModules.length}/5 modules completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', fontFamily:'sans-serif' }}>
      <div style={{ background:'#161B22', borderBottom:'1px solid #30363D', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#667EEA,#764BA2)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'800', fontSize:'16px' }}>G</div>
          <div><div style={{ color:'#fff', fontWeight:'700', fontSize:'15px' }}>GenuAI Assessment</div><div style={{ color:'#8B949E', fontSize:'12px' }}>Candidate Pipeline</div></div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ color:'#8B949E', fontSize:'13px' }}>👤 {userName}</div>
          <button onClick={onLogout} style={{ background:'#30363D', color:'#8B949E', border:'none', borderRadius:'8px', padding:'8px 16px', cursor:'pointer', fontSize:'13px' }}>Logout</button>
        </div>
      </div>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>
        <div style={{ marginBottom:'40px' }}>
          <div style={{ color:'#fff', fontSize:'26px', fontWeight:'800', marginBottom:'8px' }}>Welcome, {userName} 👋</div>
          <div style={{ color:'#8B949E', fontSize:'15px' }}>Complete all modules to get your comprehensive assessment score</div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginBottom:'40px', alignItems:'center' }}>
          {MODULES.map((m,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', flex:1 }}>
              <div style={{ flex:1, display:'flex', flexDirection:'column' as any, alignItems:'center', gap:'6px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background: isCompleted(m.id)?m.color:canAccess(m.id)?m.color+'44':'#30363D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', border: isCompleted(m.id)?'2px solid '+m.color:'2px solid transparent' }}>{isCompleted(m.id)?'✓':m.icon}</div>
                <div style={{ color: isCompleted(m.id)?'#fff':canAccess(m.id)?'#8B949E':'#484F58', fontSize:'10px', fontWeight:'700', textAlign:'center', maxWidth:'70px' }}>{m.title}</div>
              </div>
              {i < MODULES.length-1 && <div style={{ width:'24px', height:'2px', background: isCompleted(m.id)?m.color:'#30363D', flexShrink:0 }}/>}
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
              <div key={i} style={{ background:'#161B22', borderRadius:'20px', border: done ? '1px solid '+m.color+'44' : '1px solid #30363D', padding:'24px', opacity: accessible?1:0.5 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                  <div style={{ width:'48px', height:'48px', background:m.color+'22', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>{m.icon}</div>
                  {done ? <span style={{ background:'#00B87C22', color:'#00B87C', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Done {score ? score+'%' : ''}</span>
                  : accessible ? <span style={{ background:m.color+'22', color:m.color, padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Ready</span>
                  : <span style={{ background:'#30363D', color:'#484F58', padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>Locked</span>}
                </div>
                <div style={{ color:'#fff', fontWeight:'700', fontSize:'16px', marginBottom:'6px' }}>Module {m.id}: {m.title}</div>
                <div style={{ color:'#8B949E', fontSize:'13px', lineHeight:'1.6', marginBottom:'20px' }}>{m.desc}</div>
                <button onClick={() => accessible && setStage(m.stage as Stage)} disabled={!accessible}
                  style={{ width:'100%', padding:'12px', background: done?'#30363D':accessible?'linear-gradient(135deg,'+m.color+','+m.color+'99)':'#1C2128', color: done?'#8B949E':accessible?'#fff':'#484F58', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'14px', cursor:accessible?'pointer':'not-allowed' }}>
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
