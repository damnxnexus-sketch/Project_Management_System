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

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Search tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        project: { select: { name: true } },
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });

    // Search projects
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    const results = [
      ...tasks.map((task) => ({
        id: task.id,
        type: 'task' as const,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectName: task.project?.name,
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
