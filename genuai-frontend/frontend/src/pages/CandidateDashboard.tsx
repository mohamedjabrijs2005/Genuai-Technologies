import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { checkATS, detectFake, scoreSkills, runTriangle, evaluateAI, submitAssessment, sendEmail } from "../services/api";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  user: any;
  onLogout: () => void;
  onInterview?: () => void;
  onResume?: () => void;
}

const ROLES = ["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"];

export default function CandidateDashboard({ user, onLogout, onInterview, onResume }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [answers, setAnswers] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [streakBonus, setStreakBonus] = useState(0);
  const [cheatCount, setCheatCount] = useState(0);
  const [cheatWarning, setCheatWarning] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [stressStatus, setStressStatus] = useState<string>("");
  const stressRef = useRef<any>(null);
  const stressAnalyserRef = useRef<AnalyserNode | null>(null);
  const [pitch, setPitch] = useState("");
  const [recTimer, setRecTimer] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoMode, setVideoMode] = useState<"idle"|"recording"|"recorded">("idle");
  const [pitchMode, setPitchMode] = useState<"video"|"audio"|"text">("video");
  const [keystrokeData, setKeystrokeData] = useState<number[]>([]);
  const [klevelMode, setKlevelMode] = useState(false);
  const [klevelQuestion, setKlevelQuestion] = useState<any>(null);
  const [klevelLevel, setKlevelLevel] = useState(1);
  const [klevelScore, setKlevelScore] = useState(0);
  const [klevelSelected, setKlevelSelected] = useState("");
  const [klevelResult, setKlevelResult] = useState<any>(null);
  const [klevelLoading, setKlevelLoading] = useState(false);
  const [klevelFeedback, setKlevelFeedback] = useState<any>(null);
  const [keystrokeAlert, setKeystrokeAlert] = useState("");
  const lastKeyTime = useRef<number>(0);

  const userName = user?.user?.name || user?.name || "Candidate";
  const userEmail = user?.user?.email || user?.email || "";
  const userId = user?.user?.id || user?.id || 1;

  useEffect(() => {
    if (step !== 2) return;
    // Enter fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    const onHide = () => {
      if (document.hidden) {
        setCheatCount(p => p + 1);
        setCheatWarning("Tab switch detected! -10 points penalty.");
        setTimeout(() => setCheatWarning(""), 3000);
      }
    };
    const onCopy = (e: any) => { e.preventDefault(); setCheatWarning("Copy detected! This is logged."); setTimeout(() => setCheatWarning(""), 3000); };
    const onRC = (e: any) => { e.preventDefault(); setCheatWarning("Right-click disabled during test!"); setTimeout(() => setCheatWarning(""), 3000); };
    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onRC);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onRC);
      // Exit fullscreen when test done
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, [step]);

  const startRec = async () => {
    setStressLevel(0);
    setStressStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => { setAudioBlob(new Blob(chunks, { type: "audio/webm" })); setPitch("Voice pitch recorded successfully"); };
      mr.start();
      setIsRecording(true);
      setRecTimer(0);
      try {
        const audioCtx = new AudioContext();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        stressAnalyserRef.current = analyser;
        stressRef.current = setInterval(() => {
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a,b) => a+b,0) / data.length;
          const stress = Math.min(100, Math.round(avg * 2.5));
          setStressLevel(stress);
        }, 500);
      } catch {}
      timerRef.current = setInterval(() => setRecTimer(t => t + 1), 1000);
    } catch { setPitch("Microphone unavailable. Please type your pitch below."); }
  };

  const stopRec = () => {
    mediaRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
    clearInterval(stressRef.current);
    if (stressAnalyserRef.current) {
      const data = new Uint8Array(stressAnalyserRef.current.frequencyBinCount);
      stressAnalyserRef.current.getByteFrequencyData(data);
      const avg = data.reduce((a,b) => a+b,0) / data.length;
      const stress = Math.min(100, Math.round(avg * 2.5));
      setStressLevel(stress);
      setStressStatus(stress > 70 ? "High stress detected — take a deep breath!" : stress > 40 ? "Moderate nervousness — you are doing well!" : "Calm and confident voice detected!");
    }
  };

  const analyzeKeystroke = () => {
    const now = Date.now();
    if (lastKeyTime.current > 0) {
      const gap = now - lastKeyTime.current;
      setKeystrokeData(prev => {
        const updated = [...prev, gap];
        if (updated.length >= 10) {
          const avg = updated.reduce((a,b) => a+b, 0) / updated.length;
          const variance = updated.reduce((a,b) => a + Math.pow(b-avg,2), 0) / updated.length;
          if (avg < 80) setKeystrokeAlert("Typing speed too fast — possible AI/paste detected!");
          else if (variance < 100) setKeystrokeAlert("Unusually uniform typing — possible automated input!");
          else setKeystrokeAlert("");
        }
        return updated.slice(-20);
      });
    }
    lastKeyTime.current = now;
  };

  const startKlevel = async () => {
    setKlevelLoading(true);
    setKlevelResult(null);
    setKlevelFeedback(null);
    setKlevelScore(0);
    setKlevelLevel(1);
    setKlevelSelected("");
    try {
      const res = await axios.post(API + "/klevel/start", { role });
      setKlevelQuestion(res.data.question);
      setKlevelLevel(1);
      setKlevelMode(true);
    } catch { alert("Failed to start K-Level test"); }
    setKlevelLoading(false);
  };

  const submitKlevelAnswer = async () => {
    if (!klevelSelected) { alert("Please select an answer!"); return; }
    setKlevelLoading(true);
    try {
      const res = await axios.post(API + "/klevel/answer", {
        question_id: klevelQuestion.id,
        selected_answer: klevelSelected,
        current_level: klevelLevel,
        total_score: klevelScore,
        role
      });
      setKlevelFeedback(res.data);
      setKlevelScore(res.data.total_score);
      if (res.data.completed) {
        setKlevelResult(res.data);
        setKlevelMode(false);
      } else {
        setTimeout(() => {
          setKlevelQuestion(res.data.next_question);
          setKlevelLevel(res.data.current_level);
          setKlevelSelected("");
          setKlevelFeedback(null);
        }, 2000);
      }
    } catch { alert("Failed to submit answer"); }
    setKlevelLoading(false);
  };

  const handleStep1 = async () => {
    if (!github.trim()) { alert("GitHub profile URL is required!"); return; }
    if (!linkedin.trim()) { alert("LinkedIn profile URL is required!"); return; }
    if (!resumeText.trim()) { alert("Please upload your resume PDF!"); return; }
    if (!skills.trim()) { alert("Please enter your skills!"); return; }
    setLoading(true);
    try {
      const r = await checkATS({ resume_text: resumeText + " github:" + github + " linkedin:" + linkedin, job_description: "Looking for " + role + " with skills in " + skills });
      setAtsScore(r.data.ats_score || 70);
    } catch { setAtsScore(70); }
    setLoading(false);
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const testRaw = Math.round((klevelScore / 15) * 100);
      const testAdj = Math.max(0, testRaw - cheatCount * 10);
      const skillsArr = skills.split(",").map((s: string) => s.trim());

      const [fakeRes, skillRes, aiRes] = await Promise.all([
        detectFake({ resume_text: resumeText, skills: skillsArr, test_score: testAdj, interview_score: 70 }),
        scoreSkills({ answers, cheat_events: cheatCount }),
        evaluateAI({ resume_text: resumeText, skills: skillsArr, test_score: testAdj, interview_pitch: pitch, role }),
      ]);

      const triangleRes = await runTriangle({
        resume_score: atsScore,
        interview_score: aiRes.data.interview_score || 70,
        test_score: skillRes.data.test_score || testAdj,
        authenticity_score: fakeRes.data.authenticity_score || 80,
      });

      const final: any = {
        ...triangleRes.data, ...aiRes.data,
        ats_score: atsScore,
        test_score: skillRes.data.test_score || testAdj,
        authenticity_score: fakeRes.data.authenticity_score || 80,
        cheat_count: cheatCount,
        key_strengths: aiRes.data.key_strengths || ["Problem Solving", "Communication", "Technical Skills"],
        improvement_plan: aiRes.data.improvement_plan || ["Practice more coding challenges", "Improve system design knowledge", "Work on communication skills"],
      };

      await submitAssessment({ user_id: userId, resume_text: resumeText, skills, ats_score: atsScore, resume_score: atsScore, interview_score: final.interview_score || 70, test_score: final.test_score, consistency_score: final.consistency_score, overall_score: final.overall_score, authenticity_score: final.authenticity_score, verdict: final.verdict, triangle_status: final.triangle_status, salary_min: final.salary_min, salary_max: final.salary_max, improvement_plan: JSON.stringify(final.improvement_plan || []) });
      await sendEmail({ candidateEmail: userEmail, candidateName: userName, overallScore: final.overall_score, verdict: final.verdict, salaryMin: final.salary_min, salaryMax: final.salary_max });
      setResult(final);
      setStep(4);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const vc = result?.verdict === "HIRE" ? "#00B87C" : result?.verdict === "REVIEW" ? "#F59E0B" : "#FF4444";
  const radarData = result ? [
    { s: "ATS", v: result.ats_score },
    { s: "Test", v: result.test_score },
    { s: "Interview", v: result.interview_score || 70 },
    { s: "Authentic", v: result.authenticity_score },
    { s: "Consistency", v: result.consistency_score },
  ] : [];

  const inp: any = { width: "100%", padding: "12px", marginBottom: "16px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "10px", color: "#1E293B", fontSize: "14px", boxSizing: "border-box" };
  const btn: any = { width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "16px", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginTop: "8px", boxShadow: "0 4px 15px rgba(102,126,234,0.3)" };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, color: "#00B87C" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span></h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ color: "#94A3B8" }}>Welcome, {userName}</span>
          {onResume && <button onClick={onResume} style={{ padding: "8px 16px", background: "#A78BFA", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Resume Generator</button>}
          {onInterview && <button onClick={onInterview} style={{ padding: "8px 16px", background: "#00D4FF", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Interview Room</button>}
          <button onClick={onLogout} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #FF4444", color: "#FF4444", borderRadius: "10px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
        {["Profile and Resume", "Skill Test", "Voice Pitch", "Results"].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "10px", background: step === i+1 ? "linear-gradient(135deg, #667eea, #764ba2)" : step > i+1 ? "#DCFCE7" : "#F1F5F9", color: step === i+1 ? "#fff" : step > i+1 ? "#16A34A" : "#94A3B8", fontSize: "13px", fontWeight: "bold" }}>
            {i+1}. {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "#00B87C" }}>Step 1 - Profile and Resume</h2>
          <label style={{ color: "#94A3B8", fontSize: "13px" }}>Select Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={inp}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <label style={{ color: "#94A3B8", fontSize: "13px" }}>GitHub Profile URL <span style={{ color: "#FF4444" }}>*</span></label>
          <input placeholder="https://github.com/yourusername" value={github} onChange={e => setGithub(e.target.value)} style={inp} />
          <label style={{ color: "#94A3B8", fontSize: "13px" }}>LinkedIn Profile URL <span style={{ color: "#FF4444" }}>*</span></label>
          <input placeholder="https://linkedin.com/in/yourusername" value={linkedin} onChange={e => setLinkedin(e.target.value)} style={inp} />
          <label style={{ color: "#94A3B8", fontSize: "13px" }}>Upload Resume PDF <span style={{ color: "#FF4444" }}>*</span></label>
          <input type="file" accept=".pdf" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
                const pdf = await pdfjsLib.getDocument({ data: reader.result as ArrayBuffer }).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const ct = await page.getTextContent();
                  text += ct.items.map((item: any) => item.str).join(" ") + "\n";
                }
                setResumeText(text);
              } catch { alert("Could not read PDF. Please paste resume text below."); }
            };
            reader.readAsArrayBuffer(file);
          }} style={inp} />
          {resumeText && <div style={{ padding: "8px 12px", background: "#DCFCE7", borderRadius: "6px", color: "#00B87C", fontSize: "13px", marginBottom: "12px" }}>PDF loaded successfully!</div>}
          <label style={{ color: "#94A3B8", fontSize: "13px" }}>Your Skills (comma separated)</label>
          <input placeholder="Python, React, SQL, Machine Learning..." value={skills} onChange={e => setSkills(e.target.value)} style={inp} />
          {atsScore > 0 && <div style={{ padding: "10px", background: "#DCFCE7", borderRadius: "10px", color: "#00B87C", marginBottom: "12px" }}>ATS Score: {atsScore}%</div>}
          <button onClick={handleStep1} disabled={loading || !resumeText} style={btn}>{loading ? "Analyzing Resume..." : "Analyze and Continue"}</button>
        </div>
      )}

      {/* K-Level Test Modal */}
      {klevelMode && klevelQuestion && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "600px", width: "100%", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "4px" }}>Adaptive K-Level Skill Test</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[1,2,3,4,5].map(l => (
                    <div key={l} style={{ width: "32px", height: "6px", borderRadius: "3px", background: l < klevelLevel ? "#00B87C" : l === klevelLevel ? "#667EEA" : "#E2E8F0" }}/>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#667EEA" }}>K{klevelLevel}</div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Score: {klevelScore}/{15}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #667EEA11, #764BA211)", border: "1.5px solid #667EEA33", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <span style={{ padding: "3px 10px", background: "#667EEA", borderRadius: "20px", color: "#fff", fontSize: "12px", fontWeight: "700" }}>K{klevelLevel} — {klevelLevel === 1 ? "Easy" : klevelLevel === 2 ? "Medium" : klevelLevel === 3 ? "Hard" : klevelLevel === 4 ? "Advanced" : "Expert"}</span>
                <span style={{ padding: "3px 10px", background: "#F1F5F9", borderRadius: "20px", color: "#64748B", fontSize: "12px" }}>{klevelQuestion.marks} mark{klevelQuestion.marks > 1 ? "s" : ""}</span>
              </div>
              <p style={{ color: "#1E293B", fontSize: "16px", fontWeight: "600", margin: 0, lineHeight: "1.5" }}>{klevelQuestion.question_text}</p>
            </div>

            {klevelFeedback ? (
              <div style={{ padding: "14px", background: klevelFeedback.is_correct ? "#F0FDF4" : "#FEF2F2", border: "1.5px solid " + (klevelFeedback.is_correct ? "#BBF7D0" : "#FECACA"), borderRadius: "12px", marginBottom: "16px" }}>
                <div style={{ fontWeight: "700", color: klevelFeedback.is_correct ? "#16A34A" : "#DC2626", marginBottom: "6px" }}>
                  {klevelFeedback.is_correct ? "✅ Correct! Moving to K" + klevelFeedback.current_level : "❌ Wrong! Correct answer: " + klevelFeedback.correct_answer}
                </div>
                <div style={{ color: "#64748B", fontSize: "13px" }}>{klevelFeedback.explanation}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {["A","B","C","D"].map(opt => (
                  <button key={opt} onClick={() => setKlevelSelected(opt)}
                    style={{ padding: "12px 16px", borderRadius: "10px", border: "1.5px solid " + (klevelSelected === opt ? "#667EEA" : "#E2E8F0"), background: klevelSelected === opt ? "#EEF2FF" : "#F8FAFC", color: klevelSelected === opt ? "#667EEA" : "#1E293B", fontWeight: klevelSelected === opt ? "700" : "400", cursor: "pointer", textAlign: "left", fontSize: "14px", transition: "all 0.2s" }}>
                    <span style={{ fontWeight: "700", marginRight: "8px" }}>{opt}.</span>
                    {klevelQuestion["option_" + opt.toLowerCase()]}
                  </button>
                ))}
              </div>
            )}

            {!klevelFeedback && (
              <button onClick={submitKlevelAnswer} disabled={klevelLoading || !klevelSelected}
                style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #667EEA, #764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                {klevelLoading ? "Checking..." : "Submit Answer →"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* K-Level Result */}
      {klevelResult && (
        <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "24px", marginBottom: "20px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧠</div>
          <h3 style={{ color: "#1E293B", margin: "0 0 8px" }}>K-Level Test Complete!</h3>
          <div style={{ fontSize: "40px", fontWeight: "800", color: klevelResult.tier_color, margin: "12px 0" }}>{klevelResult.total_score}/15</div>
          <span style={{ padding: "6px 20px", borderRadius: "20px", background: klevelResult.tier_color + "22", color: klevelResult.tier_color, fontWeight: "700", fontSize: "16px" }}>{klevelResult.tier}</span>
          <div style={{ color: "#64748B", fontSize: "14px", marginTop: "12px" }}>{klevelResult.message}</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
            {[1,2,3,4,5].map(l => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: l < klevelLevel ? "#00B87C" : l === klevelLevel && !klevelResult.is_correct ? "#FF4444" : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "13px", margin: "0 auto 4px" }}>K{l}</div>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>{l === 1 ? "Easy" : l === 2 ? "Mid" : l === 3 ? "Hard" : l === 4 ? "Adv" : "Expert"}</div>
              </div>
            ))}
          </div>
          <button onClick={startKlevel} style={{ marginTop: "16px", padding: "10px 24px", background: "linear-gradient(135deg, #667EEA, #764BA2)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Retry K-Level Test</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧠</div>
            <h2 style={{ color: "#1E293B", margin: "0 0 8px" }}>Adaptive K-Level Skill Test</h2>
            <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 24px" }}>Questions get progressively harder. Answer correctly to advance levels.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
              {([["K1","Easy","#22C55E","1"],["K2","Medium","#F59E0B","2"],["K3","Hard","#F97316","3"],["K4","Advanced","#EF4444","4"],["K5","Expert","#8B5CF6","5"]] as string[][]).map(([k,label,color,marks]) => (
                <div key={k} style={{ background: color + "15", border: "1.5px solid " + color + "44", borderRadius: "12px", padding: "10px 16px", minWidth: "80px" }}>
                  <div style={{ fontWeight: "800", color: color, fontSize: "16px" }}>{k}</div>
                  <div style={{ color: "#64748B", fontSize: "11px" }}>{label}</div>
                  <div style={{ color: color, fontSize: "12px", fontWeight: "600" }}>{marks} mark{Number(marks) > 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", marginBottom: "24px" }}>
              <div style={{ color: "#64748B", fontSize: "13px" }}>✅ Answer correctly → advance to next level &nbsp;|&nbsp; ❌ Wrong → test stops &nbsp;|&nbsp; 🏆 Max score: 15 marks</div>
            </div>
            {!klevelMode && !klevelResult && (
              <button onClick={startKlevel} disabled={klevelLoading}
                style={{ padding: "16px 40px", background: "linear-gradient(135deg, #667EEA, #764BA2)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", fontSize: "16px", boxShadow: "0 4px 15px rgba(102,126,234,0.4)" }}>
                {klevelLoading ? "Loading question..." : "🚀 Start K-Level Test"}
              </button>
            )}
          </div>

          {klevelMode && klevelQuestion && (
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "28px", marginTop: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Progress</div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1,2,3,4,5].map(l => (
                      <div key={l} style={{ width: "36px", height: "7px", borderRadius: "4px", background: l < klevelLevel ? "#22C55E" : l === klevelLevel ? "#667EEA" : "#E2E8F0", transition: "background 0.3s" }}/>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#667EEA" }}>K{klevelLevel}</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>{klevelLevel === 1 ? "Easy" : klevelLevel === 2 ? "Medium" : klevelLevel === 3 ? "Hard" : klevelLevel === 4 ? "Advanced" : "Expert"} · {klevelScore}/{15} pts</div>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, #667EEA11, #764BA211)", border: "1.5px solid #667EEA33", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ padding: "4px 12px", background: "#667EEA", borderRadius: "20px", color: "#fff", fontSize: "12px", fontWeight: "700" }}>K{klevelLevel} — {klevelLevel === 1 ? "Easy" : klevelLevel === 2 ? "Medium" : klevelLevel === 3 ? "Hard" : klevelLevel === 4 ? "Advanced" : "Expert"}</span>
                  <span style={{ padding: "4px 12px", background: "#F1F5F9", borderRadius: "20px", color: "#64748B", fontSize: "12px" }}>{klevelQuestion.marks} mark{klevelQuestion.marks > 1 ? "s" : ""}</span>
                  <span style={{ padding: "4px 12px", background: "#FFF7ED", borderRadius: "20px", color: "#F97316", fontSize: "12px" }}>Anti-cheat active</span>
                </div>
                <p style={{ color: "#1E293B", fontSize: "16px", fontWeight: "600", margin: 0, lineHeight: "1.6" }}>{klevelQuestion.question_text}</p>
              </div>

              {klevelFeedback ? (
                <div style={{ padding: "16px", background: klevelFeedback.is_correct ? "#F0FDF4" : "#FEF2F2", border: "1.5px solid " + (klevelFeedback.is_correct ? "#BBF7D0" : "#FECACA"), borderRadius: "12px", marginBottom: "16px" }}>
                  <div style={{ fontWeight: "700", color: klevelFeedback.is_correct ? "#16A34A" : "#DC2626", marginBottom: "6px", fontSize: "15px" }}>
                    {klevelFeedback.is_correct ? "✅ Correct! +" + klevelFeedback.marks_earned + " mark — moving to K" + (klevelLevel + 1) : "❌ Incorrect! Correct answer: " + klevelFeedback.correct_answer}
                  </div>
                  <div style={{ color: "#64748B", fontSize: "13px" }}>{klevelFeedback.explanation}</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  {["A","B","C","D"].map(opt => (
                    <button key={opt} onClick={() => setKlevelSelected(opt)}
                      style={{ padding: "14px 16px", borderRadius: "12px", border: "1.5px solid " + (klevelSelected === opt ? "#667EEA" : "#E2E8F0"), background: klevelSelected === opt ? "#EEF2FF" : "#F8FAFC", color: klevelSelected === opt ? "#667EEA" : "#1E293B", fontWeight: klevelSelected === opt ? "700" : "400", cursor: "pointer", textAlign: "left", fontSize: "14px", transition: "all 0.15s" }}>
                      <span style={{ fontWeight: "700", marginRight: "8px", color: klevelSelected === opt ? "#667EEA" : "#94A3B8" }}>{opt}.</span>
                      {klevelQuestion["option_" + opt.toLowerCase()]}
                    </button>
                  ))}
                </div>
              )}

              {!klevelFeedback && (
                <button onClick={submitKlevelAnswer} disabled={klevelLoading || !klevelSelected}
                  style={{ width: "100%", padding: "15px", background: klevelSelected ? "linear-gradient(135deg, #667EEA, #764BA2)" : "#E2E8F0", color: klevelSelected ? "#fff" : "#94A3B8", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: klevelSelected ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                  {klevelLoading ? "Checking..." : klevelSelected ? "Submit Answer →" : "Select an option to continue"}
                </button>
              )}
            </div>
          )}

          {klevelResult && (
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "32px", marginTop: "20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>
                {klevelResult.total_score >= 11 ? "🏆" : klevelResult.total_score >= 7 ? "🎯" : klevelResult.total_score >= 4 ? "📈" : "📚"}
              </div>
              <h3 style={{ color: "#1E293B", margin: "0 0 6px" }}>K-Level Test Complete!</h3>
              <div style={{ fontSize: "48px", fontWeight: "800", color: klevelResult.tier_color, margin: "10px 0" }}>{klevelResult.total_score}<span style={{ fontSize: "24px", color: "#94A3B8" }}>/15</span></div>
              <span style={{ padding: "8px 24px", borderRadius: "24px", background: klevelResult.tier_color + "22", color: klevelResult.tier_color, fontWeight: "700", fontSize: "18px" }}>{klevelResult.tier}</span>
              <div style={{ color: "#64748B", fontSize: "14px", marginTop: "14px", marginBottom: "20px" }}>{klevelResult.message}</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
                {[1,2,3,4,5].map(l => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: l < klevelLevel ? "#22C55E" : l === klevelLevel && !klevelResult.is_correct ? "#EF4444" : l <= klevelResult.total_score ? "#667EEA" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: l < klevelLevel || l <= klevelResult.total_score ? "#fff" : "#94A3B8", fontWeight: "700", fontSize: "13px", margin: "0 auto 4px", boxShadow: l < klevelLevel ? "0 2px 8px #22C55E44" : "none" }}>K{l}</div>
                    <div style={{ fontSize: "10px", color: "#94A3B8" }}>{l === 1 ? "Easy" : l === 2 ? "Mid" : l === 3 ? "Hard" : l === 4 ? "Adv" : "Expert"}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={startKlevel} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #667EEA, #764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>🔄 Retry Test</button>
                <button onClick={() => setStep(3)} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #00B87C, #00D4AA)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Continue to Pitch →</button>
              </div>
            </div>
          )}
        </div>
      )}

            {step === 3 && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{ color: "#00B87C" }}>Step 3 - Pitch Recording</h2>
          <p style={{ color: "#94A3B8" }}>Choose how you want to deliver your pitch.</p>

          {/* Mode selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[["video", "Video Pitch"], ["audio", "Voice Pitch"], ["text", "Text Pitch"]].map(([m, l]) => (
              <button key={m} onClick={() => setPitchMode(m as any)} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: pitchMode === m ? "#00B87C" : "#161B22", color: pitchMode === m ? "#000" : "#64748B", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>{l}</button>
            ))}
          </div>

          {/* VIDEO PITCH */}
          {pitchMode === "video" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "16px" }}>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                {videoMode === "recorded" && videoBlob ? (
                  <video ref={videoPreviewRef} controls style={{ width: "100%", borderRadius: "10px", background: "#000", maxHeight: "300px" }} src={URL.createObjectURL(videoBlob)} />
                ) : (
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", borderRadius: "10px", background: "#000", maxHeight: "300px" }} />
                )}
                {videoMode === "recording" && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "#FF4444", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "bold", color: "#1E293B" }}>
                    REC {recTimer}s
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                {videoMode === "idle" && (
                  <button onClick={async () => {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                      if (videoRef.current) videoRef.current.srcObject = stream;
                      mediaRef.current = new MediaRecorder(stream);
                      const chunks: BlobPart[] = [];
                      mediaRef.current.ondataavailable = e => chunks.push(e.data);
                      mediaRef.current.onstop = () => {
                        const blob = new Blob(chunks, { type: "video/webm" });
                        setVideoBlob(blob);
                        setAudioBlob(blob);
                        setPitch("Video pitch recorded successfully");
                        setVideoMode("recorded");
                        stream.getTracks().forEach(t => t.stop());
                      };
                      mediaRef.current.start();
                      setVideoMode("recording");
                      setRecTimer(0);
                      timerRef.current = setInterval(() => setRecTimer(t => t + 1), 1000);
                    } catch { alert("Camera access required for video pitch. Please use Voice or Text pitch instead."); }
                  }} style={{ ...btn, background: "#00B87C", color: "#000", padding: "10px 24px" }}>
                    Start Video Recording
                  </button>
                )}
                {videoMode === "recording" && (
                  <button onClick={() => {
                    mediaRef.current?.stop();
                    clearInterval(timerRef.current);
                  }} style={{ ...btn, background: "#FF4444", color: "#1E293B", padding: "10px 24px" }}>
                    Stop Recording
                  </button>
                )}
                {videoMode === "recorded" && (
                  <>
                    <button onClick={() => { setVideoMode("idle"); setVideoBlob(null); setAudioBlob(null); setPitch(""); setRecTimer(0); }} style={{ ...btn, background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#94A3B8", padding: "10px 20px" }}>
                      Record Again
                    </button>
                    <div style={{ padding: "10px 20px", background: "#DCFCE7", borderRadius: "10px", color: "#00B87C", fontWeight: "bold", fontSize: "13px" }}>
                      Video recorded ({recTimer}s)
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* AUDIO PITCH */}
          {pitchMode === "audio" && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "24px", marginBottom: "16px", textAlign: "center" }}>
              {isRecording ? (
                <div>
                  <div style={{ fontSize: "56px" }}>🎙️</div>
                  <div style={{ color: "#FF4444", fontWeight: "bold", margin: "8px 0", fontSize: "18px" }}>Recording... {recTimer}s</div>
                  <button onClick={stopRec} style={{ ...btn, background: "#FF4444", color: "#1E293B", marginTop: "12px" }}>Stop Recording</button>
                </div>
              ) : audioBlob ? (
                <div>
                  <div style={{ fontSize: "56px" }}>✅</div>
                  <div style={{ color: "#00B87C", fontWeight: "bold", margin: "8px 0" }}>Voice recorded ({recTimer}s)</div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                    <button onClick={() => { const url = URL.createObjectURL(audioBlob); new Audio(url).play(); }} style={{ ...btn, background: "#DBEAFE", border: "1px solid #00D4FF", color: "#00D4FF", padding: "8px 16px", fontSize: "13px" }}>▶ Replay</button>
                    <button onClick={startRec} style={{ ...btn, background: "#F1F5F9", border: "1px solid #00B87C", color: "#00B87C", padding: "8px 16px", fontSize: "13px" }}>Record Again</button>
                  </div>
                  {stressStatus && (
                    <div style={{ marginTop: "16px", padding: "12px 16px", background: stressLevel > 70 ? "#FF444422" : stressLevel > 40 ? "#F59E0B22" : "#00B87C22", border: "1px solid " + (stressLevel > 70 ? "#FF4444" : stressLevel > 40 ? "#F59E0B" : "#00B87C"), borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: stressLevel > 70 ? "#FF4444" : stressLevel > 40 ? "#F59E0B" : "#00B87C", fontWeight: "bold", fontSize: "13px" }}>Voice Stress Analysis</span>
                        <span style={{ color: stressLevel > 70 ? "#FF4444" : stressLevel > 40 ? "#F59E0B" : "#00B87C", fontWeight: "bold" }}>{stressLevel}%</span>
                      </div>
                      <div style={{ background: "#F1F5F9", borderRadius: "4px", height: "8px", marginBottom: "8px" }}>
                        <div style={{ width: stressLevel + "%", background: stressLevel > 70 ? "#FF4444" : stressLevel > 40 ? "#F59E0B" : "#00B87C", height: "8px", borderRadius: "4px" }}/>
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: "12px" }}>{stressStatus}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "12px" }}>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "56px" }}>🎤</div>
                  <div style={{ color: "#94A3B8", margin: "8px 0" }}>Click to record your voice pitch</div>
                  <button onClick={startRec} style={{ ...btn, background: "#00B87C", color: "#000", marginTop: "8px" }}>Start Recording</button>
                </div>
              )}
            </div>
          )}

          {/* TEXT PITCH */}
          {pitchMode === "text" && (
            <div style={{ marginBottom: "16px" }}>
              {keystrokeAlert && (
                <div style={{ padding: "10px 14px", background: "#FF444422", border: "1px solid #FF4444", borderRadius: "10px", color: "#FF4444", fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>⚠️ {keystrokeAlert}</div>
              )}
              {keystrokeData.length >= 5 && !keystrokeAlert && (
                <div style={{ padding: "8px 14px", background: "#00B87C22", border: "1px solid #00B87C", borderRadius: "10px", color: "#00B87C", fontSize: "12px", marginBottom: "8px" }}>✅ Keystroke pattern: Natural human typing detected</div>
              )}
              <textarea placeholder="Tell us about yourself, your experience, your key projects and why you are the right candidate for this role..." value={pitch} onChange={e => { setPitch(e.target.value); analyzeKeystroke(); }} onKeyDown={analyzeKeystroke} rows={8} style={inp} />
              <div style={{ color: "#94A3B8", fontSize: "12px", textAlign: "right" }}>{pitch.length} characters</div>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || (!pitch && !audioBlob && !videoBlob)} style={{ ...btn, width: "100%", padding: "14px", background: loading ? "#1a4a3a" : "#00B87C", color: loading ? "#00B87C" : "#000", fontSize: "15px", marginTop: "8px" }}>
            {loading ? "AI Evaluating... Please wait..." : "Submit and Get Score"}
          </button>
        </div>
      )}

      {step === 4 && result && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ color: "#00B87C" }}>Your GenuAI Score Report</h2>
          <div style={{ background: "#FFFFFF", border: "2px solid " + vc, borderRadius: "16px", padding: "30px", textAlign: "center", marginBottom: "20px" }}>
            {/* Ranking Badge */}
            <div style={{ marginBottom: "12px" }}>
              {result.overall_score >= 85 ? (
                <span style={{ background: "#FFD700", color: "#000", padding: "6px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>🥇 GOLD — Top Performer</span>
              ) : result.overall_score >= 70 ? (
                <span style={{ background: "#C0C0C0", color: "#000", padding: "6px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>🥈 SILVER — Strong Candidate</span>
              ) : result.overall_score >= 50 ? (
                <span style={{ background: "#CD7F32", color: "#1E293B", padding: "6px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>🥉 BRONZE — Average Candidate</span>
              ) : (
                <span style={{ background: "#FF4444", color: "#1E293B", padding: "6px 20px", borderRadius: "20px", fontWeight: "bold", fontSize: "14px" }}>⚠️ NEEDS IMPROVEMENT</span>
              )}
            </div>
            <div style={{ fontSize: "80px", fontWeight: "bold", color: vc, lineHeight: "1" }}>{result.overall_score}%</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1E293B", margin: "12px 0 8px" }}>
              {result.verdict === "HIRE" ? "✅ HIRE" : result.verdict === "REVIEW" ? "⚠️ REVIEW" : "❌ REJECT"}
            </div>
            <div style={{ color: "#94A3B8" }}>Triangle Status: <span style={{ color: vc }}>{result.triangle_status}</span></div>
            {result.cheat_count > 0 && <div style={{ color: "#FF4444", marginTop: "8px", fontSize: "13px" }}>{result.cheat_count} anti-cheat violation(s) detected</div>}
          </div>

          <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
            <h3 style={{ color: "#00D4FF", textAlign: "center", marginTop: 0 }}>Skill Radar Chart</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#30363D" />
                <PolarAngleAxis dataKey="s" tick={{ fill: "#94A3B8", fontSize: 13 }} />
                <Radar dataKey="v" stroke="#00B87C" fill="#00B87C" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
            <h3 style={{ color: "#00D4FF", textAlign: "center", marginTop: 0 }}>Skill Consistency Triangle</h3>
            <svg viewBox="0 0 300 260" style={{ width: "100%", maxHeight: "240px" }}>
              <polygon points="150,20 280,240 20,240" fill="none" stroke="#30363D" strokeWidth="2"/>
              <polygon points="150,20 280,240 20,240" fill={vc + "22"} stroke={vc} strokeWidth="2"/>
              <text x="150" y="14" textAnchor="middle" fill="#00D4FF" fontSize="11">Resume {result.ats_score}%</text>
              <text x="290" y="252" textAnchor="middle" fill="#F59E0B" fontSize="11">Test {result.test_score}%</text>
              <text x="10" y="252" textAnchor="middle" fill="#A78BFA" fontSize="11">Interview {result.interview_score || 70}%</text>
              <text x="150" y="145" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold">{result.triangle_status}</text>
            </svg>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {[["ATS Score", result.ats_score, "#00B87C"], ["Test Score", result.test_score, "#00D4FF"], ["Interview", result.interview_score || 70, "#F59E0B"], ["Authenticity", result.authenticity_score, "#A78BFA"]].map(([l, v, c]: any) => (
              <div key={l} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center" }}>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: c }}>{v}%</div>
                <div style={{ color: "#94A3B8", fontSize: "14px" }}>{l}</div>
                <div style={{ marginTop: "8px", background: "#F1F5F9", borderRadius: "4px", height: "6px" }}>
                  <div style={{ width: v + "%", background: c, height: "6px", borderRadius: "4px" }}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "16px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ color: "#94A3B8", marginBottom: "8px" }}>Estimated Salary Range</div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00B87C" }}>Rs.{result.salary_min}L - Rs.{result.salary_max}L per year</div>
          </div>

          {result.key_strengths && result.key_strengths.length > 0 && (
            <div style={{ background: "#FFFFFF", border: "1px solid #00B87C", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ color: "#00B87C", marginTop: 0 }}>Key Strengths</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {result.key_strengths.map((s: string, i: number) => (
                  <span key={i} style={{ padding: "6px 14px", background: "#DCFCE7", color: "#00B87C", borderRadius: "20px", fontSize: "13px" }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.improvement_plan && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
              <h3 style={{ color: "#00D4FF", marginTop: 0 }}>Improvement Plan</h3>
              {(Array.isArray(result.improvement_plan) ? result.improvement_plan : (() => { try { return JSON.parse(result.improvement_plan); } catch { return [result.improvement_plan]; } })()).map((item: string, i: number) => (
                <p key={i} style={{ color: "#94A3B8", margin: "6px 0" }}>• {item}</p>
              ))}
            </div>
          )}

          {/* Personality DNA */}
          <div style={{ background: "#FFFFFF", border: "1px solid #A78BFA", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ color: "#A78BFA", marginTop: 0 }}>Personality DNA</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                ["Leadership", Math.min(100, Math.round((result.interview_score || 70) * 0.9 + (result.ats_score || 0) * 0.1)), "#F59E0B"],
                ["Creativity", Math.min(100, Math.round((result.ats_score || 70) * 0.7 + (result.test_score || 0) * 0.3)), "#00D4FF"],
                ["Teamwork", Math.min(100, Math.round((result.authenticity_score || 70) * 0.8 + (result.consistency_score || 0) * 0.2)), "#00B87C"],
                ["Integrity", Math.min(100, Math.round((result.authenticity_score || 70) * 0.9)), "#A78BFA"],
                ["Ambition", Math.min(100, Math.round((result.overall_score || 70) * 0.95)), "#FF6B6B"],
              ].map(([trait, score, color]: any) => (
                <div key={trait} style={{ background: "#F1F5F9", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#1E293B", fontSize: "13px", fontWeight: "bold" }}>{trait}</span>
                    <span style={{ color: color, fontWeight: "bold", fontSize: "13px" }}>{score}%</span>
                  </div>
                  <div style={{ background: "#F8FAFC", borderRadius: "4px", height: "8px" }}>
                    <div style={{ width: score + "%", background: color, height: "8px", borderRadius: "4px", transition: "width 1s" }}/>
                  </div>
                  <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "4px" }}>
                    {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Needs work"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap Heatmap */}
          <div style={{ background: "#FFFFFF", border: "1px solid #F59E0B", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ color: "#F59E0B", marginTop: 0 }}>Skill Gap Heatmap</h3>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginBottom: "16px" }}>Skills you need to improve for {role} role:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(role === "Software Engineer" ? ["System Design", "Microservices", "Cloud Architecture", "DevOps", "Testing"] :
                role === "AI Engineer" ? ["Deep Learning", "MLOps", "Data Pipeline", "Model Deployment", "Research"] :
                role === "Data Scientist" ? ["Statistics", "Feature Engineering", "Big Data", "Visualization", "A/B Testing"] :
                role === "Frontend Developer" ? ["Performance", "Accessibility", "Testing", "Animation", "PWA"] :
                role === "Backend Developer" ? ["System Design", "Caching", "Message Queues", "Security", "Scaling"] :
                role === "Full Stack Developer" ? ["DevOps", "Cloud", "Testing", "Performance", "Security"] :
                role === "DevOps Engineer" ? ["GitOps", "Service Mesh", "Observability", "FinOps", "Security"] :
                ["Product Analytics", "User Research", "Go-to-Market", "OKRs", "Roadmapping"]
              ).map((skill, i) => {
                const gap = Math.max(10, 100 - (result.test_score || 50) - i * 8);
                const color = gap > 60 ? "#FF4444" : gap > 40 ? "#F59E0B" : "#00B87C";
                return (
                  <div key={skill} style={{ background: color + "22", border: "1px solid " + color, borderRadius: "10px", padding: "8px 14px", textAlign: "center", minWidth: "120px" }}>
                    <div style={{ color: "#1E293B", fontSize: "12px", fontWeight: "bold" }}>{skill}</div>
                    <div style={{ color: color, fontSize: "11px", marginTop: "4px" }}>Gap: {gap}%</div>
                    <div style={{ background: "#F8FAFC", borderRadius: "4px", height: "4px", marginTop: "4px" }}>
                      <div style={{ width: gap + "%", background: color, height: "4px", borderRadius: "4px" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Candidate Journey Timeline */}
          <div style={{ background: "#FFFFFF", border: "1px solid #00D4FF", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ color: "#00D4FF", marginTop: 0 }}>🗺️ Candidate Journey Timeline</h3>
            <div style={{ position: "relative", paddingLeft: "24px" }}>
              {[
                { label: "Resume Uploaded", detail: "ATS Score: " + result.ats_score + "%", color: "#00B87C", icon: "📄", done: true },
                { label: "Skill Test Completed", detail: "Test Score: " + result.test_score + "%" + (result.cheat_count > 0 ? " ⚠️ " + result.cheat_count + " violation(s)" : " ✅ Clean"), color: result.cheat_count >= 3 ? "#FF4444" : "#F59E0B", icon: "📝", done: true },
                { label: "Pitch Submitted", detail: "Interview Score: " + (result.interview_score || 70) + "%", color: "#A78BFA", icon: "🎤", done: true },
                { label: "AI Evaluation", detail: "Authenticity: " + result.authenticity_score + "% | Consistency: " + result.consistency_score + "%", color: "#00D4FF", icon: "🤖", done: true },
                { label: "Triangle Analysis", detail: "Status: " + result.triangle_status, color: result.triangle_status === "CONSISTENT" ? "#00B87C" : result.triangle_status === "FLAGGED" ? "#FF4444" : "#F59E0B", icon: "🔺", done: true },
                { label: "Final Verdict", detail: result.verdict === "HIRE" ? "✅ Selected for Hiring" : result.verdict === "REVIEW" ? "⚠️ Under Review" : "❌ Not Selected", color: result.verdict === "HIRE" ? "#00B87C" : result.verdict === "REVIEW" ? "#F59E0B" : "#FF4444", icon: "🏆", done: true },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px", position: "relative" }}>
                  <div style={{ position: "absolute", left: "-24px", top: "0", bottom: i < 5 ? "-20px" : "0", width: "2px", background: i < 5 ? item.color + "44" : "transparent" }}/>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: item.color + "22", border: "2px solid " + item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, position: "relative", zIndex: 1 }}>{item.icon}</div>
                  <div style={{ flex: 1, paddingTop: "4px" }}>
                    <div style={{ color: "#1E293B", fontWeight: "bold", fontSize: "14px" }}>{item.label}</div>
                    <div style={{ color: item.color, fontSize: "12px", marginTop: "2px" }}>{item.detail}</div>
                  </div>
                  <div style={{ color: item.color, fontSize: "12px", fontWeight: "bold", paddingTop: "4px" }}>✓ Done</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lie Detector Score */}
          <div style={{ background: "#FFFFFF", border: "1px solid #FF6B6B", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ color: "#FF6B6B", marginTop: 0 }}>🔍 Lie Detector Analysis</h3>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginBottom: "16px" }}>AI-powered consistency check across all assessment stages</p>
            {(() => {
              const ats = result.ats_score || 0;
              const test = result.test_score || 0;
              const interview = result.interview_score || 70;
              const auth = result.authenticity_score || 0;
              const diff1 = Math.abs(ats - test);
              const diff2 = Math.abs(test - interview);
              const diff3 = Math.abs(ats - interview);
              const maxDiff = Math.max(diff1, diff2, diff3);
              const lieScore = Math.min(100, Math.round(maxDiff * 1.2 + (result.cheat_count || 0) * 15 + (auth < 50 ? 20 : 0)));
              const lieLevel = lieScore > 60 ? "HIGH RISK" : lieScore > 35 ? "MODERATE" : "LOW RISK";
              const lieColor = lieScore > 60 ? "#FF4444" : lieScore > 35 ? "#F59E0B" : "#00B87C";
              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: "48px", fontWeight: "bold", color: lieColor }}>{lieScore}%</div>
                      <div style={{ color: lieColor, fontWeight: "bold", fontSize: "16px" }}>{lieLevel}</div>
                      <div style={{ color: "#94A3B8", fontSize: "12px" }}>Deception Risk</div>
                    </div>
                    <div style={{ flex: 2, paddingLeft: "20px" }}>
                      {[
                        ["Resume vs Test Gap", diff1, diff1 > 30 ? "#FF4444" : "#00B87C"],
                        ["Test vs Interview Gap", diff2, diff2 > 30 ? "#FF4444" : "#00B87C"],
                        ["Resume vs Interview Gap", diff3, diff3 > 30 ? "#FF4444" : "#00B87C"],
                        ["Anti-cheat Violations", (result.cheat_count || 0) * 15, (result.cheat_count || 0) > 0 ? "#FF4444" : "#00B87C"],
                        ["Authenticity Factor", auth < 50 ? 100 - auth : 0, auth < 50 ? "#F59E0B" : "#00B87C"],
                      ].map(([label, val, color]: any) => (
                        <div key={label} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ color: "#94A3B8", fontSize: "11px" }}>{label}</span>
                            <span style={{ color: color, fontSize: "11px", fontWeight: "bold" }}>{Math.min(100, val)}%</span>
                          </div>
                          <div style={{ background: "#F1F5F9", borderRadius: "4px", height: "5px" }}>
                            <div style={{ width: Math.min(100, val) + "%", background: color, height: "5px", borderRadius: "4px" }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", background: lieColor + "11", border: "1px solid " + lieColor + "44", borderRadius: "10px", color: lieColor, fontSize: "13px", textAlign: "center" }}>
                    {lieScore > 60 ? "⚠️ Significant inconsistencies detected. Candidate scores vary widely across stages — possible skill inflation." : lieScore > 35 ? "⚡ Minor inconsistencies detected. Recommend further verification before final decision." : "✅ Scores are consistent across all stages. Candidate appears genuine and authentic."}
                  </div>
                </div>
              );
            })()}
          </div>

          <p style={{ color: "#94A3B8", textAlign: "center" }}>Report sent to your email!</p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px", marginBottom: "20px" }}>
            <button onClick={() => {
              const content = [
                "GENUAI TECHNOLOGIES — ASSESSMENT REPORT",
                "========================================",
                "Candidate: " + userName,
                "Email: " + userEmail,
                "Date: " + new Date().toLocaleDateString(),
                "",
                "SCORES",
                "------",
                "Overall Score: " + result.overall_score + "%",
                "ATS Score: " + result.ats_score + "%",
                "Test Score: " + result.test_score + "%",
                "Interview Score: " + (result.interview_score || 70) + "%",
                "Authenticity: " + result.authenticity_score + "%",
                "Consistency: " + result.consistency_score + "%",
                "",
                "VERDICT: " + result.verdict,
                "Triangle Status: " + result.triangle_status,
                "",
                "SALARY RANGE",
                "------------",
                "Rs." + result.salary_min + "L - Rs." + result.salary_max + "L per year",
                "",
                "KEY STRENGTHS",
                "-------------",
                ...(result.key_strengths || []).map((s: string) => "• " + s),
                "",
                "IMPROVEMENT PLAN",
                "----------------",
                ...(Array.isArray(result.improvement_plan) ? result.improvement_plan : [result.improvement_plan]).map((s: string) => "• " + s),
                "",
                "Anti-cheat violations: " + (result.cheat_count || 0),
                "",
                "========================================",
                "Powered by GenuAI Technologies",
                "AI-Powered Recruitment Intelligence",
              ].join("\n");
              const blob = new Blob([content], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "GenuAI-Report-" + userName.replace(/ /g, "-") + ".txt";
              a.click();
              URL.revokeObjectURL(url);
            }} style={{ padding: "12px 24px", background: "#00B87C", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              Download Report
            </button>
            <button onClick={() => { setStep(1); setResult(null); setAnswers([]); setResumeText(""); setSkills(""); setAtsScore(0); setCheatCount(0); setPitch(""); setAudioBlob(null); }} style={{ padding: "12px 24px", background: "#F1F5F9", border: "1.5px solid #E2E8F0", color: "#94A3B8", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              Start New Assessment
            </button>
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
