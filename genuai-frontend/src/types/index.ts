export interface User {
  id: number;
  name: string;
  email: string;
  role: 'candidate' | 'company';
  token: string;
}

export interface Assessment {
  id: number;
  user_id: number;
  resume_text: string;
  resume_url: string;
  skills: string;
  ats_score: number;
  resume_score: number;
  interview_score: number;
  test_score: number;
  consistency_score: number;
  overall_score: number;
  authenticity_score: number;
  verdict: string;
  triangle_status: string;
  salary_min: number;
  salary_max: number;
  improvement_plan: string;
  created_at: string;
  name?: string;
  email?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  skills_required: string;
  location: string;
  salary_min: number;
  salary_max: number;
}
