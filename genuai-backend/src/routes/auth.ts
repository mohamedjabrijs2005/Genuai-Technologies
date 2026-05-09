import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import pool from '../db';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const otpStore: Record<string, { otp: string; expires: number; data: any }> = {};
const FRONTEND_URL_PROD = 'https://genuai-technologies.vercel.app';
const BACKEND_URL_PROD = 'https://genuai-technologies.onrender.com';

const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const FRONTEND_URL = isProd ? (process.env.FRONTEND_URL || FRONTEND_URL_PROD) : 'http://localhost:5173';
const BACKEND_URL = isProd ? (process.env.BACKEND_URL || BACKEND_URL_PROD) : 'http://localhost:3000';

console.log(`[Auth] Mode: ${isProd ? 'Production' : 'Development'}`);
console.log(`[Auth] Backend URL: ${BACKEND_URL}`);
console.log(`[Auth] Frontend URL: ${FRONTEND_URL}`);

// ─────────────────────────────────────────────
// Passport OAuth Setup
// ─────────────────────────────────────────────

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${BACKEND_URL}/auth/google/callback`,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'User';
      if (!email) return done(new Error('No email from Google'), false);

      // Upsert user
      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user;
      if (existing.rows.length > 0) {
        user = existing.rows[0];
      } else {
        const result = await pool.query(
          'INSERT INTO users (name, email, password_hash, role, phone, college) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role',
          [name, email, '', 'candidate', '', '']
        );
        user = result.rows[0];
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: `${BACKEND_URL}/auth/github/callback`,
    scope: ['user:email'],
  }, async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || profile.username || 'GitHub User';
      if (!email) return done(new Error('No email from GitHub. Make sure your GitHub email is public or grant email scope.'), false);

      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user;
      if (existing.rows.length > 0) {
        user = existing.rows[0];
      } else {
        const result = await pool.query(
          'INSERT INTO users (name, email, password_hash, role, phone, college) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role',
          [name, email, '', 'candidate', '', '']
        );
        user = result.rows[0];
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
}

// LinkedIn Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your_linkedin_client_id') {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: `${BACKEND_URL}/auth/linkedin/callback`,
    scope: ['openid', 'profile', 'email'],
  }, async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName || 'LinkedIn User';
      if (!email) return done(new Error('No email from LinkedIn.'), false);

      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user;
      if (existing.rows.length > 0) {
        user = existing.rows[0];
      } else {
        const result = await pool.query(
          'INSERT INTO users (name, email, password_hash, role, phone, college) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role',
          [name, email, '', 'candidate', '', '']
        );
        user = result.rows[0];
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
}

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// ─────────────────────────────────────────────
// Helper: Issue JWT and redirect to frontend
// ─────────────────────────────────────────────
function issueJwtAndRedirect(req: any, res: any) {
  const user: any = req.user;
  if (!user) return res.redirect(`${FRONTEND_URL}/?oauth_error=Authentication+failed`);
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const userData = encodeURIComponent(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, token }));
  res.redirect(`${FRONTEND_URL}/?oauth_user=${userData}`);
}

// ─────────────────────────────────────────────
// Google OAuth Routes
// ─────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
    return res.redirect(`${FRONTEND_URL}/?oauth_error=Google+OAuth+not+configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/?oauth_error=Google+auth+failed` })(req, res, next),
  issueJwtAndRedirect
);

// ─────────────────────────────────────────────
// GitHub OAuth Routes
// ─────────────────────────────────────────────
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'your_github_client_id') {
    return res.redirect(`${FRONTEND_URL}/?oauth_error=GitHub+OAuth+not+configured`);
  }
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

router.get('/github/callback',
  (req, res, next) => passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/?oauth_error=GitHub+auth+failed` })(req, res, next),
  issueJwtAndRedirect
);

// ─────────────────────────────────────────────
// LinkedIn OAuth Routes
// ─────────────────────────────────────────────
router.get('/linkedin', (req, res, next) => {
  if (!process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID === 'your_linkedin_client_id') {
    return res.redirect(`${FRONTEND_URL}/?oauth_error=LinkedIn+OAuth+not+configured`);
  }
  passport.authenticate('linkedin', { session: false })(req, res, next);
});

router.get('/linkedin/callback',
  (req, res, next) => passport.authenticate('linkedin', { session: false, failureRedirect: `${FRONTEND_URL}/?oauth_error=LinkedIn+auth+failed` })(req, res, next),
  issueJwtAndRedirect
);

// ─────────────────────────────────────────────
// Existing Email / OTP / Password Routes
// ─────────────────────────────────────────────

router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, password, role, phone, college } = req.body;
    if (!email || !name || !password || !phone) return res.status(400).json({ error: 'All fields required' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000, data: { name, email, password, role, phone, college } };

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'GenuAI Technologies — Email Verification OTP',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0A0A0F;color:#fff;padding:32px;border-radius:12px;border:1px solid #00B87C">
          <h2 style="color:#00B87C">Genu<span style="color:#00D4FF">AI</span> Technologies</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your email verification OTP is:</p>
          <div style="background:#161B22;border:2px solid #00B87C;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:36px;font-weight:bold;color:#00B87C;letter-spacing:8px">${otp}</span>
          </div>
          <p style="color:#64748B">This OTP expires in 10 minutes.</p>
          <p style="color:#64748B;font-size:12px">Powered by GenuAI Technologies · AI-Powered Recruitment Intelligence</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    if (Date.now() > record.expires) { delete otpStore[email]; return res.status(400).json({ error: 'OTP expired.' }); }
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP.' });

    const { name, password, role, phone, college } = record.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone, college) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'candidate', phone, college || '']
    );
    delete otpStore[email];

    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user: result.rows[0], token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, college } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone, college) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'candidate', phone || '', college || '']
    );
    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user: result.rows[0], token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
