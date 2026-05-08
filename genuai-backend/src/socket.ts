import { Server } from "socket.io";

interface Session { candidate: string|null; hr: string|null; mobile: string|null; }
const sessions: Record<string, Session> = {};

export const initSocket = (server: any) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join-session", (data: any) => {
      const sessionId = typeof data === "string" ? data : data.sessionId;
      const role = typeof data === "string" ? "candidate" : (data.role || "candidate");
      socket.join(sessionId);
      if (!sessions[sessionId]) sessions[sessionId] = { candidate: null, hr: null, mobile: null };
      const s = sessions[sessionId];

      if (role === "mobile" && !s.mobile) {
        s.mobile = socket.id;
        socket.emit("role-assigned", "mobile");
        io.to(sessionId).emit("mobile-connected");
      } else if (role === "hr" && !s.hr) {
        s.hr = socket.id;
        socket.emit("role-assigned", "hr");
        if (s.candidate) io.to(sessionId).emit("call-ready");
      } else if (!s.candidate) {
        s.candidate = socket.id;
        socket.emit("role-assigned", "candidate");
        if (s.hr) io.to(sessionId).emit("call-ready");
      }
    });

    // HR ↔ Candidate video call
    socket.on("call-offer",  ({ sessionId, offer }:    any) => socket.to(sessionId).emit("call-offer",  { offer }));
    socket.on("call-answer", ({ sessionId, answer }:   any) => socket.to(sessionId).emit("call-answer", { answer }));
    socket.on("call-ice",    ({ sessionId, candidate }: any) => socket.to(sessionId).emit("call-ice",   { candidate }));

    // Mobile security camera
    socket.on("mobile-offer",  ({ sessionId, offer }:    any) => socket.to(sessionId).emit("mobile-offer",  { offer }));
    socket.on("mobile-answer", ({ sessionId, answer }:   any) => socket.to(sessionId).emit("mobile-answer", { answer }));
    socket.on("mobile-ice",    ({ sessionId, candidate }: any) => socket.to(sessionId).emit("mobile-ice",   { candidate }));
    socket.on("mobile-violation", ({ sessionId, reason }: any) => {
      socket.to(sessionId).emit("mobile-violation", { reason });
    });

    socket.on("disconnect", () => {
      for (const sid in sessions) {
        const s = sessions[sid];
        if (s.candidate === socket.id) { s.candidate = null; io.to(sid).emit("peer-disconnected", "candidate"); }
        if (s.hr       === socket.id) { s.hr       = null; io.to(sid).emit("peer-disconnected", "hr"); }
        if (s.mobile   === socket.id) { s.mobile   = null; io.to(sid).emit("peer-disconnected", "mobile"); }
      }
    });
  });
};
