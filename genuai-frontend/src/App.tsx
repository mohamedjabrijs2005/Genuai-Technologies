import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import CandidateDashboard from "./pages/CandidateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import MobileCam from "./pages/MobileCam";
import InterviewRoom from "./pages/InterviewRoom";
import ResumeGenerator from "./pages/ResumeGenerator";
import EnvironmentVerifier from "./components/EnvironmentVerifier";

export default function App() {
  const [isMobile]   = useState(() => new URLSearchParams(window.location.search).get("mobile") === "1");
  const [mobileRoom] = useState(() => new URLSearchParams(window.location.search).get("room") || "");
  const [user,       setUser]      = useState<any>(null);
  const [page,       setPage]      = useState("dashboard");
  const [roomId,     setRoomId]    = useState("");
  const [envRoomId,  setEnvRoomId] = useState("");
  const [autoStart,  setAutoStart] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const params  = new URLSearchParams(window.location.search);
    const room    = params.get("room");
    if (room) { sessionStorage.setItem("pending_room", room); window.history.replaceState({}, "", "/"); }
    const saved = localStorage.getItem("genuai_user");
    if (saved) {
      const ud      = JSON.parse(saved);
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
    } else { setPage("dashboard"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("genuai_user");
    setUser(null); setPage("dashboard"); setRoomId(""); setEnvRoomId(""); setAutoStart(false);
  };

  const goToInterview = (rid?: string) => {
    const r = user?.user?.role || user?.role;
    if (r === "company" || r === "admin") { setRoomId(rid || ""); setPage("interview"); }
    else { setEnvRoomId(rid || ""); setPage("env-verify"); }
  };

  if (isMobile && mobileRoom) return <MobileCam roomId={mobileRoom} />;
  if (!user) return <Auth onLogin={handleLogin} />;

  const role = user.user?.role || user.role;

  if (page === "env-verify") return (
    <EnvironmentVerifier roomId={envRoomId} user={user}
      onVerificationComplete={(risk) => {
        setRoomId(envRoomId); setAutoStart(risk === "LOW");
        sessionStorage.setItem("env_risk", risk); setPage("interview");
      }} />
  );
  if (page === "interview") return (
    <InterviewRoom user={user} onLogout={handleLogout}
      onBack={() => { setPage("dashboard"); setRoomId(""); setAutoStart(false); }}
      roomId={roomId} autoStart={autoStart} />
  );
  if (role === "admin")   return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} onInterview={goToInterview} />;
  if (page === "resume")  return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;
  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => goToInterview()} onResume={() => setPage("resume")} />;
}