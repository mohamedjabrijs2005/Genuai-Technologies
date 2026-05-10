import { useState, useCallback } from "react";

interface Props { onVerified: () => void; }

const CATEGORIES = [
  { key: "lorry",  label: "Lorry",   plural: "Lorries",  emoji: "🚛" },
  { key: "car",    label: "Car",     plural: "Cars",     emoji: "🚗" },
  { key: "bike",   label: "Bike",    plural: "Bikes",    emoji: "🏍️" },
  { key: "house",  label: "House",   plural: "Houses",   emoji: "🏠" },
  { key: "bridge", label: "Bridge",  plural: "Bridges",  emoji: "🌉" },
  { key: "bus",    label: "Bus",     plural: "Buses",    emoji: "🚌" },
];

// Real photos via loremflickr (keyword-based, consistent with lock ID)
const POOL: { id: string; url: string; cat: string }[] = [
  // Lorries / Trucks
  { id:"l1", cat:"lorry",  url:"https://loremflickr.com/180/180/lorry,truck?lock=11" },
  { id:"l2", cat:"lorry",  url:"https://loremflickr.com/180/180/lorry,truck?lock=12" },
  { id:"l3", cat:"lorry",  url:"https://loremflickr.com/180/180/semi,truck?lock=13" },
  { id:"l4", cat:"lorry",  url:"https://loremflickr.com/180/180/cargo,truck?lock=14" },
  { id:"l5", cat:"lorry",  url:"https://loremflickr.com/180/180/lorry,truck?lock=15" },
  // Cars
  { id:"c1", cat:"car",    url:"https://loremflickr.com/180/180/car,automobile?lock=21" },
  { id:"c2", cat:"car",    url:"https://loremflickr.com/180/180/sedan,car?lock=22" },
  { id:"c3", cat:"car",    url:"https://loremflickr.com/180/180/sports,car?lock=23" },
  { id:"c4", cat:"car",    url:"https://loremflickr.com/180/180/car,vehicle?lock=24" },
  { id:"c5", cat:"car",    url:"https://loremflickr.com/180/180/automobile?lock=25" },
  // Bikes / Motorcycles
  { id:"b1", cat:"bike",   url:"https://loremflickr.com/180/180/motorcycle?lock=31" },
  { id:"b2", cat:"bike",   url:"https://loremflickr.com/180/180/motorbike?lock=32" },
  { id:"b3", cat:"bike",   url:"https://loremflickr.com/180/180/motorcycle,bike?lock=33" },
  { id:"b4", cat:"bike",   url:"https://loremflickr.com/180/180/harley,motorcycle?lock=34" },
  // Houses
  { id:"h1", cat:"house",  url:"https://loremflickr.com/180/180/house,home?lock=41" },
  { id:"h2", cat:"house",  url:"https://loremflickr.com/180/180/suburban,house?lock=42" },
  { id:"h3", cat:"house",  url:"https://loremflickr.com/180/180/cottage,house?lock=43" },
  { id:"h4", cat:"house",  url:"https://loremflickr.com/180/180/residential,home?lock=44" },
  // Bridges
  { id:"br1", cat:"bridge", url:"https://loremflickr.com/180/180/bridge?lock=51" },
  { id:"br2", cat:"bridge", url:"https://loremflickr.com/180/180/suspension,bridge?lock=52" },
  { id:"br3", cat:"bridge", url:"https://loremflickr.com/180/180/river,bridge?lock=53" },
  { id:"br4", cat:"bridge", url:"https://loremflickr.com/180/180/arch,bridge?lock=54" },
  // Buses
  { id:"bu1", cat:"bus",   url:"https://loremflickr.com/180/180/city,bus?lock=61" },
  { id:"bu2", cat:"bus",   url:"https://loremflickr.com/180/180/double,decker,bus?lock=62" },
  { id:"bu3", cat:"bus",   url:"https://loremflickr.com/180/180/transit,bus?lock=63" },
  { id:"bu4", cat:"bus",   url:"https://loremflickr.com/180/180/coach,bus?lock=64" },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function makeChallenge() {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const targets = shuffle(POOL.filter(p => p.cat === cat.key)).slice(0, 3);
  const others  = shuffle(POOL.filter(p => p.cat !== cat.key)).slice(0, 6);
  const grid = shuffle([...targets, ...others]);
  return { cat, grid, correctIds: new Set(targets.map(t => t.id)) };
}

export default function RobotVerification({ onVerified }: Props) {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [status, setStatus]       = useState<"idle"|"wrong"|"success">("idle");
  const [attempts, setAttempts]   = useState(0);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setStatus("idle");
  };

  const verify = () => {
    const { correctIds } = challenge;
    const allCorrectSelected = [...correctIds].every(id => selected.has(id));
    const noWrongSelected = [...selected].every(id => correctIds.has(id));
    if (allCorrectSelected && noWrongSelected && selected.size > 0) {
      setStatus("success");
      setTimeout(() => onVerified(), 900);
    } else {
      setAttempts(a => a + 1);
      setStatus("wrong");
      setTimeout(() => {
        setChallenge(makeChallenge());
        setSelected(new Set());
        setStatus("idle");
      }, 1200);
    }
  };

  const refresh = useCallback(() => {
    setChallenge(makeChallenge());
    setSelected(new Set());
    setStatus("idle");
  }, []);

  const { cat, grid } = challenge;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0F172A 0%,#1E3A8A 50%,#2563EB 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"20px" }}>
      {/* blobs */}
      <div style={{ position:"fixed", top:"-100px", right:"-100px", width:"400px", height:"400px", borderRadius:"50%", background:"rgba(124,58,237,0.15)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-100px", left:"-80px", width:"350px", height:"350px", borderRadius:"50%", background:"rgba(37,99,235,0.2)", pointerEvents:"none" }} />

      <div style={{ background:"#fff", borderRadius:"16px", overflow:"hidden", boxShadow:"0 25px 60px rgba(0,0,0,0.35)", maxWidth:"420px", width:"100%", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#2563EB,#7C3AED)", padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"8px", overflow:"hidden", flexShrink:0 }}>
            <img src="/logo.png" alt="GenuAI" style={{ width:"32px", height:"32px", objectFit:"cover" }} />
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:"800", fontSize:"14px" }}>GenuAI Technologies</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"10px" }}>Identity Verification</div>
          </div>
          <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.15)", borderRadius:"20px", padding:"4px 10px", color:"#fff", fontSize:"10px", fontWeight:"600" }}>🔒 Secure</div>
        </div>

        {/* Challenge prompt */}
        <div style={{ background:"#F8FAFC", borderBottom:"1px solid #E2E8F0", padding:"12px 16px" }}>
          <div style={{ fontSize:"12px", color:"#64748B", fontWeight:"600", marginBottom:"2px" }}>Select all images with a</div>
          <div style={{ fontSize:"18px", fontWeight:"900", color:"#1E293B" }}>
            {cat.emoji} {cat.label}
          </div>
          <div style={{ fontSize:"11px", color:"#94A3B8", marginTop:"2px" }}>Click all matching squares, then click verify</div>
        </div>

        {/* Image Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"2px", padding:"2px", background:"#E2E8F0" }}>
          {grid.map(img => {
            const isSel = selected.has(img.id);
            return (
              <div key={img.id} onClick={() => toggle(img.id)} style={{ position:"relative", aspectRatio:"1", cursor:"pointer", overflow:"hidden", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#94A3B8", fontSize:"20px", zIndex:0 }}>⏳</div>
                <img src={img.url} alt="" crossOrigin="anonymous" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", position:"relative", zIndex:1, filter: isSel ? "brightness(0.7)" : "brightness(1)", transition:"filter 0.15s" }} loading="lazy" />
                {isSel && (
                  <div style={{ position:"absolute", inset:0, border:"3px solid #2563EB", boxSizing:"border-box" }}>
                    <div style={{ position:"absolute", bottom:"6px", right:"6px", width:"26px", height:"26px", borderRadius:"50%", background:"#2563EB", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"#fff", fontSize:"14px", fontWeight:"900" }}>✓</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        {status === "wrong" && (
          <div style={{ background:"#FEF2F2", borderTop:"1px solid #FECACA", padding:"10px 20px", color:"#DC2626", fontSize:"13px", fontWeight:"600", textAlign:"center" }}>
            ❌ Incorrect — please try again
          </div>
        )}
        {status === "success" && (
          <div style={{ background:"#F0FDF4", borderTop:"1px solid #BBF7D0", padding:"10px 20px", color:"#16A34A", fontSize:"13px", fontWeight:"600", textAlign:"center" }}>
            ✅ Verified! Continuing…
          </div>
        )}

        {/* Footer controls */}
        <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:"10px", borderTop:"1px solid #E2E8F0", background:"#FAFAFA" }}>
          <button onClick={refresh} title="New challenge" style={{ width:"36px", height:"36px", border:"1.5px solid #E2E8F0", borderRadius:"50%", background:"#fff", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center" }}>🔄</button>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:"6px" }}>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="" style={{ width:"28px", height:"28px" }} />
            <div>
              <div style={{ fontSize:"10px", fontWeight:"700", color:"#64748B" }}>GenuAI CAPTCHA</div>
              <div style={{ fontSize:"9px", color:"#94A3B8" }}>Privacy · Terms</div>
            </div>
          </div>
          <button onClick={verify} disabled={selected.size === 0 || status === "success"}
            style={{ padding:"10px 24px", background: selected.size > 0 ? "linear-gradient(135deg,#2563EB,#7C3AED)" : "#E2E8F0", color: selected.size > 0 ? "#fff" : "#94A3B8", border:"none", borderRadius:"8px", fontWeight:"800", fontSize:"14px", cursor: selected.size > 0 ? "pointer" : "not-allowed", boxShadow: selected.size > 0 ? "0 4px 14px rgba(37,99,235,0.35)" : "none", transition:"all 0.2s" }}>
            Verify
          </button>
        </div>

        {attempts > 1 && (
          <div style={{ padding:"8px 16px", background:"#FFFBEB", borderTop:"1px solid #FDE68A", textAlign:"center", fontSize:"11px", color:"#92400E" }}>
            ⚠️ {attempts} failed attempts — Please select all matching images carefully
          </div>
        )}
      </div>
    </div>
  );
}
