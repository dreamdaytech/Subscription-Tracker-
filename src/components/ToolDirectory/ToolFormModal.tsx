import React, { useState, useEffect } from 'react';
import { X, Globe, Save } from 'lucide-react';
import { ResourceTool } from '../../types';

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Partial<ResourceTool>) => Promise<void>;
  initialData?: ResourceTool | null;
  categories: string[];
}

export function ToolFormModal({ isOpen, onClose, onSave, initialData, categories }: ToolFormModalProps) {
  const [formData, setFormData] = useState<Partial<ResourceTool>>({
    name: '',
    url: '',
    category: '',
    description: '',
    details: '',
    pricingModel: '',
    loginNotes: '',
    tags: []
  });
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setTagsInput(initialData.tags?.join(', ') || '');
      } else {
        setFormData({
          name: '',
          url: '',
          category: categories.length > 0 ? categories[0] : 'Uncategorized',
          description: '',
          details: '',
          pricingModel: '',
          loginNotes: '',
          tags: []
        });
        setTagsInput('');
      }
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      await onSave({ ...formData, tags });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-slide-in">
        <div className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 border-b border-zinc-100 dark:border-zinc-800 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {initialData ? 'Edit Resource' : 'Add New Resource'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
                placeholder="e.g., ChatGPT"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category || (categories.length > 0 ? categories[0] : 'Uncategorized')}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Pricing Model
              </label>
              <input
                type="text"
                value={formData.pricingModel || ''}
                onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
                placeholder="e.g., Free, Freemium, $20/mo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Short Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
              placeholder="A brief 1-sentence summary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
              placeholder="e.g., ai, coding, helpful"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Login Notes
            </label>
            <input
              type="text"
              value={formData.loginNotes || ''}
              onChange={(e) => setFormData({ ...formData, loginNotes: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
              placeholder="e.g., Use company Google account"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Detailed Notes
            </label>
            <textarea
              rows={4}
              value={formData.details || ''}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow resize-none"
              placeholder="Detailed explanation of what this tool is used for..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
