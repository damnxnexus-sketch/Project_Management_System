'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createMeetingAction(formData: FormData) {
  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;
  const meetLink = formData.get('meetLink') as string;
  const attendeeIds = formData.getAll('attendeeIds') as string[];

  if (!title || !dateStr || !timeStr || !meetLink) {
    return { error: 'All fields are required' };
  }

  const dateTimeString = `${dateStr}T${timeStr}:00`;

  try {
    // ─── FIX ───────────────────────────────────────────────────────────────────
    // Prisma is resolving the ambiguous create input to MeetingUncheckedCreateInput,
    // which only accepts raw scalar foreign-key fields — not relation objects like
    // `attendees: { connect: ... }`. This happens when the relation isn't declared
    // cleanly enough for Prisma to pick MeetingCreateInput automatically.
    //
    // Solution A (recommended): explicitly type the data object as MeetingCreateInput
    // so Prisma uses the relational variant and accepts `attendees: { connect }`.
    //
    // Solution B (fallback, no schema change needed): create the meeting first, then
    // connect attendees in a separate update — works regardless of which input type
    // Prisma resolves to.
    //
    // Uncomment whichever matches your Prisma schema setup:

    // ── Solution A — explicit type cast (use if `attendees` IS on Meeting model) ──
    //
    // import type { Prisma } from '@prisma/client';
    //
    // const meetingData: Prisma.MeetingCreateInput = {
    //   title,
    //   date: new Date(dateTimeString),
    //   meetLink,
    //   attendees: {
    //     connect: attendeeIds.map(id => ({ id })),
    //   },
    // };
    // await prisma.meeting.create({ data: meetingData });

    // ── Solution B — two-step create + update (safe fallback) ────────────────
    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: new Date(dateTimeString),
        meetLink,
      },
    });

    // Connect attendees via explicit update, bypassing the ambiguous create input
    if (attendeeIds.length > 0) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          attendees: {
            connect: attendeeIds.map(id => ({ id })),
          },
        },
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Create notifications for all attendees
    if (attendeeIds.length > 0) {
      await Promise.all(
        attendeeIds.map(userId =>
          prisma.notification.create({
            data: {
              userId,
              type: 'meeting_scheduled',
              title: `Meeting: ${title}`,
              message: `You have been assigned to meeting "${title}" on ${new Date(dateTimeString).toLocaleDateString()}`,
            },
          })
        )
      );
    }

    revalidatePath('/meetings');
    return { success: true };
  } catch (_error) {
    console.error('Error creating meeting:', _error);
    return { error: 'Failed to create meeting' };
  }
}

export async function deleteMeetingAction(meetingId: string) {
  try {
    // Delete relation records in the join table before deleting the meeting,
    // otherwise Prisma will throw a foreign key constraint error.
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        attendees: {
          set: [], // disconnect all attendees first
        },
      },
    });

    await prisma.meeting.delete({
      where: { id: meetingId },
    });

    revalidatePath('/meetings');
    return { success: true };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return { error: 'Failed to delete meeting' };
  }
}