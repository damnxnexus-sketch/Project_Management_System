import * as React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';
import { Calendar, Sparkles, Trash2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteTask } from '@/actions/taskActions';
import { FlagSelector } from './FlagSelector';

export function TaskCard({ task, index }: { task: Task; index: number }) {
  const users = useStore((state) => state.users);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const [isPending, startTransition] = React.useTransition();
  const [flags, setFlags] = React.useState<string[]>(() => {
    if (typeof task.flags === 'string') {
      try {
        return JSON.parse(task.flags);
      } catch {
        return [];
      }
    }
    return Array.isArray(task.flags) ? task.flags : [];
  });

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  };

  const handleFlagsChange = () => {
    // Refetch or update flags from parent
    window.location.reload();
  };

  const getFlagColor = (flag: string) => {
    const flagColors: Record<string, string> = {
      'urgent': 'bg-red-500',
      'blocked': 'bg-red-600',
      'waiting': 'bg-amber-500',
      'review': 'bg-blue-500',
      'testing': 'bg-purple-500',
      'documentation': 'bg-indigo-500',
      'bug': 'bg-pink-500',
      'feature': 'bg-emerald-500',
      'refactor': 'bg-cyan-500',
      'performance': 'bg-green-500',
    };
    return flagColors[flag] || 'bg-gray-500';
  };

  const getFlagLabel = (flag: string) => {
    return flag.charAt(0).toUpperCase() + flag.slice(1).replace(/-/g, ' ');
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group relative mb-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--border-focus)]',
            snapshot.isDragging && 'shadow-2xl z-50 rotate-2 border-[var(--accent)]',
            isPending && 'opacity-70'
          )}
        >
          {task.aiRisk && (
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg animate-pulse" title="High Risk of Delay">
              <Sparkles size={12} />
            </div>
          )}
          
          <div className="mb-3 flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-[var(--foreground)] pr-6">{task.title}</h4>
            <button 
              onClick={handleDelete}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted)] hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-[var(--muted)] line-clamp-2">{task.description}</p>
          </div>

          <div className="mb-4 group-hover:opacity-100 opacity-60 transition-opacity">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress}
              onChange={handleProgressChange}
              onMouseUp={handleProgressCommit}
              onTouchEnd={handleProgressCommit}
              className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
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
