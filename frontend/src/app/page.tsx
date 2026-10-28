'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Code2,
  Terminal,
  FileText,
  CheckCircle2,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  Shield,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  Sliders,
  Database,
  Server,
} from 'lucide-react';

const mockDemoTabs = [
  {
    id: 'question',
    label: '01. Question Prompt',
    content: {
      title: 'Design a Distributed Rate Limiter for Public APIs',
      type: 'System Design & Distributed Systems',
      level: 'Senior Software Engineer (L5/Staff)',
      body: 'Design an in-memory, multi-tenant rate limiter capable of enforcing a 100 requests per minute limit per API client token across a cluster of 50 API gateway nodes with sub-2ms latency overhead.',
      constraints: ['Sliding Window Counter algorithm', 'Redis cluster backend with TTL', 'Handle edge-case network partitions between API nodes'],
    },
  },
  {
    id: 'answer',
    label: '02. Candidate Response',
    content: {
      type: 'Candidate Transcript (STAR Approach)',
      body: 'I recommend the Sliding Window Counter algorithm backed by a centralized Redis cluster to prevent boundary burst issues associated with Fixed Window counters.\n\nEach API node maintains an asynchronous local buffer with 50ms sync intervals to minimize Redis network trips for non-critical paths. When a request arrives, we execute an atomic Redis pipeline with ZADD and ZREMRANGEBYSCORE on a sorted set keyed by user_id:minute_window.\n\nFor resilience during Redis network partitions, the gateway defaults to a local in-memory fallback counter with pessimistic throttling (allowing at most 30% capacity) to prevent backend cascading failures.',
    },
  },
  {
    id: 'scorecard',
    label: '03. Evaluated Scorecard',
    content: {
      score: 92,
      recommendation: 'Strong Hire',
      metrics: [
        { label: 'Technical Accuracy', score: '95%', note: 'Correctly selected Redis sorted set sliding window' },
        { label: 'Resilience & Failure Modes', score: '90%', note: 'Pessimistic fallback during network partition' },
        { label: 'Latency Awareness', score: '92%', note: 'Evaluated sub-2ms Redis roundtrip trade-off' },
      ],
    },
  },
];

const interviewTracks = [
  {
    title: 'Distributed Systems & Architecture',
    tag: 'System Design',
    desc: 'High-throughput APIs, caching topologies, consensus protocols, and database partitioning.',
    icon: Server,
    topics: ['CAP Theorem', 'Redis & Memcached', 'Sharding & Replication', 'Idempotency'],
  },
  {
    title: 'Modern Frontend & Web Vitals',
    tag: 'Client Engineering',
    desc: 'Concurrent React, DOM rendering lifecycles, memory leak profiling, and bundle optimization.',
    icon: Code2,
    topics: ['SSR & Hydration', 'State Machines', 'Virtualization', 'Network Waterfalls'],
  },
  {
    title: 'Backend Concurrency & APIs',
    tag: 'Backend Engineering',
    desc: 'Asynchronous event loops, race condition prevention, connection pooling, and REST/gRPC.',
    icon: Database,
    topics: ['AsyncIO & Goroutines', 'Deadlock Detection', 'SQL EXPLAIN Profiling', 'gRPC'],
  },
  {
    title: 'Executive Behavioral & STAR',
    tag: 'Leadership & EQ',
    desc: 'High-stakes conflict resolution, delivery under pressure, and cross-functional alignment.',
    icon: Award,
    topics: ['Conflict Mediation', 'Production Postmortems', 'Cross-Team Mentorship', 'Prioritization'],
  },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('question');
  const activeTabData = mockDemoTabs.find((t) => t.id === activeTab) || mockDemoTabs[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Version / Release Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Production ML Engine</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Ridge Scorer + Scikit-Learn</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              Rigorous mock interviews calibrated for top engineering roles.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Analyze your resume, simulate realistic technical and architectural interview rounds, and receive instant rubric-based evaluations scored by custom NLP models.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/interview"
                className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-elevated flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Mock Session
              </Link>
              <Link
                href="/resume"
                className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                Upload Resume First
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Offline Model Fallbacks
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant PDF Reports
              </span>
            </div>
          </div>

          {/* Interactive Product Preview Cockpit */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-elevated overflow-hidden">
            {/* Window Topbar */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="ml-2 font-mono text-xs text-slate-400">InterviewIQ Studio // Live Evaluation</span>
              </div>

              {/* Tab Switcher */}
              <div className="flex rounded-lg bg-slate-200/70 dark:bg-slate-800/80 p-0.5">
                {mockDemoTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                      activeTab === t.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Window Body */}
            <div className="p-6 sm:p-8 min-h-[300px]">
              {activeTab === 'question' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      {activeTabData.content.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeTabData.content.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeTabData.content.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeTabData.content.body}
                  </p>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">Key Criteria:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeTabData.content.constraints?.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'answer' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Target Format: STAR / Architectural Defense</span>
                    <span>148 words</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-line leading-relaxed">
                    {activeTabData.content.body}
                  </div>
                </div>
              )}

              {activeTab === 'scorecard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase">Hiring Committee Recommendation</span>
                      <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {activeTabData.content.recommendation}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400">Composite Score</span>
                      <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {activeTabData.content.score} <span className="text-base text-slate-400 font-normal">/ 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {activeTabData.content.metrics?.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>{m.label}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{m.score}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{m.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Tracks Section */}
      <section id="curriculum" className="py-20 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
              // Specialized Curricula
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Interview tracks modeled after real technical hiring bars.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Practice questions that go beyond boilerplate trivia into production architecture, concurrency, and trade-offs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {interviewTracks.map((track, idx) => {
              const Icon = track.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {track.tag}
                      </span>
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {track.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Evaluated Competencies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {track.topics.map((t, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evaluation Methodology Section */}
      <section id="methodology" className="py-20 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                // Dual-Core Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                How our AI evaluates answers.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Most AI preparation tools simply echo back generic conversational praise. InterviewIQ utilizes a dual-engine architecture:
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                  01
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Deterministic ML Scorer</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Trained Ridge regression model on TF-IDF n-gram vectors. Scores answers mathematically on a calibrated 0–100 scale, completely immune to LLM hallucination.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
                  02
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">LLM Coach Synthesis</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Synthesizes nuanced verbal commentary, pinpointing missing edge cases, architectural trade-offs, and STAR structure improvements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Level up your technical interview performance today.
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Upload your resume, start your first calibrated mock round, and receive an instant hiring committee report.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-elevated"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
