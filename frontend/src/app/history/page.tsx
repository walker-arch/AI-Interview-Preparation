'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getInterviewHistory, downloadReport, InterviewSession } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import {
  Download,
  Play,
  ArrowRight,
  Filter,
  Search,
  Terminal,
  Calendar,
  FileCheck,
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
      a.download = `InterviewIQ_Report_${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download report.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Audit Logs // Candidate Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Mock Interview Dossier History
            </h1>
          </div>
          <Link href="/interview">
            <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold">
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              New Mock Interview
            </Button>
          </Link>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Filter Toolbar */}
        <Card className="p-3.5 border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by target role..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>

          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 w-full sm:w-auto">
            {['all', 'technical', 'behavioral', 'hr'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium capitalize transition-colors ${
                  filterType === t
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* Sessions Table */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredSessions.length > 0 ? (
          <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Target Role</th>
                    <th className="py-3 px-5">Interview Track</th>
                    <th className="py-3 px-5 font-mono">Score</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                        {session.role}
                      </td>
                      <td className="py-3.5 px-5 capitalize text-slate-500 font-mono">
                        {session.type}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 dark:text-white">
                        {session.score !== undefined ? `${Math.round(session.score)}%` : 'Incomplete'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 capitalize">
                          {session.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                        {new Date(session.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownload(session.id)}
                            disabled={downloadingId === session.id}
                            title="Download PDF Dossier"
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/results/${session.id}`}>
                            <Button variant="ghost" size="sm" className="text-xs">
                              View Report <ArrowRight className="w-3 h-3 ml-1" />
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
          <Card className="p-16 text-center border-slate-200/80 dark:border-slate-800/80">
            <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              No Evaluation Records Found
            </h3>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 font-mono">
              Launch a mock interview session to record your performance dossier.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
