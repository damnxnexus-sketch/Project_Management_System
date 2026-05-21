'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assigneeName?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  tasks: { id: string }[];
}

interface StatCard {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface DashboardContentProps {
  session: { name: string; userId: string; role: string };
  tasks: Task[];
  projects: Project[];
  stats: StatCard[];
  users: User[];
}

export function DashboardContent({ session, tasks, projects, stats, users }: DashboardContentProps) {
  const [activeView, setActiveView] = React.useState<'overview' | 'kanban'>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {session.name}! 👋</h1>
          <p className="text-muted mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-accent text-white'
                : 'border border-border text-foreground hover:bg-background/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'kanban'
                ? 'bg-accent text-white'
                : 'border border-border text-foreground hover:bg-background/50'
            }`}
          >
            Kanban Board
          </button>
        </div>
      </div>

      {activeView === 'overview' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-border-focus transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`${stat.color}`} size={24} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tasks Overview and Projects Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Recent Tasks</h2>
                <Link href="/search" className="text-sm text-accent hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.slice(0, 5).length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high'
                              ? 'bg-red-500/10 text-red-600'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'done'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : task.status === 'in-progress'
                              ? 'bg-blue-500/10 text-blue-600'
                              : task.status === 'in-review'
                              ? 'bg-purple-500/10 text-purple-600'
                              : 'bg-gray-500/10 text-gray-600'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted">No tasks assigned yet</div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Insights</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted font-medium">Task Completion</span>
                    <span className="text-sm font-bold text-foreground">
                      {tasks.length > 0
                        ? Math.round(
                            (tasks.filter((t) => t.status === 'done').length / tasks.length) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{
                        width: `${
                          tasks.length > 0
                            ? (tasks.filter((t) => t.status === 'done').length / tasks.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted mb-3">Team Activity</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Admins</span>
                      <span className="text-sm font-bold text-foreground">
                        {users.filter((u) => u.role === 'Admin').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Workers</span>
                      <span className="text-sm font-bold text-foreground">
                        {users.filter((u) => u.role === 'Worker').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Active Projects</h2>
              <Link href="/projects" className="text-sm text-accent hover:underline">
                View All
              </Link>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.slice(0, 4).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="p-4 rounded-lg border border-border hover:border-accent hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <MoreHorizontal size={16} className="text-muted" />
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mb-3">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">Progress</span>
                        <span className="text-xs font-bold text-foreground">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-1 pt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            project.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : project.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {project.status}
                        </span>
                        <span className="text-xs text-muted">
                          {project.tasks?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">No projects yet</div>
            )}
          </motion.div>
        </>
      ) : (
        <KanbanBoard initialDbTasks={tasks.map(t => ({
          ...t,
          status: t.status as 'todo' | 'in-progress' | 'in-review' | 'done',
          priority: t.priority as 'low' | 'medium' | 'high'
        }))} />
      )}
    </div>
  );
}
