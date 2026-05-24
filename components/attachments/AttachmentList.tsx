'use client';

import { AttachmentCard } from './AttachmentCard';

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  createdAt: Date;
}

interface AttachmentListProps {
  attachments: Attachment[];
  currentUserId: string;
  onDeleted: (attachmentId: string) => void;
}

export function AttachmentList({ attachments, currentUserId, onDeleted }: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        <p>No attachments yet. Upload files to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <AttachmentCard
          key={attachment.id}
          attachment={attachment}
          currentUserId={currentUserId}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
