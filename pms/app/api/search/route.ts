import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const flag = searchParams.get('flag');
    const aiRisk = searchParams.get('aiRisk');

    if (!query.trim() && !status && !priority && !projectId && !assigneeId && !flag && !aiRisk) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Build where clause for tasks
    const taskWhere: any = {};
    if (query.trim()) {
      taskWhere.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }
    if (status) taskWhere.status = status;
    if (priority) taskWhere.priority = priority;
    if (projectId) taskWhere.projectId = projectId;
    if (assigneeId) taskWhere.assigneeId = assigneeId;
    if (aiRisk) taskWhere.aiRisk = aiRisk === 'true';
    if (flag) {
      taskWhere.flags = { contains: flag };
    }

    // Search tasks
    const tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    // Build where clause for projects (only if no specific filters)
    const projectWhere: any = {};
    if (query.trim() && !status && !priority && !assigneeId && !flag) {
      projectWhere.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    // Search projects
    const projects = query.trim() && !status && !priority && !assigneeId && !flag
      ? await prisma.project.findMany({
          where: projectWhere,
          take: 5,
          orderBy: { updatedAt: 'desc' },
        })
      : [];

    const results = [
      ...tasks.map((task) => ({
        id: task.id,
        type: 'task' as const,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectName: task.project?.name,
        assigneeName: task.assignee?.name,
        aiRisk: task.aiRisk,
        flags: task.flags,
      })),
      ...projects.map((project) => ({
        id: project.id,
        type: 'project' as const,
        title: project.name,
        description: project.description,
        status: project.status,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
