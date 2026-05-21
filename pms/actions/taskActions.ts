'use server';

import { prisma } from '@/lib/prisma';
import { generateTasksFromPrompt, analyzeTaskRisk } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

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

  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
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

    // Log activity
    await logActivity(
      session.userId as string,
      'created',
      'task',
      '',
      { action: 'Task assigned to user' }
    );

    revalidatePath('/allotment');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to assign task:', error);
    return { error: 'Failed to assign task' };
  }
}

export async function updateTaskProgress(taskId: string, progress: number) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.task.update({
      where: { id: taskId },
      data: { progress },
    });

    await logActivity(
      session.userId as string,
      'updated',
      'task',
      taskId,
      { field: 'progress', newValue: progress }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update progress:', error);
    return { error: 'Failed to update progress' };
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });

    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    await logActivity(
      session.userId as string,
      'moved',
      'task',
      taskId,
      { from: oldTask?.status, to: status }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update status:', error);
    return { error: 'Failed to update status' };
  }
}

export async function createAiTasks(prompt: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Generate tasks using AI
    const aiTasks = await generateTasksFromPrompt(prompt);

    // Create tasks in database
    const createdTasks = await Promise.all(
      aiTasks.map(async (task) => {
        // Analyze risk for each task
        const riskAnalysis = await analyzeTaskRisk(
          task.title,
          task.description
        );

        return prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: 'todo',
            priority: task.priority,
            aiRisk: riskAnalysis.isHighRisk,
            progress: 0,
          },
        });
      })
    );

    await logActivity(
      session.userId as string,
      'created',
      'task',
      '',
      { action: 'AI-generated tasks', count: createdTasks.length }
    );

    revalidatePath('/');
    return { success: true, taskCount: createdTasks.length };
  } catch (error) {
    console.error('Error creating AI tasks:', error);
    return { error: 'Failed to generate tasks' };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.task.delete({
      where: { id: taskId }
    });

    await logActivity(
      session.userId as string,
      'deleted',
      'task',
      taskId,
      { action: 'Task deleted' }
    );

    revalidatePath('/');
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { error: 'Failed to delete task' };
  }
}

// Helper function to log activity
async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
