import * as React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskCard({ task, index }: { task: Task; index: number }) {
  const users = useStore((state) => state.users);
  const assignee = users.find((u) => u.id === task.assigneeId);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group relative mb-3 rounded-lg border border-[var(--border-color)] bg-[var(--background)] p-4 shadow-sm transition-colors hover:border-[var(--muted)]',
            snapshot.isDragging && 'border-[var(--accent)] shadow-xl z-50 rotate-2'
          )}
        >
          {task.aiRisk && (
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg animate-pulse" title="High Risk of Delay">
              <Sparkles size={12} />
            </div>
          )}
          
          <div className="mb-3 flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-[var(--foreground)]">{task.title}</h4>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-[var(--muted)] line-clamp-2">{task.description}</p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-2 items-center">
              <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
            {assignee && (
              <Avatar src={assignee.avatar} alt={assignee.name} className="h-6 w-6" title={assignee.name} />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
