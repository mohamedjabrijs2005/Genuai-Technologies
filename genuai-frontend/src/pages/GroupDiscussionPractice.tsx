import { useState, useEffect } from 'react';

interface Props { user: any; onBack: () => void; }

export default function GroupDiscussionPractice({ user, onBack }: Props) {
  const name = user?.user?.name || user?.name || 'Candidate';
  const [matchState, setMatchState] = useState<'lobby' | 'live' | 'feedback'>('lobby');

  // Simulate matchmaking delay
  useEffect(() => {
    if (matchState === 'lobby') {
      const timer = setTimeout(() => {
        setMatchState('live');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [matchState]);

  if (matchState === 'lobby') {
    return (
      <div className="h-screen bg-background quantum-gradient font-body-base flex flex-col items-center justify-center relative overflow-hidden">
         {/* Decorative */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-brand/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
         
         <div className="relative z-10 glass p-xxl rounded-xxxl shadow-lg border border-surface-container text-center max-w-md w-full mx-md animate-[fadeIn_0.5s_ease-out]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-brand to-[#7C3AED] mx-auto mb-lg flex items-center justify-center shadow-lg shadow-indigo-brand/30 animate-[pulse_2s_infinite]">
              <span className="material-symbols-outlined text-4xl text-white">groups</span>
            </div>
            <h2 className="text-title-lg font-black text-on-surface mb-sm">Finding Peers...</h2>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed mb-xl">We are matching you with 3 other candidates of similar GenuAI readiness score for your Group Discussion.</p>
            
            <div className="flex flex-col gap-sm mb-xl text-left">
              <div className="bg-surface-bright/50 p-sm rounded-xl border border-surface-container flex justify-between items-center">
                <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">forum</span> Topic</span>
                <span className="text-sm font-bold text-on-surface">Impact of GenAI</span>
              </div>
              <div className="bg-surface-bright/50 p-sm rounded-xl border border-surface-container flex justify-between items-center">
                <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">group_add</span> Peers Found</span>
                <span className="text-sm font-black text-indigo-brand">2 / 4</span>
              </div>
            </div>

            <button onClick={onBack} className="w-full py-md glass border border-surface-container text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container/50 transition-colors flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">cancel</span> Cancel Matchmaking
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0B1120] font-body-base text-white flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="relative z-10 bg-[#0F172A] border-b border-[#1E293B] px-xl h-20 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center gap-md">
          <div className="font-black text-lg text-white flex items-center gap-sm tracking-tight">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
            </span>
            Live Discussion Room
          </div>
          <div className="bg-[#1E293B] px-md py-1 rounded-lg text-xs font-bold text-slate-300 hidden md:block">
            Topic: Impact of Generative AI on Jobs
          </div>
        </div>
        <div className="flex gap-xl items-center">
          <div className="text-xl font-black text-warning font-mono tracking-wider">
            14:32
          </div>
          <button onClick={onBack} className="px-lg py-sm bg-error/10 text-error border border-error/20 rounded-xl font-bold text-sm hover:bg-error/20 transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">call_end</span> Leave Room
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Center: Video Grid */}
        <div className="flex-1 p-lg md:p-xl flex flex-col gap-lg bg-[#050814]">
           <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-lg flex-1">
              
              {/* Participant 1 (You) */}
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden relative border-2 border-info shadow-[0_0_30px_rgba(56,189,248,0.15)] group">
                <img src="/icons/cat_english.png" alt="You" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                <div className="absolute bottom-md left-md bg-black/60 backdrop-blur-md px-md py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-xs border border-white/10">
                  <span className="material-symbols-outlined text-info text-[16px]">mic</span> {name} (You)
                </div>
              </div>

              {/* Participant 2 */}
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden relative border border-[#1E293B] group">
                <img src="/icons/cat_logical.png" alt="Priya" className="w-full h-full object-cover opacity-40 mix-blend-screen" />
                <div className="absolute bottom-md left-md bg-black/60 backdrop-blur-md px-md py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-xs border border-white/10">
                  <span className="material-symbols-outlined text-error text-[16px]">mic_off</span> Priya (Backend Dev)
                </div>
              </div>

              {/* Participant 3 */}
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden relative border border-[#1E293B] group">
                <img src="/icons/learning_brain.png" alt="Rahul" className="w-full h-full object-cover opacity-40 mix-blend-screen" />
                <div className="absolute bottom-md left-md bg-black/60 backdrop-blur-md px-md py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-xs border border-white/10">
                  <span className="material-symbols-outlined text-error text-[16px]">mic_off</span> Rahul (Frontend Dev)
                </div>
              </div>

              {/* Participant 4 */}
              <div className="bg-[#0F172A] rounded-2xl overflow-hidden relative border border-[#1E293B] group">
                <img src="/icons/cat_automata.png" alt="Ananya" className="w-full h-full object-cover opacity-40 mix-blend-screen" />
                <div className="absolute bottom-md left-md bg-black/60 backdrop-blur-md px-md py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-xs border border-white/10">
                  <span className="material-symbols-outlined text-error text-[16px]">mic_off</span> Ananya (Data Science)
                </div>
              </div>

           </div>
           
           {/* Controls */}
           <div className="flex justify-center gap-md py-sm">
             <button className="w-14 h-14 rounded-full bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white flex items-center justify-center transition-colors shadow-lg">
                <span className="material-symbols-outlined text-2xl">mic</span>
             </button>
             <button className="w-14 h-14 rounded-full bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white flex items-center justify-center transition-colors shadow-lg">
                <span className="material-symbols-outlined text-2xl">videocam</span>
             </button>
             <button className="w-14 h-14 rounded-full bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white flex items-center justify-center transition-colors shadow-lg">
                <span className="material-symbols-outlined text-2xl">sentiment_satisfied</span>
             </button>
             <button className="w-14 h-14 rounded-full bg-error/20 hover:bg-error/30 border border-error/30 text-error flex items-center justify-center transition-colors shadow-lg ml-md hidden sm:flex">
                <span className="material-symbols-outlined text-2xl">call_end</span>
             </button>
           </div>
        </div>

        {/* Right Side: AI Analytics */}
        <div className="w-[320px] bg-[#0F172A] border-l border-[#1E293B] flex flex-col hidden lg:flex">
          <div className="p-lg border-b border-[#1E293B] flex items-center gap-sm">
             <div className="w-8 h-8 rounded-lg bg-indigo-brand/20 text-indigo-brand flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
             </div>
             <span className="text-sm font-black text-slate-200">AI Session Analytics</span>
          </div>
          
          <div className="flex-1 p-lg flex flex-col gap-xl overflow-y-auto custom-scrollbar">
            
            {/* Share of Voice */}
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-md flex items-center gap-xs">
                 <span className="material-symbols-outlined text-[16px]">pie_chart</span> Share of Voice
              </div>
              <div className="flex flex-col gap-md">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5">
                    <span>You</span>
                    <span className="text-info">42%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-info w-[42%] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5">
                    <span>Rahul</span>
                    <span className="text-warning">28%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-warning w-[28%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5">
                    <span>Priya</span>
                    <span className="text-success">18%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[18%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5">
                    <span>Ananya</span>
                    <span className="text-indigo-brand">12%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-brand w-[12%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Metrics */}
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-md flex items-center gap-xs">
                 <span className="material-symbols-outlined text-[16px]">analytics</span> Behavioral Tracker
              </div>
              <div className="flex flex-col gap-sm">
                <div className="bg-[#1E293B]/50 p-sm rounded-xl border border-[#334155] flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-300">Interruptions Made</span>
                  <span className="text-sm font-black text-warning">1</span>
                </div>
                <div className="bg-[#1E293B]/50 p-sm rounded-xl border border-[#334155] flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-300">Constructive Hooks</span>
                  <span className="text-sm font-black text-success">3</span>
                </div>
                <div className="bg-[#1E293B]/50 p-sm rounded-xl border border-[#334155] flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-300">Current Sentiment</span>
                  <span className="text-sm font-black text-info bg-info/10 px-xs py-0.5 rounded border border-info/20">Collaborative</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
