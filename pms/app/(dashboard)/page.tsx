import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/layout/DashboardContent';

export default async function Home() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Get current user details
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!currentUser) redirect('/login');

  // Fetch tasks based on role
  const taskWhereClause = session.role === 'Worker' ? { assigneeId: session.userId as string } : {};
  const tasks = await prisma.task.findMany({
    where: taskWhereClause,
    include: { assignee: true, project: true },
  });

  // Fetch projects
  const projects = await prisma.project.findMany({
    include: { tasks: true, assignees: true },
  });

  // Fetch users
  const users = await prisma.user.findMany();

  // Calculate stats
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    highRiskTasks: tasks.filter(t => t.aiRisk).length,
  };

  // Format tasks for component
  const formattedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    aiRisk: t.aiRisk,
    progress: t.progress,
    projectId: t.projectId,
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    assigneeId: t.assigneeId,
    assigneeName: t.assignee?.name,
    projectName: t.project?.name,
  }));

  const statCards = [
    {
      iconType: 'chart',
      label: 'Total Tasks',
      value: stats.totalTasks,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      iconType: 'clock',
      label: 'In Progress',
      value: stats.inProgressTasks,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      iconType: 'check',
      label: 'Completed',
      value: stats.completedTasks,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      iconType: 'alert',
      label: 'High Risk',
      value: stats.highRiskTasks,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      iconType: 'folder',
      label: 'Projects',
      value: stats.totalProjects,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      iconType: 'users',
      label: 'Team Members',
      value: users.length,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  return (
    <DashboardContent 
      session={{ name: currentUser.name, userId: currentUser.id, role: currentUser.role }}
      tasks={formattedTasks}
      projects={projects}
      stats={statCards}
      users={users}
    />
  );
}

