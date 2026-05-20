import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'danger' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-[var(--glass-bg)] text-[var(--foreground)]': variant === 'default',
          'border-[var(--border-color)] text-[var(--foreground)]': variant === 'outline',
          'border-transparent bg-[var(--accent)] text-white': variant === 'danger',
          'border-transparent bg-emerald-500/20 text-emerald-400': variant === 'success',
          'border-transparent bg-amber-500/20 text-amber-400': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}
