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
  BrainCircuit,
  Code2,
  Users2,
  Briefcase,
  Play,
  Sparkles,
  ArrowRight,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

const interviewTypes = [
  {
    id: 'technical',
    title: 'Technical Interview',
    desc: 'Coding concepts, system architecture, database optimization, and framework-specific challenges.',
    icon: Code2,
    color: 'border-indigo-500 bg-indigo-50/20 text-indigo-600',
  },
  {
    id: 'behavioral',
    title: 'Behavioral & STAR',
    desc: 'Situation, Task, Action, and Result structured questions covering team collaboration, leadership, and crisis management.',
    icon: Users2,
    color: 'border-violet-500 bg-violet-50/20 text-violet-600',
  },
  {
    id: 'hr',
    title: 'HR & Culture Fit',
    desc: 'Career trajectory, motivation, working style, work ethic, and company alignment discussions.',
    icon: Briefcase,
    color: 'border-emerald-500 bg-emerald-50/20 text-emerald-600',
  },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('technical');
  const [role, setRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role.trim()) {
      setError('Please specify your target role.');
      return;
    }

    try {
      setLoading(true);
      const res = await startInterview({
        type: selectedType,
        role: role.trim(),
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Configure Your Mock Interview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select your interview track, target role, and optional job description for tailored AI questions.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleStart} className="space-y-8">
          {/* 1. Track Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">
              1. Choose Interview Track
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${t.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{t.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {isSelected ? '✓ Selected' : 'Select Track'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Role & Length */}
          <Card className="p-6 border-slate-200/80 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Target Role & Questions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Target Job Role / Title"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, ML Engineer"
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3 Questions (Quick Practice ~ 10 mins)</option>
                  <option value={5}>5 Questions (Standard Practice ~ 20 mins)</option>
                  <option value={8}>8 Questions (Comprehensive Mock ~ 35 mins)</option>
                </select>
              </div>
            </div>

            {/* Job Description Optional */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Target Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the job requirements or posting description here to get questions precisely aligned with the company's expectations..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>
          </Card>

          {/* CTA Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              className="px-8 shadow-lg shadow-indigo-500/25"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Launch Mock Interview
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

