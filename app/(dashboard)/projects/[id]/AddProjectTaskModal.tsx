'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addProjectTask } from '@/actions/projectActions';

interface AddProjectTaskModalProps {
  projectId: string;
  users: { id: string, name: string }[];
}

export function AddProjectTaskModal({ projectId, users }: AddProjectTaskModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('projectId', projectId);
    startTransition(async () => {
      const result = await addProjectTask(formData);
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
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus size={16} />
        Add Task
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--foreground-heading)]">New Task</h3>
              <button onClick={() => setIsOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
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
                <label className="text-sm font-medium text-[var(--foreground)]">Task Title</label>
                <Input name="title" required placeholder="e.g. Design homepage mockup" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
                <textarea 
                  name="description" 
                  required 
                  placeholder="Task details..." 
                  className="flex min-h-[100px] w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 text-sm placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Assign To</label>
                <select name="assigneeId" className="flex h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--foreground)]">Priority</label>
                <select name="priority" defaultValue="medium" className="flex h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
