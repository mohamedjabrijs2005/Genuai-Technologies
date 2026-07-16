interface Props { user: any; onStartTest: () => void; }

const MODULES = [
  { imgSrc:'/icons/resume_gen.png', title:'Profile & Resume', desc:'AI resume analysis, ATS scoring, skill extraction', color:'#2563EB' },
  { imgSrc:'/icons/skill_test.png', title:'GenuAI Skill Test', desc:'Coding, Aptitude, English & Automata — timed', color:'#7C3AED' },
  { imgSrc:'/icons/svar_mic.png', title:'SVAR Verbal Test', desc:'Speaking, listening, fluency — proctored', color:'#DC2626' },
  { imgSrc:'/icons/icon_hackathon.png', title:'Hackathon Challenge', desc:'Real-world problem solving with code submission', color:'#059669' },
  { imgSrc:'/icons/ai_mock_interview.png', title:'AI Interview', desc:'Live interview with AI scoring on 10+ parameters', color:'#0891B2' },
  { imgSrc:'/icons/learning_brain.png', title:'Group Discussion', desc:'Collaborative problem solving and communication', color:'#8B5CF6' },
  { imgSrc:'/icons/cat_logical.png', title:'Final Results', desc:'Comprehensive scorecard shared with company HR', color:'#D97706' },
];



export default function CompanyOverview({ user, onStartTest }: Props) {
  const name = user?.user?.name || user?.name || 'Candidate';

  return (
    <div className="min-h-screen bg-background font-body-base text-on-background relative overflow-hidden">
      
      {/* Decorative background orbs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-brand/5 blur-[120px] rounded-full pointer-events-none" />

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
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="quantum-gradient py-xxl px-margin-mobile md:px-margin-desktop text-center relative z-10 border-b border-surface-container/50 shadow-sm">
        <div className="w-24 h-24 mx-auto mb-md relative group">
          <div className="absolute -inset-4 bg-accent-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <img src="/logo.png" alt="GenuAI" className="relative w-full h-full object-contain gold-glow-subtle transition-transform duration-700 group-hover:scale-105" />
        </div>
        <h1 className="text-display-md font-display-md text-on-surface mb-xs hero-title-weight">GenuAI Technologies</h1>
        <p className="text-headline-sm font-headline-sm text-accent-gold mb-sm drop-shadow-sm">AI-Powered Recruitment Intelligence Platform</p>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          We transform traditional hiring by evaluating candidates across seven dimensions — skills, communication, problem-solving, aptitude, collaboration, and personality — all powered by cutting-edge AI.
        </p>
      </div>

      {/* Assessment Modules */}
      <div className="max-w-[1000px] mx-auto px-margin-mobile md:px-margin-desktop py-xl relative z-10">
        <div className="text-center mb-xl animate-[fadeIn_0.5s_ease]">
          <div className="inline-flex items-center gap-2 bg-indigo-brand/10 border border-indigo-brand/20 rounded-full px-sm py-[6px] mb-md shadow-sm">
            <span className="text-[11px] font-bold text-indigo-brand uppercase tracking-widest">ASSESSMENT PIPELINE</span>
          </div>
          <h2 className="text-display-sm font-display-sm text-on-surface mb-xs">Your 7-Module Journey</h2>
          <p className="text-body-base text-on-surface-variant">Each module is carefully designed to evaluate a different competency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
          {MODULES.map((m,i)=>(
            <div key={i} className="glass p-md rounded-xl border border-surface-container flex gap-md items-start hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: `${m.color}15`, borderColor: `${m.color}33`, color: m.color }}>
                 <span className="material-symbols-outlined text-[24px]">
                    {i === 0 ? 'document_scanner' : 
                     i === 1 ? 'quiz' : 
                     i === 2 ? 'record_voice_over' : 
                     i === 3 ? 'terminal' : 
                     i === 4 ? 'videocam' : 
                     i === 5 ? 'groups' : 'military_tech'}
                 </span>
              </div>
              <div>
                <div className="flex items-center gap-xs mb-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${m.color}15`, color: m.color }}>Step {i+1}</span>
                </div>
                <div className="font-bold text-on-surface text-sm mb-1">{m.title}</div>
                <div className="text-on-surface-variant text-xs leading-relaxed">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules box */}
        <div className="glass-gold p-lg rounded-2xl border border-accent-gold/30 mb-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-accent-gold/10">
            <span className="material-symbols-outlined text-[150px]">gavel</span>
          </div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-gold">rule</span>
            Assessment Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm relative z-10">
            {[
              { text: 'Stable internet connection required', pass: true },
              { text: 'Laptop/desktop with camera and mic', pass: true },
              { text: 'Quiet, well-lit environment', pass: true },
              { text: 'Valid resume in PDF/DOC format', pass: true },
              { text: 'No tab switching during test', pass: false },
              { text: 'No mobile phone visible on camera', pass: false },
              { text: 'No additional persons in frame', pass: false },
              { text: 'Session auto-terminates on 3 violations', pass: false },
            ].map((r,i)=>(
              <div key={i} className="bg-surface-bright rounded-lg p-sm text-sm font-bold flex items-center gap-sm border border-surface-container/50">
                <span className={`material-symbols-outlined text-[18px] ${r.pass ? 'text-success-emerald' : 'text-error-crimson'}`}>
                  {r.pass ? 'check_circle' : 'cancel'}
                </span>
                <span className="text-on-surface-variant">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-[fadeIn_0.5s_ease_0.2s_both]">
          <div className="text-sm font-bold text-on-surface-variant mb-md">You have read and understood all the rules. Ready to begin?</div>
          <button
            onClick={onStartTest}
            className="gradient-button px-xl py-md rounded-xl font-bold text-white shadow-xl shadow-indigo-brand/30 hover:-translate-y-1 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
               Begin Official Assessment
               <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </button>
          <div className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-lg">
            © 2025 GenuAI Technologies · All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}
