import React from 'react';
import { CheckCircle2, Timer, XCircle } from 'lucide-react';
import { isAvailable, getTimeRemaining } from '../utils/time';

interface StatusBadgeProps {
  resetDate: string | null;
  startDate?: string | null;
  onClick: () => void;
  onClear: (e: React.MouseEvent) => void;
}

export function StatusBadge({ resetDate, startDate, onClick, onClear }: StatusBadgeProps) {
  const available = isAvailable(resetDate);
  const timeRemaining = getTimeRemaining(resetDate);

  let percent = 100;
  if (!available && resetDate) {
    const end = new Date(resetDate).getTime();
    const start = startDate ? new Date(startDate).getTime() : end - 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    percent = total > 0 ? (elapsed / total) * 100 : 100;
    percent = Math.min(100, Math.max(0, percent));
  }

  if (available) {
    return (
      <button 
        onClick={onClick}
        className="group relative flex flex-col justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-all font-medium w-full max-w-[150px] sm:max-w-[170px]"
      >
        <div className="flex items-center gap-2 w-full">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-sm">Available</span>
        </div>
        
        {resetDate && (
          <span className="truncate text-[10px] text-emerald-600 dark:text-emerald-500/80 w-full text-left font-normal mt-0.5">
            Since {new Date(resetDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        
        {/* Tooltip-like hint on hover */}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-zinc-800 text-xs text-zinc-300 px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
          Mark limit reached
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={onClick}
        className="group relative flex flex-col justify-center gap-1 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20 transition-all font-medium w-full max-w-[150px] sm:max-w-[170px]"
      >
        <div className="flex items-center gap-2 w-full">
          <Timer className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-sm">{timeRemaining || 'Expired'}</span>
        </div>
        
        <div className="w-full h-1 bg-amber-200 dark:bg-amber-500/20 rounded-full overflow-hidden shrink-0 mt-0.5">
          <div 
            className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${percent}%` }}
          />
        </div>

        {resetDate && (
          <span className="truncate text-[10px] text-amber-600 dark:text-amber-500/80 w-full text-left font-normal mt-0.5">
            {new Date(resetDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-zinc-800 text-xs text-zinc-300 px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
          Edit timer
        </span>
      </button>
      
      <button 
        onClick={onClear}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 rounded-full transition-colors h-8 w-8 flex items-center justify-center shrink-0"
        title="Mark as available"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
