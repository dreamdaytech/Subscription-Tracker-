import React, { useState } from 'react';
import { X, Tag, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { ToolCategory } from '../../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ToolCategory[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoryManagerModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;
    
    setIsSubmitting(true);
    try {
      await onAddCategory(trimmedName);
      setNewCategoryName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (category: ToolCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    try {
      await onUpdateCategory(editingId, trimmedName);
      setEditingId(null);
      setEditName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-slide-in flex flex-col">
        <div className="bg-white dark:bg-zinc-950/80 z-10 border-b border-zinc-100 dark:border-zinc-800 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Manage Categories
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-shadow"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newCategoryName.trim()}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No custom categories yet.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl group hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                  {editingId === category.id ? (
                    <div className="flex flex-1 gap-2 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdate}
                        disabled={!editName.trim()}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-zinc-700 dark:text-zinc-200 text-sm truncate pl-1">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(category.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
