'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { downloadReport, getToken } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import {
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
  Terminal,
  FileCheck,
  Building,
  ShieldCheck,
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

export default function ResultsDossierPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  async function fetchResults() {
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
      a.download = `InterviewIQ_Evaluation_Report_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Could not generate PDF report. Ensure backend report service is running.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-xs font-mono text-slate-400">Compiling hiring committee dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold">Session Results Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">Could not find evaluation data for this session.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button size="sm">Return to Dashboard</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  const answeredQuestions = session.questions.filter((q) => q.answer);
  const totalScore = answeredQuestions.reduce((acc, q) => acc + (q.answer?.score || 0), 0);
  const avgScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;

  let recommendation = 'No Hire';
  let badgeClass = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900';
  if (avgScore >= 85) {
    recommendation = 'Strong Hire (L5+)';
    badgeClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  } else if (avgScore >= 70) {
    recommendation = 'Hire (Competitive)';
    badgeClass = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  } else if (avgScore >= 50) {
    recommendation = 'Leaning Hire (Needs Follow-Up)';
    badgeClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Executive Dossier Top Header */}
        <div className="p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Hiring Committee Evaluation Pack //
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {session.role_target}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 capitalize">
                Interview Track: {session.session_type} ({answeredQuestions.length} of {session.questions.length} questions evaluated)
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-right">
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Composite Rating</span>
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  {avgScore}%
                </span>
              </div>
              <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${badgeClass}`}>
                {recommendation}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Deterministic Model: Ridge v1.2</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">LLM Synthesis: Active</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Report Status: Final</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                isLoading={downloading}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Signed PDF
              </Button>
              <Link href="/interview">
                <Button size="sm" className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Practice Another Session
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Question-by-Question Evaluation Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Question Evaluation Logs & Coach Commentary
            </h2>
            <Link href="/roadmap" className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
              Curriculum Roadmap <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {session.questions.map((q, idx) => {
            const ans = q.answer;
            const score = ans ? Math.round(ans.score) : 0;
            return (
              <Card key={q.id} className="p-6 border-slate-200/80 dark:border-slate-800/80 space-y-4">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                      Question {idx + 1} //
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                      {q.question_text}
                    </h3>
                  </div>

                  {ans ? (
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-mono font-bold text-slate-900 dark:text-white block">
                        {score}%
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {ans.quality_label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400 italic">Unanswered</span>
                  )}
                </div>

                {ans ? (
                  <>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        Candidate Transcript:
                      </span>
                      <p className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 leading-relaxed">
                        {ans.answer_text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {ans.strengths && ans.strengths.length > 0 && (
                        <div className="p-3.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
                          <h5 className="text-[11px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Demonstrated Competencies
                          </h5>
                          <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                            {ans.strengths.map((str, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 font-mono">•</span>
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ans.weaknesses && ans.weaknesses.length > 0 && (
                        <div className="p-3.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                          <h5 className="text-[11px] font-mono font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Areas for Seniority Growth
                          </h5>
                          <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                            {ans.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-500 font-mono">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {ans.feedback && (
                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                          Staff Engineer Coaching Takeaway:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                          {ans.feedback}
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </Card>
            );
          })}
        </div>

        {/* Next Step Action */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Address your identified gaps in the Curriculum Roadmap
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted modules on Distributed Systems, STAR leadership, and SQL query profiling.
            </p>
          </div>
          <Link href="/roadmap">
            <Button size="sm">
              Open Curriculum Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
