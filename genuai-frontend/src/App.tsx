import { useState, useEffect } from "react";

// ── Pages ──────────────────────────────────────────────────────────────────
import Auth               from "./pages/Auth";
import RobotVerification  from "./pages/RobotVerification";
import PathSelection      from "./pages/PathSelection";
import CompanyOverview    from "./pages/CompanyOverview";
import PracticeDashboard  from "./pages/PracticeDashboard";
import CandidatePipeline  from "./pages/CandidatePipeline";
import AdminDashboard     from "./pages/AdminDashboard";
import CompanyDashboard   from "./pages/CompanyDashboard";
import MobileCam          from "./pages/MobileCam";
import InterviewRoom      from "./pages/InterviewRoom";
import EnvironmentVerifier from "./components/EnvironmentVerifier";
import AMCATTest          from "./pages/AMCATTest";

// ── Page type ──────────────────────────────────────────────────────────────
type Page =
  | "auth"           // login / register  (not logged in)
  | "robot-verify"   // CAPTCHA after login
  | "path-select"    // Practice vs Test
  | "practice"       // Practice hub
  | "company-overview" // Rules / about page before test
  | "pipeline"       // 6-module assessment
  | "amcat"          // AMCAT test (launched from pipeline)
  | "env-verify"     // Environment check before interview
  | "interview"      // AI Interview room
  | "admin"          // Admin dashboard
  | "company";       // Company / HR dashboard

export default function App() {
  // ── Mobile camera detection ────────────────────────────────────────────
  const isMobile   = new URLSearchParams(window.location.search).get("mobile") === "1";
  const mobileRoom = new URLSearchParams(window.location.search).get("room") || "";

  // ── State ──────────────────────────────────────────────────────────────
  const [user,              setUser]             = useState<any>(null);
  const [page,              setPage]             = useState<Page>("auth");
  const [roomId,            setRoomId]           = useState("");
  const [envRoomId,         setEnvRoomId]        = useState("");
  const [autoStart,         setAutoStart]        = useState(false);
  const [amcatRole,         setAmcatRole]        = useState("Software Engineer");
  const [amcatAssessmentId, setAmcatAssessmentId] = useState<number | undefined>();

  // ── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;

    // Handle QR room link (?room=xxx)
    const params      = new URLSearchParams(window.location.search);
    const pendingRoom = params.get("room");
    if (pendingRoom) {
      sessionStorage.setItem("pending_room", pendingRoom);
      window.history.replaceState({}, "", "/");
    }

    // Restore saved user
    const saved = localStorage.getItem("genuai_user");
    if (saved) {
      try {
        const ud = JSON.parse(saved);
        setUser(ud);
        routeAfterLogin(ud, true); // restore into correct page
      } catch {
        localStorage.removeItem("genuai_user");
      }
    }
  }, []);

  // ── Helper: decide where to go after login ─────────────────────────────
  const routeAfterLogin = (ud: any, isRestore = false) => {
    const role    = ud?.user?.role || ud?.role;
    const pending = sessionStorage.getItem("pending_room");

    // If there's a pending interview room link
    if (pending) {
      sessionStorage.removeItem("pending_room");
      if (role === "company" || role === "admin") {
        setRoomId(pending);
        setPage("interview");
      } else {
        setEnvRoomId(pending);
        setPage("env-verify");
      }
      return;
    }

    // Route by role
    if (role === "admin") { setPage("admin"); return; }
    if (role === "company") { setPage("company"); return; }

    // Candidate: if restoring session skip CAPTCHA, go straight to path-select
    if (isRestore) { setPage("path-select"); return; }

    // Fresh login: show CAPTCHA first
    setPage("robot-verify");
  };

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = (ud: any) => {
    setUser(ud);
    localStorage.setItem("genuai_user", JSON.stringify(ud));
    routeAfterLogin(ud, false);
  };

  const handleLogout = () => {
    localStorage.removeItem("genuai_user");
    sessionStorage.removeItem("env_risk");
    setUser(null);
    setPage("auth");
    setRoomId("");
    setEnvRoomId("");
    setAutoStart(false);
  };

  // ── Navigate to interview (generates room id if none given) ────────────
  const goToInterview = (rid?: string) => {
    const role         = user?.user?.role || user?.role;
    const resolvedRoom = rid || `room-${user?.user?.id || user?.id || "candidate"}-${Date.now()}`;

    if (role === "company" || role === "admin") {
      setRoomId(resolvedRoom);
      setPage("interview");
    } else {
      setEnvRoomId(resolvedRoom);
      setPage("env-verify");
    }
  };

  // ── Navigate to AMCAT (launched from pipeline) ─────────────────────────
  const goToAMCAT = (role: string, assessmentId?: number) => {
    setAmcatRole(role);
    setAmcatAssessmentId(assessmentId);
    setPage("amcat");
  };

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER TREE
  // ══════════════════════════════════════════════════════════════════════

  // 1. Mobile secondary camera
  if (isMobile && mobileRoom) {
    return <MobileCam roomId={mobileRoom} />;
  }

  // 2. Not logged in → Login / Register
  if (!user || page === "auth") {
    return <Auth onLogin={handleLogin} />;
  }

  // 3. Admin dashboard
  if (page === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // 4. Company / HR dashboard
  if (page === "company") {
    return (
      <CompanyDashboard
        user={user}
        onLogout={handleLogout}
        onInterview={goToInterview}
      />
    );
  }

  // 5. AMCAT test (launched mid-pipeline)
  if (page === "amcat") {
    return (
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
  }

  // 6. Environment verifier (before interview)
  if (page === "env-verify") {
    return (
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
  }

  // 7. AI Interview room
  if (page === "interview") {
    return (
      <InterviewRoom
        user={user}
        onLogout={handleLogout}
        onBack={() => setPage("pipeline")}
        roomId={roomId}
        autoStart={autoStart}
      />
    );
  }

  // ── Candidate flow ─────────────────────────────────────────────────────

  // 8. CAPTCHA — human verification
  if (page === "robot-verify") {
    return (
      <RobotVerification
        onVerified={() => setPage("path-select")}
      />
    );
  }

  // 9. Path selection — Practice or Official Test
  if (page === "path-select") {
    return (
      <PathSelection
        user={user}
        onSelect={(path) => {
          if (path === "practice") setPage("practice");
          else setPage("company-overview");
        }}
      />
    );
  }

  // 10. Practice hub
  if (page === "practice") {
    return (
      <PracticeDashboard
        user={user}
        onBack={() => setPage("path-select")}
      />
    );
  }

  // 11. Company overview / assessment rules
  if (page === "company-overview") {
    return (
      <CompanyOverview
        user={user}
        onStartTest={() => setPage("pipeline")}
      />
    );
  }

  // 12. Full 6-module pipeline (default candidate page)
  return (
    <CandidatePipeline
      user={user}
      onLogout={handleLogout}
      onInterview={goToInterview}
    />
  );
}
