'use client';

import { Avatar } from '@/components/ui/Avatar';
import { formatActivityMessage } from '@/lib/activityFormatter';
import { formatDistanceToNow } from 'date-fns';
import { Circle } from 'lucide-react';

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

interface ActivityItemProps {
  log: ActivityLog;
  isLast: boolean;
}

export function ActivityItem({ log, isLast }: ActivityItemProps) {
  const message = formatActivityMessage(log);
  
  const actionColors = {
    created: 'text-green-500',
    updated: 'text-blue-500',
    deleted: 'text-red-500',
    moved: 'text-purple-500',
  };

  const actionColor = actionColors[log.action as keyof typeof actionColors] || 'text-[var(--muted)]';

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <Avatar src={log.user.avatar || undefined} alt={log.user.name} size="sm" />
        {!isLast && (
          <div className="w-px h-full bg-[var(--border-color)] mt-2" />
        )}
      </div>
      
      <div className="flex-1 pb-4">
        <div className="flex items-start gap-2">
          <Circle size={8} className={`mt-1.5 ${actionColor} fill-current`} />
          <div className="flex-1">
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-medium">{log.user.name}</span> {message}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
