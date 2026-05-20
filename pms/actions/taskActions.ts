'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function fetchAllUsers() {
  return await prisma.user.findMany({ select: { id: true, name: true, role: true, avatar: true } });
}

export async function assignDailyTask(formData: FormData) {
  const assigneeId = formData.get('assigneeId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dateStr = formData.get('date') as string;
  const projectId = formData.get('projectId') as string;

  if (!assigneeId || !title || !dateStr || !description) return { error: 'Missing required fields' };

  await prisma.task.create({
    data: {
      title,
      description,
      dueDate: new Date(dateStr),
      assigneeId,
      projectId: projectId || null,
      status: 'todo',
      priority: 'medium',
      progress: 0,
    },
  });

  revalidatePath('/allotment');
  revalidatePath('/');
  return { success: true };
}

export async function updateTaskProgress(taskId: string, progress: number) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { progress },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update progress' };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update status' };
  }
}

export async function createAiTasks(tasks: any[]) {
  try {
    await prisma.task.createMany({
      data: tasks.map(t => ({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        aiRisk: t.aiRisk,
        progress: t.progress,
      }))
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to save AI tasks' };
  }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId }
    });
    revalidatePath('/');
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to delete task' };
  }
}
