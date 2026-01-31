import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Circle, Maximize, RotateCcw, Target, Move, Layout, MousePointer2, Lock, Unlock, HardDrive, Copy, Check } from 'lucide-react';

interface CircleGeneratorViewProps {
  onBack: () => void;
}

type RenderStyle = 'thin' | 'thick' | 'filled';

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [style, setStyle] = useState<RenderStyle>('thin');
  const [isLocked, setIsLocked] = useState(true);
  const [showGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const gridData = useMemo(() => {
    const data: boolean[][] = [];
    const rx = width / 2;
    const ry = height / 2;
    const rxSq = rx * rx;
    const rySq = ry * ry;

    const xDistSq = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      const dx = (x + 0.5) - rx;
      xDistSq[x] = (dx * dx) / rxSq;
    }

    const isInside = (x: number, y: number) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      const dy = (y + 0.5) - ry;
      return xDistSq[x] + (dy * dy) / rySq <= 1.0;
    };

    for (let y = 0; y < height; y++) {
      const row: boolean[] = [];
      const dyDistSq = Math.pow((y + 0.5) - ry, 2) / rySq;

      for (let x = 0; x < width; x++) {
        const inside = xDistSq[x] + dyDistSq <= 1.0;
        if (style === 'filled') row.push(inside);
        else if (style === 'thick') {
          row.push(inside && (!isInside(x - 1, y) || !isInside(x + 1, y) || !isInside(x, y - 1) || !isInside(x, y + 1) || !isInside(x - 1, y - 1) || !isInside(x + 1, y + 1) || !isInside(x - 1, y + 1) || !isInside(x + 1, y - 1)));
        } else {
          if (!inside) row.push(false);
          else {
            const xVal = xDistSq[x];
            const dyNext = (y + (y + 0.5 > ry ? 1.5 : -0.5)) - ry;
            const dxNext = (x + (x + 0.5 > rx ? 1.5 : -0.5)) - rx;
            row.push(xVal > dyDistSq ? (dxNext * dxNext) / rxSq + dyDistSq > 1.0 : xDistSq[x] + (dyNext * dyNext) / rySq > 1.0);
          }
        }
      }
      data.push(row);
    }
    return data;
  }, [width, height, style]);

  const blockCount = useMemo(() => gridData.reduce((acc, row) => acc + row.filter(cell => cell).length, 0), [gridData]);

  const inventoryStats = useMemo(() => ({
    stacks: Math.floor(blockCount / 64),
    blocks: blockCount % 64,
    stackLabel: Math.floor(blockCount / 64) === 1 ? 'stack' : 'stacks'
  }), [blockCount]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Blueprint: ${width}x${height}, Total Blocks: ${blockCount}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const baseCellSize = 12;
    const cellSize = Math.max(0.1, baseCellSize * zoom);
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cellSize > 0.5) {
      ctx.fillStyle = '#6366f1';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (gridData[y][x]) ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.2, cellSize - 0.2);
        }
      }

      if (showGrid && cellSize > 4) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= width; x++) { ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, canvas.height); }
        for (let y = 0; y <= height; y++) { ctx.moveTo(0, y * cellSize); ctx.lineTo(canvas.width, y * cellSize); }
        ctx.stroke();
      }
    }
  }, [gridData, showGrid, zoom, width, height]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cellSize = rect.width / width;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < width && y >= 0 && y < height) setHoverCoord({ x, y });
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden font-sans">
      {/* RESTORED: Original Header Style */}
      <header className="flex-none bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <button onClick={onBack} className="mb-2 md:mb-3 flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors text-xs md:text-sm font-medium active:scale-95">
            <ArrowLeft size={16} /> Back to Tools
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                <Circle className="text-indigo-400 w-5 h-5 md:w-6 md:h-6" size={24} />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">Circle Generator</h1>
                <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest">Precision Blueprint</p>
              </div>
            </div>
            <button onClick={copyToClipboard} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all active:scale-95">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Stats'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
        {/* RESTORED: Sidebar Style */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar pb-6 lg:pb-0">
          <section className="flex-none bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                <Maximize size={14} /> Dimensions
              </h3>
              <button onClick={() => setIsLocked(!isLocked)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border active:scale-95 flex items-center gap-2 ${isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                {isLocked ? <Lock size={12}/> : <Unlock size={12}/>} {isLocked ? 'Locked' : 'Free'}
              </button>
            </div>

            <div className="space-y-6">
              {[ { label: 'Width', val: width, set: setWidth }, { label: 'Height', val: height, set: setHeight } ].map((dim, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                    <span className="text-zinc-500">{dim.label}</span>
                    <span className="text-indigo-400 font-mono">{dim.val}</span>
                  </div>
                  <input type="range" min="1" max="256" value={dim.val} onChange={(e) => {
                    const v = parseInt(e.target.value);
                    dim.set(v); if(isLocked) (i === 0 ? setHeight(v) : setWidth(v));
                  }} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-zinc-900 space-y-4">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5"><Layout size={14} /> Render Style</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                  <button key={s} onClick={() => setStyle(s)} className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${style === s ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex-none bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5"><HardDrive size={14} /> Resources</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Total</div>
                <div className="text-xl font-black text-white">{blockCount}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Inventory</div>
                <div className="text-sm font-black text-white leading-tight">{inventoryStats.stacks} <span className="text-[8px] text-zinc-500 uppercase">Stacks</span></div>
                <div className="text-[10px] text-indigo-400">+{inventoryStats.blocks} items</div>
              </div>
            </div>
          </section>
        </div>

        {/* RESTORED: Preview Area with original top-bar inside */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[450px] lg:min-h-0">
          <div className="bg-[#09090b] border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full relative">
            <div className="flex-none bg-[#111114]/90 backdrop-blur-xl p-3 md:p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Move size={12} className="text-zinc-600" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 tabular-nums">{width}x{height}</span>
                  </div>
                  {hoverCoord && (
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 tabular-nums animate-in fade-in zoom-in-95 duration-200">
                      X:{hoverCoord.x} Y:{hoverCoord.y}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-2 text-zinc-500 hover:text-white">-</button>
                  <span className="text-[10px] font-mono text-zinc-600">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 text-zinc-500 hover:text-white">+</button>
                  <button onClick={() => { setWidth(32); setHeight(32); setZoom(1); }} className="p-2 bg-black/60 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all"><RotateCcw size={14} /></button>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 bg-[#050507] overflow-auto relative no-scrollbar group touch-auto">
              <div className="min-w-full min-h-full flex items-center justify-center p-12 md:p-24">
                <canvas 
                  ref={canvasRef} 
                  onPointerMove={handlePointerMove} 
                  onPointerLeave={() => setHoverCoord(null)}
                  className="shadow-2xl border border-zinc-900 cursor-crosshair touch-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
