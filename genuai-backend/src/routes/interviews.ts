import express from 'express';
import pool from '../db';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://genuai-technologies.vercel.app';

function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GEN-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function buildEmailHtml(candidateName: string, job_title: string, companyName: string, interviewDate: string, room_id: string, roomLink: string, notes: string): string {
  const notesSection = notes ? `<div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;"><p style="color:#92400e;font-weight:700;font-size:13px;margin:0 0 6px;">Notes from Company:</p><p style="color:#78350f;font-size:13px;margin:0;line-height:1.6;">${notes}</p></div>` : '';
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0F4FF;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(31,97,220,0.12);">
<div style="background:linear-gradient(135deg,#1a56db,#3b82f6,#06b6d4);padding:40px 32px;text-align:center;">
<div style="font-size:36px;margin-bottom:14px;">&#128197;</div>
<h1 style="color:#fff;margin:0 0 6px;font-size:26px;font-weight:800;">Interview Confirmed!</h1>
<p style="color:rgba(255,255,255,0.85);margin:0;font-size:14px;">Your GenuAI interview has been scheduled</p>
</div>
<div style="padding:36px 32px;">
<p style="color:#1e293b;font-size:16px;margin:0 0 6px;font-weight:600;">Hello, ${candidateName}</p>
<p style="color:#64748b;font-size:14px;margin:0 0 28px;line-height:1.7;">Your interview for <strong style="color:#1a56db;">${job_title}</strong> at <strong style="color:#1a56db;">${companyName}</strong> has been confirmed.</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
<tr><td style="padding:14px 18px;background:#eff6ff;border:1px solid #dbeafe;font-weight:700;color:#1e40af;font-size:13px;width:35%;">Date and Time</td><td style="padding:14px 18px;background:#eff6ff;border:1px solid #dbeafe;color:#1e293b;font-size:14px;font-weight:600;">${interviewDate}</td></tr>
<tr><td style="padding:14px 18px;border:1px solid #dbeafe;font-weight:700;color:#1e40af;font-size:13px;">Position</td><td style="padding:14px 18px;border:1px solid #dbeafe;color:#1e293b;font-size:14px;">${job_title}</td></tr>
<tr><td style="padding:14px 18px;border:1px solid #dbeafe;font-weight:700;color:#1e40af;font-size:13px;">Company</td><td style="padding:14px 18px;border:1px solid #dbeafe;color:#1e293b;font-size:14px;">${companyName}</td></tr>
<tr><td style="padding:14px 18px;border:1px solid #dbeafe;font-weight:700;color:#1e40af;font-size:13px;">Room ID</td><td style="padding:14px 18px;border:1px solid #dbeafe;color:#1a56db;font-size:16px;font-weight:800;letter-spacing:2px;">${room_id}</td></tr>
</table>
<div style="text-align:center;margin-bottom:28px;"><a href="${roomLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#1a56db,#3b82f6);color:#fff;text-decoration:none;border-radius:12px;font-weight:800;font-size:15px;">&#128187; Join Interview Room</a></div>
<div style="background:#f8faff;border:1.5px solid #dbeafe;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
<p style="color:#1e40af;font-weight:700;font-size:14px;margin:0 0 10px;">Important Instructions:</p>
<ul style="color:#475569;font-size:13px;margin:0;padding-left:18px;line-height:2;">
<li>Join 5 minutes before the scheduled time</li>
<li>Use GenuAI Interview Room only - no external video apps</li>
<li>Ensure camera and microphone are working</li>
<li>Anti-cheat monitoring will be active throughout</li>
<li>Keep your face visible at all times</li>
</ul>
</div>
${notesSection}
</div>
<div style="background:#f8faff;border-top:1px solid #dbeafe;padding:24px 32px;text-align:center;">
<p style="font-weight:800;font-size:16px;color:#1a56db;margin:0 0 4px;">GenuAI Technologies</p>
<p style="color:#64748b;font-size:12px;margin:0 0 4px;">AI-Powered Recruitment Intelligence Platform</p>
<p style="color:#94a3b8;font-size:11px;margin:0;">Filtering fake candidates. Finding real talent.</p>
</div>
</div>
</body></html>`;
}

router.post('/schedule', async (req, res) => {
  try {
    const { candidate_id, company_id, job_title, scheduled_at, notes } = req.body;
    if (!candidate_id || !company_id || !scheduled_at) {
      return res.status(400).json({ error: 'candidate_id, company_id and scheduled_at are required' });
    }
    const room_id = generateRoomId();
    const result = await pool.query(
      `INSERT INTO interviews (candidate_id, company_id, job_title, scheduled_at, notes, room_id, room_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'waiting') RETURNING *`,
      [candidate_id, company_id, job_title || '', scheduled_at, notes || '', room_id]
    );
    const candidate = await pool.query('SELECT name, email FROM users WHERE id=$1', [candidate_id]);
    const company = await pool.query('SELECT name FROM users WHERE id=$1', [company_id]);
    const candidateEmail = candidate.rows[0]?.email;
    const candidateName = candidate.rows[0]?.name || 'Candidate';
    const companyName = company.rows[0]?.name || 'Company';
    const rawDate = new Date(scheduled_at);
    const day = rawDate.getDate().toString().padStart(2,'0');
    const month = (rawDate.getMonth()+1).toString().padStart(2,'0');
    const year = rawDate.getFullYear();
    let hours = rawDate.getHours();
    const minutes = rawDate.getMinutes().toString().padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const interviewDate = `${day}/${month}/${year} at ${hours}:${minutes} ${ampm} IST`;
    const roomLink = `${FRONTEND_URL}?room=${room_id}`;

    if (candidateEmail) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: candidateEmail,
        subject: `GenuAI Interview Scheduled - ${job_title} at ${companyName}`,
        html: buildEmailHtml(candidateName, job_title, companyName, interviewDate, room_id, roomLink, notes || ''),
      });
    }
    res.json({ success: true, interview: result.rows[0], room_id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/company/:company_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1 ORDER BY i.scheduled_at DESC`,
      [req.params.company_id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/candidate/:candidate_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as company_name
       FROM interviews i JOIN users u ON i.company_id = u.id
       WHERE i.candidate_id = $1 ORDER BY i.scheduled_at DESC`,
      [req.params.candidate_id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE interviews SET room_status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/room/:room_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as company_name, c.name as candidate_name
       FROM interviews i
       LEFT JOIN users u ON i.company_id = u.id
       LEFT JOIN users c ON i.candidate_id = c.id
       WHERE i.room_id = $1`,
      [req.params.room_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ interview: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
