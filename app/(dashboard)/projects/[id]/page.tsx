import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Calendar, Users, Target, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AddProjectTaskModal } from './AddProjectTaskModal';
import { ProjectTaskCard } from './ProjectTaskCard';
import { ProjectProgressSlider } from './ProjectProgressSlider';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  
  const isWorker = session.role === 'Worker';
  const isAdmin = session.role === 'Admin' || session.role === 'Master Admin';

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: isWorker 
        ? { where: { assigneeId: session.userId as string }, include: { assignee: { select: { name: true, avatar: true } } } }
        : { include: { assignee: { select: { name: true, avatar: true } } } },
      assignees: true,
    }
  });

  if (!project) notFound();

  // If worker, ensure they are assigned to this project or have tasks in it.
  if (isWorker) {
    const isAssigned = project.assignees.some(a => a.id === session.userId);
    const hasTasks = project.tasks.length > 0;
    if (!isAssigned && !hasTasks) {
      redirect('/projects');
    }
  }

  const allUsers = isAdmin ? await prisma.user.findMany({ select: { id: true, name: true } }) : [];

  return (
    <div className="flex h-full flex-col w-full max-w-7xl mx-auto pb-10">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-4">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground-heading)]">
                {project.name}
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {project.status}
              </span>
            </div>
            <p className="text-[var(--muted)] max-w-2xl text-lg">{project.description}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-3">
               <AddProjectTaskModal projectId={project.id} users={allUsers} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Progress Card */}
        <ProjectProgressSlider projectId={project.id} initialProgress={project.progress} isAdmin={isAdmin} />

        {/* Deadline Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
            <Calendar size={18} />
            <h3 className="font-semibold text-[var(--foreground)]">Deadline</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-[var(--foreground-heading)]">
              {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No deadline set'}
            </span>
          </div>
        </div>

        {/* Team Card */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
            <Users size={18} />
            <h3 className="font-semibold text-[var(--foreground)]">Assigned Team</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.assignees.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">No workers explicitly assigned</span>
            ) : (
              project.assignees.map(user => (
                <div key={user.id} className="flex items-center gap-2 bg-[var(--surface-raised)] border border-[var(--border-color)] px-3 py-1.5 rounded-full text-sm">
                  <img src={user.avatar || ''} alt={user.name} className="w-5 h-5 rounded-full" />
                  <span className="text-[var(--foreground)]">{user.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <h3 className="text-xl font-bold text-[var(--foreground-heading)]">Project Tasks</h3>
        </div>

        {project.tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface)] p-12 text-center text-[var(--muted)]">
            No tasks found for this project.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.tasks.map(task => (
              <ProjectTaskCard key={task.id} task={task as any} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
