import { useState, useEffect } from 'react';

interface Props { user: any; onBack: () => void; }

export default function GroupDiscussionPractice({ user, onBack }: Props) {
  const name = user?.user?.name || user?.name || 'Candidate';
  const [matchState, setMatchState] = useState<'lobby' | 'live' | 'feedback'>('lobby');
  const [message, setMessage] = useState('');

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
      <div style={{ height:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', sans-serif" }}>
         <div style={{ background:'#fff', padding:'48px', borderRadius:'24px', boxShadow:'0 12px 32px rgba(0,0,0,0.05)', textAlign:'center', maxWidth:'400px', width:'100%' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 2s infinite' }}>
              <span style={{ fontSize:'32px', color:'#fff' }}>👥</span>
            </div>
            <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0F172A', margin:'0 0 12px' }}>Finding Peers...</h2>
            <p style={{ fontSize:'14px', color:'#64748B', lineHeight:'1.6', margin:'0 0 32px' }}>We are matching you with 3 other candidates of similar GenuAI readiness score for your Group Discussion.</p>
            
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' }}>
              <div style={{ background:'#F1F5F9', padding:'12px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', color:'#475569', fontWeight:'600' }}>Topic</span>
                <span style={{ fontSize:'13px', color:'#0F172A', fontWeight:'700' }}>Impact of GenAI</span>
              </div>
              <div style={{ background:'#F1F5F9', padding:'12px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', color:'#475569', fontWeight:'600' }}>Peers Found</span>
                <span style={{ fontSize:'13px', color:'#2563EB', fontWeight:'700' }}>2 / 4</span>
              </div>
            </div>

            <button onClick={onBack} style={{ background:'transparent', border:'1px solid #E2E8F0', color:'#64748B', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:'700', fontSize:"14px", width:'100%' }}>
              Cancel Matchmaking
            </button>
         </div>
      </div>
    );
  }

  return (
    <div style={{ height:'100vh', background:'#1E293B', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#0F172A', color:'#fff', padding:'0 32px', height:"72px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, borderBottom:'1px solid #334155' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"900", fontSize:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ background:'#EF4444', width:'10px', height:'10px', borderRadius:'50%' }}></span> 
            Live Discussion Room
          </div>
          <div style={{ background:"#334155", padding:"6px 16px", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#E2E8F0" }}>
            Topic: Impact of Generative AI on Jobs
          </div>
        </div>
        <div style={{ display:'flex', gap:'24px', alignItems:'center' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color:'#F59E0B', fontVariantNumeric:'tabular-nums' }}>
            14:32
          </div>
          <button onClick={onBack} style={{ background:'#EF4444', border:'none', color:'#fff', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:"13px" }}>
            Leave Room
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        
        {/* Center: Video Grid */}
        <div style={{ flex:1, padding:'24px', display:'flex', flexDirection:'column', gap:'24px' }}>
           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'24px', flex:1 }}>
              
              {/* Participant 1 (You) */}
              <div style={{ background:'#0F172A', borderRadius:'16px', overflow:'hidden', position:'relative', border:'2px solid #38BDF8', boxShadow:'0 0 20px rgba(56,189,248,0.2)' }}>
                <img src="/icons/cat_english.png" alt="You" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.8 }} />
                <div style={{ position:'absolute', bottom:'16px', left:'16px', background:'rgba(15,23,42,0.8)', backdropFilter:'blur(4px)', padding:'6px 16px', borderRadius:'24px', color:'#fff', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color:'#38BDF8' }}>🎙️</span> {name} (You)
                </div>
              </div>

              {/* Participant 2 */}
              <div style={{ background:'#0F172A', borderRadius:'16px', overflow:'hidden', position:'relative', border:'1px solid #334155' }}>
                <img src="/icons/cat_logical.png" alt="Priya" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />
                <div style={{ position:'absolute', bottom:'16px', left:'16px', background:'rgba(15,23,42,0.8)', backdropFilter:'blur(4px)', padding:'6px 16px', borderRadius:'24px', color:'#fff', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color:'#EF4444' }}>🔇</span> Priya (Backend Dev)
                </div>
              </div>

              {/* Participant 3 */}
              <div style={{ background:'#0F172A', borderRadius:'16px', overflow:'hidden', position:'relative', border:'1px solid #334155' }}>
                <img src="/icons/learning_brain.png" alt="Rahul" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />
                <div style={{ position:'absolute', bottom:'16px', left:'16px', background:'rgba(15,23,42,0.8)', backdropFilter:'blur(4px)', padding:'6px 16px', borderRadius:'24px', color:'#fff', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color:'#EF4444' }}>🔇</span> Rahul (Frontend Dev)
                </div>
              </div>

              {/* Participant 4 */}
              <div style={{ background:'#0F172A', borderRadius:'16px', overflow:'hidden', position:'relative', border:'1px solid #334155' }}>
                <img src="/icons/cat_automata.png" alt="Ananya" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />
                <div style={{ position:'absolute', bottom:'16px', left:'16px', background:'rgba(15,23,42,0.8)', backdropFilter:'blur(4px)', padding:'6px 16px', borderRadius:'24px', color:'#fff', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ color:'#EF4444' }}>🔇</span> Ananya (Data Science)
                </div>
              </div>

           </div>
           
           {/* Controls */}
           <div style={{ display:'flex', justifyContent:'center', gap:'16px' }}>
             <button style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#334155', border:'none', color:'#fff', fontSize:'20px', cursor:'pointer' }}>🎤</button>
             <button style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#334155', border:'none', color:'#fff', fontSize:'20px', cursor:'pointer' }}>📹</button>
             <button style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#334155', border:'none', color:'#fff', fontSize:'20px', cursor:'pointer' }}>😊</button>
           </div>
        </div>

        {/* Right Side: AI Analytics */}
        <div style={{ width:'320px', background:'#0F172A', borderLeft:'1px solid #334155', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'20px', borderBottom:'1px solid #334155' }}>
            <div style={{ fontSize:'14px', fontWeight:'800', color:'#F8FAFC', display:'flex', alignItems:'center', gap:'8px' }}>
              <span>🤖</span> AI Session Analytics
            </div>
          </div>
          
          <div style={{ flex:1, padding:'24px', display:'flex', flexDirection:'column', gap:'32px', overflowY:'auto' }}>
            
            {/* Share of Voice */}
            <div>
              <div style={{ fontSize:'13px', color:'#94A3B8', fontWeight:'700', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>Share of Voice</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#E2E8F0', marginBottom:'6px', fontWeight:'600' }}>
                    <span>You</span>
                    <span>42%</span>
                  </div>
                  <div style={{ height:'6px', background:'#334155', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'#38BDF8', width:'42%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#E2E8F0', marginBottom:'6px', fontWeight:'600' }}>
                    <span>Rahul</span>
                    <span>28%</span>
                  </div>
                  <div style={{ height:'6px', background:'#334155', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'#F59E0B', width:'28%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#E2E8F0', marginBottom:'6px', fontWeight:'600' }}>
                    <span>Priya</span>
                    <span>18%</span>
                  </div>
                  <div style={{ height:'6px', background:'#334155', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'#10B981', width:'18%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#E2E8F0', marginBottom:'6px', fontWeight:'600' }}>
                    <span>Ananya</span>
                    <span>12%</span>
                  </div>
                  <div style={{ height:'6px', background:'#334155', borderRadius:'4px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'#8B5CF6', width:'12%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Metrics */}
            <div>
              <div style={{ fontSize:'13px', color:'#94A3B8', fontWeight:'700', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>Behavioral Tracker</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ background:'#1E293B', padding:'12px 16px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'13px', color:'#E2E8F0' }}>Interruptions Made</span>
                  <span style={{ fontSize:'14px', fontWeight:'800', color:'#F59E0B' }}>1</span>
                </div>
                <div style={{ background:'#1E293B', padding:'12px 16px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'13px', color:'#E2E8F0' }}>Constructive Hooks</span>
                  <span style={{ fontSize:'14px', fontWeight:'800', color:'#10B981' }}>3</span>
                </div>
                <div style={{ background:'#1E293B', padding:'12px 16px', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'13px', color:'#E2E8F0' }}>Current Sentiment</span>
                  <span style={{ fontSize:'14px', fontWeight:'800', color:'#38BDF8' }}>Collaborative</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
