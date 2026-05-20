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
                  '0 2px 10px rgba(114, 47, 55, 0.2)',
                  '0 4px 20px rgba(114, 47, 55, 0.6)',
                  '0 2px 10px rgba(114, 47, 55, 0.2)',
                ]
              : '0 2px 6px rgba(0,0,0,0.4)',
          }}
          transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
          className={cn(
            'flex w-full items-center gap-3 rounded-full bg-[var(--surface)] border border-[var(--border-color)] px-5 py-3 transition-all',
            !isLoading && 'focus-within:ring-2 focus-within:ring-[var(--accent)] hover:shadow-lg hover:border-[var(--border-focus)]'
          )}
        >
          <Sparkles className={cn('shrink-0', isLoading ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--muted)]')} size={20} />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="Generate tasks with AI (e.g. Setup database schema)..."
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-sm"
          >
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </form>
    </div>
  );
}
