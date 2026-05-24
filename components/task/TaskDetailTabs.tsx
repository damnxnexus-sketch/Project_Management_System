'use client';

import { useState } from 'react';
import { MessageSquare, Paperclip, Activity, Info } from 'lucide-react';
import { CommentSection } from '@/components/comments/CommentSection';
import { AttachmentSection } from '@/components/attachments/AttachmentSection';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';

interface TaskDetailTabsProps {
  task: any;
  activityLogs: any[];
  currentUserId: string;
  currentUserRole: string;
}

type TabType = 'details' | 'comments' | 'attachments' | 'activity';

export function TaskDetailTabs({ task, activityLogs, currentUserId }: TaskDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('comments');

  const tabs = [
    { id: 'details' as TabType, label: 'Details', icon: Info },
    { id: 'comments' as TabType, label: 'Comments', icon: MessageSquare, count: task.comments?.length || 0 },
    { id: 'attachments' as TabType, label: 'Attachments', icon: Paperclip, count: task.attachments?.length || 0 },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity, count: activityLogs.length },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border-color)]">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === tab.id
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--surface-raised)] text-[var(--foreground)]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="py-4">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Description</h4>
              <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{task.description}</p>
            </div>
            
            {task.flags && JSON.parse(task.flags).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Flags</h4>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(task.flags).map((flag: string) => (
                    <span
                      key={flag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--surface-raised)] text-[var(--foreground)] border border-[var(--border-color)]"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <CommentSection
            taskId={task.id}
            initialComments={task.comments || []}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === 'attachments' && (
          <AttachmentSection
            taskId={task.id}
            initialAttachments={task.attachments || []}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTimeline logs={activityLogs} />
        )}
      </div>
    </div>
  );
}
