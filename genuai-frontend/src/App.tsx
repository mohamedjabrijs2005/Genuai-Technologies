import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import CandidateDashboard from "./pages/CandidateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import InterviewRoom from "./pages/InterviewRoom";
import ResumeGenerator from "./pages/ResumeGenerator";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("genuai_user");
    if (saved) setUser(JSON.parse(saved));
    // Check URL for room param (from email link)
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      setPage("interview");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    // After login, check if there's a pending room
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      setPage("interview");
      window.history.replaceState({}, "", "/");
    } else {
      setPage("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("genuai_user");
    setUser(null);
    setPage("dashboard");
    setRoomId("");
  };

  const goToInterview = (rid?: string) => {
    setRoomId(rid || "");
    setPage("interview");
  };

  if (!user) return <Auth onLogin={handleLogin} />;
  const role = user.user?.role || user.role;

  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} onInterview={goToInterview} />;
  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => { setPage("dashboard"); setRoomId(""); }} roomId={roomId} />;
  if (page === "resume") return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;
  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => goToInterview()} onResume={() => setPage("resume")} />;
}
