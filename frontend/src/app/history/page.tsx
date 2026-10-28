'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getInterviewHistory, downloadReport, InterviewSession } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import {
  BrainCircuit,
  Calendar,
  Download,
  Play,
  ArrowRight,
  Filter,
  Award,
  Search,
} from 'lucide-react';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const data = await getInterviewHistory();
      setSessions(data || []);
      setFilteredSessions(data || []);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = [...sessions];
    if (filterType !== 'all') {
      result = result.filter(
        (s) => s.type?.toLowerCase() === filterType.toLowerCase()
      );
    }
    if (searchTerm.trim()) {
      result = result.filter((s) =>
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSessions(result);
  }, [filterType, searchTerm, sessions]);

  const handleDownload = async (sessionId: string) => {
    try {
      setDownloadingId(sessionId);
      const blob = await downloadReport(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Report_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download report. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Interview History
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review your past mock interviews, answers, evaluation scores, and download reports.
            </p>
          </div>
          <Link href="/interview">
            <Button>
              <Play className="w-4 h-4 mr-2 fill-current" />
              New Mock Interview
            </Button>
          </Link>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Filters & Search */}
        <Card className="p-4 border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
              {['all', 'technical', 'behavioral', 'hr'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filterType === t
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Sessions Table */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Target Role</th>
                    <th className="py-3.5 px-6">Interview Track</th>
                    <th className="py-3.5 px-6">Score</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        {session.role}
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-slate-600 dark:text-slate-300">
                          {session.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        {session.score !== undefined ? (
                          <span className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-indigo-500" />
                            {Math.round(session.score)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">Incomplete</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={session.status === 'completed' ? 'success' : 'warning'}
                        >
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(session.id)}
                            disabled={downloadingId === session.id}
                            title="Download PDF Report"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Link href={`/results/${session.id}`}>
                            <Button variant="ghost" size="sm">
                              View Results
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-16 text-center border-slate-200/80 dark:border-slate-800">
            <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Interview Sessions Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Start your first AI mock session to begin tracking performance and building interview readiness.
            </p>
            <Link href="/interview" className="mt-5 inline-block">
              <Button>Start First Interview</Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

