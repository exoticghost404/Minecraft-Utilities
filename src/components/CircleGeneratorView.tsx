import React, { useState, useMemo } from 'react';
import { ArrowLeft, Circle, Maximize, Hash, Info, RotateCcw, Lock, Unlock } from 'lucide-react';

interface CircleGeneratorViewProps {
  onBack: () => void;
}

type Mode = 'thin' | 'thick' | 'filled';

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(21);
  const [height, setHeight] = useState(21);
  const [mode, setMode] = useState<Mode>('thin');
  const [lockRatio, setLockRatio] = useState(true);
  
  const grid = useMemo(() => {
    const newGrid: boolean[][] = Array(height).fill(0).map(() => Array(width).fill(false));
    const rx = width / 2;
    const ry = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x + 0.5) - rx;
        const dy = (y + 0.5) - ry;
        
        // Ellapse distance formula: (x^2 / a^2) + (y^2 / b^2)
        const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

        if (mode === 'filled') {
          if (dist <= 1.0) newGrid[y][x] = true;
        } else if (mode === 'thick') {
          const outerDist = ((Math.abs(dx) + 0.5) ** 2) / (rx * rx) + ((Math.abs(dy) + 0.5) ** 2) / (ry * ry);
          if (dist <= 1.1 && (outerDist >= 0.85 || dist >= 0.85)) {
             // Basic distance check for outline
             if (dist <= 1.0 && dist >= 0.65) newGrid[y][x] = true;
          }
        } else {
          // Thin outline (Midpoint-style approximation)
          const xNorm = (dx * dx) / ((rx - 0.5) * (rx - 0.5)) + (dy * dy) / ((ry - 0.5) * (ry - 0.5));
          const xOuter = (dx * dx) / ((rx + 0.5) * (rx + 0.5)) + (dy * dy) / ((ry + 0.5) * (ry + 0.5));
          
          if (xNorm >= 0.75 && xOuter <= 1.25) {
             // Precise thin logic for pixel circles
             const isFilled = (val: number) => val <= 1.0;
             const center = isFilled(dist);
             const left = isFilled(((x - 0.5) - rx)**2 / (rx*rx) + (dy*dy)/(ry*ry));
             const right = isFilled(((x + 1.5) - rx)**2 / (rx*rx) + (dy*dy)/(ry*ry));
             const top = isFilled((dx*dx)/(rx*rx) + ((y - 0.5) - ry)**2 / (ry*ry));
             const bottom = isFilled((dx*dx)/(rx*rx) + ((y + 1.5) - ry)**2 / (ry*ry));
             
             if (center && (!left || !right || !top || !bottom)) {
                 newGrid[y][x] = true;
             }
          }
        }
      }
    }
    return newGrid;
  }, [width, height, mode]);

  const blockCount = useMemo(() => {
    return grid.reduce((acc, row) => acc + row.filter(cell => cell).length, 0);
  }, [grid]);

  const handleWidthChange = (val: number) => {
    const clamped = Math.max(1, Math.min(128, val));
    setWidth(clamped);
    if (lockRatio) setHeight(clamped);
  };

  const handleHeightChange = (val: number) => {
    const clamped = Math.max(1, Math.min(128, val));
    setHeight(clamped);
    if (lockRatio) setWidth(clamped);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Tools
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
               <Circle className="text-indigo-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                 Pixel Circle Generator
               </h1>
               <p className="text-xs text-zinc-400">Blueprint tool for Minecraft circular builds</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Dimensions</h3>
                <button 
                    onClick={() => setLockRatio(!lockRatio)}
                    className={`p-1.5 rounded-md transition-colors ${lockRatio ? 'text-indigo-400 bg-indigo-400/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                    title={lockRatio ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                >
                    {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 font-medium">Width (Blocks)</span>
                        <span className="text-white font-mono font-bold bg-zinc-800 px-2 rounded">{width}</span>
                    </div>
                    <input 
                        type="range" min="1" max="128" step="1" 
                        value={width} 
                        onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-400 font-medium">Height (Blocks)</span>
                        <span className="text-white font-mono font-bold bg-zinc-800 px-2 rounded">{height}</span>
                    </div>
                    <input 
                        type="range" min="1" max="128" step="1" 
                        value={height} 
                        onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Style</h3>
                <div className="grid grid-cols-3 gap-2">
                    {(['thin', 'thick', 'filled'] as Mode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border ${
                                mode === m 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                 <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                    <div className="text-[10px] font-black text-zinc-600 uppercase mb-1 flex items-center gap-1">
                        <Hash size={10} /> Total Blocks
                    </div>
                    <div className="text-xl font-bold text-indigo-400">{blockCount.toLocaleString()}</div>
                 </div>
                 <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                    <div className="text-[10px] font-black text-zinc-600 uppercase mb-1 flex items-center gap-1">
                        <Maximize size={10} /> Stacks
                    </div>
                    <div className="text-xl font-bold text-zinc-300">{Math.ceil(blockCount / 64)}</div>
                 </div>
            </div>
          </section>

          <div className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-500 italic">
            <Info size={16} className="shrink-0 text-indigo-500" />
            <p>Use the width/height to set the diameter. Odd numbers produce a clear center block, even numbers produce a 2x2 center.</p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-8 flex items-center justify-center min-h-[500px] overflow-hidden relative shadow-2xl">
                 {/* Grid Ruler Overlay */}
                 <div className="absolute top-4 left-4 flex flex-col gap-1 opacity-20 pointer-events-none font-mono text-[10px]">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-sm" /> Filled Block</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 border border-zinc-700 rounded-sm" /> Grid Reference</div>
                 </div>

                 <div 
                    className="grid bg-zinc-950 p-2 rounded shadow-inner border border-zinc-800/50"
                    style={{ 
                        gridTemplateColumns: `repeat(${width}, 1fr)`,
                        width: width > 50 ? '100%' : 'auto',
                        aspectRatio: `${width} / ${height}`,
                        maxHeight: '70vh'
                    }}
                 >
                    {grid.map((row, y) => row.map((filled, x) => (
                        <div 
                            key={`${x}-${y}`}
                            className={`
                                aspect-square border-[0.5px] transition-all
                                ${filled ? 'bg-indigo-500 border-indigo-400/50 shadow-[0_0_5px_rgba(99,102,241,0.3)]' : 'border-zinc-800/30'}
                                ${width < 32 && height < 32 ? 'hover:scale-110 hover:z-10 hover:bg-zinc-800 cursor-help' : ''}
                            `}
                        />
                    )))}
                 </div>
            </div>

            <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setWidth(21); setHeight(21); setMode('thin'); }}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
                
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] hidden sm:block">
                    {width} x {height} Blueprint
                </p>
            </div>
        </div>
      </main>
    </div>
  );
};
