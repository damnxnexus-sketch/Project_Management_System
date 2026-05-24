'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProjectAction(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const deadlineStr = formData.get('deadline') as string;
  const assigneeIds = formData.getAll('assigneeId') as string[];

  if (!name || !description || !deadlineStr) return { error: 'Missing required fields' };

  try {
    await prisma.project.create({
      data: {
        name,
        description,
        status: 'active',
        deadline: new Date(deadlineStr),
        assignees: {
          connect: assigneeIds.map(id => ({ id }))
        }
      }
    });

    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to create project.' };
  }
}

export async function updateProjectProgress(projectId: string, progress: number) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update project progress.' };
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

export async function updateProjectDeadline(projectId: string, deadlineStr: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { deadline: new Date(deadlineStr) }
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update deadline.' };
  }
}

export async function assignWorkerToProject(projectId: string, workerId: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        assignees: {
          connect: { id: workerId }
        }
      }
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to assign worker.' };
  }
}

export async function removeWorkerFromProject(projectId: string, workerId: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        assignees: {
          disconnect: { id: workerId }
        }
      }
    });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to remove worker.' };
  }
}

export async function addProjectTask(formData: FormData) {
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const assigneeId = formData.get('assigneeId') as string;
  const priority = formData.get('priority') as string || 'medium';
  
  if (!projectId || !title || !description) return { error: 'Missing required fields' };

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        priority,
        projectId,
        assigneeId: assigneeId || null,
        status: 'todo',
        progress: 0,
      }
    });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (e) {
    return { error: 'Failed to add task.' };
  }
}

export async function dedicateProjectToAdmin(formData: FormData) {
  const adminId = formData.get('adminId') as string;
  const projectId = formData.get('projectId') as string;

  if (!adminId || !projectId) return { error: 'Missing required fields' };

  try {
    // Check if admin already assigned
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { assignees: { select: { id: true } } }
    });

    const alreadyAssigned = project?.assignees.some(a => a.id === adminId);
    if (alreadyAssigned) {
      return { error: 'This admin is already assigned to this project' };
    }

    // Assign the admin to the project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        assignees: {
          connect: { id: adminId }
        }
      }
    });

    revalidatePath('/allotment');
    revalidatePath('/projects');
    return { success: true };
  } catch (e) {
    console.error('Failed to dedicate project:', e);
    return { error: 'Failed to dedicate project.' };
  }
}