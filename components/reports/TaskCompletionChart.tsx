'use client';

import * as React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TaskCompletionChartProps {
  data: Record<string, number>;
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30) // Last 30 days
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--muted)]">
        No completion data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#722f37"
          strokeWidth={2}
          dot={{ fill: '#722f37', r: 4 }}
          activeDot={{ r: 6 }}
          name="Tasks Completed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
