
import { useState } from 'react';

interface Props { user: any; onSelect: (path: 'practice' | 'search' | 'test' | 'career-profile') => void; onLogout: () => void; }

export default function PathSelection({ user, onSelect, onLogout }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const name = user?.user?.name || user?.name || 'Candidate';

  return (
    <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden">
      
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-brand/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="h-16 border-b border-surface-container/50 bg-surface/80 backdrop-blur-xl px-margin-mobile md:px-margin-desktop flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-sm">
          <img src="/logo.png" alt="GenuAI" className="w-11 h-11 object-contain gold-glow-subtle" />
          <div className="hidden sm:block">
            <div className="font-headline-md text-on-surface text-[16px] leading-tight">GenuAI Technologies</div>
            <div className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest">Recruitment Intelligence</div>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-brand to-indigo-brand-dark flex items-center justify-center text-white font-bold text-sm shadow-sm">{name[0]?.toUpperCase()}</div>
          <div className="text-sm font-bold text-on-surface hidden sm:block">{name}</div>
          <button onClick={onLogout} className="px-sm py-[6px] border border-error-crimson/30 text-error-crimson rounded-lg font-bold text-xs hover:bg-error-crimson/10 transition-colors ml-sm">Logout</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-[960px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10">
        <div className="text-center mb-xl animate-[fadeIn_0.5s_ease]">
          <div className="inline-flex items-center gap-2 bg-indigo-brand/10 border border-indigo-brand/20 rounded-full px-sm py-[6px] mb-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-brand animate-pulse"></span>
            <span className="text-[11px] font-bold text-indigo-brand uppercase tracking-wider">Welcome, {name}</span>
          </div>
          <h1 className="text-display-md font-display-md text-on-surface mb-xs hero-title-weight">Choose Your Path</h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed">Select how you'd like to use the GenuAI platform today.</p>
        </div>

        {/* Cards — 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

          {/* 1. Practice Path */}
          <div
            onMouseEnter={() => setHovered('practice')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('practice')}
            className={`glass p-lg rounded-[24px] cursor-pointer transition-all duration-300 transform ${hovered === 'practice' ? '-translate-y-2 ring-2 ring-indigo-brand/50 shadow-2xl bg-indigo-brand/5' : 'hover:shadow-xl border border-surface-container'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-md transition-colors ${hovered === 'practice' ? 'bg-indigo-brand text-white shadow-lg shadow-indigo-brand/30' : 'bg-surface-bright text-indigo-brand border border-surface-container'}`}>
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-xs">Practice Path</h2>
            <p className="text-body-base text-on-surface-variant mb-md leading-relaxed min-h-[48px]">Build skills at your own pace with AI-powered tools, mock interviews, and inclusive learning.</p>
            
            <div className="flex flex-col gap-xs mb-lg">
              {[
                {text: 'AI Mock Interview', icon: 'smart_toy'},
                {text: 'Skill Practice', icon: 'code'},
                {text: 'Resume Builder', icon: 'description'},
                {text: 'Progress Tracker', icon: 'monitoring'}
              ].map((item, i) => (
                <div key={i} className={`rounded-lg px-sm py-2 text-sm font-bold flex items-center gap-sm transition-colors ${hovered === 'practice' ? 'bg-white/60 text-indigo-brand' : 'bg-surface-bright text-on-surface-variant border border-surface-container/50'}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-sm mt-auto">
              <div className={`flex-1 h-[2px] transition-colors ${hovered === 'practice' ? 'bg-indigo-brand/30' : 'bg-surface-container'}`} />
              <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${hovered === 'practice' ? 'text-indigo-brand' : 'text-on-surface-variant'}`}>
                Start Learning <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* 2. Search Path */}
          <div
            onMouseEnter={() => setHovered('search')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('search')}
            className={`glass p-lg rounded-[24px] cursor-pointer transition-all duration-300 transform ${hovered === 'search' ? '-translate-y-2 ring-2 ring-accent-gold/50 shadow-2xl bg-accent-gold/5' : 'hover:shadow-xl border border-surface-container'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-md transition-colors ${hovered === 'search' ? 'bg-accent-gold text-on-tertiary shadow-lg shadow-accent-gold/30' : 'bg-surface-bright text-accent-gold border border-surface-container'}`}>
              <span className="material-symbols-outlined text-3xl">public</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-xs">Search Hub</h2>
            <p className="text-body-base text-on-surface-variant mb-md leading-relaxed min-h-[48px]">Explore jobs, connect with professionals, participate in hackathons, and follow tech news.</p>
            
            <div className="flex flex-col gap-xs mb-lg">
              {[
                {text: 'Professional Network', icon: 'hub'},
                {text: 'Global Job Board', icon: 'work'},
                {text: 'Competitions & Events', icon: 'emoji_events'},
                {text: 'Instant Connect', icon: 'forum'}
              ].map((item, i) => (
                <div key={i} className={`rounded-lg px-sm py-2 text-sm font-bold flex items-center gap-sm transition-colors ${hovered === 'search' ? 'bg-white/60 text-accent-gold' : 'bg-surface-bright text-on-surface-variant border border-surface-container/50'}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-sm mt-auto">
              <div className={`flex-1 h-[2px] transition-colors ${hovered === 'search' ? 'bg-accent-gold/30' : 'bg-surface-container'}`} />
              <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${hovered === 'search' ? 'text-accent-gold' : 'text-on-surface-variant'}`}>
                Enter Search Hub <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* 3. Assessment Test */}
          <div
            onMouseEnter={() => setHovered('test')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('test')}
            className={`glass p-lg rounded-[24px] cursor-pointer transition-all duration-300 transform ${hovered === 'test' ? '-translate-y-2 ring-2 ring-success-emerald/50 shadow-2xl bg-success-emerald/5' : 'hover:shadow-xl border border-surface-container'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-md transition-colors ${hovered === 'test' ? 'bg-success-emerald text-white shadow-lg shadow-success-emerald/30' : 'bg-surface-bright text-success-emerald border border-surface-container'}`}>
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-xs">Assessment Test</h2>
            <p className="text-body-base text-on-surface-variant mb-md leading-relaxed min-h-[48px]">Take the official GenuAI recruitment assessment — timed, proctored, and evaluated by AI.</p>
            
            <div className="flex flex-col gap-xs mb-lg">
              {[
                {text: 'Verified Identity', icon: 'verified_user'},
                {text: 'GenuAI Skill Test', icon: 'quiz'},
                {text: 'SVAR Verbal', icon: 'record_voice_over'},
                {text: 'AI Interview', icon: 'videocam'}
              ].map((item, i) => (
                <div key={i} className={`rounded-lg px-sm py-2 text-sm font-bold flex items-center gap-sm transition-colors ${hovered === 'test' ? 'bg-white/60 text-success-emerald' : 'bg-surface-bright text-on-surface-variant border border-surface-container/50'}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-sm mt-auto">
              <div className={`flex-1 h-[2px] transition-colors ${hovered === 'test' ? 'bg-success-emerald/30' : 'bg-surface-container'}`} />
              <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${hovered === 'test' ? 'text-success-emerald' : 'text-on-surface-variant'}`}>
                Begin Assessment <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </div>

          {/* 4. Career Profile Hub */}
          <div
            onMouseEnter={() => setHovered('career')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect('career-profile')}
            className={`glass p-lg rounded-[24px] cursor-pointer transition-all duration-300 transform ${hovered === 'career' ? '-translate-y-2 ring-2 ring-indigo-brand-dark/50 shadow-2xl bg-indigo-brand-dark/5' : 'hover:shadow-xl border border-surface-container'}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-md transition-colors ${hovered === 'career' ? 'bg-indigo-brand-dark text-white shadow-lg shadow-indigo-brand-dark/30' : 'bg-surface-bright text-indigo-brand-dark border border-surface-container'}`}>
              <span className="material-symbols-outlined text-3xl">badge</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-xs">Career Profile Hub</h2>
            <p className="text-body-base text-on-surface-variant mb-md leading-relaxed min-h-[48px]">Build and manage your professional identity with AI-optimized resumes and portfolio manager.</p>
            
            <div className="flex flex-col gap-xs mb-lg">
              {[
                {text: 'AI Resume Builder', icon: 'document_scanner'},
                {text: 'Cover Letter Gen', icon: 'edit_document'},
                {text: 'Portfolio Manager', icon: 'folder_special'},
                {text: 'ATS Optimization', icon: 'query_stats'}
              ].map((item, i) => (
                <div key={i} className={`rounded-lg px-sm py-2 text-sm font-bold flex items-center gap-sm transition-colors ${hovered === 'career' ? 'bg-white/60 text-indigo-brand-dark' : 'bg-surface-bright text-on-surface-variant border border-surface-container/50'}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-sm mt-auto">
              <div className={`flex-1 h-[2px] transition-colors ${hovered === 'career' ? 'bg-indigo-brand-dark/30' : 'bg-surface-container'}`} />
              <span className={`text-sm font-bold flex items-center gap-1 transition-colors ${hovered === 'career' ? 'text-indigo-brand-dark' : 'text-on-surface-variant'}`}>
                Manage Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </span>
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-xl">
          © 2026 GenuAI Technologies · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
