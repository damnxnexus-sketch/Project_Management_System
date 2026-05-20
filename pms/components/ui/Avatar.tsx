import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function Avatar({ className, src, fallback, alt, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  return (
    <div className={cn('relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--glass-bg)] border border-[var(--border-color)]', className)}>
      {src && !error ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt}
          onError={() => setError(true)}
          {...props}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--glass-bg)] text-[var(--foreground)] text-xs font-medium uppercase">
          {fallback || alt?.charAt(0) || '?'}
        </div>
      )}
    </div>
  );
}
