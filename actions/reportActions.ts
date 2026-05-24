'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getTaskCompletionStats(startDate?: Date, endDate?: Date) {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const tasks = await prisma.task.findMany({
      where,
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Group by status
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by date for trend
    const dailyCompletion = tasks
      .filter((t) => t.status === 'done')
      .reduce((acc, task) => {
        const date = task.updatedAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      statusCounts,
      dailyCompletion,
      total: tasks.length,
      completed: statusCounts['done'] || 0,
      completionRate: tasks.length > 0 ? ((statusCounts['done'] || 0) / tasks.length) * 100 : 0,
    };
  } catch (error) {
    console.error('Get task completion stats error:', error);
    return null;
  }
}

export async function getTeamWorkloadStats() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const users = await prisma.user.findMany({
      include: {
        tasks: {
          select: {
            status: true,
            priority: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalTasks: user.tasks.length,
      todoTasks: user.tasks.filter((t) => t.status === 'todo').length,
      inProgressTasks: user.tasks.filter((t) => t.status === 'in-progress').length,
      inReviewTasks: user.tasks.filter((t) => t.status === 'in-review').length,
      completedTasks: user.tasks.filter((t) => t.status === 'done').length,
      highPriorityTasks: user.tasks.filter((t) => t.priority === 'high').length,
    }));
  } catch (error) {
    console.error('Get team workload stats error:', error);
    return null;
  }
}

export async function getProjectProgressStats() {
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
      },
    });

    return projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'done').length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        totalTasks,
        completedTasks,
        progress: Math.round(progress),
        deadline: project.deadline,
      };
    });
  } catch (error) {
    console.error('Get project progress stats error:', error);
    return null;
  }
}

export async function getOverdueTasksStats() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const now = new Date();
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          lt: now,
        },
        status: {
          not: 'done',
        },
      },
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
    });

    // Group by priority
    const byPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by days overdue
    const byDaysOverdue = tasks.map((task) => {
      const daysOverdue = Math.floor(
        (now.getTime() - task.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...task,
        daysOverdue,
      };
    });

    return {
      total: tasks.length,
      byPriority,
      tasks: byDaysOverdue,
    };
  } catch (error) {
    console.error('Get overdue tasks stats error:', error);
    return null;
  }
}

export async function getTasksByPriorityStats() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const tasks = await prisma.task.findMany({
      select: {
        priority: true,
        status: true,
      },
    });

    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      high: priorityCounts['high'] || 0,
      medium: priorityCounts['medium'] || 0,
      low: priorityCounts['low'] || 0,
      total: tasks.length,
    };
  } catch (error) {
    console.error('Get tasks by priority stats error:', error);
    return null;
  }
}

export async function getHighRiskTasksStats() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const tasks = await prisma.task.findMany({
      where: {
        aiRisk: true,
      },
      include: {
        assignee: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    const total = await prisma.task.count();
    const highRiskCount = tasks.length;
    const percentage = total > 0 ? (highRiskCount / total) * 100 : 0;

    return {
      total: highRiskCount,
      percentage: Math.round(percentage),
      tasks,
    };
  } catch (error) {
    console.error('Get high risk tasks stats error:', error);
    return null;
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const [
      totalTasks,
      completedTasks,
      totalProjects,
      activeProjects,
      totalUsers,
      overdueTasks,
      highRiskTasks,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'done' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.user.count(),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'done' },
        },
      }),
      prisma.task.count({ where: { aiRisk: true } }),
    ]);

    return {
      totalTasks,
      completedTasks,
      totalProjects,
      activeProjects,
      totalUsers,
      overdueTasks,
      highRiskTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return null;
  }
}
