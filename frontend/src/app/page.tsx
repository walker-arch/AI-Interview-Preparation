'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  BrainCircuit,
  FileText,
  MessageSquare,
  BarChart3,
  Target,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Upload,
  Play,
  TrendingUp,
  Star,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Questions',
    description: 'Get realistic interview questions tailored to your role, experience level, and industry using advanced AI.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: FileText,
    title: 'Smart Resume Analysis',
    description: 'Upload your resume and our AI extracts skills, identifies gaps, and generates personalized questions.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Feedback',
    description: 'Receive instant, detailed feedback on your answers with scores, strengths, and improvement areas.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your improvement over time with detailed analytics, charts, and performance insights.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Target,
    title: 'Personalized Roadmap',
    description: 'Get a custom learning path based on your weak areas with curated resources and milestones.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: Shield,
    title: 'Multiple Interview Types',
    description: 'Practice technical, behavioral, and HR interviews with role-specific question banks.',
    color: 'from-rose-500 to-rose-600',
  },
];

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Upload your resume and let our AI extract your skills, experience, and identify your strengths.',
  },
  {
    step: '02',
    icon: Play,
    title: 'Start Mock Interview',
    description: 'Choose your interview type, role, and difficulty. Our AI generates tailored questions just for you.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Track & Improve',
    description: 'Review detailed feedback, track progress over time, and follow your personalized learning roadmap.',
  },
];

const stats = [
  { value: '10K+', label: 'Mock Interviews', icon: MessageSquare },
  { value: '95%', label: 'Success Rate', icon: Award },
  { value: '500+', label: 'Companies', icon: Users },
  { value: '4.9', label: 'User Rating', icon: Star },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-bg-subtle" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-400/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-accent-400/15 via-transparent to-transparent blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative page-container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 mb-8 animate-fade-in-down">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                AI-Powered Interview Preparation
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 animate-fade-in-up text-balance">
              Ace Your Next Interview{' '}
              <span className="gradient-text">with AI</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up text-balance leading-relaxed">
              Practice with AI-generated questions tailored to your resume, get instant feedback,
              track your progress, and land your dream job with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-lg hover:shadow-glow-lg hover:from-primary-700 hover:to-accent-700 transition-all duration-300"
              >
                Start Free Practice
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 shadow-soft hover:shadow-md transition-all duration-300"
              >
                See How It Works
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-2 animate-fade-in">
              <div className="flex -space-x-2">
                {['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                Loved by <span className="font-semibold text-slate-700 dark:text-slate-300">2,000+</span> users
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-2xl bg-white dark:bg-slate-900">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
                    <BrainCircuit className="w-3 h-3" /> InterviewIQ — Mock Interview Session
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Interview Type', value: 'Technical', icon: '💻' },
                    { label: 'Role', value: 'Senior Frontend Dev', icon: '🎯' },
                    { label: 'Progress', value: '5/10 Questions', icon: '📊' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                      <span className="text-2xl mb-2 block">{item.icon}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="bg-primary-50 dark:bg-primary-950/30 rounded-xl p-4 border border-primary-100 dark:border-primary-900">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mb-1">Question 5</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      Explain the concept of React Server Components and how they differ from Client Components. When would you choose one over the other?
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Score: 85/100</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Great answer! You correctly identified the key differences between Server and Client Components...
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-white dark:bg-slate-950">
        <div className="page-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/30 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              From AI-generated questions to personalized learning paths, we&apos;ve built everything
              you need to prepare for your interviews with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover-lift overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-accent-50/50 dark:from-primary-950/20 dark:to-accent-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding gradient-bg-subtle">
        <div className="page-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/30 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Three Simple Steps to{' '}
              <span className="gradient-text">Interview Success</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started in minutes and see real improvement in your interview performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary-300 to-accent-300 dark:from-primary-700 dark:to-accent-700" />
                  )}

                  <div className="relative mb-6 inline-flex">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft flex items-center justify-center">
                      <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white dark:bg-slate-950">
        <div className="page-container">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="w-6 h-6 text-white/80 mx-auto mb-2" />
                      <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-white/70 font-medium">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding gradient-bg-subtle">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
              Ready to{' '}
              <span className="gradient-text">Transform</span> Your Interview Skills?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Join thousands of professionals who have improved their interview performance
              with InterviewIQ. Start practicing today — it&apos;s free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-lg hover:shadow-glow-lg transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Start Free Practice
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
