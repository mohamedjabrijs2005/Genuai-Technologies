import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

router.post('/send', async (req, res) => {
  try {
    const {
      candidateEmail, candidateName, overallScore, verdict,
      salaryMin, salaryMax, atsScore, testScore, interviewScore,
      authenticityScore, triangleStatus, klevelScore, klevelTier,
      role, keyStrengths, improvementPlan
    } = req.body;

    const vc = verdict === 'HIRE' ? '#00B87C' : verdict === 'REVIEW' ? '#F59E0B' : '#EF4444';
    const vbg = verdict === 'HIRE' ? '#F0FDF4' : verdict === 'REVIEW' ? '#FFFBEB' : '#FEF2F2';
    const vemoji = verdict === 'HIRE' ? '🎉' : verdict === 'REVIEW' ? '⏳' : '❌';
    const vtext = verdict === 'HIRE' ? 'Congratulations! You are selected!' : verdict === 'REVIEW' ? 'Under Review' : 'Not Selected This Time';
    const badge = overallScore >= 85 ? '🥇 GOLD' : overallScore >= 70 ? '🥈 SILVER' : overallScore >= 50 ? '🥉 BRONZE' : '⚠️ NEEDS IMPROVEMENT';
    const badgeColor = overallScore >= 85 ? '#B7791F' : overallScore >= 70 ? '#6B7280' : overallScore >= 50 ? '#92400E' : '#991B1B';

    const nextSteps = verdict === 'HIRE'
      ? '<p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Check your email for onboarding details</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Prepare your original documents</p><p style="color:#64748B;font-size:13px;margin:0;">✅ Our HR team will call you within 2 days</p>'
      : verdict === 'REVIEW'
      ? '<p style="color:#64748B;font-size:13px;margin:0 0 6px;">⏳ Wait for our decision within 2-3 days</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">📱 Keep your phone accessible</p><p style="color:#64748B;font-size:13px;margin:0;">🔍 Review your skill gaps in your report</p>'
      : '<p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your report</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p><p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>';

    const msgText = verdict === 'HIRE'
      ? '<strong>Amazing work!</strong> Your performance was outstanding. Our team will contact you shortly with next steps.'
      : verdict === 'REVIEW'
      ? '<strong>Good effort!</strong> Your profile is under review. We will get back to you within 2-3 business days.'
      : '<strong>Thank you for participating!</strong> Keep improving your skills and apply again in the future.';

    const klevelHtml = klevelTier
      ? `<div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:10px;padding:10px 14px;margin-top:10px;"><span style="font-size:13px;color:#667EEA;"><strong>K-Level Tier:</strong> ${klevelScore}/15 marks — <strong>${klevelTier}</strong></span></div>`
      : '';

    const triangleHtml = triangleStatus
      ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:10px 14px;margin-top:8px;"><span style="font-size:13px;color:#16A34A;"><strong>Triangle Status:</strong> ${triangleStatus}</span></div>`
      : '';

    const strengthsHtml = Array.isArray(keyStrengths) && keyStrengths.length > 0
      ? `<div style="padding:0 32px;margin-bottom:16px;"><h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 10px;">💪 Key Strengths</h3><div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 16px;">${keyStrengths.map((s: string) => `<p style="color:#166534;font-size:13px;margin:0 0 4px;">✅ ${s}</p>`).join('')}</div></div>`
      : '';

    const planHtml = Array.isArray(improvementPlan) && improvementPlan.length > 0
      ? `<div style="padding:0 32px;margin-bottom:16px;"><h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 10px;">📈 Improvement Plan</h3><div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:14px 16px;">${improvementPlan.map((s: string) => `<p style="color:#92400E;font-size:13px;margin:0 0 4px;">→ ${s}</p>`).join('')}</div></div>`
      : '';

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
  <div style="background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%);padding:40px 32px;text-align:center;">
    <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:18px;margin:0 auto 16px;text-align:center;line-height:70px;font-size:36px;font-weight:900;color:#fff;">G</div>
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">GenuAI Technologies</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">AI-Powered Recruitment Intelligence</p>
  </div>
  <div style="padding:32px 32px 0;">
    <h2 style="color:#1E293B;font-size:20px;margin:0 0 8px;">Hello, <strong>${candidateName}</strong>! 👋</h2>
    <p style="color:#64748B;font-size:14px;margin:0 0 24px;line-height:1.6;">Your GenuAI assessment has been completed. Here are your results:</p>
  </div>
  <div style="padding:0 32px;">
    <div style="background:linear-gradient(135deg,#F8FAFC,#EEF2FF);border:2px solid #E2E8F0;border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
      <div style="font-size:64px;font-weight:900;color:#667EEA;line-height:1;margin-bottom:8px;">${overallScore}%</div>
      <div style="display:inline-block;background:${vbg};border:2px solid ${vc};border-radius:10px;padding:6px 20px;margin-bottom:12px;">
        <span style="color:${vc};font-weight:800;font-size:16px;">${vemoji} ${vtext}</span>
      </div>
      <br>
      <div style="display:inline-block;background:#FEF3C7;border-radius:20px;padding:4px 16px;">
        <span style="color:${badgeColor};font-weight:700;font-size:13px;">${badge}</span>
      </div>
    </div>
  </div>
  <div style="padding:0 32px;margin-bottom:20px;">
    <h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 12px;">📊 Score Breakdown</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#F8FAFC;">
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;color:#64748B;font-weight:600;width:25%;">ATS Score</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;font-weight:700;color:#00B87C;width:25%;">${atsScore || 0}%</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;color:#64748B;font-weight:600;width:25%;">Skill Test</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;font-weight:700;color:#F59E0B;width:25%;">${testScore || 0}%</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;color:#64748B;font-weight:600;">Interview</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;font-weight:700;color:#A78BFA;">${interviewScore || 0}%</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;color:#64748B;font-weight:600;">Authenticity</td>
        <td style="padding:10px 14px;border:1px solid #E2E8F0;font-size:13px;font-weight:700;color:#00D4FF;">${authenticityScore || 0}%</td>
      </tr>
    </table>
    ${klevelHtml}
    ${triangleHtml}
  </div>
  <div style="padding:0 32px;margin-bottom:20px;">
    <div style="display:table;width:100%;">
      <div style="display:table-cell;width:50%;padding-right:6px;">
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#16A34A;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Verdict</div>
          <div style="font-size:18px;font-weight:800;color:#15803D;">${verdict}</div>
        </div>
      </div>
      <div style="display:table-cell;width:50%;padding-left:6px;">
        <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#667EEA;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Salary Range</div>
          <div style="font-size:16px;font-weight:800;color:#4338CA;">₹${salaryMin}L – ₹${salaryMax}L</div>
        </div>
      </div>
    </div>
  </div>
  <div style="padding:0 32px;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span style="font-size:12px;color:#64748B;font-weight:600;">Overall Performance</span>
      <span style="font-size:12px;color:#667EEA;font-weight:700;">${overallScore}%</span>
    </div>
    <div style="background:#E2E8F0;border-radius:10px;height:10px;overflow:hidden;">
      <div style="width:${overallScore}%;background:linear-gradient(90deg,#667EEA,#764BA2);height:10px;border-radius:10px;"></div>
    </div>
  </div>
  <div style="padding:0 32px;margin-bottom:24px;">
    <div style="background:${vbg};border-left:4px solid ${vc};border-radius:8px;padding:16px 20px;">
      <p style="color:#1E293B;font-size:14px;margin:0;line-height:1.6;">${msgText}</p>
    </div>
  </div>
  ${strengthsHtml}
  ${planHtml}
  <div style="padding:0 32px;margin-bottom:28px;">
    <h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 12px;">💡 Next Steps</h3>
    <div style="background:#F8FAFC;border-radius:12px;padding:16px;">${nextSteps}</div>
  </div>
  <div style="background:#F8FAFC;padding:24px 32px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94A3B8;font-size:12px;margin:0 0 4px;font-style:italic;">Filtering fake candidates. Finding real talent.</p>
    <p style="color:#CBD5E1;font-size:11px;margin:0;">© 2026 GenuAI Technologies. All Rights Reserved.</p>
  </div>
</div>
</body>
</html>`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: candidateEmail || process.env.RECRUITER_EMAIL!,
      subject: `Your GenuAI Assessment Result - ${verdict}`,
      html,
    });

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
    const subject = isHired
      ? `Congratulations! You have been selected - ${companyName}`
      : `Application Update - ${companyName}`;

    const htmlBody = isHired
      ? `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
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
<p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Our HR team will contact you within 2-3 business days</p>
<p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Keep your phone and email accessible</p>
<p style="color:#64748B;font-size:13px;margin:0;">✅ Prepare your original documents for verification</p>
</div></div>
<div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
<p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
</div></div></body></html>`
      : `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
<div style="background:linear-gradient(135deg,#667EEA,#764BA2);padding:40px 32px;text-align:center;">
<div style="font-size:48px;margin-bottom:12px;">📋</div>
<h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Application Update</h1>
</div>
<div style="padding:32px;">
<p style="color:#1E293B;font-size:16px;">Dear <strong>${candidateName}</strong>,</p>
<p style="color:#64748B;font-size:14px;line-height:1.6;">Thank you for applying for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful consideration, we will not be moving forward at this time.</p>
<div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:20px;margin:20px 0;">
<p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your GenuAI report</p>
<p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p>
<p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>
</div></div>
<div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
<p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
</div></div></body></html>`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.RECRUITER_EMAIL!,
      subject,
      html: htmlBody,
    });

    res.json({ sent: true, verdict, candidateName });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
