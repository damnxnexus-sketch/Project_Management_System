'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { createMeetingAction } from '@/actions/meetingActions';
import { Calendar, Clock, Video, Type, Users } from 'lucide-react';
import { useTransition } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface MeetingFormProps {
  users: User[];
}

export function MeetingForm({ users }: MeetingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState('');
  const [selectedAttendees, setSelectedAttendees] = React.useState<Set<string>>(new Set());

  const handleAttendeeToggle = (userId: string) => {
    const newSet = new Set(selectedAttendees);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedAttendees(newSet);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add selected attendee IDs to formData
    selectedAttendees.forEach(id => {
      formData.append('attendeeIds', id);
    });

    startTransition(async () => {
      const result = await createMeetingAction(formData);
      if (result?.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage('Meeting published successfully!');
        (e.target as HTMLFormElement).reset();
        setSelectedAttendees(new Set());
        setTimeout(() => setMessage(''), 3000);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 w-full max-w-xl shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--foreground-heading)] mb-4">Schedule a Meeting</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Type size={16} className="text-[var(--muted)]" />
            Meeting Title
          </label>
          <Input name="title" type="text" required placeholder="e.g. Weekly Sync" className="bg-background/50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Calendar size={16} className="text-[var(--muted)]" />
              Date
            </label>
            <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="bg-background/50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Clock size={16} className="text-[var(--muted)]" />
              Time
            </label>
            <Input name="time" type="time" required defaultValue="10:00" className="bg-background/50" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Video size={16} className="text-[var(--muted)]" />
            Google Meet Link
          </label>
          <Input name="meetLink" type="url" required placeholder="https://meet.google.com/abc-defg-hij" className="bg-background/50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Users size={16} className="text-[var(--muted)]" />
            Select Attendees
          </label>
          {users.length === 0 ? (
            <div className="text-center p-4 rounded-lg border border-[var(--border-color)] bg-background/50 text-[var(--muted)]">
              No users available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-2 border border-[var(--border-color)] rounded-lg bg-background/30">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-background/50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    id={`attendee-${user.id}`}
                    checked={selectedAttendees.has(user.id)}
                    onChange={() => handleAttendeeToggle(user.id)}
                    className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                  />
                  <label 
                    htmlFor={`attendee-${user.id}`}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    <Avatar src={user.avatar || undefined} alt={user.name} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-[var(--foreground)]">{user.name}</span>
                      <span className="text-xs text-[var(--muted)] truncate">{user.role}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
          {selectedAttendees.size > 0 && (
            <div className="text-xs text-[var(--muted)]">
              {selectedAttendees.size} attendee(s) selected
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm text-center ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {message}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Publishing...' : 'Publish Meeting'}
        </Button>
      </form>
    </div>
  );
}
