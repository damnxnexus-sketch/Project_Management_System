'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight, Code2, GitBranch, BookOpen, Bug } from 'lucide-react';

interface TaskRecommendation {
  id: string;
  category: 'optimization' | 'risk' | 'efficiency' | 'quality';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
}

interface AiTaskRecommenderProps {
  recommendations: TaskRecommendation[];
  isLoading?: boolean;
}

const categoryConfig = {
  optimization: {
    icon: Code2,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  risk: {
    icon: Bug,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  efficiency: {
    icon: GitBranch,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  quality: {
    icon: BookOpen,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
};

export function AiTaskRecommender({
  recommendations,
  isLoading = false,
}: AiTaskRecommenderProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4 animate-pulse">
            <div className="h-4 bg-muted/50 rounded w-3/4 mb-3" />
            <div className="space-y-2">
              {[1, 2].map(j => (
                <div key={j} className="h-3 bg-muted/30 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface/50 p-6 text-center text-muted">
        <Lightbulb size={32} className="mx-auto mb-2 opacity-50" />
        <p>No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => {
        const config = categoryConfig[rec.category];
        const Icon = config.icon;

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group rounded-lg border border-border bg-surface p-4 hover:border-accent/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                <Icon size={20} className={config.color} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-foreground">{rec.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    rec.estimatedImpact === 'high' ? 'bg-red-500/10 text-red-600' :
                    rec.estimatedImpact === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-green-500/10 text-green-600'
                  }`}>
                    {rec.estimatedImpact} impact
                  </span>
                </div>

                <p className="text-sm text-muted mb-2">{rec.description}</p>

                <div className="space-y-1">
                  {rec.actionItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <ChevronRight size={18} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
