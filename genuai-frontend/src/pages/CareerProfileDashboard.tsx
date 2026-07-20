import { useState } from 'react';
import ResumeGenerator from './ResumeGenerator';
import CoverLetterGenerator from './CoverLetterGenerator';
import ATSChecker from './ATSChecker';
import PortfolioManager from './PortfolioManager';

interface Props { user: any; onBack: () => void; }

const TOOLS = [
  { id:'resume', imgSrc:'/icons/resume_gen.png', title:'AI Resume Builder', desc:'Build a professional ATS-optimized resume using AI. Tailored to your target role.', classes: { hoverBorder: 'hover:border-info-dark', bgLight: 'bg-info/10', borderLight: 'border-info-dark/20' }, tags:['ATS Optimized','PDF Export'], ready:true },
  { id:'cover', imgSrc:'/icons/cover_letter.png', title:'Cover Letter Generator', desc:'Generate compelling, personalized cover letters for any job posting instantly.', classes: { hoverBorder: 'hover:border-success-dark', bgLight: 'bg-success/10', borderLight: 'border-success-dark/20' }, tags:['Personalized','Instant'], ready:true },
  { id:'ats', imgSrc:'/icons/learning_brain.png', title:'ATS Scanner', desc:'Paste your existing resume and a job description to get a comprehensive compatibility report.', classes: { hoverBorder: 'hover:border-[#7C3AED]', bgLight: 'bg-[#7C3AED]/10', borderLight: 'border-[#7C3AED]/20' }, tags:['Resume Scoring','Keyword Match'], ready:true },
  { id:'portfolio', imgSrc:'/icons/cat_logical.png', title:'Portfolio Manager', desc:'Connect your GitHub and LeetCode to auto-generate a stunning developer portfolio.', classes: { hoverBorder: 'hover:border-warning-dark', bgLight: 'bg-warning/10', borderLight: 'border-warning-dark/20' }, tags:['GitHub Sync','Projects'], ready:true },
];

