'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Generate a password reset token
export async function requestPasswordReset(formData: FormData) {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database (you'll need to add a PasswordReset model)
    // For now, we'll just return success
    // TODO: Implement email sending service

    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`);

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Failed to process request' };
  }
}

// Validate reset token
export async function validateResetToken(token: string) {
  try {
    // TODO: Implement token validation from database
    // For now, return true for demo purposes
    return { valid: true };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// Reset password with token
export async function resetPassword(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !newPassword || !confirmPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // TODO: Validate token and get user from database
    // For now, return error as token system is not fully implemented
    return {
      success: false,
      error: 'Password reset is not fully configured. Please contact an administrator.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}
