'use client';

import * as React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { AiPrompt } from '@/components/ai/AiPrompt';
import { useStore } from '@/store/useStore';
import { TaskStatus, Task } from '@/types';
import { useMounted } from '@/hooks/useMounted';
import { updateTaskStatus } from '@/actions/taskActions';

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'in-review', title: 'In Review' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({ initialDbTasks }: { initialDbTasks?: Task[] }) {
  const isMounted = useMounted();
  const tasks = useStore((state) => state.tasks);
  const moveTask = useStore((state) => state.moveTask);
  const setTasks = useStore((state) => state.setTasks);

  React.useEffect(() => {
    if (initialDbTasks && initialDbTasks.length > 0) {
      // Merge logic: in a real app we'd fully sync. For MVP, overwrite.
      setTasks(initialDbTasks);
    }
  }, [initialDbTasks, setTasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistic local update
    moveTask(draggableId, destination.droppableId as TaskStatus);
    
    // Server update
    React.startTransition(() => {
      updateTaskStatus(draggableId, destination.droppableId);
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">Project Workspace</h2>
        <p className="text-[var(--muted)]">Manage your tasks or use AI to instantly generate actionable items.</p>
      </div>
      
      <AiPrompt />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
