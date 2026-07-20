import React, { useState } from 'react';
import { useFirestoreData } from '../../hooks/useFirestoreData';
import { SubscriptionRecord } from '../../types/subscription';
import { auth } from '../../firebase';
import { SubscriptionDashboard } from './SubscriptionDashboard';
import { SubscriptionList } from './SubscriptionList';
import { SubscriptionForm } from './SubscriptionForm';
import { ConfirmModal } from '../ConfirmModal';

export function SubscriptionManager() {
  const { data: subscriptions, add, update, remove } = useFirestoreData<SubscriptionRecord>(auth.currentUser, 'general_subscriptions');
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async (sub: Partial<SubscriptionRecord>) => {
    if (editingSub) {
      await update(editingSub.id, sub);
    } else {
      await add(sub as any);
    }
    setIsFormOpen(false);
    setEditingSub(null);
  };

  const handleEdit = (sub: SubscriptionRecord) => {
    setEditingSub(sub);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      remove(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'dashboard'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === 'list'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Records
          </button>
        </div>
        
        <button
          onClick={() => {
            setEditingSub(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Subscription
        </button>
      </div>

      {view === 'dashboard' ? (
        <SubscriptionDashboard subscriptions={subscriptions} />
      ) : (
        <SubscriptionList 
          subscriptions={subscriptions} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {isFormOpen && (
        <SubscriptionForm
          subscription={editingSub}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSub(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={confirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
