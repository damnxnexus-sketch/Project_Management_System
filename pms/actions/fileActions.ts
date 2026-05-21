'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadAttachment(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const taskId = formData.get('taskId') as string;
    const file = formData.get('file') as File;

    if (!taskId || !file) return { error: 'Missing required fields' };

    // Verify task exists
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: 'Task not found' };

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) return { error: 'File size exceeds 10MB limit' };

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Convert File to Buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    // Create attachment record in database
    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: session.userId as string,
      },
    });

    revalidatePath(`/projects/[id]`);
    return { success: true, attachment };
  } catch (error) {
    console.error('File upload failed:', error);
    return { error: 'Failed to upload file' };
  }
}

export async function deleteAttachment(attachmentId: string) {
  try {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) return { error: 'Attachment not found' };

    // Delete file from filesystem
    const fullPath = path.join(process.cwd(), 'public', attachment.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    revalidatePath(`/projects/[id]`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    return { error: 'Failed to delete attachment' };
  }
}

export async function getTaskAttachments(taskId: string) {
  try {
    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, attachments };
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    return { error: 'Failed to fetch attachments' };
  }
}
