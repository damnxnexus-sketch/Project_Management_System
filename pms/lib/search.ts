'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export interface SearchFilter {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  searchQuery?: string;
}

export async function searchTasks(filters: SearchFilter) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const where: Record<string, unknown> = {};

    // Role-based filtering
    if (session.role === 'Worker') {
      where.assigneeId = session.userId;
    }

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {} as Record<string, unknown>;
      if (filters.dueDateFrom) {
        (where.dueDate as Record<string, unknown>).gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        (where.dueDate as Record<string, unknown>).lte = filters.dueDateTo;
      }
    }

    if (filters.searchQuery) {
      where.OR = [
        { title: { contains: filters.searchQuery } },
        { description: { contains: filters.searchQuery } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to search tasks:', error);
    return { error: 'Failed to search tasks' };
  }
}

export async function searchProjects(searchQuery: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      include: {
        tasks: true,
        assignees: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, projects };
  } catch (error) {
    console.error('Failed to search projects:', error);
    return { error: 'Failed to search projects' };
  }
}

export async function getTasksByStatus(status: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const where: Record<string, unknown> = { status };
    if (session.role === 'Worker') {
      where.assigneeId = session.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to fetch tasks by status:', error);
    return { error: 'Failed to fetch tasks' };
  }
}

export async function getOverdueTasks() {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const now = new Date();

    const where: Record<string, unknown> = {
      status: { not: 'done' },
      dueDate: { lt: now },
    };

    if (session.role === 'Worker') {
      where.assigneeId = session.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to fetch overdue tasks:', error);
    return { error: 'Failed to fetch tasks' };
  }
}

export async function getHighRiskTasks() {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const where: Record<string, unknown> = { aiRisk: true };

    if (session.role === 'Worker') {
      where.assigneeId = session.userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return { success: true, tasks };
  } catch (error) {
    console.error('Failed to fetch high-risk tasks:', error);
    return { error: 'Failed to fetch tasks' };
  }
}
