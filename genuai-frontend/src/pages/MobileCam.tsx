import { useEffect, useRef, useState } from "react";

const API_WS  = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "";
const LOGO    = "https://d1ssw1t0a4j2nf.cloudfront.net/logo.png";

export default function MobileCam({ roomId }: { roomId: string }) {
  const [status,     setStatus]     = useState<"starting"|"live"|"error">("starting");
  const [camAllowed, setCamAllowed] = useState(false);
  const [faceOk,     setFaceOk]     = useState(true);
  const [violations, setViolations] = useState(0);
  const [elapsed,    setElapsed]    = useState(0);
  const [errMsg,     setErrMsg]     = useState("");

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);
  const streamRef = useRef<MediaStream|null>(null);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  useEffect(() => {
    if (!roomId) return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    startCamera();
    return () => {
      clearInterval(timer);
      streamRef.current?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect?.();
    };
  }, [roomId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCamAllowed(true);
      setStatus("live");
      connectSocket(stream);
      setInterval(() => checkFace(), 2500);
    } catch (e: any) {
      setStatus("error");
      setErrMsg(e?.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access and refresh."
        : "Could not access camera: " + (e?.message || "Unknown error"));
    }
  };

  const connectSocket = (stream: MediaStream) => {
    if (!API_WS) return; /* skip socket if no URL configured */
    try {
      /* Dynamic import to avoid crashes if socket.io not available */
      import("socket.io-client").then(({ io }) => {
        const socket = io(API_WS, { transports: ["websocket"], timeout: 5000 });
        socketRef.current = socket;
        socket.on("connect", () => {
          socket.emit("join-session", { sessionId: roomId, role: "mobile" });
        });
        socket.on("connect_error", () => {/* silent — camera still works */});
      }).catch(() => {/* socket unavailable — continue without it */});
    } catch { /* silent fallback */ }
  };

  const checkFace = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !streamRef.current) return;
    try {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let skin = 0;
      for (let i = 0; i < d.length; i += 16) {
        const r = d[i], g = d[i+1], b = d[i+2];
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15) skin++;
      }
      const ratio = skin / (c.width * c.height / 16);
      const ok = ratio >= 0.04;
      setFaceOk(ok);
      if (!ok) setViolations(p => p + 1);
    } catch { /* ignore canvas errors */ }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`}</style>

      {/* Header */}
      <div style={{ width:"100%", maxWidth:"420px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <img src={LOGO} alt="GenuAI" style={{ width:"36px", height:"36px", borderRadius:"10px", boxShadow:"0 2px 10px rgba(0,184,124,0.4)" }}/>
          <div>
            <div style={{ color:"#fff", fontWeight:"900", fontSize:"16px", lineHeight:1 }}>
              Genu<span style={{ color:"#00B87C" }}>AI</span>
            </div>
            <div style={{ color:"#64748B", fontSize:"10px", fontWeight:"600", marginTop:"2px" }}>Secure Camera Monitor</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"#00B87C", fontSize:"11px", fontWeight:"700", fontFamily:"monospace" }}>{roomId}</div>
          <div style={{ color:"#64748B", fontSize:"11px", fontFamily:"monospace" }}>{fmt(elapsed)}</div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ width:"100%", maxWidth:"420px", background:"#1e293b", borderRadius:"24px", border:`1.5px solid ${faceOk && camAllowed ? "rgba(0,184,124,.5)" : "rgba(255,68,68,.5)"}`, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>

        {/* Camera area */}
        <div style={{ position:"relative", background:"#000", aspectRatio:"4/3", minHeight:"240px", display:"flex", alignItems:"center", justifyContent:"center" }}>

          {status === "starting" && (
            <div style={{ textAlign:"center", color:"#64748B" }}>
              <div style={{ width:"40px", height:"40px", border:"3px solid #00B87C", borderTop:"3px solid transparent", borderRadius:"50%", margin:"0 auto 12px", animation:"spin 0.8s linear infinite" }}/>
              <div style={{ fontSize:"13px" }}>Requesting camera…</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
          )}

          {status === "error" && (
            <div style={{ textAlign:"center", padding:"20px" }}>
              <div style={{ fontSize:"40px", marginBottom:"12px" }}>📷</div>
              <div style={{ color:"#EF4444", fontWeight:"700", fontSize:"14px", marginBottom:"8px" }}>Camera Error</div>
              <div style={{ color:"#94A3B8", fontSize:"12px", lineHeight:"1.5" }}>{errMsg}</div>
            </div>
          )}

          <video
            ref={videoRef} autoPlay muted playsInline
            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:camAllowed ? "block" : "none", position:"absolute", inset:0 }}
          />
          <canvas ref={canvasRef} width={160} height={120} style={{ display:"none" }}/>

          {/* Face warning overlay */}
          {camAllowed && !faceOk && (
            <div style={{ position:"absolute", inset:0, background:"rgba(239,68,68,0.35)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px" }}>
              <div style={{ fontSize:"36px", animation:"shake .5s infinite" }}>⚠️</div>
              <div style={{ color:"#fff", fontWeight:"800", fontSize:"16px" }}>Face Not Visible!</div>
              <div style={{ color:"rgba(255,255,255,.8)", fontSize:"12px" }}>Keep your face in frame</div>
            </div>
          )}

          {/* Status badges */}
          {camAllowed && (
            <div style={{ position:"absolute", top:"10px", left:"10px", display:"flex", alignItems:"center", gap:"6px", background:faceOk?"rgba(0,184,124,.9)":"rgba(239,68,68,.9)", borderRadius:"20px", padding:"4px 12px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#fff", animation:faceOk?"none":"pulse 1s infinite" }}/>
              <span style={{ color:"#fff", fontSize:"11px", fontWeight:"700" }}>{faceOk ? "✅ Face OK" : "❌ No Face"}</span>
            </div>
          )}
          {status === "live" && (
            <div style={{ position:"absolute", top:"10px", right:"10px", display:"flex", alignItems:"center", gap:"5px", background:"rgba(220,38,38,.9)", borderRadius:"7px", padding:"4px 10px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#fff", animation:"pulse 1s infinite" }}/>
              <span style={{ color:"#fff", fontSize:"11px", fontWeight:"800" }}>REC</span>
            </div>
          )}
        </div>

        {/* Status row */}
        <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:"10px" }}>
          <div style={{ padding:"10px 14px", background:"rgba(0,184,124,.1)", border:"1px solid rgba(0,184,124,.3)", borderRadius:"10px", display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#00B87C", animation:"pulse 1.5s infinite", flexShrink:0 }}/>
            <span style={{ color:"#e2e8f0", fontSize:"13px", fontWeight:"600" }}>
              {status === "starting" ? "Initializing camera…" : status === "error" ? "Camera error — see above" : "🔴 LIVE — Monitoring active"}
            </span>
          </div>
          <div style={{ padding:"10px 14px", background:violations>0?"rgba(239,68,68,.1)":"rgba(0,184,124,.08)", border:`1px solid ${violations>0?"rgba(239,68,68,.3)":"rgba(0,184,124,.25)"}`, borderRadius:"10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:violations>0?"#EF4444":"#00B87C", fontSize:"12px", fontWeight:"700" }}>
              {violations === 0 ? "✅ No Face Violations" : `⚠️ ${violations} Face Violation${violations>1?"s":""}`}
            </span>
            {violations > 0 && <span style={{ background:"#EF4444", color:"#fff", fontSize:"11px", fontWeight:"800", padding:"2px 8px", borderRadius:"8px" }}>{violations}</span>}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ padding:"12px 18px 20px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
          {[["🔒","Keep this page open during the entire interview"],["📷","Keep your face clearly visible at all times"],["🚫","Do not switch apps or lock your phone screen"]].map(([icon,text],i) => (
            <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start", marginBottom:i<2?8:0 }}>
              <span style={{ fontSize:"14px", marginTop:"1px" }}>{icon}</span>
              <span style={{ color:"#64748B", fontSize:"12px", lineHeight:"1.5" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:"20px", display:"flex", alignItems:"center", gap:"6px" }}>
        <img src={LOGO} alt="G" style={{ width:"14px", height:"14px", borderRadius:"3px" }}/>
        <span style={{ color:"#334155", fontSize:"11px" }}>Powered by <span style={{ color:"#00B87C", fontWeight:"700" }}>GenuAI</span> Anti-Cheat Technology</span>
      </div>
    </div>
  );
}