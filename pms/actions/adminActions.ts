'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;

  if (!name || !email) return { error: 'Name and email are required' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'User already exists' };

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email,
      name,
      role,
      password: hashedPassword,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
    },
  });

  revalidatePath('/admin');
  return { success: true };
}
