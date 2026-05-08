import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const otpStore: Record<string, { otp: string; expires: number; data: any }> = {};

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
