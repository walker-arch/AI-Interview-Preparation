'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  BookOpen,
  Server,
  Database,
  Code2,
  Award,
  Layers,
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  estimatedHours: number;
  resources: string[];
  roleTarget: string;
}

const defaultMilestones: Milestone[] = [
  {
    id: 'm1',
    title: 'Data Structures & Algorithmic Space-Time Complexity',
    category: 'Algorithms',
    description: 'Arrays, Hash Tables, Tree traversals, Graph BFS/DFS, and Big-O memory trade-offs under high request throughput.',
    status: 'completed',
    estimatedHours: 6,
    resources: ['LeetCode Top 50 Engineering Patterns', 'Time & Space Complexity Reference', 'Tree Inversion Cheatsheet'],
    roleTarget: 'Core Software Engineering',
  },
  {
    id: 'm2',
    title: 'Distributed System Architecture & Scalability',
    category: 'System Design',
    description: 'Horizontal vs Vertical scaling, load balancers (Layer 4 vs Layer 7), distributed Redis caching, and database replication.',
    status: 'in_progress',
    estimatedHours: 8,
    resources: ['System Design Primer (Donne Martin)', 'Redis Partitioning & Eviction Topologies', 'CAP Theorem in Practice'],
    roleTarget: 'Backend & Distributed Systems',
  },
  {
    id: 'm3',
    title: 'Asynchronous Event Loops & Concurrency Primitives',
    category: 'Concurrency',
    description: 'Deep dive into non-blocking I/O, Python asyncio event loops, race condition prevention, and thread pools.',
    status: 'in_progress',
    estimatedHours: 5,
    resources: ['Python AsyncIO Internals Guide', 'Go Goroutines & Mutex Patterns', 'Deadlock Detection'],
    roleTarget: 'Full Stack & Backend',
  },
  {
    id: 'm4',
    title: 'STAR Method Behavioral & Crisis Postmortems',
    category: 'Behavioral Leadership',
    description: 'Constructing Situation, Task, Action, Result narratives for blameless outages, trade-offs under tight deadlines, and team alignment.',
    status: 'upcoming',
    estimatedHours: 4,
    resources: ['Amazon 16 Leadership Principles Breakdown', 'Blameless Postmortem Structure', 'STAR Scenario Prompts'],
    roleTarget: 'All Senior Candidates',
  },
  {
    id: 'm5',
    title: 'Production SQL Query Optimization & Indexing',
    category: 'Databases',
    description: 'B-Tree vs Hash index mechanics, composite indexing, query profiling via EXPLAIN ANALYZE, and connection pool sizing.',
    status: 'upcoming',
    estimatedHours: 5,
    resources: ['Use The Index, Luke (PostgreSQL)', 'Database Locking & Deadlocks', 'PgBouncer Tuning'],
    roleTarget: 'Backend & Data',
  },
];

export default function CurriculumRoadmapPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = defaultMilestones.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.status === activeFilter;
  });

  const completedCount = defaultMilestones.filter((m) => m.status === 'completed').length;
  const progressPercent = Math.round((completedCount / defaultMilestones.length) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Curriculum Roadmap // Directed Study
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Personalized Engineering Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Synthesized based on your resume skill gaps and identified weak areas across mock interviews.
          </p>
        </div>

        {/* Linear Progress Card */}
        <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Target Objective
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Full Stack & Distributed Systems Mastery
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {progressPercent}%
              </span>
              <span className="text-xs font-mono text-slate-400">Completed</span>
            </div>
          </div>
          <ProgressBar value={progressPercent} size="sm" />
        </Card>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {['all', 'in_progress', 'completed', 'upcoming'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Milestone Cards */}
        <div className="space-y-3.5">
          {filtered.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';

            return (
              <Card
                key={item.id}
                className={`p-5 border-slate-200/80 dark:border-slate-800/80 transition-all ${
                  isInProgress ? 'ring-1 ring-slate-900 dark:ring-white bg-slate-50/40 dark:bg-slate-900/60' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : isInProgress ? (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Module 0{idx + 1}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        {item.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> References:
                        </span>
                        {item.resources.map((res, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0 pt-2 sm:pt-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium capitalize border ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : isInProgress
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>

                    <Link href="/interview">
                      <Button size="sm" variant={isInProgress ? 'primary' : 'outline'} className="text-xs">
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Practice Module
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
