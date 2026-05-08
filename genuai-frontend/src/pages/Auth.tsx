import { useState, useEffect } from "react";
import { login, register } from "../services/api";

interface Props { onLogin: (user: any) => void; }

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Auth({ onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "candidate", phone: "", college: "", github: "", linkedin: "" });

  // ── Detect OAuth redirect from backend ──────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthUser = params.get("oauth_user");
    const oauthError = params.get("oauth_error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (oauthUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(oauthUser));
        localStorage.setItem("genuai_user", JSON.stringify(userData));
        window.history.replaceState({}, document.title, window.location.pathname);
        onLogin(userData);
      } catch {
        setError("OAuth login failed. Please try again.");
      }
    }
  }, [onLogin]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.email || !form.email.includes("@")) return "Valid email is required.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin) {
      if (!form.name.trim()) return "Full name is required.";
      if (!form.phone.trim()) return "Phone number is required.";
      if (!form.college.trim()) return "College or company is required.";
      if (!form.github.trim()) return "GitHub profile URL is required.";
      if (!form.linkedin.trim()) return "LinkedIn profile URL is required.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password });
        localStorage.setItem("genuai_user", JSON.stringify(res.data));
        onLogin(res.data);
      } else {
        await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone, college: form.college, github: form.github, linkedin: form.linkedin });
        setSuccess("Account created! Please sign in.");
        setIsLogin(true);
        setForm({ ...form, password: "", confirmPassword: "" });
      }
    } catch (e: any) { setError(e.response?.data?.error || "Something went wrong."); }
    setLoading(false);
  };

  const handleOAuth = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const inp: any = { width: "100%", padding: "11px 14px", marginBottom: "12px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "10px", color: "#1E293B", fontSize: "14px", boxSizing: "border-box", outline: "none" };
  const lbl: any = { color: "#64748B", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "5px" };

  const STATS = [
    { val: "AI",    label: "Powered Evaluation" },
    { val: "6D",    label: "Assessment Dimensions" },
    { val: "Real",  label: "Time Scoring" },
    { val: "Zero",  label: "Human Bias" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* LEFT - Company Overview */}
      <div style={{ flex: "0 0 52%", background: "linear-gradient(160deg,#0F172A 0%,#1E3A8A 45%,#2563EB 75%,#7C3AED 100%)", display: "flex", flexDirection: "column", padding: "48px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(124,58,237,0.15)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: "-100px", left: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(37,99,235,0.2)", pointerEvents: "none" }}/>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <img src="/logo.png" alt="GenuAI" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: "900", fontSize: "24px", letterSpacing: "-0.5px" }}>GenuAI <span style={{ fontWeight: "400", opacity: 0.7, fontSize: "18px" }}>Technologies</span></div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "1px", fontWeight: "600", marginTop: "3px" }}>AI-POWERED RECRUITMENT PLATFORM</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: "40px" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
            <span style={{ color: "#93C5FD", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>NEXT-GEN HIRING PLATFORM</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "38px", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-1px", lineHeight: "1.15" }}>
            Hire Smarter.<br/>
            <span style={{ color: "#93C5FD" }}>Get Hired Faster.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
            GenuAI evaluates candidates across 6 dimensions using cutting-edge AI — skills, communication, aptitude, problem-solving, authenticity, and personality.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px", position: "relative", zIndex: 1 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "16px 20px" }}>
              <div style={{ color: "#fff", fontSize: "28px", fontWeight: "900" }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative", zIndex: 1 }}>
          {[
            { tag: "AI",  title: "Triangle Engine",  desc: "3-point scoring: Resume, Test and Interview" },
            { tag: "ML",  title: "AI Evaluation",    desc: "Real-time scoring on 10+ parameters" },
            { tag: "SEC", title: "Anti-Cheat",       desc: "Camera proctoring and behavior analysis" },
            { tag: "RPT", title: "Instant Results",  desc: "Full scorecard with salary prediction" },
          ].map((feat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(147,197,253,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#93C5FD", fontSize: "10px", fontWeight: "800", flexShrink: 0 }}>{feat.tag}</div>
              <div>
                <div style={{ color: "#fff", fontWeight: "700", fontSize: "13px" }}>{feat.title}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "2px" }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: "32px", position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0 }}>
            © 2025 GenuAI Technologies · AI-Powered Recruitment Intelligence
          </p>
        </div>
      </div>

      {/* RIGHT - Login Form */}
      <div style={{ flex: 1, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Logo on right panel */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
              <img src="/logo.png" alt="GenuAI" style={{ width: "44px", height: "44px", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontWeight: "900", fontSize: "16px", color: "#0F172A" }}>GenuAI Technologies</div>
              <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "500" }}>Assessment Platform</div>
            </div>
          </div>

          <h2 style={{ color: "#0F172A", fontSize: "26px", fontWeight: "900", margin: "0 0 4px" }}>
            {isLogin ? "Welcome back!" : "Create account"}
          </h2>
          <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 24px" }}>
            {isLogin ? "Sign in to continue to your dashboard" : "Join GenuAI and get discovered by top companies"}
          </p>

          {/* ── Sign In / Register Tab Toggle ─────────────── */}
          <div style={{ display: "flex", marginBottom: "24px", background: "#E2E8F0", borderRadius: "12px", padding: "4px" }}>
            {["Login", "Register"].map(t => (
              <button key={t} onClick={() => { setIsLogin(t === "Login"); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: "9px", background: (t === "Login") === isLogin ? "#fff" : "transparent", color: (t === "Login") === isLogin ? "#0F172A" : "#94A3B8", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: (t === "Login") === isLogin ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
                {t === "Login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "11px 14px", marginBottom: "16px", color: "#DC2626", fontSize: "13px", fontWeight: "600" }}>! {error}</div>}
          {success && <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "11px 14px", marginBottom: "16px", color: "#16A34A", fontSize: "13px", fontWeight: "600" }}>✓ {success}</div>}

          {!isLogin && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={lbl}>Full Name *</label><input placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Phone *</label><input placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} /></div>
              </div>
              <label style={lbl}>College / Company *</label>
              <input placeholder="Your college or company name" value={form.college} onChange={e => set("college", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={lbl}>GitHub URL *</label><input placeholder="github.com/username" value={form.github} onChange={e => set("github", e.target.value)} style={inp} /></div>
                <div><label style={lbl}>LinkedIn URL *</label><input placeholder="linkedin.com/in/name" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} style={inp} /></div>
              </div>
              <label style={lbl}>Register As *</label>
              <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inp, background: "#F8FAFC" }}>
                <option value="candidate">Candidate - Looking for jobs</option>
                <option value="company">Company - Hiring talent</option>
                <option value="admin">Admin - Platform management</option>
              </select>
            </>
          )}

          <label style={lbl}>Email Address *</label>
          <input placeholder="your@email.com" value={form.email} type="email" onChange={e => set("email", e.target.value)} style={inp} />
          <label style={lbl}>Password *</label>
          <input placeholder="Min 6 characters" value={form.password} type="password" onChange={e => set("password", e.target.value)} style={inp} />
          {!isLogin && (
            <>
              <label style={lbl}>Confirm Password *</label>
              <input placeholder="Re-enter your password" value={form.confirmPassword} type="password" onChange={e => set("confirmPassword", e.target.value)} style={inp} />
            </>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#94A3B8" : "linear-gradient(135deg,#2563EB,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", boxShadow: loading ? "none" : "0 8px 24px rgba(37,99,235,0.35)", transition: "all 0.2s", marginBottom: "20px" }}>
            {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign in to GenuAI" : "Create Account")}
          </button>

          {/* ── Divider ───────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }}/>
            <span style={{ color: "#94A3B8", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }}/>
          </div>

          {/* ── OAuth Buttons ─────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>

            {/* Continue with Google */}
            <button
              id="btn-google-oauth"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                padding: "12px 16px", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: "12px",
                color: "#1E293B", fontSize: "14px", fontWeight: "600", cursor: oauthLoading ? "not-allowed" : "pointer",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s",
                opacity: oauthLoading && oauthLoading !== "google" ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!oauthLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; }}
            >
              {oauthLoading === "google" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {oauthLoading === "google" ? "Connecting to Google..." : "Continue with Google"}
            </button>

            {/* Continue with GitHub */}
            <button
              id="btn-github-oauth"
              onClick={() => handleOAuth("github")}
              disabled={oauthLoading !== null}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                padding: "12px 16px", background: "#1a1a2e", border: "1.5px solid #2d2d44", borderRadius: "12px",
                color: "#fff", fontSize: "14px", fontWeight: "600", cursor: oauthLoading ? "not-allowed" : "pointer",
                boxShadow: "0 1px 6px rgba(0,0,0,0.15)", transition: "all 0.2s",
                opacity: oauthLoading && oauthLoading !== "github" ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!oauthLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.15)"; }}
            >
              {oauthLoading === "github" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              {oauthLoading === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
            </button>
          </div>

          <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", marginTop: "16px", marginBottom: 0 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} style={{ color: "#2563EB", cursor: "pointer", fontWeight: "700" }}>
              {isLogin ? "Sign up free" : "Sign in"}
            </span>
          </p>

          {/* Spinner keyframes */}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
}