export default function CareerProfileDashboard({ user, onBack }: Props) {
  const [openTool, setOpenTool] = useState<string | null>(null);
  const name = user?.user?.name || user?.name || 'Candidate';

  if (openTool === 'resume') return <ResumeGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'cover') return <CoverLetterGenerator user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'ats') return <ATSChecker user={user} onBack={() => setOpenTool(null)} />;
  if (openTool === 'portfolio') return <PortfolioManager user={user} onBack={() => setOpenTool(null)} />;

  return (
    <div className="min-h-screen bg-background quantum-gradient relative overflow-hidden flex flex-col">
      {/* Header */}
      <nav className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-sm">
          <img src="/logo.png" alt="GenuAI" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <div className="font-black text-sm text-on-surface">GenuAI Technologies</div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Career Profile Hub</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={onBack} className="bg-surface-bright border border-surface-container rounded-lg px-md py-xs text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-surface-container-high transition-colors">
            ← Change Path
          </button>
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F172A] to-[#334155] flex items-center justify-center text-white font-black text-xs shadow-sm">
              {name[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-bold text-on-surface hidden sm:block">{name}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto w-full p-lg md:p-xl flex-1 flex flex-col relative z-10">
        <div className="bg-gradient-to-br from-[#0F172A] to-[#334155] rounded-3xl p-xl md:p-xxl text-white mb-xl flex flex-col md:flex-row justify-between items-center shadow-lg shadow-[#0F172A]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-[2.8rem] md:text-[3.5rem] font-black mb-3 drop-shadow-sm leading-tight tracking-tight">Career Profile Hub</h1>
            <p className="text-lg md:text-xl font-medium text-white/80 max-w-2xl leading-relaxed">Build and manage your professional identity. Use our AI-powered tools to create ATS-friendly resumes and tailored cover letters that stand out.</p>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner hidden md:flex relative z-10 mt-lg md:mt-0">
             <img src="/icons/resume_gen.png" alt="Career" className="w-14 h-14 object-contain mix-blend-screen opacity-90" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl relative z-10">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              onClick={() => tool.ready ? setOpenTool(tool.id) : null}
              className={`glass rounded-3xl p-lg flex flex-col relative transition-all duration-300 border-2 border-surface-container ${tool.ready ? `cursor-pointer ${tool.classes.hoverBorder} hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:bg-white` : 'opacity-60 cursor-not-allowed'}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${tool.classes.bgLight} flex items-center justify-center mb-md overflow-hidden shrink-0 border ${tool.classes.borderLight}`}>
                <img src={tool.imgSrc} alt={tool.title} className="w-8 h-8 object-contain mix-blend-multiply drop-shadow-sm" />
              </div>
              <div className="font-black text-title-sm text-on-surface mb-xs">{tool.title}</div>
              <p className="text-on-surface-variant font-medium text-xs leading-relaxed mb-md flex-1">{tool.desc}</p>
              <div className="flex flex-wrap gap-xs">
                {tool.tags.map((tag, i) => (
                  <span key={i} className="bg-surface-bright text-on-surface-variant px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-surface-container">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Overview Banner */}
        <div className="glass rounded-3xl p-xl md:p-xxl border border-surface-container shadow-sm flex flex-col md:flex-row items-center gap-xl relative overflow-hidden z-10 mt-auto">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-info/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#7C3AED]/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-md mb-md">
              <div className="w-14 h-14 bg-[#0F172A]/10 rounded-2xl flex items-center justify-center border border-[#0F172A]/20">
                 <img src="/icons/resume_gen.png" alt="Career" className="w-8 h-8 object-contain mix-blend-multiply" />
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface m-0 mb-1">Career Profile Hub</h2>
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider">Build and manage your professional identity</p>
              </div>
            </div>
            
            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-lg max-w-3xl">
              Your one-stop workshop for crafting a professional identity. Use our AI-optimized Resume Builder to generate ATS-friendly documents, our Cover Letter Generator for tailored applications, the ATS Scanner to check compatibility scores, and the Portfolio Manager to auto-sync your GitHub and LeetCode projects.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md max-w-4xl">
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-info-dark">description</span> ATS Optimization</div>
                <div className="text-on-surface-variant text-xs font-medium">Resumes and cover letters tailored for applicant tracking systems.</div>
              </div>
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-[#7C3AED]">auto_fix_high</span> AI-Powered Generation</div>
                <div className="text-on-surface-variant text-xs font-medium">Instant document creation driven by advanced language models.</div>
              </div>
              <div className="bg-surface-bright/80 backdrop-blur-sm p-md rounded-2xl border border-surface-container">
                <div className="text-on-surface font-black text-sm mb-1 flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-warning-dark">integration_instructions</span> GitHub Sync</div>
                <div className="text-on-surface-variant text-xs font-medium">Auto-import your projects and contributions into a stunning portfolio.</div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-surface-bright/90 backdrop-blur-md rounded-2xl border border-surface-container p-xl flex flex-col relative z-10 shadow-sm shrink-0 gap-md">
            <div className="text-on-surface-variant font-bold text-[11px] uppercase tracking-[0.18em] mb-xs text-center">Profile Tools</div>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between bg-info/8 border border-info/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-info-dark text-[18px]">grid_view</span>
                  <span className="text-sm font-bold text-on-surface">Career Tools</span>
                </div>
                <span className="text-xl font-black text-info-dark">{TOOLS.length}</span>
              </div>
              <div className="flex items-center justify-between bg-success/8 border border-success/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                  <span className="text-sm font-bold text-on-surface">All Available</span>
                </div>
                <span className="text-xl font-black text-success">{TOOLS.filter(t => t.ready).length}/{TOOLS.length}</span>
              </div>
              <div className="flex items-center justify-between bg-[#7C3AED]/8 border border-[#7C3AED]/15 rounded-xl px-md py-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[#7C3AED] text-[18px]">auto_awesome</span>
                  <span className="text-sm font-bold text-on-surface">AI-Powered</span>
                </div>
                <span className="text-sm font-black text-[#7C3AED]">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
