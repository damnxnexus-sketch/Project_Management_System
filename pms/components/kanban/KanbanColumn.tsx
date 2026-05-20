import * as React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border-color)] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="font-semibold text-[var(--foreground-heading)]">{title}</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--background)] text-xs font-medium text-[var(--muted)]">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[200px] flex-1 rounded-lg transition-colors p-1',
              snapshot.isDraggingOver ? 'bg-[var(--background)]/40' : ''
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
