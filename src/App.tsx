import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bell, BellOff, Settings2, Sparkles, X, Sun, Moon, LogOut } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Account, ModelType, SortOption, HistoryEvent } from './types';
import { AccountTable } from './components/AccountTable';
import { HistoryLog } from './components/HistoryLog';
import { WifiTracker } from './components/WifiTracker';
import { AddAccountModal } from './components/AddAccountModal';
import { SetResetModal } from './components/SetResetModal';
import { ConfirmModal } from './components/ConfirmModal';
import { isAvailable } from './utils/time';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { SubscriptionManager } from './components/SubscriptionManager';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useFirestoreData } from './hooks/useFirestoreData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: accounts,
    add: addAccountRef,
    update: updateAccount,
    remove: removeAccount,
  } = useFirestoreData<Account>(user, 'accounts');

  const {
    data: history,
    add: addHistoryRef,
    clear: clearHistory,
  } = useFirestoreData<HistoryEvent>(user, 'history');

  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('ai-theme', 'dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'wifi' | 'subscriptions'>('dashboard');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
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
    if (!user) return;
    addHistoryRef({
      email,
      model,
      type,
      timestamp: new Date().toISOString()
    } as any);
  }, [user, addHistoryRef]);

  // Update loop for timers and auto-reset
  useEffect(() => {
    const interval = setInterval(() => {
      accounts.forEach(acc => {
        let changed = false;
        let updates: Partial<Account> = {};
        
        if (acc.geminiResetDate && acc.geminiStartDate && isAvailable(acc.geminiResetDate)) {
           updates.geminiStartDate = null;
           changed = true;
           notify('Gemini Available', `Gemini is now available on ${acc.email}!`);
           addHistoryEvent(acc.email, 'gemini', 'available_again');
        }
        if (acc.claudeResetDate && acc.claudeStartDate && isAvailable(acc.claudeResetDate)) {
           updates.claudeStartDate = null;
           changed = true;
           notify('Claude Available', `Claude is now available on ${acc.email}!`);
           addHistoryEvent(acc.email, 'claude', 'available_again');
        }
        
        if (changed) {
          updateAccount(acc.id, updates);
        }
      });
    }, 5000); // Check every 5 seconds for better responsiveness
    
    return () => clearInterval(interval);
  }, [accounts, updateAccount, notify, addHistoryEvent]);

  // Use a faster interval just for visual countdown updates without touching db if no state change
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveAccount = async (email: string) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, { email });
      setEditingAccount(null);
    } else {
      await addAccountRef({
        email,
        geminiResetDate: null,
        claudeResetDate: null,
      } as any);
    }
    setIsAddOpen(false);
  };

  const openAddForm = () => {
    setEditingAccount(null);
    setIsAddOpen(true);
  };

  const openEditForm = (account: Account) => {
    setEditingAccount(account);
    setIsAddOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    removeAccount(id);
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
    
    updateAccount(setModalConfig.account.id, {
      [setModalConfig.model === 'gemini' ? 'geminiResetDate' : 'claudeResetDate']: date,
      [setModalConfig.model === 'gemini' ? 'geminiStartDate' : 'claudeStartDate']: startDate
    });
    
    addHistoryEvent(setModalConfig.account.email, setModalConfig.model, 'limit_reached');
    setSetModalConfig({ isOpen: false, account: null, model: null });
  };

  const handleClearLimit = (accountId: string, model: ModelType) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      addHistoryEvent(account.email, model, 'available_again');
    }
    
    const now = new Date().toISOString();
    updateAccount(accountId, {
      [model === 'gemini' ? 'geminiResetDate' : 'claudeResetDate']: now,
      [model === 'gemini' ? 'geminiStartDate' : 'claudeStartDate']: null
    });
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
      onConfirm: () => clearHistory()
    });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;
  }

  if (!user) {
    return showLogin ? (
      <Login onBack={() => setShowLogin(false)} />
    ) : (
      <Home onLoginClick={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Subscription Tracker
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 ml-2 rounded-md border transition-colors flex items-center justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => signOut(auth)}
              className="p-1.5 ml-2 rounded-md border transition-colors flex items-center justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Manage weekly limits across your accounts and track active subscriptions.</p>
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

          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Usage History
        </button>
        <button
          onClick={() => setActiveTab('wifi')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'wifi'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Wifi Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'subscriptions'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          General Subscriptions
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {(accounts || []).length > 0 && (() => {
            const totalSlots = (accounts || []).length * 2;
            let availableGemini = 0;
            let availableClaude = 0;
            const availableSlots = (accounts || []).reduce((acc, account) => {
              let count = 0;
              if (isAvailable(account.geminiResetDate)) {
                count++;
                availableGemini++;
              }
              if (isAvailable(account.claudeResetDate)) {
                count++;
                availableClaude++;
              }
              return acc + count;
            }, 0);
            const progressPercent = totalSlots === 0 ? 0 : Math.round((availableSlots / totalSlots) * 100);

            return (
              <div className="mb-8 flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4 md:p-5 backdrop-blur-sm shadow-sm dark:shadow-lg">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Overall Availability</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{availableSlots} of {totalSlots} models available</p>
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
                
                <div className="flex gap-2 sm:gap-4 md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-6 shrink-0">
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-lg p-2 sm:p-3 flex-1">
                    <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Emails</div>
                    <div className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-200">{accounts.length}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-lg p-2 sm:p-3 flex-1">
                    <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-1">Claude Available</div>
                    <div className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-200">{availableClaude}</div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-lg p-2 sm:p-3 flex-1">
                    <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-1">Gemini Available</div>
                    <div className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-200">{availableGemini}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <main className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-2xl">
            <AccountTable 
              accounts={accounts}
              onSetLimit={(account, model) => setSetModalConfig({ isOpen: true, account, model })}
              onClearLimit={requestClearLimit}
              onDeleteAccount={requestDeleteAccount}
              onEditAccount={openEditForm}
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

      {activeTab === 'wifi' && (
        <WifiTracker />
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionManager />
      )}

      <AddAccountModal 
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        existingEmails={accounts.map(a => a.email)}
        initialEmail={editingAccount?.email}
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
