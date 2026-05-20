import { prisma } from '@/lib/prisma';
import { FolderKanban, Plus } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreateProjectModal } from './CreateProjectModal';
import { DeleteProjectButton } from './DeleteProjectButton';

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const isWorker = session.role === 'Worker';

  const projects = await prisma.project.findMany({
    where: isWorker ? {
      tasks: {
        some: { assigneeId: session.userId as string }
      }
    } : {},
    include: {
      tasks: isWorker ? {
        where: { assigneeId: session.userId as string }
      } : true
    }
  });

  return (
    <div className="flex h-full flex-col w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2 flex items-center gap-2">
            <FolderKanban className="text-[var(--accent)]" />
            Active Projects
          </h2>
          <p className="text-[var(--muted)]">Overview of all ongoing agency projects.</p>
        </div>
        {session.role !== 'Worker' && (
          <CreateProjectModal />
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--glass-bg)] p-12 text-center">
          <FolderKanban size={48} className="text-[var(--muted)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--foreground)]">No active projects</h3>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-sm">
            Get started by creating a new project. Tasks can then be assigned to specific projects for better tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totalProgress = project.tasks.length > 0 
              ? Math.round(project.tasks.reduce((acc, t) => acc + t.progress, 0) / project.tasks.length) 
              : 0;

            return (
              <div key={project.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 hover:shadow-lg hover:border-[var(--border-focus)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-[var(--foreground)]">{project.name}</h3>
                    <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {project.status}
                    </span>
                  </div>
                  {session.role !== 'Worker' && <DeleteProjectButton projectId={project.id} />}
                </div>
                <p className="text-sm text-[var(--muted)] mb-6 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--muted)]">
                    <span>Progress</span>
                    <span>{totalProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--accent)] transition-all duration-500" 
                      style={{ width: `${totalProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-between text-xs text-[var(--muted)]">
                  <span>{project.tasks.length} Tasks</span>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
