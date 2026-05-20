'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProjectAction } from '@/actions/projectActions';

export function CreateProjectModal({ users = [] }: { users?: { id: string, name: string }[] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setError('');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
      >
        <Plus size={16} />
        New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--background)] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Create New Project</h3>
              <button onClick={() => setIsOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Project Name</label>
                <Input name="name" required placeholder="e.g. Website Redesign" className="bg-[var(--background)]/50" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
                <textarea 
                  name="description" 
                  required 
                  placeholder="Brief overview of the project..." 
                  className="flex min-h-[100px] w-full rounded-md border border-[var(--border-color)] bg-[var(--background)]/50 px-3 py-2 text-sm placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Deadline</label>
                <Input name="deadline" type="date" required className="bg-[var(--background)]/50" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Assign Team</label>
                <select name="assigneeId" multiple className="flex min-h-[80px] w-full rounded-md border border-[var(--border-color)] bg-[var(--background)]/50 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <p className="text-xs text-[var(--muted)] mt-1">Hold Cmd/Ctrl to select multiple</p>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
