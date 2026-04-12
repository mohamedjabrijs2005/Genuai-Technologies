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
// export const evaluateAI = (data: any) => LAMBDA.post('/evaluate', data);


export const evaluateAI = async (data: any) => {
  const { resume_text, skills, test_score, interview_pitch, role } = data;
  
  const prompt = `You are a strict, top-tier AI Recruiter. You must evaluate this candidate using a highly strategic TRIPLE-PILLAR approach. 
The 3 Pillars (Resume Profile, Skill Test, and Voice Pitch) are EQUAL priorities for success. All three must reflect high efficiency and excellence for a positive verdict.

1. Resume Profile: ${(resume_text || "").substring(0, 1000)}
2. Skill Test Score: ${test_score}/100 (Role: ${role}, Skills: ${(skills||[]).join(", ")})
3. Voice Pitch Transcription: "${interview_pitch}"

CRITICAL VOICE PITCH EVALUATION (Fluency & Voice Clarity):
Your absolute top priority when evaluating the Pitch is "Fluency of Language" and "Voice Clarity". You must logically deduce this from their transcription text:
- Voice Clarity: Demand clean, articulate speech. Apply SEVERE score penalties for filler words ("um", "ah", "like"), stuttering, or garbled sentences.
- Fluency of Language: Demand smooth sentence structure, natural context transitions, and advanced professional vocabulary.

Return ONLY a valid JSON object (no markdown, no backticks, no other text) with these exact fields:
{
    "resume_score": 85,
    "interview_score": 80,
    "communication_score": 75,
    "technical_depth": 80,
    "confidence_level": "Medium",
    "key_strengths": ["strength1", "strength2"],
    "areas_to_improve": ["area1", "area2"],
    "ai_verdict": "HIRE",
    "ai_reasoning": "Explanation explicitly highlighting their Fluency/Voice Clarity and how the 3 pillars balanced out."
}`;

  try {
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    }, {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    // Safe JSON Extractor 
    const responseText = res.data.choices[0].message.content;
    const jsonStr = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
    return { data: JSON.parse(jsonStr) };
  } catch (e) {
    console.error("Groq Eval Error", e);
    return { data: {
      resume_score: 80, interview_score: 70, communication_score: 60, technical_depth: 70, confidence_level: "Medium",
      key_strengths: ["Communication", "Problem Solving"], areas_to_improve: ["Voice Clarity", "Language Fluency"],
      ai_verdict: "REVIEW", ai_reasoning: "Fall-back evaluation used due to network constraints."
    }};
  }
};
