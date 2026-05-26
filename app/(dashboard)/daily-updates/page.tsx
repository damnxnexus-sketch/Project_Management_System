import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DailyTaskUpdater } from '@/components/workupdater/DailyTaskUpdater';

export const metadata = {
  title: 'Daily Task Updater - NEXUS PMS',
  description: 'Update your daily work progress and accomplishments',
};

export default async function DailyUpdaterPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <DailyTaskUpdater />
    </main>
  );
}
