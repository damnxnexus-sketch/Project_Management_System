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

export async function updateTaskFlags(taskId: string, flags: string[]) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });
    const oldFlags = oldTask?.flags ? JSON.parse(oldTask.flags) : [];

    await prisma.task.update({
      where: { id: taskId },
      data: { flags: JSON.stringify(flags) },
    });

    await logActivity(
      session.userId as string,
      'updated',
      'task',
      taskId,
      { field: 'flags', oldValue: oldFlags, newValue: flags }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update flags:', error);
    return { error: 'Failed to update flags' };
  }
}

export async function addTaskFlag(taskId: string, flag: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: 'Task not found' };

    const flags = task.flags ? JSON.parse(task.flags) : [];
    if (flags.includes(flag)) return { error: 'Flag already exists' };

    const newFlags = [...flags, flag];
    await prisma.task.update({
      where: { id: taskId },
      data: { flags: JSON.stringify(newFlags) },
    });

    await logActivity(
      session.userId as string,
      'updated',
      'task',
      taskId,
      { action: 'Added flag', flag }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to add flag:', error);
    return { error: 'Failed to add flag' };
  }
}

export async function removeTaskFlag(taskId: string, flag: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: 'Task not found' };

    const flags = task.flags ? JSON.parse(task.flags) : [];
    const newFlags = flags.filter((f: string) => f !== flag);

    await prisma.task.update({
      where: { id: taskId },
      data: { flags: JSON.stringify(newFlags) },
    });

    await logActivity(
      session.userId as string,
      'updated',
      'task',
      taskId,
      { action: 'Removed flag', flag }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to remove flag:', error);
    return { error: 'Failed to remove flag' };
  }
}
