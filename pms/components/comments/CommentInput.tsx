'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  initialValue?: string;
  placeholder?: string;
}

export function CommentInput({ 
  onSubmit, 
  isSubmitting, 
  initialValue = '',
  placeholder = 'Write a comment... (use @username to mention)'
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isSubmitting}
        rows={3}
        className="w-full px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none disabled:opacity-50"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2"
        >
          <Send size={16} />
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
