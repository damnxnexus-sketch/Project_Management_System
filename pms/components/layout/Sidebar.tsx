'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Sparkles, LogOut, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { logoutAction } from '@/actions/authActions';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '#', icon: FolderKanban },
  { name: 'Team', href: '/admin', icon: Users },
  { name: 'Allotment', href: '/allotment', icon: CalendarCheck },
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
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-[var(--border-color)] bg-[var(--background)]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            NEXUS<span className="text-[var(--accent)]">.</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-2 px-4 py-4 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
                className={cn(
                  'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-[var(--accent)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="relative z-10" size={18} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[var(--border-color)] mt-auto shrink-0">
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
