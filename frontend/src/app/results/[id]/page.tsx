'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { downloadReport, getToken } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import {
  Award,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Star,
} from 'lucide-react';

interface QuestionResult {
  id: number;
  question_text: string;
  question_type?: string;
  order_num?: number;
  answer?: {
    id: number;
    answer_text: string;
    score: number;
    quality_label: string;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
  };
}

interface SessionResults {
  id: number;
  role_target: string;
  session_type: string;
  status: string;
  created_at: string;
  completed_at?: string;
  questions: QuestionResult[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionResults();
  }, [sessionId]);

  async function fetchSessionResults() {
    try {
      setLoading(true);
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/interview/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load session results');
      const data = await res.json();
      setSession(data);
    } catch (err: any) {
      setError(err?.message || 'Error loading results');
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await downloadReport(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InterviewIQ_Report_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Could not download PDF report. Ensure backend report service is running.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-500">Compiling interview evaluation scores...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Results Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">Could not find evaluation details for this session.</p>
          <Link href="/dashboard" className="mt-5 inline-block">
            <Button>Return to Dashboard</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  const answeredQuestions = session.questions.filter((q) => q.answer);
  const totalScore = answeredQuestions.reduce((acc, q) => acc + (q.answer?.score || 0), 0);
  const avgScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

  let scoreGrade = 'Needs Practice';
  let badgeVariant: 'success' | 'warning' | 'danger' = 'danger';
  if (avgScore >= 80) {
    scoreGrade = 'Interview Ready (Strong)';
    badgeVariant = 'success';
  } else if (avgScore >= 60) {
    scoreGrade = 'Competent (Good Foundations)';
    badgeVariant = 'warning';
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Score Hero Summary */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-900 p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-100 border border-white/20 uppercase tracking-wider">
                  {session.session_type} Evaluation
                </span>
                <span className="text-xs text-indigo-200">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                {session.role_target} Mock Interview
              </h1>
              <p className="mt-2 text-indigo-100 text-sm max-w-lg">
                Overall Assessment: <span className="font-semibold">{scoreGrade}</span>. Detailed ML scoring and coaching feedback below.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  isLoading={downloading}
                  className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-md font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Official PDF Report
                </Button>
                <Link href="/interview">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:border-white">
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Practice Again
                  </Button>
                </Link>
              </div>
            </div>

            {/* Circular / Badge Score */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[160px] text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Final Score</span>
              <div className="text-5xl font-black mt-2 text-white">{avgScore}%</div>
              <Badge variant={badgeVariant} className="mt-2">
                {scoreGrade}
              </Badge>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </div>

        {/* Detailed Breakdown Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Question-by-Question Evaluation
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {answeredQuestions.length} of {session.questions.length} questions evaluated by InterviewIQ AI
            </p>
          </div>
          <Link href="/roadmap">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              View Learning Roadmap
            </Button>
          </Link>
        </div>

        {/* Question Results Cards */}
        <div className="space-y-6">
          {session.questions.map((q, idx) => {
            const ans = q.answer;
            const score = ans ? Math.round(ans.score) : 0;
            return (
              <Card key={q.id} className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
                        {q.question_text}
                      </h3>
                    </div>
                  </div>

                  {ans ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{score}%</span>
                        <span className="text-[10px] text-slate-400 uppercase">{ans.quality_label}</span>
                      </div>
                      <Badge variant={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'danger'}>
                        {ans.quality_label}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="neutral">Unanswered</Badge>
                  )}
                </div>

                {ans ? (
                  <>
                    {/* Candidate Answer */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Your Response
                      </h4>
                      <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                        {ans.answer_text}
                      </p>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ans.strengths && ans.strengths.length > 0 && (
                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                          <h5 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Demonstrated Strengths
                          </h5>
                          <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                            {ans.strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ans.weaknesses && ans.weaknesses.length > 0 && (
                        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                          <h5 className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Gaps & Areas to Strengthen
                          </h5>
                          <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                            {ans.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* AI Coaching Feedback */}
                    {ans.feedback && (
                      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                        <h5 className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                          Coaching Tip & Recommendations
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {ans.feedback}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">This question was skipped or not answered.</p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Ready to improve your weak areas?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Explore your personalized learning roadmap designed around the topics identified above.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/roadmap">
              <Button>
                View Customized Roadmap
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

