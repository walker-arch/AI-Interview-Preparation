'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  Map,
  Play,
  Terminal,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/interview', label: 'Mock Interview Studio', icon: MessageSquare },
  { href: '/resume', label: 'Resume & Skill Parser', icon: FileText },
  { href: '/history', label: 'Evaluation History', icon: History },
  { href: '/roadmap', label: 'Learning Roadmap', icon: Map },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800/80 z-40 transition-transform duration-200 flex flex-col lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-mono font-bold text-xs tracking-tight">
              IQ
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-white">
                InterviewIQ
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Engineering Studio</span>
            </div>
          </Link>

          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            Live
          </span>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <Link
            href="/interview"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-subtle transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Mock Interview
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspace
          </div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="flex-1">{link.label}</span>
                {isActive && (
                  <div className="w-1 h-3.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ML Engine Status & Candidate Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono">Inference Engine</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">v1.2 Active</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Ridge Regressor & TF-IDF Loaded
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                  {user?.name || 'Candidate'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Logged In'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
