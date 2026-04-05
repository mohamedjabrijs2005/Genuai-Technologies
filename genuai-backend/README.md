# GenuAI Technologies 🚀

> **AI-Powered Recruitment Intelligence Platform**
> Filtering fake candidates. Finding real talent.

[![Live Demo](https://img.shields.io/badge/Live-Demo-00B87C?style=for-the-badge)](https://d1ssw1t0a4j2nf.cloudfront.net)
[![AWS](https://img.shields.io/badge/AWS-Powered-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)

---

## 🏆 Achievement

> **1st Rank — AI-PrepPulse Hackathon** among **60,000+ national participants**
> Built by **Mohamed Jabri Jaffar Sadiq (Safik)**
> Sri Sairam Institute of Technology, Chennai — 2nd Year Engineering

---

## 🎯 What is GenuAI?

GenuAI is an end-to-end AI recruitment intelligence platform that detects fake candidates and identifies genuine talent using a unique **Triangle Consistency Engine** — cross-checking Resume, Skills Test, and Interview scores.

**Live URL:** https://d1ssw1t0a4j2nf.cloudfront.net

---

## ✨ Key Features

### 🔐 Authentication
- JWT-based secure login & registration
- Role-based access: Candidate / Company / Admin
- Email OTP verification via AWS SES
- GitHub + LinkedIn mandatory on register

### 👤 Candidate Dashboard
- PDF resume upload with text extraction
- AI-powered ATS scoring (unique per resume)
- Role-based MCQ skill test (8 roles × 5 questions)
- **Anti-cheat system** — 11 security layers
- Streak bonus (+5 per 5 correct answers)
- Malpractice auto-reject (3+ violations)
- Video / Voice / Text pitch recording
- **AI evaluation** using Gemini + Claude fallback
- Radar chart (5 axes)
- **Triangle Consistency Engine**
- Ranking Badge — Gold / Silver / Bronze
- Salary range estimation
- Personality DNA (5 traits)
- Skill Gap Heatmap
- **Candidate Journey Timeline**
- **Lie Detector Score**
- **Keystroke Dynamics** detection
- **Voice Stress Analysis**

### 🎥 Secure Interview Room
- Fullscreen enforced
- Real-time face detection
- Background noise monitoring
- Tab switch, keyboard shortcuts blocked
- Copy/paste/cut/right-click blocked
- Screenshot detection
- **Motion/Object Detection** via camera
- **Real-time Emotion Detection**
- Violation log with timestamps
- Auto-terminate at 5 violations
- **AI Mock Interview Coach**

### 📄 Resume Generator
- Multi-step resume builder
- Live preview
- Print / Save as PDF / Download HTML
- **AI Resume Suggestions** with ATS scoring
- **AI Cover Letter Generator**

### 🏢 Company Dashboard
- Stats cards (Total/Hired/Review/Rejected)
- Leaderboard with medals + badges
- Search, filter, verdict override
- Job posting form
- **Schedule interviews** with email notification
- **Send hire/reject emails**
- **Export candidates to CSV**
- **Company Intelligence Dashboard**
- **Candidate Comparison Tool** (side by side)

### 🛠️ Admin Dashboard
- Platform statistics
- Role-wise performance analytics
- All candidates management
- Verdict override

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────┐
│                    CloudFront CDN                    │
│              d1ssw1t0a4j2nf.cloudfront.net          │
└─────────────────────┬───────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │      S3 Bucket          │
         │   genuai-resumes-2026   │
         │   (React Frontend)      │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │     API Gateway         │
         │   kmm7bw0f50            │
         │   (17 routes)           │
         └──┬──────────────────┬───┘
            │                  │
  ┌─────────▼──────┐  ┌────────▼────────┐
  │   EC2 Server   │  │  Lambda (x5)    │
  │  t3.micro      │  │  ATS Checker    │
  │  Node.js+PM2   │  │  Fake Detector  │
  │  Port 3000     │  │  Skill Scorer   │
  └─────────┬──────┘  │  Triangle Eng   │
            │         │  AI Evaluator   │
  ┌─────────▼──────┐  └─────────────────┘
  │  RDS PostgreSQL│
  │  genuai_db     │
  │  7 tables      │
  └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 16.6 (AWS RDS) |
| **AI/ML** | Google Gemini, Anthropic Claude |
| **Cloud** | AWS EC2, RDS, S3, CloudFront, Lambda, API Gateway, SES |
| **Process Manager** | PM2 |
| **Web Server** | Nginx |
| **Auth** | JWT, bcryptjs |

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Candidate & company accounts |
| `assessments` | Assessment results |
| `questions` | MCQ question bank |
| `test_answers` | Candidate test answers |
| `cheat_logs` | Anti-cheat violations |
| `jobs` | Company job postings |
| `interviews` | Scheduled interviews |
| `email_logs` | SES email records |

---

## 🚀 API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/send-otp` | Send OTP email |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/assessment/submit` | Submit assessment |
| GET | `/assessment/:id` | Get assessment result |
| GET | `/admin/candidates` | Get all candidates |
| GET | `/admin/stats` | Platform statistics |
| PUT | `/admin/verdict/:id` | Override verdict |
| GET | `/admin/export-csv` | Export to CSV |
| POST | `/jobs/post` | Post a job |
| GET | `/jobs/list` | List all jobs |
| POST | `/interviews/schedule` | Schedule interview |
| POST | `/email/verdict` | Send hire/reject email |
| POST | `/coach/interview-questions` | AI interview questions |
| POST | `/coach/evaluate-answer` | Evaluate answer |
| POST | `/ats-check` | ATS resume scoring |
| POST | `/fake-detect` | Fake resume detection |
| POST | `/triangle` | Triangle consistency |
| POST | `/evaluate` | Full AI evaluation |

---

## ⚡ Lambda Functions

| Function | Purpose |
|---|---|
| `genuai-ats-checker` | ATS resume scoring |
| `genuai-fake-detector` | Fake resume detection |
| `genuai-skill-scorer` | MCQ scoring with cheat penalty |
| `genuai-triangle-engine` | Triangle consistency calculation |
| `genuai-gemini-evaluator` | AI evaluation (Gemini + Claude) |

---

## 🔧 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- AWS Account

### Backend
```bash
git clone https://github.com/mohamedjabrijs2005/Genuai-Technologies.git
cd genuai-backend
npm install
cp .env.example .env
# Fill in your .env values
npm run build
npm start
```

### Frontend
```bash
cd genuai-frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

---

## 👤 Demo Accounts

| Email | Password | Role |
|---|---|---|
| candidate@demo.genuai.com | demo123 | Candidate |
| company@demo.genuai.com | demo123 | Company |

---

## 📊 Project Stats

- **Total Features:** 128+
- **Lines of Code:** 5000+
- **AWS Services Used:** 10+
- **API Routes:** 20+
- **Lambda Functions:** 5
- **Database Tables:** 8

---

## 🌟 Unique AI Features

| Feature | Description |
|---|---|
| Triangle Consistency Engine | Cross-checks Resume + Test + Interview scores |
| Fake Resume Detector | AI-powered authenticity analysis |
| Lie Detector Score | Detects inconsistencies across stages |
| Personality DNA | 5-trait personality analysis |
| Voice Stress Analysis | Detects nervousness in voice |
| Emotion Detection | Real-time facial emotion analysis |
| Motion Detection | Detects suspicious objects in camera |
| Keystroke Dynamics | Detects non-human typing patterns |
| AI Mock Interview Coach | Role-specific questions + AI feedback |
| Skill Gap Heatmap | Visual skill gap analysis per role |

---

## 📁 Project Structure
```
genuai-backend/
├── src/
│   ├── index.ts          # Main Express server
│   ├── db.ts             # PostgreSQL connection
│   └── routes/
│       ├── auth.ts
│       ├── assessment.ts
│       ├── admin.ts
│       ├── email.ts
│       ├── upload.ts
│       ├── jobs.ts
│       ├── interviews.ts
│       └── coach.ts

genuai-frontend/
├── src/
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── CandidateDashboard.tsx
│   │   ├── CompanyDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── InterviewRoom.tsx
│   │   └── ResumeGenerator.tsx
│   ├── services/
│   │   └── api.ts
│   └── App.tsx
```

---

## 🏅 Hackathon

**AI-PrepPulse Hackathon 2026**
- **Rank:** 🥇 1st Place
- **Participants:** 60,000+ national participants
- **College:** Sri Sairam Institute of Technology, Chennai
- **Developer:** Mohamed Jabri Jaffar Sadiq (Safik)
- **Year:** 2nd Year Engineering

---

## 📄 License

MIT License — Free to use with attribution.

---

<div align="center">

**Built with ❤️ by Mohamed Jabri Jaffar Sadiq**

*Sri Sairam Institute of Technology, Chennai*

[![Live Demo](https://img.shields.io/badge/Try-Live%20Demo-00B87C?style=for-the-badge)](https://d1ssw1t0a4j2nf.cloudfront.net)

</div>
