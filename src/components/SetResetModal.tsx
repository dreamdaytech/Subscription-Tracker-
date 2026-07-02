import React, { useState, useEffect } from 'react';
import { Account, ModelType } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SetResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string) => void;
  account: Account | null;
  model: ModelType | null;
}

export function SetResetModal({ isOpen, onClose, onSave, account, model }: SetResetModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Set default to existing date or 7 days from now when opened
  useEffect(() => {
    if (isOpen && account && model) {
      const existingDate = model === 'gemini' ? account.geminiResetDate : account.claudeResetDate;
      let d;
      if (existingDate && new Date(existingDate).getTime() > Date.now()) {
        d = new Date(existingDate);
      } else {
        d = new Date();
        d.setDate(d.getDate() + 7);
      }
      setSelectedDate(d);
    }
  }, [isOpen, account, model]);

  if (!isOpen || !account || !model) return null;

  const handleSave = () => {
    if (!selectedDate) return;
    onSave(selectedDate.toISOString());
  };

  const setPreset = (days: number, hours: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    setSelectedDate(d);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">Limit Reached</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Set when <span className="capitalize text-zinc-800 dark:text-zinc-200">{model}</span> on <span className="font-medium text-zinc-800 dark:text-zinc-200">{account.email}</span> will reset.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Exact Date & Time</label>
          <div className="w-full">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="dd/MM/yy HH:mm"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              wrapperClassName="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => setPreset(7, 0)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 rounded-md transition-colors">1 Week</button>
            <button onClick={() => setPreset(1, 0)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 rounded-md transition-colors">1 Day</button>
            <button onClick={() => setPreset(0, 12)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 rounded-md transition-colors">12 Hours</button>
            <button onClick={() => setPreset(0, 4)} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 rounded-md transition-colors">4 Hours</button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedDate}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  );
}
