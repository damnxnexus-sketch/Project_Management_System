import * as React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';
import { Calendar, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteTask } from '@/actions/taskActions';
import { FlagSelector } from './FlagSelector';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';

export function TaskCard({ task, index }: { task: Task; index: number }) {
  const users = useStore((state) => state.users);
  const currentUser = useStore((state) => state.currentUser);
  const assignee = users.find((u) => u.id === task.assigneeId);
  const [isPending, startTransition] = React.useTransition();
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const flags = React.useMemo(() => {
    if (typeof task.flags === 'string') {
      try {
        return JSON.parse(task.flags);
      } catch {
        return [];
      }
    }
    return Array.isArray(task.flags) ? task.flags : [];
  }, [task.flags]);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  };

  const handleFlagsChange = () => {
    // Flags updated via server action
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
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowDetailModal(true)}
            className={cn(
              'group relative mb-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-4 shadow-sm transition-all hover:shadow-md hover:border-[var(--border-focus)] cursor-pointer',
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
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted)] hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-muted line-clamp-2">{task.description}</p>
          </div>

          {/* Flags Section */}
          <div className="mb-4">
            {flags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {flags.map((flag: string) => (
                  <span
                    key={flag}
                    className={`${getFlagColor(flag)} text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap`}
                  >
                    {getFlagLabel(flag)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No flags</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto gap-2">
            <div className="flex gap-2 items-center flex-1 min-w-0">
              <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-muted whitespace-nowrap">
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <FlagSelector 
                  taskId={task.id} 
                  currentFlags={flags}
                  onFlagsChange={handleFlagsChange}
                />
              </div>
              {assignee && (
                <Avatar src={assignee.avatar} alt={assignee.name} className="h-6 w-6" title={assignee.name} />
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>

    {currentUser && (
      <TaskDetailModal
        taskId={task.id}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role}
      />
    )}
  </>
  );
}
