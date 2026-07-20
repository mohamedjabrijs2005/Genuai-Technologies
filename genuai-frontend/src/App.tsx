import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// ── Pages ──────────────────────────────────────────────────────────────────
import Auth               from "./pages/Auth";
import PathSelection      from "./pages/PathSelection";
import CompanyOverview    from "./pages/CompanyOverview";
import PracticeDashboard  from "./pages/PracticeDashboard";
import CandidatePipeline  from "./pages/CandidatePipeline";
import SearchDashboard    from "./pages/SearchDashboard";
import CareerProfileDashboard from "./pages/CareerProfileDashboard";
import AdminDashboard     from "./pages/AdminDashboard";
import CompanyDashboard   from "./pages/CompanyDashboard";
import MobileCam          from "./pages/MobileCam";
import InterviewRoom      from "./pages/InterviewRoom";
import EnvironmentVerifier from "./components/EnvironmentVerifier";
import AMCATTest          from "./pages/AMCATTest";

// ── Auth guard ─────────────────────────────────────────────────────────────
function RequireAuth({ user, children, role }: { user: any; children: React.ReactElement; role?: string | string[] }) {
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  const userRole = user?.user?.role || user?.role;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(userRole)) return <Navigate to="/" replace />;
  }
  return children;
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const isMobile   = new URLSearchParams(location.search).get("mobile") === "1";
  const mobileRoom = new URLSearchParams(location.search).get("room") || "";

  const [user,              setUser]             = useState<any>(null);
  const [roomId,            setRoomId]           = useState("");
  const [envRoomId,         setEnvRoomId]        = useState("");
  const [autoStart,         setAutoStart]        = useState(false);
  const [amcatRole,         setAmcatRole]        = useState("Software Engineer");
  const [amcatAssessmentId, setAmcatAssessmentId] = useState<number | undefined>();
  const [sessionRestored,   setSessionRestored]  = useState(false);

  // ── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    if (isMobile) { setSessionRestored(true); return; }

    // Handle QR room link (?room=xxx)
    const params      = new URLSearchParams(location.search);
    const pendingRoom = params.get("room");
    if (pendingRoom) {
      sessionStorage.setItem("pending_room", pendingRoom);
      navigate("/", { replace: true });
    }

    const saved = localStorage.getItem("genuai_user");
    if (saved) {
      try {
        const ud = JSON.parse(saved);
        setUser(ud);
        // Only navigate if currently on /auth or /
        if (location.pathname === "/auth" || location.pathname === "/") {
          routeAfterLogin(ud, navigate, true);
        }
      } catch {
        localStorage.removeItem("genuai_user");
      }
    }
    setSessionRestored(true);
  }, []);

  // ── Helper: decide where to go after login ─────────────────────────────
  const routeAfterLogin = (ud: any, nav: typeof navigate, isRestore = false) => {
    const role    = ud?.user?.role || ud?.role;
    const pending = sessionStorage.getItem("pending_room");

    if (pending) {
      sessionStorage.removeItem("pending_room");
      if (role === "company" || role === "admin") {
        setRoomId(pending);
        nav("/interview");
      } else {
        setEnvRoomId(pending);
        nav("/env-verify");
      }
      return;
    }

    if (role === "admin")   { nav("/admin");   return; }
    if (role === "company") { nav("/company"); return; }
    nav("/dashboard");
  };

  // ── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = (ud: any) => {
    setUser(ud);
    localStorage.setItem("genuai_user", JSON.stringify(ud));
    routeAfterLogin(ud, navigate, false);
  };

  const handleLogout = () => {
    localStorage.removeItem("genuai_user");
    sessionStorage.removeItem("env_risk");
    setUser(null);
    setRoomId("");
    setEnvRoomId("");
    setAutoStart(false);
    navigate("/auth", { replace: true });
  };

  const goToInterview = (rid?: string) => {
    const role         = user?.user?.role || user?.role;
    const resolvedRoom = rid || `room-${user?.user?.id || user?.id || "candidate"}-${Date.now()}`;
    if (role === "company" || role === "admin") {
      setRoomId(resolvedRoom);
      navigate("/interview");
    } else {
      setEnvRoomId(resolvedRoom);
      navigate("/env-verify");
    }
  };

  const goToAMCAT = (role: string, assessmentId?: number) => {
    setAmcatRole(role);
    setAmcatAssessmentId(assessmentId);
    navigate("/amcat");
  };

  // Don't render until session is restored (avoids flash of login page)
  if (!sessionRestored) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="GenuAI" className="w-16 h-16 object-contain animate-pulse" />
          <p className="text-on-surface-variant text-sm font-medium">Loading GenuAI...</p>
        </div>
      </div>
    );
  }

  // ── Mobile secondary camera ────────────────────────────────────────────
  if (isMobile && mobileRoom) {
    return <MobileCam roomId={mobileRoom} />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/auth"          element={user ? <Navigate to="/dashboard" replace /> : <Auth onLogin={handleLogin} />} />
      <Route path="/"              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />

      {/* Candidate dashboard hub */}
      <Route path="/dashboard"     element={
        <RequireAuth user={user} role={["candidate"]}>
          <PathSelection user={user} onLogout={handleLogout} onSelect={(path) => {
            if (path === "practice")      navigate("/practice");
            else if (path === "search")   navigate("/search");
            else if (path === "career-profile") navigate("/career-profile");
            else navigate("/company-overview");
          }} />
        </RequireAuth>
      } />

      {/* Practice hub */}
      <Route path="/practice"      element={
        <RequireAuth user={user} role={["candidate"]}>
          <PracticeDashboard user={user} onBack={() => navigate("/dashboard")} />
        </RequireAuth>
      } />

      {/* Search hub */}
      <Route path="/search"        element={
        <RequireAuth user={user} role={["candidate"]}>
          <SearchDashboard user={user} onBack={() => navigate("/dashboard")} />
        </RequireAuth>
      } />

      {/* Career Profile hub */}
      <Route path="/career-profile" element={
        <RequireAuth user={user} role={["candidate"]}>
          <CareerProfileDashboard user={user} onBack={() => navigate("/dashboard")} />
        </RequireAuth>
      } />

      {/* Company Overview */}
      <Route path="/company-overview" element={
        <RequireAuth user={user} role={["candidate"]}>
          <CompanyOverview user={user} onStartTest={() => navigate("/pipeline")} />
        </RequireAuth>
      } />

      {/* 6-Module pipeline */}
      <Route path="/pipeline"      element={
        <RequireAuth user={user} role={["candidate"]}>
          <CandidatePipeline user={user} onLogout={handleLogout} onInterview={goToInterview} />
        </RequireAuth>
      } />

      {/* AMCAT test */}
      <Route path="/amcat"         element={
        <RequireAuth user={user} role={["candidate"]}>
          <AMCATTest
            user={user?.user || user}
            role={amcatRole}
            assessmentId={amcatAssessmentId}
            onComplete={(scores: any) => {
              sessionStorage.setItem("amcat_scores", JSON.stringify(scores));
              navigate("/pipeline");
            }}
            onTerminate={() => navigate("/pipeline")}
          />
        </RequireAuth>
      } />

      {/* Environment verifier */}
      <Route path="/env-verify"    element={
        <RequireAuth user={user}>
          <EnvironmentVerifier
            roomId={envRoomId}
            user={user}
            onVerificationComplete={(risk) => {
              setRoomId(envRoomId);
              setAutoStart(risk === "LOW");
              sessionStorage.setItem("env_risk", risk);
              navigate("/interview");
            }}
          />
        </RequireAuth>
      } />

      {/* Interview room */}
      <Route path="/interview"     element={
        <RequireAuth user={user}>
          <InterviewRoom
            user={user}
            onLogout={handleLogout}
            onBack={() => navigate("/pipeline")}
            roomId={roomId}
            autoStart={autoStart}
          />
        </RequireAuth>
      } />

      {/* Admin dashboard */}
      <Route path="/admin"         element={
        <RequireAuth user={user} role={["admin"]}>
          <AdminDashboard user={user} onLogout={handleLogout} />
        </RequireAuth>
      } />

      {/* Company/HR dashboard */}
      <Route path="/company"       element={
        <RequireAuth user={user} role={["company", "admin"]}>
          <CompanyDashboard user={user} onLogout={handleLogout} />
        </RequireAuth>
      } />

      {/* Test routes (dev only) */}
      <Route path="/test-admin"    element={<AdminDashboard user={{ user: { name: "Test Admin", role: "admin", id: 1 }, token: "test_token" }} onLogout={() => navigate("/auth")} />} />
      <Route path="/test-company"  element={<CompanyDashboard user={{ user: { name: "Test Company", role: "company", id: 9 }, token: "test_token" }} onLogout={() => navigate("/auth")} />} />
      <Route path="/test-candidate" element={<CandidatePipeline user={{ user: { name: "Test Candidate", role: "candidate", id: 101, email: "candidate@test.com" }, token: "test_token" }} onLogout={() => navigate("/auth")} onInterview={() => {}} />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
    </Routes>
  );
}
