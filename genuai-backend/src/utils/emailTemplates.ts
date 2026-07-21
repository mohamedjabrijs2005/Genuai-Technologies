/**
 * Base professional HTML wrapper for all GenuAI emails.
 * Uses a premium, clean, mobile-responsive design that mimics Tailwind CSS components.
 */
export const getBaseTemplate = (headerContent: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              ${headerContent}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <h3 style="color: #3B82F6; margin: 0 0 8px 0; font-size: 16px; font-weight: 800; letter-spacing: -0.5px;">Genu<span style="color: #8B5CF6;">AI</span> Technologies</h3>
              <p style="color: #94A3B8; font-size: 13px; margin: 0 0 16px 0; font-weight: 500;">Next-Generation Recruitment Intelligence</p>
              <p style="color: #CBD5E1; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} GenuAI Technologies. All Rights Reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const getOtpTemplate = (name: string, otp: string, type: 'register' | 'reset') => {
  const isReset = type === 'reset';
  const icon = isReset ? '🔐' : '✉️';
  const title = isReset ? 'Password Reset Request' : 'Verify Your Email';
  const intro = isReset 
    ? 'We received a request to reset your password for your GenuAI account.' 
    : 'Welcome to GenuAI! To complete your registration, please verify your email address.';
  const footerNote = isReset
    ? 'If you did not request a password reset, you can safely ignore this email.'
    : 'If you did not sign up for a GenuAI account, please ignore this email.';

  const header = `
    <div style="background: linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #E2E8F0;">
      <div style="display: inline-block; font-size: 32px; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 16px;">${icon}</div>
      <h1 style="margin: 0; color: #0F172A; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
    </div>
  `;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Hello ${name},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">${intro} To securely complete this process, please use the 6-digit verification code below:</p>
    
    <div style="background-color: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 40px; font-weight: 800; color: #3B82F6; letter-spacing: 12px;">${otp}</span>
    </div>

    <p style="margin: 0; font-size: 14px; color: #64748B; line-height: 1.6;">This secure code will expire in exactly <strong>10 minutes</strong>. ${footerNote}</p>
  `;

  return getBaseTemplate(header, body);
};

export const getInterviewInviteTemplate = (candidateName: string, interviewLink: string, role?: string, company?: string) => {
  const roleText = role && company ? ` for the <strong>${role}</strong> position at <strong>${company}</strong>` : '';
  
  const header = `
    <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #C7D2FE;">
      <div style="display: inline-block; font-size: 32px; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 16px;">🎙️</div>
      <h1 style="margin: 0; color: #312E81; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Interview Invitation</h1>
    </div>
  `;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Hi ${candidateName},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">You have been invited to an AI-powered interview${roleText}. This assessment is designed to evaluate your technical skills and problem-solving abilities fairly and objectively.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${interviewLink}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
        Start Interview
      </a>
    </div>

    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 12px 0; color: #1E293B; font-size: 14px;">📝 Important Instructions:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
        <li>Ensure you are in a quiet environment with a stable internet connection.</li>
        <li>Your camera and microphone must be enabled for proctoring.</li>
        <li>The interview cannot be paused once started.</li>
      </ul>
    </div>

    <p style="margin: 0; font-size: 14px; color: #64748B;">Best of luck!<br>The GenuAI Team</p>
  `;

  return getBaseTemplate(header, body);
};

