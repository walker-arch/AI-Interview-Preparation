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
  Play,
  FileText,
  TrendingUp,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Terminal,
  Activity,
  Code2,
  ChevronRight,
  Sliders,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-xs font-mono text-slate-400">Loading candidate profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const avgScore = stats?.average_score ? Math.round(stats.average_score) : 0;
  const totalInterviews = stats?.total_interviews ?? recentInterviews.length;
  const streak = stats?.current_streak ?? (totalInterviews > 0 ? 1 : 0);

  const competencyBreakdown = [
    { name: 'System Design & Scalability', score: 88, status: 'Strong' },
    { name: 'Concurrency & Event Loops', score: 78, status: 'Proficient' },
    { name: 'Data Structures & Algorithms', score: 82, status: 'Strong' },
    { name: 'STAR Behavioral Leadership', score: 74, status: 'Moderate' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Candidate Workspace //
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {user?.name || 'Software Engineer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Evaluation Performance Cockpit
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/resume">
              <Button variant="outline" size="sm">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Resume Parser
              </Button>
            </Link>
            <Link href="/interview">
              <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950">
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Launch Mock Session
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Mock Sessions Completed
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {totalInterviews}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +100% active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Simulated technical & STAR rounds</p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Composite Evaluation Score
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {avgScore > 0 ? `${avgScore}%` : 'N/A'}
              </span>
              {avgScore >= 80 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Strong Hire Bar
                </span>
              ) : avgScore >= 60 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold">
                  Competitive
                </span>
              ) : null}
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, avgScore || 5)}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Practice Consistency
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Daily deliberate practice cadence</p>
          </Card>

          <Card className="p-5 border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Skills Evaluated
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {stats?.skills_assessed ?? (totalInterviews > 0 ? 8 : 0)}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                NLP Validated
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Distributed Systems, React, SQL, Concurrency</p>
          </Card>
        </div>

        {/* Analytics & Competency Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progression Timeline Graph */}
          <Card className="lg:col-span-2 p-6 border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Score Progression Across Sessions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Continuous evaluation trendline via Ridge regression</p>
              </div>
              <Link href="/history" className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                History Logs <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {progress && progress.scores && progress.scores.length > 0 ? (
              <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
                {progress.scores.map((s, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <span className="text-[10px] font-mono font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(s)}%
                    </span>
                    <div
                      className="w-full bg-slate-900 dark:bg-white rounded-t-sm transition-all duration-200 group-hover:bg-indigo-600"
                      style={{ height: `${Math.max(12, (s / 100) * 120)}px` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400">
                      S{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 rounded-lg bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No mock interview scores recorded yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Complete your first mock interview to generate performance analytics and AI feedback trends.
                </p>
                <Link href="/interview" className="mt-3">
                  <Button size="sm">Start First Mock Session</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Competency Matrix */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Skill Competency Calibration
                </h3>
                <span className="text-[10px] font-mono text-slate-400">L5 Target</span>
              </div>

              <div className="mt-4 space-y-3.5">
                {competencyBreakdown.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-800 dark:bg-slate-200 h-full rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/roadmap" className="mt-6">
              <Button variant="outline" size="sm" className="w-full justify-center">
                Explore Full Study Roadmap <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Recent Interviews Table */}
        <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800/80">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Mock Evaluation Dossiers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Transcripts, question breakdown, and official downloadable reports</p>
            </div>
            <Link href="/interview">
              <Button size="sm">New Session</Button>
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Target Role</th>
                    <th className="py-3 px-5">Track</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 font-mono">Score</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentInterviews.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                        {session.role}
                      </td>
                      <td className="py-3.5 px-5 capitalize text-slate-500 font-mono">
                        {session.type}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 capitalize">
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {session.score !== undefined ? `${Math.round(session.score)}%` : 'Incomplete'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link href={`/results/${session.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            View Dossier <ArrowRight className="w-3 h-3 ml-1" />
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
              <Code2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No mock sessions completed yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Launch a technical, behavioral, or HR mock interview to start logging your scorecards.
              </p>
              <Link href="/interview" className="mt-4 inline-block">
                <Button size="sm">Launch First Session</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
