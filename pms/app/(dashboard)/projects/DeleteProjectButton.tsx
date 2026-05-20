'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProject } from '@/actions/projectActions';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? Tasks inside will be unlinked.')) {
      startTransition(async () => {
        await deleteProject(projectId);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50"
      title="Delete Project"
    >
      <Trash2 size={16} />
    </button>
  );
}
