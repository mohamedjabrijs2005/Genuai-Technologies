import { useState } from 'react';
import Module1_ProfileResume from './Module1_ProfileResume';
import AMCATTest from './AMCATTest';
import Module3_SVARTest from './Module3_SVARTest';
import Module4_Hackathon from './Module4_Hackathon';
import Module6_GroupDiscussion from './Module6_GroupDiscussion';
import { submitAssessment } from '../services/api';
import { useEffect, useRef } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

interface Props {
  user: any;
  onLogout: () => void;
  onInterview: (roomId?: string) => void;   // was () => void
}

type Stage = 'interest' | 'overview' | 'module1' | 'module2' | 'module3' | 'module4' | 'module5' | 'module6' | 'module7';

const MODULES = [
  { id:1, title:'Profile & Resume', imgSrc:'/icons/resume_gen.png', desc:'Upload resume, AI analysis, ATS scoring', color:'#667EEA', stage:'module1' },
  { id:2, title:'GenuAI Skill Test', imgSrc:'/icons/skill_test.png', desc:'Coding, Aptitude, English, Automata — timed sections', color:'#764BA2', stage:'module2' },
  { id:3, title:'SVAR Verbal Test', imgSrc:'/icons/svar_mic.png', desc:'Listening, speaking, fluency assessment', color:'#F59E0B', stage:'module3' },
  { id:4, title:'Hackathon', imgSrc:'/icons/icon_hackathon.png', desc:'Real-world problem solving, project submission', color:'#00B87C', stage:'module4' },
  { id:5, title:'AI Interview', imgSrc:'/icons/ai_mock_interview.png', desc:'Voice and face verify, environment check, AI interview', color:'#EF4444', stage:'module5' },
  { id:6, title:'Group Discussion', imgSrc:'/icons/learning_brain.png', desc:'Collaborative problem solving and communication', color:'#8B5CF6', stage:'module6' },
  { id:7, title:'Final Results', imgSrc:'/icons/cat_logical.png', desc:'Comprehensive score across all modules', color:'#667EEA', stage:'module7' },
];

const IMPORTANT_COMPANIES = [
  { id: -1, name: 'Google' },
  { id: -2, name: 'Microsoft' },
  { id: -3, name: 'Amazon' },
  { id: -4, name: 'Apple' },
  { id: -5, name: 'Meta' },
  { id: -6, name: 'Zoho' },
  { id: -7, name: 'Accenture' },
  { id: -8, name: 'JP Morgan' },
  { id: -9, name: 'TCS' },
  { id: -10, name: 'Infosys' },
  { id: -11, name: 'Cognizant' },
  { id: -12, name: 'Wipro' },
  { id: -13, name: 'Capgemini' },
  { id: -14, name: 'Deloitte' },
  { id: -15, name: 'IBM' },
  { id: -16, name: 'Intel' },
  { id: -17, name: 'Cisco' }
];

