import React, { useState, useMemo } from 'react';
import { SubscriptionRecord } from '../../types/subscription';
import { Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export function SubscriptionList({ 
  subscriptions, 
  onEdit, 
  onDelete 
}: { 
  subscriptions: SubscriptionRecord[];
  onEdit: (sub: SubscriptionRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchSearch = (sub.platformName + ' ' + (sub.vendorName || '')).toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter ? sub.category === categoryFilter : true;
      return matchSearch && matchCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [subscriptions, search, categoryFilter]);

  const categories = useMemo(() => Array.from(new Set(subscriptions.map(s => s.category))), [subscriptions]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Billing Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Renewal</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{sub.platformName}</span>
                      {sub.websiteUrl && (
                        <a href={sub.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {sub.vendorName && <div className="text-xs text-zinc-500">{sub.vendorName}</div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{sub.category}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {sub.billingEmail ? (
                      <span className="truncate max-w-[150px] inline-block" title={sub.billingEmail}>{sub.billingEmail}</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        sub.status === 'Trial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        sub.status === 'Expired' || sub.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }
                    `}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    ${sub.totalCost} <span className="text-xs text-zinc-400">/ {sub.subscriptionType}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {sub.renewalDate ? formatDate(sub.renewalDate, false) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(sub)}
                        className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(sub.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {filtered.map(sub => (
            <div key={sub.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{sub.platformName}</span>
                    {sub.websiteUrl && (
                      <a href={sub.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-zinc-500 mt-0.5">{sub.category} {sub.vendorName && `• ${sub.vendorName}`}</div>
                  {sub.billingEmail && (
                    <div className="text-xs text-zinc-400 mt-0.5" title={sub.billingEmail}>
                      {sub.billingEmail}
                    </div>
                  )}
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                  ${sub.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    sub.status === 'Trial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                    sub.status === 'Expired' || sub.status === 'Cancelled' ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                  }
                `}>
                  {sub.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">${sub.totalCost}</span> <span className="text-xs">/ {sub.subscriptionType}</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Renewal: {sub.renewalDate ? formatDate(sub.renewalDate, false) : '-'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(sub)}
                    className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(sub.id)}
                    className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-zinc-500 text-sm">
              No subscriptions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
