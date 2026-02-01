import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckSquare, Sparkles, Calculator, Notebook, Globe, Flame, Search, Download, Youtube, Twitch, Instagram, FlaskConical, Settings } from 'lucide-react';
import { ChecklistView } from './components/ChecklistView';
import { BestLoadoutsView } from './components/BestLoadoutsView';
import { EnchantmentCalculatorView } from './components/EnchantmentCalculatorView';
import { NotesView } from './components/NotesView';
import { ExternalToolsView, TOOLS } from './components/ExternalToolsView';
import { NetherCalculatorView } from './components/NetherCalculatorView';
import { BrewingLabView } from './components/BrewingLabView';
import { SettingsView } from './components/SettingsView';
import { CircleGeneratorView } from './components/CircleGeneratorView';
import { CATEGORIES, BEST_LOADOUTS, POTION_RECIPES } from './constants';

type ViewMode = 'home' | 'checklist' | 'guide' | 'calculator' | 'notes' | 'tools' | 'nether' | 'brewing' | 'settings' | 'circle';

const MENU_ITEMS = [
  {
    id: 'checklist',
    title: 'Checklist',
    description: 'Track collected enchantments and monitor progress.',
    icon: CheckSquare,
    view: 'checklist',
    theme: {
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
      gradient: 'from-emerald-500/10',
      iconBg: 'bg-emerald-500/10',
      iconBorder: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      titleHover: 'group-hover:text-emerald-300'
    }
  },
  {
    id: 'guide',
    title: 'Best Enchantments',
    description: 'Optimal combinations for every gear slot.',
    icon: BookOpen,
    view: 'guide',
    theme: {
      hoverBorder: 'hover:border-purple-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
      gradient: 'from-purple-500/10',
      iconBg: 'bg-purple-500/10',
      iconBorder: 'border-purple-500/20',
      iconColor: 'text-purple-400',
      titleHover: 'group-hover:text-purple-300'
    }
  },
  {
    id: 'calculator',
    title: 'Anvil Calculator',
    description: 'Plan order to minimize XP costs.',
    icon: Calculator,
    view: 'calculator',
    theme: {
      hoverBorder: 'hover:border-amber-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
      gradient: 'from-amber-500/10',
      iconBg: 'bg-amber-500/10',
      iconBorder: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      titleHover: 'group-hover:text-amber-300'
    }
  },
  {
    id: 'nether',
    title: 'Nether Calculator',
    description: 'Convert Overworld coordinates to Nether.',
    icon: Flame,
    view: 'nether',
    theme: {
      hoverBorder: 'hover:border-red-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]',
      gradient: 'from-red-500/10',
      iconBg: 'bg-red-500/10',
      iconBorder: 'border-red-500/20',
      iconColor: 'text-red-400',
      titleHover: 'group-hover:text-red-300'
    }
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Save coords, to-dos, and ideas.',
    icon: Notebook,
    view: 'notes',
    theme: {
      hoverBorder: 'hover:border-blue-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
      gradient: 'from-blue-500/10',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      titleHover: 'group-hover:text-blue-300'
    }
  },
  {
    id: 'tools',
    title: 'More Tools',
    description: 'Brewing, seed maps, armor trims, and more.',
    icon: Globe,
    view: 'tools',
    theme: {
      hoverBorder: 'hover:border-indigo-500/50',
      hoverShadow: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
      gradient: 'from-indigo-500/10',
      iconBg: 'bg-indigo-500/10',
      iconBorder: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
      titleHover: 'group-hover:text-indigo-300'
    }
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) return;
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        alert("If you're on mobile, use 'Add to Home Screen' in your browser menu. If on desktop, look for the install icon in the address bar!");
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  if (view === 'checklist') return <ChecklistView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} />;
  if (view === 'guide') return <BestLoadoutsView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} />;
  if (view === 'tools') return <ExternalToolsView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} onOpenBrewing={() => setView('brewing')} onOpenCircle={() => setView('circle')} />;
  if (view === 'brewing') return <BrewingLabView onBack={() => { setView('tools'); setSearchQuery(''); }} />;
  if (view === 'circle') return <CircleGeneratorView onBack={() => { setView('tools'); setSearchQuery(''); }} />;
  if (view === 'settings') return <SettingsView onBack={() => { setView('home'); setSearchQuery(''); }} />;
  if (view === 'calculator') return <EnchantmentCalculatorView onBack={() => { setView('home'); setSearchQuery(''); }} />;
  if (view === 'notes') return <NotesView onBack={() => { setView('home'); setSearchQuery(''); }} />;
  if (view === 'nether') return <NetherCalculatorView onBack={() => { setView('home'); setSearchQuery(''); }} />;

  const menuResults = MENU_ITEMS.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enchantResults = searchQuery.trim() ? CATEGORIES.flatMap(cat => 
    cat.groups.flatMap(g => g.items
        .filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(item => ({ ...item, categoryName: cat.name }))
    )
  ) : [];

  const guideResults = searchQuery.trim() ? BEST_LOADOUTS.filter(l => 
     l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     l.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const potionResults = searchQuery.trim() ? POTION_RECIPES.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.effect.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const externalToolResults = searchQuery.trim() ? TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const hasResults = menuResults.length > 0 || enchantResults.length > 0 || guideResults.length > 0 || externalToolResults.length > 0 || potionResults.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full" />
         <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* TOP UTILITY BAR */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={handleInstallClick}
          className="p-3 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] group active:scale-90"
          title="Install App"
        >
          <Download size={22} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => setView('settings')}
          className="p-3 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-xl active:scale-90"
          title="Settings & Backup"
        >
          <Settings size={22} />
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-4xl mt-16 relative z-10">
        <div className="inline-block p-6 rounded-[2rem] bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 mb-8 shadow-2xl relative group">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {/* RESTORED: Sparkles icon instead of e.png */}
          <Sparkles size={56} className="text-emerald-400 relative z-10 animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-4 tracking-tighter">
          Minecraft Utility
        </h1>
        <p className="text-zinc-500 max-w-md mx-auto text-lg mb-10 font-medium">
        Your ultimate companion for every survival world.
        </p>

        {/* SEARCH BAR */}
        <div className="relative max-w-2xl mx-auto z-20 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-3xl blur-xl opacity-40 group-hover:opacity-100 transition duration-1000" />
            <div className="relative flex items-center bg-zinc-900/60 backdrop-blur-3xl border border-zinc-700/50 rounded-2xl shadow-2xl transition-all duration-300 group-focus-within:border-emerald-500/50 group-focus-within:bg-zinc-900/80 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10">
                <div className="pl-6 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                    <Search size={24} />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Quick search... (Press '/' to focus)"
                    className="w-full bg-transparent text-zinc-100 py-5 px-5 text-lg outline-none placeholder-zinc-600 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl w-full relative z-10">
         {hasResults ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                {menuResults.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuResults.map((item) => (
                            <button
                            key={item.id}
                            onClick={() => setView(item.view as ViewMode)}
                            className={`group relative p-8 rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 ${item.theme.hoverBorder} hover:bg-zinc-900/60 transition-all duration-500 text-left flex flex-col h-full ${item.theme.hoverShadow} overflow-hidden hover:-translate-y-2 active:scale-[0.98]`}
                            >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.theme.gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            
                            <div className="relative z-10 flex items-start justify-between mb-10">
                                <div className={`p-4 ${item.theme.iconBg} rounded-2xl border ${item.theme.iconBorder} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                                <item.icon size={36} className={item.theme.iconColor} />
                                </div>
                            </div>
                            
                            <div className="relative z-10 mt-auto">
                                <h2 className={`text-2xl font-black text-white mb-3 ${item.theme.titleHover} transition-colors tracking-tight`}>
                                {item.title}
                                </h2>
                                <p className="text-zinc-500 text-sm leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                                {item.description}
                                </p>
                            </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* SEARCH RESULTS OVERLAY STYLE */}
                {(enchantResults.length > 0 || guideResults.length > 0 || externalToolResults.length > 0 || potionResults.length > 0) && (
                    <div className="bg-zinc-900/50 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-3xl">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 ml-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Integrated Search Results
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enchantResults.map((item) => (
                                <button key={`ench-${item.id}`} onClick={() => setView('checklist')} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group">
                                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 transition-all"><CheckSquare size={18} /></div>
                                    <div><div className="text-sm font-bold text-zinc-200 group-hover:text-white">{item.name}</div><div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Checklist • {item.categoryName}</div></div>
                                </button>
                            ))}
                            {potionResults.map((item) => (
                                <button key={`potion-${item.id}`} onClick={() => { setView('brewing'); setSearchQuery(''); }} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group">
                                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-cyan-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all"><FlaskConical size={18} /></div>
                                    <div><div className="text-sm font-bold text-zinc-200 group-hover:text-white">Potion of {item.name}</div><div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Brewing Lab</div></div>
                                </button>
                            ))}
                            {guideResults.map((item) => (
                                <button key={`guide-${item.id}`} onClick={() => setView('guide')} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group">
                                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-purple-500 group-hover:text-purple-400 group-hover:scale-110 transition-all"><BookOpen size={18} /></div>
                                    <div><div className="text-sm font-bold text-zinc-200 group-hover:text-white">{item.name}</div><div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Best Loadouts</div></div>
                                </button>
                            ))}
                            {externalToolResults.map((item) => (
                                <button key={`ext-${item.name}`} onClick={() => {
                                  if (item.internal) {
                                    if (item.name === 'Brewing Lab') setView('brewing');
                                    if (item.name === 'Pixel Circle Generator') setView('circle');
                                  } else {
                                    window.open(item.url, '_blank');
                                  }
                                }} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group">
                                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-indigo-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all"><Globe size={18} /></div>
                                    <div><div className="text-sm font-bold text-zinc-200 group-hover:text-white">{item.name}</div><div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{item.internal ? 'Native Tool' : 'External Tool'}</div></div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : (
          <div className="col-span-full text-center py-20 text-zinc-500">
             <div className="bg-zinc-900/50 p-8 rounded-full inline-block border border-zinc-800 mb-6">
                <Search size={48} className="opacity-20" />
             </div>
             <p className="text-xl font-bold">No results found for "{searchQuery}"</p>
             <button onClick={() => setSearchQuery('')} className="text-emerald-500 hover:text-emerald-400 font-bold mt-4 underline decoration-2 underline-offset-4">Clear search</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-auto mb-12 text-center space-y-6 relative z-10">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto mb-10" />
        <div className="flex flex-col items-center gap-4">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Made by <span className="text-emerald-500/80">Exoticghost404</span></p>
            <div className="flex items-center gap-6 text-zinc-600 bg-zinc-900/50 backdrop-blur-xl px-6 py-3 rounded-full border border-zinc-800">
                <a href="https://www.youtube.com/channel/UCs9-IGmuj-ogpe5_jlg7xjw?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 hover:scale-125 transition-all" title="YouTube"><Youtube size={20} /></a>
                <a href="https://www.twitch.tv/exoticghost404" target="_blank" rel="noopener noreferrer" className="hover:text-purple-500 hover:scale-125 transition-all" title="Twitch"><Twitch size={20} /></a>
                <a href="https://www.instagram.com/exoticghost404" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 hover:scale-125 transition-all" title="Instagram"><Instagram size={20} /></a>
            </div>
            <p className="text-zinc-700 text-[10px] font-bold">© {new Date().getFullYear()} Minecraft Utility</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