export const getAssessmentResultTemplate = (candidateName: string, role: string, score: number, breakdown: string, nextSteps: string) => {
  const isExcellent = score >= 85;
  const scoreColor = isExcellent ? '#059669' : (score >= 60 ? '#D97706' : '#DC2626');
  
  const header = `
    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #BBF7D0;">
      <div style="display: inline-block; font-size: 32px; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 16px;">📊</div>
      <h1 style="margin: 0; color: #166534; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Assessment Results</h1>
    </div>
  `;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Hi ${candidateName},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">Your assessment for the <strong>${role}</strong> role has been evaluated by our AI engine. Here is a summary of your performance.</p>
    
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
      <div style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; text-align: center; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Overall Score</p>
        <div style="font-size: 48px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${score}<span style="font-size: 24px; color: #94A3B8;">/100</span></div>
      </div>
    </div>

    <div style="background-color: #F8FAFC; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
      <h4 style="margin: 0 0 12px 0; color: #1E293B; font-size: 14px; font-weight: 700;">Performance Breakdown</h4>
      <div style="color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-line;">${breakdown}</div>
    </div>

    <div style="background-color: #EEF2FF; border-radius: 8px; padding: 20px; border: 1px solid #C7D2FE;">
      <h4 style="margin: 0 0 12px 0; color: #3730A3; font-size: 14px; font-weight: 700;">Next Steps</h4>
      <div style="color: #4338CA; font-size: 14px; line-height: 1.6; white-space: pre-line;">${nextSteps}</div>
    </div>
  `;

  return getBaseTemplate(header, body);
};

export const getVerdictTemplate = (candidateName: string, companyName: string, jobTitle: string, isHired: boolean) => {
  const headerBg = isHired ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)';
  const icon = isHired ? '🎉' : '📋';
  const title = isHired ? 'Congratulations!' : 'Application Update';
  const subtitle = isHired ? 'You have been selected!' : '';

  const header = `
    <div style="background: ${headerBg}; padding: 40px 20px; text-align: center;">
      <div style="display: inline-block; font-size: 40px; margin-bottom: 12px;">${icon}</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
      ${subtitle ? `<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">${subtitle}</p>` : ''}
    </div>
  `;

  const body = isHired
    ? `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Dear ${candidateName},</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">We are thrilled to inform you that you have been <strong style="color: #059669;">selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 24px;">
        <ul style="margin: 0; padding: 0; list-style: none;">
          <li style="margin-bottom: 12px; color: #166534; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">✅</span> Our HR team will contact you within 2-3 business days
          </li>
          <li style="margin-bottom: 12px; color: #166534; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">✅</span> Keep your phone and email accessible
          </li>
          <li style="color: #166534; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">✅</span> Prepare your original documents for verification
          </li>
        </ul>
      </div>
    `
    : `
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Dear ${candidateName},</p>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful consideration, we will not be moving forward with your application at this time.</p>
      
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px;">
        <h4 style="margin: 0 0 12px 0; color: #1E293B; font-size: 14px;">How to improve for next time:</h4>
        <ul style="margin: 0; padding: 0; list-style: none;">
          <li style="margin-bottom: 12px; color: #475569; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">📚</span> Review your skill gaps from your GenuAI assessment report
          </li>
          <li style="margin-bottom: 12px; color: #475569; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">🎯</span> Practice with our AI Mock Interview Coach
          </li>
          <li style="color: #475569; font-size: 14px; display: flex; align-items: flex-start;">
            <span style="margin-right: 8px;">🚀</span> Apply again when you feel ready
          </li>
        </ul>
      </div>
    `;

  return getBaseTemplate(header, body);
};

export const getAdminForwardTemplate = (candidateName: string, previousCompanyName: string, nextCompanyName: string) => {
  const header = `
    <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #FDE68A;">
      <div style="display: inline-block; font-size: 32px; background: #ffffff; padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 16px;">🔄</div>
      <h1 style="margin: 0; color: #92400E; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Profile Forwarded</h1>
    </div>
  `;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 16px; color: #1E293B; font-weight: 600;">Hi ${candidateName},</p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 1.6;">Unfortunately, you were not selected by <strong>${previousCompanyName}</strong>. However, because you are using GenuAI's Waterfall Recruiting feature, your profile has automatically been forwarded to your next choice, <strong>${nextCompanyName}</strong>.</p>
    
    <div style="background-color: #F8FAFC; border-left: 4px solid #3B82F6; padding: 16px 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">You do not need to do anything. The recruitment team at ${nextCompanyName} is now reviewing your assessment scores and interview recording.</p>
    </div>

    <p style="margin: 0; font-size: 14px; color: #64748B;">Best of luck!<br>The GenuAI Team</p>
  `;

  return getBaseTemplate(header, body);
};
