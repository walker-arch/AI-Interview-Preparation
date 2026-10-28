'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import {
  getDashboardStats,
  getProgress,
  getInterviewHistory,
  DashboardStats,
  ProgressData,
  InterviewSession,
} from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  BrainCircuit,
  FileText,
  Play,
  TrendingUp,
  Award,
  Flame,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsData, progressData, historyData] = await Promise.allSettled([
          getDashboardStats(),
          getProgress(),
          getInterviewHistory(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (progressData.status === 'fulfilled') setProgress(progressData.value);
        if (historyData.status === 'fulfilled') {
          setRecentInterviews(historyData.value.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Loading your interview insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  const avgScore = stats?.average_score ? Math.round(stats.average_score) : 0;
  const totalInterviews = stats?.total_interviews ?? recentInterviews.length;
  const streak = stats?.current_streak ?? (totalInterviews > 0 ? 1 : 0);
  const skillsCount = stats?.skills_assessed ?? (totalInterviews > 0 ? 8 : 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white shadow-xl shadow-indigo-500/10">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to excel, {user?.name || 'Candidate'}?
            </h1>
            <p className="mt-3 text-indigo-100 text-base sm:text-lg leading-relaxed">
              Analyze your resume, conduct AI-driven mock interviews, and master technical and behavioral questions tailored to your target role.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/interview">
                <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-md">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Start Mock Interview
                </Button>
              </Link>
              <Link href="/resume">
                <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 hover:border-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Interviews</p>
                <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{totalInterviews}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mr-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +100%
              </span>{' '}
              activity this week
            </div>
          </Card>

          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Score</p>
                <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
                  {avgScore > 0 ? `${avgScore}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, avgScore || 5)}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Practice Streak</p>
                <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                <Flame className="w-6 h-6" />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Keep practicing daily to build readiness!
            </p>
          </Card>

          <Card className="p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Skills Evaluated</p>
                <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{skillsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Layers className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Technical & Behavioral</span>
            </div>
          </Card>
        </div>

        {/* Analytics & Roadmap preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Score Progression</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track your performance improvement across mock sessions</p>
              </div>
              <Link href="/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center">
                Full History <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Visual Progress Graph */}
            {progress && progress.scores && progress.scores.length > 0 ? (
              <div className="h-48 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
                {progress.scores.map((s, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(s)}%
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${Math.max(15, (s / 100) * 140)}px` }}
                    />
                    <span className="text-[10px] text-slate-400">
                      {progress.dates[idx] || `S${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No mock interview scores yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Complete your first mock interview to generate performance analytics and AI feedback trends.
                </p>
                <Link href="/interview" className="mt-4">
                  <Button size="sm">Start First Mock Session</Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-6 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Next Step</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personalized Roadmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Our ML system analyzes your weak topics from mock interviews and curates tailored study materials.
              </p>

              <div className="mt-5 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">System Design & Scaling</span>
                  <Badge variant="warning">Priority</Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">STAR Behavioral Stories</span>
                  <Badge variant="info">In Review</Badge>
                </div>
              </div>
            </div>

            <Link href="/roadmap" className="mt-6">
              <Button variant="outline" className="w-full justify-center">
                Explore Full Roadmap
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Interviews Table */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Interview Sessions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review answers, scores, and downloadable evaluation reports</p>
            </div>
            <Link href="/interview">
              <Button size="sm">New Interview</Button>
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Role & Track</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentInterviews.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {session.role}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-600 dark:text-slate-400">{session.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={session.status === 'completed' ? 'success' : 'warning'}>
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {session.score !== undefined ? `${Math.round(session.score)}%` : 'In Progress'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/results/${session.id}`}>
                          <Button variant="ghost" size="sm">
                            View Feedback
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No mock interview sessions yet</p>
              <p className="text-xs text-slate-400 mt-1">Start practicing with our AI interviewer to get instant evaluation and scores.</p>
              <Link href="/interview" className="inline-block mt-4">
                <Button>Start First Session</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

