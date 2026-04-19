import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import RobotVerification from "./pages/RobotVerification";
import PathSelection from "./pages/PathSelection";
import CompanyOverview from "./pages/CompanyOverview";
import PracticeDashboard from "./pages/PracticeDashboard";
import CandidatePipeline from "./pages/CandidatePipeline";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import MobileCam from "./pages/MobileCam";
import InterviewRoom from "./pages/InterviewRoom";
import EnvironmentVerifier from "./components/EnvironmentVerifier";
import AMCATTest from "./pages/AMCATTest";

type CandidatePage =
  | "robot-verify"
  | "path-select"
  | "company-overview"
  | "practice"
  | "pipeline"
  | "env-verify"
  | "interview"
  | "amcat";

export default function App() {
  const [isMobile]   = useState(() => new URLSearchParams(window.location.search).get("mobile") === "1");
  const [mobileRoom] = useState(() => new URLSearchParams(window.location.search).get("room") || "");
  const [user,       setUser]      = useState<any>(null);
  const [page,       setPage]      = useState<CandidatePage>("robot-verify");
  const [roomId,     setRoomId]    = useState("");
  const [envRoomId,  setEnvRoomId] = useState("");
  const [autoStart,  setAutoStart] = useState(false);
  const [amcatRole,  setAmcatRole] = useState("Software Engineer");
  const [amcatAssessmentId, setAmcatAssessmentId] = useState<number | undefined>();

  useEffect(() => {
    if (isMobile) return;
    const params = new URLSearchParams(window.location.search);
    const room   = params.get("room");
    if (room) { sessionStorage.setItem("pending_room", room); window.history.replaceState({}, "", "/"); }
    const saved = localStorage.getItem("genuai_user");
    if (saved) {
      const ud = JSON.parse(saved);
      setUser(ud);
      const pending = sessionStorage.getItem("pending_room");
      if (pending) {
        sessionStorage.removeItem("pending_room");
        const r = ud?.user?.role || ud?.role;
        if (r === "company" || r === "admin") { setRoomId(pending); setPage("interview"); }
        else { setEnvRoomId(pending); setPage("env-verify"); }
      }
    }
  }, []);

  const handleLogin = (ud: any) => {
    setUser(ud);
    localStorage.setItem("genuai_user", JSON.stringify(ud));
    const pending = sessionStorage.getItem("pending_room");
    if (pending) {
      sessionStorage.removeItem("pending_room");
      const r = ud?.user?.role || ud?.role;
      if (r === "company" || r === "admin") { setRoomId(pending); setPage("interview"); }
      else { setEnvRoomId(pending); setPage("env-verify"); }
    } else {
      // After login — always start with robot verify for candidates
      const r = ud?.user?.role || ud?.role;
      if (r === "company" || r === "admin") setPage("interview");
      else setPage("robot-verify");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("genuai_user");
    setUser(null);
    setPage("robot-verify");
    setRoomId(""); setEnvRoomId(""); setAutoStart(false);
  };

  const goToInterview = (rid?: string) => {
    const r = user?.user?.role || user?.role;
    const resolvedRoomId = rid || ("room-" + (user?.user?.id || user?.id || "candidate") + "-" + Date.now());
    if (r === "company" || r === "admin") { setRoomId(resolvedRoomId); setPage("interview"); }
    else { setEnvRoomId(resolvedRoomId); setPage("env-verify"); }
  };

  // ── Mobile camera page ──────────────────────────────────────────────
  if (isMobile && mobileRoom) return <MobileCam roomId={mobileRoom} />;

  // ── Not logged in ───────────────────────────────────────────────────
  if (!user) return <Auth onLogin={handleLogin} />;

  const role = user?.user?.role || user?.role;

  // ── Admin / Company roles ───────────────────────────────────────────
  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return (
    <CompanyDashboard user={user} onLogout={handleLogout} onInterview={goToInterview} />
  );

  // ── AMCAT test (launched from pipeline) ────────────────────────────
  if (page === "amcat") return (
    <AMCATTest
      user={user?.user || user}
      role={amcatRole}
      assessmentId={amcatAssessmentId}
      onComplete={(scores: any) => {
        sessionStorage.setItem("amcat_scores", JSON.stringify(scores));
        setPage("pipeline");
      }}
      onTerminate={() => setPage("pipeline")}
    />
  );

  // ── Environment verifier ────────────────────────────────────────────
  if (page === "env-verify") return (
    <EnvironmentVerifier
      roomId={envRoomId}
      user={user}
      onVerificationComplete={(risk) => {
        setRoomId(envRoomId);
        setAutoStart(risk === "LOW");
        sessionStorage.setItem("env_risk", risk);
        setPage("interview");
      }}
    />
  );

  // ── Interview room ──────────────────────────────────────────────────
  if (page === "interview") return (
    <InterviewRoom
      user={user}
      onLogout={handleLogout}
      onBack={() => setPage("pipeline")}
      roomId={roomId}
      autoStart={autoStart}
    />
  );

  // ── Candidate flow ──────────────────────────────────────────────────

  // Step 1: CAPTCHA / robot check
  if (page === "robot-verify") return (
    <RobotVerification onVerified={() => setPage("path-select")} />
  );

  // Step 2: Choose practice or test
  if (page === "path-select") return (
    <PathSelection
      user={user}
      onSelect={(path) => {
        if (path === "practice") setPage("practice");
        else setPage("company-overview");
      }}
    />
  );

  // Step 3a: Practice hub
  if (page === "practice") return (
    <PracticeDashboard user={user} onBack={() => setPage("path-select")} />
  );

  // Step 3b: Test path — company overview / rules page
  if (page === "company-overview") return (
    <CompanyOverview user={user} onStartTest={() => setPage("pipeline")} />
  );

  // Step 4: Full 6-module pipeline
  return (
    <CandidatePipeline
      user={user}
      onLogout={handleLogout}
      onInterview={goToInterview}
    />
  );
}