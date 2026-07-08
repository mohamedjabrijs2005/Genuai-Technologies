import { useState } from 'react';

interface Props { user: any; role: string; onComplete: (data: any) => void; }

export default function Module6_GroupDiscussion({ user, role, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "600px", width: "100%" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🗣️</div>
        <h2 style={{ margin: "0 0 12px", color: "#0F172A", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>Group Discussion</h2>
        <p style={{ color: "#64748B", fontSize: "15px", marginBottom: "32px", lineHeight: "1.6" }}>
          In a real environment, you would join a live video room with other candidates to discuss a given topic collaboratively. For this demo, simply click complete to finalize the module.
        </p>
        <button onClick={() => {
          setLoading(true);
          setTimeout(() => onComplete({ overall: 85, feedback: 'Great communication and teamwork.' }), 1000);
        }}
        disabled={loading}
        style={{ padding: "16px 36px", background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 8px 24px rgba(139,92,246,0.3)", transition: "all 0.2s" }}>
          {loading ? "Processing..." : "Complete Group Discussion"}
        </button>
      </div>
    </div>
  );
}
