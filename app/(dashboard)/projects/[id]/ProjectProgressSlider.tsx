'use client';

import * as React from 'react';
import { updateProjectProgress } from '@/actions/projectActions';
import { Target } from 'lucide-react';
import { useTransition } from 'react';

export function ProjectProgressSlider({ projectId, initialProgress, isAdmin }: { projectId: string, initialProgress: number, isAdmin: boolean }) {
  const [progress, setProgress] = React.useState(initialProgress);
  const [isPending, startTransition] = useTransition();

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseInt(e.target.value));
  };

  const handleProgressCommit = () => {
    if (progress === initialProgress) return;
    startTransition(async () => {
      await updateProjectProgress(projectId, progress);
    });
  };

  return (
    <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-sm transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
        <Target size={18} />
        <h3 className="font-semibold text-[var(--foreground)]">Overall Progress</h3>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-4xl font-bold text-[var(--foreground-heading)]">{progress}%</span>
      </div>
      
      {isAdmin ? (
        <div className="mt-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleProgressChange}
            onMouseUp={handleProgressCommit}
            onTouchEnd={handleProgressCommit}
            className="w-full h-2.5 bg-[var(--background)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]"
          />
        </div>
      ) : (
        <div className="h-2.5 w-full bg-[var(--background)] rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-[var(--accent)] transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
