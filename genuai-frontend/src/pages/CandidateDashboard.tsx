import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
import { checkATS, detectFake, scoreSkills, runTriangle, evaluateAI, submitAssessment, sendEmail } from "../services/api";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Props {
  user: any;
  onLogout: () => void;
  onInterview?: () => void;
  onMock?: () => void;
  onResume?: () => void;
  onAMCAT?: (role: string, assessmentId?: number) => void;
}

const ROLES = ["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"];

export default function CandidateDashboard({ user, onLogout, onInterview, onResume, onMock, onAMCAT }: Props) {
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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
  const klevelVideoRef = useRef<HTMLVideoElement>(null);
  const klevelCanvasRef = useRef<HTMLCanvasElement>(null);
  const klevelStreamRef = useRef<MediaStream | null>(null);
  const klevelPrevFrameRef = useRef<ImageData | null>(null);
  const klevelMotionRef = useRef<any>(null);
  const klevelFaceRef = useRef<any>(null);
  const [klevelCamWarning, setKlevelCamWarning] = useState("");
  const [klevelFaceStatus, setKlevelFaceStatus] = useState<"ok"|"missing">("ok");
  const [klevelMotionAlert, setKlevelMotionAlert] = useState(false);
  const [klevelCamReady, setKlevelCamReady] = useState(false);
  const [violations, setViolations] = useState(0);

  const addViolation = (reason: string) => {
    if (!document.getElementById("klevel-active-marker")) return;

    console.log("Violation:", reason);
    setViolations(v => {
      const nv = v + 1;
      if (nv >= 3) {
        alert("❌ Test terminated due to malpractice");
        setKlevelResult({ score: 0, status: "terminated" });
        setKlevelMode(false);
        stopKlevelCamera();
      }
      return nv;
    });
  };
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [bestScore, setBestScore] = useState<any>(null);
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [jobSearch, setJobSearch] = useState("");
  const [showPractice, setShowPractice] = useState(false);
  const [practiceRole, setPracticeRole] = useState("Software Engineer");
  const [practiceLevel, setPracticeLevel] = useState(1);
  const [practiceQuestion, setPracticeQuestion] = useState<any>(null);
  const [practiceSelected, setPracticeSelected] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<any>(null);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ attempted: 0, correct: 0 });
  const [practiceStarted, setPracticeStarted] = useState(false);

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

  const startKlevelCamera = async () => {
    if (klevelStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }, audio: false
      });
      klevelStreamRef.current = stream;
      if (klevelVideoRef.current) {
        klevelVideoRef.current.srcObject = stream;
        klevelVideoRef.current.play().catch(() => {});
      }
      setKlevelCamReady(true);

      // Face detection every 2s using skin-tone pixel ratio
      klevelFaceRef.current = setInterval(() => {
        const video = klevelVideoRef.current;
        const canvas = klevelCanvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let skin = 0;
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r > 60 && g > 30 && r > b && Math.abs(r-g) > 5) skin++;
        }
        const ratio = skin / (canvas.width * canvas.height / 16);
        if (ratio < 0.005) {
          setKlevelFaceStatus("missing");
          addViolation("Face not detected");
        } else {
          setKlevelFaceStatus("ok");
        }
      }, 2000);

      // Motion detection every 800ms
      klevelMotionRef.current = setInterval(() => {
        const video = klevelVideoRef.current;
        const canvas = klevelCanvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const prev = klevelPrevFrameRef.current;
        if (prev) {
          let diff = 0;
          for (let i = 0; i < frame.data.length; i += 4) diff += Math.abs(frame.data[i] - prev.data[i]);
          if (diff / (frame.data.length / 4) > 30) {
            setKlevelMotionAlert(true);
            addViolation("Excessive movement");
            setTimeout(() => setKlevelMotionAlert(false), 3000);
          }
        }
        klevelPrevFrameRef.current = frame;
      }, 800);

      // Tab-switch detection
      const onHide = () => { if (document.hidden) addViolation("Tab switched"); };
      document.addEventListener("visibilitychange", onHide);

    } catch (err) {
      console.error("Camera error:", err);
      setKlevelCamWarning("⚠️ Camera denied — test runs without monitoring.");
    }
  };

  const stopKlevelCamera = () => {
    klevelStreamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(klevelMotionRef.current);
    clearInterval(klevelFaceRef.current);
    klevelStreamRef.current = null;
    klevelPrevFrameRef.current = null;
    setKlevelCamReady(false);
    setKlevelFaceStatus("ok");
    setKlevelMotionAlert(false);
  };

  const startKlevel = async () => {
    setKlevelLoading(true);
    setKlevelResult(null);
    setKlevelFeedback(null);
    setKlevelScore(0);
    setKlevelLevel(1);
    setKlevelSelected("");
    setKlevelCamWarning("");
    setViolations(0);
    stopKlevelCamera();
    try {
      const res = await axios.post(API + "/klevel/start", { role });
      setKlevelQuestion(res.data.question);
      setKlevelMode(true);
      startKlevelCamera(); // non-blocking background
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
        stopKlevelCamera();
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

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [histRes, bestRes] = await Promise.all([
        axios.get(API + "/history/" + userId),
        axios.get(API + "/history/" + userId + "/best")
      ]);
      setHistory(histRes.data.history || []);
      setBestScore(bestRes.data.best || null);
      setShowHistory(true);
    } catch { alert("Failed to load history"); }
    setHistoryLoading(false);
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await axios.get(API + "/jobs/list");
      setJobs(res.data.jobs || []);
      setShowJobs(true);
    } catch { alert("Failed to load jobs"); }
    setJobsLoading(false);
  };

  const applyJob = async (jobId: number) => {
    if (appliedJobs.includes(jobId)) return;
    try {
      await axios.post(API + "/interviews/schedule", {
        candidate_id: userId,
        job_id: jobId,
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Applied via Job Board"
      });
      setAppliedJobs(p => [...p, jobId]);
    } catch { setAppliedJobs(p => [...p, jobId]); }
  };

  const startPractice = async () => {
    setPracticeLoading(true);
    setPracticeFeedback(null);
    setPracticeSelected("");
    setPracticeScore(0);
    setPracticeLevel(1);
    setPracticeStats({ attempted: 0, correct: 0 });
    try {
      const res = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion(res.data.question);
      setPracticeLevel(1);
      setPracticeStarted(true);
    } catch { alert("Failed to load practice question"); }
    setPracticeLoading(false);
  };

  const submitPracticeAnswer = async () => {
    if (!practiceSelected) return;
    setPracticeLoading(true);
    try {
      const res = await axios.post(API + "/klevel/answer", {
        question_id: practiceQuestion.id,
        selected_answer: practiceSelected,
        current_level: practiceLevel,
        total_score: practiceScore,
        role: practiceRole
      });
      setPracticeFeedback(res.data);
      setPracticeScore(res.data.total_score);
      setPracticeStats(p => ({ attempted: p.attempted + 1, correct: p.correct + (res.data.is_correct ? 1 : 0) }));
    } catch { alert("Failed to submit"); }
    setPracticeLoading(false);
  };

  const nextPracticeQuestion = async () => {
    setPracticeLoading(true);
    setPracticeFeedback(null);
    setPracticeSelected("");
    try {
      const nextLevel = practiceFeedback?.is_correct ? Math.min(practiceLevel + 1, 5) : Math.max(practiceLevel - 1, 1);
      setPracticeLevel(nextLevel);
      const res = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion({ ...res.data.question, k_level: nextLevel });
      const res2 = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion(res2.data.question);
    } catch { alert("Failed to load next question"); }
    setPracticeLoading(false);
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

  const downloadPDF = () => {
    const r = result;
    if (!r) return;
    const vc = r.verdict === "HIRE" ? "#00B87C" : r.verdict === "REVIEW" ? "#F59E0B" : "#FF4444";
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:32px;background:#fff;color:#1E293B;}
  h1{font-size:24px;font-weight:900;color:#667EEA;margin:0 0 4px;}
  .sub{color:#64748B;font-size:13px;margin:0 0 24px;}
  .score{font-size:64px;font-weight:900;color:${vc};line-height:1;}
  .verdict{display:inline-block;padding:6px 20px;border-radius:20px;background:${vc}22;color:${vc};font-weight:800;font-size:18px;margin:8px 0 16px;}
  .grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin:20px 0;}
  .card{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px;text-align:center;}
  .card-label{font-size:11px;color:#94A3B8;font-weight:700;text-transform:uppercase;margin-bottom:4px;}
  .card-val{font-size:22px;font-weight:800;color:#667EEA;}
  .section{margin:20px 0;}
  .section-title{font-size:14px;font-weight:700;color:#1E293B;margin:0 0 10px;border-bottom:2px solid #E2E8F0;padding-bottom:6px;}
  .item{font-size:13px;color:#64748B;margin:4px 0;padding-left:16px;}
  .item::before{content:"• ";}
  .klevel{background:#EEF2FF;border:1px solid #667EEA;border-radius:10px;padding:12px 16px;margin:12px 0;}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;text-align:center;color:#94A3B8;font-size:11px;}
  @media print{body{padding:20px;}}
</style></head><body>
<h1>GenuAI Technologies</h1>
<div class="sub">AI-Powered Recruitment Intelligence Platform — Assessment Report</div>
<div class="sub">Candidate: <strong>${userName}</strong> | Role: <strong>${role}</strong> | Date: <strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
<hr style="border:none;border-top:2px solid #667EEA;margin:0 0 20px;">
<div class="score">${r.overall_score}%</div>
<div><span class="verdict">${r.verdict === "HIRE" ? "✅ HIRE" : r.verdict === "REVIEW" ? "⏳ REVIEW" : "❌ REJECT"}</span></div>
<div class="grid">
  <div class="card"><div class="card-label">ATS Score</div><div class="card-val">${r.ats_score || 0}%</div></div>
  <div class="card"><div class="card-label">Skill Test</div><div class="card-val">${r.test_score || 0}%</div></div>
  <div class="card"><div class="card-label">Interview</div><div class="card-val">${r.interview_score || 0}%</div></div>
  <div class="card"><div class="card-label">Authenticity</div><div class="card-val">${r.authenticity_score || 0}%</div></div>
</div>
${klevelResult ? `<div class="klevel"><strong style="color:#667EEA">K-Level Skill Test:</strong> ${klevelResult.total_score}/15 marks — <strong>${klevelResult.tier}</strong> tier | ${klevelResult.message || ""}</div>` : ""}
<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:16px 0;">
  <div style="font-size:13px;color:#64748B;">Triangle Status: <strong style="color:#667EEA;">${r.triangle_status || "—"}</strong> &nbsp;|&nbsp; Consistency: <strong>${r.consistency_score || 0}%</strong> &nbsp;|&nbsp; Salary Estimate: <strong style="color:#00B87C;">₹${r.salary_min || 0}L – ₹${r.salary_max || 0}L/yr</strong></div>
</div>
${r.key_strengths && r.key_strengths.length > 0 ? `<div class="section"><div class="section-title">💪 Key Strengths</div>${r.key_strengths.map((s: string) => `<div class="item">${s}</div>`).join("")}</div>` : ""}
${r.improvement_plan && r.improvement_plan.length > 0 ? `<div class="section"><div class="section-title">📈 Improvement Plan</div>${r.improvement_plan.map((s: string) => `<div class="item">${s}</div>`).join("")}</div>` : ""}
<div class="footer">
  <strong>GenuAI Technologies</strong> · AI-Powered Recruitment Intelligence · Built by Mohamed Jabri Jaffar Sadiq · Sri Sairam Institute of Technology, Chennai<br>
  © 2026 GenuAI Technologies. All Rights Reserved.
</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
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
      await sendEmail({ candidateEmail: userEmail, candidateName: userName, overallScore: final.overall_score, verdict: final.verdict, salaryMin: final.salary_min, salaryMax: final.salary_max, atsScore: final.ats_score || atsScore, testScore: final.test_score || 0, interviewScore: final.interview_score || 0, authenticityScore: final.authenticity_score || 0, triangleStatus: final.triangle_status || "", klevelScore: klevelResult?.total_score || 0, klevelTier: klevelResult?.tier || "", role, keyStrengths: final.key_strengths || [], improvementPlan: final.improvement_plan || [] });
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

  return (<>
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#1E293B", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#fff", borderRadius: "16px", padding: "12px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.png" alt="GenuAI" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 3px 12px rgba(0,184,124,0.4)" }} />
          <div>
            <div style={{ fontWeight: "800", fontSize: "17px", color: "#1E293B", lineHeight: "1.1" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span></div>
            <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "600", letterSpacing: "0.08em" }}>TECHNOLOGIES</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {onResume && <button onClick={onResume} style={{ padding: "7px 11px", background: "#EEF2FF", color: "#667EEA", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>📄 Resume</button>}
          <button onClick={fetchHistory} disabled={historyLoading} style={{ padding: "7px 11px", background: "#FFF7ED", color: "#F97316", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>📊 History</button>
          <button onClick={fetchJobs} disabled={jobsLoading} style={{ padding: "7px 11px", background: "#F0FDF4", color: "#00B87C", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>💼 Jobs</button>
          <button onClick={() => { setShowPractice(true); setPracticeStarted(false); setPracticeFeedback(null); setPracticeSelected(""); }} style={{ padding: "7px 11px", background: "#F5F3FF", color: "#7C3AED", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>🎯 Practice</button>
          {onMock && <button onClick={onMock} style={{ padding: "7px 11px", background: "#F5F3FF", color: "#7C3AED", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>🎓 Mock</button>}
          {onInterview && <button onClick={onInterview} style={{ padding: "7px 11px", background: "#E0F9FF", color: "#0891B2", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>🎥 Room</button>}
          <div style={{ width: "1px", height: "24px", background: "#E2E8F0", margin: "0 2px" }} />
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: profilePhoto ? "transparent" : "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#fff", fontSize: "14px", overflow: "hidden", border: "2px solid #E2E8F0", flexShrink: 0 }}>
            {profilePhoto ? <img src={profilePhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userName.charAt(0).toUpperCase()}
          </div>
          <button onClick={onLogout} style={{ padding: "7px 11px", background: "transparent", border: "1px solid #FF4444", color: "#FF4444", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Logout</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
        {["Profile and Resume", "Skill Test", "Voice Pitch", "Results"].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "10px", background: step === i+1 ? "linear-gradient(135deg, #667eea, #764ba2)" : step > i+1 ? "#DCFCE7" : "#F1F5F9", color: step === i+1 ? "#fff" : step > i+1 ? "#16A34A" : "#94A3B8", fontSize: "13px", fontWeight: "bold" }}>
            {i+1}. {s}
          </div>
        ))}
      </div>

      {/* Practice Mode Modal */}
      {showPractice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "680px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#1E293B", margin: "0 0 4px" }}>🎯 Practice Mode</h2>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Unlimited practice — scores do NOT affect your assessment</div>
              </div>
              <button onClick={() => { setShowPractice(false); setPracticeStarted(false); }} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>

            {!practiceStarted ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🧠</div>
                <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>Practice K-Level questions for any role. Get instant feedback with explanations. No pressure — this never affects your real score.</p>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>Select Role to Practice</label>
                  <select value={practiceRole} onChange={e => setPracticeRole(e.target.value)} style={{ width: "100%", padding: "12px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontSize: "14px", color: "#1E293B", background: "#F8FAFC" }}>
                    {["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
                  {[["K1","Easy","#22C55E"],["K2","Medium","#F59E0B"],["K3","Hard","#F97316"],["K4","Advanced","#EF4444"],["K5","Expert","#8B5CF6"]].map(([k,l,c]) => (
                    <div key={k} style={{ padding: "8px 14px", background: c + "15", border: "1.5px solid " + c + "44", borderRadius: "10px", fontSize: "12px", color: c, fontWeight: "700" }}>{k} {l}</div>
                  ))}
                </div>
                <button onClick={startPractice} disabled={practiceLoading} style={{ padding: "14px 40px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>
                  {practiceLoading ? "Loading..." : "🚀 Start Practice"}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", background: "#F8FAFC", borderRadius: "12px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Attempted</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B" }}>{practiceStats.attempted}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Correct</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#22C55E" }}>{practiceStats.correct}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Accuracy</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#667EEA" }}>{practiceStats.attempted > 0 ? Math.round((practiceStats.correct / practiceStats.attempted) * 100) : 0}%</div></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>Role</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#A78BFA" }}>{practiceRole}</div>
                  </div>
                </div>

                {practiceQuestion && (
                  <div>
                    <div style={{ background: "linear-gradient(135deg,#A78BFA11,#7C3AED11)", border: "1.5px solid #A78BFA33", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ padding: "3px 10px", background: "#A78BFA", borderRadius: "20px", color: "#fff", fontSize: "11px", fontWeight: "700" }}>K{practiceQuestion.k_level} — {practiceQuestion.k_level === 1 ? "Easy" : practiceQuestion.k_level === 2 ? "Medium" : practiceQuestion.k_level === 3 ? "Hard" : practiceQuestion.k_level === 4 ? "Advanced" : "Expert"}</span>
                        <span style={{ padding: "3px 10px", background: "#F1F5F9", borderRadius: "20px", color: "#64748B", fontSize: "11px" }}>{practiceQuestion.marks} mark{practiceQuestion.marks > 1 ? "s" : ""}</span>
                        <span style={{ padding: "3px 10px", background: "#F0FDF4", borderRadius: "20px", color: "#16A34A", fontSize: "11px", fontWeight: "600" }}>Practice — No Penalty</span>
                      </div>
                      <p style={{ color: "#1E293B", fontSize: "15px", fontWeight: "600", margin: 0, lineHeight: "1.6" }}>{practiceQuestion.question_text}</p>
                    </div>

                    {practiceFeedback ? (
                      <div>
                        <div style={{ padding: "14px", background: practiceFeedback.is_correct ? "#F0FDF4" : "#FEF2F2", border: "1.5px solid " + (practiceFeedback.is_correct ? "#BBF7D0" : "#FECACA"), borderRadius: "12px", marginBottom: "14px" }}>
                          <div style={{ fontWeight: "700", color: practiceFeedback.is_correct ? "#16A34A" : "#DC2626", marginBottom: "6px", fontSize: "15px" }}>
                            {practiceFeedback.is_correct ? "✅ Correct! Well done!" : "❌ Incorrect! Correct answer: " + practiceFeedback.correct_answer}
                          </div>
                          <div style={{ color: "#64748B", fontSize: "13px" }}>{practiceFeedback.explanation}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={nextPracticeQuestion} disabled={practiceLoading} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                            {practiceLoading ? "Loading..." : "Next Question →"}
                          </button>
                          <button onClick={() => { setPracticeStarted(false); setPracticeStats({ attempted: 0, correct: 0 }); }} style={{ padding: "12px 20px", background: "#F1F5F9", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#64748B" }}>
                            Change Role
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                          {["A","B","C","D"].map(opt => (
                            <button key={opt} onClick={() => setPracticeSelected(opt)}
                              style={{ padding: "13px 16px", borderRadius: "12px", border: "1.5px solid " + (practiceSelected === opt ? "#A78BFA" : "#E2E8F0"), background: practiceSelected === opt ? "#F5F3FF" : "#F8FAFC", color: practiceSelected === opt ? "#7C3AED" : "#1E293B", fontWeight: practiceSelected === opt ? "700" : "400", cursor: "pointer", textAlign: "left", fontSize: "14px" }}>
                              <span style={{ fontWeight: "700", marginRight: "8px" }}>{opt}.</span>
                              {practiceQuestion["option_" + opt.toLowerCase()]}
                            </button>
                          ))}
                        </div>
                        <button onClick={submitPracticeAnswer} disabled={practiceLoading || !practiceSelected}
                          style={{ width: "100%", padding: "14px", background: practiceSelected ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "#E2E8F0", color: practiceSelected ? "#fff" : "#94A3B8", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: practiceSelected ? "pointer" : "not-allowed" }}>
                          {practiceLoading ? "Checking..." : practiceSelected ? "Submit Answer →" : "Select an option"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 1: Profile and Resume ── */}
      {step === 1 && (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

          {/* LEFT 60% — Resume Form */}
          <div style={{ flex: "0 0 59%", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ color: "#1E293B", margin: "0 0 4px", fontSize: "19px" }}>📋 Profile &amp; Resume</h2>
              <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>Fill in your details to begin your assessment.</p>
            </div>

            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Target Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inp, marginBottom: "14px" }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>

            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" }}>GitHub Profile URL</label>
            <input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/yourusername" style={{ ...inp, marginBottom: "14px" }} />

            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" }}>LinkedIn Profile URL</label>
            <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" style={{ ...inp, marginBottom: "14px" }} />

            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Upload Resume (PDF)</label>
            <input type="file" accept=".pdf" onChange={async e => {
              const f = e.target.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.append("file", f);
              try {
                const res = await axios.post(API + "/upload-resume", fd);
                setResumeText(res.data.text || "");
              } catch { setResumeText("Resume uploaded"); }
            }} style={{ ...inp, padding: "10px", marginBottom: "14px" }} />
            {resumeText && <div style={{ padding: "8px 12px", background: "#DCFCE7", borderRadius: "6px", color: "#00B87C", fontSize: "12px", marginBottom: "12px" }}>✅ PDF loaded — ready for analysis</div>}

            <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Your Skills (comma separated)</label>
            <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Python, React, SQL, Machine Learning..." style={{ ...inp, marginBottom: "14px" }} />

            {atsScore > 0 && <div style={{ padding: "10px 14px", background: "#DCFCE7", borderRadius: "10px", color: "#00B87C", marginBottom: "12px", fontWeight: "700", fontSize: "14px" }}>🎯 ATS Score: {atsScore}%</div>}

            <button onClick={handleStep1} disabled={loading || !resumeText} style={{ ...btn, opacity: loading || !resumeText ? 0.6 : 1 }}>
              {loading ? "Analyzing Resume..." : "Analyze and Continue →"}
            </button>
          </div>

          {/* RIGHT 40% — Candidate Profile */}
          <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Profile Photo + Personal Info */}
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "22px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B", marginBottom: "16px" }}>🪪 Candidate Profile</div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "16px" }}>
                <div
                  onClick={() => (document.getElementById("profile-photo-input") as HTMLInputElement)?.click()}
                  style={{ width: "96px", height: "122px", borderRadius: "12px", overflow: "hidden", border: profilePhoto ? "2px solid #00B87C" : "2px dashed #CBD5E1", background: "#F8FAFC", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "10px", transition: "border-color 0.2s" }}>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <div style={{ fontSize: "26px" }}>📷</div>
                      <div style={{ fontSize: "10px", color: "#94A3B8", textAlign: "center", lineHeight: "1.4", padding: "0 6px" }}>Passport size photo</div>
                    </>
                  )}
                </div>
                <input id="profile-photo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setProfilePhoto(URL.createObjectURL(f));
                }} />
                <button
                  onClick={() => (document.getElementById("profile-photo-input") as HTMLInputElement)?.click()}
                  style={{ padding: "6px 16px", background: profilePhoto ? "#F0FDF4" : "linear-gradient(135deg,#667eea,#764ba2)", color: profilePhoto ? "#16A34A" : "#fff", border: profilePhoto ? "1.5px solid #BBF7D0" : "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                  {profilePhoto ? "✅ Uploaded" : "Upload Photo"}
                </button>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "11px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Full Name</div>
                  <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "15px" }}>{userName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Email</div>
                  <div style={{ color: "#475569", fontSize: "12px", wordBreak: "break-all" }}>{userEmail || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Target Role</div>
                  <span style={{ padding: "4px 12px", background: "#EEF2FF", borderRadius: "20px", color: "#667EEA", fontSize: "12px", fontWeight: "700" }}>{role}</span>
                </div>
                {github && <div>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>GitHub</div>
                  <div style={{ color: "#475569", fontSize: "11px", wordBreak: "break-all" }}>{github}</div>
                </div>}
                {linkedin && <div>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>LinkedIn</div>
                  <div style={{ color: "#475569", fontSize: "11px", wordBreak: "break-all" }}>{linkedin}</div>
                </div>}
              </div>
            </div>

            {/* Resume Analysis Card */}
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B", marginBottom: "14px" }}>📊 Resume Analysis</div>
              {atsScore > 0 ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>ATS Match Score</span>
                    <span style={{ fontSize: "16px", fontWeight: "800", color: atsScore >= 70 ? "#00B87C" : atsScore >= 50 ? "#F59E0B" : "#EF4444" }}>{atsScore}%</span>
                  </div>
                  <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "4px", marginBottom: "10px" }}>
                    <div style={{ height: "100%", width: atsScore + "%", background: atsScore >= 70 ? "linear-gradient(90deg,#00B87C,#00D4AA)" : atsScore >= 50 ? "linear-gradient(90deg,#F59E0B,#FBBF24)" : "linear-gradient(90deg,#EF4444,#F87171)", borderRadius: "4px", transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>{atsScore >= 70 ? "✅ Strong match for the role" : atsScore >= 50 ? "⚠️ Moderate — consider improving resume" : "❌ Low match — update your resume"}</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>Upload your resume to see ATS score</div>
                </div>
              )}
              {resumeText && (
                <div style={{ marginTop: "12px", padding: "10px 12px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "10px", color: "#94A3B8", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase" }}>Resume Preview</div>
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.6", maxHeight: "72px", overflow: "hidden" }}>{resumeText.substring(0, 220)}...</div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* Job Board Modal */}
      {showJobs && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "860px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#1E293B", margin: 0 }}>💼 Job Board</h2>
              <button onClick={() => setShowJobs(false)} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>
            <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="🔍 Search jobs by title or skills..." style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #E2E8F0", borderRadius: "12px", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box", outline: "none" }} />
            {jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <div>No jobs posted yet. Check back soon!</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px", fontWeight: "600" }}>{jobs.filter(j => !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.skills?.toLowerCase().includes(jobSearch.toLowerCase())).length} jobs available</div>
                {jobs.filter(j => !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.skills?.toLowerCase().includes(jobSearch.toLowerCase())).map((job) => (
                  <div key={job.id} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h3 style={{ color: "#1E293B", margin: "0 0 4px", fontSize: "16px" }}>{job.title}</h3>
                        <div style={{ fontSize: "13px", color: "#64748B" }}>{job.company_name || "Company"} {job.location ? "· " + job.location : ""}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {job.salary_min > 0 && <div style={{ fontSize: "13px", fontWeight: "700", color: "#00B87C" }}>₹{job.salary_min}L – ₹{job.salary_max}L/yr</div>}
                        <div style={{ fontSize: "11px", color: "#94A3B8" }}>{new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    {job.description && <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 10px", lineHeight: "1.5" }}>{job.description.substring(0, 150)}{job.description.length > 150 ? "..." : ""}</p>}
                    {job.skills && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {job.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((skill: string, i: number) => (
                          <span key={i} style={{ padding: "3px 10px", background: "#EEF2FF", borderRadius: "20px", color: "#667EEA", fontSize: "11px", fontWeight: "600" }}>{skill}</span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => applyJob(job.id)} style={{ padding: "9px 24px", background: appliedJobs.includes(job.id) ? "#F0FDF4" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: appliedJobs.includes(job.id) ? "#16A34A" : "#fff", border: appliedJobs.includes(job.id) ? "1.5px solid #BBF7D0" : "none", borderRadius: "10px", fontWeight: "700", cursor: appliedJobs.includes(job.id) ? "default" : "pointer", fontSize: "13px" }}>
                      {appliedJobs.includes(job.id) ? "✅ Applied!" : "Apply Now →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score History Modal */}
      {showHistory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "800px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#1E293B", margin: 0 }}>📊 My Score History</h2>
              <button onClick={() => setShowHistory(false)} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>
            {bestScore && (
              <div style={{ background: "linear-gradient(135deg,#667EEA11,#764BA211)", border: "1.5px solid #667EEA33", borderRadius: "16px", padding: "20px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>🏆 Personal Best</div>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "#667EEA" }}>{bestScore.overall_score}%</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>{new Date(bestScore.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {([["ATS", bestScore.ats_score, "#00B87C"], ["Test", bestScore.test_score, "#F59E0B"], ["Interview", bestScore.interview_score, "#A78BFA"], ["Authenticity", bestScore.authenticity_score, "#00D4FF"]] as [string,number,string][]).map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center", minWidth: "70px" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>{l}</div>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: c }}>{v ?? "—"}%</div>
                  </div>
                ))}
              </div>
            )}
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <div>No test history yet. Complete your first assessment!</div>
              </div>
            ) : (
              <div>
                {history.map((h: any, i: number) => (
                  <div key={i} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "15px" }}>{h.overall_score}% Overall</div>
                      <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>{new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {([["ATS", h.ats_score, "#00B87C"], ["Test", h.test_score, "#F59E0B"], ["Interview", h.interview_score, "#A78BFA"]] as [string,number,string][]).map(([l, v, c]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#94A3B8" }}>{l}</div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: c }}>{v ?? "—"}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── K-LEVEL MODAL (single render, no duplicate) ── */}
      {klevelMode && klevelQuestion && !klevelResult && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#fff", zIndex: 1000, display: "flex", overflow: "hidden" }}>
          
          {/* LEFT SIDE - LIVE CAMERA (takes 35% of screen) */}
          <div style={{ width: "35%", height: "100%", position: "relative", background: "#0f172a", borderRight: "1px solid #E2E8F0" }}>
            <video id="klevel-active-marker" ref={klevelVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", filter: klevelFaceStatus === "missing" ? "sepia(1) hue-rotate(-50deg) saturate(3)" : "none", transition: "filter 0.3s" }} />
            <canvas ref={klevelCanvasRef} style={{ display: "none" }} width={320} height={240} />
            
            {/* Red flash for violations */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(220, 38, 38, 0.3)", opacity: klevelFaceStatus === "missing" || klevelMotionAlert ? 1 : 0, transition: "opacity 0.2s", zIndex: 1, pointerEvents: "none" }} />
            
            <div style={{ position: "absolute", bottom: "24px", left: "24px", right: "24px", background: klevelFaceStatus === "missing" ? "#FEF2F2" : klevelMotionAlert ? "#FFF7ED" : "rgba(15,23,42,0.8)", border: "1.5px solid " + (klevelFaceStatus === "missing" ? "#FECACA" : klevelMotionAlert ? "#FED7AA" : "rgba(255,255,255,0.2)"), borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "6px", backdropFilter: "blur(10px)", zIndex: 2 }}>
              {klevelFaceStatus === "missing" ? <div style={{ color: "#DC2626", fontWeight: "800", fontSize: "15px", textAlign: "center" }}>⚠️ Face Not Detected</div> : 
               klevelMotionAlert ? <div style={{ color: "#EA580C", fontWeight: "800", fontSize: "15px", textAlign: "center" }}>⚠️ Suspicious Movement</div> : 
               <div style={{ color: "#38bdf8", fontSize: "15px", fontWeight: "800", textAlign: "center" }}>🔒 Proctoring Camera Active</div>}
              <div style={{ color: klevelFaceStatus === "missing" ? "#DC2626" : "#cbd5e1", fontSize: "13px", textAlign: "center", fontWeight: "600" }}>Violations: {violations}/3 · 3 strikes = Auto-Terminate</div>
            </div>
          </div>

          {/* RIGHT SIDE - FULL WHITE COMPLETE QUESTION SCREEN (65% of screen) */}
          <div style={{ width: "65%", height: "100%", overflowY: "auto", padding: "60px 80px", background: "#ffffff", display: "flex", flexDirection: "column" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              {/* Progress header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "800" }}>Adaptive K-Level Skill Test</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[1,2,3,4,5].map(l => (
                      <div key={l} style={{ width: "48px", height: "8px", borderRadius: "4px", background: l < klevelLevel ? "#00B87C" : l === klevelLevel ? "#667EEA" : "#F1F5F9", transition: "background 0.3s" }}/>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "42px", fontWeight: "900", color: "#667EEA", lineHeight: "1" }}>K{klevelLevel}</div>
                  <div style={{ fontSize: "14px", color: "#64748B", fontWeight: "700", marginTop: "6px" }}>Score: {klevelScore}/15</div>
                </div>
              </div>

              {/* Question Box */}
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "30px", marginBottom: "30px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                  <span style={{ padding: "8px 16px", background: "#667EEA", borderRadius: "20px", color: "#fff", fontSize: "13px", fontWeight: "800" }}>
                    K{klevelLevel} — {klevelLevel === 1 ? "Easy" : klevelLevel === 2 ? "Medium" : klevelLevel === 3 ? "Hard" : klevelLevel === 4 ? "Advanced" : "Expert"}
                  </span>
                  <span style={{ padding: "8px 16px", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", color: "#475569", fontSize: "13px", fontWeight: "700" }}>{klevelQuestion.marks} Mark{klevelQuestion.marks > 1 ? "s" : ""}</span>
                </div>
                <p style={{ color: "#0F172A", fontSize: "20px", fontWeight: "700", margin: 0, lineHeight: "1.6" }}>{klevelQuestion.question_text}</p>
              </div>

              {/* Feedback or options */}
              {klevelFeedback ? (
                <div style={{ padding: "24px", background: klevelFeedback.is_correct ? "#F0FDF4" : "#FEF2F2", border: "2px solid " + (klevelFeedback.is_correct ? "#22C55E" : "#EF4444"), borderRadius: "20px", marginBottom: "30px" }}>
                  <div style={{ fontWeight: "800", color: klevelFeedback.is_correct ? "#16A34A" : "#DC2626", marginBottom: "12px", fontSize: "20px" }}>
                    {klevelFeedback.is_correct
                      ? "✅ Outstanding! +" + klevelFeedback.marks_earned + " marks"
                      : "❌ Incorrect!"}
                  </div>
                  {!klevelFeedback.is_correct && <div style={{ color: "#1E293B", fontWeight: "800", marginBottom: "8px", fontSize: "15px" }}>Correct answer: {klevelFeedback.correct_answer}</div>}
                  <div style={{ color: "#475569", fontSize: "15px", lineHeight: "1.6", fontWeight: "500" }}>{klevelFeedback.explanation}</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "30px" }}>
                  {(["A","B","C","D"] as const).map(opt => (
                    <button key={opt} onClick={() => setKlevelSelected(opt)}
                      style={{ padding: "20px 24px", borderRadius: "16px", border: "2px solid " + (klevelSelected === opt ? "#667EEA" : "#E2E8F0"), background: klevelSelected === opt ? "#EEF2FF" : "#fff", color: klevelSelected === opt ? "#4338CA" : "#1E293B", fontWeight: klevelSelected === opt ? "800" : "600", cursor: "pointer", textAlign: "left", fontSize: "16px", transition: "all 0.2s" }}>
                      <span style={{ display: "inline-block", width: "28px", height: "28px", background: klevelSelected === opt ? "#667EEA" : "#F1F5F9", color: klevelSelected === opt ? "#fff" : "#64748B", borderRadius: "50%", textAlign: "center", lineHeight: "28px", marginRight: "14px", fontSize: "13px", fontWeight: "800" }}>{opt}</span>
                      {klevelQuestion["option_" + opt.toLowerCase()]}
                    </button>
                  ))}
                </div>
              )}

              {!klevelFeedback && (
                <button onClick={submitKlevelAnswer} disabled={klevelLoading || !klevelSelected}
                  style={{ width: "100%", padding: "22px", background: klevelLoading || !klevelSelected ? "#E2E8F0" : "#667EEA", color: klevelLoading || !klevelSelected ? "#94A3B8" : "#fff", border: "none", borderRadius: "16px", fontWeight: "800", fontSize: "18px", cursor: klevelLoading || !klevelSelected ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: klevelLoading || !klevelSelected ? "none" : "0 8px 25px rgba(102,126,234,0.4)" }}>
                  {klevelLoading ? "Evaluating Answer..." : "Submit Answer →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && klevelResult && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🧠</div>
            <h3 style={{ color: "#1E293B", margin: "0 0 8px", fontSize: "22px" }}>K-Level Test Complete!</h3>
            <div style={{ fontSize: "44px", fontWeight: "800", color: klevelResult.tier_color || "#667EEA", margin: "12px 0" }}>{klevelResult.total_score}/15</div>
            <span style={{ padding: "6px 22px", borderRadius: "20px", background: (klevelResult.tier_color || "#667EEA") + "22", color: klevelResult.tier_color || "#667EEA", fontWeight: "700", fontSize: "16px" }}>{klevelResult.tier}</span>
            {klevelResult.status === "terminated" && (
              <div style={{ color: "#DC2626", fontWeight: "700", marginTop: "10px" }}>❌ Terminated due to malpractice violations.</div>
            )}
            <div style={{ color: "#64748B", fontSize: "14px", marginTop: "12px", marginBottom: "20px" }}>{klevelResult.message}</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
              {[1,2,3,4,5].map(l => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: l < klevelLevel ? "#00B87C" : l === klevelLevel ? "#667EEA" : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "13px", margin: "0 auto 4px" }}>K{l}</div>
                  <div style={{ fontSize: "10px", color: "#94A3B8" }}>{["","Easy","Mid","Hard","Adv","Expert"][l]}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "14px", marginBottom: "24px", fontSize: "13px", color: "#64748B" }}>
              🎯 Skill score of <strong style={{ color: "#667EEA" }}>{Math.round((klevelResult.total_score / 15) * 100)}%</strong> will be included in your final results.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={startKlevel}
                style={{ padding: "12px 24px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
                🔄 Retry Test
              </button>
              <button onClick={() => setStep(3)}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "15px", boxShadow: "0 4px 15px rgba(0,184,124,0.4)" }}>
                Continue to Voice Pitch →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: K-Level Start Screen ── */}
      {step === 2 && !klevelMode && !klevelResult && (
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
            <div style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
              <div style={{ color: "#92400E", fontSize: "13px", fontWeight: "600" }}>🔒 High-Security Mode: Camera + face detection active. Tab switching = violation. 3 strikes = auto-terminate.</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "12px", marginBottom: "24px" }}>
              <div style={{ color: "#64748B", fontSize: "13px" }}>✅ Correct → advance level &nbsp;|&nbsp; ❌ Wrong → test stops &nbsp;|&nbsp; 🏆 Max: 15 marks &nbsp;|&nbsp; ⚠️ 3 violations = terminated</div>
            </div>
            <button onClick={startKlevel} disabled={klevelLoading}
              style={{ padding: "16px 40px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", fontSize: "16px", boxShadow: "0 4px 15px rgba(102,126,234,0.4)", opacity: klevelLoading ? 0.7 : 1 }}>
              {klevelLoading ? "⏳ Loading question..." : "🚀 Start K-Level Test"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Voice Pitch ── */}
      {step === 3 && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎤</div>
              <h2 style={{ color: "#1E293B", margin: "0 0 8px" }}>Voice Pitch</h2>
              <p style={{ color: "#64748B", fontSize: "14px", margin: 0 }}>Record your 60-second pitch. Tell us why you're the right candidate.</p>
            </div>
            {klevelResult && (
              <div style={{ background: "linear-gradient(135deg,#667EEA11,#764BA211)", border: "1.5px solid #667EEA33", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "28px" }}>🧠</div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>K-Level Score (carried forward)</div>
                  <div style={{ fontWeight: "800", color: "#667EEA", fontSize: "18px" }}>{klevelResult.total_score}/15 — {klevelResult.tier}</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {(["video","audio","text"] as const).map(m => (
                <button key={m} onClick={() => setPitchMode(m)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid " + (pitchMode === m ? "#667EEA" : "#E2E8F0"), background: pitchMode === m ? "#EEF2FF" : "#F8FAFC", color: pitchMode === m ? "#667EEA" : "#64748B", fontWeight: pitchMode === m ? "700" : "400", cursor: "pointer", fontSize: "13px" }}>
                  {m === "video" ? "📹 Video" : m === "audio" ? "🎙️ Audio" : "✍️ Text"}
                </button>
              ))}
            </div>
            {pitchMode === "video" && (
              <div style={{ marginBottom: "20px" }}>
                <video ref={videoPreviewRef} autoPlay muted playsInline style={{ width: "100%", borderRadius: "12px", background: "#000", maxHeight: "240px", objectFit: "cover", marginBottom: "12px" }} />
                <video ref={videoRef} style={{ display: "none" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                  {videoMode === "idle" && (
                    <button onClick={async () => {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        if (videoPreviewRef.current) { videoPreviewRef.current.srcObject = stream; videoPreviewRef.current.muted = true; }
                        const mr = new MediaRecorder(stream);
                        mediaRef.current = mr;
                        const chunks: BlobPart[] = [];
                        mr.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
                        mr.onstop = () => { setVideoBlob(new Blob(chunks, { type: "video/webm" })); setPitch("Video pitch recorded"); stream.getTracks().forEach((t: MediaStreamTrack) => t.stop()); };
                        mr.start();
                        setVideoMode("recording");
                        timerRef.current = setInterval(() => setRecTimer(t => t + 1), 1000);
                      } catch { alert("Camera/mic access required"); }
                    }} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                      🔴 Start Recording
                    </button>
                  )}
                  {videoMode === "recording" && (
                    <button onClick={() => { mediaRef.current?.stop(); clearInterval(timerRef.current); setVideoMode("recorded"); }}
                      style={{ flex: 1, padding: "12px", background: "#F1F5F9", color: "#1E293B", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                      ⏹ Stop ({recTimer}s)
                    </button>
                  )}
                  {videoMode === "recorded" && (
                    <button onClick={() => { setVideoMode("idle"); setVideoBlob(null); setRecTimer(0); }}
                      style={{ flex: 1, padding: "12px", background: "#F1F5F9", color: "#64748B", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                      🔄 Re-record
                    </button>
                  )}
                </div>
                {videoMode === "recorded" && <div style={{ color: "#16A34A", fontSize: "13px", marginTop: "8px", fontWeight: "600" }}>✅ Video recorded ({recTimer}s)</div>}
              </div>
            )}
            {pitchMode === "audio" && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  {!isRecording
                    ? <button onClick={startRec} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>🎙️ Start Recording</button>
                    : <button onClick={stopRec} style={{ flex: 1, padding: "12px", background: "#F1F5F9", color: "#1E293B", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>⏹ Stop ({recTimer}s)</button>
                  }
                </div>
                {audioBlob && <div style={{ color: "#16A34A", fontSize: "13px", fontWeight: "600" }}>✅ Audio recorded ({recTimer}s)</div>}
                {stressLevel > 0 && (
                  <div style={{ marginTop: "12px", background: "#F8FAFC", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Stress Analysis</div>
                    <div style={{ background: "#E2E8F0", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: stressLevel + "%", height: "100%", background: stressLevel > 70 ? "#EF4444" : stressLevel > 40 ? "#F59E0B" : "#00B87C", borderRadius: "99px", transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "6px" }}>{stressStatus}</div>
                  </div>
                )}
              </div>
            )}
            {pitchMode === "text" && (
              <div style={{ marginBottom: "20px" }}>
                <textarea value={pitch} onChange={e => { setPitch(e.target.value); analyzeKeystroke(); }}
                  placeholder="Tell us about yourself, your experience, and why you're a great fit..."
                  style={{ width: "100%", minHeight: "160px", padding: "14px", border: "1.5px solid #E2E8F0", borderRadius: "12px", fontSize: "14px", lineHeight: "1.6", resize: "vertical", boxSizing: "border-box", outline: "none", color: "#1E293B", background: "#F8FAFC" }} />
                {keystrokeAlert && <div style={{ color: "#F59E0B", fontSize: "12px", marginTop: "6px", fontWeight: "600" }}>⚠️ {keystrokeAlert}</div>}
                <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>{pitch.length} characters</div>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading || (!pitch && !audioBlob && !videoBlob)}
              style={{ width: "100%", padding: "16px", background: loading || (!pitch && !audioBlob && !videoBlob) ? "#E2E8F0" : "linear-gradient(135deg,#667eea,#764ba2)", color: loading || (!pitch && !audioBlob && !videoBlob) ? "#94A3B8" : "#fff", border: "none", borderRadius: "14px", fontWeight: "700", fontSize: "16px", cursor: loading || (!pitch && !audioBlob && !videoBlob) ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {loading ? "⏳ Analyzing your assessment..." : "Submit and Get Results →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Results ── */}
      {step === 4 && result && (
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>

          {/* ── Hero: Overall Score + Verdict ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "56px", marginBottom: "8px" }}>🏆</div>
            <h2 style={{ color: "#1E293B", margin: "0 0 8px" }}>Assessment Complete!</h2>
            <div style={{ fontSize: "64px", fontWeight: "800", color: vc, margin: "8px 0", lineHeight: 1 }}>{result.overall_score}%</div>
            <span style={{ display: "inline-block", padding: "8px 28px", borderRadius: "20px", background: vc + "22", color: vc, fontWeight: "800", fontSize: "22px", marginBottom: "12px" }}>{result.verdict}</span>
            <div style={{ color: "#64748B", fontSize: "14px" }}>{result.triangle_status}</div>
            {result.cheat_count > 0 && (
              <div style={{ marginTop: "10px", padding: "8px 16px", background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "10px", color: "#DC2626", fontSize: "13px", fontWeight: "600" }}>
                ⚠️ {result.cheat_count} cheat event{result.cheat_count > 1 ? "s" : ""} detected — score adjusted
              </div>
            )}
          </div>

          {/* ── Score Breakdown Grid ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "16px" }}>📊 Score Breakdown</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {([
                ["📄 ATS / Resume", result.ats_score, "#00B87C"],
                ["🧠 Skill Test (K-Level)", result.test_score, "#667EEA"],
                ["🎤 Interview / Pitch", result.interview_score, "#A78BFA"],
                ["✅ Authenticity", result.authenticity_score, "#00D4FF"],
                ["🔁 Consistency", result.consistency_score, "#F59E0B"],
              ] as [string,number,string][]).map(([label, val, color]) => (
                <div key={label} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>{label}</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", color }}>{val ?? "—"}%</div>
                  <div style={{ background: "#E2E8F0", borderRadius: "99px", height: "5px", marginTop: "8px", overflow: "hidden" }}>
                    <div style={{ width: (val ?? 0) + "%", height: "100%", background: color, borderRadius: "99px", transition: "width 1s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lie Detector / Authenticity Analysis ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "16px" }}>🔍 Lie Detector Analysis</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>Authenticity Score</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: result.authenticity_score >= 70 ? "#00B87C" : result.authenticity_score >= 50 ? "#F59E0B" : "#EF4444" }}>{result.authenticity_score}%</span>
                </div>
                <div style={{ background: "#E2E8F0", borderRadius: "99px", height: "10px", overflow: "hidden" }}>
                  <div style={{ width: result.authenticity_score + "%", height: "100%", background: result.authenticity_score >= 70 ? "#00B87C" : result.authenticity_score >= 50 ? "#F59E0B" : "#EF4444", borderRadius: "99px", transition: "width 1s" }} />
                </div>
              </div>
              <div style={{ fontSize: "32px" }}>{result.authenticity_score >= 70 ? "✅" : result.authenticity_score >= 50 ? "⚠️" : "❌"}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F8FAFC", borderRadius: "10px", fontSize: "13px" }}>
              <span style={{ color: "#64748B" }}>Consistency Score</span>
              <span style={{ fontWeight: "700", color: result.consistency_score >= 70 ? "#00B87C" : "#F59E0B" }}>{result.consistency_score ?? "—"}%</span>
            </div>
            {result.cheat_count > 0 && (
              <div style={{ marginTop: "10px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", fontSize: "13px", color: "#DC2626", fontWeight: "600" }}>
                🚨 {result.cheat_count} suspicious event{result.cheat_count > 1 ? "s" : ""} flagged during test
              </div>
            )}
            <div style={{ marginTop: "10px", padding: "10px 14px", background: result.authenticity_score >= 70 ? "#F0FDF4" : "#FFF7ED", borderRadius: "10px", fontSize: "13px", color: result.authenticity_score >= 70 ? "#16A34A" : "#92400E", fontWeight: "600" }}>
              {result.authenticity_score >= 70 ? "✅ Profile appears genuine and consistent" : result.authenticity_score >= 50 ? "⚠️ Some inconsistencies detected — review recommended" : "❌ Significant discrepancies found — further verification needed"}
            </div>
          </div>

          {/* ── Skill Radar Map ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "4px" }}>🕸️ Skill Radar Map</div>
            <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "16px" }}>Multi-dimensional performance overview</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="s" tick={{ fontSize: 12, fill: "#64748B", fontWeight: "600" }} />
                <Radar name="Score" dataKey="v" stroke="#667EEA" fill="#667EEA" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Triangle Analysis ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "12px" }}>🔺 Triangle Analysis</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {([
                ["Resume", result.ats_score, "#00B87C"],
                ["Test", result.test_score, "#667EEA"],
                ["Interview", result.interview_score, "#A78BFA"],
              ] as [string,number,string][]).map(([l, v, c]) => (
                <div key={l} style={{ textAlign: "center", background: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>{l}</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: c }}>{v ?? "—"}%</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", background: vc + "11", border: "1.5px solid " + vc + "44", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "4px" }}>Triangle Verdict</div>
              <div style={{ fontWeight: "800", color: vc, fontSize: "16px" }}>{result.triangle_status || result.verdict}</div>
            </div>
          </div>

          {/* ── Salary Prediction ── */}
          {result.salary_min > 0 && (
            <div style={{ background: "linear-gradient(135deg,#00B87C11,#00D4AA11)", border: "1.5px solid #00B87C44", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "8px" }}>💰 Estimated Salary Range</div>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#00B87C", marginBottom: "4px" }}>₹{result.salary_min}L – ₹{result.salary_max}L/yr</div>
              <div style={{ fontSize: "13px", color: "#64748B" }}>Based on your overall score, role, and market data</div>
            </div>
          )}

          {/* ── Key Strengths ── */}
          {result.key_strengths?.length > 0 && (
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "14px" }}>💪 Key Strengths</div>
              {result.key_strengths.map((s: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", marginBottom: "8px" }}>
                  <span style={{ color: "#16A34A", fontWeight: "700", flexShrink: 0 }}>✅</span>
                  <span style={{ color: "#15803D", fontSize: "13px", lineHeight: "1.5" }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Improvement Plan ── */}
          {result.improvement_plan?.length > 0 && (
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
              <div style={{ fontWeight: "700", color: "#1E293B", fontSize: "16px", marginBottom: "14px" }}>🎯 Improvement Plan</div>
              {result.improvement_plan.map((s: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "10px", marginBottom: "8px" }}>
                  <span style={{ color: "#F59E0B", fontWeight: "700", flexShrink: 0 }}>📌</span>
                  <span style={{ color: "#92400E", fontSize: "13px", lineHeight: "1.5" }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── K-Level Badge in Results ── */}
          {klevelResult && (
            <div style={{ background: "linear-gradient(135deg,#667EEA11,#764BA211)", border: "1.5px solid #667EEA33", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ fontSize: "40px" }}>🧠</div>
              <div>
                <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "2px" }}>K-Level Skill Test Result</div>
                <div style={{ fontWeight: "800", color: "#667EEA", fontSize: "20px" }}>{klevelResult.total_score}/15 — {klevelResult.tier}</div>
                <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Contributed {Math.round((klevelResult.total_score / 15) * 100)}% to your Skill Test score</div>
              </div>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", padding: "20px 0" }}>
            <button onClick={downloadPDF} style={{ padding: "13px 28px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              📄 Download PDF Report
            </button>
            <button onClick={() => { setStep(1); setResult(null); setKlevelResult(null); setKlevelMode(false); setKlevelScore(0); setKlevelLevel(1); setPitch(""); setAudioBlob(null); setVideoBlob(null); setVideoMode("idle"); setResumeText(""); setSkills(""); setAtsScore(0); }} style={{ padding: "13px 28px", background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              🔄 Start New Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  </>
  );
};
