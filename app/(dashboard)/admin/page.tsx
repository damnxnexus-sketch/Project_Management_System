import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TeamManagementClient } from './TeamManagementClient';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isMasterAdmin = session.role === 'Master Admin';

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return <TeamManagementClient users={users} isMasterAdmin={isMasterAdmin} />;
}
