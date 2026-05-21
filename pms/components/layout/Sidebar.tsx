'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Sparkles, LogOut, CalendarCheck, Video, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { logoutAction } from '@/actions/authActions';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Team', href: '/admin', icon: Users },
  { name: 'Allotment', href: '/allotment', icon: CalendarCheck },
  { name: 'Meetings', href: '/meetings', icon: Video },
  { name: 'AI Insights', href: '#', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[var(--border-color)] bg-[var(--surface)] transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground-heading)]">
            NEXUS<span className="text-[var(--accent)]">.</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-1 py-4 flex-1 overflow-y-auto pr-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
                className={cn(
                  'relative flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors rounded-r-full',
                  isActive ? 'text-white bg-[var(--accent)]' : 'text-[var(--foreground)] hover:bg-[var(--surface-raised)]'
                )}
              >
                <item.icon className="relative z-10" size={20} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto shrink-0 pr-4">
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-4 px-6 py-3 rounded-r-full text-sm font-medium text-[var(--muted)] hover:text-red-400 hover:bg-[var(--surface-raised)] transition-colors cursor-pointer">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
