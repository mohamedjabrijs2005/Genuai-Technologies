import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import io from "socket.io-client";

// Reusing your existing connection endpoint
const socket = io("http://localhost:5000");

export default function QRPage({ roomId, riskLevel, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins = 300 seconds
  const [extensionUsed, setExtensionUsed] = useState(false);

  useEffect(() => {
    // Use the actual interview room ID so the mobile camera streams to the right place!
    socket.emit("join-session", roomId);

    const handleConnected = () => {
      socket.off("both-connected", handleConnected);
      onComplete({ success: true, flagged: false });
    };

    socket.on("both-connected", handleConnected);

    return () => {
      socket.off("both-connected", handleConnected);
    };
  }, [roomId, onComplete]);

  // ── The 5-Minute Rules Engine ──
  useEffect(() => {
    if (timeLeft <= 0) {
      if (riskLevel === "MEDIUM") {
        alert("Timeout. Starting assessment with 'MEDIUM RISK' monitoring flag.");
        onComplete({ success: true, flagged: true }); 
      } else if (riskLevel === "HIGH" && !extensionUsed) {
        alert("HIGH RISK: Phone connection is mandatory. Final 2-minute extension granted!");
        setTimeLeft(120);
        setExtensionUsed(true);
      } else if (riskLevel === "HIGH" && extensionUsed) {
        alert("SECURITY BREACH: High-Risk environment without secondary monitoring. Assessment Blocked.");
        onComplete({ success: false, flagged: true });
      }
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, riskLevel, extensionUsed, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Give the phone the actual URL to your app so it connects directly
  const mobileLink = `${window.location.origin}/?mobile=1&room=${roomId}`;

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ color: "#d97706" }}>📱 Additional verification required</h2>
      <p style={{ color: "#4b5563", maxWidth: "400px", margin: "10px auto" }}>
        Please scan this QR code with your mobile phone to enable dual-camera monitoring.
      </p>
      
      <div style={{ margin: "30px 0", display: "flex", justifyContent: "center" }}>
         <div style={{ padding: "16px", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
           <QRCode value={mobileLink} size={256} />
         </div>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Time Remaining: <span style={{ color: timeLeft < 60 ? "#ef4444" : "#1f2937" }}>{formatTime(timeLeft)}</span></h3>
        <p style={{ fontSize: "14px", color: "#dc2626", fontWeight: "bold", minHeight: "20px" }}>
          {riskLevel === "HIGH" && !extensionUsed && "Phone connection is mandatory for your environment!"}
        </p>
      </div>
    </div>
  );
}
