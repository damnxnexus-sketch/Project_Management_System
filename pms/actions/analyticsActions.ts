'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export interface AnalyticsData {
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highRiskTasks: number;
  tasksByStatus: {
    status: string;
    count: number;
  }[];
  tasksByPriority: {
    priority: string;
    count: number;
  }[];
  tasksByAssignee: {
    id: string;
    name: string;
    email: string;
    count: number;
    completed: number;
  }[];
  projectProgress: {
    id: string;
    name: string;
    progress: number;
    taskCount: number;
    completedCount: number;
  }[];
  teamWorkload: {
    id: string;
    name: string;
    email: string;
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }[];
  weeklyActivity: {
    date: string;
    created: number;
    completed: number;
    updated: number;
  }[];
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dataType: 'tasks' | 'projects' | 'report';
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    projectId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * Get comprehensive analytics data for dashboard
 */
export async function getAnalyticsData(): Promise<{
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = (session as any).userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get all tasks for the user's role
    let allTasks;
    let allProjects;
    let workers;

    if (user.role === 'Worker') {
      allTasks = await prisma.task.findMany({
        where: { assigneeId: userId },
        include: { assignee: true, project: true },
      });
      allProjects = await prisma.project.findMany({
        where: { assignees: { some: { id: userId } } },
        include: { tasks: true },
      });
    } else {
      allTasks = await prisma.task.findMany({
        include: { assignee: true, project: true },
      });
      allProjects = await prisma.project.findMany({
        include: { tasks: true },
      });
    }

    workers = await prisma.user.findMany({
      where: { role: 'Worker' },
    });

    // Calculate task completion metrics
    const completedTasks = allTasks.filter((t) => t.status === 'done').length;
    const totalTasks = allTasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const overdueTasks = allTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length;
    const highRiskTasks = allTasks.filter((t) => t.aiRisk).length;

    // Tasks by status
    const tasksByStatus = ['todo', 'in-progress', 'in-review', 'done'].map((status) => ({
      status,
      count: allTasks.filter((t) => t.status === status).length,
    }));

    // Tasks by priority
    const tasksByPriority = ['low', 'medium', 'high'].map((priority) => ({
      priority,
      count: allTasks.filter((t) => t.priority === priority).length,
    }));

    // Tasks by assignee
    const tasksByAssignee: AnalyticsData['tasksByAssignee'] = [];
    const assigneeMap = new Map<string, { id: string; name: string; email: string; count: number; completed: number }>();

    allTasks.forEach((task) => {
      if (task.assignee && task.assigneeId) {
        const existing = assigneeMap.get(task.assigneeId);
        if (existing) {
          existing.count += 1;
          if (task.status === 'done') {
            existing.completed += 1;
          }
        } else {
          assigneeMap.set(task.assigneeId, {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
            count: 1,
            completed: task.status === 'done' ? 1 : 0,
          });
        }
      }
    });

    assigneeMap.forEach((value) => {
      tasksByAssignee.push(value);
    });

    // Project progress
    const projectProgress: AnalyticsData['projectProgress'] = allProjects.map((project) => {
      const projectTasks = project.tasks || [];
      const completedCount = projectTasks.filter((t) => t.status === 'done').length;
      const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        progress: Math.round(progress),
        taskCount: projectTasks.length,
        completedCount,
      };
    });

    // Team workload
    const teamWorkload: AnalyticsData['teamWorkload'] = workers.map((workerUser) => {
      const userTasks = allTasks.filter((t) => t.assigneeId === workerUser.id);
      const completedCount = userTasks.filter((t) => t.status === 'done').length;
      const overdueCount = userTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length;

      return {
        id: workerUser.id,
        name: workerUser.name,
        email: workerUser.email,
        assignedTasks: userTasks.length,
        completedTasks: completedCount,
        overdueTasks: overdueCount,
      };
    });

    // Weekly activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const weeklyActivityMap = new Map<string, { created: number; completed: number; updated: number }>();

    // Initialize last 4 weeks
    for (let i = 0; i < 4; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const dateStr = weekStart.toISOString().split('T')[0];
      weeklyActivityMap.set(dateStr, { created: 0, completed: 0, updated: 0 });
    }

    activityLogs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      const weekStart = new Date(logDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const dateStr = weekStart.toISOString().split('T')[0];

      if (weeklyActivityMap.has(dateStr)) {
        const entry = weeklyActivityMap.get(dateStr)!;
        if (log.action === 'created') entry.created += 1;
        if (log.action === 'updated') {
          const changes = log.changes ? JSON.parse(log.changes) : {};
          if (changes.status?.newValue === 'done') {
            entry.completed += 1;
          } else {
            entry.updated += 1;
          }
        }
      }
    });

    const weeklyActivity: AnalyticsData['weeklyActivity'] = Array.from(weeklyActivityMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    return {
      success: true,
      data: {
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
        totalTasks,
        completedTasks,
        overdueTasks,
        highRiskTasks,
        tasksByStatus,
        tasksByPriority,
        tasksByAssignee,
        projectProgress,
        teamWorkload,
        weeklyActivity,
      },
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics',
    };
  }
}

/**
 * Get report data for specific report type
 */
