'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name || !description) return { error: 'Missing required fields' };

  try {
    await prisma.project.create({
      data: {
        name,
        description,
        status: 'active',
      },
    });

    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to create project.' };
  }
}

export async function deleteProject(projectId: string) {
  try {
    // First update all tasks to detach them from the project
    await prisma.task.updateMany({
      where: { projectId },
      data: { projectId: null }
    });

    await prisma.project.delete({
      where: { id: projectId }
    });
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to delete project.' };
  }
}
