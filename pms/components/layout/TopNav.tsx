'use client';

import * as React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';

export function TopNav() {
  const currentUser = useStore((state) => state.currentUser);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const isMounted = useMounted();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--background)]/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 w-full max-w-md">
        <button onClick={toggleSidebar} className="md:hidden text-[var(--foreground)] p-1 -ml-2 rounded-md hover:bg-[var(--glass-bg)] cursor-pointer">
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex w-full items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--glass-bg)] px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all">
          <Search className="text-[var(--muted)]" size={18} />
          <input
            type="text"
            placeholder="Search across workspace..."
            className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[var(--accent)]"></span>
        </button>
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
