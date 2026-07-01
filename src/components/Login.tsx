import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Sparkles, LogIn } from 'lucide-react';

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.message || 'Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Welcome</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Sign in to access your cross-device quota tracker and wifi subscriptions.
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <LogIn className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
