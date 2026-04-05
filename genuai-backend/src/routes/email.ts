import express from 'express';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const ses = new SESClient({ region: process.env.AWS_REGION });

router.post('/send', async (req, res) => {
  try {
    const { candidateEmail, candidateName, overallScore, verdict, salaryMin, salaryMax } = req.body;
    const verdictColor = verdict === 'HIRE' ? '#00B87C' : verdict === 'REVIEW' ? '#F59E0B' : '#EF4444';
    const verdictBg = verdict === 'HIRE' ? '#F0FDF4' : verdict === 'REVIEW' ? '#FFFBEB' : '#FEF2F2';
    const verdictEmoji = verdict === 'HIRE' ? '🎉' : verdict === 'REVIEW' ? '⏳' : '❌';
    const verdictText = verdict === 'HIRE' ? 'Congratulations! You are selected!' : verdict === 'REVIEW' ? 'Under Review' : 'Not Selected This Time';
    const badge = overallScore >= 85 ? '🥇 GOLD' : overallScore >= 70 ? '🥈 SILVER' : overallScore >= 50 ? '🥉 BRONZE' : '⚠️ NEEDS IMPROVEMENT';
    const badgeColor = overallScore >= 85 ? '#B7791F' : overallScore >= 70 ? '#6B7280' : overallScore >= 50 ? '#92400E' : '#991B1B';

    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: [candidateEmail || 'sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: `Your GenuAI Assessment Result — ${verdict}` },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%);padding:40px 32px;text-align:center;">
      <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:18px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">🧠</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">GenuAI Technologies</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">AI-Powered Recruitment Intelligence</p>
    </div>

    <!-- Greeting -->
    <div style="padding:32px 32px 0;">
      <h2 style="color:#1E293B;font-size:20px;margin:0 0 8px;">Hello, <strong>${candidateName}</strong>! 👋</h2>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px;line-height:1.6;">Your GenuAI assessment has been completed. Here are your results:</p>
    </div>

    <!-- Score Card -->
    <div style="padding:0 32px;">
      <div style="background:linear-gradient(135deg,#F8FAFC,#EEF2FF);border:2px solid #E2E8F0;border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
        <div style="font-size:64px;font-weight:900;color:#667EEA;line-height:1;margin-bottom:8px;">${overallScore}%</div>
        <div style="display:inline-block;background:${verdictBg};border:2px solid ${verdictColor};border-radius:10px;padding:6px 20px;margin-bottom:12px;">
          <span style="color:${verdictColor};font-weight:800;font-size:16px;">${verdictEmoji} ${verdictText}</span>
        </div>
        <div style="display:inline-block;background:#FEF3C7;border-radius:20px;padding:4px 16px;margin-left:8px;">
          <span style="color:${badgeColor};font-weight:700;font-size:13px;">${badge}</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div style="padding:0 32px;margin-bottom:20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#16A34A;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Verdict</div>
          <div style="font-size:18px;font-weight:800;color:#15803D;">${verdict}</div>
        </div>
        <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#667EEA;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Salary Range</div>
          <div style="font-size:16px;font-weight:800;color:#4338CA;">₹${salaryMin}L – ₹${salaryMax}L</div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div style="padding:0 32px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;color:#64748B;font-weight:600;">Overall Performance</span>
        <span style="font-size:12px;color:#667EEA;font-weight:700;">${overallScore}%</span>
      </div>
      <div style="background:#E2E8F0;border-radius:10px;height:10px;overflow:hidden;">
        <div style="width:${overallScore}%;background:linear-gradient(90deg,#667EEA,#764BA2);height:10px;border-radius:10px;"></div>
      </div>
    </div>

    <!-- Message -->
    <div style="padding:0 32px;margin-bottom:24px;">
      <div style="background:${verdictBg};border-left:4px solid ${verdictColor};border-radius:8px;padding:16px 20px;">
        <p style="color:#1E293B;font-size:14px;margin:0;line-height:1.6;">
          ${verdict === 'HIRE'
            ? `<strong>Amazing work!</strong> Your performance was outstanding across all assessment stages. Our team will contact you shortly with next steps. Keep your documents ready!`
            : verdict === 'REVIEW'
            ? `<strong>Good effort!</strong> Your profile is under review by our team. We will get back to you within 2-3 business days with our decision.`
            : `<strong>Thank you for participating!</strong> While this opportunity didn't work out, we encourage you to keep improving your skills and apply again in the future.`
          }
        </p>
      </div>
    </div>

    <!-- Tips -->
    <div style="padding:0 32px;margin-bottom:28px;">
      <h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 12px;">💡 Next Steps</h3>
      <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
        ${verdict === 'HIRE'
          ? `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Check your email for onboarding details</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Prepare your original documents</p><p style="color:#64748B;font-size:13px;margin:0;">✅ Our HR team will call you within 2 days</p>`
          : verdict === 'REVIEW'
          ? `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">⏳ Wait for our decision within 2-3 days</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">📱 Keep your phone accessible</p><p style="color:#64748B;font-size:13px;margin:0;">🔍 Review your skill gaps in your report</p>`
          : `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your report</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p><p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>`
        }
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;padding:24px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
        <div style="width:28px;height:28px;background:linear-gradient(135deg,#667EEA,#764BA2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;">G</div>
        <span style="color:#1E293B;font-weight:700;font-size:15px;">GenuAI Technologies</span>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin:0 0 4px;font-style:italic;">Filtering fake candidates. Finding real talent.</p>
      <p style="color:#CBD5E1;font-size:11px;margin:0;">© 2026 GenuAI Technologies. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`
          }
        }
      }
    }));
    res.json({ sent: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/verdict', async (req, res) => {
  try {
    const { candidateEmail, candidateName, verdict, companyName, jobTitle } = req.body;
    if (!candidateEmail || !candidateName || !verdict) {
      return res.status(400).json({ error: 'candidateEmail, candidateName and verdict are required' });
    }
    const isHired = verdict === 'HIRE';
    const subject = isHired ? `Congratulations! You have been selected — ${companyName}` : `Application Update — ${companyName}`;
    const htmlBody = isHired ? `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#00B87C,#00D4AA);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Congratulations!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">You have been selected!</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;">We are thrilled to inform you that you have been <strong style="color:#00B87C;">selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:20px 0;">
        <h3 style="color:#16A34A;margin:0 0 12px;font-size:15px;">🎯 Next Steps</h3>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Our HR team will contact you within 2-3 business days</p>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Keep your phone and email accessible</p>
        <p style="color:#64748B;font-size:13px;margin:0;">✅ Prepare your original documents for verification</p>
      </div>
      <p style="color:#64748B;font-size:14px;">Welcome to the team! 🚀</p>
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
    </div>
  </div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#667EEA,#764BA2);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📋</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Application Update</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;">Thank you for applying for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful consideration, we will not be moving forward with your application at this time.</p>
      <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:20px;margin:20px 0;">
        <h3 style="color:#667EEA;margin:0 0 12px;font-size:15px;">💡 Tips to Improve</h3>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your GenuAI report</p>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p>
        <p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>
      </div>
      <p style="color:#64748B;font-size:14px;">Best of luck in your career journey!</p>
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
    </div>
  </div>
</body>
</html>`;

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
