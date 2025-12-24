
import React, { useState, useEffect } from 'react';
// Added Palette to the list of imports from lucide-react
import { ArrowLeft, User, Search, Download, ExternalLink, RefreshCw, AlertCircle, Copy, Check, Palette } from 'lucide-react';

interface SkinStealerViewProps {
  onBack: () => void;
}

export const SkinStealerView: React.FC<SkinStealerViewProps> = ({ onBack }) => {
  const [username, setUsername] = useState('');
  const [activePlayer, setActivePlayer] = useState('Steve'); // Default fallback
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFetch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    // Simulate slight delay for effect
    setTimeout(() => {
        setActivePlayer(username.trim());
        setIsLoading(false);
    }, 400);
  };

  const handleDownload = async (url: string, filename: string) => {
      try {
          const response = await fetch(url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
          console.error("Failed to download skin:", err);
      }
  };

  const skinUrl = `https://mc-heads.net/skin/${activePlayer}`;
  const renderUrl = `https://mc-heads.net/body/${activePlayer}/right/180.png`;
  const headUrl = `https://mc-heads.net/avatar/${activePlayer}/128.png`;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Tools
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
               <User className="text-emerald-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                 Skin Stealer
               </h1>
               <p className="text-xs text-zinc-400">View and download any Minecraft skin</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {/* Search Bar */}
        <form onSubmit={handleFetch} className="relative mb-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-all shadow-2xl">
                <div className="pl-4 flex items-center text-zinc-500">
                    <Search size={20} />
                </div>
                <input 
                    type="text"
                    placeholder="Enter Minecraft Username or UUID..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-zinc-100 py-4 px-4 outline-none placeholder-zinc-600"
                />
                <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    disabled={isLoading || !username.trim()}
                >
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Steal Skin'}
                </button>
            </div>
        </form>

        {/* Results Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: 3D-Style Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 w-full flex items-center justify-center min-h-[400px] shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
                    
                    {isLoading ? (
                        <RefreshCw size={48} className="text-emerald-500/20 animate-spin" />
                    ) : (
                        <img 
                            src={renderUrl} 
                            alt={`${activePlayer} Render`} 
                            className="relative z-10 w-48 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500 hover:scale-105 transition-transform"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://mc-heads.net/body/Steve/right/180.png`;
                            }}
                        />
                    )}
                </div>
                <h2 className="mt-6 text-xl font-black text-zinc-100 uppercase tracking-widest">{activePlayer}</h2>
                <div className="mt-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    Active Preview
                </div>
            </div>

            {/* Right Col: Details and Downloads */}
            <div className="md:col-span-7 space-y-6">
                
                {/* Avatar and Info */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
                    <div className="w-20 h-20 bg-zinc-950 rounded-xl border border-zinc-800 p-2 shrink-0">
                        <img src={headUrl} alt="Head Avatar" className="w-full h-full rounded-lg" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-100 mb-1">Player Avatar</h3>
                        <p className="text-sm text-zinc-500">A square render of the player's head including outer layers.</p>
                        <button 
                            onClick={() => handleDownload(headUrl, `${activePlayer}_avatar.png`)}
                            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                        >
                            <Download size={12} /> Download Avatar
                        </button>
                    </div>
                </div>

                {/* Texture Map */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-zinc-100 mb-4 flex items-center gap-2">
                        <Palette size={18} className="text-emerald-400" /> 
                        Skin Texture Map
                    </h3>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-center mb-6 min-h-[120px]">
                        <img 
                            src={skinUrl} 
                            alt="Raw Skin Texture" 
                            className="w-full max-w-[256px] h-auto image-pixelated border border-zinc-800 shadow-lg"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => handleDownload(skinUrl, `${activePlayer}_skin.png`)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                        >
                            <Download size={18} /> Download Skin
                        </button>
                        <button 
                             onClick={() => handleDownload(renderUrl, `${activePlayer}_render.png`)}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <User size={18} /> Body Render
                        </button>
                    </div>
                </div>

                {/* External Links */}
                <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-6">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">External Resources</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a 
                            href={`https://namemc.com/profile/${activePlayer}`} 
                            target="_blank" 
                            rel="noopener"
                            className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                        >
                            View on NameMC <ExternalLink size={14} />
                        </a>
                        <a 
                            href={`https://skinmc.net/profile/${activePlayer}`} 
                            target="_blank" 
                            rel="noopener"
                            className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                        >
                            View on SkinMC <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Info Tip */}
        <div className="mt-12 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3 text-sm text-zinc-500 leading-relaxed">
            <AlertCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>
                <strong>Pro Tip:</strong> You can enter a <strong>UUID</strong> directly if the player has changed their name recently. The skin fetched is the one currently active on the official Minecraft authentication servers.
            </p>
        </div>
      </main>

      <style>{`
        .image-pixelated {
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
