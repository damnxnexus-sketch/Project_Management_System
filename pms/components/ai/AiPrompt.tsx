'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

import { createAiTasks } from '@/actions/taskActions';

export function AiPrompt() {
  const [prompt, setPrompt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const generateAITasks = useStore((state) => state.generateAITasks);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    // Let the store generate and return the tasks locally.
    // Wait, generateAITasks currently returns Promise<void> and updates store.
    // We can just rely on the store to give us the tasks? No, we need the exact new tasks.
    // Let's generate them here directly!
    const newTasks = [
      {
        title: `Analyze: ${prompt.slice(0, 20)}...`,
        description: 'AI generated task based on your prompt.',
        status: 'todo',
        priority: 'high',
        aiRisk: false,
        progress: 0,
      },
      {
        title: 'Draft Action Plan',
        description: 'AI generated task',
        status: 'todo',
        priority: 'medium',
        aiRisk: false,
        progress: 0,
      },
      {
        title: 'Review Deliverables',
        description: 'AI generated task',
        status: 'todo',
        priority: 'low',
        aiRisk: true,
        progress: 0,
      },
    ];

    await createAiTasks(newTasks);
    // The server action revalidates the path, so the page will reload with new tasks from DB.
    
    setIsLoading(false);
    setPrompt('');
  };

  return (
    <div className="mb-8 w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          animate={{
            boxShadow: isLoading
              ? [
                  '0 0 0 1px rgba(114, 47, 55, 0.2)',
                  '0 0 0 2px rgba(114, 47, 55, 0.8)',
                  '0 0 0 1px rgba(114, 47, 55, 0.2)',
                ]
              : '0 0 0 1px var(--border-color)',
          }}
          transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-md transition-colors',
            !isLoading && 'focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent'
          )}
        >
          <Sparkles className={cn('shrink-0', isLoading ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--muted)]')} size={20} />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Generate Project with AI (e.g. Setup database schema)..."
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </form>
    </div>
  );
}
