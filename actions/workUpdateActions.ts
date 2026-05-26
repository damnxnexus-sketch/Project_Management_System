'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export interface WorkUpdateInput {
  taskId?: string;
  workDone: string;
  hoursSpent?: number;
  progressAdded?: number;
  status?: string;
  priority?: string;
  blockers?: string;
  nextSteps?: string;
  attachments?: string[];
}

export async function createWorkUpdate(data: WorkUpdateInput) {
  try {
    const sessionUnknown = await getSession();
    const session = sessionUnknown as { userId?: string; role?: string } | null;
    if (!session || !session.userId) {
      console.error('No session found');
      return { error: 'Unauthorized - Please log in again' };
    }

    if (!data.workDone || data.workDone.trim().length === 0) {
      return { error: 'Work description is required' };
    }

    console.log('Creating work update for user:', session.userId, 'payload:', {
      taskId: data.taskId,
      hoursSpent: data.hoursSpent,
      progressAdded: data.progressAdded,
      status: data.status,
      priority: data.priority,
    });

    // Validate taskId if provided
    if (data.taskId) {
      const taskExists = await prisma.task.findUnique({ where: { id: data.taskId }, select: { id: true } });
      if (!taskExists) {
        console.error('Invalid taskId provided to createWorkUpdate:', data.taskId);
        return { error: 'Invalid task ID' };
      }
    }

    const workUpdate = await prisma.workUpdate.create({
      data: {
        userId: session.userId,
        taskId: data.taskId || null,
        workDone: data.workDone,
        hoursSpent: data.hoursSpent ? parseFloat(data.hoursSpent.toString()) : null,
        progressAdded: data.progressAdded || 0,
        status: data.status || null,
        priority: data.priority || null,
        blockers: data.blockers || null,
        nextSteps: data.nextSteps || null,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        date: new Date(),
      },
      include: {
        user: { select: { name: true, avatar: true } },
        task: { select: { title: true, projectId: true } },
      },
    });

    console.log('Work update created successfully:', workUpdate.id);

    // If task is specified and progress is updated, update the task progress
    if (data.taskId && data.progressAdded && data.progressAdded > 0) {
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        select: { progress: true, projectId: true, assigneeId: true },
      });

      if (task) {
        const newProgress = Math.min(100, task.progress + data.progressAdded);
        await prisma.task.update({
          where: { id: data.taskId },
          data: {
            progress: newProgress,
            status: data.status || undefined,
            priority: data.priority || undefined,
          },
        });

        // Notify assignee if not the updater
        if (task.assigneeId && task.assigneeId !== session.userId) {
          const updater = await prisma.user.findUnique({
            where: { id: session.userId as string },
            select: { name: true },
          });

          await prisma.notification.create({
            data: {
              userId: task.assigneeId,
              type: 'task_updated',
              title: 'Work Update',
              message: `${updater?.name || 'Team member'} posted a work update on task`,
              taskId: data.taskId,
            },
          });
        }
      }
    }

    // Create notification for project team members (only for task updates)
    if (data.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        select: { projectId: true },
      });

      if (task?.projectId) {
        const project = await prisma.project.findUnique({
          where: { id: task.projectId },
          select: { assignees: { select: { id: true } } },
        });

        const updater = await prisma.user.findUnique({
          where: { id: session.userId as string },
          select: { name: true },
        });

        if (project) {
          for (const assignee of project.assignees) {
            if (assignee.id !== session.userId) {
              await prisma.notification.create({
                data: {
                  userId: assignee.id,
                  type: 'task_updated',
                  title: 'Work Update',
                  message: `${updater?.name || 'Team member'} posted a work update on task`,
                  taskId: data.taskId,
                },
              });
            }
          }
        }
      }
    }

    return { success: true, workUpdate };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to create work update:', errMsg);
    // Return the message (safe string) so client can show a helpful message
    return { error: errMsg || 'Failed to save work update' };
  }
}

export async function getUserWorkUpdates(userId: string, limit: number = 50) {
  try {
    const session = await getSession() as { userId: string; role: string } | null;
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Workers can only see their own updates
    if (session.role === 'Worker' && session.userId !== userId) {
      return { error: 'Unauthorized' };
    }

    const workUpdates = await prisma.workUpdate.findMany({
      where: { userId },
      include: {
        user: { select: { name: true, avatar: true } },
        task: { select: { id: true, title: true, project: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return { success: true, workUpdates };
  } catch (error) {
    console.error('Failed to fetch work updates:', error);
    return { error: 'Failed to fetch work updates' };
  }
}

export async function getTaskWorkUpdates(taskId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Unauthorized' };
    }

    const workUpdates = await prisma.workUpdate.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { date: 'desc' },
    });

    return { success: true, workUpdates };
  } catch (error) {
    console.error('Failed to fetch task work updates:', error);
    return { error: 'Failed to fetch work updates' };
  }
}

export async function getDailyWorkUpdates(date: Date) {
  try {
    const session = await getSession() as { userId: string; role: string } | null;
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Admins can see all, workers see only their own
    const whereClause: Record<string, unknown> = session.role === 'Worker' ? { userId: session.userId } : {};

    // Get updates for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const workUpdates = await prisma.workUpdate.findMany({
      where: {
        ...whereClause,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
        task: { select: { id: true, title: true, project: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    return { success: true, workUpdates };
  } catch (error) {
    console.error('Failed to fetch daily work updates:', error);
    return { error: 'Failed to fetch work updates' };
  }
}

export async function updateWorkUpdate(id: string, data: Partial<WorkUpdateInput>) {
  try {
    const session = await getSession() as { userId: string; role: string } | null;
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Check ownership
    const workUpdate = await prisma.workUpdate.findUnique({ where: { id } });
    if (!workUpdate || workUpdate.userId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    const updated = await prisma.workUpdate.update({
      where: { id },
      data: {
        workDone: data.workDone || undefined,
        hoursSpent: data.hoursSpent ? parseFloat(data.hoursSpent.toString()) : undefined,
        progressAdded: data.progressAdded || undefined,
        status: data.status || undefined,
        priority: data.priority || undefined,
        blockers: data.blockers || undefined,
        nextSteps: data.nextSteps || undefined,
        attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        task: { select: { title: true } },
      },
    });

    return { success: true, workUpdate: updated };
  } catch (error) {
    console.error('Failed to update work update:', error);
    return { error: 'Failed to update work update' };
  }
}

export async function deleteWorkUpdate(id: string) {
  try {
    const session = await getSession() as { userId: string; role: string } | null;
    if (!session) {
      return { error: 'Unauthorized' };
    }

    // Check ownership
    const workUpdate = await prisma.workUpdate.findUnique({ where: { id } });
    if (!workUpdate || workUpdate.userId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    await prisma.workUpdate.delete({ where: { id } });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete work update:', error);
    return { error: 'Failed to delete work update' };
  }
}
