'use client';

import * as React from 'react';
import { Flag, Plus, X } from 'lucide-react';
import { addTaskFlag, removeTaskFlag } from '@/actions/taskActions';
import { useTransition } from 'react';

const PREDEFINED_FLAGS = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-600' },
  { value: 'waiting', label: 'Waiting', color: 'bg-amber-500' },
  { value: 'review', label: 'Review', color: 'bg-blue-500' },
  { value: 'testing', label: 'Testing', color: 'bg-purple-500' },
  { value: 'documentation', label: 'Documentation', color: 'bg-indigo-500' },
  { value: 'bug', label: 'Bug Fix', color: 'bg-pink-500' },
  { value: 'feature', label: 'Feature', color: 'bg-emerald-500' },
  { value: 'refactor', label: 'Refactor', color: 'bg-cyan-500' },
  { value: 'performance', label: 'Performance', color: 'bg-green-500' },
];

interface FlagSelectorProps {
  taskId: string;
  currentFlags: string[];
  onFlagsChange?: () => void;
}

export function FlagSelector({ taskId, currentFlags, onFlagsChange }: FlagSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customFlag, setCustomFlag] = React.useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddFlag = (flag: string) => {
    if (currentFlags.includes(flag)) return;
    startTransition(async () => {
      const result = await addTaskFlag(taskId, flag);
      if (result.success) {
        onFlagsChange?.();
        setIsOpen(false);
      }
    });
  };

  const handleRemoveFlag = (flag: string) => {
    startTransition(async () => {
      const result = await removeTaskFlag(taskId, flag);
      if (result.success) {
        onFlagsChange?.();
      }
    });
  };

  const handleAddCustomFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFlag.trim()) return;
    
    const cleanFlag = customFlag.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
    if (currentFlags.includes(cleanFlag)) {
      setCustomFlag('');
      return;
    }

    handleAddFlag(cleanFlag);
    setCustomFlag('');
  };

  const getFlagColor = (flag: string) => {
    const predefined = PREDEFINED_FLAGS.find(f => f.value === flag);
    return predefined?.color || 'bg-gray-500';
  };

  const getFlagLabel = (flag: string) => {
    const predefined = PREDEFINED_FLAGS.find(f => f.value === flag);
    return predefined?.label || flag.charAt(0).toUpperCase() + flag.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-md border border-border hover:bg-background/50 transition-colors text-xs font-medium text-foreground"
      >
        <Flag size={14} />
        Flags
        {currentFlags.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-accent/20 text-accent">
            {currentFlags.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50 p-4">
          {/* Current Flags */}
          {currentFlags.length > 0 && (
            <div className="mb-4 pb-4 border-b border-border">
              <p className="text-xs font-medium text-muted mb-2">Active Flags</p>
              <div className="flex flex-wrap gap-2">
                {currentFlags.map(flag => (
                  <div
                    key={flag}
                    className={`${getFlagColor(flag)} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-2`}
                  >
                    <span>{getFlagLabel(flag)}</span>
                    <button
                      onClick={() => handleRemoveFlag(flag)}
                      disabled={isPending}
                      className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Flags */}
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-xs font-medium text-muted mb-3">Suggested Flags</p>
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_FLAGS.map(flag => (
                <button
                  key={flag.value}
                  onClick={() => handleAddFlag(flag.value)}
                  disabled={currentFlags.includes(flag.value) || isPending}
                  className={`text-xs px-3 py-2 rounded-md border transition-colors ${
                    currentFlags.includes(flag.value)
                      ? 'border-border bg-background/50 text-muted opacity-50 cursor-not-allowed'
                      : 'border-border hover:bg-background/50 text-foreground'
                  }`}
                >
                  {flag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Flag */}
          <div>
            <p className="text-xs font-medium text-muted mb-2">Add Custom Flag</p>
            <form onSubmit={handleAddCustomFlag} className="flex gap-2">
              <input
                type="text"
                value={customFlag}
                onChange={(e) => setCustomFlag(e.target.value)}
                placeholder="e.g. security-review"
                maxLength={30}
                className="flex-1 px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={!customFlag.trim() || isPending}
                className="px-3 py-1.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
            </form>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full px-3 py-1.5 rounded-md border border-border hover:bg-background/50 transition-colors text-xs font-medium text-foreground"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
