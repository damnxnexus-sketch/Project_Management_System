'use client';

import { useState } from 'react';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';
import { createComment } from '@/actions/commentActions';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  mentions: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
}

interface CommentSectionProps {
  taskId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export function CommentSection({ taskId, initialComments, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createComment(taskId, content);
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.comment) {
        const newComment = {
          ...result.comment,
          mentions: [],
        } as Comment;
        setComments([...comments, newComment]);
        toast.success('Comment added');
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        Comments ({comments.length})
      </h3>
      
      <CommentInput onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      
      <CommentList 
        comments={comments} 
        currentUserId={currentUserId}
        onCommentDeleted={(commentId) => {
          setComments(comments.filter(c => c.id !== commentId));
        }}
        onCommentUpdated={(commentId, newContent) => {
          setComments(comments.map(c => 
            c.id === commentId ? { ...c, content: newContent } : c
          ));
        }}
      />
    </div>
  );
}
