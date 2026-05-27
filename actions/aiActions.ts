'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateTasksFromPrompt, analyzeTaskRisk, suggestTaskOptimizations } from '@/lib/ai';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  actionText?: string;
}

export async function generateProjectInsights(): Promise<AIInsight[]> {
  try {
    const session = await getSession();
    if (!session) return [];

    // Fetch tasks and projects
    const tasks = await prisma.task.findMany({
      include: { assignee: true, project: true },
    });

    const projects = await prisma.project.findMany({
      include: { tasks: true, assignees: true },
    });

    const insights: AIInsight[] = [];

    // Insight 1: High-Risk Tasks
    const highRiskTasks = tasks.filter(t => t.aiRisk);
    if (highRiskTasks.length > 0) {
      insights.push({
        id: 'high-risk-tasks',
        title: `${highRiskTasks.length} High-Risk Task${highRiskTasks.length > 1 ? 's' : ''} Detected`,
        description: `${highRiskTasks.map(t => t.title).join(', ')} ${highRiskTasks.length > 1 ? 'are' : 'is'} at risk of delays. Consider allocating more resources or extending deadlines.`,
        icon: 'AlertTriangle',
        priority: 'high',
        actionText: 'Review Tasks',
      });
    }

    // Insight 2: Workload Imbalance
    const assigneeWorkload = new Map<string, number>();
    tasks.forEach(t => {
      if (t.assigneeId) {
        assigneeWorkload.set(t.assigneeId, (assigneeWorkload.get(t.assigneeId) || 0) + 1);
      }
    });

    if (assigneeWorkload.size > 0) {
      const maxLoad = Math.max(...assigneeWorkload.values());
      const minLoad = Math.min(...assigneeWorkload.values());
      
      if (maxLoad - minLoad > 3) {
        insights.push({
          id: 'workload-imbalance',
          title: 'Unbalanced Team Workload',
          description: `Workload varies significantly across team members (${minLoad}-${maxLoad} tasks). Consider redistributing tasks for better balance.`,
          icon: 'BarChart3',
          priority: 'medium',
          actionText: 'Balance Workload',
        });
      }
    }

    // Insight 3: Project Progress
    const inactiveProjects = projects.filter(p => 
      p.tasks.length === 0 || p.tasks.every(t => t.status === 'done')
    );

    if (inactiveProjects.length > 0) {
      insights.push({
        id: 'inactive-projects',
        title: `${inactiveProjects.length} Project${inactiveProjects.length > 1 ? 's' : ''} Need Attention`,
        description: `${inactiveProjects.map(p => p.name).join(', ')} ${inactiveProjects.length > 1 ? 'have' : 'has'} no active tasks. Consider planning next steps.`,
        icon: 'Clock',
        priority: 'medium',
        actionText: 'View Projects',
      });
    }

    // Insight 4: Deadline Approaching
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const upcomingDeadlines = tasks.filter(t => 
      t.dueDate && 
      t.dueDate <= tomorrow && 
      t.dueDate >= new Date() &&
      t.status !== 'done'
    );

    if (upcomingDeadlines.length > 0) {
      insights.push({
        id: 'upcoming-deadlines',
        title: `${upcomingDeadlines.length} Deadline${upcomingDeadlines.length > 1 ? 's' : ''} Due Soon`,
        description: `${upcomingDeadlines.map(t => t.title).slice(0, 3).join(', ')}${upcomingDeadlines.length > 3 ? `... and ${upcomingDeadlines.length - 3} more` : ''} ${upcomingDeadlines.length > 1 ? 'are' : 'is'} due within 24 hours.`,
        icon: 'Clock',
        priority: 'high',
        actionText: 'Check Deadlines',
      });
    }

    // Insight 5: Team Capacity
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate > 80) {
      insights.push({
        id: 'high-completion',
        title: 'Great Team Performance! 🎉',
        description: `Your team has completed ${Math.round(completionRate)}% of all tasks. Keep up the excellent work!`,
        icon: 'Trophy',
        priority: 'low',
        actionText: 'View Analytics',
      });
    } else if (completionRate < 30 && totalTasks > 5) {
      insights.push({
        id: 'low-completion',
        title: 'Low Task Completion Rate',
        description: `Only ${Math.round(completionRate)}% of tasks are completed. Consider reviewing blockers or task prioritization.`,
        icon: 'TrendingDown',
        priority: 'high',
        actionText: 'Analyze',
      });
    }

    // Insight 6: Task Optimization
    if (tasks.length > 0) {
      const largeTasksCount = tasks.filter(t => 
        t.description.length > 200 || 
        (t.status === 'in-progress' && !t.assigneeId)
      ).length;

      if (largeTasksCount > 2) {
        insights.push({
          id: 'task-optimization',
          title: 'Consider Breaking Down Tasks',
          description: `${largeTasksCount} tasks appear complex and could be split into smaller subtasks for better tracking and faster completion.`,
          icon: 'Zap',
          priority: 'low',
          actionText: 'Optimize Tasks',
        });
      }
    }

    // Limit to 5 most important insights
    return insights.slice(0, 5);
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

export async function generateTaskOptimizationSuggestions(taskId: string): Promise<string[]> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return [];

    const suggestions = await suggestTaskOptimizations([
      { title: task.title, description: task.description },
    ]);

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

export async function getTeamPerformanceInsights() {
  try {
    const session = await getSession();
    if (!session) return null;

    const users = await prisma.user.findMany();
    const tasks = await prisma.task.findMany({
      include: { assignee: true },
    });

    const performanceData = users.map(user => {
      const userTasks = tasks.filter(t => t.assigneeId === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'done').length;
      const completionRate = userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0;

      return {
        userId: user.id,
        name: user.name,
        totalTasks: userTasks.length,
        completedTasks,
        completionRate: Math.round(completionRate),
        inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
      };
    });

    return performanceData;
  } catch (error) {
    console.error('Error getting team performance:', error);
    return null;
  }
}

export async function calculateProjectHealthScore(projectId: string): Promise<number> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) return 0;

    let score = 100;
    const tasks = project.tasks;

    if (tasks.length === 0) {
      score -= 20; // No tasks = lower health
    } else {
      // Completion rate factor (40%)
      const completedCount = tasks.filter(t => t.status === 'done').length;
      const completionRate = (completedCount / tasks.length) * 100;
      score -= (40 - (completionRate / 100) * 40);

      // High-risk tasks factor (30%)
      const highRiskCount = tasks.filter(t => t.aiRisk).length;
      const riskFactor = (highRiskCount / tasks.length) * 30;
      score -= riskFactor;

      // Deadline adherence factor (30%)
      const now = new Date();
      const overdueTasks = tasks.filter(t => 
        t.dueDate && t.dueDate < now && t.status !== 'done'
      ).length;
      const overdueFactor = (overdueTasks / tasks.length) * 30;
      score -= overdueFactor;
    }

    return Math.max(0, Math.round(score));
  } catch (error) {
    console.error('Error calculating health score:', error);
    return 0;
  }
}
