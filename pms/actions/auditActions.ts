'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getActivityLogs(
  limit: number = 50,
  offset: number = 0,
  userId?: string
) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const where: Record<string, unknown> = {};
    if (userId) {
      where.userId = userId;
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await prisma.activityLog.count({ where });

    return { success: true, logs, total };
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return { error: 'Failed to fetch activity logs' };
  }
}

export async function getProjectActivityLogs(
  projectId: string,
  limit: number = 30
) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          { entityType: 'project', entityId: projectId },
          {
            entityType: 'task',
            // Find tasks related to this project
          },
        ],
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch project activity logs:', error);
    return { error: 'Failed to fetch logs' };
  }
}

export async function getTaskActivityLogs(taskId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const logs = await prisma.activityLog.findMany({
      where: {
        entityType: 'task',
        entityId: taskId,
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to fetch task activity logs:', error);
    return { error: 'Failed to fetch logs' };
  }
}

export async function getRecentActivity(days: number = 7) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const logs = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: dateFrom },
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Group by date
    const grouped = logs.reduce(
      (acc: Record<string, unknown[]>, log: unknown) => {
        const logEntry = log as { createdAt: Date };
        const date = logEntry.createdAt.toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
      },
      {} as Record<string, unknown[]>
    );

    return { success: true, logs: grouped };
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    return { error: 'Failed to fetch activity' };
  }
}
