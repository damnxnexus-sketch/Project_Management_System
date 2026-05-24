'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProject } from '@/actions/projectActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = React.useTransition();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Project deleted successfully');
      }
      setShowConfirm(false);
    });
  };

  return (
    <>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        disabled={isPending}
        className="text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50"
        title="Delete Project"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? Tasks inside will be unlinked. This action cannot be undone."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
