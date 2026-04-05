import { useState } from "react";
import { login, register } from "../services/api";

interface Props {
  onLogin: (user: any) => void;
}

export default function Auth({ onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "candidate", phone: "", college: "", github: "", linkedin: "" });

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
        setSuccess("Account created successfully! Please login.");
        setIsLogin(true);
        setForm({ ...form, password: "", confirmPassword: "" });
      }
    } catch (e: any) { setError(e.response?.data?.error || "Something went wrong."); }
    setLoading(false);
  };

  const inp: any = {
    width: "100%", padding: "12px 16px", marginBottom: "14px",
    background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "10px",
    color: "#1E293B", fontSize: "14px", boxSizing: "border-box", outline: "none",
    transition: "border 0.2s"
  };
  const lbl: any = { color: "#64748B", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px", letterSpacing: "0.3px" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", padding: "20px" }}>
      
      {/* Background decorations */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}/>
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "500px", height: "500px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}/>
      </div>

      <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 1 }}>
        
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "12px 20px", marginBottom: "12px" }}>
            <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI Logo" style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
            <div>
              <div style={{ color: "#fff", fontWeight: "800", fontSize: "20px", letterSpacing: "-0.5px" }}>GenuAI <span style={{ fontWeight: "400", opacity: 0.8 }}>Technologies</span></div>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0 }}>AI-Powered Recruitment Intelligence Platform</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
          
          {/* Tab switcher */}
          <div style={{ display: "flex", marginBottom: "24px", background: "#F1F5F9", borderRadius: "12px", padding: "4px" }}>
            {["Login", "Register"].map(t => (
              <button key={t} onClick={() => { setIsLogin(t === "Login"); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: (t === "Login") === isLogin ? "#fff" : "transparent", color: (t === "Login") === isLogin ? "#1E293B" : "#94A3B8", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: (t === "Login") === isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>

          <h2 style={{ color: "#1E293B", fontSize: "22px", fontWeight: "800", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            {isLogin ? "Welcome back! 👋" : "Create your account"}
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "13px", margin: "0 0 20px" }}>
            {isLogin ? "Sign in to your GenuAI account" : "Join GenuAI and get discovered by top companies"}
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", color: "#DC2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", color: "#16A34A", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              ✅ {success}
            </div>
          )}

          {!isLogin && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Phone *</label>
                  <input placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} />
                </div>
              </div>
              <label style={lbl}>College / Company *</label>
              <input placeholder="Sri Sairam Institute of Technology" value={form.college} onChange={e => set("college", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={lbl}>GitHub URL *</label>
                  <input placeholder="github.com/username" value={form.github} onChange={e => set("github", e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>LinkedIn URL *</label>
                  <input placeholder="linkedin.com/in/name" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} style={inp} />
                </div>
              </div>
              <label style={lbl}>Register As *</label>
              <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inp, background: "#F8FAFC" }}>
                <option value="candidate">🎯 Candidate — Looking for jobs</option>
                <option value="company">🏢 Company — Hiring talent</option>
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
            style={{ width: "100%", padding: "14px", background: loading ? "#94A3B8" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px", boxShadow: loading ? "none" : "0 4px 15px rgba(102,126,234,0.4)", transition: "all 0.2s", letterSpacing: "0.3px" }}>
            {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign in to GenuAI →" : "Create Account →")}
          </button>

          <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", marginTop: "16px", marginBottom: 0 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }} style={{ color: "#667eea", cursor: "pointer", fontWeight: "700" }}>
              {isLogin ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </div>

        {/* Features bar */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
          {["🔺 Triangle Engine", "🤖 AI Evaluation", "🛡️ Anti-cheat"].map(f => (
            <span key={f} style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", fontWeight: "500" }}>{f}</span>
          ))}
        </div>


      </div>
    </div>
  );
}
