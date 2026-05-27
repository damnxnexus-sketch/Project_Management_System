'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ProjectHealthProps {
  projectName: string;
  healthScore: number;
  metrics: {
    completionRate: number;
    riskLevel: 'low' | 'medium' | 'high';
    onTimeDelivery: number;
    teamProductivity: number;
  };
}

export function ProjectHealthScore({
  projectName,
  healthScore,
  metrics,
}: ProjectHealthProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'At Risk';
    return 'Critical';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getMetricColor = (value: number) => {
    if (value >= 75) return 'text-emerald-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border border-border p-6 ${getHealthBg(healthScore)}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground mb-1">{projectName}</h3>
          <p className="text-sm text-muted">Project Health Score</p>
        </div>
        <Gauge size={24} className={`${getHealthColor(healthScore)} opacity-60`} />
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-4">
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 56}` }}
                    animate={{
                      strokeDashoffset: `${2 * Math.PI * 56 * (1 - healthScore / 100)}`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`${getHealthColor(healthScore)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
                    {healthScore}
                  </span>
                  <span className="text-xs text-muted">Score</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getHealthLabel(healthScore) === 'Healthy' && (
                <CheckCircle size={16} className="text-emerald-500" />
              )}
              {getHealthLabel(healthScore) === 'At Risk' && (
                <AlertCircle size={16} className="text-yellow-500" />
              )}
              {getHealthLabel(healthScore) === 'Critical' && (
                <AlertCircle size={16} className="text-red-500" />
              )}
              <span className={`font-semibold text-sm ${getHealthColor(healthScore)}`}>
                {getHealthLabel(healthScore)}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {healthScore >= 80 && 'Project is on track with strong metrics across the board.'}
              {healthScore >= 60 && healthScore < 80 && 'Project has some concerns that need attention.'}
              {healthScore < 60 && 'Project requires immediate attention and intervention.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-background/50 p-3">
          <p className="text-xs text-muted mb-1">Completion</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className={getMetricColor(metrics.completionRate)} />
            <span className={`font-semibold text-sm ${getMetricColor(metrics.completionRate)}`}>
              {metrics.completionRate}%
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-background/50 p-3">
          <p className="text-xs text-muted mb-1">On-Time Delivery</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className={getMetricColor(metrics.onTimeDelivery)} />
            <span className={`font-semibold text-sm ${getMetricColor(metrics.onTimeDelivery)}`}>
              {metrics.onTimeDelivery}%
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-background/50 p-3">
          <p className="text-xs text-muted mb-1">Risk Level</p>
          <p className={`font-semibold text-sm capitalize ${
            metrics.riskLevel === 'low' ? 'text-emerald-500' :
            metrics.riskLevel === 'medium' ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {metrics.riskLevel}
          </p>
        </div>

        <div className="rounded-lg bg-background/50 p-3">
          <p className="text-xs text-muted mb-1">Productivity</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className={getMetricColor(metrics.teamProductivity)} />
            <span className={`font-semibold text-sm ${getMetricColor(metrics.teamProductivity)}`}>
              {metrics.teamProductivity}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
