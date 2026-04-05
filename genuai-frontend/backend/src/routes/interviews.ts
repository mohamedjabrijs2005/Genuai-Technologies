import express from 'express';
import pool from '../db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const ses = new SESClient({ region: process.env.AWS_REGION });

// Schedule an interview
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
    // Get candidate and company details for email
    const candidate = await pool.query('SELECT name, email FROM users WHERE id = $1', [candidate_id]);
    const company = await pool.query('SELECT name FROM users WHERE id = $1', [company_id]);
    const candidateName = candidate.rows[0]?.name || 'Candidate';
    const companyName = company.rows[0]?.name || 'Company';
    const interviewDate = new Date(scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    // Send email notification
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: ['sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: `Interview Scheduled — ${job_title} at ${companyName}` },
        Body: {
          Html: {
            Data: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:2px solid #3b82f6;border-radius:10px;">
                <h1 style="color:#3b82f6;">📅 Interview Scheduled!</h1>
                <p>Dear <strong>${candidateName}</strong>,</p>
                <p>Your interview has been scheduled for the position of <strong>${job_title}</strong> at <strong>${companyName}</strong>.</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                  <tr style="background:#f0f9ff;">
                    <td style="padding:10px;border:1px solid #bae6fd;"><strong>Date & Time</strong></td>
                    <td style="padding:10px;border:1px solid #bae6fd;">${interviewDate} IST</td>
                  </tr>
                  <tr>
                    <td style="padding:10px;border:1px solid #bae6fd;"><strong>Position</strong></td>
                    <td style="padding:10px;border:1px solid #bae6fd;">${job_title}</td>
                  </tr>
                  <tr style="background:#f0f9ff;">
                    <td style="padding:10px;border:1px solid #bae6fd;"><strong>Company</strong></td>
                    <td style="padding:10px;border:1px solid #bae6fd;">${companyName}</td>
                  </tr>
                  ${meeting_link ? `<tr>
                    <td style="padding:10px;border:1px solid #bae6fd;"><strong>Meeting Link</strong></td>
                    <td style="padding:10px;border:1px solid #bae6fd;"><a href="${meeting_link}">${meeting_link}</a></td>
                  </tr>` : ''}
                  ${notes ? `<tr style="background:#f0f9ff;">
                    <td style="padding:10px;border:1px solid #bae6fd;"><strong>Notes</strong></td>
                    <td style="padding:10px;border:1px solid #bae6fd;">${notes}</td>
                  </tr>` : ''}
                </table>
                <p>Please be on time and keep your documents ready.</p>
                <p>Best of luck! 🚀</p>
                <p><em>GenuAI Technologies — Filtering fake candidates. Finding real talent.</em></p>
              </div>
            `
          }
        }
      }
    }));
    res.json({ success: true, interview: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all interviews for a company
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

// Get all interviews for a candidate
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

// Update interview status
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
