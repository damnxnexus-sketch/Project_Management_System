'use client';

import * as React from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/actions/passwordActions';
import { toast } from '@/lib/toast';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = React.useTransition();
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result.success) {
        setSubmitted(true);
        toast.success(result.message || 'Password reset link sent');
      } else {
        toast.error(result.error || 'Failed to send reset link');
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Mail className="text-green-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground-heading)] mb-2">
              Check Your Email
            </h1>
            <p className="text-[var(--muted)]">
              If an account exists with the provided email, you will receive a password reset link shortly.
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--foreground-heading)] mb-2">
            Forgot Password?
          </h1>
          <p className="text-[var(--muted)]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--foreground)] mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>

        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            <strong>Note:</strong> Email functionality is not fully configured. Password reset tokens will be logged to the console for development purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
