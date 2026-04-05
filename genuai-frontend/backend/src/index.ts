import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import uploadRoutes from './routes/upload';
import emailRoutes from './routes/email';
import adminRoutes from './routes/admin';
import jobRoutes from './routes/jobs';
import interviewRoutes from './routes/interviews';
import coachRoutes from './routes/coach';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/assessment', assessmentRoutes);
app.use('/upload', uploadRoutes);
app.use('/email', emailRoutes);
app.use('/admin', adminRoutes);
app.use('/jobs', jobRoutes);
app.use('/interviews', interviewRoutes);
app.use('/coach', coachRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'GenuAI API is running', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`GenuAI server running on port ${PORT}`);
});

export default app;
