import express from 'express';
import pool from '../db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const router = express.Router();
const ses = new SESClient({ region: 'ap-south-1' });

// Generate unique room ID
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GEN-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Schedule interview
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
    const interviewDate = day + '/' + month + '/' + year + ' at ' + hours + ':' + minutes + ' ' + ampm + ' IST';

    const roomLink = `https://d1ssw1t0a4j2nf.cloudfront.net?room=${room_id}`;

    if (candidateEmail) {
      await ses.send(new SendEmailCommand({
        Source: 'sit24ci006@sairamtap.edu.in',
        Destination: { ToAddresses: [candidateEmail] },
        Message: {
          Subject: { Data: `GenuAI Interview Scheduled — ${job_title} at ${companyName}` },
          Body: {
            Html: {
              Data: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:0;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#00B87C,#00D4FF);padding:32px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;color:#000;">GenuAI Technologies</h1>
                  <p style="color:#000;margin:8px 0 0;font-size:15px;">Your interview has been confirmed</p>
                </div>
                <div style="padding:32px;">
                  <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;line-height:1.6;">Hello <strong style="color:#fff;">${candidateName}</strong>, your interview for <strong style="color:#00B87C;">${job_title}</strong> at <strong style="color:#00B87C;">${companyName}</strong> has been scheduled.</p>

                  <div style="background:#0D1117;border:1px solid #30363D;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Date & Time</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;font-weight:600;">${interviewDate}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Position</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${job_title}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Company</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${companyName}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Room ID</td><td style="padding:10px;border:1px solid #30363D;color:#00B87C;font-size:14px;font-weight:bold;">${room_id}</td></tr>
                      ${notes ? `<tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Notes</td><td style="padding:10px;border:1px solid #30363D;color:#94A3B8;font-size:13px;">${notes}</td></tr>` : ''}
                    </table>
                  </div>

                  <div style="background:#0D1117;border:2px solid #00B87C;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <p style="color:#94A3B8;font-size:13px;margin:0 0 12px;">Join your interview using the GenuAI Interview Room</p>
                    <a href="${roomLink}" style="display:inline-block;background:linear-gradient(135deg,#00B87C,#00D4FF);color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">Join Interview Room</a>
                    <p style="color:#64748B;font-size:12px;margin:12px 0 0;">Your Room ID: <strong style="color:#00B87C;">${room_id}</strong></p>
                    <p style="color:#64748B;font-size:11px;margin:4px 0 0;">Login to GenuAI → Dashboard → Join Interview</p>
                  </div>

                  <div style="background:#1a1a2e;border:1px solid #30363D;border-radius:10px;padding:16px;">
                    <p style="color:#F59E0B;font-weight:bold;margin:0 0 8px;font-size:13px;">Important Instructions:</p>
                    <ul style="color:#94A3B8;font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
                      <li>Join the GenuAI Interview Room — do NOT use any external video app</li>
                      <li>Test your camera and microphone before the interview</li>
                      <li>Anti-cheat monitoring will be active throughout</li>
                      <li>Tab switching and screen sharing are prohibited</li>
                      <li>Join 5 minutes before the scheduled time</li>
                    </ul>
                  </div>
                </div>
                <div style="padding:20px;text-align:center;border-top:1px solid #30363D;">
                  <p style="color:#64748B;font-size:12px;margin:0;">Powered by GenuAI Technologies · AI-Powered Recruitment Intelligence</p>
                </div>
              </div>`
            }
          }
        }
      }));
    }

    res.json({ success: true, interview: result.rows[0], room_id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for company
router.get('/company/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for candidate
router.get('/candidate/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as company_name
       FROM interviews i
       JOIN users u ON i.company_id = u.id
       WHERE i.candidate_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update interview status
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE interviews SET room_status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interview by room_id
router.get('/room/:room_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, c.name as company_name
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       JOIN users c ON i.company_id = c.id
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
