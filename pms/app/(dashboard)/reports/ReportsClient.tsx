'use client';

import * as React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  AlertTriangle,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { TaskCompletionChart } from '@/components/reports/TaskCompletionChart';
import { TaskStatusPieChart } from '@/components/reports/TaskStatusPieChart';
import { TeamWorkloadChart } from '@/components/reports/TeamWorkloadChart';
import { ProjectProgressList } from '@/components/reports/ProjectProgressList';
import { ExportButton } from '@/components/export/ExportButton';
import { getTasksForExport, getProjectsForExport } from '@/actions/exportActions';
import { toast } from '@/lib/toast';

interface ReportsClientProps {
  dashboardStats: any;
  completionStats: any;
  teamWorkload: any;
  projectProgress: any;
  priorityStats: any;
  highRiskStats: any;
  overdueStats: any;
}

export function ReportsClient({
  dashboardStats,
  completionStats,
  teamWorkload,
  projectProgress,
  priorityStats,
  highRiskStats,
  overdueStats,
}: ReportsClientProps) {
  const [exportData, setExportData] = React.useState<any[]>([]);
  const [isLoadingExport, setIsLoadingExport] = React.useState(false);

  const handlePrepareExport = async (type: 'tasks' | 'projects') => {
    setIsLoadingExport(true);
    try {
      const data = type === 'tasks' ? await getTasksForExport() : await getProjectsForExport();
      if (data) {
        setExportData(data);
      } else {
        toast.error('Failed to prepare export data');
      }
    } catch (error) {
      toast.error('Failed to prepare export data');
    } finally {
      setIsLoadingExport(false);
    }
  };

  const stats = [
    {
      label: 'Total Tasks',
      value: dashboardStats?.totalTasks || 0,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Completed',
      value: dashboardStats?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Projects',
      value: dashboardStats?.activeProjects || 0,
      icon: FolderKanban,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Team Members',
      value: dashboardStats?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Overdue Tasks',
      value: overdueStats?.total || 0,
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'High Risk',
      value: highRiskStats?.total || 0,
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground-heading)] mb-2">
            Reports & Analytics
          </h1>
          <p className="text-[var(--muted)]">
            Comprehensive insights into your team's performance and project progress
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrepareExport('tasks')}
            disabled={isLoadingExport}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
          >
            {isLoadingExport ? 'Loading...' : 'Prepare Tasks Export'}
          </button>
          {exportData.length > 0 && (
            <ExportButton
              data={exportData}
              filename={`nexus-export-${new Date().toISOString().split('T')[0]}`}
              title="NEXUS Export Report"
            />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground-heading)]">
              {stat.value}
            </p>
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      {dashboardStats && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground-heading)]">
                Overall Completion Rate
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Percentage of completed tasks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 w-full rounded-full bg-[var(--background)]">
                <div
                  className="h-4 rounded-full bg-green-500 transition-all"
                  style={{ width: `${dashboardStats.completionRate}%` }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-[var(--foreground-heading)]">
              {Math.round(dashboardStats.completionRate)}%
            </span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
              <BarChart3 size={20} className="text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground-heading)]">
                Task Completion Trend
              </h3>
              <p className="text-sm text-[var(--muted)]">Last 30 days</p>
            </div>
          </div>
          {completionStats && (
            <TaskCompletionChart data={completionStats.dailyCompletion} />
          )}
        </div>

        {/* Task Status Distribution */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Target size={20} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground-heading)]">
                Task Status Distribution
              </h3>
              <p className="text-sm text-[var(--muted)]">Current breakdown</p>
            </div>
          </div>
          {completionStats && (
            <TaskStatusPieChart data={completionStats.statusCounts} />
          )}
        </div>
      </div>

      {/* Team Workload */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Users size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground-heading)]">
              Team Workload Distribution
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Tasks per team member
            </p>
          </div>
        </div>
        {teamWorkload && <TeamWorkloadChart data={teamWorkload} />}
      </div>

      {/* Project Progress */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <FolderKanban size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground-heading)]">
              Project Progress Overview
            </h3>
            <p className="text-sm text-[var(--muted)]">
              All active projects
            </p>
          </div>
        </div>
        {projectProgress && <ProjectProgressList projects={projectProgress} />}
      </div>

      {/* Priority & Risk Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h3 className="font-semibold text-[var(--foreground-heading)] mb-4">
            Tasks by Priority
          </h3>
          {priorityStats && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">High Priority</span>
                <span className="text-sm font-medium text-red-500">
                  {priorityStats.high}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Medium Priority</span>
                <span className="text-sm font-medium text-yellow-500">
                  {priorityStats.medium}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Low Priority</span>
                <span className="text-sm font-medium text-blue-500">
                  {priorityStats.low}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* High Risk Tasks */}
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h3 className="font-semibold text-[var(--foreground-heading)] mb-4">
            AI Risk Analysis
          </h3>
          {highRiskStats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">High Risk Tasks</span>
                <span className="text-2xl font-bold text-yellow-500">
                  {highRiskStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground)]">Risk Percentage</span>
                <span className="text-2xl font-bold text-yellow-500">
                  {highRiskStats.percentage}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
