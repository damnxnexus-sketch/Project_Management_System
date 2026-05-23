import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  getDashboardStats,
  getTaskCompletionStats,
  getTeamWorkloadStats,
  getProjectProgressStats,
  getTasksByPriorityStats,
  getHighRiskTasksStats,
  getOverdueTasksStats,
} from '@/actions/reportActions';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [
    dashboardStats,
    completionStats,
    teamWorkload,
    projectProgress,
    priorityStats,
    highRiskStats,
    overdueStats,
  ] = await Promise.all([
    getDashboardStats(),
    getTaskCompletionStats(),
    getTeamWorkloadStats(),
    getProjectProgressStats(),
    getTasksByPriorityStats(),
    getHighRiskTasksStats(),
    getOverdueTasksStats(),
  ]);

  return (
    <ReportsClient
      dashboardStats={dashboardStats}
      completionStats={completionStats}
      teamWorkload={teamWorkload}
      projectProgress={projectProgress}
      priorityStats={priorityStats}
      highRiskStats={highRiskStats}
      overdueStats={overdueStats}
    />
  );
}
