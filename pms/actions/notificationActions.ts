'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  taskId?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        taskId: taskId || null,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, notifications };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return { error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { error: 'Failed to update notification' };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return { error: 'Failed to update notifications' };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return { error: 'Failed to delete notification' };
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, read: false },
    });
    return { success: true, count };
  } catch (error) {
    console.error('Failed to fetch notification count:', error);
    return { error: 'Failed to fetch count' };
  }
}
