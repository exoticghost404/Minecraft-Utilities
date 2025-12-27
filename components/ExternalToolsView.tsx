import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Globe, Palette, Box, Map, Database, Smile, User, Search, FlaskConical, Circle } from 'lucide-react';

interface ExternalToolsViewProps {
  onBack: () => void;
  initialSearch?: string;
  onOpenBrewing?: () => void;
  onOpenCircle?: () => void;
}

export const TOOLS = [
  {
    name: 'Brewing Lab',
    internal: true,
    description: 'NATIVE: Interactive potion sequence builder for Minecraft 1.21 including trial potions.',
    icon: FlaskConical,
    color: 'cyan'
  },
  {
    name: 'Pixel Circle Generator',
    internal: true,
    description: 'NATIVE: Create perfect circular and elliptical blueprints for your Minecraft builds.',
    icon: Circle,
    color: 'indigo'
  },
  {
    name: 'Chunkbase',
    url: 'https://www.chunkbase.com/apps/seed-map',
    description: 'Find biomes, structures, and slime chunks on a map of your seed.',
    icon: Map,
    color: 'emerald'
  },
  {
    name: 'MineTrim',
    url: 'https://minetrim.com/',
    description: 'Visualize and plan armor trims and material combinations.',
    icon: Palette,
    color: 'cyan'
  },
  {
    name: 'NeedCoolerShoes',
    url: 'https://needcoolershoes.com/banner',
    description: 'Advanced banner pattern designer and editor.',
    icon: Palette,
    color: 'pink'
  },
  {
    name: 'SkinMC Totem',
    url: 'https://skinmc.net/totem',
    description: 'Create custom resource packs to display your skin on a Totem of Undying.',
    icon: Smile,
    color: 'amber'
  },
  {
    name: 'Skindex Editor',
    url: 'https://www.minecraftskins.com/skin-editor/',
    description: 'Classic skin editor for creating and editing Minecraft skins.',
    icon: User,
    color: 'zinc'
  },
  {
    name: 'BlockPalettes',
    url: 'https://www.blockpalettes.com/',
    description: 'Discover beautiful block palettes for your builds.',
    icon: Box,
    color: 'orange'
  },
  {
    name: 'McStacker',
    url: 'https://mcstacker.net/',
    description: 'Command generator for summon, give, item, and more.',
    icon: Database,
    color: 'red'
  },
  {
    name: 'NameMC',
    url: 'https://namemc.com/',
    description: 'Minecraft skins, servers, and name history.',
    icon: Globe,
    color: 'blue'
  },
  {
    name: 'Vanilla Tweaks',
    url: 'https://vanillatweaks.net/',
    description: 'Modular resource packs, data packs, and crafting tweaks.',
    icon: Box,
    color: 'yellow'
  },
  {
    name: 'Modrinth',
    url: 'https://modrinth.com/',
    description: 'Open source modding platform for mods, plugins, and resource packs.',
    icon: Box,
    color: 'green'
  }
];

export const ExternalToolsView: React.FC<ExternalToolsViewProps> = ({ onBack, initialSearch = '', onOpenBrewing, onOpenCircle }) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filteredTools = TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
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
               <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                 <Globe className="text-indigo-400" size={24} />
               </div>
               <div>
                 <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                   More Tools
                 </h1>
                 <p className="text-xs text-zinc-400">Native utilities and useful websites</p>
               </div>
            </div>

            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={!!initialSearch}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const isInternal = 'internal' in tool;
                
                const cardContent = (
                    <div className="flex items-start gap-4 h-full relative w-full">
                        <div className={`
                            p-3 rounded-lg bg-zinc-950 border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform shrink-0
                            ${tool.color === 'emerald' ? 'text-emerald-400' : ''}
                            ${tool.color === 'cyan' ? 'text-cyan-400' : ''}
                            ${tool.color === 'pink' ? 'text-pink-400' : ''}
                            ${tool.color === 'orange' ? 'text-orange-400' : ''}
                            ${tool.color === 'red' ? 'text-red-400' : ''}
                            ${tool.color === 'blue' ? 'text-blue-400' : ''}
                            ${tool.color === 'yellow' ? 'text-yellow-400' : ''}
                            ${tool.color === 'green' ? 'text-green-400' : ''}
                            ${tool.color === 'amber' ? 'text-amber-400' : ''}
                            ${tool.color === 'zinc' ? 'text-zinc-200' : ''}
                            ${tool.color === 'purple' ? 'text-purple-400' : ''}
                            ${tool.color === 'indigo' ? 'text-indigo-400' : ''}
                        `}>
                            <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center mb-1">
                                <h3 className="font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors truncate">
                                    {tool.name}
                                </h3>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300">
                                {tool.description}
                            </p>
                        </div>
                        {!isInternal && (
                            <div className="absolute top-0 right-0 p-1">
                                <ExternalLink size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        )}
                    </div>
                );

                if (isInternal) {
                    return (
                        <button 
                            key={tool.name}
                            onClick={() => {
                                if (tool.name === 'Brewing Lab') onOpenBrewing?.();
                                if (tool.name === 'Pixel Circle Generator') onOpenCircle?.();
                            }}
                            className="text-left group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all hover:shadow-lg hover:-translate-y-1 w-full"
                        >
                            {cardContent}
                        </button>
                    );
                }

                return (
                    <a 
                        key={tool.name}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-800 transition-all flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 w-full"
                    >
                        {cardContent}
                    </a>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tools found for "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
};
