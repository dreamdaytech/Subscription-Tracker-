import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bell, BellOff, Settings2, Sparkles, X, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Account, ModelType, SortOption, HistoryEvent } from './types';
import { AccountTable } from './components/AccountTable';
import { HistoryLog } from './components/HistoryLog';
import { AddAccountModal } from './components/AddAccountModal';
import { SetResetModal } from './components/SetResetModal';
import { ConfirmModal } from './components/ConfirmModal';
import { isAvailable } from './utils/time';

export default function App() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('ai-accounts', []);
  const [history, setHistory] = useLocalStorage<HistoryEvent[]>('ai-history', []);
  const [sortOption, setSortOption] = useState<SortOption>('next-any');
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('ai-theme', 'dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [setModalConfig, setSetModalConfig] = useState<{
    isOpen: boolean;
    account: Account | null;
    model: ModelType | null;
  }>({ isOpen: false, account: null, model: null });
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toasts, setToasts] = useState<{id: string, title: string, message: string}[]>([]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };

  const showToast = useCallback((title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const notify = useCallback((title: string, message: string) => {
    showToast(title, message);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }
  }, [showToast]);

  const addHistoryEvent = useCallback((email: string, model: ModelType, type: 'limit_reached' | 'available_again') => {
    setHistory(prev => {
      const newEvent: HistoryEvent = {
        id: crypto.randomUUID(),
        email,
        model,
        type,
        timestamp: new Date().toISOString()
      };
      return [newEvent, ...prev].slice(0, 100);
    });
  }, [setHistory]);

  // Update loop for timers and auto-reset
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      const newAccounts = accounts.map(acc => {
        let updatedAcc = { ...acc };
        
        if (updatedAcc.geminiResetDate && updatedAcc.geminiStartDate && isAvailable(updatedAcc.geminiResetDate)) {
           updatedAcc.geminiStartDate = null;
           changed = true;
           notify('Gemini Available', `Gemini is now available on ${acc.email}!`);
           addHistoryEvent(acc.email, 'gemini', 'available_again');
        }
        if (updatedAcc.claudeResetDate && updatedAcc.claudeStartDate && isAvailable(updatedAcc.claudeResetDate)) {
           updatedAcc.claudeStartDate = null;
           changed = true;
           notify('Claude Available', `Claude is now available on ${acc.email}!`);
           addHistoryEvent(acc.email, 'claude', 'available_again');
        }
        
        return updatedAcc;
      });
      
      if (changed) {
        setAccounts(newAccounts);
      }
    }, 5000); // Check every 5 seconds for better responsiveness
    
    return () => clearInterval(interval);
  }, [accounts, setAccounts, notify, addHistoryEvent]);

  // Use a faster interval just for visual countdown updates without touching localStorage if no state change
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);


  const handleAddAccount = (email: string) => {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      email,
      geminiResetDate: null,
      claudeResetDate: null,
    };
    setAccounts([...accounts, newAccount]);
    setIsAddOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const requestDeleteAccount = (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Account',
      message: `Are you sure you want to remove ${account.email}? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => handleDeleteAccount(id)
    });
  };

  const handleSetLimit = (date: string) => {
    if (!setModalConfig.account || !setModalConfig.model) return;
    
    const startDate = new Date().toISOString();

    setAccounts(accounts.map(acc => {
      if (acc.id === setModalConfig.account!.id) {
        return {
          ...acc,
          [setModalConfig.model === 'gemini' ? 'geminiResetDate' : 'claudeResetDate']: date,
          [setModalConfig.model === 'gemini' ? 'geminiStartDate' : 'claudeStartDate']: startDate
        };
      }
      return acc;
    }));
    
    addHistoryEvent(setModalConfig.account.email, setModalConfig.model, 'limit_reached');
    setSetModalConfig({ isOpen: false, account: null, model: null });
  };

  const handleClearLimit = (accountId: string, model: ModelType) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      addHistoryEvent(account.email, model, 'available_again');
    }
    
    const now = new Date().toISOString();
    
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          [model === 'gemini' ? 'geminiResetDate' : 'claudeResetDate']: now,
          [model === 'gemini' ? 'geminiStartDate' : 'claudeStartDate']: null
        };
      }
      return acc;
    }));
  };

  const requestClearLimit = (accountId: string, model: ModelType) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    setConfirmConfig({
      isOpen: true,
      title: `Mark ${model === 'gemini' ? 'Gemini' : 'Claude'} as Available`,
      message: `Are you sure you want to clear the timer and mark ${model === 'gemini' ? 'Gemini' : 'Claude'} as available for ${account.email}?`,
      isDestructive: false,
      onConfirm: () => handleClearLimit(accountId, model)
    });
  };

  const requestClearHistory = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Clear History',
      message: 'Are you sure you want to clear the usage history? This action cannot be undone.',
      isDestructive: true,
      onConfirm: () => setHistory([])
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-lg border transition-colors flex items-center justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            AI Quota Tracker
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Manage weekly limits across your Google accounts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={requestNotifications}
            className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
              notificationsEnabled 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
          
          <div className="relative group">
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 pl-10 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              <option value="next-any">Sort by: Next Available</option>
              <option value="next-gemini">Sort by: Gemini First</option>
              <option value="next-claude">Sort by: Claude First</option>
              <option value="email">Sort by: Email</option>
            </select>
            <Settings2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>

          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Usage History
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {accounts.length > 0 && (() => {
            const totalSlots = accounts.length * 2;
            const availableSlots = accounts.reduce((acc, account) => {
              let count = 0;
              if (isAvailable(account.geminiResetDate)) count++;
              if (isAvailable(account.claudeResetDate)) count++;
              return acc + count;
            }, 0);
            const progressPercent = totalSlots === 0 ? 0 : Math.round((availableSlots / totalSlots) * 100);

            return (
              <div className="mb-8 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4 md:p-5 backdrop-blur-sm shadow-sm dark:shadow-lg">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Overall Availability</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{availableSlots} of {totalSlots} models ready</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800/50">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            );
          })()}

          <main className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-2xl">
            <AccountTable 
              accounts={accounts}
              sortOption={sortOption}
              onSetLimit={(account, model) => setSetModalConfig({ isOpen: true, account, model })}
              onClearLimit={requestClearLimit}
              onDeleteAccount={requestDeleteAccount}
            />
          </main>
        </>
      )}

      {activeTab === 'history' && (
        <HistoryLog 
          history={history}
          onClear={requestClearHistory}
        />
      )}

      <AddAccountModal 
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddAccount}
      />

      <SetResetModal 
        isOpen={setModalConfig.isOpen}
        account={setModalConfig.account}
        model={setModalConfig.model}
        onClose={() => setSetModalConfig({ isOpen: false, account: null, model: null })}
        onSave={handleSetLimit}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-lg p-4 w-80 flex items-start gap-3 pointer-events-auto animate-slide-in">
            <div className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-full shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{toast.title}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1 shrink-0 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
