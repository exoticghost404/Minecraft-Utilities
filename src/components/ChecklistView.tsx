import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, LayoutGrid, CheckCircle2, ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { CheckedState } from '../types';
import { CategorySection } from './CategorySection';
import { ConfirmationModal } from './ConfirmationModal';

interface ChecklistViewProps {
  onBack: () => void;
  initialSearch?: string;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ onBack, initialSearch = '' }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [checkedState, setCheckedState] = useState<CheckedState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('minecraft_checklist_v1');
    if (saved) {
      try {
        setCheckedState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('minecraft_checklist_v1', JSON.stringify(checkedState));
    }
  }, [checkedState, isLoaded]);

  const toggleItem = (id: string) => {
    setCheckedState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleResetConfirm = () => {
    setCheckedState({});
    // Optional: Clear search query on reset
    // setSearchQuery(''); 
  };

  // Calculate Global Progress
  const calculateProgress = () => {
    let total = 0;
    let checked = 0;
    
    CATEGORIES.forEach(cat => {
      cat.groups.forEach(group => {
        group.items.forEach(item => {
          total++;
          if (checkedState[item.id]) checked++;
        });
      });
    });

    return total === 0 ? 0 : Math.round((checked / total) * 100);
  };

  const globalProgress = calculateProgress();

  // Filter Categories based on Tab and Search
  const displayCategories = CATEGORIES.filter(cat => {
    if (activeTab !== 'all' && cat.id !== activeTab) return false;
    
    // If searching, only show categories that contain the match
    if (searchQuery.trim() !== '') {
      return cat.groups.some(group => 
        group.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
            <button 
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
               <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                 <CheckCircle2 className="text-emerald-400" size={24} />
               </div>
               <div>
                 <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                   Enchantment Tracker
                 </h1>
                 <p className="text-xs text-zinc-400 hidden sm:block">Track your collection</p>
               </div>
            </div>

            <div className="flex items-center gap-4 flex-1 md:justify-end">
              {/* Progress Bar (Header) */}
              <div className="hidden sm:flex flex-col items-end w-32 md:w-48">
                <div className="flex justify-between w-full text-xs mb-1">
                  <span className="text-zinc-400">Completion</span>
                  <span className="text-emerald-400 font-bold">{globalProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${globalProgress}%` }} 
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-red-100 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all text-sm font-medium"
                title="Reset All"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Search checklist (e.g., Mending, Sharpness)..."
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={!!initialSearch}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === 'all' 
                    ? 'bg-zinc-100 text-zinc-900 shadow-md' 
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                `}
              >
                <LayoutGrid size={16} /> All
              </button>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                      ${activeTab === cat.id 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                    `}
                  >
                    <Icon size={16} /> {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {displayCategories.length > 0 ? (
          displayCategories.map(category => (
            <CategorySection
              key={category.id}
              category={category}
              checkedState={checkedState}
              onToggleItem={toggleItem}
              searchQuery={searchQuery}
            />
          ))
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No enchantments found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-emerald-500 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        title="Reset Checklist?"
        message="Are you sure? This will uncheck all your enchantments."
      />
    </div>
  );
};