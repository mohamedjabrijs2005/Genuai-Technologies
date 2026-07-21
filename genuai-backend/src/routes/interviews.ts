import express from 'express';
import pool from '../db';
import { sendEmail } from '../utils/mailer';

import { getBaseTemplate } from '../utils/emailTemplates';

const router = express.Router();

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
  const notesSection = notes ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:16px 20px;margin-bottom:24px;"><p style="color:#92400E;font-weight:700;font-size:14px;margin:0 0 8px;">Notes from Company:</p><p style="color:#78350F;font-size:14px;margin:0;line-height:1.6;">${notes}</p></div>` : '';
  
  const header = `
    <div style="background: linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%); padding: 40px 20px; text-align: center;">
      <div style="display: inline-block; font-size: 40px; margin-bottom: 12px;">📅</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Interview Confirmed!</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">Your GenuAI interview has been scheduled</p>
    </div>
  `;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Hello ${candidateName},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">Your interview for <strong style="color:#1A56DB;">${job_title}</strong> at <strong style="color:#1A56DB;">${companyName}</strong> has been confirmed.</p>
    
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 14px 20px; background: #EEF2FF; border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; font-weight: 700; color: #3730A3; font-size: 14px; width: 35%;">Date & Time</td>
          <td style="padding: 14px 20px; background: #EEF2FF; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-size: 14px; font-weight: 600;">${interviewDate}</td>
        </tr>
        <tr>
          <td style="padding: 14px 20px; border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; font-weight: 700; color: #475569; font-size: 14px;">Position</td>
          <td style="padding: 14px 20px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-size: 14px;">${job_title}</td>
        </tr>
        <tr>
          <td style="padding: 14px 20px; border-bottom: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; font-weight: 700; color: #475569; font-size: 14px;">Company</td>
          <td style="padding: 14px 20px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-size: 14px;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 14px 20px; border-right: 1px solid #E2E8F0; font-weight: 700; color: #475569; font-size: 14px;">Room ID</td>
          <td style="padding: 14px 20px; color: #2563EB; font-size: 16px; font-weight: 800; letter-spacing: 1px;">${room_id}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${roomLink}" style="display: inline-block; background-color: #2563EB; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
        💻 Join Interview Room
      </a>
    </div>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 12px 0; color: #1E293B; font-size: 14px;">📝 Important Instructions:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
        <li style="margin-bottom: 6px;">Join 5 minutes before the scheduled time</li>
        <li style="margin-bottom: 6px;">Use GenuAI Interview Room only - no external video apps</li>
        <li style="margin-bottom: 6px;">Ensure your camera and microphone are working</li>
        <li style="margin-bottom: 6px;">Anti-cheat monitoring will be active throughout</li>
        <li>Keep your face visible at all times</li>
      </ul>
    </div>
    
    ${notesSection}
  `;

  return getBaseTemplate(header, body);
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
      await sendEmail({
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
