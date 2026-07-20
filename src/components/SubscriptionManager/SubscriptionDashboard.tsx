import React, { useMemo } from 'react';
import { SubscriptionRecord } from '../../types/subscription';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

export function SubscriptionDashboard({ subscriptions }: { subscriptions: SubscriptionRecord[] }) {
  const stats = useMemo(() => {
    let totalMonthlyCost = 0;
    let totalAnnualCost = 0;
    let activeCount = 0;
    let expiredCount = 0;
    let trialCount = 0;
    let cancelledCount = 0;
    let autoRenewCount = 0;
    const categorySpending: Record<string, number> = {};
    const vendorSpending: Record<string, number> = {};

    const now = new Date().getTime();

    subscriptions.forEach(sub => {
      if (sub.status === 'Active') activeCount++;
      if (sub.status === 'Expired') expiredCount++;
      if (sub.status === 'Trial') trialCount++;
      if (sub.status === 'Cancelled') cancelledCount++;
      if (sub.autoRenewal) autoRenewCount++;

      // Approximate monthly/annual cost based on type
      let monthlyCost = 0;
      if (sub.subscriptionType === 'Monthly') monthlyCost = sub.totalCost;
      if (sub.subscriptionType === 'Annual') monthlyCost = sub.totalCost / 12;
      if (sub.subscriptionType === 'Quarterly') monthlyCost = sub.totalCost / 3;
      if (sub.subscriptionType === 'Semi Annual') monthlyCost = sub.totalCost / 6;

      totalMonthlyCost += monthlyCost;
      totalAnnualCost += monthlyCost * 12;

      categorySpending[sub.category] = (categorySpending[sub.category] || 0) + monthlyCost;
      const vendorName = sub.vendorName || sub.platformName;
      vendorSpending[vendorName] = (vendorSpending[vendorName] || 0) + monthlyCost;
    });

    const categoryData = Object.entries(categorySpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const vendorData = Object.entries(vendorSpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalMonthlyCost,
      totalAnnualCost,
      activeCount,
      expiredCount,
      trialCount,
      cancelledCount,
      autoRenewCount,
      categoryData,
      vendorData
    };
  }, [subscriptions]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const renewals = subscriptions.filter(s => s.renewalDate && s.status !== 'Cancelled').map(s => {
      const days = Math.ceil((new Date(s.renewalDate!).getTime() - now.getTime()) / (1000 * 3600 * 24));
      return { ...s, daysToRenewal: days };
    }).filter(s => s.daysToRenewal >= 0 && s.daysToRenewal <= 90)
    .sort((a, b) => a.daysToRenewal - b.daysToRenewal);
    return renewals;
  }, [subscriptions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-500 mb-1">Total Monthly Cost</div>
          <div className="text-2xl font-bold">${stats.totalMonthlyCost.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-500 mb-1">Total Annual Cost</div>
          <div className="text-2xl font-bold">${stats.totalAnnualCost.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-500 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold">{stats.activeCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-500 mb-1">Upcoming Renewals</div>
          <div className="text-2xl font-bold text-amber-500">{upcomingRenewals.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-h-[300px]">
          <h3 className="text-sm font-medium mb-4">Monthly Spend by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {stats.categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 min-h-[300px]">
          <h3 className="text-sm font-medium mb-4">Top 10 Vendors by Monthly Spend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.vendorData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {stats.vendorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {upcomingRenewals.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-4">Upcoming Renewals (Next 90 Days)</h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {upcomingRenewals.map(sub => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{sub.platformName}</div>
                  <div className="text-xs text-zinc-500">{sub.category} • {sub.subscriptionType}</div>
                  {sub.billingEmail && (
                    <div className="text-xs text-zinc-400 mt-0.5" title={sub.billingEmail}>
                      {sub.billingEmail}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm text-amber-600 dark:text-amber-500">{sub.daysToRenewal} days</div>
                  <div className="text-xs text-zinc-500">${sub.totalCost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
