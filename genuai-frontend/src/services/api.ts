import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const LAMBDA = axios.create({
  baseURL: import.meta.env.VITE_LAMBDA_URL,
});

// Add token to every request
API.interceptors.request.use((config) => {
  const user = localStorage.getItem('genuai_user');
  if (user) {
    const { token } = JSON.parse(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data: any) => API.post("/auth/register", data);
export const login = (data: any) => API.post("/auth/login", data);

// Assessment
export const submitAssessment = (data: any) => API.post('/assessment/submit', data);
export const getAssessment = (id: number) => API.get(`/assessment/${id}`);
export const logCheat = (data: any) => API.post('/assessment/cheat', data);

// Admin
export const getCandidates = () => API.get('/admin/candidates');
export const getStats = () => API.get('/admin/stats');

// Upload
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return API.post('/upload/resume', formData);
};

// Email
export const sendEmail = (data: any) => API.post('/email/send', data);

// Lambda AI
export const checkATS = (data: any) => LAMBDA.post('/ats-check', data);
export const detectFake = (data: any) => LAMBDA.post('/fake-detect', data);
export const scoreSkills = (data: any) => LAMBDA.post('/skill-score', data);
export const runTriangle = (data: any) => LAMBDA.post('/triangle', data);
export const evaluateAI = (data: any) => LAMBDA.post('/evaluate', data);
