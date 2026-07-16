import { useState } from 'react';

interface Props { user: any; onBack: () => void; }

export default function PortfolioManager({ user, onBack }: Props) {
  const [activeTab, setActiveTab] = useState('integrations');
  const [projects, setProjects] = useState([
    { id: 1, title: 'E-Commerce Platform', tech: ['React', 'Node.js', 'MongoDB'], desc: 'A full-stack e-commerce solution with Stripe integration.', source: 'GitHub Sync' },
    { id: 2, title: 'AI Resume Analyzer', tech: ['Python', 'OpenAI', 'FastAPI'], desc: 'Semantic analysis of resumes against job descriptions.', source: 'Manual' }
  ]);

  return (
    <div className="h-screen bg-background quantum-gradient flex flex-col overflow-hidden">
      {/* Header */}
      <div className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-md">
          <div className="font-black text-title-sm text-on-surface flex items-center gap-sm">
            <span>🎨</span> AI Portfolio Manager
          </div>
        </div>
        <button onClick={onBack} className="bg-surface-bright border border-surface-container text-on-surface-variant px-md py-xs rounded-lg font-bold text-xs hover:text-on-surface hover:border-surface-container-high transition-colors">
          Exit to Hub
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1200px] mx-auto w-full gap-xl p-lg md:p-xl relative z-10">
        
        {/* Left Sidebar */}
        <div className="w-[280px] flex flex-col gap-xs shrink-0">
           <button onClick={() => setActiveTab('integrations')} className={`p-md rounded-xl font-bold text-sm text-left flex items-center gap-md transition-colors ${activeTab === 'integrations' ? 'bg-info/10 text-info-dark' : 'text-on-surface-variant hover:bg-surface-bright/50'}`}>
             <span className="text-lg">🔗</span> Sync & Integrations
           </button>
           <button onClick={() => setActiveTab('projects')} className={`p-md rounded-xl font-bold text-sm text-left flex items-center gap-md transition-colors ${activeTab === 'projects' ? 'bg-info/10 text-info-dark' : 'text-on-surface-variant hover:bg-surface-bright/50'}`}>
             <span className="text-lg">📁</span> My Projects
           </button>
           <button onClick={() => setActiveTab('preview')} className={`p-md rounded-xl font-bold text-sm text-left flex items-center gap-md transition-colors ${activeTab === 'preview' ? 'bg-info/10 text-info-dark' : 'text-on-surface-variant hover:bg-surface-bright/50'}`}>
             <span className="text-lg">👁️</span> Live Preview
           </button>
           
           <div className="mt-auto bg-gradient-to-br from-[#7C3AED] to-indigo-brand rounded-3xl p-lg text-white shadow-lg shadow-indigo-brand/20 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
             <div className="text-2xl mb-xs relative z-10">✨</div>
             <div className="font-black text-sm mb-1 relative z-10">Auto-Generate</div>
             <p className="text-xs font-medium text-white/90 mb-md relative z-10">Let GenuAI build a stunning portfolio site from your synced data.</p>
             <button className="w-full bg-white text-indigo-brand border-none p-sm rounded-xl font-black text-xs cursor-pointer shadow-sm hover:shadow-md transition-all relative z-10">Generate Site</button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 glass rounded-3xl border border-surface-container p-xl overflow-y-auto shadow-sm">
           
           {activeTab === 'integrations' && (
             <div className="animate-[fadeIn_0.3s_ease]">
               <h2 className="text-headline-sm font-black text-on-surface mb-xs">Platform Integrations</h2>
               <p className="text-sm font-medium text-on-surface-variant mb-xl">Connect your external accounts to automatically sync projects, commits, and problem-solving stats.</p>
               
               <div className="flex flex-col gap-md">
                 {/* GitHub */}
                 <div className="border border-surface-container rounded-2xl p-lg flex justify-between items-center bg-surface-bright/30 hover:bg-surface-bright/50 transition-colors">
                   <div className="flex items-center gap-md">
                     <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">🐙</div>
                     <div>
                       <div className="font-black text-on-surface text-sm">GitHub</div>
                       <div className="text-xs font-medium text-on-surface-variant">Sync repositories and commit graphs</div>
                     </div>
                   </div>
                   <button className="bg-info/10 text-info-dark border border-info/20 px-lg py-xs rounded-full font-bold text-xs cursor-default">Connected</button>
                 </div>

                 {/* LeetCode */}
                 <div className="border border-surface-container rounded-2xl p-lg flex justify-between items-center bg-surface-bright/30 hover:bg-surface-bright/50 transition-colors">
                   <div className="flex items-center gap-md">
                     <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">👨‍💻</div>
                     <div>
                       <div className="font-black text-on-surface text-sm">LeetCode</div>
                       <div className="text-xs font-medium text-on-surface-variant">Showcase algorithmic problem-solving stats</div>
                     </div>
                   </div>
                   <button className="bg-background border border-surface-container text-on-surface px-lg py-xs rounded-full font-bold text-xs cursor-pointer hover:border-surface-container-high transition-colors">Connect</button>
                 </div>

                 {/* Kaggle */}
                 <div className="border border-surface-container rounded-2xl p-lg flex justify-between items-center bg-surface-bright/30 hover:bg-surface-bright/50 transition-colors">
                   <div className="flex items-center gap-md">
                     <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">📊</div>
                     <div>
                       <div className="font-black text-on-surface text-sm">Kaggle</div>
                       <div className="text-xs font-medium text-on-surface-variant">Sync datasets, models, and competition ranks</div>
                     </div>
                   </div>
                   <button className="bg-background border border-surface-container text-on-surface px-lg py-xs rounded-full font-bold text-xs cursor-pointer hover:border-surface-container-high transition-colors">Connect</button>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'projects' && (
             <div className="animate-[fadeIn_0.3s_ease]">
               <div className="flex justify-between items-start md:items-center mb-xl flex-col md:flex-row gap-md">
                 <div>
                   <h2 className="text-headline-sm font-black text-on-surface mb-xs">My Projects</h2>
                   <p className="text-sm font-medium text-on-surface-variant">Manage the projects that will appear on your public portfolio.</p>
                 </div>
                 <button className="bg-on-surface text-background border-none px-lg py-sm rounded-xl font-bold text-xs cursor-pointer hover:bg-on-surface/90 transition-colors shadow-sm shrink-0">+ Add Manual Project</button>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-lg">
                 {projects.map(p => (
                   <div key={p.id} className="border border-surface-container rounded-3xl p-lg flex flex-col bg-surface-bright/30 hover:shadow-md transition-shadow">
                     <div className="flex justify-between mb-md">
                       <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-high/20 px-xs py-0.5 rounded-md border border-surface-container">{p.source}</div>
                       <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">settings</span></button>
                     </div>
                     <h3 className="text-title-sm font-black text-on-surface mb-xs">{p.title}</h3>
                     <p className="text-xs font-medium text-on-surface-variant mb-lg flex-1 leading-relaxed">{p.desc}</p>
                     <div className="flex flex-wrap gap-xs">
                       {p.tech.map((t, i) => <span key={i} className="text-[10px] font-bold text-info-dark bg-info/10 px-sm py-1 rounded-md border border-info/20">{t}</span>)}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {activeTab === 'preview' && (
             <div className="h-full flex flex-col animate-[fadeIn_0.3s_ease]">
               <h2 className="text-headline-sm font-black text-on-surface mb-xs">Live Portfolio Preview</h2>
               <p className="text-sm font-medium text-on-surface-variant mb-xl">This is how recruiters will see your AI-generated portfolio.</p>
               
               <div className="flex-1 border-4 border-surface-container rounded-3xl overflow-hidden bg-[#0F172A] text-white flex flex-col shadow-inner">
                 <div className="px-lg py-sm bg-[#1E293B] flex gap-xs border-b border-white/5">
                   <div className="w-3 h-3 rounded-full bg-error-crimson"></div>
                   <div className="w-3 h-3 rounded-full bg-warning"></div>
                   <div className="w-3 h-3 rounded-full bg-success"></div>
                 </div>
                 <div className="flex-1 p-xl md:p-xxl text-center flex flex-col justify-center items-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-brand/20 rounded-full blur-[80px]" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-[80px]" />
                   
                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-brand to-[#7C3AED] mb-lg shadow-lg relative z-10 border-4 border-[#1E293B]"></div>
                   <h1 className="text-display-sm font-display-sm mb-md relative z-10">Jane Doe</h1>
                   <p className="text-title-sm font-medium text-white/70 max-w-md leading-relaxed mb-xl relative z-10">Full Stack Engineer bridging the gap between design and scalable backend systems.</p>
                   <div className="flex flex-wrap justify-center gap-md relative z-10">
                     <button className="bg-white text-[#0F172A] border-none px-xl py-sm rounded-full font-black text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all">View Projects</button>
                     <button className="bg-transparent text-white border border-white/30 px-xl py-sm rounded-full font-black text-sm hover:bg-white/10 transition-colors">Download Resume</button>
                   </div>
                 </div>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
