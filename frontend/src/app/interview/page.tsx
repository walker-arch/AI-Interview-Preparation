'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { startInterview } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import {
  Code2,
  Users2,
  Briefcase,
  Play,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  Server,
  Building2,
  Sliders,
} from 'lucide-react';

const interviewTracks = [
  {
    id: 'technical',
    title: 'Technical & System Architecture',
    subtitle: 'Data structures, distributed systems, API performance, concurrency, and trade-offs.',
    icon: Code2,
    domains: ['Distributed Cache', 'Concurrency', 'SQL EXPLAIN', 'Async Loops'],
  },
  {
    id: 'behavioral',
    title: 'Behavioral & STAR Leadership',
    subtitle: 'Structured Situation, Task, Action, Result narratives for high-stakes engineering leadership.',
    icon: Users2,
    domains: ['Production Outages', 'Cross-Team Conflict', 'Prioritization', 'Mentorship'],
  },
  {
    id: 'hr',
    title: 'Executive Culture & Talent Fit',
    subtitle: 'Career progression, team operating cadence, working style, and mutual alignment.',
    icon: Briefcase,
    domains: ['Career Trajectory', 'Compensation Expectation', 'Work Cadence', 'Motivation'],
  },
];

const seniorityTiers = ['Junior (L3)', 'Mid-Level (L4)', 'Senior (L5)', 'Staff / Principal (L6+)'];

export default function InterviewSetupStudio() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('technical');
  const [seniority, setSeniority] = useState('Senior (L5)');
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role.trim()) {
      setError('Please specify a target role.');
      return;
    }

    try {
      setLoading(true);
      const combinedRole = `${seniority} - ${role.trim()}`;
      const res = await startInterview({
        type: selectedType,
        role: combinedRole,
        job_description: jobDescription.trim() || undefined,
        num_questions: numQuestions,
      });

      const sessionId = res.session?.id || (res as any).id;
      if (sessionId) {
        router.push(`/interview/${sessionId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Failed to start interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Mock Interview Studio // Session Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Configure Interview Calibration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Specify track, target role seniority, and optional company job description for precise question generation.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleStart} className="space-y-6">
          {/* 1. Track Selection */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              01 // Select Interview Track
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTracks.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-white dark:bg-slate-900 shadow-card ring-1 ring-slate-900 dark:ring-white'
                        : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {t.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1">
                      {t.domains.map((dom, dIdx) => (
                        <span key={dIdx} className="text-[10px] font-mono text-slate-400">
                          #{dom}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Seniority & Role */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
              02 // Seniority & Job Profile
            </span>

            {/* Seniority Segmented Pills */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Seniority Tier</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {seniorityTiers.map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSeniority(tier)}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border text-center transition-colors ${
                      seniority === tier
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <Input
                label="Target Job Role Title"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Distributed Systems Engineer"
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Interview Length
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value={3}>3 Questions (Express Diagnostic ~ 12 mins)</option>
                  <option value={5}>5 Questions (Standard Technical Round ~ 25 mins)</option>
                  <option value={8}>8 Questions (Comprehensive Full-Loop ~ 45 mins)</option>
                </select>
              </div>
            </div>

            {/* Job Description */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Target Company Job Posting (Optional)</span>
                <span className="text-[10px] font-mono text-slate-400">Aligns questions with specific hiring expectations</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the requirements, stack specifications, or company job description to calibrate questions against their exact tech stack..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white font-mono placeholder:text-slate-400"
              />
            </div>
          </Card>

          {/* Launch Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Ready to begin: <strong className="text-slate-900 dark:text-white">{seniority} {role}</strong> ({numQuestions} questions)
            </span>
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold px-6 shadow-elevated"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Live Interview Round
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