export default function CandidatePipeline({ user, onLogout, onInterview }: Props) {
  const [stage, setStage] = useState<Stage>('interest');
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [moduleData, setModuleData] = useState<Record<number,any>>({});
  const [role, setRole] = useState('Software Engineer');
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [availableJobsList, setAvailableJobsList] = useState<any[]>([]);
  const [targetJobs, setTargetJobs] = useState<number[]>([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    axios.get(API + '/admin/companies')
      .then(res => {
        let dbCompanies = res.data || [];
        dbCompanies = dbCompanies.filter((c:any) => !c.name?.toLowerCase().includes('demo') && !c.name?.toLowerCase().includes('mohamed jabri'));
        const uniqueDbCompanies: any[] = []; const seenNames = new Set<string>();
        for (const c of dbCompanies) { if (!seenNames.has(c.name?.toLowerCase())) { seenNames.add(c.name?.toLowerCase()); uniqueDbCompanies.push(c); } }
        
        const dbNames = uniqueDbCompanies.map(c => c.name?.toLowerCase());
        const filteredImportant = IMPORTANT_COMPANIES.filter(c => !dbNames.includes(c.name.toLowerCase()));
        setAvailableCompanies([...filteredImportant, ...uniqueDbCompanies]);
      }).catch(() => {
        setAvailableCompanies(IMPORTANT_COMPANIES);
      });
    axios.get(API + '/jobs/list').then(res => {
      const dbJobs = res.data.jobs || [];
      const defaultJobs: any[] = [];
      IMPORTANT_COMPANIES.forEach(comp => {
        defaultJobs.push({ id: comp.id * 100 - 1, company_id: comp.id, company_name: comp.name, title: 'Software Engineer' });
        defaultJobs.push({ id: comp.id * 100 - 2, company_id: comp.id, company_name: comp.name, title: 'AI Engineer' });
        defaultJobs.push({ id: comp.id * 100 - 3, company_id: comp.id, company_name: comp.name, title: 'Data Scientist' });
      });
      setAvailableJobsList([...dbJobs, ...defaultJobs]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stage === 'module7' && !submittedRef.current) {
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
        company_ids: selectedCompanies
      }).catch(console.error);
    }
  }, [stage, moduleData, user, completedModules, selectedCompanies]);

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

  if (stage === 'interest') {
    return (
      <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl w-full mx-auto animate-[slideUp_0.4s_ease]">
          <div className="glass p-xxxl rounded-xxxl text-center relative overflow-hidden shadow-lg border border-surface-container/50">
            <div className="w-16 h-16 mx-auto mb-md overflow-hidden rounded-2xl bg-surface-bright border border-surface-container flex items-center justify-center shadow-sm">
              <img src="/icons/icon_globe.png" alt="Target" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <h2 className="text-headline-md font-headline-md text-on-surface m-0 mb-sm">Which companies are you interested in?</h2>
            <p className="text-body-base text-on-surface-variant/80 m-0 mb-xl max-w-lg mx-auto">Select one or more companies to view their open roles.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-xl text-left">
              {availableCompanies.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 text-sm text-on-surface-variant/80 italic p-lg bg-surface-container/50 rounded-xl text-center">Loading companies...</div>
              ) : (
                availableCompanies.map(c => (
                  <div key={c.id} onClick={() => setSelectedCompanies(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                    className={`p-md border-2 rounded-xl cursor-pointer flex items-center gap-sm transition-all hover:scale-[1.02] ${selectedCompanies.includes(c.id) ? 'border-indigo-brand bg-indigo-brand/10' : 'border-surface-container bg-surface-bright hover:border-surface-container-high'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedCompanies.includes(c.id) ? 'border-indigo-brand bg-indigo-brand' : 'border-surface-container bg-surface-bright'}`}>
                      {selectedCompanies.includes(c.id) && <span className="text-white text-xs font-bold material-symbols-outlined" style={{fontSize: "14px"}}>check</span>}
                    </div>
                    <span className={`text-body-base font-bold ${selectedCompanies.includes(c.id) ? 'text-indigo-brand' : 'text-on-surface'}`}>{c.name}</span>
                  </div>
                ))
              )}
            </div>

            {selectedCompanies.length > 0 && (
              <div className="text-left mb-xl p-lg bg-surface-container/30 rounded-xl border border-surface-container">
                <h3 className="m-0 mb-md text-on-surface text-lg font-bold">Available Vacancies</h3>
                {availableJobsList.filter(j => selectedCompanies.includes(j.company_id)).length === 0 ? (
                  <div className="text-on-surface-variant/80 text-sm">No active vacancies posted by the selected companies right now. You can still continue to the general assessment.</div>
                ) : (
                  <div className="flex flex-col gap-sm">
                    {availableJobsList.filter(j => selectedCompanies.includes(j.company_id)).map(job => (
                      <div key={job.id} onClick={() => setTargetJobs(prev => prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id])}
                        className={`p-md border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all hover:scale-[1.01] ${targetJobs.includes(job.id) ? 'border-success bg-success/10' : 'border-surface-container bg-surface-bright hover:border-surface-container-high'}`}>
                        <div>
                          <div className={`font-bold text-body-base mb-xs ${targetJobs.includes(job.id) ? 'text-success-dark' : 'text-on-surface'}`}>{job.title}</div>
                          <div className="text-xs text-on-surface-variant font-medium">🏢 {job.company_name}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targetJobs.includes(job.id) ? 'border-success bg-success' : 'border-surface-container bg-surface-bright'}`}>
                           {targetJobs.includes(job.id) && <span className="text-white text-xs font-bold material-symbols-outlined" style={{fontSize: "14px"}}>check</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setStage('overview')} disabled={selectedCompanies.length === 0} 
              className={`px-xl py-md border-none rounded-xl font-bold text-body-base transition-all ${selectedCompanies.length === 0 ? 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white cursor-pointer hover:shadow-[0_8px_25px_rgba(37,99,235,0.3)] hover:scale-105'}`}>
              Continue to Assessment →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'module1') return <Module1_ProfileResume user={user} onComplete={data => { setRole(data.role || 'Software Engineer'); completeModule(1, data); }}/>;
  if (stage === 'module2') return <AMCATTest user={user?.user||user} role={role} onComplete={data => completeModule(2, data)} onTerminate={() => setStage('overview')}/>;
  if (stage === 'module3') return <Module3_SVARTest user={user} role={role} onComplete={data => completeModule(3, data)} onTerminate={() => setStage('overview')}/>;
  if (stage === 'module4') return <Module4_Hackathon user={user} role={role} onComplete={data => completeModule(4, data)}/>;
  if (stage === 'module5') {
  const roomId = 'room-' + (user?.user?.id || user?.id || 'candidate') + '-' + Date.now();
  onInterview(roomId);
  return null;
}

  if (stage === 'module6') return <Module6_GroupDiscussion user={user} role={role} onComplete={data => completeModule(6, data)}/>;

  if (stage === 'module7') return (
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl w-full mx-auto animate-[slideUp_0.4s_ease]">
        <div className="glass rounded-xxxl overflow-hidden shadow-lg border border-surface-container/50">
          <div className="bg-gradient-to-r from-indigo-brand to-[#764BA2] p-xxl text-center">
            <div className="w-20 h-20 mx-auto mb-md overflow-hidden rounded-2xl bg-white shadow-sm border border-white/20">
              <img src="/icons/cat_english.png" alt="Graduation" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="text-white text-3xl font-black">Assessment Complete!</div>
            <div className="text-white/90 text-sm mt-1 font-semibold">Your comprehensive evaluation report</div>
          </div>
          
          <div className="p-xxl bg-white/50 backdrop-blur-sm">
            <div className="grid gap-md">
              {MODULES.slice(0,6).map((m,i) => {
                const data = moduleData[m.id];
                const done = isCompleted(m.id);
                const score = data?.overall || data?.ats_score || (done ? 75 : 0);
                return (
                  <div key={i} className="bg-surface-bright rounded-2xl p-lg border border-surface-container flex justify-between items-center hover:shadow-sm transition-all hover:border-surface-container-high">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-surface-container shrink-0">
                        <img src={m.imgSrc} alt={m.title} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div>
                        <div className="text-on-surface font-bold text-body-base">{m.title}</div>
                        <div className="text-on-surface-variant text-xs font-semibold">{done ? 'Completed' : 'Not attempted'}</div>
                      </div>
                    </div>
                    <div className={`text-3xl font-black ${score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-error'}`}>
                      {done ? score+'%' : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-surface-bright rounded-2xl p-xxl mt-xl text-center border border-surface-container shadow-sm">
              <div className="text-on-surface-variant text-sm font-bold uppercase tracking-wider mb-xs">Overall Assessment Score</div>
              <div className="text-indigo-brand text-7xl font-black drop-shadow-sm my-sm">
                {completedModules.length > 0 ? Math.round(completedModules.reduce((acc, mid) => { const d = moduleData[mid]; const s = d?.overall || d?.ats_score || 75; return acc + s; }, 0) / completedModules.length) : 0}%
              </div>
              <div className="text-on-surface-variant font-semibold text-sm mt-xs bg-surface-container/50 inline-block px-md py-xs rounded-lg">{completedModules.length}/6 modules completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 glass border-b border-surface-container/50 p-sm md:px-xl flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-sm">
          <img src="/logo.png" alt="GenuAI" className="w-11 h-11 object-contain gold-glow-subtle" />
          <div>
            <div className="font-bold text-lg text-on-surface leading-tight">Genu<span className="text-accent-gold">AI</span></div>
            <div className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase">Candidate Pipeline</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="text-on-surface-variant text-sm font-bold flex items-center gap-xs">
            <span className="text-lg">👤</span> {userName}
          </div>
          <button onClick={onLogout} className="bg-surface-bright text-error border border-error/30 rounded-lg px-md py-xs cursor-pointer text-sm font-bold hover:bg-error/10 transition-colors">Logout</button>
        </div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto p-margin-mobile md:p-margin-desktop pt-xl">
        <div className="mb-xxl text-center">
          <div className="text-headline-md font-headline-md text-on-surface mb-xs drop-shadow-sm">Welcome, {userName} 👋</div>
          <div className="text-body-base text-on-surface-variant font-medium">Complete all modules to get your comprehensive assessment score</div>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex gap-xs mb-xxl items-center overflow-x-auto pb-sm custom-scrollbar px-sm">
          {MODULES.map((m,i) => (
            <div key={i} className="flex items-center gap-xs flex-1 min-w-[80px]">
              <div className="flex-1 flex flex-col items-center gap-xs">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted(m.id) ? 'shadow-sm border-2' : canAccess(m.id) ? 'border-2 border-dashed' : 'bg-surface-container/30 border border-surface-container'}`} 
                     style={{ 
                       backgroundColor: isCompleted(m.id) ? m.color : canAccess(m.id) ? `${m.color}22` : '',
                       borderColor: isCompleted(m.id) ? m.color : canAccess(m.id) ? m.color : '' 
                     }}>
                  {isCompleted(m.id) ? <span className="text-white text-xl font-bold material-symbols-outlined">check</span> : <img src={m.imgSrc} alt={m.title} className="w-[60%] h-[60%] object-cover mix-blend-multiply" style={{ opacity: canAccess(m.id) ? 1 : 0.4 }} />}
                </div>
                <div className={`text-[10px] font-bold text-center max-w-[80px] leading-tight ${isCompleted(m.id) ? 'text-on-surface' : canAccess(m.id) ? 'text-on-surface-variant' : 'text-on-surface-variant/50'}`}>{m.title}</div>
              </div>
              {i < MODULES.length-1 && <div className={`w-8 h-[2px] shrink-0 rounded-full ${isCompleted(m.id) ? 'opacity-100' : 'bg-surface-container'}`} style={{ backgroundColor: isCompleted(m.id) ? m.color : '' }} />}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
          {MODULES.map((m, i) => {
            const done = isCompleted(m.id);
            const accessible = canAccess(m.id);
            const data = moduleData[m.id];
            const score = data?.overall || data?.ats_score || null;
            return (
              <div key={i} className={`glass rounded-2xl p-lg transition-all ${done ? 'border-2' : 'border border-surface-container'} ${accessible ? 'opacity-100 hover:shadow-md hover:-translate-y-1' : 'opacity-60 grayscale-[30%]'}`} style={{ borderColor: done ? `${m.color}66` : '' }}>
                <div className="flex justify-between items-start mb-md">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border border-surface-container/50" style={{ backgroundColor: `${m.color}15` }}>
                    <img src={m.imgSrc} alt={m.title} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  {done ? <span className="bg-success/15 text-success-dark px-sm py-1 rounded-full text-xs font-bold border border-success/30">Done {score ? score+'%' : ''}</span>
                  : accessible ? <span className="px-sm py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: `${m.color}15`, color: m.color, borderColor: `${m.color}30` }}>Ready</span>
                  : <span className="bg-surface-container/50 text-on-surface-variant px-sm py-1 rounded-full text-xs font-bold border border-surface-container">Locked</span>}
                </div>
                <div className="text-on-surface font-black text-body-lg mb-xs">Module {m.id}: {m.title}</div>
                <div className="text-on-surface-variant text-sm font-medium leading-relaxed mb-lg line-clamp-2 min-h-[40px]">{m.desc}</div>
                <button onClick={() => accessible && setStage(m.stage as Stage)} disabled={!accessible}
                  className={`w-full py-md rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-xs ${done ? 'bg-surface-container/50 text-on-surface-variant cursor-pointer hover:bg-surface-container' : accessible ? 'text-white cursor-pointer hover:scale-[1.02]' : 'bg-surface-container/30 text-on-surface-variant/50 cursor-not-allowed border border-surface-container'}`}
                  style={{ 
                    background: accessible && !done ? `linear-gradient(135deg, ${m.color}, ${m.color}dd)` : '',
                    boxShadow: accessible && !done ? `0 4px 15px ${m.color}44` : ''
                  }}>
                  {done ? 'Review' : accessible ? `Start Module ${m.id} →` : `Complete Module ${m.id-1} first`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
