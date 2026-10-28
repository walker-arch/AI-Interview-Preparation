import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-mono font-bold text-[10px]">
            IQ
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">InterviewIQ AI</span>
          <span>•</span>
          <span>Calibrated Technical Interview Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/interview" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Practice Studio
          </Link>
          <Link href="/resume" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Resume Parser
          </Link>
          <Link href="/roadmap" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Curriculum
          </Link>
          <a
            href="https://github.com/walker-arch/AI-Interview-Preparation"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
