import express from 'express';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const ses = new SESClient({ region: process.env.AWS_REGION });

// Send assessment result email
router.post('/send', async (req, res) => {
  try {
    const { candidateEmail, candidateName, overallScore, verdict, salaryMin, salaryMax } = req.body;
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: ['sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: 'Your GenuAI Assessment Result' },
        Body: {
          Html: {
            Data: `
              <h2>Hello ${candidateName}!</h2>
              <p>Your GenuAI assessment is complete.</p>
              <h3>Overall Score: ${overallScore}%</h3>
              <h3>Verdict: ${verdict}</h3>
              <p>Estimated Salary: ₹${salaryMin}L - ₹${salaryMax}L per year</p>
              <br/>
              <p>Thank you for using GenuAI Technologies.</p>
              <p><strong>Filtering fake candidates. Finding real talent.</strong></p>
            `
          }
        }
      }
    }));
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: [process.env.RECRUITER_EMAIL!] },
      Message: {
        Subject: { Data: `New Candidate Assessment — ${candidateName}` },
        Body: {
          Html: {
            Data: `
              <h2>New Candidate Assessment Completed</h2>
              <p><strong>Candidate:</strong> ${candidateName}</p>
              <p><strong>Email:</strong> ${candidateEmail}</p>
              <p><strong>Overall Score:</strong> ${overallScore}%</p>
              <p><strong>Verdict:</strong> ${verdict}</p>
              <p><strong>Salary Estimate:</strong> ₹${salaryMin}L - ₹${salaryMax}L</p>
              <br/>
              <p>Login to GenuAI Dashboard to view full report.</p>
            `
          }
        }
      }
    }));
    res.json({ sent: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Send hire/reject email to candidate
router.post('/verdict', async (req, res) => {
  try {
    const { candidateEmail, candidateName, verdict, companyName, jobTitle } = req.body;
    if (!candidateEmail || !candidateName || !verdict) {
      return res.status(400).json({ error: 'candidateEmail, candidateName and verdict are required' });
    }
    const isHired = verdict === 'HIRE';
    const subject = isHired
      ? `Congratulations! You have been selected — ${companyName}`
      : `Application Update — ${companyName}`;
    const htmlBody = isHired
      ? `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:2px solid #22c55e;border-radius:10px;">
          <h1 style="color:#22c55e;">🎉 Congratulations ${candidateName}!</h1>
          <p style="font-size:16px;">We are thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle || 'the role'}</strong> at <strong>${companyName}</strong>.</p>
          <p>Your performance in the GenuAI assessment was outstanding. Our team was impressed by your skills and consistency.</p>
          <h3 style="color:#22c55e;">Next Steps:</h3>
          <ul>
            <li>Our HR team will contact you within 2-3 business days</li>
            <li>Please keep your phone and email accessible</li>
            <li>Prepare your original documents for verification</li>
          </ul>
          <br/>
          <p>Welcome to the team! 🚀</p>
          <p><strong>${companyName}</strong> via <em>GenuAI Technologies</em></p>
          <p style="color:#888;font-size:12px;">Filtering fake candidates. Finding real talent.</p>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:2px solid #ef4444;border-radius:10px;">
          <h1 style="color:#ef4444;">Application Update</h1>
          <p style="font-size:16px;">Dear ${candidateName},</p>
          <p>Thank you for applying for <strong>${jobTitle || 'the role'}</strong> at <strong>${companyName}</strong> and for taking the time to complete our GenuAI assessment.</p>
          <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
          <p>We encourage you to keep improving your skills and apply again in the future.</p>
          <h3>Tips to improve:</h3>
          <ul>
            <li>Review your skill gaps from your GenuAI report</li>
            <li>Practice more MCQ tests on your target role</li>
            <li>Strengthen your resume with real projects</li>
          </ul>
          <br/>
          <p>Best of luck in your career journey!</p>
          <p><strong>${companyName}</strong> via <em>GenuAI Technologies</em></p>
          <p style="color:#888;font-size:12px;">Filtering fake candidates. Finding real talent.</p>
        </div>
      `;
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: ['sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlBody } }
      }
    }));
    res.json({ sent: true, verdict, candidateName });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
