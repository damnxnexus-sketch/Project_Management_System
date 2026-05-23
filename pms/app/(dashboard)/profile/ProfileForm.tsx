'use client';

import * as React from 'react';
import { updateUserProfile } from '@/actions/userActions';
import { toast } from '@/lib/toast';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateUserProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar src={user.avatar || undefined} alt={user.name} size="lg" />
        <div>
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">
            Profile Picture
          </p>
          <p className="text-xs text-[var(--muted)]">
            Avatar is generated from your email address
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={user.name}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

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
            defaultValue={user.email}
            required
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
