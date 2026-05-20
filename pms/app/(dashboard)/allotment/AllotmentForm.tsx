'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assignDailyTask } from '@/actions/taskActions';
import { Calendar, User as UserIcon, Type } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useTransition } from 'react';

type UserData = { id: string; name: string; role: string; avatar: string | null };

export function AllotmentForm({ users }: { users: UserData[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await assignDailyTask(formData);
      if (result?.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage('Task assigned successfully!');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setMessage(''), 3000);
      }
    });
  };

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] p-6 w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <UserIcon size={16} className="text-[var(--muted)]" />
            Select Worker
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
            {users.map(user => (
              <label key={user.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] p-3 hover:bg-[var(--background)]/50 cursor-pointer has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent)]/10 transition-colors">
                <input type="radio" name="assigneeId" value={user.id} required className="hidden" />
                <Avatar src={user.avatar || undefined} alt={user.name} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--foreground)]">{user.name}</span>
                  <span className="text-xs text-[var(--muted)]">{user.role}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Calendar size={16} className="text-[var(--muted)]" />
            Allotment Date
          </label>
          <Input name="date" type="date" required className="bg-[var(--background)]/50" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Type size={16} className="text-[var(--muted)]" />
            Task Title
          </label>
          <Input name="title" type="text" required placeholder="e.g. Design Landing Page" className="bg-[var(--background)]/50" />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {message}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Assigning...' : 'Assign Task'}
        </Button>
      </form>
    </div>
  );
}
