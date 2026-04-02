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

  useEffect(() => {
    const saved = localStorage.getItem("genuai_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData: any) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("genuai_user"); setUser(null); setPage("dashboard"); };

  if (!user) return <Auth onLogin={handleLogin} />;

  const role = user.user?.role || user.role;

  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} />;
  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => setPage("dashboard")} />;
  if (page === "resume") return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;

  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => setPage("interview")} onResume={() => setPage("resume")} />;
}
