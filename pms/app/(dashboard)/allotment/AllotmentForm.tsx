'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assignDailyTask } from '@/actions/taskActions';
import { Calendar, User as UserIcon, Type, FolderKanban } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useTransition } from 'react';

type UserData = { id: string; name: string; role: string; avatar: string | null };
type ProjectData = { id: string; name: string };

export function AllotmentForm({ users, projects }: { users: UserData[], projects: ProjectData[] }) {
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
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 w-full max-w-xl shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <UserIcon size={16} className="text-[var(--muted)]" />
            Select Worker
          </label>
          {users.length === 0 ? (
            <div className="text-center p-4 rounded-lg border border-[var(--border-color)] bg-[var(--background)]/50 text-[var(--muted)]">
              No workers available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
              {users.map(user => (
                <div key={user.id} className="flex items-center">
                  <input 
                    type="radio" 
                    id={`user-${user.id}`}
                    name="assigneeId" 
                    value={user.id} 
                    required 
                    className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                  />
                  <label 
                    htmlFor={`user-${user.id}`}
                    className="flex items-center gap-3 flex-1 rounded-lg border border-[var(--border-color)] p-3 ml-2 hover:bg-[var(--background)]/50 cursor-pointer transition-colors"
                  >
                    <Avatar src={user.avatar || undefined} alt={user.name} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--foreground)]">{user.name}</span>
                      <span className="text-xs text-[var(--muted)]">{user.role}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Calendar size={16} className="text-[var(--muted)]" />
              Allotment Date
            </label>
            <Input name="date" type="date" required className="bg-[var(--background)]/50" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <FolderKanban size={16} className="text-[var(--muted)]" />
              Project (Optional)
            </label>
            <select
              name="projectId"
              className="flex h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--background)]/50 px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors appearance-none"
            >
              <option value="" className="bg-[var(--background)]">No Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-[var(--background)]">{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Type size={16} className="text-[var(--muted)]" />
            Task Title
          </label>
          <Input name="title" type="text" required placeholder="e.g. Design Landing Page" className="bg-[var(--background)]/50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Type size={16} className="text-[var(--muted)]" />
            Description
          </label>
          <textarea name="description" required placeholder="Detailed task description..." className="flex min-h-[80px] w-full rounded-md border border-[var(--border-color)] bg-[var(--background)]/50 px-3 py-2 text-sm placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
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
