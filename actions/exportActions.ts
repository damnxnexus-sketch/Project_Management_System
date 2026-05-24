'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getTasksForExport(filters?: {
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      assignee: task.assignee?.name || 'Unassigned',
      assigneeEmail: task.assignee?.email || '',
      project: task.project?.name || 'No Project',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      aiRisk: task.aiRisk ? 'Yes' : 'No',
      flags: task.flags,
      createdAt: task.createdAt.toISOString().split('T')[0],
      updatedAt: task.updatedAt.toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error('Get tasks for export error:', error);
    return null;
  }
}

export async function getProjectsForExport() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          select: {
            status: true,
          },
        },
        assignees: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: `${progress}%`,
        totalTasks,
        completedTasks,
        teamMembers: project.assignees.map((a) => a.name).join(', '),
        deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : '',
        createdAt: project.createdAt.toISOString().split('T')[0],
        updatedAt: project.updatedAt.toISOString().split('T')[0],
      };
    });
  } catch (error) {
    console.error('Get projects for export error:', error);
    return null;
  }
}

export async function getActivityLogsForExport(limit: number = 100) {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      user: log.user.name,
      userEmail: log.user.email,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes || '',
      timestamp: log.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Get activity logs for export error:', error);
    return null;
  }
}
