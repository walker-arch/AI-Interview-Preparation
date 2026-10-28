'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  BrainCircuit,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  BookOpen,
  Layers,
  Code2,
  Server,
  Database,
  Users2,
  Sparkles,
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
    title: 'Data Structures & Core Algorithmic Complexity',
    category: 'Algorithms',
    description: 'Arrays, Hash Maps, Linked Lists, Trees, and Big-O Space/Time trade-offs with live interview code walk-throughs.',
    status: 'completed',
    estimatedHours: 6,
    resources: ['Time & Space Complexity Guide', 'LeetCode Top 50 Patterns', 'Tree Traversal Cheatsheet'],
    roleTarget: 'Software Engineer',
  },
  {
    id: 'm2',
    title: 'Distributed System Design & Scalability Principles',
    category: 'Architecture',
    description: 'Horizontal vs Vertical scaling, load balancers, caching layers (Redis), database sharding, and CAP theorem trade-offs.',
    status: 'in_progress',
    estimatedHours: 8,
    resources: ['System Design Primer', 'Distributed Caching Strategies', 'Microservices vs Monoliths'],
    roleTarget: 'Backend Developer',
  },
  {
    id: 'm3',
    title: 'Asynchronous Programming, Event Loops & Concurrency',
    category: 'Technical Core',
    description: 'Deep dive into asynchronous I/O, event loops, multithreading, race conditions, and non-blocking API paradigms.',
    status: 'in_progress',
    estimatedHours: 5,
    resources: ['Python AsyncIO Mastery', 'Node.js Event Loop In-Depth', 'Thread Pools & Locks'],
    roleTarget: 'Full Stack Developer',
  },
  {
    id: 'm4',
    title: 'STAR Method Behavioral & Crisis Management',
    category: 'Behavioral',
    description: 'Constructing compelling Situation, Task, Action, Result narratives for leadership, conflict resolution, and deadline crunches.',
    status: 'upcoming',
    estimatedHours: 4,
    resources: ['Amazon Leadership Principles Breakdown', 'Conflict Resolution Framework', '30 STAR Story Prompts'],
    roleTarget: 'All Roles',
  },
  {
    id: 'm5',
    title: 'Production SQL Query Optimization & Indexing',
    category: 'Databases',
    description: 'B-tree index mechanics, composite indexes, query execution plan analysis (EXPLAIN ANALYZE), and database locking.',
    status: 'upcoming',
    estimatedHours: 5,
    resources: ['PostgreSQL Indexing Internals', 'Query Plan Profiling Guide', 'Deadlock Prevention'],
    roleTarget: 'Backend & Data',
  },
];

export default function RoadmapPage() {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Personalized Learning Roadmap
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dynamically synthesized based on your resume skill gaps and mock interview scores.
          </p>
        </div>

        {/* Roadmap Progress Card */}
        <Card className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/20 dark:to-violet-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Curriculum Progress
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Target Role: Full Stack Software Engineer
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {progressPercent}%
              </span>
              <span className="text-xs text-slate-500">Completed</span>
            </div>
          </div>
          <ProgressBar value={progressPercent} size="md" />
        </Card>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'in_progress', 'completed', 'upcoming'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';

            return (
              <Card
                key={item.id}
                className={`p-6 border-slate-200/80 dark:border-slate-800 transition-all ${
                  isInProgress ? 'ring-2 ring-indigo-500/20 shadow-md' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : isInProgress ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Module 0{idx + 1}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Resource links */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Curated Resources:
                        </span>
                        {item.resources.map((res, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0 pt-2 sm:pt-0">
                    <Badge
                      variant={
                        isCompleted ? 'success' : isInProgress ? 'info' : 'neutral'
                      }
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>

                    <Link href="/interview">
                      <Button size="sm" variant={isInProgress ? 'primary' : 'outline'}>
                        <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
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

