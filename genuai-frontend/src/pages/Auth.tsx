import { useState, useEffect } from "react";
import { login, register, sendOtp, verifyOtp, requestPasswordReset, resetPassword } from "../services/api";

interface Props { onLogin: (user: any) => void; }

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Auth({ onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | "linkedin" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "candidate", phone: "", college: "", github: "", linkedin: "" });
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [liveUserCount, setLiveUserCount] = useState(2042);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % 3);
    }, 5000);

    // Simulate real-time signups
    const userInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        setLiveUserCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3500);

    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
  }, []);
  const handlePhotoUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfilePhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const storePhoto = (email: string) => {
    if (profilePhoto) {
      localStorage.setItem(`profilePhoto_${email}`, profilePhoto);
    }
  };

  // ── Detect OAuth redirect from backend ──────────────────────────
  useEffect(() => {
    // Reset OAuth loading state when returning to the page
    setOauthLoading(null);

    // Handle Back-Forward Cache (BFcache) to clear spinner on back button
    const handlePageShow = () => setOauthLoading(null);
    window.addEventListener("pageshow", handlePageShow);

    const params = new URLSearchParams(window.location.search);
    const oauthUser = params.get("oauth_user");
    const oauthError = params.get("oauth_error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, document.title, window.location.pathname);
      window.removeEventListener("pageshow", handlePageShow);
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

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [onLogin]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.email || !form.email.includes("@")) return "Valid email is required.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (!isLogin) {
      if (!form.name.trim()) return "Full name is required.";
      if (!form.phone.trim()) return "Phone number is required.";
      if (!form.college.trim()) return "College or company is required.";
      if (form.role !== 'admin') {
        if (!form.github.trim()) return "GitHub profile URL is required.";
        if (!form.linkedin.trim()) return "LinkedIn profile URL is required.";
      }
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
        storePhoto(res.data.user?.email || form.email);
        onLogin(res.data);
      } else {
        await sendOtp({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone, college: form.college, github: form.github, linkedin: form.linkedin });
        setSuccess("OTP sent to your email!");
        setShowOtp(true);
      }
    } catch (e: any) { setError(e.response?.data?.error || "Something went wrong."); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await verifyOtp({ email: form.email, otp: otpCode });
      localStorage.setItem("genuai_user", JSON.stringify(res.data));
      storePhoto(res.data.user?.email || form.email);
      onLogin(res.data);
    } catch (e: any) { setError(e.response?.data?.error || "Invalid or expired OTP."); }
    setLoading(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!form.email || !form.email.includes("@")) { setError("Valid email is required."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await requestPasswordReset({ email: form.email });
      setSuccess("Reset code sent to your email!");
      setResetOtpSent(true);
    } catch (e: any) { setError(e.response?.data?.error || "Failed to send reset code."); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!otpCode || otpCode.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    if (!form.password || form.password.length < 6) { setError("New password must be at least 6 characters."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await resetPassword({ email: form.email, otp: otpCode, newPassword: form.password });
      setSuccess("Password reset successfully! You can now log in.");
      setIsForgotPassword(false);
      setResetOtpSent(false);
      setOtpCode("");
      setForm(p => ({ ...p, password: "" }));
    } catch (e: any) { setError(e.response?.data?.error || "Failed to reset password."); }
    setLoading(false);
  };

  const handleOAuth = (provider: "google" | "github" | "linkedin") => {
    setOauthLoading(provider);
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const inp: any = { width: "100%", padding: "14px 18px", marginBottom: "16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", color: "#1E293B", fontSize: "15px", boxSizing: "border-box", outline: "none", transition: "all 0.2s" };
  const lbl: any = { color: "#64748B", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" };

  const STATS = [
    { val: "AI", label: "Powered Evaluation" },
    { val: "6D", label: "Assessment Dimensions" },
    { val: "Real", label: "Time Scoring" },
    { val: "Zero", label: "Human Bias" },
  ];

  const TESTIMONIALS: { quote: any; name: string; role: string; initial: string; photo?: string }[] = [
    {
      quote: <>GenuAI helped us reduce hiring time by <span style={{ color: "#FFD700", fontWeight: "700" }}>60%</span>. The AI evaluation is incredibly accurate — we found our best engineers through this platform.</>,
      name: "Rahul Mehta", role: "HR Director · TechCorp India", initial: "R"
    },
    {
      quote: <>The 6-dimension scoring gives us a complete picture of the candidate. We've seen a <span style={{ color: "#FFD700", fontWeight: "700" }}>40% increase</span> in employee retention since switching.</>,
      name: "Sarah Jenkins", role: "Talent Acquisition · GlobalNet", initial: "S"
    },
    {
      quote: <>Anti-cheat features are <span style={{ color: "#FFD700", fontWeight: "700" }}>rock solid</span>. We can now confidently conduct remote assessments without worrying about integrity issues.</>,
      name: "Arjun Desai", role: "Engineering Manager · Innovate", initial: "A"
    }
  ];

  return (
    <div className="min-h-screen flex font-body-base bg-background quantum-gradient text-on-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-gold/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />

      {/* LEFT - Brand Hero Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-margin-desktop py-xl relative z-10 border-r border-surface-container/50">
        <div className="max-w-xl mx-auto w-full">
          {/* Logo & Badge */}
          <div className="flex flex-col items-start mb-lg">
            <div className="relative group inline-block mb-md">
              <div className="absolute -inset-4 bg-accent-gold/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img src="/logo.png" alt="GenuAI Shield" className="relative w-24 h-24 object-contain gold-glow-subtle transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-col gap-2 mb-md mt-sm">
              <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#667EEA] via-[#764BA2] to-[#0891B2] tracking-tighter drop-shadow-sm" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                GenuAI Technologies
              </h2>
              <div className="inline-flex items-center px-sm py-1.5 glass rounded-lg border-surface-container self-start shadow-sm bg-surface-bright/50">
                <span className="text-[11px] font-black text-[#F59E0B] flex items-center gap-1.5 uppercase tracking-[0.2em]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  AI-Powered Recruitment Intelligence Platform
                </span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-display-lg-mobile hero-title-weight text-on-surface mb-sm leading-[1.05]">
            Hire Smarter.<br/>
            <span className="text-accent-gold">Get Hired Faster.</span>
          </h1>
          
          <p className="text-body-lg font-body-lg text-on-surface-variant/80 mb-xl leading-relaxed max-w-md">
            Evaluating candidates across <span className="text-accent-gold font-bold">6 dimensions</span> using quantum-inspired AI.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-sm mb-xl">
            {STATS.map((s, i) => (
              <div key={i} className="glass p-md rounded-xl hover:pill-active transition-all group cursor-default">
                <span className="text-accent-gold font-headline-md block mb-1 group-hover:scale-105 transition-transform origin-left">{s.val}</span>
                <p className="text-label-caps font-label-caps text-on-surface-variant/60 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="glass-gold p-md rounded-xl border border-accent-gold/20 relative overflow-hidden group">
            <span className="material-symbols-outlined text-accent-gold/10 text-6xl absolute -top-2 left-4 pointer-events-none" data-icon="format_quote">format_quote</span>
            <div className="relative z-10">
              <div key={testimonialIdx} className="animate-[fadeIn_0.5s_ease]">
                <p className="text-body-base italic text-on-surface mb-sm leading-relaxed">{TESTIMONIALS[testimonialIdx].quote}</p>
                <div className="flex items-center gap-sm">
                  {TESTIMONIALS[testimonialIdx].photo ? (
                    <img src={TESTIMONIALS[testimonialIdx].photo} alt={TESTIMONIALS[testimonialIdx].name} className="w-11 h-11 rounded-full object-cover ring-2 ring-accent-gold/20" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-surface-bright flex items-center justify-center text-accent-gold font-black text-sm ring-2 ring-accent-gold/20">{TESTIMONIALS[testimonialIdx].initial}</div>
                  )}
                  <div>
                    <div className="text-label-caps font-bold text-on-surface">{TESTIMONIALS[testimonialIdx].name}</div>
                    <div className="text-[10px] text-on-surface-variant/80">{TESTIMONIALS[testimonialIdx].role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-accent-gold text-[12px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Profile */}
          <div className="mt-xl flex items-center gap-sm">
            <img src="https://ui-avatars.com/api/?name=Mohamed+Jabri+J+S&background=1E293B&color=D4AF37&size=150" alt="Mohamed Jabri J S" className="w-12 h-12 rounded-full object-cover ring-2 ring-accent-gold/40 shadow-lg" />
            <div>
              <div className="text-sm font-bold text-on-surface">Mohamed Jabri J S</div>
              <div className="text-[11px] text-on-surface-variant/80 font-semibold uppercase tracking-widest">Founder & CEO, GenuAI Technologies</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT - Form Panel */}
      <div className="flex-1 flex items-center justify-center p-margin-mobile md:p-margin-desktop relative z-10">
        <div className="w-full max-w-[440px] glass p-lg rounded-xxl relative">
          
          <div className="mb-lg">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface mb-sm tracking-tight drop-shadow-sm">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome back! 👋" : "Create account"}
            </h2>
            <p className="text-lg text-on-surface-variant/90 font-medium leading-relaxed">
              {isForgotPassword ? "Follow the steps below to reset your password" : isLogin ? "Sign in to continue to your dashboard" : "Join GenuAI and get discovered by top companies"}
            </p>
          </div>

          {!showOtp && !isForgotPassword && (
            <div className="flex mb-lg bg-surface-container/50 rounded-xl p-1">
              {["Login", "Register"].map(t => (
                <button key={t} onClick={() => { setIsLogin(t === "Login"); setError(""); setSuccess(""); }}
                  className={`flex-1 py-sm rounded-lg text-label-caps font-bold transition-all ${
                    (t === "Login") === isLogin 
                      ? "bg-surface text-on-surface shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}>
                  {t === "Login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          {error && <div className="bg-error-crimson/10 border border-error-crimson/20 text-error-crimson text-sm font-bold p-sm rounded-xl mb-md">{error}</div>}
          {success && <div className="bg-success-emerald/10 border border-success-emerald/20 text-success-emerald text-sm font-bold p-sm rounded-xl mb-md">{success}</div>}

          {showOtp ? (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="text-center mb-md">
                <div className="w-16 h-16 rounded-full bg-indigo-brand/10 text-indigo-brand flex items-center justify-center mx-auto mb-sm">
                  <span className="material-symbols-outlined text-3xl">mail</span>
                </div>
                <h3 className="text-headline-sm text-on-surface mb-xs">Check your email</h3>
                <p className="text-on-surface-variant text-sm">We sent a 6-digit code to <strong>{form.email}</strong></p>
              </div>
              <label className="text-label-caps text-on-surface-variant mb-xs block">Verification Code *</label>
              <input placeholder="000000" value={otpCode} maxLength={6} onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-center text-headline-md tracking-[0.5em] font-bold text-on-surface outline-none focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all mb-md" />
              
              <button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6}
                className="w-full gradient-button text-white font-bold py-sm rounded-xl mb-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.98] transition-transform">
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
              <button onClick={() => setShowOtp(false)} className="w-full text-on-surface-variant font-bold text-sm py-sm hover:text-on-surface transition-colors">
                ← Back to registration
              </button>
            </div>
          ) : isForgotPassword ? (
            <div className="animate-[fadeIn_0.3s_ease]">
              <div className="text-center mb-md">
                <div className="w-16 h-16 rounded-full bg-error-crimson/10 text-error-crimson flex items-center justify-center mx-auto mb-sm">
                  <span className="material-symbols-outlined text-3xl">lock_reset</span>
                </div>
                <h3 className="text-headline-sm text-on-surface mb-xs">Reset Password</h3>
                <p className="text-on-surface-variant text-sm">{resetOtpSent ? `Enter code sent to ${form.email}` : "Enter your email to receive a code"}</p>
              </div>

              {!resetOtpSent ? (
                <>
                  <label className="text-label-caps text-on-surface-variant mb-xs block">Email Address *</label>
                  <input placeholder="your@email.com" type="email" value={form.email} onChange={e => set("email", e.target.value)} 
                    className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand mb-md transition-all" />
                  <button onClick={handleForgotPasswordSubmit} disabled={loading || !form.email}
                    className="w-full gradient-button text-white font-bold py-sm rounded-xl mb-sm disabled:opacity-50 hover:scale-[0.98] transition-transform">
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                </>
              ) : (
                <>
                  <label className="text-label-caps text-on-surface-variant mb-xs block">Verification Code *</label>
                  <input placeholder="000000" value={otpCode} maxLength={6} onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-center text-headline-md tracking-[0.5em] font-bold text-on-surface outline-none focus:border-indigo-brand mb-md transition-all" />
                  <label className="text-label-caps text-on-surface-variant mb-xs block">New Password *</label>
                  <input placeholder="Enter new password" type="password" value={form.password} onChange={e => set("password", e.target.value)} 
                    className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand mb-md transition-all" />
                  <button onClick={handleResetPassword} disabled={loading || otpCode.length !== 6 || form.password.length < 6}
                    className="w-full gradient-button text-white font-bold py-sm rounded-xl mb-sm disabled:opacity-50 hover:scale-[0.98] transition-transform">
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </>
              )}
              <button onClick={() => { setIsForgotPassword(false); setResetOtpSent(false); }} className="w-full text-on-surface-variant font-bold text-sm py-sm hover:text-on-surface transition-colors">
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              {!isLogin && (
                <div className="animate-[fadeIn_0.3s_ease]">
                  <div className="flex flex-col items-center mb-md">
                    <div onClick={() => document.getElementById("auth-photo-input")?.click()}
                      className={`w-20 h-20 ${form.role === "company" ? "rounded-xl" : "rounded-full"} overflow-hidden border-2 border-dashed border-surface-container flex items-center justify-center cursor-pointer bg-surface-bright mb-2 hover:border-indigo-brand transition-colors`}>
                      {profilePhoto ? <img src={profilePhoto} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl text-on-surface-variant">{form.role === "company" ? "domain" : "add_a_photo"}</span>}
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Upload Photo</span>
                    <input id="auth-photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div className="grid grid-cols-2 gap-sm mb-sm">
                    <div>
                      <label className="text-label-caps text-on-surface-variant mb-xs block">Full Name *</label>
                      <input placeholder="John Doe" value={form.name} onChange={e => set("name", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                    </div>
                    <div>
                      <label className="text-label-caps text-on-surface-variant mb-xs block">Phone *</label>
                      <input placeholder="+1 234 567" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                    </div>
                  </div>
                  <div className="mb-sm">
                    <label className="text-label-caps text-on-surface-variant mb-xs block">College / Company *</label>
                    <input placeholder="University / Inc." value={form.college} onChange={e => set("college", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                  </div>
                  {form.role !== 'admin' && (
                    <div className="grid grid-cols-2 gap-sm mb-sm">
                      <div>
                        <label className="text-label-caps text-on-surface-variant mb-xs block">GitHub *</label>
                        <input placeholder="url" value={form.github} onChange={e => set("github", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                      </div>
                      <div>
                        <label className="text-label-caps text-on-surface-variant mb-xs block">LinkedIn *</label>
                        <input placeholder="url" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                      </div>
                    </div>
                  )}
                  <div className="mb-sm">
                    <label className="text-label-caps text-on-surface-variant mb-xs block">Register As *</label>
                    <select value={form.role} onChange={e => set("role", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm">
                      <option value="candidate">Candidate - Looking for jobs</option>
                      <option value="company">Company - Hiring talent</option>
                      <option value="admin">Admin - Platform management</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mb-sm">
                <label className="text-label-caps text-on-surface-variant mb-xs block">Email Address *</label>
                <input placeholder="your@email.com" type="email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
              </div>

              <div className="mb-md">
                <div className="flex justify-between items-center mb-xs">
                  <label className="text-label-caps text-on-surface-variant">Password *</label>
                  {isLogin && <span onClick={() => setIsForgotPassword(true)} className="text-[11px] font-bold text-indigo-brand cursor-pointer hover:underline">Forgot?</span>}
                </div>
                <input placeholder="Min 6 characters" type="password" value={form.password} onChange={e => set("password", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
              </div>

              {!isLogin && (
                <div className="mb-md">
                  <label className="text-label-caps text-on-surface-variant mb-xs block">Confirm Password *</label>
                  <input placeholder="Re-enter password" type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className="w-full p-sm bg-surface-bright border border-surface-container rounded-xl text-on-surface outline-none focus:border-indigo-brand transition-all text-sm" />
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full gradient-button text-white font-bold py-sm rounded-xl mb-lg disabled:opacity-50 hover:scale-[0.98] transition-transform text-sm">
                {loading ? (isLogin ? "Signing in..." : "Sending OTP...") : (isLogin ? "Sign in to GenuAI" : "Create Account")}
              </button>

              <div className="flex items-center gap-sm mb-lg">
                <div className="flex-1 h-px bg-surface-container"></div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">or continue with</span>
                <div className="flex-1 h-px bg-surface-container"></div>
              </div>

              <div className="flex flex-col gap-sm">
                <button onClick={() => handleOAuth("google")} disabled={oauthLoading !== null} className="w-full bg-surface border border-surface-container flex items-center justify-center gap-sm py-sm rounded-xl font-bold text-base text-on-surface hover:border-indigo-brand/50 hover:shadow-[0_0_15px_rgba(102,126,234,0.15)] transition-all disabled:opacity-50 group">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Continue with Google
                </button>
                <button onClick={() => handleOAuth("github")} disabled={oauthLoading !== null} className="w-full bg-surface border border-surface-container flex items-center justify-center gap-sm py-sm rounded-xl font-bold text-base text-on-surface hover:border-on-surface hover:shadow-[0_0_15px_rgba(15,23,42,0.1)] transition-all disabled:opacity-50 group">
                  <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Continue with GitHub
                </button>
                <button onClick={() => handleOAuth("linkedin")} disabled={oauthLoading !== null} className="w-full bg-surface border border-surface-container flex items-center justify-center gap-sm py-sm rounded-xl font-bold text-base text-on-surface hover:border-[#0A66C2] hover:shadow-[0_0_15px_rgba(10,102,194,0.15)] transition-all disabled:opacity-50 group">
                  <img src="https://www.svgrepo.com/show/448234/linkedin.svg" alt="LinkedIn" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Continue with LinkedIn
                </button>
              </div>
            </>
          )}

          <div className="mt-lg flex justify-center gap-sm">
             <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span className="material-symbols-outlined text-[12px] text-success-emerald">verified_user</span>
                SSL Secured
             </div>
             <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span className="material-symbols-outlined text-[12px] text-success-emerald">policy</span>
                ISO 27001
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}