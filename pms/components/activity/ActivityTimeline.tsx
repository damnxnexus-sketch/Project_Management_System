'use client';

import { ActivityItem } from './ActivityItem';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        <p>No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        Activity ({logs.length})
      </h3>
      
      <div className="space-y-3">
        {logs.map((log, index) => (
          <ActivityItem 
            key={log.id} 
            log={log} 
            isLast={index === logs.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
