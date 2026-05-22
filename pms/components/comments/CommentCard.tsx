'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { deleteComment, updateComment } from '@/actions/commentActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface CommentCardProps {
  comment: Comment;
  currentUserId: string;
  onDeleted: (commentId: string) => void;
  onUpdated: (commentId: string, newContent: string) => void;
}

export function CommentCard({ comment, currentUserId, onDeleted, onUpdated }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = comment.author.id === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteComment(comment.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Comment deleted');
        onDeleted(comment.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    
    setIsUpdating(true);
    try {
      const result = await updateComment(comment.id, editContent);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Comment updated');
        onUpdated(comment.id, editContent);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex gap-3 p-4 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-color)]">
        <Avatar src={comment.author.avatar} alt={comment.author.name} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-medium text-[var(--foreground)]">{comment.author.name}</p>
              <p className="text-xs text-[var(--muted)]">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            {isOwner && !isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded transition-colors"
                  title="Edit comment"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-[var(--surface)] rounded transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isUpdating}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={!editContent.trim() || isUpdating}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Check size={14} />
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] rounded text-sm font-medium hover:bg-[var(--surface-raised)] disabled:opacity-50 flex items-center gap-1"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
