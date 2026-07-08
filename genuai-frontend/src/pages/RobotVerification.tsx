import { useState, useCallback, useEffect } from "react";

interface Props { onVerified: () => void; }

const CATEGORIES = [
  { key: "lorry", label: "Lorry", plural: "Lorries", emoji: "🚛" },
  { key: "car", label: "Car", plural: "Cars", emoji: "🚗" },
  { key: "bike", label: "Bike", plural: "Bikes", emoji: "🏍️" },
  { key: "house", label: "House", plural: "Houses", emoji: "🏠" },
  { key: "bridge", label: "Bridge", plural: "Bridges", emoji: "🌉" },
  { key: "bus", label: "Bus", plural: "Buses", emoji: "🚌" },
];

const POOL: { id: string; url: string; cat: string }[] = [
  // Lorries
  { id: "l1", cat: "lorry", url: "https://loremflickr.com/180/180/lorry,truck?lock=11" },
  { id: "l2", cat: "lorry", url: "https://loremflickr.com/180/180/lorry,truck?lock=12" },
  { id: "l3", cat: "lorry", url: "https://loremflickr.com/180/180/semi,truck?lock=13" },
  { id: "l4", cat: "lorry", url: "https://loremflickr.com/180/180/cargo,truck?lock=14" },
  { id: "l5", cat: "lorry", url: "https://loremflickr.com/180/180/lorry,truck?lock=15" },
  // Cars
  { id: "c1", cat: "car", url: "https://loremflickr.com/cache/resized/7354_8952108080_5dc9bd4e9c_n_180_180_nofilter.jpg" },
  { id: "c2", cat: "car", url: "https://loremflickr.com/cache/resized/8242_8590782444_78616f0945_m_180_180_nofilter.jpg" },
  { id: "c3", cat: "car", url: "https://loremflickr.com/cache/resized/8186_8146407031_a8bb4e278f_180_180_nofilter.jpg" },
  { id: "c4", cat: "car", url: "https://loremflickr.com/cache/resized/8290_7717637210_0baffd07a1_m_180_180_nofilter.jpg" },
  { id: "c5", cat: "car", url: "https://loremflickr.com/cache/resized/6059_6360674879_a081d25a8d_m_180_180_nofilter.jpg" },
  // Bikes
  { id: "b1", cat: "bike", url: "https://loremflickr.com/cache/resized/65535_26744569311_6ab7f2d0e5_n_180_180_nofilter.jpg" },
  { id: "b2", cat: "bike", url: "https://loremflickr.com/cache/resized/5724_23446740402_bb0bf0272d_n_180_180_nofilter.jpg" },
  { id: "b3", cat: "bike", url: "https://loremflickr.com/cache/resized/595_21077854030_015400d1b0_n_180_180_nofilter.jpg" },
  { id: "b4", cat: "bike", url: "https://loremflickr.com/cache/resized/495_19079311194_02afda5cb4_n_180_180_nofilter.jpg" },
  { id: "b5", cat: "bike", url: "https://loremflickr.com/cache/resized/7691_17494013615_8f3139ccb8_n_180_180_nofilter.jpg" },
  // Houses
  { id: "h1", cat: "house", url: "https://loremflickr.com/cache/resized/65535_54567349572_6fe83302ac_m_180_180_nofilter.jpg" },
  { id: "h2", cat: "house", url: "https://loremflickr.com/cache/resized/65535_54543036893_36b15d2829_n_180_180_nofilter.jpg" },
  { id: "h3", cat: "house", url: "https://loremflickr.com/cache/resized/65535_54459325933_659535a7f6_n_180_180_nofilter.jpg" },
  { id: "h4", cat: "house", url: "https://loremflickr.com/cache/resized/65535_54452293698_696f7b6582_n_180_180_nofilter.jpg" },
  { id: "h5", cat: "house", url: "https://loremflickr.com/cache/resized/65535_54449563298_2ef2271cdf_m_180_180_nofilter.jpg" },
  // Bridges
  { id: "br1", cat: "bridge", url: "https://loremflickr.com/cache/resized/65535_54393318804_8e616b0cc6_m_180_180_nofilter.jpg" },
  { id: "br2", cat: "bridge", url: "https://loremflickr.com/cache/resized/65535_54368936937_9d2f351b74_n_180_180_nofilter.jpg" },
  { id: "br3", cat: "bridge", url: "https://loremflickr.com/cache/resized/65535_54332034154_f74e4e9f67_n_180_180_nofilter.jpg" },
  { id: "br4", cat: "bridge", url: "https://loremflickr.com/cache/resized/65535_54313443017_5ef7184051_n_180_180_nofilter.jpg" },
  { id: "br5", cat: "bridge", url: "https://loremflickr.com/cache/resized/65535_54305442874_f5f8b4934f_n_180_180_nofilter.jpg" },
  // Buses
  { id: "bu1", cat: "bus", url: "https://loremflickr.com/cache/resized/65535_54450248777_a3daa985ae_180_180_nofilter.jpg" },
  { id: "bu2", cat: "bus", url: "https://loremflickr.com/cache/resized/65535_54449396750_f04aa20cc9_n_180_180_nofilter.jpg" },
  { id: "bu3", cat: "bus", url: "https://loremflickr.com/cache/resized/65535_54439656804_863f030f99_n_180_180_nofilter.jpg" },
  { id: "bu4", cat: "bus", url: "https://loremflickr.com/cache/resized/65535_54421559597_2c03695956_n_180_180_nofilter.jpg" },
  { id: "bu5", cat: "bus", url: "https://loremflickr.com/cache/resized/65535_54414880622_5975b39bd9_180_180_nofilter.jpg" },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function makeChallenge() {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const targets = shuffle(POOL.filter(p => p.cat === cat.key)).slice(0, 3);
  const others = shuffle(POOL.filter(p => p.cat !== cat.key)).slice(0, 6);
  const grid = shuffle([...targets, ...others]);
  return { cat, grid, correctIds: new Set(targets.map(t => t.id)) };
}

export default function RobotVerification({ onVerified }: Props) {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "wrong" | "success">("idle");
  const [attempts, setAttempts] = useState(0);

  // Preload all images silently so they appear instantly
  useEffect(() => {
    POOL.forEach(img => {
      const i = new Image();
      i.src = img.url;
    });
  }, []);

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0F172A 0%,#1E3A8A 50%,#2563EB 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "20px" }}>
      {/* blobs */}
      <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(124,58,237,0.15)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(37,99,235,0.2)", pointerEvents: "none" }} />

      <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.35)", maxWidth: "420px", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "28px", height: "28px", objectFit: "contain", flexShrink: 0, filter: "brightness(1.1)" }} />
          <div>
            <div style={{ color: "#fff", fontWeight: "800", fontSize: "12px", lineHeight: "1" }}>GenuAI</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "9px", marginTop: "2px" }}>Identity Verification</div>
          </div>
          <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: "20px", padding: "3px 8px", color: "#fff", fontSize: "9px", fontWeight: "600" }}>🔒 Secure</div>
        </div>

        {/* Challenge prompt */}
        <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Select all images with a</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#1E293B", marginTop: "2px" }}>
              {cat.label}
            </div>
          </div>
          <div style={{ fontSize: "28px" }}>
            {cat.emoji}
          </div>
        </div>

        {/* Image Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", padding: "2px", background: "#E2E8F0" }}>
          {grid.map(img => {
            const isSel = selected.has(img.id);
            return (
              <div key={img.id} onClick={() => toggle(img.id)} style={{ position: "relative", aspectRatio: "1", cursor: "pointer", overflow: "hidden", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: "20px", zIndex: 0 }}>⏳</div>
                <img src={img.url} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "relative", zIndex: 1, filter: isSel ? "brightness(0.7)" : "brightness(1)", transition: "filter 0.15s" }} loading="lazy" />
                {isSel && (
                  <div style={{ position: "absolute", inset: 0, border: "3px solid #2563EB", boxSizing: "border-box" }}>
                    <div style={{ position: "absolute", bottom: "6px", right: "6px", width: "26px", height: "26px", borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: "14px", fontWeight: "900" }}>✓</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        {status === "wrong" && (
          <div style={{ background: "#FEF2F2", borderTop: "1px solid #FECACA", padding: "10px 20px", color: "#DC2626", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>
            ❌ Incorrect — please try again
          </div>
        )}
        {status === "success" && (
          <div style={{ background: "#F0FDF4", borderTop: "1px solid #BBF7D0", padding: "10px 20px", color: "#16A34A", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>
            ✅ Verified! Continuing…
          </div>
        )}

        {/* Footer controls */}
        <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #E2E8F0", background: "#FAFAFA" }}>
          <button onClick={refresh} title="New challenge" style={{ width: "32px", height: "32px", border: "1.5px solid #E2E8F0", borderRadius: "50%", background: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>🔄</button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="" style={{ width: "24px", height: "24px" }} />
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "#64748B" }}>GenuAI CAPTCHA</div>
              <div style={{ fontSize: "8px", color: "#94A3B8" }}>Privacy · Terms</div>
            </div>
          </div>
          <button onClick={verify} disabled={selected.size === 0 || status === "success"}
            style={{ padding: "8px 20px", background: selected.size > 0 ? "linear-gradient(135deg,#2563EB,#7C3AED)" : "#E2E8F0", color: selected.size > 0 ? "#fff" : "#94A3B8", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: "13px", cursor: selected.size > 0 ? "pointer" : "not-allowed", boxShadow: selected.size > 0 ? "0 4px 14px rgba(37,99,235,0.35)" : "none", transition: "all 0.2s" }}>
            Verify
          </button>
        </div>

        {attempts > 1 && (
          <div style={{ padding: "8px 16px", background: "#FFFBEB", borderTop: "1px solid #FDE68A", textAlign: "center", fontSize: "11px", color: "#92400E" }}>
            ⚠️ {attempts} failed attempts — Please select all matching images carefully
          </div>
        )}
      </div>
    </div>
  );
}
