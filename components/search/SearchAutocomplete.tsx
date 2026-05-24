'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FolderKanban, Loader2 } from 'lucide-react';
import type { SearchResult } from '@/hooks/useSearch';

interface SearchAutocompleteProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelect: () => void;
}

export function SearchAutocomplete({ results, isLoading, onSelect }: SearchAutocompleteProps) {
  const router = useRouter();

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'task') {
      router.push(`/tasks/${result.id}`);
    } else if (result.type === 'project') {
      router.push(`/projects/${result.id}`);
    }
    onSelect();
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-lg p-4">
        <div className="flex items-center justify-center gap-2 text-[var(--muted)]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-lg overflow-hidden max-h-96 overflow-y-auto">
      {results.map((result) => (
        <button
          key={result.id}
          onClick={() => handleSelect(result)}
          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--surface-raised)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
        >
          <div className="mt-0.5">
            {result.type === 'task' ? (
              <FileText size={18} className="text-[var(--accent)]" />
            ) : (
              <FolderKanban size={18} className="text-[var(--accent)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[var(--foreground)] truncate">
                {result.title}
              </span>
              {result.status && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted)] capitalize">
                  {result.status.replace('-', ' ')}
                </span>
              )}
            </div>
            {result.description && (
              <p className="text-sm text-[var(--muted)] line-clamp-1">
                {result.description}
              </p>
            )}
            {result.projectName && (
              <p className="text-xs text-[var(--muted)] mt-1">
                in {result.projectName}
              </p>
            )}
          </div>
          {result.priority && (
            <span
              className={`text-xs px-2 py-1 rounded capitalize ${
                result.priority === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : result.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {result.priority}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
