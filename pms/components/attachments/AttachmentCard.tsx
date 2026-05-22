'use client';

import { useState } from 'react';
import { Download, Trash2, FileText, Image as ImageIcon, File } from 'lucide-react';
import { deleteAttachment } from '@/actions/fileActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  createdAt: Date;
}

interface AttachmentCardProps {
  attachment: Attachment;
  currentUserId: string;
  onDeleted: (attachmentId: string) => void;
}

export function AttachmentCard({ attachment, currentUserId, onDeleted }: AttachmentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = attachment.uploadedBy === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAttachment(attachment.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Attachment deleted');
        onDeleted(attachment.id);
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      toast.error('Failed to delete attachment');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getFileIcon = () => {
    if (attachment.fileType.startsWith('image/')) {
      return <ImageIcon size={20} className="text-blue-500" />;
    } else if (attachment.fileType.includes('pdf')) {
      return <FileText size={20} className="text-red-500" />;
    } else {
      return <File size={20} className="text-[var(--muted)]" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-color)] hover:border-[var(--accent)] transition-colors">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">
            {attachment.fileName}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {formatFileSize(attachment.fileSize)} • {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
          </p>
        </div>
        
        <div className="flex gap-1">
          <a
            href={attachment.filePath}
            download={attachment.fileName}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded transition-colors"
            title="Download"
          >
            <Download size={16} />
          </a>
          
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-[var(--surface)] rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Attachment"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
