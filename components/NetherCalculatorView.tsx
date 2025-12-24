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
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
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
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10
                ${mode === 'to_nether' 
                    ? 'bg-zinc-800 text-green-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
             <span className="w-2 h-2 rounded-full bg-green-500" /> Overworld to Nether
          </button>
          <button
            onClick={() => setMode('to_overworld')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative z-10
                ${mode === 'to_overworld' 
                    ? 'bg-zinc-800 text-red-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
          >
             <span className="w-2 h-2 rounded-full bg-red-500" /> Nether to Overworld
          </button>
        </div>

        {/* Calculator Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <Flame size={200} />
             </div>

             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                
                {/* Inputs */}
                <div className="w-full md:w-1/2 space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        {mode === 'to_nether' ? 'Overworld Coordinates' : 'Nether Coordinates'}
                    </h3>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-zinc-500 ml-1 mb-1 block">X Coordinate</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={coords.x}
                                onChange={e => setCoords({...coords, x: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Y Coordinate (Optional)</label>
                            <input 
                                type="number" 
                                placeholder="64"
                                value={coords.y}
                                onChange={e => setCoords({...coords, y: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 ml-1 mb-1 block">Z Coordinate</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={coords.z}
                                onChange={e => setCoords({...coords, z: e.target.value})}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-zinc-100 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex text-zinc-600">
                    <ArrowRightLeft size={32} />
                </div>

                {/* Result */}
                <div className="w-full md:w-1/2">
                     <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                        {mode === 'to_nether' ? 'Build Portal At (Nether)' : 'Build Portal At (Overworld)'}
                    </h3>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 group hover:border-red-500/30 transition-colors">
                        <div className="grid grid-cols-3 gap-4 w-full text-center">
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">X</div>
                                <div className="text-2xl font-bold font-mono text-zinc-100">{result.x}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Y</div>
                                <div className="text-2xl font-bold font-mono text-zinc-500">{result.y || '~'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-1">Z</div>
                                <div className="text-2xl font-bold font-mono text-zinc-100">{result.z}</div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-800 my-1" />

                        <div className="text-xs text-zinc-500 text-center">
                            Ratio: {mode === 'to_nether' ? 'Divide by 8' : 'Multiply by 8'}
                        </div>

                        <button 
                            onClick={handleCopy}
                            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors flex items-center justify-center gap-2"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy Coordinates'}
                        </button>
                    </div>
                </div>
             </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 text-sm text-amber-200/80">
            <div className="shrink-0 pt-1">
                <Flame size={16} />
            </div>
            <p>
                <strong>Tip:</strong> The Y coordinate (height) doesn't affect the X/Z linkage, but portals need to be somewhat close in height to link perfectly if there are multiple portals nearby.
            </p>
        </div>
      </main>
    </div>
  );
};