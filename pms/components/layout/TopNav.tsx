'use client';

import * as React from 'react';
import { Search, Menu, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { useStore } from '@/store/useStore';
import { useMounted } from '@/hooks/useMounted';
import { useSearch } from '@/hooks/useSearch';

export function TopNav() {
  const currentUser = useStore((state) => state.currentUser);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const isMounted = useMounted();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { results, isLoading } = useSearch(searchQuery);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface)] px-4 sm:px-6 gap-4">
      <div className="flex items-center md:hidden">
        <button onClick={toggleSidebar} className="text-[var(--foreground)] p-1 -ml-2 rounded-full hover:bg-[var(--surface-raised)] transition-colors cursor-pointer">
          <Menu size={24} />
        </button>
      </div>
      
      <div ref={searchRef} className="hidden sm:flex flex-1 max-w-2xl mx-auto relative" data-tour="search">
        <div className="flex w-full items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all">
          <Search className="text-[var(--muted)]" size={18} />
          <input
            id="global-search"
            type="text"
            placeholder="Search tasks, projects... (⌘K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        {showResults && (searchQuery.trim() || isLoading) && (
          <SearchAutocomplete
            results={results}
            isLoading={isLoading}
            onSelect={() => {
              setShowResults(false);
              setSearchQuery('');
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div data-tour="theme-switcher">
          <ThemeSwitcher />
        </div>
        {isMounted && currentUser && (
          <div data-tour="notifications">
            <NotificationBell userId={currentUser.id} />
          </div>
        )}
        <div className="relative flex items-center gap-3 border-l border-[var(--border-color)] pl-3" data-tour="user-menu">
          {isMounted && currentUser ? (
            <>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[var(--foreground)]">{currentUser.name}</p>
                  <p className="text-xs text-[var(--muted)]">{currentUser.role}</p>
                </div>
                <Avatar src={currentUser.avatar} alt={currentUser.name} />
              </button>
              
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
                    >
                      <User size={16} />
                      <span>Profile Settings</span>
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-[var(--glass-bg)] animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
