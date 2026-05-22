'use client';

import * as React from 'react';
import { changePassword } from '@/actions/userActions';
import { toast } from '@/lib/toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function PasswordChangeForm() {
  const [isPending, startTransition] = React.useTransition();
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false,
  });
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await changePassword(formData);
      if (result.success) {
        toast.success('Password changed successfully');
        formRef.current?.reset();
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-[var(--foreground)] mb-2"
        >
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 pr-10 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-[var(--foreground)] mb-2"
        >
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 pr-10 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-[var(--muted)] mt-1">
          Must be at least 6 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[var(--foreground)] mb-2"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 pr-10 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
