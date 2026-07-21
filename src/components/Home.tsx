import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Wifi } from 'lucide-react';

interface HomeProps {
  onLoginClick: () => void;
}

export function Home({ onLoginClick }: HomeProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xl">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <span>SubscriptionTracker</span>
        </div>
        <button 
          onClick={onLoginClick}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto w-full py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Smart Quota Management</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">
          Track Your Subscriptions & <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            AI Limits Seamlessly
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl">
          A unified dashboard to monitor your Claude & Gemini quotas, track WiFi renewals, and stay in control of your digital subscriptions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors shadow-lg shadow-blue-500/25"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left w-full">
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Track Quotas</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Monitor your AI usage limits across multiple accounts and never hit a sudden paywall.</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Manage WiFi</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Keep track of your WiFi subscriptions, renewal dates, and duration with visual progress bars.</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Secure Access</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Log in securely with your Google account. Your data is synced and backed up safely in the cloud.</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 mb-16 w-full text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-12 md:gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent -z-10"></div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-4 border-zinc-50 dark:border-zinc-950">1</div>
                <ShieldCheck className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Secure Login</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">Sign in instantly using your Google account. Your data is privately synced.</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-4 border-zinc-50 dark:border-zinc-950">2</div>
                <Clock className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Track Usage</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">Log when you hit limits on Claude or Gemini. Visual timers show when they reset.</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-4 border-zinc-50 dark:border-zinc-950">3</div>
                <Sparkles className="w-7 h-7 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Stay Updated</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">Receive browser notifications the moment your AI quotas are available again.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
