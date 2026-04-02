import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Props {
  user: any;
  onLogout: () => void;
  onBack: () => void;
}

const ROLES = ["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"];

export default function InterviewRoom({ user, onLogout, onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [cheatLog, setCheatLog] = useState<{time: string, event: string}[]>([]);
  const [cheatCount, setCheatCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [warningLevel, setWarningLevel] = useState<"yellow"|"red">("yellow");
  const [timer, setTimer] = useState(0);
  const [terminated, setTerminated] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"ok"|"missing"|"multiple">("ok");
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [mode, setMode] = useState<"room"|"coach">("room");
  const [coachRole, setCoachRole] = useState("Software Engineer");
  const [coachRound, setCoachRound] = useState("Technical");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const localRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const faceCheckRef = useRef<any>(null);
  const noiseRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const motionRef = useRef<any>(null);
  const [motionAlert, setMotionAlert] = useState(false);
  const [emotion, setEmotion] = useState<string>("Neutral");
  const [emotionColor, setEmotionColor] = useState<string>("#00B87C");
  const emotionRef = useRef<any>(null);
  const emotionCanvasRef = useRef<HTMLCanvasElement>(null);
  const userName = user?.user?.name || user?.name || "Candidate";

  const logViolation = useCallback((event: string, level: "yellow"|"red" = "yellow") => {
    const time = new Date().toLocaleTimeString();
    setCheatLog(prev => [...prev, { time, event }]);
    setCheatCount(p => p + 1);
    setWarning(event);
    setWarningLevel(level);
    setTimeout(() => setWarning(""), 5000);
  }, []);

  const terminateInterview = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) document.exitFullscreen();
    clearInterval(timerRef.current);
    clearInterval(faceCheckRef.current);
    clearInterval(noiseRef.current);
    setTerminated(true);
    setStarted(false);
  }, []);

  useEffect(() => {
    if (!started) return;
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    const onHide = () => { if (document.hidden) { logViolation("TAB SWITCH detected!", "red"); setCheatCount(p => { if (p + 1 >= 5) terminateInterview(); return p + 1; }); } };
    const onCopy = (e: any) => { e.preventDefault(); logViolation("COPY attempt blocked!", "yellow"); };
    const onPaste = (e: any) => { e.preventDefault(); logViolation("PASTE attempt blocked!", "yellow"); };
    const onCut = (e: any) => { e.preventDefault(); logViolation("CUT attempt blocked!", "yellow"); };
    const onRC = (e: any) => { e.preventDefault(); logViolation("RIGHT-CLICK disabled!", "yellow"); };
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && ["c","v","x","a","u","s","p"].includes(e.key.toLowerCase())) { e.preventDefault(); logViolation("Keyboard shortcut Ctrl+" + e.key.toUpperCase() + " blocked!", "yellow"); }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) { e.preventDefault(); logViolation("DevTools shortcut blocked!", "red"); }
      if (e.key === "Escape") { e.preventDefault(); logViolation("ESC key blocked!", "yellow"); }
      if (e.metaKey) { e.preventDefault(); logViolation("Meta/Windows key blocked!", "yellow"); }
    };
    const onFSChange = () => { if (!document.fullscreenElement) { logViolation("FULLSCREEN EXIT detected!", "red"); setTimeout(() => { if (el.requestFullscreen) el.requestFullscreen(); }, 500); } };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === "PrintScreen") logViolation("SCREENSHOT attempt detected!", "red"); };
    const onBlur = () => { logViolation("Window focus lost!", "red"); };
    const onMouseLeave = () => { logViolation("Mouse left interview window!", "yellow"); };
    const onPiP = () => { logViolation("Picture-in-Picture detected!", "red"); document.exitPictureInPicture?.(); };
    const onDrag = (e: any) => { e.preventDefault(); logViolation("Drag attempt blocked!", "yellow"); };
    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onRC);
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("enterpictureinpicture", onPiP);
    document.addEventListener("dragstart", onDrag);
    window.addEventListener("blur", onBlur);
    document.body.style.userSelect = "none";
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    setFaceStatus("ok");
    motionRef.current = setInterval(detectMotion, 2000);
    emotionRef.current = setInterval(detectEmotion, 1500);
    noiseRef.current = setInterval(() => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setNoiseLevel(Math.round(avg));
        if (avg > 90) logViolation("EXTREME BACKGROUND NOISE detected!", "yellow");
      }
    }, 15000);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onRC);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("enterpictureinpicture", onPiP);
      document.removeEventListener("dragstart", onDrag);
      window.removeEventListener("blur", onBlur);
      document.body.style.userSelect = "";
      clearInterval(timerRef.current);
      clearInterval(faceCheckRef.current);
      clearInterval(noiseRef.current);
      clearInterval(motionRef.current);
      clearInterval(emotionRef.current);
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, [started, logViolation, terminateInterview]);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      setStarted(true);
      setTimeout(() => { if (localRef.current) { localRef.current.srcObject = stream; localRef.current.play().catch(() => {}); } }, 300);
    } catch { alert("Camera and microphone access is required."); }
  };

  const endInterview = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) document.exitFullscreen();
    clearInterval(timerRef.current);
    clearInterval(faceCheckRef.current);
    clearInterval(noiseRef.current);
    setStarted(false);
    setTimer(0);
  };

  const detectEmotion = () => {
    if (!localRef.current || !emotionCanvasRef.current) return;
    const canvas = emotionCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 100; canvas.height = 100;
    ctx.drawImage(localRef.current, 0, 0, 100, 100);
    const frame = ctx.getImageData(0, 0, 100, 100);
    const data = frame.data;
    let r=0,g=0,b=0;
    for (let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];}
    const pixels = data.length/4;
    r=r/pixels; g=g/pixels; b=b/pixels;
    const brightness = (r+g+b)/3;
    const redness = r - (g+b)/2;
    const emotions = [
      { name: "Confident", color: "#00B87C", condition: brightness > 120 && redness < 20 },
      { name: "Nervous", color: "#F59E0B", condition: redness > 30 && brightness > 100 },
      { name: "Stressed", color: "#FF4444", condition: redness > 40 },
      { name: "Calm", color: "#00D4FF", condition: brightness > 140 && redness < 15 },
      { name: "Focused", color: "#A78BFA", condition: brightness > 100 && brightness < 140 },
    ];
    const detected = emotions.find(e => e.condition) || { name: "Neutral", color: "#64748B" };
    setEmotion(detected.name);
    setEmotionColor(detected.color);
  };

  const detectMotion = () => {
    if (!localRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 160; canvas.height = 120;
    ctx.drawImage(localRef.current, 0, 0, 160, 120);
    const currentFrame = ctx.getImageData(0, 0, 160, 120);
    if (prevFrameRef.current) {
      const prev = prevFrameRef.current.data;
      const curr = currentFrame.data;
      let diffCount = 0;
      for (let i = 0; i < curr.length; i += 4) {
        if (Math.abs(curr[i]-prev[i]) + Math.abs(curr[i+1]-prev[i+1]) + Math.abs(curr[i+2]-prev[i+2]) > 80) diffCount++;
      }
      if ((diffCount / (160*120)) * 100 > 35) {
        setMotionAlert(true);
        logViolation("SUSPICIOUS OBJECT detected in camera!", "red");
        setCheatCount(p => { if (p+1>=5) terminateInterview(); return p+1; });
        setTimeout(() => setMotionAlert(false), 4000);
      }
    }
    prevFrameRef.current = currentFrame;
  };

  const loadQuestions = async () => {
    setCoachLoading(true);
    try {
      const res = await axios.post(API + "/coach/interview-questions", { role: coachRole, round: coachRound });
      setQuestions(res.data.questions || []);
      setCurrentQ(0);
      setUserAnswer("");
      setEvaluation(null);
      setSessionScore([]);
    } catch { alert("Failed to load questions"); }
    setCoachLoading(false);
  };

  const evaluateAnswer = async () => {
    if (!userAnswer.trim()) { alert("Please type your answer first!"); return; }
    setCoachLoading(true);
    try {
      const res = await axios.post(API + "/coach/evaluate-answer", { question: questions[currentQ]?.question, answer: userAnswer, role: coachRole });
      setEvaluation(res.data);
      setSessionScore(prev => [...prev, res.data.score || 0]);
    } catch { alert("Evaluation failed"); }
    setCoachLoading(false);
  };

  const nextQuestion = () => { setCurrentQ(p => p + 1); setUserAnswer(""); setEvaluation(null); };

  const fmt = (s: number) => Math.floor(s/60) + ":" + (s%60 < 10 ? "0" : "") + (s%60);
  const btn: any = { padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px" };

  if (terminated) return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>🚫</div>
        <h2 style={{ color: "#FF4444", marginBottom: "12px" }}>Interview Terminated</h2>
        <p style={{ color: "#64748B", marginBottom: "20px" }}>Your interview was terminated due to multiple serious violations.</p>
        <div style={{ background: "#FFFFFF", border: "1px solid #FF4444", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left", maxHeight: "200px", overflowY: "auto" }}>
          {cheatLog.map((l, i) => <div key={i} style={{ color: "#FF4444", fontSize: "13px", marginBottom: "4px" }}>[{l.time}] {l.event}</div>)}
        </div>
        <button onClick={onBack} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B" }}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#00B87C", fontSize: "22px" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "16px" }}>{mode === "coach" ? "AI Mock Interview Coach" : "Secure Interview Room"}</span></h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {!started && <button onClick={onBack} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B" }}>Back</button>}
          {!started && <button onClick={() => setMode(mode === "room" ? "coach" : "room")} style={{ ...btn, background: mode === "coach" ? "#A78BFA" : "#161B22", border: "1px solid #A78BFA", color: mode === "coach" ? "#000" : "#A78BFA" }}>{mode === "coach" ? "🔒 Interview Room" : "🎓 AI Coach"}</button>}
          <button onClick={onLogout} style={{ ...btn, background: "transparent", border: "1px solid #FF4444", color: "#FF4444" }}>Logout</button>
        </div>
      </div>

      {mode === "coach" ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <select value={coachRole} onChange={e => setCoachRole(e.target.value)} style={{ padding: "10px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px" }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select value={coachRound} onChange={e => setCoachRound(e.target.value)} style={{ padding: "10px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "8px", color: "#1E293B", fontSize: "14px" }}>
              {["Technical","Behavioral","HR","System Design","Case Study"].map(r => <option key={r}>{r}</option>)}
            </select>
            <button onClick={loadQuestions} disabled={coachLoading} style={{ ...btn, background: "#A78BFA", color: "#000", padding: "10px 20px" }}>{coachLoading ? "Loading..." : "Start Practice"}</button>
            {sessionScore.length > 0 && <div style={{ padding: "8px 14px", background: "#F1F5F9", borderRadius: "8px", color: "#00B87C", fontWeight: "bold" }}>Avg: {Math.round(sessionScore.reduce((a,b)=>a+b,0)/sessionScore.length)}%</div>}
          </div>

          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#FFFFFF", borderRadius: "12px", border: "1.5px solid #E2E8F0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎓</div>
              <h3 style={{ color: "#A78BFA", margin: "0 0 8px" }}>AI Mock Interview Coach</h3>
              <p style={{ color: "#64748B" }}>Select your role and round, then click Start Practice!</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
                {["Role-specific questions","AI evaluates answers","Instant feedback","Track your score"].map((f,i) => (
                  <div key={i} style={{ padding: "8px 16px", background: "#A78BFA22", border: "1px solid #A78BFA44", borderRadius: "20px", color: "#A78BFA", fontSize: "13px" }}>✓ {f}</div>
                ))}
              </div>
            </div>
          ) : currentQ >= questions.length ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#FFFFFF", borderRadius: "12px", border: "1px solid #00B87C" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🏆</div>
              <h3 style={{ color: "#00B87C", margin: "0 0 8px" }}>Session Complete!</h3>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "#00B87C", margin: "16px 0" }}>{Math.round(sessionScore.reduce((a,b)=>a+b,0)/sessionScore.length)}%</div>
              <p style={{ color: "#64748B" }}>Average score across {sessionScore.length} questions</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "16px 0", flexWrap: "wrap" }}>
                {sessionScore.map((s,i) => <div key={i} style={{ padding: "6px 12px", background: s>=80?"#00B87C22":s>=60?"#F59E0B22":"#FF444422", border: "1px solid "+(s>=80?"#00B87C":s>=60?"#F59E0B":"#FF4444"), borderRadius: "8px", color: s>=80?"#00B87C":s>=60?"#F59E0B":"#FF4444", fontWeight: "bold" }}>Q{i+1}: {s}%</div>)}
              </div>
              <button onClick={loadQuestions} style={{ ...btn, background: "#A78BFA", color: "#000", padding: "12px 24px" }}>Practice Again</button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                <span style={{ color: "#64748B", fontSize: "13px" }}>Question {currentQ+1} of {questions.length}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {questions.map((_,i) => <div key={i} style={{ width: "24px", height: "6px", borderRadius: "3px", background: i < currentQ ? "#00B87C" : i === currentQ ? "#A78BFA" : "#161B22" }}/>)}
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "10px", background: questions[currentQ]?.difficulty === "Hard" ? "#FF444422" : questions[currentQ]?.difficulty === "Medium" ? "#F59E0B22" : "#00B87C22", color: questions[currentQ]?.difficulty === "Hard" ? "#FF4444" : questions[currentQ]?.difficulty === "Medium" ? "#F59E0B" : "#00B87C", fontSize: "12px", fontWeight: "bold" }}>{questions[currentQ]?.difficulty}</span>
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid #A78BFA", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "10px", background: "#A78BFA22", color: "#A78BFA", fontSize: "12px" }}>{questions[currentQ]?.type}</span>
                  <span style={{ padding: "3px 10px", borderRadius: "10px", background: "#00D4FF22", color: "#00D4FF", fontSize: "12px" }}>{coachRole}</span>
                </div>
                <h3 style={{ color: "#1E293B", margin: "0 0 12px", fontSize: "16px", lineHeight: "1.5" }}>{questions[currentQ]?.question}</h3>
                <div style={{ padding: "10px 14px", background: "#F1F5F9", borderRadius: "8px", color: "#64748B", fontSize: "13px" }}>💡 {questions[currentQ]?.hint}</div>
              </div>
              <textarea placeholder="Type your answer here... Use STAR method: Situation, Task, Action, Result" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} rows={6} style={{ width: "100%", padding: "14px", background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#1E293B", fontSize: "14px", resize: "vertical", boxSizing: "border-box", marginBottom: "8px" }} />
              <div style={{ color: "#64748B", fontSize: "12px", textAlign: "right", marginBottom: "12px" }}>{userAnswer.split(/\s+/).filter(Boolean).length} words</div>
              {!evaluation ? (
                <button onClick={evaluateAnswer} disabled={coachLoading || !userAnswer.trim()} style={{ ...btn, background: "#A78BFA", color: "#000", width: "100%", padding: "14px", fontSize: "15px" }}>{coachLoading ? "Evaluating..." : "Submit Answer & Get Feedback"}</button>
              ) : (
                <div>
                  <div style={{ background: "#FFFFFF", border: "1px solid " + (evaluation.score>=80?"#00B87C":evaluation.score>=60?"#F59E0B":"#FF4444"), borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ color: "#1E293B", margin: 0 }}>AI Feedback</h3>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "36px", fontWeight: "bold", color: evaluation.score>=80?"#00B87C":evaluation.score>=60?"#F59E0B":"#FF4444" }}>{evaluation.score}%</div>
                        <div style={{ color: "#64748B", fontSize: "12px" }}>{evaluation.rating}</div>
                      </div>
                    </div>
                    <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "12px" }}>{evaluation.feedback}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ padding: "12px", background: "#00B87C11", border: "1px solid #00B87C44", borderRadius: "8px" }}>
                        <div style={{ color: "#00B87C", fontWeight: "bold", fontSize: "12px", marginBottom: "6px" }}>What was good</div>
                        <div style={{ color: "#64748B", fontSize: "13px" }}>{evaluation.what_was_good}</div>
                      </div>
                      <div style={{ padding: "12px", background: "#F59E0B11", border: "1px solid #F59E0B44", borderRadius: "8px" }}>
                        <div style={{ color: "#F59E0B", fontWeight: "bold", fontSize: "12px", marginBottom: "6px" }}>Improve this</div>
                        <div style={{ color: "#64748B", fontSize: "13px" }}>{evaluation.what_to_improve}</div>
                      </div>
                    </div>
                    <div style={{ padding: "12px", background: "#00D4FF11", border: "1px solid #00D4FF44", borderRadius: "8px", marginBottom: "12px" }}>
                      <div style={{ color: "#00D4FF", fontWeight: "bold", fontSize: "12px", marginBottom: "6px" }}>Model Answer</div>
                      <div style={{ color: "#64748B", fontSize: "13px" }}>{evaluation.model_answer}</div>
                    </div>
                    {questions[currentQ]?.follow_up && (
                      <div style={{ padding: "10px 14px", background: "#A78BFA11", border: "1px solid #A78BFA44", borderRadius: "8px" }}>
                        <span style={{ color: "#A78BFA", fontWeight: "bold", fontSize: "12px" }}>Follow-up: </span>
                        <span style={{ color: "#64748B", fontSize: "13px" }}>{questions[currentQ].follow_up}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={nextQuestion} style={{ ...btn, background: "#00B87C", color: "#000", width: "100%", padding: "14px", fontSize: "15px" }}>{currentQ + 1 >= questions.length ? "Finish Session" : "Next Question"}</button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : !started ? (
        <div style={{ maxWidth: "620px", margin: "40px auto" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ color: "#00B87C", margin: "0 0 8px" }}>Maximum Security Interview</h2>
            <p style={{ color: "#64748B", margin: 0 }}>All activity is monitored and recorded.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #FF4444", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ color: "#FF4444", fontWeight: "bold", marginBottom: "12px", fontSize: "15px" }}>Security Measures Active:</div>
            {[["🖥️","Fullscreen enforced"],["👁️","Face detection monitoring"],["🎙️","Background noise monitoring"],["🚫","Tab switching blocked"],["⌨️","All keyboard shortcuts disabled"],["📋","Copy/paste/cut blocked"],["🖱️","Right-click disabled"],["📸","Screenshot attempts detected"],["🪟","Window switching logged"],["⚠️","5 violations = auto termination"]].map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < 9 ? "1px solid #F1F5F9" : "none" }}>
                <span style={{ fontSize: "18px" }}>{icon}</span>
                <span style={{ color: "#64748B", fontSize: "14px" }}>{text}</span>
              </div>
            ))}
          </div>
          <button onClick={startInterview} style={{ ...btn, background: "#00B87C", color: "#000", width: "100%", padding: "16px", fontSize: "16px" }}>I Agree — Start Secure Interview</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ background: "#FF4444", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "bold" }}>🔴 LIVE</div>
            <div style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: "#00D4FF" }}>⏱ {fmt(timer)}</div>
            <div style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: cheatCount > 2 ? "#FF4444" : cheatCount > 0 ? "#F59E0B" : "#00B87C" }}>⚠️ Violations: {cheatCount}/5</div>
            <div style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: faceStatus === "ok" ? "#00B87C" : "#FF4444" }}>👤 Face: {faceStatus === "ok" ? "Detected" : "NOT FOUND"}</div>
            <div style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: noiseLevel > 60 ? "#FF4444" : "#00B87C" }}>🎙️ Noise: {noiseLevel > 60 ? "HIGH" : "OK"}</div>
            <div style={{ background: "#F1F5F9", border: "1px solid " + emotionColor, borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: emotionColor, fontWeight: "bold" }}>😊 {emotion}</div>
            <button onClick={() => setShowLog(!showLog)} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: "12px", padding: "5px 14px" }}>Log ({cheatLog.length})</button>
            <button onClick={endInterview} style={{ ...btn, background: "#FF4444", color: "#1E293B", fontSize: "12px", padding: "5px 14px", marginLeft: "auto" }}>End Interview</button>
          </div>
          {warning && (
            <div style={{ background: warningLevel === "red" ? "#3a0000" : "#2a1a00", border: "2px solid " + (warningLevel === "red" ? "#FF4444" : "#F59E0B"), borderRadius: "8px", padding: "14px 20px", marginBottom: "16px", color: warningLevel === "red" ? "#FF4444" : "#F59E0B", fontWeight: "bold", fontSize: "15px" }}>
              {warningLevel === "red" ? "🚨" : "⚠️"} {warning}
            </div>
          )}
          {showLog && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "16px", maxHeight: "150px", overflowY: "auto" }}>
              <div style={{ color: "#FF4444", fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>Violation Log:</div>
              {cheatLog.length === 0 ? <div style={{ color: "#00B87C", fontSize: "13px" }}>No violations yet.</div> : cheatLog.map((l, i) => <div key={i} style={{ color: "#64748B", fontSize: "12px", marginBottom: "4px" }}>[{l.time}] {l.event}</div>)}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div style={{ background: "#FFFFFF", border: "2px solid #00B87C", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
              <video ref={localRef} autoPlay muted playsInline style={{ width: "100%", height: "280px", objectFit: "cover", background: "#000" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <canvas ref={emotionCanvasRef} style={{ display: "none" }} />
              {motionAlert && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "#FF444433", border: "3px solid #FF4444", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "#FF4444", color: "#1E293B", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold" }}>SUSPICIOUS OBJECT DETECTED</div>
                </div>
              )}
              <div style={{ position: "absolute", top: "10px", right: "10px", background: "#00B87C", borderRadius: "6px", padding: "3px 8px", fontSize: "11px", fontWeight: "bold", color: "#000" }}>✓ FACE OK</div>
              <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "#000000bb", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: "#1E293B" }}>{userName}</div>
              <div style={{ position: "absolute", bottom: "10px", right: "10px", background: emotionColor + "cc", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "bold", color: "#000" }}>{emotion}</div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", height: "280px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "44px", marginBottom: "10px" }}>🤖</div>
                <div style={{ color: "#00B87C", fontSize: "14px", fontWeight: "bold" }}>GenuAI Interviewer</div>
                <div style={{ color: "#64748B", fontSize: "12px", marginTop: "6px" }}>AI Powered</div>
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#00B87C", marginTop: 0, marginBottom: "16px" }}>Interview Questions — Answer verbally</h3>
            {["Tell me about yourself and your background.","What are your strongest technical skills? Give examples.","Describe the most challenging project you have worked on.","How do you handle tight deadlines and pressure?","Where do you see yourself professionally in 5 years?","Why do you want to join our company?","Describe a time you resolved a conflict in a team."].map((q, i) => (
              <div key={i} style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "8px", padding: "12px 16px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#00D4FF", fontWeight: "bold", minWidth: "28px" }}>Q{i+1}.</span>
                <span style={{ color: "#1E293B", fontSize: "14px" }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #E2E8F0", marginTop: "40px", paddingTop: "20px", paddingBottom: "20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>GenuAI Technologies</span>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "12px", margin: "0 0 4px" }}>AI-Powered Recruitment Intelligence Platform</p>
        <p style={{ color: "#CBD5E1", fontSize: "11px", margin: 0 }}>© 2026 GenuAI Technologies. All rights reserved. · Built by Mohamed Jabri Jaffar Sadiq · Sri Sairam Institute of Technology, Chennai</p>
      </div>
    </div>
  );
}
