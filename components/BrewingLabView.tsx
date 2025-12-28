
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, FlaskConical, Beaker, Zap, Timer, Flame, Droplets, Sparkles, ChevronRight, Info, Clock } from 'lucide-react';
import { POTION_RECIPES } from '../constants';
import { PotionRecipe } from '../types';

interface BrewingLabViewProps {
  onBack: () => void;
}

export const BrewingLabView: React.FC<BrewingLabViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPotion, setSelectedPotion] = useState<PotionRecipe | null>(null);
  const [splash, setSplash] = useState(false);
  const [lingering, setLingering] = useState(false);
  const [extended, setExtended] = useState(false);
  const [level2, setLevel2] = useState(false);

  const filteredPotions = useMemo(() => {
    return POTION_RECIPES.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.effect.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectPotion = (potion: PotionRecipe) => {
    setSelectedPotion(potion);
    if (!potion.modifiers.extended) setExtended(false);
    if (!potion.modifiers.level2) setLevel2(false);
    if (!potion.modifiers.splash) setSplash(false);
    if (!potion.modifiers.lingering) setLingering(false);
  };

  const finalDuration = useMemo(() => {
    if (!selectedPotion || !selectedPotion.baseDuration || selectedPotion.baseDuration === '-' || selectedPotion.baseDuration === 'Instant') {
        return selectedPotion?.baseDuration || '-';
    }

    // Common duration mappings (Standard -> Extended / Level II)
    const durationMap: Record<string, { ext: string, ii: string }> = {
        '3:00': { ext: '8:00', ii: '1:30' },
        '1:30': { ext: '4:00', ii: '0:45' },
        '0:45': { ext: '2:00', ii: '0:22' },
        '0:20': { ext: '0:40', ii: '0:20' }
    };

    const entry = durationMap[selectedPotion.baseDuration];
    let time = selectedPotion.baseDuration;
    if (entry) {
        if (extended) time = entry.ext;
        if (level2) time = entry.ii;
    }

    // Splash reduces lingering duration significantly
    if (lingering) {
        // Lingering is 1/4 the duration of drinkable/splash
        const parts = time.split(':');
        const totalSecs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        const lingeringSecs = Math.floor(totalSecs / 4);
        const m = Math.floor(lingeringSecs / 60);
        const s = lingeringSecs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    return time;
  }, [selectedPotion, extended, level2, lingering]);

  const finalSteps = useMemo(() => {
    if (!selectedPotion) return [];
    const steps = [...selectedPotion.ingredients];
    if (extended) steps.push('Redstone Dust');
    if (level2) steps.push('Glowstone Dust');
    if (splash || lingering) steps.push('Gunpowder');
    if (lingering) steps.push("Dragon's Breath");
    return steps;
  }, [selectedPotion, extended, level2, splash, lingering]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Tools
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
               <FlaskConical className="text-cyan-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                 Brewing Lab
               </h1>
               <p className="text-xs text-zinc-400">Interactive Minecraft Brewing Guide</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text"
                    placeholder="Search potions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 outline-none focus:border-cyan-500 transition-all"
                />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm max-h-[600px] flex flex-col">
                <div className="p-3 bg-zinc-800/50 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Potions</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredPotions.map(p => (
                        <button
                            key={p.id}
                            onClick={() => selectPotion(p)}
                            className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b border-zinc-800/50 hover:bg-zinc-800 ${selectedPotion?.id === p.id ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500' : ''}`}
                        >
                            <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${selectedPotion?.id === p.id ? 'text-cyan-400' : 'text-zinc-500'}`}><Beaker size={18} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-zinc-200">{p.name}</div>
                                <div className="text-xs text-zinc-500 truncate">{p.effect}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="lg:col-span-8">
            {selectedPotion ? (
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-1">
                                    Potion of {selectedPotion.name}
                                    {level2 && " II"}
                                    {extended && " (Extended)"}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <p className="text-cyan-400 font-medium flex items-center gap-2">
                                        <Sparkles size={16} /> {selectedPotion.effect}
                                    </p>
                                    <p className="text-zinc-400 font-bold flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-sm">
                                        <Clock size={14} className="text-emerald-400" /> Duration: <span className="text-white font-mono">{finalDuration}</span>
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {lingering ? (
                                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase rounded">Lingering</span>
                                    ) : splash ? (
                                        <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase rounded">Splash</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase rounded">Drinkable</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 grid grid-cols-2 gap-3 min-w-[240px]">
                                <button onClick={() => { if (level2) setLevel2(false); setExtended(!extended); }} disabled={!selectedPotion.modifiers.extended} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${extended ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed'}`}><Timer size={14} /> Extended</button>
                                <button onClick={() => { if (extended) setExtended(false); setLevel2(!level2); }} disabled={!selectedPotion.modifiers.level2} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${level2 ? 'bg-amber-600 border-amber-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed'}`}><Zap size={14} /> Level II</button>
                                <button onClick={() => { if (lingering) setLingering(false); setSplash(!splash); }} disabled={!selectedPotion.modifiers.splash} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${splash ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed'}`}><Droplets size={14} /> Splash</button>
                                <button onClick={() => { if (splash) setSplash(false); setLingering(!lingering); }} disabled={!selectedPotion.modifiers.lingering} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${lingering ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed'}`}><Flame size={14} /> Lingering</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative shadow-inner">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2"><Beaker size={14} /> Brewing Sequence</h3>
                        <div className="space-y-8 relative">
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-zinc-800 to-zinc-800/0" />
                            <div className="flex items-center gap-6 group relative z-10">
                                <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-cyan-500 transition-all"><Droplets size={20} /></div>
                                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-1 shadow-sm">
                                    <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Step 1: Base</div>
                                    <div className="text-white font-bold">{selectedPotion.base}</div>
                                </div>
                            </div>
                            {finalSteps.map((ingredient, idx) => (
                                <div key={idx} className="flex items-center gap-6 group relative z-10 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                                    <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"><ChevronRight size={20} /></div>
                                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-1 hover:border-cyan-500/30 transition-all">
                                        <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Add Ingredient</div>
                                        <div className="text-white font-bold flex items-center justify-between">
                                            {ingredient}
                                            {ingredient === 'Nether Wart' && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 rounded uppercase">Hellish</span>}
                                            {ingredient === 'Redstone Dust' && <span className="text-[10px] text-red-500 bg-red-500/10 px-1.5 rounded uppercase">Extended</span>}
                                            {ingredient === 'Glowstone Dust' && <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 rounded uppercase">Enhanced</span>}
                                            {['Stone Block', 'Slime Block', 'Cobweb', 'Breeze Rod'].includes(ingredient) && <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 rounded uppercase">1.21 Trial</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center gap-6 group relative z-10 animate-in zoom-in-95 duration-500" style={{ animationDelay: `${(finalSteps.length + 1) * 100}ms` }}>
                                <div className="w-10 h-10 rounded-full bg-cyan-600 border-2 border-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"><FlaskConical size={20} /></div>
                                <div className="bg-gradient-to-r from-cyan-900/20 to-zinc-900 border border-cyan-500/30 p-5 rounded-2xl flex-1 shadow-lg">
                                    <div className="text-xs text-cyan-500 font-black uppercase mb-1 tracking-wider">Result</div>
                                    <div className="text-xl font-black text-white">
                                        Potion of {selectedPotion.name}
                                        {level2 && " II"}
                                        {extended && " (Extended)"}
                                        {lingering ? " (Lingering)" : splash ? " (Splash)" : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-500 italic"><Info size={16} className="shrink-0 text-cyan-500" /><p>Note: Thick and Mundane potions are usually failures. Awkward potions are the correct base for all effect potions except Weakness.</p></div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                    <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 mb-6"><FlaskConical size={48} className="opacity-20 text-cyan-400" /></div>
                    <p className="text-lg font-bold text-zinc-400">Select a potion from the left</p>
                    <p className="text-sm mt-2 max-w-xs text-center opacity-60">Unlock step-by-step visual recipes for every potion including durations.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
