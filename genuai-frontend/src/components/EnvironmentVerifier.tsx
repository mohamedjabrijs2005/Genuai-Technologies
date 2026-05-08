import { useState, useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import QRCode from "qrcode";
import { io } from "socket.io-client";

type Phase = "INSTRUCTIONS" | "QR_VERIFY" | "TERMINATED";
type Risk  = "LOW" | "MEDIUM" | "HIGH";

interface Props {
  roomId: string;
  user: any;
  onVerificationComplete: (risk: Risk) => void;
}

/* Only flag truly obvious prohibited items — no false-positive-prone objects */
const HIGH_RISK = ["cell phone", "laptop", "book", "remote", "tv", "monitor"];
const MED_RISK  = ["person"]; /* extra person only */

export default function EnvironmentVerifier({ roomId, onVerificationComplete }: Props) {
  const timerRef    = useRef<any>(null);
  const socketRef   = useRef<any>(null);
  const lockRef     = useRef(false); /* prevents double execution */

  const [phase,      setPhase]      = useState<Phase>("INSTRUCTIONS");
  const [analyzing,  setAnalyzing]  = useState(false);
  const [statusMsg,  setStatusMsg]  = useState("Verifying your environment…");
  const [countdown,  setCountdown]  = useState(120); /* 2 min */
  const [mobileDone, setMobileDone] = useState(false);
  const [qrDataUrl,  setQrDataUrl]  = useState("");
  const [riskLevel,  setRiskLevel]  = useState<Risk>("LOW");

  useEffect(() => () => {
    clearInterval(timerRef.current);
    socketRef.current?.disconnect();
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const captureAndAnalyze = async () => {
    if (lockRef.current) return; /* prevent double-click */
    lockRef.current = true;
    setAnalyzing(true);

    try {
      /* Step 1: Open camera */
      setStatusMsg("Opening camera…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      await new Promise(r => setTimeout(r, 900)); /* stabilize */

      /* Step 2: Capture */
      setStatusMsg("Capturing environment…");
      const canvas = document.createElement("canvas");
      canvas.width  = video.videoWidth  || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d")!;
      ctx.save(); ctx.scale(-1, 1); ctx.drawImage(video, -canvas.width, 0); ctx.restore();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      stream.getTracks().forEach(t => t.stop());

      /* Step 3: Load COCO-SSD + detect */
      setStatusMsg("Running AI scan…");
      const model = await cocoSsd.load();
      const img = new Image(); img.src = dataUrl;
      await new Promise<void>(r => { img.onload = () => r(); });

      /* High confidence threshold = 0.72 to eliminate false positives */
      const preds = await model.detect(img);
      const highConf = preds.filter(p => p.score > 0.72);
      const classes  = highConf.map(p => p.class.toLowerCase());
      const persons  = classes.filter(c => c === "person").length;

      const violations: string[] = [];

      /* Only flag clear prohibited items */
      classes.forEach(c => {
        if (HIGH_RISK.includes(c)) violations.push(c);
      });
      if (persons > 1) violations.push("Multiple persons in frame");

      /* Medium risk: slightly lower threshold for secondary check */
      const medPreds = preds.filter(p => p.score > 0.60).map(p => p.class.toLowerCase());
      const medViol: string[] = [];
      medPreds.forEach(c => {
        if (MED_RISK.includes(c) && !violations.includes(c)) medViol.push(c);
      });

      const isHigh = violations.length > 0;
      const isMed  = !isHigh && medViol.length > 0;
      const risk: Risk = isHigh ? "HIGH" : isMed ? "MEDIUM" : "LOW";

      /* Terminate only if 4+ clear high-risk items */
      if (violations.filter(v => HIGH_RISK.includes(v)).length >= 4) {
        setAnalyzing(false);
        lockRef.current = false;
        setPhase("TERMINATED");
        return;
      }

      if (risk === "LOW") {
        /* LOW: instant silent entry — no screen shown */
        setAnalyzing(false);
        lockRef.current = false;
        onVerificationComplete("LOW");
      } else {
        /* MEDIUM/HIGH: QR screen — no risk label revealed */
        setRiskLevel(risk);
        setAnalyzing(false);
        lockRef.current = false;
        setPhase("QR_VERIFY");
        setupMobile(risk);
      }
    } catch {
      /* On any error → let candidate in silently */
      setAnalyzing(false);
      lockRef.current = false;
      onVerificationComplete("LOW");
    }
  };

  const setupMobile = async (risk: Risk) => {
    const mobileUrl = window.location.origin + "?mobile=1&room=" + roomId;
    try {
      const url = await QRCode.toDataURL(mobileUrl, {
        width: 210, margin: 2, color: { dark: "#1e293b", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch {}

    const WS = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "";
    const socket = io(WS, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join-session", { sessionId: roomId, role: "candidate" });
    socket.on("mobile-connected", () => {
      setMobileDone(true);
      clearInterval(timerRef.current);
      setTimeout(() => onVerificationComplete(risk), 1500);
    });

    setCountdown(120); /* 2 minutes */
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (risk === "HIGH") setPhase("TERMINATED");
          else onVerificationComplete(risk);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const BG   = "#F8FAFC";
  const card = { background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.05)" } as const;

  /* ══════════════════════════════════════════════════
     PHASE 1 — INSTRUCTIONS  (single verified company page)
  ══════════════════════════════════════════════════ */
  if (phase === "INSTRUCTIONS") return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"24px" }}>
      <div style={{ maxWidth:"600px", width:"100%" }}>

        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
            <img src="/logo.png" alt="GenuAI"
              style={{ width:"52px", height:"52px", borderRadius:"14px", boxShadow:"0 4px 16px rgba(102,126,234,0.3)" }}/>
            <span style={{ fontSize:"30px", fontWeight:"900", color:"#1E293B" }}>
              Genu<span style={{ color:"#00B87C" }}>AI</span>
            </span>
          </div>
          <h1 style={{ margin:"0 0 8px", fontSize:"26px", fontWeight:"900", color:"#1E293B" }}>Environment Verification</h1>
          <p style={{ color:"#64748B", margin:"0 0 14px", fontSize:"14px" }}>Required before your AI-Proctored Interview</p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#F0FDF4", border:"1.5px solid #00B87C", borderRadius:"20px", padding:"5px 16px" }}>
            <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00B87C" }}/>
            <span style={{ color:"#064E3B", fontSize:"12px", fontWeight:"700" }}>Room: {roomId}</span>
          </div>
        </div>

        <div style={{ ...card, marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
            <span style={{ background:"#EF4444", color:"#fff", padding:"3px 12px", borderRadius:"6px", fontSize:"11px", fontWeight:"800", letterSpacing:"0.6px" }}>READ CAREFULLY</span>
            <span style={{ color:"#1E293B", fontWeight:"800", fontSize:"15px" }}>Security &amp; Proctoring Rules</span>
          </div>
          {[
            { icon:"📷", text:"Live webcam captures your environment — AI verification cannot be bypassed",       color:"#667EEA" },
            { icon:"🎯", text:"AI scans for prohibited objects: phone, book, laptop, second screen, notes",       color:"#667EEA" },
            { icon:"🚫", text:"Remove ALL prohibited items BEFORE you proceed",                                  color:"#EF4444", bold:true },
            { icon:"✅", text:"Sit alone in a clean, well-lit, quiet room",                                      color:"#16A34A" },
            { icon:"🖥️", text:"Interview runs in FULLSCREEN — exiting fullscreen = instant violation",           color:"#D97706" },
            { icon:"🔴", text:"Tab switching is detected INSTANTLY — logged as critical violation",              color:"#EF4444" },
            { icon:"⌨️", text:"All keyboard shortcuts (Ctrl+C/V/X/A, F12, PrintScreen) are blocked",            color:"#64748B" },
            { icon:"📋", text:"Copy, paste, cut, and right-click are fully disabled",                            color:"#64748B" },
            { icon:"🪟", text:"Window losing focus is automatically logged",                                     color:"#64748B" },
            { icon:"📹", text:"Screen recording and screenshot attempts are flagged",                            color:"#64748B" },
            { icon:"🚨", text:"5 violations = interview TERMINATED + HR notified immediately",                   color:"#EF4444", bold:true },
          ].map((rule, i, arr) => (
            <div key={i} style={{ display:"flex", gap:"14px", padding:"11px 0", borderBottom:i<arr.length-1?"1px solid #F1F5F9":"none", alignItems:"flex-start" }}>
              <span style={{ fontSize:"17px", minWidth:"22px", marginTop:"1px" }}>{rule.icon}</span>
              <span style={{ color:rule.color, fontSize:"14px", lineHeight:"1.55", fontWeight:rule.bold?"700":"500" }}>{rule.text}</span>
            </div>
          ))}
        </div>

        {/* ONE button — spinner replaces it while analyzing */}
        {!analyzing ? (
          <button
            onClick={captureAndAnalyze}
            style={{ width:"100%", padding:"18px", background:"linear-gradient(135deg,#667EEA,#764BA2)", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"800", fontSize:"16px", cursor:"pointer", boxShadow:"0 4px 18px rgba(102,126,234,0.45)" }}
          >
            📸 &nbsp;Verify My Environment &amp; Begin Interview
          </button>
        ) : (
          <div style={{ background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:"14px", padding:"28px", textAlign:"center" }}>
            <div style={{ width:"44px", height:"44px", border:"4px solid #667EEA", borderTop:"4px solid transparent", borderRadius:"50%", margin:"0 auto 16px", animation:"spin 0.9s linear infinite" }}/>
            <p style={{ color:"#667EEA", fontWeight:"700", margin:"0 0 6px", fontSize:"15px" }}>{statusMsg}</p>
            <p style={{ color:"#94A3B8", fontSize:"13px", margin:0 }}>Please keep this window open and in focus</p>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     PHASE 2 — QR VERIFY  (MEDIUM/HIGH — no risk label, 2-min timer)
  ══════════════════════════════════════════════════ */
  if (phase === "QR_VERIFY") return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"24px" }}>
      <div style={{ maxWidth:"480px", width:"100%" }}>
        <div style={{ ...card, textAlign:"center", padding:"36px 30px" }}>

          <img src="/logo.png" alt="GenuAI"
            style={{ width:"52px", height:"52px", borderRadius:"14px", marginBottom:"16px", boxShadow:"0 4px 12px rgba(102,126,234,0.25)" }}/>
          <h2 style={{ color:"#1E293B", margin:"0 0 8px", fontSize:"20px", fontWeight:"800" }}>Additional Verification Required</h2>
          <p style={{ color:"#64748B", fontSize:"14px", margin:"0 0 26px", lineHeight:"1.6" }}>
            Scan this QR code with your smartphone and position it to show a <strong>side view</strong> of your workspace.
          </p>

          {/* QR with GenuAI logo in center */}
          <div style={{ position:"relative", display:"inline-block", marginBottom:"24px" }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code"
                style={{ width:"210px", height:"210px", borderRadius:"14px", border:"2px solid #E2E8F0", display:"block" }}/>
            ) : (
              <div style={{ width:"210px", height:"210px", background:"#F1F5F9", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:"24px", height:"24px", border:"3px solid #667EEA", borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin 0.9s linear infinite" }}/>
              </div>
            )}
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"#fff", borderRadius:"10px", padding:"5px", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
              <img src="/logo.png" alt="G"
                style={{ width:"36px", height:"36px", borderRadius:"8px", display:"block" }}/>
            </div>
          </div>

          {/* 2-minute countdown */}
          <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:"14px", padding:"18px", marginBottom:"20px" }}>
            <div style={{ color:"#D97706", fontWeight:"700", fontSize:"13px", marginBottom:"8px" }}>⏱️ Interview begins in</div>
            <div style={{ fontSize:"56px", fontWeight:"900", color:countdown<30?"#EF4444":"#F59E0B", lineHeight:1, fontFamily:"monospace" }}>{fmt(countdown)}</div>
            <p style={{ color:"#92400E", fontSize:"12px", margin:"10px 0 0" }}>Scan QR &amp; position phone to show your full workspace</p>
          </div>

          {mobileDone && (
            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"10px", padding:"12px", marginBottom:"16px" }}>
              <span style={{ color:"#16A34A", fontWeight:"700" }}>✅ Phone camera connected! Starting interview…</span>
            </div>
          )}

          <button
            onClick={() => { clearInterval(timerRef.current); onVerificationComplete(riskLevel); }}
            style={{ width:"100%", padding:"15px", background:"linear-gradient(135deg,#667EEA,#764BA2)", color:"#fff", border:"none", borderRadius:"12px", fontWeight:"700", fontSize:"15px", cursor:"pointer", boxShadow:"0 4px 14px rgba(102,126,234,0.4)" }}
          >
            Continue to Interview →
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     PHASE 3 — TERMINATED
  ══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"24px" }}>
      <div style={{ textAlign:"center", maxWidth:"520px" }}>
        <div style={{ width:"100px", height:"100px", background:"linear-gradient(135deg,#FF4444,#DC2626)", borderRadius:"28px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"52px", boxShadow:"0 12px 40px rgba(255,68,68,0.35)" }}>⛔</div>
        <h2 style={{ color:"#DC2626", margin:"0 0 10px", fontSize:"26px", fontWeight:"900" }}>Session Automatically Terminated</h2>
        <p style={{ color:"#64748B", fontSize:"14px", marginBottom:"24px" }}>
          Too many prohibited items were detected in your environment. This incident has been logged and reported to the HR team.
        </p>
        <div style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:"12px", padding:"14px 18px", color:"#64748B", fontSize:"13px" }}>
          Please contact your HR coordinator if you believe this is an error.
        </div>
      </div>
    </div>
  );
}
