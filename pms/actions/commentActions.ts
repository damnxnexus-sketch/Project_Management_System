'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notificationActions';

export async function createComment(taskId: string, content: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Extract mentions from content (e.g., @username)
    const mentionRegex = /@(\w+)/g;
    const mentionMatches = content.matchAll(mentionRegex);
    const mentionedUsernames = Array.from(mentionMatches, (m) => m[1]);

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId: session.userId as string,
        content,
      },
      include: {
        author: true,
      },
    });

    // Create mentions if any
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          name: { in: mentionedUsernames },
        },
      });

      for (const user of mentionedUsers) {
        await prisma.mention.create({
          data: {
            userId: user.id,
            commentId: comment.id,
          },
        });

        // Create notification for mentioned user
        await createNotification(
          user.id,
          'mentioned',
          'You were mentioned in a comment',
          `${comment.author.name} mentioned you in a comment`,
          taskId
        );
      }
    }

    // Notify task assignee if commented by someone else
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task && task.assigneeId && task.assigneeId !== session.userId) {
      await createNotification(
        task.assigneeId,
        'comment',
        'New comment on your task',
        `${comment.author.name} commented: "${content.slice(0, 50)}..."`,
        taskId
      );
    }

    revalidatePath(`/projects/[id]`);
    return { success: true, comment };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { error: 'Failed to create comment' };
  }
}

export async function getTaskComments(taskId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: true,
        mentions: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, comments };
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return { error: 'Failed to fetch comments' };
  }
}

export async function updateComment(commentId: string, content: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Verify ownership
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: true,
      },
    });

    revalidatePath(`/projects/[id]`);
    return { success: true, comment: updated };
  } catch (error) {
    console.error('Failed to update comment:', error);
    return { error: 'Failed to update comment' };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    // Verify ownership
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== session.userId) {
      return { error: 'Unauthorized' };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/projects/[id]`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return { error: 'Failed to delete comment' };
  }
}
