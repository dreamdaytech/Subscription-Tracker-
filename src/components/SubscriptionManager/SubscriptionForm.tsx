import React, { useState } from 'react';
import { SubscriptionRecord, SubscriptionCategory, SubscriptionType, SubscriptionStatus, PaymentMethodCardType, BankType } from '../../types/subscription';
import { X } from 'lucide-react';

const CATEGORIES: SubscriptionCategory[] = ['Software', 'AI', 'Domain', 'Hosting', 'Cloud', 'Email', 'Marketing', 'Finance', 'Security', 'Productivity', 'Communication', 'Storage', 'API', 'Other'];
const TYPES: SubscriptionType[] = ['Monthly', 'Quarterly', 'Semi Annual', 'Annual', 'Lifetime', 'One-Time'];
const STATUSES: SubscriptionStatus[] = ['Active', 'Trial', 'Cancelled', 'Expired', 'Suspended'];
const PAYMENT_METHODS: PaymentMethodCardType[] = ['Visa', 'Mastercard', 'American Express', 'Virtual Card', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Mobile Money', 'PayPal', 'Stripe', 'Other'];

export function SubscriptionForm({
  subscription,
  onSave,
  onClose
}: {
  subscription: SubscriptionRecord | null;
  onSave: (sub: Partial<SubscriptionRecord>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<SubscriptionRecord>>(
    subscription || {
      platformName: '',
      category: 'Software',
      subscriptionType: 'Monthly',
      status: 'Active',
      totalCost: 0,
      currency: 'USD',
      autoRenewal: true,
      billingCycle: '1',
    }
  );

  const [activeSection, setActiveSection] = useState<'basic' | 'payment' | 'renewal' | 'vendor' | 'account'>('basic');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: finalValue };
      
      const paymentDateToUse = name === 'lastPaymentDate' ? finalValue as string : newData.lastPaymentDate;
      const subTypeToUse = name === 'subscriptionType' ? finalValue as string : newData.subscriptionType;

      if ((name === 'lastPaymentDate' || name === 'subscriptionType') && paymentDateToUse) {
        const paymentDate = new Date(paymentDateToUse);
        if (!isNaN(paymentDate.getTime())) {
          let monthsToAdd = 0;
          let yearsToAdd = 0;
          switch (subTypeToUse) {
            case 'Monthly': monthsToAdd = 1; break;
            case 'Quarterly': monthsToAdd = 3; break;
            case 'Semi Annual': monthsToAdd = 6; break;
            case 'Annual': yearsToAdd = 1; break;
          }

          if (monthsToAdd > 0 || yearsToAdd > 0) {
            const expiry = new Date(paymentDate);
            expiry.setMonth(expiry.getMonth() + monthsToAdd);
            expiry.setFullYear(expiry.getFullYear() + yearsToAdd);
            newData.expiryDate = expiry.toISOString().split('T')[0];
            if (newData.autoRenewal !== false) {
              newData.renewalDate = newData.expiryDate;
            }
          }
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.platformName) return;
    onSave({
      ...formData,
      createdAt: subscription ? subscription.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col my-8 max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            {subscription ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 hide-scrollbar">
          {(['basic', 'payment', 'renewal', 'vendor', 'account'] as const).map(section => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === section
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)} Info
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeSection === 'basic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Platform Name *</label>
                <input required type="text" name="platformName" value={formData.platformName || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Category *</label>
                <select required name="category" value={formData.category || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Subscription Type *</label>
                <select required name="subscriptionType" value={formData.subscriptionType || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Status *</label>
                <select required name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Total Cost *</label>
                <input required type="number" step="0.01" name="totalCost" value={formData.totalCost || 0} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Currency *</label>
                <input required type="text" name="currency" value={formData.currency || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Website URL</label>
                <input type="url" name="websiteUrl" value={formData.websiteUrl || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 mt-4">
                <input type="checkbox" id="autoRenewal" name="autoRenewal" checked={!!formData.autoRenewal} onChange={handleChange} className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="autoRenewal" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Auto Renewal Enabled</label>
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="">Select Payment Method...</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Last 4 Digits</label>
                <input type="text" name="last4Digits" value={formData.last4Digits || ''} onChange={handleChange} placeholder="1234" maxLength={4} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Billing Email</label>
                <input type="email" name="billingEmail" value={formData.billingEmail || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
          )}

          {activeSection === 'renewal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Purchase Date</label>
                <input type="date" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Last Payment Date</label>
                <input type="date" name="lastPaymentDate" value={formData.lastPaymentDate || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Renewal Date</label>
                <input type="date" name="renewalDate" value={formData.renewalDate || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
            </div>
          )}

          {activeSection === 'vendor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Vendor Name</label>
                <input type="text" name="vendorName" value={formData.vendorName || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Vendor Support Email</label>
                <input type="email" name="vendorSupportEmail" value={formData.vendorSupportEmail || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Account Username/Email</label>
                <input type="text" name="accountUsername" value={formData.accountUsername || ''} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
              </div>
            </div>
          )}

        </form>
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            {subscription ? 'Save Changes' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
