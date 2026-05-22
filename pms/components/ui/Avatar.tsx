import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ className, src, fallback, alt, size = 'md', ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-12 w-12 text-sm',
  };

  return (
    <div className={cn(`relative flex shrink-0 overflow-hidden rounded-full bg-[var(--glass-bg)] border border-[var(--border-color)] ${sizeClasses[size]}`, className)}>
      {src && !error ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt}
          onError={() => setError(true)}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--glass-bg)] text-[var(--foreground)] font-medium uppercase">
          {fallback || alt?.charAt(0) || '?'}
        </div>
      )}
    </div>
  );
}
