import express from 'express';
import pool from '../db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const ses = new SESClient({ region: process.env.AWS_REGION });

router.post('/schedule', async (req, res) => {
  try {
    const { candidate_id, company_id, job_title, scheduled_at, meeting_link, notes } = req.body;
    if (!candidate_id || !company_id || !scheduled_at) {
      return res.status(400).json({ error: 'candidate_id, company_id and scheduled_at are required' });
    }
    const result = await pool.query(
      `INSERT INTO interviews (candidate_id, company_id, job_title, scheduled_at, meeting_link, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [candidate_id, company_id, job_title || '', scheduled_at, meeting_link || '', notes || '']
    );
    const candidate = await pool.query('SELECT name, email FROM users WHERE id=$1', [candidate_id]);
    const company = await pool.query('SELECT name FROM users WHERE id=$1', [company_id]);
    const candidateName = candidate.rows[0]?.name || 'Candidate';
    const candidateEmail = candidate.rows[0]?.email;
    const companyName = company.rows[0]?.name || 'Company';
    // Use exact time as entered by company — no timezone conversion
    const rawDate = new Date(scheduled_at);
    const day = rawDate.getDate().toString().padStart(2,'0');
    const month = (rawDate.getMonth()+1).toString().padStart(2,'0');
    const year = rawDate.getFullYear();
    let hours = rawDate.getHours();
    const minutes = rawDate.getMinutes().toString().padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const interviewDate = day + '/' + month + '/' + year + ' at ' + hours + ':' + minutes + ' ' + ampm + ' IST';

    if (process.env.SES_FROM_EMAIL) {
      try {
        await ses.send(new SendEmailCommand({
          Source: process.env.SES_FROM_EMAIL,
          Destination: { ToAddresses: [candidateEmail || 'sit24ci006@sairamtap.edu.in'] },
          Message: {
            Subject: { Data: `Interview Scheduled — ${job_title} at ${companyName}` },
            Body: {
              Html: {
                Data: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;borderRadius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#667EEA,#764BA2);padding:40px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;">📅</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Interview Scheduled!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Your interview has been confirmed</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;margin:0 0 24px;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px;line-height:1.6;">Your interview has been scheduled for the position of <strong style="color:#667EEA;">${job_title}</strong> at <strong style="color:#667EEA;">${companyName}</strong>. Please find the details below.</p>
      <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        <tr style="background:#F8FAFC;">
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:14px;width:40%;">📅 Date & Time</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;font-weight:600;">${interviewDate} IST</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:14px;">💼 Position</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;">${job_title}</td>
        </tr>
        <tr style="background:#F8FAFC;">
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:14px;">🏢 Company</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;">${companyName}</td>
        </tr>
        ${meeting_link ? `
        <tr>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:14px;">🔗 Meeting Link</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-size:14px;"><a href="${meeting_link}" style="color:#667EEA;font-weight:600;text-decoration:none;">${meeting_link}</a></td>
        </tr>` : ''}
        ${notes ? `
        <tr style="background:#F8FAFC;">
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:14px;">📝 Notes</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;">${notes}</td>
        </tr>` : ''}
      </table>
      <div style="background:#EEF2FF;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#667EEA;font-weight:700;margin:0 0 8px;font-size:14px;">💡 Preparation Tips</p>
        <ul style="color:#64748B;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
          <li>Please be on time and keep your documents ready</li>
          <li>Test your camera and microphone before the interview</li>
          <li>Review your resume and be ready to discuss your projects</li>
          <li>Have a stable internet connection</li>
        </ul>
      </div>
      <p style="color:#64748B;font-size:13px;margin:0 0 24px;">Best of luck! 🚀</p>
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
      <p style="color:#CBD5E1;font-size:11px;margin:6px 0 0;">© 2026 GenuAI Technologies. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`
              }
            }
          }
        }));
      } catch (e: any) {
        console.log("Email send failed (ignored):", e.message);
      }
    }
    res.json({ success: true, interview: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for company — supports both /company/:id and /list/:id
router.get('/company/:company_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.company_id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list/:company_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1
       ORDER BY i.scheduled_at DESC`,
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
       FROM interviews i
       JOIN users u ON i.company_id = u.id
       WHERE i.candidate_id = $1
       ORDER BY i.scheduled_at DESC`,
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
    await pool.query('UPDATE interviews SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
