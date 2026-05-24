'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TeamWorkloadChartProps {
  data: Array<{
    name: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
  }>;
}

export function TeamWorkloadChart({ data }: TeamWorkloadChartProps) {
  const chartData = data.map((user) => ({
    name: user.name.split(' ')[0], // First name only for space
    'In Progress': user.inProgressTasks,
    'Completed': user.completedTasks,
    'Total': user.totalTasks,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        No team data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="name"
          stroke="var(--muted)"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="var(--muted)" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--foreground)',
          }}
        />
        <Legend />
        <Bar dataKey="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
