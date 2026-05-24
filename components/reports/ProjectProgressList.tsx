'use client';

import * as React from 'react';
import { FolderKanban, Calendar, CheckCircle2 } from 'lucide-react';

interface ProjectProgressListProps {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    deadline: Date | null;
  }>;
}

export function ProjectProgressList({ projects }: ProjectProgressListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        No projects available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const isOverdue = project.deadline && new Date(project.deadline) < new Date();
        const progressColor =
          project.progress >= 75
            ? 'bg-green-500'
            : project.progress >= 50
            ? 'bg-blue-500'
            : project.progress >= 25
            ? 'bg-yellow-500'
            : 'bg-red-500';

        return (
          <div
            key={project.id}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] p-4 hover:bg-[var(--surface)] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                  <FolderKanban size={20} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--foreground)]">{project.name}</h4>
                  <p className="text-sm text-[var(--muted)] capitalize">{project.status}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {project.progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="h-2 w-full rounded-full bg-[var(--background)]">
                <div
                  className={`h-2 rounded-full transition-all ${progressColor}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <CheckCircle2 size={16} />
                <span>
                  {project.completedTasks} / {project.totalTasks} tasks
                </span>
              </div>
              {project.deadline && (
                <div
                  className={`flex items-center gap-2 ${
                    isOverdue ? 'text-red-500' : 'text-[var(--muted)]'
                  }`}
                >
                  <Calendar size={16} />
                  <span>
                    {new Date(project.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
