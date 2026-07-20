import { useState } from 'react';
import AIMockInterview from './AIMockInterview';
import ProjectBuildingPractice from './ProjectBuildingPractice';
import GroupDiscussionPractice from './GroupDiscussionPractice';
import SVARPractice from './SVARPractice';
import InclusiveLearningHub from './InclusiveLearningHub';
import SkillTestPractice from './SkillTestPractice';

interface Props { user: any; onBack: () => void; }

const TOOLS = [
  { id:'mock', imgSrc:'/icons/ai_mock_interview.png', title:'AI Mock Interview', desc:'Practice with an AI interviewer tailored to your role. Get instant feedback on answers, tone, and clarity.', classes: { hoverBorder: 'hover:border-indigo-brand', bgLight: 'bg-indigo-brand/10', borderLight: 'border-indigo-brand/20', text: 'text-indigo-brand', bg: 'bg-indigo-brand', border: 'border-indigo-brand' }, tags:['HR Round','Technical','Behavioral'], ready:true },
  { id:'skills', imgSrc:'/icons/skill_test.png', title:'Skill Test Practice', desc:'Attempt GenuAI-style coding, aptitude, English, and automata questions with detailed explanations.', classes: { hoverBorder: 'hover:border-[#7C3AED]', bgLight: 'bg-[#7C3AED]/10', borderLight: 'border-[#7C3AED]/20', text: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]', border: 'border-[#7C3AED]' }, tags:['Coding','Aptitude','English','Automata'], ready:true },
  { id:'projects', imgSrc:'/icons/cat_logical.png', title:'Project Building Practice', desc:'Practice building full-stack projects with AI-guided requirements and automated code reviews.', classes: { hoverBorder: 'hover:border-info', bgLight: 'bg-info/10', borderLight: 'border-info/20', text: 'text-info', bg: 'bg-info', border: 'border-info' }, tags:['Full Stack','Code Review'], ready:true },
  { id:'group_discussion', imgSrc:'/icons/cat_automata.png', title:'Group Discussion', desc:'Simulate multiplayer group discussions with AI participants to test leadership and debate skills.', classes: { hoverBorder: 'hover:border-success', bgLight: 'bg-success/10', borderLight: 'border-success/20', text: 'text-success', bg: 'bg-success', border: 'border-success' }, tags:['Leadership','Communication'], ready:true },
  { id:'svar', imgSrc:'/icons/svar_mic.png', title:'SVAR Speaking Practice', desc:'Improve your verbal communication, fluency, and listening comprehension with scored exercises.', classes: { hoverBorder: 'hover:border-error', bgLight: 'bg-error/10', borderLight: 'border-error/20', text: 'text-error', bg: 'bg-error', border: 'border-error' }, tags:['Speaking','Listening','Fluency'], ready:true },
  { id:'learning', imgSrc:'/icons/learning_brain.png', title:'Inclusive Learning Hub', desc:'Access curated courses, video tutorials, DSA sheets, coding challenges, and interview prep guides.', classes: { hoverBorder: 'hover:border-warning-dark', bgLight: 'bg-warning/10', borderLight: 'border-warning-dark/20', text: 'text-warning-dark', bg: 'bg-warning-dark', border: 'border-warning-dark' }, tags:['DSA','System Design','Interview Prep','Video'], ready:true },
];

export default function PracticeDashboard({ user, onBack }: Props) {
  const [active, setActive]   = useState<string|null>(null);
  const [openTool, setOpenTool] = useState<string|null>(null);
  const [toast, setToast]     = useState('');
  const name = user?.user?.name || user?.name || 'Candidate';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleOpen = (tool: typeof TOOLS[0]) => {
    if (tool.ready) setOpenTool(tool.id);
    else showToast(`${tool.title} - Coming Soon!`);
  };

  // --- Route to tool ---
  if (openTool === 'mock') return <AIMockInterview user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'skills') return <SkillTestPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'projects') return <ProjectBuildingPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'group_discussion') return <GroupDiscussionPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'svar') return <SVARPractice user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'learning') return <InclusiveLearningHub user={user} onBack={() => setOpenTool(null)} />;

  return (
    <div className="min-h-screen bg-background quantum-gradient relative overflow-hidden flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-xl left-1/2 -translate-x-1/2 bg-surface-container-highest text-white px-xl py-sm rounded-xl font-bold text-sm z-50 shadow-md animate-[slideDown_0.3s_ease]">
          {toast}
        </div>
      )}

      {/* Header */}
      <nav className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-sm">
          <img src="/logo.png" alt="GenuAI" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <div className="font-black text-sm text-on-surface">GenuAI Technologies</div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Practice Hub</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={onBack} className="bg-surface-bright border border-surface-container rounded-lg px-md py-xs text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-surface-container-high transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Change Path
          </button>
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-brand to-[#7C3AED] flex items-center justify-center text-white font-black text-xs shadow-sm">
              {name[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-bold text-on-surface hidden sm:block">{name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto w-full p-lg md:p-xl flex-1 flex flex-col">
        {/* Background decorations */}
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-indigo-brand/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-warning/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center mb-xl relative z-10">
          <h1 className="text-[2.8rem] md:text-[3.5rem] font-black text-on-surface mb-3 drop-shadow-sm leading-tight tracking-tight">
            Prepare to <span className="text-indigo-brand">Succeed</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Master every stage of the hiring process with AI-driven practice environments.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl relative z-10">
          {TOOLS.map(tool => {
            const isHover = active === tool.id;
            return (
              <div key={tool.id} onMouseEnter={() => setActive(tool.id)} onMouseLeave={() => setActive(null)}
                className={`glass rounded-3xl p-xl flex flex-col relative transition-all duration-300 cursor-pointer border-2 ${isHover ? `${tool.classes.border} shadow-[0_16px_40px_rgba(0,0,0,0.08)] scale-[1.02] bg-white` : 'border-surface-container hover:border-surface-container-high'}`}>
                
                {!tool.ready && (
                  <div className="absolute top-md right-md bg-warning/20 text-warning-dark text-[10px] font-black px-xs py-0.5 rounded-full uppercase tracking-widest border border-warning/30">
                    SOON
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl ${tool.classes.bgLight} flex items-center justify-center mb-md overflow-hidden shrink-0`}>
                  <img src={tool.imgSrc} alt={tool.title} className="w-10 h-10 object-contain mix-blend-multiply drop-shadow-sm" />
                </div>
                
                <h3 className="text-title-md font-title-md text-on-surface mb-xs">{tool.title}</h3>
                <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-md flex-1">{tool.desc}</p>
                
                <div className="flex flex-wrap gap-xs mb-lg">
                  {tool.tags.map((t,i) => (
                    <span key={i} className={`${tool.classes.bgLight} ${tool.classes.text} text-xs font-bold px-sm py-1 rounded-full border ${tool.classes.borderLight}`}>{t}</span>
                  ))}
                </div>
                
                <button onClick={() => handleOpen(tool)} className={`w-full py-sm rounded-xl font-bold text-sm flex items-center justify-center gap-xs transition-all ${tool.ready ? (isHover ? `${tool.classes.bg} text-white shadow-md` : `bg-transparent ${tool.classes.text} border ${tool.classes.border}`) : 'bg-surface-bright text-on-surface-variant border border-surface-container cursor-not-allowed'}`}>
                  {tool.ready ? (isHover ? <>Launch <span className="material-symbols-outlined text-[16px]">rocket_launch</span></> : 'Open Tool') : 'Coming Soon'}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Banner (Overview) */}
        <div className="glass rounded-3xl p-xl md:p-xxl border border-surface-container shadow-sm flex flex-col md:flex-row items-center gap-xl relative overflow-hidden z-10 mt-auto">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-brand/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#7C3AED]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-md mb-md">
              <div className="w-14 h-14 bg-indigo-brand/10 rounded-2xl flex items-center justify-center border border-indigo-brand/20">
                 <img src="/icons/learning_brain.png" alt="Brain" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
              <div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface m-0 mb-1">Candidate Practice Hub</h2>
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">The ultimate AI-powered preparation environment</p>
              </div>
            </div>
            
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-lg max-w-3xl">
              Welcome to your personal training ground. This multimodal hub leverages advanced Natural Language Processing (NLP) to help you master every stage of the hiring process. From generating ATS-optimized resumes to simulating high-pressure live coding tests and conducting voice-to-voice mock interviews, everything you need is right here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md max-w-4xl">
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-error">mic</span> Voice-First Tech</div>
                <div className="text-on-surface-variant text-xs font-medium">Practice communication with STT and TTS feedback.</div>
              </div>
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-info">public</span> Native Learning</div>
                <div className="text-on-surface-variant text-xs font-medium">Lower cognitive load by learning in your native language.</div>
              </div>
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-warning-dark">timer</span> Stress Simulation</div>
                <div className="text-on-surface-variant text-xs font-medium">Replicate real proctored tests to build true confidence.</div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-surface-bright/90 backdrop-blur-md rounded-2xl border border-surface-container p-xl flex flex-col relative z-10 shadow-sm shrink-0 gap-md">
            <div className="text-on-surface-variant font-bold text-[11px] uppercase tracking-[0.18em] mb-xs text-center">Your Practice Scope</div>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between bg-indigo-brand/8 border border-indigo-brand/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-indigo-brand text-[18px]">grid_view</span>
                  <span className="text-sm font-bold text-on-surface">Practice Modules</span>
                </div>
                <span className="text-xl font-black text-indigo-brand">{TOOLS.length}</span>
              </div>
              <div className="flex items-center justify-between bg-success/8 border border-success/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                  <span className="text-sm font-bold text-on-surface">All Available</span>
                </div>
                <span className="text-xl font-black text-success">{TOOLS.filter(t => t.ready).length}/{TOOLS.length}</span>
              </div>
              <div className="flex items-center justify-between bg-warning/8 border border-warning/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-warning-dark text-[18px]">model_training</span>
                  <span className="text-sm font-bold text-on-surface">AI-Powered</span>
                </div>
                <span className="text-sm font-black text-warning-dark">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

