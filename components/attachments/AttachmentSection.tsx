'use client';

import { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { AttachmentList } from './AttachmentList';
import { uploadAttachment } from '@/actions/fileActions';
import toast from 'react-hot-toast';

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  createdAt: Date;
}

interface AttachmentSectionProps {
  taskId: string;
  initialAttachments: Attachment[];
  currentUserId: string;
}

export function AttachmentSection({ taskId, initialAttachments, currentUserId }: AttachmentSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('file', file);

      const result = await uploadAttachment(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.attachment) {
        setAttachments([result.attachment as Attachment, ...attachments]);
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        Attachments ({attachments.length})
      </h3>
      
      <FileUploadZone onUpload={handleUpload} isUploading={isUploading} />
      
      <AttachmentList 
        attachments={attachments} 
        currentUserId={currentUserId}
        onDeleted={handleDelete}
      />
    </div>
  );
}
