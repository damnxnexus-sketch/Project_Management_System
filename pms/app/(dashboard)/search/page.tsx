import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; priority?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const query = searchParams.q || '';
  const statusFilter = searchParams.status || '';
  const priorityFilter = searchParams.priority || '';

  let tasks: unknown[] = [];

  if (query) {
    const where: Record<string, unknown> = {
      OR: [{ title: { contains: query } }, { description: { contains: query } }],
    };

    if (session.role === 'Worker') {
      where.assigneeId = session.userId;
    }

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (priorityFilter) {
      where.priority = priorityFilter;
    }

    tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Search Tasks</h1>
          <p className="text-[var(--muted)]">Find tasks across your projects</p>
        </div>

        {/* Search Form */}
        <form method="get" className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 text-[var(--muted)]" size={20} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted)]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <select
              name="status"
              defaultValue={statusFilter}
              className="px-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review</option>
              <option value="done">Done</option>
            </select>

            <select
              name="priority"
              defaultValue={priorityFilter}
              className="px-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </form>

        {/* Results */}
        <div>
          {tasks.length === 0 && query ? (
            <div className="text-center py-12">
              <p className="text-[var(--muted)] text-lg">No tasks found for &quot;{query}&quot;</p>
              <p className="text-[var(--muted)] text-sm mt-2">Try different keywords or adjust filters</p>
            </div>
          ) : (
            <div>
              <p className="text-[var(--muted)] mb-4">
                Found {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-4">
                {tasks.map((item: unknown) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const task = item as any;
                  return (
                  <Link
                    key={task.id}
                    href={`/projects/${task.projectId || ''}`}
                    className="block p-4 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[var(--foreground)] flex-1">{task.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'done'
                            ? 'bg-green-500/20 text-green-400'
                            : task.status === 'in-progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : task.status === 'in-review'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[var(--muted)] text-sm mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : task.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={task.assignee.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + task.assignee.id}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-[var(--muted)]">{task.assignee.name}</span>
                        </div>
                      )}
                      {task.project && (
                        <span className="text-[var(--muted)]">{task.project.name}</span>
                      )}
                      {task.dueDate && (
                        <span className="text-[var(--muted)]">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