export async function getReportData(reportType: 'performance' | 'workload' | 'deadlines' | 'risk') {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = (session as any).userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    let query: any = {};
    if (user.role === 'Worker') {
      query = { assigneeId: userId };
    }

    const allTasks = await prisma.task.findMany({
      where: query,
      include: { assignee: true, project: true },
    });

    switch (reportType) {
      case 'performance': {
        const completed = allTasks.filter((t) => t.status === 'done').length;
        const inProgress = allTasks.filter((t) => t.status === 'in-progress').length;
        const total = allTasks.length;

        return {
          success: true,
          data: {
            title: 'Performance Report',
            total,
            completed,
            inProgress,
            pending: total - completed - inProgress,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            generatedAt: new Date().toISOString(),
          },
        };
      }

      case 'workload': {
        const userWorkload: Record<string, { assigned: number; completed: number; inProgress: number }> = {};

        allTasks.forEach((task) => {
          if (task.assignee && task.assigneeId) {
            if (!userWorkload[task.assigneeId]) {
              userWorkload[task.assigneeId] = { assigned: 0, completed: 0, inProgress: 0 };
            }
            userWorkload[task.assigneeId].assigned += 1;
            if (task.status === 'done') {
              userWorkload[task.assigneeId].completed += 1;
            } else if (task.status === 'in-progress') {
              userWorkload[task.assigneeId].inProgress += 1;
            }
          }
        });

        return {
          success: true,
          data: {
            title: 'Workload Report',
            workload: userWorkload,
            generatedAt: new Date().toISOString(),
          },
        };
      }

      case 'deadlines': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = allTasks.filter(
          (t) => t.dueDate && t.dueDate >= today && t.dueDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) && t.status !== 'done'
        );

        const overdue = allTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done');

        return {
          success: true,
          data: {
            title: 'Deadlines Report',
            upcoming: upcoming.length,
            overdue: overdue.length,
            tasks: [...upcoming, ...overdue].map((t) => ({
              id: t.id,
              title: t.title,
              dueDate: t.dueDate?.toISOString(),
              status: t.status,
              priority: t.priority,
              assignee: t.assignee?.name,
            })),
            generatedAt: new Date().toISOString(),
          },
        };
      }

      case 'risk': {
        const riskTasks = allTasks.filter((t) => t.aiRisk).sort((a, b) => {
          const aOverdue = a.dueDate && a.dueDate < new Date() && a.status !== 'done' ? 1 : 0;
          const bOverdue = b.dueDate && b.dueDate < new Date() && b.status !== 'done' ? 1 : 0;
          return bOverdue - aOverdue;
        });

        return {
          success: true,
          data: {
            title: 'Risk Analysis Report',
            highRiskCount: riskTasks.length,
            tasks: riskTasks.map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              status: t.status,
              dueDate: t.dueDate?.toISOString(),
              assignee: t.assignee?.name,
              isOverdue: t.dueDate && t.dueDate < new Date() && t.status !== 'done',
            })),
            generatedAt: new Date().toISOString(),
          },
        };
      }

      default:
        return { success: false, error: 'Invalid report type' };
    }
  } catch (error) {
    console.error('Report error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    };
  }
}

/**
 * Get tasks for export with optional filtering
 */
export async function getExportData(filters?: ExportOptions['filters']) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = (session as any).userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    let query: any = {};

    // Role-based filtering
    if (user.role === 'Worker') {
      query.assigneeId = userId;
    }

    // Apply filters
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.priority) {
      query.priority = filters.priority;
    }
    if (filters?.assigneeId) {
      query.assigneeId = filters.assigneeId;
    }
    if (filters?.projectId) {
      query.projectId = filters.projectId;
    }
    if (filters?.dateRange) {
      query.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    const allTasks = await prisma.task.findMany({
      where: query,
      include: { assignee: true, project: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: allTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        dueDate: task.dueDate?.toISOString(),
        assignee: task.assignee?.name || 'Unassigned',
        project: task.project?.name || 'No Project',
        aiRisk: task.aiRisk ? 'Yes' : 'No',
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch export data',
    };
  }
}

/**
 * Get Gantt chart data for projects
 */
export async function getGanttData() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = (session as any).userId;
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    let allProjects;
    if (user.role === 'Worker') {
      allProjects = await prisma.project.findMany({
        where: { assignees: { some: { id: userId } } },
        include: { tasks: true },
      });
    } else {
      allProjects = await prisma.project.findMany({
        include: { tasks: true },
      });
    }

    const ganttData = allProjects
      .filter((p) => p.tasks && p.tasks.length > 0)
      .map((project) => {
        const projectTasks = project.tasks || [];
        const startDate = projectTasks.reduce((min, t) => (t.createdAt < min ? t.createdAt : min), projectTasks[0]?.createdAt || new Date());
        const endDate = projectTasks.reduce((max, t) => {
          const dueDate = t.dueDate || t.updatedAt;
          return dueDate > max ? dueDate : max;
        }, projectTasks[0]?.dueDate || projectTasks[0]?.updatedAt || new Date());

        return {
          id: project.id,
          name: project.name,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          progress: project.deadline ? Math.round(((Date.now() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100) : 0,
          tasks: projectTasks.map((t) => ({
            id: t.id,
            title: t.title,
            startDate: t.createdAt.toISOString().split('T')[0],
            endDate: (t.dueDate || t.updatedAt).toISOString().split('T')[0],
            status: t.status,
            priority: t.priority,
          })),
        };
      });

    return { success: true, data: ganttData };
  } catch (error) {
    console.error('Gantt error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Gantt data',
    };
  }
}
