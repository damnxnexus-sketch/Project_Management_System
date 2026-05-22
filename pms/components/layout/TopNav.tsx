'use client';

import * as React from 'react';
import { Search, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';

export function TopNav() {
  const currentUser = useStore((state) => state.currentUser);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const isMounted = useMounted();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface)] px-4 sm:px-6 gap-4">
      <div className="flex items-center md:hidden">
        <button onClick={toggleSidebar} className="text-[var(--foreground)] p-1 -ml-2 rounded-full hover:bg-[var(--surface-raised)] transition-colors cursor-pointer">
          <Menu size={24} />
        </button>
      </div>
      
      <div className="hidden sm:flex flex-1 max-w-2xl mx-auto items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all">
        <Search className="text-[var(--muted)]" size={18} />
        <input
          type="text"
          placeholder="Search across workspace..."
          className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
      </div>

      <div className="flex items-center gap-4">
        {isMounted && currentUser && (
          <NotificationBell userId={currentUser.id} />
        )}
        <div className="flex items-center gap-3 border-l border-[var(--border-color)] pl-4">
          {isMounted && currentUser ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[var(--foreground)]">{currentUser.name}</p>
                <p className="text-xs text-[var(--muted)]">{currentUser.role}</p>
              </div>
              <Avatar src={currentUser.avatar} alt={currentUser.name} />
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-[var(--glass-bg)] animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
