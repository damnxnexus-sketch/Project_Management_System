'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createMeetingAction(formData: FormData) {
  const title = formData.get('title') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;
  const meetLink = formData.get('meetLink') as string;

  if (!title || !dateStr || !timeStr || !meetLink) {
    return { error: 'All fields are required' };
  }

  // Combine date and time into a single DateTime
  const dateTimeString = `${dateStr}T${timeStr}:00`;
  
  try {
    await prisma.meeting.create({
      data: {
        title,
        date: new Date(dateTimeString),
        meetLink,
      },
    });

    revalidatePath('/meetings');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create meeting' };
  }
}

export async function deleteMeetingAction(meetingId: string) {
  try {
    await prisma.meeting.delete({
      where: { id: meetingId },
    });
    revalidatePath('/meetings');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete meeting' };
  }
}
