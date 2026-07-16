import { useState } from 'react';

interface Props { user: any; role: string; onComplete: (data: any) => void; }

export default function Module6_GroupDiscussion({ user, role, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [topic] = useState("Impact of AI on Modern Software Engineering Roles");
  
  const participants = [
    { name: user?.user?.name || user?.name || "You", role: role, isSpeaking: true, self: true, avatar: "👤" },
    { name: "Arjun Desai", role: "AI Engineer", isSpeaking: false, self: false, avatar: "🧑‍💻" },
    { name: "Priya Sharma", role: "Product Manager", isSpeaking: false, self: false, avatar: "👩‍💼" },
    { name: "Rohan Patel", role: "DevOps Engineer", isSpeaking: false, self: false, avatar: "👨‍💻" }
  ];

  return (
    <div className="h-screen bg-background quantum-gradient flex flex-col relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="glass border-b border-surface-container flex justify-between items-center p-sm px-lg shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-sm">
          <span className="text-3xl drop-shadow-md">🗣️</span>
          <div>
            <div className="text-on-surface font-bold text-sm">Live Group Discussion</div>
            <div className="text-on-surface-variant text-xs font-semibold">Virtual Room • {participants.length} Participants</div>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className="bg-error/10 border border-error/30 text-error px-md py-xs rounded-xl flex items-center gap-xs font-bold text-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-error" /> Live
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden z-10 p-md md:p-xl gap-md flex-col md:flex-row">
        {/* Main Room View */}
        <div className="flex-1 glass rounded-3xl border border-surface-container shadow-sm flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease]">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] p-md flex items-center gap-sm shadow-inner z-10 relative">
            <span className="material-symbols-outlined text-white">gavel</span>
            <div>
              <div className="text-white/80 text-xs font-bold uppercase tracking-wider">Discussion Topic</div>
              <div className="text-white font-black text-sm">{topic}</div>
            </div>
          </div>
          
          <div className="flex-1 p-md grid grid-cols-2 gap-md bg-black/5 custom-scrollbar overflow-y-auto">
            {participants.map((p, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center transition-all ${p.isSpeaking ? 'border-2 border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-[1.02]' : 'border border-surface-container bg-surface-bright/50'}`}>
                {/* Simulated Webcam Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-container/20 to-black/20" />
                
                {/* Avatar */}
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-surface-bright z-10 relative">
                  {p.avatar}
                  {p.isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-success text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">mic</span>
                    </div>
                  )}
                </div>
                
                {/* Name Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                  <div className="bg-black/60 backdrop-blur-md px-sm py-1 rounded-lg text-white font-bold text-xs flex flex-col">
                    <span>{p.name} {p.self && '(You)'}</span>
                    <span className="text-white/70 text-[10px] uppercase tracking-wider">{p.role}</span>
                  </div>
                  {!p.isSpeaking && (
                    <div className="bg-black/60 backdrop-blur-md w-6 h-6 rounded-full flex items-center justify-center text-white/50">
                      <span className="material-symbols-outlined text-[14px]">mic_off</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Controls */}
          <div className="bg-surface-bright border-t border-surface-container p-md flex justify-center gap-md relative z-10">
            <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface">
              <span className="material-symbols-outlined">mic_off</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface">
              <span className="material-symbols-outlined">videocam_off</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface">
              <span className="material-symbols-outlined">present_to_all</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface">
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 glass rounded-3xl border border-surface-container shadow-sm flex flex-col shrink-0">
          <div className="p-md border-b border-surface-container">
            <div className="text-on-surface font-black text-sm">Action Panel</div>
            <div className="text-on-surface-variant text-xs">Simulated Environment</div>
          </div>
          
          <div className="p-md flex-1 overflow-y-auto">
            <div className="bg-indigo-brand/5 border border-indigo-brand/20 rounded-2xl p-md mb-md">
              <p className="text-indigo-brand font-bold text-xs leading-relaxed mb-0">
                In a real assessment, this module connects you to a live peer-to-peer room using WebRTC to evaluate teamwork, communication, and leadership skills.
              </p>
            </div>
            
            <div className="bg-warning/5 border border-warning/20 rounded-2xl p-md">
              <div className="text-warning-dark font-black text-xs uppercase tracking-wider mb-2">Evaluation Criteria</div>
              <ul className="text-on-surface-variant text-xs space-y-2 font-medium">
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-warning text-sm">check_circle</span> Communication Clarity</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-warning text-sm">check_circle</span> Active Listening</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-warning text-sm">check_circle</span> Logical Argumentation</li>
                <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-warning text-sm">check_circle</span> Leadership & Empathy</li>
              </ul>
            </div>
          </div>
          
          <div className="p-md bg-surface-bright border-t border-surface-container rounded-b-3xl">
            <button onClick={() => {
              setLoading(true);
              setTimeout(() => onComplete({ overall: 85, feedback: 'Great communication and teamwork.' }), 1000);
            }}
            disabled={loading}
            className={`w-full py-md rounded-xl font-bold text-body-base transition-all flex justify-center items-center gap-sm ${loading ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white hover:shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.02]'}`}>
              {loading ? "Processing..." : "Complete Discussion ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
