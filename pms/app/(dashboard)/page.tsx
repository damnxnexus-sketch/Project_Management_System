import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  if (!session) redirect('/login');

  const tasks = await prisma.task.findMany();
  
  const formattedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    aiRisk: t.aiRisk,
    progress: t.progress,
    projectId: t.projectId,
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    assigneeId: t.assigneeId
  }));

  return (
    <div className="h-full">
      <KanbanBoard initialDbTasks={formattedTasks as any} />
    </div>
  );
}

