import React, { useState } from 'react';
import { ArrowLeft, Star, AlertCircle, Split, Search } from 'lucide-react';
import { BEST_LOADOUTS } from '../constants';

interface BestLoadoutsViewProps {
  onBack: () => void;
  initialSearch?: string;
}

export const BestLoadoutsView: React.FC<BestLoadoutsViewProps> = ({ onBack, initialSearch = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filteredLoadouts = BEST_LOADOUTS.filter(loadout => 
    loadout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loadout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loadout.enchantments.some(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                 <Star className="text-purple-400" size={24} />
               </div>
               <div>
                 <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                   Best Enchantments
                 </h1>
                 <p className="text-xs text-zinc-400">Optimal enchantment combinations for every slot</p>
               </div>
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text"
                    placeholder="Search loadouts..."
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
          filteredLoadouts.map((loadout) => (
            <div key={loadout.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg hover:border-zinc-700 transition-colors">
              {/* Card Header */}
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-zinc-950 rounded-lg text-purple-400 border border-zinc-800 shadow-inner">
                  <loadout.icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{loadout.name}</h2>
                  <p className="text-xs text-zinc-400">{loadout.description}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="space-y-2">
                  {loadout.enchantments.map((ench, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded ${ench.isChoice ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-zinc-950/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${ench.isChoice ? 'text-amber-200' : 'text-zinc-200'}`}>
                          {ench.name}
                        </span>
                        {ench.level && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {ench.level}
                          </span>
                        )}
                        {ench.isChoice && (
                          <span title="Mutually exclusive choice" className="flex items-center">
                            <Split size={14} className="text-amber-500" />
                          </span>
                        )}
                      </div>
                      {ench.note && (
                        <span className="text-xs text-zinc-500 italic ml-2 text-right">
                          {ench.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {loadout.alternatives && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3 text-xs text-blue-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{loadout.alternatives}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-zinc-500">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>No loadouts found for "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
};