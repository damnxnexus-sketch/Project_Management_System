'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name || !email) {
      return { success: false, error: 'Name and email are required' };
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.userId) {
      return { success: false, error: 'Email already in use' };
    }

    await prisma.user.update({
      where: { id: session.userId as string },
      data: { name, email },
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.userId as string },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            projects: true,
            comments: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}
