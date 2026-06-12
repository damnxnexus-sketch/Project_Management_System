import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import TaskListCard from './TaskListCard';

export default async function TasksIndexPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isWorker = session.role === 'Worker';

  const tasks = await prisma.task.findMany({
    where: isWorker ? { assigneeId: session.userId as string } : undefined,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      project: { select: { id: true, name: true } },
      comments: true,
      attachments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Back</Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
          No tasks found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskListCard key={task.id} task={task as any} />
          ))}
        </div>
      )}
    </div>
  );
}
