'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginAction } from '@/actions/authActions';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--background)] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--accent)]/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[var(--accent)]/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--glass-bg)] p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            NEXUS<span className="text-[var(--accent)]">.</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Email Address / ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <Input
                name="email"
                type="text"
                required
                placeholder="you@agency.com"
                className="pl-9 bg-[var(--background)]/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="pl-9 bg-[var(--background)]/50"
              />
            </div>
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
