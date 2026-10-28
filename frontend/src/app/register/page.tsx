'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-mono font-bold text-xs tracking-tight shadow-sm">
            IQ
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
            InterviewIQ
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Create candidate account
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-mono">
          Free access to calibrated technical & behavioral mock evaluations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card">
          {error && (
            <div className="mb-5">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              icon={UserIcon}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password (min 6 chars)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold"
                isLoading={loading}
              >
                Create Account & Enter Workspace
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-slate-900 dark:text-white hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
