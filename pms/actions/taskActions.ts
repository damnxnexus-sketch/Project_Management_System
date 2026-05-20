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

  if (!assigneeId || !title || !dateStr || !description) return { error: 'Missing required fields' };

  await prisma.task.create({
    data: {
      title,
      description,
      dueDate: new Date(dateStr),
      assigneeId,
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
