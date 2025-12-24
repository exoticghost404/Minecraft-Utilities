
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, AlertCircle, Split, Search, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { BEST_LOADOUTS } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

interface BestLoadoutsViewProps {
  onBack: () => void;
  initialSearch?: string;
}

export const BestLoadoutsView: React.FC<BestLoadoutsViewProps> = ({ onBack, initialSearch = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('mc_gear_progress_v1');
    if (saved) {
      try {
        setGearChecked(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gear progress", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save progress
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mc_gear_progress_v1', JSON.stringify(gearChecked));
    }
  }, [gearChecked, isLoaded]);

  const toggleGearEnchant = (loadoutId: string, enchName: string) => {
    const key = `${loadoutId}-${enchName}`;
    setGearChecked(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetConfirm = () => {
    setGearChecked({});
  };

  const filteredLoadouts = BEST_LOADOUTS.filter(loadout => 
    loadout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loadout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loadout.enchantments.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
            >
                <ArrowLeft size={16} /> Back to Menu
            </button>

            <button 
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-red-100 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
                title="Reset All Progress"
            >
                <RotateCcw size={14} />
                <span>Reset Progress</span>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                 <Star className="text-purple-400" size={24} />
               </div>
               <div>
                 <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                   Best Enchantments
                 </h1>
                 <p className="text-xs text-zinc-400">Track progress for your perfect loadouts</p>
               </div>
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text"
                    placeholder="Search loadouts or enchants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={!!initialSearch}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 outline-none focus:border-purple-500 transition-colors"
                />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLoadouts.length > 0 ? (
          filteredLoadouts.map((loadout) => {
            const totalEnchs = loadout.enchantments.length;
            const checkedCount = loadout.enchantments.filter(e => gearChecked[`${loadout.id}-${e.name}`]).length;
            const progress = (checkedCount / totalEnchs) * 100;
            const isComplete = checkedCount === totalEnchs;

            return (
              <div 
                key={loadout.id} 
                className={`bg-zinc-900 border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isComplete ? 'border-emerald-500/40 shadow-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner ${isComplete ? 'text-emerald-400' : 'text-purple-400'}`}>
                        <loadout.icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-100">{loadout.name}</h2>
                        <p className="text-xs text-zinc-400">{loadout.description}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-zinc-500">
                      {checkedCount}/{totalEnchs}
                    </div>
                  </div>
                  
                  {/* Card Progress Bar */}
                  <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="space-y-1">
                    {loadout.enchantments.map((ench, index) => {
                      const isChecked = !!gearChecked[`${loadout.id}-${ench.name}`];
                      return (
                        <div 
                          key={index} 
                          onClick={() => toggleGearEnchant(loadout.id, ench.name)}
                          className={`
                            group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer
                            ${isChecked 
                              ? 'bg-emerald-950/20 border-emerald-900/30' 
                              : ench.isChoice 
                                ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' 
                                : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-colors ${isChecked ? 'text-emerald-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
                              {isChecked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm transition-all ${
                                isChecked ? 'text-zinc-500 line-through' : ench.isChoice ? 'text-amber-200' : 'text-zinc-200'
                              }`}>
                                {ench.name}
                              </span>
                              {ench.level && !isChecked && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700 uppercase font-bold">
                                  {ench.level}
                                </span>
                              )}
                              {ench.isChoice && !isChecked && (
                                <Split size={14} className="text-amber-500" />
                              )}
                            </div>
                          </div>
                          {ench.note && !isChecked && (
                            <span className="text-[10px] text-zinc-600 italic ml-2 text-right">
                              {ench.note}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {loadout.alternatives && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3 text-[11px] text-blue-400/80">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <p>{loadout.alternatives}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-zinc-500">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>No loadouts found for "{searchQuery}"</p>
          </div>
        )}
      </main>

      <ConfirmationModal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        title="Reset Gear Progress?"
        message="This will clear all checked enchantments across all your gear loadouts. This action cannot be undone."
      />
    </div>
  );
};
