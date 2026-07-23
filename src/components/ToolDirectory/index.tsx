import React, { useState, useMemo } from 'react';
import { Plus, Search, Folder, Settings2, Filter } from 'lucide-react';
import { useFirestoreData } from '../../hooks/useFirestoreData';
import { ResourceTool, ToolCategory } from '../../types';
import { auth } from '../../firebase';
import { ToolCard } from './ToolCard';
import { ToolFormModal } from './ToolFormModal';
import { ConfirmModal } from '../ConfirmModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export function ToolDirectory() {
  const {
    data: tools,
    add: addTool,
    update: updateTool,
    remove: removeTool,
  } = useFirestoreData<ResourceTool>(auth.currentUser, 'tools');

  const {
    data: customCategories,
    add: addCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useFirestoreData<ToolCategory>(auth.currentUser, 'toolCategories');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'newest' | 'oldest'>('name-asc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ResourceTool | null>(null);
  
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; type?: 'tool' | 'category' }>({ 
    isOpen: false, 
    id: '',
    type: 'tool'
  });

  const categoriesForFilter = useMemo(() => {
    const cats = new Set<string>();
    tools.forEach(t => cats.add(t.category));
    customCategories.forEach(c => cats.add(c.name));
    return ['All', ...Array.from(cats).sort()];
  }, [tools, customCategories]);

  const categoriesForForm = useMemo(() => {
    const cats = new Set<string>();
    tools.forEach(t => cats.add(t.category));
    customCategories.forEach(c => cats.add(c.name));
    if (cats.size === 0) cats.add('Uncategorized');
    return Array.from(cats).sort();
  }, [tools, customCategories]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    tools.forEach(t => {
      if (t.tags) t.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tools]);

  const availablePricing = useMemo(() => {
    const models = new Set<string>();
    tools.forEach(t => {
      if (t.pricingModel) models.add(t.pricingModel);
    });
    return ['All', ...Array.from(models).sort()];
  }, [tools]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.tags && tool.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (tool.details && tool.details.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || (tool.tags && selectedTags.some(tag => tool.tags!.includes(tag)));
      const matchesPricing = selectedPricing === 'All' || tool.pricingModel === selectedPricing;
      
      return matchesSearch && matchesCategory && matchesTags && matchesPricing;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return 0;
    });
  }, [tools, searchQuery, selectedCategory, selectedTags, selectedPricing, sortBy]);

  const handleSaveTool = async (toolData: Partial<ResourceTool>) => {
    if (editingTool) {
      await updateTool(editingTool.id, toolData);
    } else {
      await addTool({
        ...toolData,
        createdAt: new Date().toISOString()
      } as any);
    }
    setIsFormOpen(false);
    setEditingTool(null);
  };

  const openAddForm = () => {
    setEditingTool(null);
    setIsFormOpen(true);
  };

  const openEditForm = (tool: ResourceTool) => {
    setEditingTool(tool);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, type: 'tool' | 'category' = 'tool') => {
    if (type === 'tool') {
      removeTool(id);
    } else {
      removeCategory(id);
    }
    setConfirmDelete({ isOpen: false, id: '', type: 'tool' });
  };

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm dark:shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-500" />
            Tool Directory
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your AI tools, useful websites, and resources in one place.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="p-2.5 rounded-lg border transition-colors flex items-center justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Manage Categories"
          >
            <Settings2 className="w-5 h-5" />
          </button>
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Resource</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search resources, descriptions, details, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-shadow"
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${showAdvanced ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Filters & Sort</span>
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mb-6 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 animate-slide-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Pricing Model</label>
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              >
                {availablePricing.map(price => (
                  <option key={price} value={price}>{price}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.length === 0 ? (
                  <span className="text-sm text-zinc-500 dark:text-zinc-500 italic mt-1">No tags available.</span>
                ) : (
                  availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categoriesForFilter.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">No resources found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' 
              ? "We couldn't find any tools matching your filters. Try adjusting your search."
              : "You haven't added any resources yet. Click 'Add Resource' to get started."}
          </p>
          {(!searchQuery && selectedCategory === 'All') && (
            <button 
              onClick={openAddForm}
              className="mt-6 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline"
            >
              Add your first resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onEdit={openEditForm}
              onDelete={(id) => setConfirmDelete({ isOpen: true, id, type: 'tool' })}
            />
          ))}
        </div>
      )}

      <ToolFormModal 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTool(null);
        }}
        onSave={handleSaveTool}
        initialData={editingTool}
        categories={categoriesForForm}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={customCategories}
        onAddCategory={async (name) => { await addCategory({ name } as any); }}
        onUpdateCategory={async (id, name) => { await updateCategory(id, { name }); }}
        onDeleteCategory={(id) => {
          setConfirmDelete({ isOpen: true, id, type: 'category' });
        }}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.type === 'tool' ? "Delete Resource" : "Delete Category"}
        message={
          confirmDelete.type === 'tool'
            ? "Are you sure you want to remove this resource? This action cannot be undone."
            : "Are you sure you want to remove this category? Resources currently using this category will not be modified."
        }
        isDestructive={true}
        onConfirm={() => handleDelete(confirmDelete.id, confirmDelete.type)}
        onClose={() => setConfirmDelete({ isOpen: false, id: '', type: 'tool' })}
      />
    </div>
  );
}
