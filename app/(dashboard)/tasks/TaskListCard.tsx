"use client";

import React from 'react';
import { Calendar, User } from 'lucide-react';

export default function TaskListCard({ task }: { task: any }) {
  const formatDate = (d?: string | Date) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-4">
      <div>
        <h4 className="text-lg font-semibold text-[var(--foreground)]">{task.title}</h4>
        <p className="text-sm text-[var(--muted)] mt-1">{task.description}</p>
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[var(--foreground)]">{task.progress}%</div>
          <div className="text-xs text-[var(--muted)]">{task.comments?.length || 0} comments · {task.attachments?.length || 0} files</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-[var(--muted)]">
        <div><strong>Project:</strong> {task.project ? task.project.name : '—'}</div>
        <div><strong>Created:</strong> {formatDate(task.createdAt)}</div>
      </div>
    </div>
  );
}
