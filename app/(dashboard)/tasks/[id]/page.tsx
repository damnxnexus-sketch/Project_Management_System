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

  const task = await prisma.task.findUnique({
    where: { id: params.id },
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

  // Permission check - users can only view their own tasks unless they're admin
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.role === 'Worker' && task.assigneeId !== userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskDetailClient task={task} currentUserId={userId} />
    </div>
  );
}
