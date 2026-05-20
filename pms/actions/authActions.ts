'use server';

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password) return { error: 'Email and password are required' };

  let user = await prisma.user.findUnique({ where: { email } });

  // For MVP purposes: if user doesn't exist, we auto-create them to simplify testing
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        role: role || 'Worker',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      },
    });
  } else {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { error: 'Invalid password' };
  }

  await createSession(user.id, user.role);
  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
