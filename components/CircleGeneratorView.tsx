
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Circle, Maximize, RotateCcw, Move, 
  Layout,Lock, Unlock, HardDrive, 
  Download, Ruler
} from 'lucide-react';

interface CircleGeneratorViewProps {
  onBack: () => void;
}

type RenderStyle = 'thin' | 'thick' | 'filled';

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [style, setStyle] = useState<RenderStyle>('thin');
  const [isLocked, setIsLocked] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  
  // State for Zoom
  const [zoom, setZoom] = useState(1);
  
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: Grid Calculation ---
  const gridData = useMemo(() => {
    const data = Array.from({ length: height }, () => new Array(width).fill(false));
    const rx = width / 2;
    const ry = height / 2;

    const plot = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix >= 0 && ix < width && iy >= 0 && iy < height) data[iy][ix] = true;
    };

    if (style === 'filled') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = (x + 0.5) - rx;
          const dy = (y + 0.5) - ry;
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) data[y][x] = true;
        }
      }
    } else {
      const segments = Math.max(width, height) * 12;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = rx + (rx - 0.5) * Math.cos(angle);
        const y = ry + (ry - 0.5) * Math.sin(angle);
        plot(x, y);
        if (style === 'thick') {
          plot(x + 0.3, y); plot(x - 0.3, y);
          plot(x, y + 0.3); plot(x, y - 0.3);
        }
      }
    }
    return data;
  }, [width, height, style]);

  const blockCount = useMemo(() => gridData.reduce((acc, row) => acc + row.filter(c => c).length, 0), [gridData]);

  // --- LOGIC: Canvas Rendering ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseCellSize = 12;
    const cellSize = Math.max(1, baseCellSize * zoom);
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // Draw Background
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Blocks
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gridData[y][x]) {
          if (showRulers && ((x + 1) % 10 === 0 || (y + 1) % 10 === 0)) ctx.fillStyle = '#818cf8';
          else if (showRulers && ((x + 1) % 5 === 0 || (y + 1) % 5 === 0)) ctx.fillStyle = '#4f46e5';
          else ctx.fillStyle = '#6366f1';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }

    // Draw Highlight
    if (hoverCoord && cellSize > 2) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hoverCoord.x * cellSize, hoverCoord.y * cellSize, cellSize, cellSize);
    }
  }, [gridData, zoom, width, height, showRulers, hoverCoord]);

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `blueprint-${width}x${height}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // --- LOGIC: Zoom Handler ---
  const handleManualZoom = (val: number) => {
    // Clamp between 10% and 300%
    const newZoom = Math.max(0.1, Math.min(3.0, val / 100));
    setZoom(newZoom);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="flex-none bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <button onClick={onBack} className="mb-2 md:mb-3 flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors text-xs md:text-sm font-medium active:scale-95">
            <ArrowLeft size={16} /> Back to Tools
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                 <Circle className="text-indigo-400 w-5 h-5 md:w-6 md:h-6" />
               </div>
               <div>
                 <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">Circle Generator</h1>
                 <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest">Precision Blueprint</p>
               </div>
            </div>
            <button onClick={exportPNG} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
        {/* SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar pb-6 lg:pb-0">
          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                <Maximize size={14} /> Dimensions
              </h3>
              <button onClick={() => setIsLocked(!isLocked)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                {isLocked ? <Lock size={12} className="inline mr-1"/> : <Unlock size={12} className="inline mr-1"/>}
                {isLocked ? 'Circle' : 'Ellipse'}
              </button>
            </div>

            <div className="space-y-6">
              {[ { l: 'Width', v: width, s: setWidth }, { l: 'Height', v: height, s: setHeight } ].map((d, i) => (
                <div key={d.l} className="space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                    <span className="text-zinc-500">{d.l}</span>
                    <span className="text-indigo-400 font-mono">{d.v}</span>
                  </div>
                  <input type="range" min="1" max="256" value={d.v} onChange={(e) => {
                    const val = parseInt(e.target.value);
                    d.s(val); if(isLocked) (i === 0 ? setHeight(val) : setWidth(val));
                  }} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-zinc-900 space-y-4">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5"><Layout size={14} /> Render Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                  <button key={s} onClick={() => setStyle(s)} className={`py-3 rounded-xl border text-[9px] font-black uppercase transition-all ${style === s ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>{s}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 space-y-4 shadow-xl">
             <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5"><Ruler size={14} /> View Aids</h3>
             <button onClick={() => setShowRulers(!showRulers)} className={`w-full py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${showRulers ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
                Guide Rulers (5x5): {showRulers ? 'ON' : 'OFF'}
             </button>
          </section>

          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5"><HardDrive size={14} /> Material Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1.5">Total</div>
                <div className="text-2xl font-black text-white tabular-nums">{blockCount}</div>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1.5">Inventory</div>
                <div className="text-lg font-black text-white leading-tight">
                  {Math.floor(blockCount/64)} <span className="text-[10px] text-zinc-500 uppercase">Stacks</span>
                  <div className="text-xs text-indigo-400">+{blockCount % 64}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* PREVIEW AREA */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[450px]">
          <div className="bg-[#09090b] border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full relative">
            
            {/* CANVAS HEADER / TOOLBAR */}
            <div className="flex-none bg-[#111114]/90 backdrop-blur-xl p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between z-20">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                   <Move size={12} className="text-zinc-600" />
                   <span className="text-[10px] font-mono font-bold text-zinc-700">{width}x{height}</span>
                </div>
                {hoverCoord && (
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 tabular-nums">
                    X:{hoverCoord.x} Y:{hoverCoord.y}
                  </span>
                )}
              </div>

              {/* NEW ZOOM CONTROLS */}
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-1 pl-2">
                      <input 
                        type="number" 
                        value={Math.round(zoom * 100)} 
                        onChange={(e) => handleManualZoom(parseInt(e.target.value))}
                        /* CHANGED: Increased width from w-8 to w-12 to fit 3 digits comfortably */
                        className="bg-transparent text-indigo-400 font-mono text-xs w-12 text-right focus:outline-none border-b border-transparent focus:border-indigo-500 transition-colors"
                      />
                      <span className="text-[10px] text-zinc-600 font-bold pr-2">%</span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800"></div>
                    <input 
                      type="range" min="0.1" max="2" step="0.1" 
                      value={zoom} 
                      onChange={(e) => setZoom(parseFloat(e.target.value))} 
                      className="w-20 h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer mr-2" 
                    />
                 </div>
                 <button onClick={() => { setWidth(32); setHeight(32); setZoom(1); }} className="p-2 bg-black/60 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all active:scale-95" title="Reset View">
                    <RotateCcw size={14} />
                 </button>
              </div>
            </div>

            <div ref={containerRef} className="flex-1 bg-[#050507] overflow-auto relative no-scrollbar flex items-center justify-center p-12 md:p-24">
              <canvas 
                ref={canvasRef} 
                onPointerMove={(e) => {
                  const r = canvasRef.current?.getBoundingClientRect();
                  if(!r) return;
                  const cs = r.width / width;
                  setHoverCoord({ x: Math.floor((e.clientX - r.left) / cs), y: Math.floor((e.clientY - r.top) / cs) });
                }}
                onPointerLeave={() => setHoverCoord(null)}
                className="shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-zinc-900 transition-all duration-300 rounded cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
