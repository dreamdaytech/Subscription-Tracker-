import React, { useState } from 'react';
import { Wifi, Plus, Trash2, Clock, CalendarDays, Edit2, Search, Filter, ArrowUpDown } from 'lucide-react';
import { WifiSubscription, WifiDuration } from '../types';
import { useFirestoreData } from '../hooks/useFirestoreData';
import { auth } from '../firebase';
import { formatDate } from '../utils/formatDate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function WifiTracker() {
  const {
    data: subscriptions,
    add: addSubscription,
    update: updateSubscription,
    remove: removeSubscription
  } = useFirestoreData<WifiSubscription>(auth.currentUser, 'wifiSubscriptions');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<WifiSubscription | null>(null);
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState<WifiDuration>(1);
  const [newStartDate, setNewStartDate] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'endDate-asc' | 'endDate-desc' | 'name-asc' | 'name-desc'>('endDate-asc');
  const [, setTick] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const startDate = newStartDate || new Date();
      const endDate = new Date(startDate.getTime() + newDuration * 24 * 60 * 60 * 1000).toISOString();

      if (editingSub) {
        await updateSubscription(editingSub.id, {
          name: newName.trim(),
          durationDays: newDuration,
          startDate: startDate.toISOString(),
          endDate
        });
        setEditingSub(null);
      } else {
        await addSubscription({
          name: newName.trim(),
          durationDays: newDuration,
          startDate: startDate.toISOString(),
          endDate
        } as any);
      }
      
      setIsAddOpen(false);
      setNewName('');
      setNewDuration(1);
      setNewStartDate(new Date());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sub: WifiSubscription) => {
    setEditingSub(sub);
    setNewName(sub.name);
    setNewDuration(sub.durationDays);
    const d = new Date(sub.startDate);
    setNewStartDate(d);
    setIsAddOpen(true);
  };

  const openAddForm = () => {
    setNewStartDate(new Date());
    setIsAddOpen(true);
  };

  const closeForm = () => {
    setIsAddOpen(false);
    setEditingSub(null);
    setNewName('');
    setNewDuration(1);
    setNewStartDate(new Date());
  };

  const confirmDelete = (id: string) => {
    removeSubscription(id);
    setDeleteConfirmId(null);
  };

  const getStatus = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    if (now > end) return { label: 'Expired', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' };
    
    const hoursLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 24) return { label: 'Expiring Soon', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' };
    
    return { label: 'Active', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' };
  };

  const filteredAndSortedSubscriptions = (subscriptions || [])
    .filter(sub => {
      if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus !== 'all') {
        const status = getStatus(sub?.endDate || new Date().toISOString());
        if (filterStatus === 'expired' && status.label !== 'Expired') return false;
        if (filterStatus === 'expiring' && status.label !== 'Expiring Soon') return false;
        if (filterStatus === 'active' && status.label !== 'Active') return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      const dateA = new Date(a.endDate).getTime();
      const dateB = new Date(b.endDate).getTime();
      if (sortBy === 'endDate-asc') return dateA - dateB;
      if (sortBy === 'endDate-desc') return dateB - dateA;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
          <Wifi className="w-5 h-5 text-blue-500" />
          Wifi Subscriptions
        </h2>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search subscriptions..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-colors"
            >
              <option value="endDate-asc">Expiring First</option>
              <option value="endDate-desc">Expiring Last</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedSubscriptions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl">
            {subscriptions && subscriptions.length > 0 
              ? 'No subscriptions match your search and filters.' 
              : 'No wifi subscriptions tracked. Add one to get started!'}
          </div>
        ) : (
          filteredAndSortedSubscriptions.map(sub => {
            const status = getStatus(sub?.endDate || new Date().toISOString());
            const endDate = new Date(sub?.endDate || new Date().toISOString());
            
            return (
              <div key={sub?.id || Math.random()} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate pr-16">{sub.name}</h3>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {sub.durationDays} Day{sub.durationDays > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(sub)}
                      className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                      title="Edit Subscription"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(sub.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Subscription"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.bg} ${status.color} ${status.border} mb-4`}>
                  {status.label}
                </div>
                
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800/50 mb-4">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      status.label === 'Expired' ? 'bg-red-500' : 
                      status.label === 'Expiring Soon' ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, ((endDate.getTime() - new Date().getTime()) / (sub.durationDays * 24 * 60 * 60 * 1000)) * 100))}%` }}
                  />
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <CalendarDays className="w-4 h-4 text-zinc-400" />
                    <span>Started: {formatDate(sub.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <CalendarDays className="w-4 h-4 text-zinc-400" />
                    <span>Renews: {formatDate(endDate)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              {editingSub ? 'Edit Subscription' : 'Track Wifi Subscription'}
            </h3>
            <form onSubmit={handleAdd}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    User or Device Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John's Phone"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Start Date & Time
                  </label>
                  <div className="w-full">
                    <DatePicker
                      selected={newStartDate}
                      onChange={(date) => setNewStartDate(date || new Date())}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="dd/MM/yy HH:mm"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setNewDuration(days as WifiDuration)}
                        className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                          newDuration === days
                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {days} Day{days > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingSub ? 'Save Changes' : 'Start Tracking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Delete Subscription?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
