'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { deleteWorkUpdate } from '@/actions/workUpdateActions';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface WorkUpdateCardProps {
  update: any;
  onRefresh: () => void;
}

export function WorkUpdateCard({ update, onRefresh }: WorkUpdateCardProps) {
  const currentUser = useStore((state) => state.currentUser);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this work update?')) return;

    setIsDeleting(true);
    try {
      const result = await deleteWorkUpdate(update.id);
      if (result.success) {
        toast.success('Work update deleted');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to delete work update');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete work update');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentUser?.id === update.userId;

  return (
    <div className="p-4 hover:bg-[var(--surface-raised)] transition-colors">
      <div className="flex gap-4">
        {/* Indicator */}
        <div className="flex-shrink-0 pt-1">
          <div className="w-3 h-3 rounded-full bg-[var(--accent)] mt-1"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-medium text-[var(--foreground)]">{update.user?.name || 'Unknown User'}</p>
              <p className="text-xs text-[var(--muted)]">{formatDate(update.date)}</p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  className="p-1 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Task Info */}
          {update.task && (
            <div className="mb-3 text-sm">
              <p className="text-[var(--muted)]">
                Task: <span className="text-[var(--foreground)] font-medium">{update.task.title}</span>
                {update.task.project && <span className="text-[var(--muted)]"> in {update.task.project.name}</span>}
              </p>
            </div>
          )}

          {/* Work Done */}
          <p className="text-sm text-[var(--foreground)] mb-3 whitespace-pre-wrap">{update.workDone}</p>

          {/* Metrics */}
          <div className="flex flex-wrap gap-3 mb-3">
            {update.hoursSpent && (
              <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
                <Clock size={14} />
                <span>{update.hoursSpent}h</span>
              </div>
            )}
            {update.progressAdded > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-500">
                <TrendingUp size={14} />
                <span>+{update.progressAdded}%</span>
              </div>
            )}
            {update.status && (
              <span className="text-xs px-2 py-1 bg-[var(--surface-raised)] text-[var(--foreground)] rounded capitalize">
                {update.status.replace('-', ' ')}
              </span>
            )}
            {update.priority && (
              <span
                className={`text-xs px-2 py-1 rounded capitalize ${
                  update.priority === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : update.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {update.priority}
              </span>
            )}
          </div>

          {/* Blockers and Next Steps */}
          <div className="space-y-2 text-sm">
            {update.blockers && (
              <div className="flex gap-2">
                <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--foreground)]">Blockers:</p>
                  <p className="text-[var(--muted)] whitespace-pre-wrap">{update.blockers}</p>
                </div>
              </div>
            )}
            {update.nextSteps && (
              <div className="flex gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--foreground)]">Next Steps:</p>
                  <p className="text-[var(--muted)] whitespace-pre-wrap">{update.nextSteps}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
