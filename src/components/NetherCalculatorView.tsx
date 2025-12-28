import React, { useState } from 'react';
import { ArrowLeft, MapPin, ArrowRightLeft, Copy, Check, Flame } from 'lucide-react';

interface NetherCalculatorViewProps {
  onBack: () => void;
}

type Mode = 'to_nether' | 'to_overworld';

export const NetherCalculatorView: React.FC<NetherCalculatorViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('to_nether');
  const [coords, setCoords] = useState({ x: '', y: '', z: '' });
  const [copied, setCopied] = useState(false);

  const calculateResult = () => {
    const x = parseFloat(coords.x) || 0;
    const y = parseFloat(coords.y) || 0;
    const z = parseFloat(coords.z) || 0;

    if (mode === 'to_nether') {
      return {
        x: Math.floor(x / 8),
        y: y,
        z: Math.floor(z / 8)
      };
    } else {
      return {
        x: Math.floor(x * 8),
        y: y,
        z: Math.floor(z * 8)
      };
    }
  };

  const result = calculateResult();
  const formattedResult = `X: ${result.x}, Y: ${result.y}, Z: ${result.z}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium active:scale-95"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
               <MapPin className="text-red-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                 Nether Calculator
               </h1>
               <p className="text-xs text-zinc-400">Coordinate converter for portals</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {/* Toggle Mode */}
        <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex gap-2 mb-8 relative">
          <button
            onClick={() => setMode('to_nether')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 active:scale-[0.98]
                ${mode === 'to_nether' 
                    ? 'bg-zinc-800 text-green-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
             <span className="w-2 h-2 rounded-full bg-green-500" /> Overworld to Nether
          </button>
          <button
            onClick={() => setMode('to_overworld')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10 active:scale-[0.98]
                ${mode === 'to_overworld' 
                    ? 'bg-zinc-800 text-red-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
             <span className="w-2 h-2 rounded-full bg-red-500" /> Nether to Overworld
          </button>
        </div>

        {/* Calculator Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <Flame size={200} />
             </div>

             <div className="relative z-10 flex flex-col gap-8 items-stretch">
                
                {/* Inputs */}
                <div className="w-full space-y-4">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1">
                        Input Coordinates
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-600 uppercase ml-1">X Axis</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={coords.x}
                                onChange={e => setCoords({...coords, x: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-600 uppercase ml-1">Y Axis (Height)</label>
                            <input 
                                type="number" 
                                placeholder="64"
                                value={coords.y}
                                onChange={e => setCoords({...coords, y: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-600 uppercase ml-1">Z Axis</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={coords.z}
                                onChange={e => setCoords({...coords, z: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center text-zinc-800">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <ArrowRightLeft size={24} className="mx-4" />
                    <div className="h-px flex-1 bg-zinc-800" />
                </div>

                {/* Result Section (Optimized for huge numbers) */}
                <div className="w-full">
                     <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 px-1">
                        Portal Placement
                    </h3>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 group hover:border-red-500/30 transition-all shadow-inner">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-between">
                                <div className="flex flex-col items-center sm:items-start min-w-0 flex-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">X Coord</span>
                                    <div className="text-2xl md:text-3xl font-black font-mono text-white break-all text-center sm:text-left tabular-nums">{result.x}</div>
                                </div>
                                <div className="flex flex-col items-center sm:items-start min-w-0 flex-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Y (Keep)</span>
                                    <div className="text-2xl md:text-3xl font-black font-mono text-zinc-500 break-all text-center sm:text-left tabular-nums">{result.y || '~'}</div>
                                </div>
                                <div className="flex flex-col items-center sm:items-start min-w-0 flex-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Z Coord</span>
                                    <div className="text-2xl md:text-3xl font-black font-mono text-white break-all text-center sm:text-left tabular-nums">{result.z}</div>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-900" />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                                    Linkage Ratio: {mode === 'to_nether' ? '1:8 (Division)' : '8:1 (Multiplication)'}
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className="w-full sm:w-auto px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-300 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                                >
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy Coords'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-xs md:text-sm text-amber-200/80">
            <div className="shrink-0 pt-1">
                <Flame size={16} />
            </div>
            <p className="leading-relaxed">
                <strong className="block mb-1">Dimensional Linkage Pro-Tip:</strong> The Y coordinate doesn't affect X/Z linkage calculations, but if multiple portals exist nearby, matching the height (Y) helps prevent the "wrong portal" linkage issue.
            </p>
        </div>
      </main>
    </div>
  );
};
