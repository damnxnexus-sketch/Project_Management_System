'use server';

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password are required' };

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) return { error: 'Invalid email or password' };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return { error: 'Invalid email or password' };

  await createSession(user.id, user.role);
  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
