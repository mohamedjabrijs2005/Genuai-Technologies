import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth';
import assessmentRoutes from './routes/assessment';
import uploadRoutes from './routes/upload';
import emailRoutes from './routes/email';
import skillRoutes from './routes/skill';
import adminRoutes from './routes/admin';
import jobRoutes from './routes/jobs';
import interviewRoutes from './routes/interviews';
import coachRoutes from './routes/coach';
import klevelRoutes from './routes/klevel';
import historyRoutes from './routes/history';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/assessment', assessmentRoutes);
app.use('/upload', uploadRoutes);
app.use('/email', emailRoutes);
app.use('/admin', adminRoutes);
app.use('/skill', skillRoutes);
app.use('/jobs', jobRoutes);
app.use('/interviews', interviewRoutes);
app.use('/coach', coachRoutes);
app.use('/klevel', klevelRoutes);
app.use('/history', historyRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log("GenuAI server running on port " + PORT + " (API + Socket.io)");
});

export default app;
