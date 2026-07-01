import React from 'react';
import { Account, ModelType, SortOption } from '../types';
import { StatusBadge } from './StatusBadge';
import { Trash2, Edit2 } from 'lucide-react';
import { isAvailable } from '../utils/time';

interface AccountTableProps {
  accounts: Account[];
  sortOption: SortOption;
  onSetLimit: (account: Account, model: ModelType) => void;
  onClearLimit: (accountId: string, model: ModelType) => void;
  onDeleteAccount: (accountId: string) => void;
  onEditAccount: (account: Account) => void;
}

export function AccountTable({ accounts, sortOption, onSetLimit, onClearLimit, onDeleteAccount, onEditAccount }: AccountTableProps) {
  
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (sortOption === 'email') {
      return a.email.localeCompare(b.email);
    }
    
    const getTargetDate = (acc: Account, model?: ModelType) => {
      if (model === 'gemini') return acc.geminiResetDate ? new Date(acc.geminiResetDate).getTime() : 0;
      if (model === 'claude') return acc.claudeResetDate ? new Date(acc.claudeResetDate).getTime() : 0;
      
      const g = acc.geminiResetDate ? new Date(acc.geminiResetDate).getTime() : 0;
      const c = acc.claudeResetDate ? new Date(acc.claudeResetDate).getTime() : 0;
      return Math.max(g, c);
    };

    if (sortOption === 'next-gemini') {
      return getTargetDate(a, 'gemini') - getTargetDate(b, 'gemini');
    }
    if (sortOption === 'next-claude') {
      return getTargetDate(a, 'claude') - getTargetDate(b, 'claude');
    }
    return getTargetDate(a) - getTargetDate(b);
  });

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
        <p className="text-zinc-500">No accounts added yet. Add an account to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-[1fr_200px_200px_60px] gap-4 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-4 font-medium rounded-t-xl">
        <div>Google Account</div>
        <div>Claude</div>
        <div>Gemini</div>
        <div></div>
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50 bg-white/50 dark:bg-zinc-900/20">
        {sortedAccounts.map((account) => {
          const geminiAvailable = isAvailable(account.geminiResetDate);
          const claudeAvailable = isAvailable(account.claudeResetDate);
          const isFullyAvailable = geminiAvailable || claudeAvailable;
          
          return (
            <div 
              key={account.id} 
              className={`group transition-colors p-4 md:grid md:grid-cols-[1fr_200px_200px_60px] md:gap-4 md:items-center flex flex-col gap-4 ${
                isFullyAvailable ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 shrink-0 rounded-full ${isFullyAvailable ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 break-all">{account.email}</span>
                </div>
                <div className="flex md:hidden items-center gap-1">
                  <button 
                    onClick={() => onEditAccount(account)}
                    className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-lg transition-colors"
                    title="Edit account email"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Remove account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:contents">
                <div className="flex flex-col gap-1.5 md:block">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider md:hidden">Claude</span>
                  <StatusBadge 
                    resetDate={account.claudeResetDate} 
                    startDate={account.claudeStartDate}
                    onClick={() => onSetLimit(account, 'claude')}
                    onClear={(e) => {
                      e.stopPropagation();
                      onClearLimit(account.id, 'claude');
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:block">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider md:hidden">Gemini</span>
                  <StatusBadge 
                    resetDate={account.geminiResetDate} 
                    startDate={account.geminiStartDate}
                    onClick={() => onSetLimit(account, 'gemini')}
                    onClear={(e) => {
                      e.stopPropagation();
                      onClearLimit(account.id, 'gemini');
                    }}
                  />
                </div>
              </div>

              <div className="hidden md:flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onEditAccount(account)}
                  className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-lg focus:opacity-100"
                  title="Edit account email"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDeleteAccount(account.id)}
                  className="p-2 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg focus:opacity-100"
                  title="Remove account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
