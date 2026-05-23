'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskStatusPieChartProps {
  data: Record<string, number>;
}

const COLORS = {
  todo: '#3b82f6',
  'in-progress': '#f59e0b',
  'in-review': '#8b5cf6',
  done: '#10b981',
};

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

export function TaskStatusPieChart({ data }: TaskStatusPieChartProps) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    status,
  }));

  if (chartData.length === 0 || chartData.every((d) => d.value === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        No task data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--foreground)',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
