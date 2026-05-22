'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getTaskById(taskId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        project: true,
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: {
            author: true,
            mentions: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) return { error: 'Task not found' };

    // Check permissions - Workers can only see their own tasks
    if (session.role === 'Worker' && task.assigneeId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    return { success: true, task };
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return { error: 'Failed to fetch task' };
  }
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
  projectId?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Get old task for activity logging
    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!oldTask) return { error: 'Task not found' };

    // Check permissions
    if (session.role === 'Worker' && oldTask.assigneeId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId || null;
    if (data.projectId !== undefined) updateData.projectId = data.projectId || null;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: true,
        project: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId as string,
        action: 'updated',
        entityType: 'task',
        entityId: taskId,
        changes: JSON.stringify({ old: oldTask, new: task }),
      },
    });

    revalidatePath('/');
    revalidatePath(`/tasks/${taskId}`);
    return { success: true, task };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { error: 'Failed to update task' };
  }
}
