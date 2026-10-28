'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getToken } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Clock,
  Terminal,
  Flag,
  HelpCircle,
  FileCheck,
  Code2,
} from 'lucide-react';

interface SessionData {
  id: number | string;
  role_target: string;
  session_type: string;
  status: string;
  questions: Array<{
    id: number | string;
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
  }>;
}

export default function MockInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  async function fetchSession() {
    try {
      setLoading(true);
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/interview/${sessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load interview session');
      const data: SessionData = await res.json();
      setSession(data);

      const currentQ = data.questions[currentIdx];
      if (currentQ?.answer) {
        setAnswerText(currentQ.answer.answer_text);
        setFeedback(currentQ.answer);
      } else {
        setAnswerText('');
        setFeedback(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading session');
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => {
    if (!session) return;
    if (currentIdx < session.questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextQ = session.questions[nextIdx];
      if (nextQ?.answer) {
        setAnswerText(nextQ.answer.answer_text);
        setFeedback(nextQ.answer);
      } else {
        setAnswerText('');
        setFeedback(null);
      }
    }
  };

  const handlePrevious = () => {
    if (!session) return;
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      const prevQ = session.questions[prevIdx];
      if (prevQ?.answer) {
        setAnswerText(prevQ.answer.answer_text);
        setFeedback(prevQ.answer);
      } else {
        setAnswerText('');
        setFeedback(null);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !answerText.trim()) {
      setError('Please provide an answer before submitting for evaluation.');
      return;
    }

    const currentQ = session.questions[currentIdx];
    if (!currentQ) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/interview/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question_id: currentQ.id,
          answer_text: answerText.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }

      const evalResult = await res.json();
      setFeedback(evalResult);

      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIdx].answer = evalResult;
      setSession({ ...session, questions: updatedQuestions });
    } catch (err: any) {
      setError(err?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    try {
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/interview/${sessionId}/complete`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      router.push(`/results/${sessionId}`);
    } catch {
      router.push(`/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-xs font-mono text-slate-400">Loading mock session environment...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || session.questions.length === 0) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold">Interview Session Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">Could not find questions for this session ID.</p>
          <Link href="/interview" className="mt-4 inline-block">
            <Button size="sm">Configure New Interview</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  const currentQ = session.questions[currentIdx];
  const isLastQuestion = currentIdx === session.questions.length - 1;
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const answeredCount = session.questions.filter((q) => q.answer).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase">
                  {session.session_type} Round
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-mono text-slate-500">{session.role_target}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Session ID: #{session.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleFinishInterview}
              className="text-xs font-mono border-slate-300 dark:border-slate-700"
            >
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Complete & View Report
            </Button>
          </div>
        </div>

        {/* Question Selector Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {session.questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = !!q.answer;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    if (q.answer) {
                      setAnswerText(q.answer.answer_text);
                      setFeedback(q.answer);
                    } else {
                      setAnswerText('');
                      setFeedback(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                      : isAnswered
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Q0{idx + 1}</span>
                  {isAnswered && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
            {answeredCount}/{session.questions.length} Evaluated
          </span>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Question Statement Box */}
        <Card className="p-6 sm:p-7 border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Interview Prompt // Question {currentIdx + 1} of {session.questions.length}</span>
            <span className="capitalize">{session.session_type}</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question_text}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 pt-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Evaluation criteria: Technical precision, edge case awareness, and clear structural narrative.
          </p>
        </Card>

        {/* Answer Drafting Console */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              Candidate Response Workspace
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {wordCount} words
            </span>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={submitting}
            rows={8}
            placeholder="Type your response here... Structure your reasoning clearly: problem framing, trade-offs analyzed, execution steps, and quantifiable results."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white font-mono placeholder:text-slate-400 leading-relaxed disabled:opacity-50"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
                className="text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={isLastQuestion}
                className="text-xs"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <Button
              onClick={handleSubmitAnswer}
              isLoading={submitting}
              size="sm"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-5 text-xs font-semibold shadow-subtle"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {currentQ.answer ? 'Re-evaluate Answer' : 'Submit for Evaluation'}
            </Button>
          </div>
        </Card>

        {/* Instant Evaluation Scorecard */}
        {feedback && (
          <Card className="p-6 sm:p-7 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-mono font-bold text-lg">
                  {Math.round(feedback.score)}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Evaluation Verdict
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {feedback.quality_label}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Scored via Ridge Regressor + LLM Synthesis
                  </p>
                </div>
              </div>

              {isLastQuestion ? (
                <Button size="sm" onClick={handleFinishInterview}>
                  Complete Session & View Dossier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleNext}>
                  Next Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>

            {/* Strengths & Weaknesses Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths Observed
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {feedback.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-mono">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Gaps & Missing Edge Cases
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {feedback.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-mono">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Commentary */}
            {feedback.feedback && (
              <div className="p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Senior Staff Coach Commentary:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {feedback.feedback}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
