'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '#', icon: FolderKanban },
  { name: 'Team', href: '/admin', icon: Users },
  { name: 'AI Insights', href: '#', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          NEXUS<span className="text-[var(--accent)]">.</span>
        </h1>
      </div>
      <nav className="flex flex-col gap-2 px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
    </aside>
  );
}
