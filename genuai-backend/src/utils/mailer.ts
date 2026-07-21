import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

let cachedTransporter: nodemailer.Transporter | null = null;

/**
 * Creates or retrieves a cached Nodemailer transporter.
 * If OAuth2 credentials (GMAIL_CLIENT_ID) are provided, it uses OAuth2.
 * Otherwise, it falls back to basic authentication using GMAIL_APP_PASSWORD.
 */
const createTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // Manually resolve the IPv4 address to avoid ENETUNREACH on IPv6-only networks
  const { address } = await lookup('smtp.gmail.com', { family: 4 });

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

    cachedTransporter = nodemailer.createTransport({
      host: address,
      port: 465,
      secure: true,
      tls: {
        servername: 'smtp.gmail.com' // Required for SSL verification when connecting via IP
      },
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    } as any);
    return cachedTransporter;
  } else {
    // Basic Authentication (App Password)
    cachedTransporter = nodemailer.createTransport({
      host: address,
      port: 465,
      secure: true,
      tls: {
        servername: 'smtp.gmail.com' // Required for SSL verification when connecting via IP
      },
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    } as any);
    return cachedTransporter;
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
