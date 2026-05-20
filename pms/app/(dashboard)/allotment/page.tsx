import { prisma } from '@/lib/prisma';
import { AllotmentForm } from './AllotmentForm';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AllotmentPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  if (session.role === 'Worker') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted)]">You do not have permission to access the allotment page.</p>
      </div>
    );
  }

  let whereClause = {};
  if (session.role === 'Admin') {
    whereClause = { role: 'Worker' };
  } else if (session.role === 'Master Admin') {
    whereClause = { role: { in: ['Worker', 'Admin'] } };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, role: true, avatar: true },
  });

  return (
    <div className="flex h-full flex-col max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">Daily Task Allotment</h2>
        <p className="text-[var(--muted)]">Assign specific tasks to team members for the day.</p>
      </div>
      <AllotmentForm users={users} />
    </div>
  );
}
