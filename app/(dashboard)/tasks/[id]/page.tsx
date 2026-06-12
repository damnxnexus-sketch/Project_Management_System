'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TaskDetailClient from './TaskDetailClient';

interface Props {
  params: {
    id: string;
  };
}

export default async function TaskDetailPage({ params }: Props) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = (session as Record<string, string>).userId;

  const id = params?.id;
  if (!id) {
    // no id provided in route params - redirect to tasks index
    redirect('/tasks');
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      project: true,
      comments: {
        include: {
          author: true,
          mentions: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      attachments: true,
    },
  });

  if (!task) {
    redirect('/');
  }

  // Ensure the task object is JSON-serializable for the client component
  const safeTask = (() => {
    if (!task) return null;
    try {
      return {
        ...task,
        // convert Dates to ISO strings
        createdAt: task.createdAt ? task.createdAt.toISOString() : null,
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : null,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        comments: task.comments.map(c => ({
          ...c,
          createdAt: c.createdAt ? c.createdAt.toISOString() : null,
          author: c.author ? { id: c.author.id, name: c.author.name, avatar: c.author.avatar || null } : null,
          mentions: c.mentions?.map(m => ({ user: m.user ? { id: m.user.id, name: m.user.name } : null })) || [],
        })),
        attachments: task.attachments.map(a => ({
          ...a,
          createdAt: a.createdAt ? a.createdAt.toISOString() : null,
        })),
        assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name, avatar: task.assignee.avatar || null } : null,
        project: task.project ? { id: task.project.id, name: task.project.name } : null,
      };
    } catch (e) {
      // fallback to a shallow serialization
      console.error('Failed to serialize task:', e);
      return JSON.parse(JSON.stringify(task));
    }
  })();

  // Permission check - users can only view their own tasks unless they're admin
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.role === 'Worker' && task.assigneeId !== userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* pass safeTask (serializable) to client component to avoid SSR serialization errors */}
      <TaskDetailClient task={safeTask as any} currentUserId={userId} />
    </div>
  );
}
