'use client';

import * as React from 'react';
import { updateTaskProgress, updateTaskStatus, deleteTask } from '@/actions/taskActions';
import { Task } from '@/types';
import { Trash2, Calendar } from 'lucide-react';
import { useTransition } from 'react';

interface ProjectTaskCardProps {
  task: Task & { assignee?: { name: string, avatar: string | null } | null };
  isAdmin: boolean;
}

export function ProjectTaskCard({ task, isAdmin }: ProjectTaskCardProps) {
  const [progress, setProgress] = React.useState(task.progress);
  const [isPending, startTransition] = useTransition();

  const createdAt = (task as any).createdAt as string | Date | undefined;
  const dueDate = (task as any).dueDate as string | Date | undefined;

  const formatDate = (d?: string | Date) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return null;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setProgress(val);
  };

  const handleProgressCommit = () => {
    if (progress === task.progress) return;
    startTransition(async () => {
      await updateTaskProgress(task.id, progress);
      // Auto-update status based on progress
      if (progress === 100 && task.status !== 'done') {
        await updateTaskStatus(task.id, 'done');
      } else if (progress > 0 && progress < 100 && task.status === 'todo') {
        await updateTaskStatus(task.id, 'in-progress');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      startTransition(async () => {
        await deleteTask(task.id);
      });
    }
  };

  return (
    <div className={`rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-5 transition-all ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <h4 className="font-medium text-[var(--foreground)]">{task.title}</h4>
          <p className="text-sm text-[var(--muted)] mt-1">{task.description}</p>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 text-xs text-[var(--muted)] mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full uppercase font-medium ${
            task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
            task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
            'bg-emerald-500/10 text-emerald-500'
          }`}>
            {task.priority}
          </span>
          <span className="uppercase font-medium bg-[var(--surface)] border border-[var(--border-color)] px-2 py-0.5 rounded-full">
            {task.status.replace('-', ' ')}
          </span>
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1.5">
            <img src={task.assignee.avatar || ''} alt={task.assignee.name} className="w-5 h-5 rounded-full" />
            <span className="truncate max-w-[100px]">{task.assignee.name}</span>
          </div>
        )}
      </div>

      {/* Allotment / Extension dates */}
      <div className="flex items-center justify-between text-sm text-[var(--muted)] mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>
            Allotted: {formatDate(createdAt) ?? '—'}
          </span>
        </div>
        <div className="text-right">
          <span className="font-medium">Extended until</span>
          <div className="text-sm">{formatDate(dueDate) ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-[var(--foreground)] mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleProgressChange}
          onMouseUp={handleProgressCommit}
          onTouchEnd={handleProgressCommit}
          disabled={!isAdmin && false /* assuming worker can update progress too if assigned */}
          className="w-full h-2 bg-[var(--background)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
        />
      </div>
    </div>
  );
}
