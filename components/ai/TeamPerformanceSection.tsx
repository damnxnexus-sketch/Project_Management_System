'use client';

import { motion } from 'framer-motion';

interface TeamMember {
  userId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  inProgressTasks: number;
}

interface TeamPerformanceProps {
  teamPerformance: TeamMember[];
}

export function TeamPerformanceSection({ teamPerformance }: TeamPerformanceProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.257 19.547a2 2 0 00.247 2.552l1.414 1.414c.823.823 2.158.951 3.084.163L19 9.5M13 7H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9m0 0h8" />
        </svg>
        <h2 className="text-xl font-semibold text-foreground">Team Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamPerformance.map(member => (
          <div
            key={member.userId}
            className="rounded-xl border border-border bg-surface p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-foreground mb-3">{member.name}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted">Total Tasks</span>
                <span className="font-medium text-foreground">{member.totalTasks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted">Completed</span>
                <span className="font-medium text-emerald-500">{member.completedTasks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted">In Progress</span>
                <span className="font-medium text-blue-500">{member.inProgressTasks}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-surface-raised overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.completionRate}%` }}
                        transition={{ duration: 1.5 }}
                        className={`h-full ${
                          member.completionRate >= 75
                            ? 'bg-emerald-500'
                            : member.completionRate >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">
                      {member.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
