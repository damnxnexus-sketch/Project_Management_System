'use client';

import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/actions/analyticsActions';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsData } from '@/actions/analyticsActions';

const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#06b6d4'];
const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  'in-review': '#f59e0b',
  done: '#10b981',
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getAnalyticsData();
        if (result.success && result.data) {
          setAnalytics(result.data);
        } else {
          setError(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading analytics...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;
  }

  if (!analytics) {
    return <div className="flex items-center justify-center h-screen">No analytics data available</div>;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive project and team performance insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Completion Rate"
          value={`${analytics.taskCompletionRate}%`}
          subtitle={`${analytics.completedTasks}/${analytics.totalTasks} tasks`}
        />
        <MetricCard
          title="Total Tasks"
          value={analytics.totalTasks}
          subtitle={`${analytics.completedTasks} completed`}
        />
        <MetricCard
          title="Overdue Tasks"
          value={analytics.overdueTasks}
          subtitle="Require attention"
          alert={analytics.overdueTasks > 0}
        />
        <MetricCard
          title="High Risk Tasks"
          value={analytics.highRiskTasks}
          subtitle="AI-flagged (Under Development)"
          alert={analytics.highRiskTasks > 0}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <ChartCard title="Tasks by Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.tasksByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => `${(props as unknown as { status: string; count: number }).status}: ${(props as unknown as { status: string; count: number }).count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.tasksByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Task Priority Distribution */}
        <ChartCard title="Tasks by Priority">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.tasksByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trend */}
        <ChartCard title="Weekly Activity Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              <Line type="monotone" dataKey="updated" stroke="#f59e0b" name="Updated" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Project Progress */}
        <ChartCard title="Project Progress">
          <div className="space-y-4">
            {analytics.projectProgress.length === 0 ? (
              <p className="text-gray-500">No projects yet</p>
            ) : (
              analytics.projectProgress.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-gray-600">
                      {project.completedCount}/{project.taskCount} tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Team Workload */}
      <ChartCard title="Team Workload Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left">
                <th className="pb-3 font-semibold">Team Member</th>
                <th className="pb-3 font-semibold text-right">Assigned</th>
                <th className="pb-3 font-semibold text-right">Completed</th>
                <th className="pb-3 font-semibold text-right">Overdue</th>
                <th className="pb-3 font-semibold text-right">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {analytics.teamWorkload.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No team members
                  </td>
                </tr>
              ) : (
                analytics.teamWorkload.map((member) => {
                  const completionPercent = member.assignedTasks > 0 ? Math.round((member.completedTasks / member.assignedTasks) * 100) : 0;
                  return (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">{member.name}</td>
                      <td className="py-3 text-right">{member.assignedTasks}</td>
                      <td className="py-3 text-right text-green-600">{member.completedTasks}</td>
                      <td className="py-3 text-right text-red-600">{member.overdueTasks}</td>
                      <td className="py-3 text-right">
                        <span className={completionPercent >= 75 ? 'text-green-600' : 'text-orange-600'}>{completionPercent}%</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Top Assignees */}
      <ChartCard title="Top Assignees">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={analytics.tasksByAssignee
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" stackId="a" fill="#3b82f6" name="Total" />
            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  alert?: boolean;
}

function MetricCard({ title, value, subtitle, alert }: MetricCardProps) {
  return (
    <div
      className={`rounded-lg p-6 ${alert ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}`}
    >
      <p className="text-gray-600 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${alert ? 'text-red-600' : ''}`}>{value}</p>
      {subtitle && <p className="text-gray-600 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}
