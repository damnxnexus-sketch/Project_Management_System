import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MeetingForm } from './MeetingForm';
import { Video, Calendar, Clock, Trash2, ExternalLink } from 'lucide-react';
import { deleteMeetingAction } from '@/actions/meetingActions';

export default async function MeetingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const meetings = await prisma.meeting.findMany({
    orderBy: { date: 'asc' },
  });

  const isAdmin = session.role === 'Admin' || session.role === 'Master Admin';

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground-heading)] mb-2">Team Meetings</h2>
        <p className="text-[var(--muted)]">Join scheduled Google Meets or publish new syncs for the team.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Meeting List */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-lg font-semibold text-[var(--foreground-heading)] mb-4">Upcoming Meetings</h3>
          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 text-center text-[var(--muted)] shadow-sm">
              No upcoming meetings scheduled.
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="group relative rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 hover:shadow-lg hover:border-[var(--border-focus)] transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--accent)]">
                    <Video size={24} />
                  </div>
                  <div>
                    <h4 className="text-[var(--foreground-heading)] font-semibold text-lg">{meeting.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted)] mt-1">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {meeting.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {meeting.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105 shadow-sm">
                    Join Meet <ExternalLink size={16} />
                  </a>
                  {isAdmin && (
                    <form action={async () => {
                      'use server';
                      await deleteMeetingAction(meeting.id);
                    }}>
                      <button type="submit" className="p-2.5 rounded-full text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Delete Meeting">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Admin Form */}
        {isAdmin && (
          <div className="w-full lg:w-1/3 shrink-0">
            <MeetingForm />
          </div>
        )}
      </div>
    </div>
  );
}
