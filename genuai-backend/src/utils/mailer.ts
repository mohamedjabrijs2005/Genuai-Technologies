import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/**
 * Creates a Nodemailer transporter.
 * If OAuth2 credentials (GMAIL_CLIENT_ID) are provided, it uses OAuth2.
 * Otherwise, it falls back to basic authentication using GMAIL_APP_PASSWORD.
 */
const createTransporter = async () => {
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
    // OAuth2 Authentication (Recommended)
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await new Promise<string>((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err || !token) {
          reject("Failed to create access token: " + err);
        } else {
          resolve(token);
        }
      });
    });

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    } as nodemailer.TransportOptions);
  } else {
    // Basic Authentication (App Password)
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
};

export const sendEmail = async (options: { to: string; subject: string; html: string; from?: string }) => {
  try {
    const transporter = await createTransporter();
    
    // Default from email if not specified
    const defaultFrom = `"GenuAI Technologies" <${process.env.GMAIL_USER}>`;
    
    const mailOptions = {
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email via Gmail API:", error);
    throw error;
  }
};
