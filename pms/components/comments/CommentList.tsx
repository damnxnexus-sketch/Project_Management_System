'use client';

import { CommentCard } from './CommentCard';

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

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  onCommentDeleted: (commentId: string) => void;
  onCommentUpdated: (commentId: string, newContent: string) => void;
}

export function CommentList({ 
  comments, 
  currentUserId, 
  onCommentDeleted,
  onCommentUpdated 
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDeleted={onCommentDeleted}
          onUpdated={onCommentUpdated}
        />
      ))}
    </div>
  );
}
