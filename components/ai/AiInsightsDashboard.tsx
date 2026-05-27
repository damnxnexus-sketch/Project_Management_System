'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Zap, Brain, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  color: string;
  actionText?: string;
}

interface AiInsightsDashboardProps {
  insights: InsightCard[];
  isLoading?: boolean;
  onActionClick?: (insightId: string) => void;
}

const priorityConfig = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-600' },
  low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600' },
};

export function AiInsightsDashboard({
  insights,
  isLoading = false,
  onActionClick,
}: AiInsightsDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/70">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          <p className="text-xs text-muted">Smart recommendations powered by AI</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-4 animate-pulse"
            >
              <div className="h-4 bg-muted/50 rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted/30 rounded w-full mb-2" />
              <div className="h-3 bg-muted/30 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">
          <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
          <p>No insights available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'rounded-xl border p-4 transition-all hover:shadow-lg hover:border-accent/50',
                priorityConfig[insight.priority].bg,
                priorityConfig[insight.priority].border,
                'border'
              )}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/50 text-accent">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{insight.title}</h3>
                  <p className={cn('text-xs font-medium', priorityConfig[insight.priority].text)}>
                    {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted mb-3 leading-relaxed">{insight.description}</p>

              {insight.actionText && (
                <button
                  onClick={() => onActionClick?.(insight.id)}
                  className="w-full rounded-lg bg-accent/20 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/30 transition-colors"
                >
                  {insight.actionText}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
