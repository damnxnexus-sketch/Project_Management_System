'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function fetchAllUsers() {
  return await prisma.user.findMany({ select: { id: true, name: true, role: true, avatar: true } });
}

export async function assignDailyTask(formData: FormData) {
  const assigneeId = formData.get('assigneeId') as string;
  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string;

  if (!assigneeId || !title || !dateStr) return { error: 'Missing required fields' };

  await prisma.task.create({
    data: {
      title,
      description: 'Daily task assigned by admin.',
      dueDate: new Date(dateStr),
      assigneeId,
      status: 'todo',
      priority: 'medium',
    },
  });

  revalidatePath('/allotment');
  revalidatePath('/');
  return { success: true };
}
