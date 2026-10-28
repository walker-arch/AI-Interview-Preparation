// API Client for InterviewIQ AI Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Token Management ─────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('interviewiq_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('interviewiq_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('interviewiq_token');
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface Skill {
  name: string;
  level: string;
  category: string;
}

export interface SkillsResponse {
  skills: Skill[];
  role?: string;
  experience_level?: string;
}

export interface InterviewSession {
  id: string;
  type: string;
  role: string;
  status: string;
  score?: number;
  total_questions?: number;
  answered_questions?: number;
  created_at: string;
  completed_at?: string;
}

export interface Question {
  id: string;
  text: string;
  number: number;
  total: number;
  category?: string;
  difficulty?: string;
}

export interface AnswerFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  sample_answer?: string;
  improvement_tips?: string[];
}

export interface AnswerResponse {
  feedback: AnswerFeedback;
  next_question?: Question;
  session_complete?: boolean;
}

export interface InterviewResult {
  session_id: string;
  type: string;
  role: string;
  overall_score: number;
  total_questions: number;
  completed_at: string;
  categories: { name: string; score: number }[];
  questions: {
    id: string;
    text: string;
    answer: string;
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    sample_answer?: string;
    improvement_tips?: string[];
    category?: string;
  }[];
}

export interface DashboardStats {
  total_interviews: number;
  average_score: number;
  current_streak: number;
  skills_assessed: number;
  improvement_rate?: number;
  best_category?: string;
  weak_category?: string;
}

export interface ProgressData {
  dates: string[];
  scores: number[];
  categories?: { name: string; scores: number[] }[];
}

// ─── API Error ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = 'An unexpected error occurred';
    try {
      const errorData = await response.json();
      detail = errorData.detail || errorData.message || detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new ApiError(response.status, detail);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    setToken(data.access_token);
  }
  return data;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

export function logout(): void {
  removeToken();
}

// ─── Resume API ───────────────────────────────────────────────────────────────

export async function uploadResume(file: File): Promise<{ message: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/api/resume/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function getSkills(): Promise<SkillsResponse> {
  return apiFetch<SkillsResponse>('/api/resume/skills');
}

// ─── Interview API ────────────────────────────────────────────────────────────

export async function startInterview(params: {
  type: string;
  role: string;
  job_description?: string;
  difficulty?: string;
  num_questions?: number;
}): Promise<{ session: InterviewSession; question: Question }> {
  return apiFetch('/api/interview/start', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<AnswerResponse> {
  return apiFetch('/api/interview/answer', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      question_id: questionId,
      answer,
    }),
  });
}

export async function getInterviewHistory(): Promise<InterviewSession[]> {
  return apiFetch<InterviewSession[]>('/api/interview/history');
}

export async function getInterviewResult(sessionId: string): Promise<InterviewResult> {
  return apiFetch<InterviewResult>(`/api/interview/history/${sessionId}`);
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/dashboard/stats');
}

export async function getProgress(): Promise<ProgressData> {
  return apiFetch<ProgressData>('/api/dashboard/progress');
}

// ─── Reports API ──────────────────────────────────────────────────────────────

export async function downloadReport(sessionId: string): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/reports/download/${sessionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to download report');
  }

  return response.blob();
}
