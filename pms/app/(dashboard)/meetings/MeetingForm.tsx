'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createMeetingAction } from '@/actions/meetingActions';
import { Calendar, Clock, Video, Type } from 'lucide-react';
import { useTransition } from 'react';

export function MeetingForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createMeetingAction(formData);
      if (result?.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage('Meeting published successfully!');
        (e.target as HTMLFormElement).reset();
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
          <Input name="title" type="text" required placeholder="e.g. Weekly Sync" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Calendar size={16} className="text-[var(--muted)]" />
              Date
            </label>
            <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <Clock size={16} className="text-[var(--muted)]" />
              Time
            </label>
            <Input name="time" type="time" required defaultValue="10:00" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <Video size={16} className="text-[var(--muted)]" />
            Google Meet Link
          </label>
          <Input name="meetLink" type="url" required placeholder="https://meet.google.com/abc-defg-hij" />
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
