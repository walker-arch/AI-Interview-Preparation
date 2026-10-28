'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  submitAnswer,
  getToken,
  ApiError,
  Question,
  AnswerResponse,
} from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BrainCircuit,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
  HelpCircle,
  Flag,
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

export default function MockInterviewRoomPage() {
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

      // Restore existing answer if present
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

      // Update local session question object
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
          <p className="mt-4 text-slate-500">Preparing mock interview questions...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || session.questions.length === 0) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Interview Session Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">Could not find questions for this session.</p>
          <Link href="/interview" className="mt-5 inline-block">
            <Button>Configure New Interview</Button>
          </Link>
        </Card>
      </DashboardLayout>
    );
  }

  const currentQ = session.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / session.questions.length) * 100);
  const wordCount = answerText.trim() ? answerText.trim().split(/\\s+/).length : 0;
  const isLastQuestion = currentIdx === session.questions.length - 1;
  const answeredCount = session.questions.filter((q) => q.answer).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header & Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 capitalize">
                {session.session_type} Track
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {session.role_target}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Question {currentIdx + 1} of {session.questions.length}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFinishInterview}
              className="text-slate-600 dark:text-slate-300"
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              Complete & View Report
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress: {answeredCount} of {session.questions.length} answered</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <ProgressBar value={progressPercent} size="sm" />
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Current Question Display */}
        <Card className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/20">
              Q{currentIdx + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question_text}
              </h3>
              <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Focus on structured problem solving, clear reasoning, and real-world examples.
              </p>
            </div>
          </div>
        </Card>

        {/* Candidate Answer Textarea */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">
              Your Answer
            </label>
            <span className="text-xs text-slate-400">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={submitting}
            rows={8}
            placeholder="Type your response here... Structure your answer clearly with context, actions taken, and measurable results."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 disabled:opacity-50 font-normal leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={isLastQuestion}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <Button
              onClick={handleSubmitAnswer}
              isLoading={submitting}
              className="px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              {currentQ.answer ? 'Re-evaluate Answer' : 'Submit & Score Answer'}
            </Button>
          </div>
        </Card>

        {/* Instant Evaluation Feedback Card */}
        {feedback && (
          <Card className="p-6 sm:p-8 border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/25">
                  {Math.round(feedback.score)}%
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Evaluation Score
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={feedback.score >= 70 ? 'success' : feedback.score >= 50 ? 'warning' : 'danger'}>
                      {feedback.quality_label?.toUpperCase() || 'EVALUATED'}
                    </Badge>
                    <span className="text-xs text-slate-500">Evaluated via TF-IDF Ridge Model & LLM</span>
                  </div>
                </div>
              </div>

              {isLastQuestion ? (
                <Button onClick={handleFinishInterview}>
                  View Full Results & Report
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleNext}>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Observed Strengths
                  </h5>
                  <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                    {feedback.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Areas to Improve
                  </h5>
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                    {feedback.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Detailed Feedback */}
            {feedback.feedback && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Coach Commentary
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
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

