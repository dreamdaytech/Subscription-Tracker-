import React from 'react';
import { Account, WifiSubscription, HistoryEvent } from '../types';
import { isAvailable } from '../utils/time';
import { Bot, Wifi, Activity, ArrowRight, Clock, Plus, Zap } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

interface HomeProps {
  accounts: Account[];
  wifiSubscriptions: WifiSubscription[];
  history: HistoryEvent[];
  onNavigate: (tab: 'dashboard' | 'history' | 'wifi') => void;
  onAddAccount: () => void;
}

export function Home({ accounts, wifiSubscriptions, history, onNavigate, onAddAccount }: HomeProps) {
  // AI Accounts Stats
  const totalAISlots = accounts.length * 2;
  let availableGemini = 0;
  let availableClaude = 0;
  accounts.forEach((account) => {
    if (isAvailable(account.geminiResetDate)) availableGemini++;
    if (isAvailable(account.claudeResetDate)) availableClaude++;
  });
  const availableSlots = availableGemini + availableClaude;
  const aiProgress = totalAISlots === 0 ? 0 : Math.round((availableSlots / totalAISlots) * 100);

  // Wifi Stats
  let activeWifi = 0;
  let expiringWifi = 0;
  let expiredWifi = 0;
  const now = new Date();
  
  wifiSubscriptions.forEach(sub => {
    const end = new Date(sub.endDate);
    if (now > end) {
      expiredWifi++;
    } else {
      activeWifi++;
      const hoursLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursLeft < 24) expiringWifi++;
    }
  });

  const recentHistory = [...history]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-blue-100 max-w-lg">
            Here's a quick overview of your tracking platform. Manage your AI account limits and Wifi subscriptions seamlessly.
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Zap className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Accounts Summary Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">AI Accounts</h3>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/80">
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Tracked Accounts</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{accounts.length}</div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/80">
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Available Models</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{availableSlots}/{totalAISlots}</div>
            </div>
          </div>

          <button 
            onClick={onAddAccount}
            className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add AI Account
          </button>
        </div>

        {/* Wifi Subscriptions Summary Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Wifi Tracking</h3>
            </div>
            <button 
              onClick={() => onNavigate('wifi')}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/80">
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Active Subs</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{activeWifi}</div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/80">
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Needs Attention</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{expiringWifi + expiredWifi}</div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('wifi')}
            className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Track New Wifi
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Activity</h3>
          </div>
          <button 
            onClick={() => onNavigate('history')}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
          >
            View History <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            No recent activity to display.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {recentHistory.map((event) => (
              <div key={event.id} className="py-3 flex items-center justify-between group">
                <div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">
                    {event.type === 'limit_reached' ? 'Limit reached for' : 'Available again for'}{' '}
                    <span className="capitalize text-blue-600 dark:text-blue-400">{event.model}</span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{event.email}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-800/50">
                  <Clock className="w-3 h-3" />
                  {formatDate(event.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
