
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, CheckSquare, Sparkles, Calculator, Notebook, Globe, Flame, Search, Youtube, Twitch, Instagram, Hammer, Book as BookIcon } from 'lucide-react';
import { ChecklistView } from './components/ChecklistView';
import { BestLoadoutsView } from './components/BestLoadoutsView';
import { EnchantmentCalculatorView } from './components/EnchantmentCalculatorView';
import { NotesView } from './components/NotesView';
import { ExternalToolsView, TOOLS } from './components/ExternalToolsView';
import { NetherCalculatorView } from './components/NetherCalculatorView';
import { CATEGORIES, BEST_LOADOUTS } from './constants';

type ViewMode = 'home' | 'checklist' | 'guide' | 'calculator' | 'notes' | 'tools' | 'nether';

const MENU_ITEMS = [
  {
    id: 'checklist',
    title: 'Checklist',
    description: 'Track collected enchantments and monitor progress.',
    icon: CheckSquare,
    view: 'checklist',
    theme: {
      hoverBorder: 'hover:border-emerald-500/50',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
      gradient: 'from-emerald-500/5',
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
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]',
      gradient: 'from-purple-500/5',
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
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
      gradient: 'from-amber-500/5',
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
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]',
      gradient: 'from-red-500/5',
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
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]',
      gradient: 'from-blue-500/5',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      titleHover: 'group-hover:text-blue-300'
    }
  },
  {
    id: 'tools',
    title: 'More Tools',
    description: 'Seed maps, armor trims, banners, block palettes, command generators, and more.',
    icon: Globe,
    view: 'tools',
    theme: {
      hoverBorder: 'hover:border-indigo-500/50',
      hoverShadow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]',
      gradient: 'from-indigo-500/5',
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (view === 'checklist') return <ChecklistView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} />;
  if (view === 'guide') return <BestLoadoutsView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} />;
  if (view === 'tools') return <ExternalToolsView onBack={() => { setView('home'); setSearchQuery(''); }} initialSearch={searchQuery} />;
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

  const externalToolResults = searchQuery.trim() ? TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const hasResults = menuResults.length > 0 || enchantResults.length > 0 || guideResults.length > 0 || externalToolResults.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-zinc-100 relative">
      
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-3xl mt-8">
        <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Sparkles size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-4 tracking-tight">
          Minecraft Utility
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto text-lg mb-8">
          The ultimate companion for tracking progress, optimizing gear, and managing your survival world.
        </p>

        <div className="relative max-w-2xl mx-auto z-20 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-500" />
            
            <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl transition-all duration-300 group-focus-within:border-emerald-500/50 group-focus-within:ring-1 group-focus-within:ring-emerald-500/20">
                <div className="pl-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                    <Search size={24} />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search enchantments, tools, notes..."
                    className="w-full bg-transparent text-zinc-100 py-4 px-4 text-lg outline-none placeholder-zinc-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="mr-3 flex items-center justify-center">
                    <kbd 
                        onClick={() => searchInputRef.current?.focus()}
                        className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 font-mono text-sm font-bold shadow-sm cursor-pointer hover:text-zinc-300 hover:border-zinc-600 transition-all select-none"
                        title="Press '/' to focus"
                    >
                        /
                    </kbd>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl w-full">
         {hasResults ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {menuResults.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuResults.map((item) => (
                            <button
                            key={item.id}
                            onClick={() => setView(item.view as ViewMode)}
                            className={`group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 ${item.theme.hoverBorder} hover:bg-zinc-900 transition-all duration-300 text-left flex flex-col h-full ${item.theme.hoverShadow} overflow-hidden`}
                            >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.theme.gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                            
                            <div className="relative z-10 flex items-start justify-between mb-8">
                                <div className={`p-3 ${item.theme.iconBg} rounded-xl border ${item.theme.iconBorder} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={32} className={item.theme.iconColor} />
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <h2 className={`text-xl font-bold text-white mb-2 ${item.theme.titleHover} transition-colors`}>
                                {item.title}
                                </h2>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                {item.description}
                                </p>
                            </div>
                            </button>
                        ))}
                    </div>
                )}

                {(enchantResults.length > 0 || guideResults.length > 0 || externalToolResults.length > 0) && (
                    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Search size={14} /> Search Results
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enchantResults.map((item) => (
                                <button
                                    key={`ench-${item.id}`}
                                    onClick={() => setView('checklist')}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1c1c1f] border border-zinc-800/50 hover:border-emerald-500/40 hover:bg-[#252529] transition-all text-left group shadow-sm"
                                >
                                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 group-hover:text-blue-300">
                                        <BookIcon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-zinc-100 group-hover:text-white mb-0.5">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                            Enchantment • {item.categoryName}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {guideResults.map((item) => (
                                <button
                                    key={`guide-${item.id}`}
                                    onClick={() => setView('guide')}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1c1c1f] border border-zinc-800/50 hover:border-purple-500/40 hover:bg-[#252529] transition-all text-left group shadow-sm"
                                >
                                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 group-hover:text-purple-300">
                                        <Hammer size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-zinc-100 group-hover:text-white mb-0.5">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                            Best Loadout
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {externalToolResults.map((item) => (
                                <button
                                    key={`ext-${item.name}`}
                                    onClick={() => setView('tools')}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1c1c1f] border border-zinc-800/50 hover:border-indigo-500/40 hover:bg-[#252529] transition-all text-left group shadow-sm"
                                >
                                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-400 group-hover:text-indigo-300">
                                        <Globe size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-zinc-100 group-hover:text-white mb-0.5">
                                            {item.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                            External Tool
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
         ) : (
          <div className="col-span-full text-center py-10 text-zinc-500">
             <p>No results found for "{searchQuery}"</p>
             <button onClick={() => setSearchQuery('')} className="text-emerald-500 hover:underline mt-2">Clear search</button>
          </div>
        )}
      </div>

      <footer className="mt-16 mb-8 text-center space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-500 text-sm">
          <p>Minecraft Utility © {new Date().getFullYear()}</p>
        </div>
        <div className="flex flex-col items-center gap-3">
            <p className="text-zinc-700 text-xs flex items-center justify-center gap-1">
            Made by <span className="text-emerald-500/60 font-medium">Exoticghost404</span>
            </p>
            <div className="flex items-center gap-4 text-zinc-600">
                <a 
                    href="https://www.youtube.com/@ExoticGhost404" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-red-500 hover:scale-110 transition-all"
                    title="YouTube"
                >
                    <Youtube size={18} />
                </a>
                <a 
                    href="https://www.twitch.tv/exoticghost404" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-purple-500 hover:scale-110 transition-all"
                    title="Twitch"
                >
                    <Twitch size={18} />
                </a>
                <a 
                    href="https://www.instagram.com/exoticghost404" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-pink-500 hover:scale-110 transition-all"
                    title="Instagram"
                >
                    <Instagram size={18} />
                </a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
