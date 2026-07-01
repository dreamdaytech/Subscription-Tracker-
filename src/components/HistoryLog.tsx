import React from 'react';
import { HistoryEvent } from '../types';
import { CheckCircle2, Timer, History, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export function HistoryLog({ history, onClear }: { history: HistoryEvent[], onClear: () => void }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
        <p className="text-zinc-500">No usage history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          Usage History
        </h2>
        <button
          onClick={onClear}
          className="text-xs flex items-center gap-1.5 text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-400/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
      <div className="p-2 space-y-1">
        {history.map(event => (
          <div key={event.id} className="flex items-center gap-4 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-xl transition-colors">
            <div className="shrink-0">
              {event.type === 'limit_reached' ? (
                 <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 flex items-center justify-center">
                   <Timer className="w-4 h-4" />
                 </div>
              ) : (
                 <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 flex items-center justify-center">
                   <CheckCircle2 className="w-4 h-4" />
                 </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 truncate">
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{event.email}</span>
                  {' • '}
                  <span className="capitalize">{event.model}</span>
                  {' '}
                  {event.type === 'limit_reached' ? <span className="text-amber-600 dark:text-amber-400/80">reached limit</span> : <span className="text-emerald-600 dark:text-emerald-400/80">available again</span>}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {formatDate(event.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
