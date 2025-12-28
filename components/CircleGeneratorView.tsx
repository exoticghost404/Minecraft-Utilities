// This component provides a pixel-accurate circle and ellipse generator for Minecraft builds.
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Circle, Maximize, RotateCcw, Target, Move, Layout, MousePointer2, Lock, Unlock, HardDrive } from 'lucide-react';

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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized circle/ellipse calculation to reduce lag at 256x256
  const gridData = useMemo(() => {
    const data: boolean[][] = [];
    const rx = width / 2;
    const ry = height / 2;
    const rxSq = rx * rx;
    const rySq = ry * ry;

    // Pre-calculate squared X-distances for the entire width to save cycles in the inner loop
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
      const dy = (y + 0.5) - ry;
      const dyDistSq = (dy * dy) / rySq;

      for (let x = 0; x < width; x++) {
        const inside = xDistSq[x] + dyDistSq <= 1.0;

        if (style === 'filled') {
          row.push(inside);
        } else if (style === 'thick') {
          if (!inside) {
            row.push(false);
          } else {
            // Check boundary logic
            const isEdge = !isInside(x - 1, y) || !isInside(x + 1, y) || !isInside(x, y - 1) || !isInside(x, y + 1) ||
                           !isInside(x - 1, y - 1) || !isInside(x + 1, y + 1) || !isInside(x - 1, y + 1) || !isInside(x + 1, y - 1);
            row.push(isEdge);
          }
        } else {
          // Thin outline optimization
          if (!inside) {
            row.push(false);
          } else {
            const xVal = xDistSq[x];
            const yVal = dyDistSq;
            let isEdge = false;
            if (xVal > yVal) {
                // If we move one step further in the dominant direction, are we outside?
                const dxNext = (x + (x + 0.5 > rx ? 1.5 : -0.5)) - rx;
                isEdge = (dxNext * dxNext) / rxSq + dyDistSq > 1.0;
            } else {
                const dyNext = (y + (y + 0.5 > ry ? 1.5 : -0.5)) - ry;
                isEdge = xDistSq[x] + (dyNext * dyNext) / rySq > 1.0;
            }
            row.push(isEdge);
          }
        }
      }
      data.push(row);
    }
    return data;
  }, [width, height, style]);

  const blockCount = useMemo(() => {
    return gridData.reduce((acc, row) => acc + row.filter(cell => cell).length, 0);
  }, [gridData]);

  const inventoryStats = useMemo(() => {
    const stacks = Math.floor(blockCount / 64);
    const blocks = blockCount % 64;
    const stackLabel = stacks === 1 ? 'stack' : 'stacks';
    return { stacks, blocks, stackLabel };
  }, [blockCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseCellSize = 12;
    const cellSize = Math.max(0.1, baseCellSize * zoom);
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cellSize > 0.5) {
        ctx.fillStyle = '#6366f1'; 
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (gridData[y][x]) {
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
          }
        }

        if (showGrid && cellSize > 4) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)'; 
          ctx.lineWidth = 0.5;
          for (let x = 0; x <= width; x++) { ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, canvas.height); }
          for (let y = 0; y <= height; y++) { ctx.moveTo(0, y * cellSize); ctx.lineTo(canvas.width, y * cellSize); }
          ctx.stroke();

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(161, 161, 170, 0.3)'; 
          ctx.lineWidth = 1.5;
          const midX = Math.floor(width / 2);
          const midY = Math.floor(height / 2);
          ctx.moveTo(midX * cellSize, 0); ctx.lineTo(midX * cellSize, canvas.height);
          ctx.moveTo(0, midY * cellSize); ctx.lineTo(canvas.width, midY * cellSize);
          ctx.stroke();
        }
    }

    if (hoverCoord && cellSize > 2) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(1, cellSize * 0.1);
      ctx.strokeRect(hoverCoord.x * cellSize, hoverCoord.y * cellSize, cellSize, cellSize);
    }
  }, [gridData, showGrid, zoom, hoverCoord, width, height]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cellSize = canvas.width / width;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < width && y >= 0 && y < height) setHoverCoord({ x, y });
    else setHoverCoord(null);
  };

  const handleFitDesign = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 120;
    const scaleW = (clientWidth - padding) / (width * 12);
    const scaleH = (clientHeight - padding) / (height * 12);
    setZoom(Math.min(scaleW, scaleH, 2.0));
  };

  const updateWidth = (val: number) => {
    const v = isNaN(val) ? 1 : Math.max(1, Math.min(256, val));
    setWidth(v);
    if (isLocked) setHeight(v);
  };

  const updateHeight = (val: number) => {
    const v = isNaN(val) ? 1 : Math.max(1, Math.min(256, val));
    setHeight(v);
    if (isLocked) setWidth(v);
  };

  const updateZoomManual = (val: number) => {
    const v = isNaN(val) ? 0 : Math.max(0, Math.min(200, val));
    setZoom(v / 100);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <header className="flex-none bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <button 
            onClick={onBack}
            className="mb-2 md:mb-3 flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors text-xs md:text-sm font-medium active:scale-95"
          >
            <ArrowLeft size={16} /> Back to Tools
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
               <Circle className="text-indigo-400 w-5 h-5 md:w-6 md:h-6" size={24} />
             </div>
             <div>
               <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                 Circle Generator
               </h1>
               <p className="text-[10px] md:text-xs text-zinc-500">Precision Blueprint</p>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar pb-6 lg:pb-0">
          <section className="flex-none bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                <Maximize size={14} /> Dimensions
              </h3>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border active:scale-95 flex items-center gap-2 ${
                  isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {isLocked ? <Lock size={12}/> : <Unlock size={12}/>}
                {isLocked ? 'Circle' : 'Ellipse'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Width</span>
                  <input type="number" value={width} onChange={(e) => updateWidth(parseInt(e.target.value))} className="bg-transparent text-indigo-400 font-mono text-sm tabular-nums w-14 text-right outline-none border-b border-zinc-800 focus:border-indigo-500" />
                </div>
                <input type="range" min="1" max="256" value={width} onChange={(e) => updateWidth(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Height</span>
                  <input type="number" value={height} onChange={(e) => updateHeight(parseInt(e.target.value))} className="bg-transparent text-indigo-400 font-mono text-sm tabular-nums w-14 text-right outline-none border-b border-zinc-800 focus:border-indigo-500" />
                </div>
                <input type="range" min="1" max="256" value={height} onChange={(e) => updateHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-900 space-y-4">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                 <Layout size={14} /> Render Style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                    <button 
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${
                            style === s ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400'
                        }`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest">{s}</span>
                    </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex-none bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl space-y-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
              <Move size={14} /> View Settings
            </h3>
            
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                            <span>Zoom</span>
                            <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={Math.round(zoom * 100)} 
                                  onChange={(e) => updateZoomManual(parseInt(e.target.value))}
                                  className="bg-transparent text-indigo-400 font-mono text-sm tabular-nums w-12 text-right outline-none border-b border-zinc-800 focus:border-indigo-500" 
                                />
                                <span className="text-zinc-600 text-xs font-mono">%</span>
                            </div>
                        </div>
                        <input type="range" min="0" max="2" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                    <button onClick={handleFitDesign} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-90 transition-transform shadow-lg"><Target size={16}/></button>
                </div>
            </div>

            <div className="pt-5 border-t border-zinc-900 space-y-4">
                <h4 className="text-[10px] md:text-[11px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                    <HardDrive size={12} /> Material Statistics
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 shadow-inner flex flex-col justify-center">
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Total Blocks</div>
                        <div className="text-2xl font-black text-white tabular-nums">{blockCount}</div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800 shadow-inner flex flex-col justify-center">
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Inventory</div>
                        <div className="text-xl md:text-2xl font-black text-white tabular-nums leading-none flex items-baseline gap-1">
                          <span>{inventoryStats.stacks}</span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{inventoryStats.stackLabel}</span>
                          <span className="text-zinc-500 text-sm mx-0.5">+</span>
                          <span>{inventoryStats.blocks}</span>
                        </div>
                    </div>
                </div>
            </div>
          </section>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[450px] lg:min-h-0">
           <div className="bg-[#09090b] border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full relative">
              <div className="flex-none bg-[#111114]/90 backdrop-blur-xl p-3 md:p-4 border-b border-zinc-800 flex wrap items-center justify-between gap-3 shrink-0 z-20">
                  <div className="flex items-center gap-3 md:gap-5 overflow-x-auto no-scrollbar flex-1 min-w-0">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Move size={12} className="text-zinc-600 md:w-[14px]" />
                      <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Scale</span>
                      <span className="text-[10px] font-mono font-bold text-zinc-700 tabular-nums ml-1">
                        {width}x{height}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />
                    
                    <div className="min-w-[80px] md:min-w-[120px]">
                      {hoverCoord ? (
                        <span className="text-[9px] md:text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-indigo-500/20 block text-center tabular-nums animate-in fade-in zoom-in-95 duration-200">
                          X:{hoverCoord.x} Y:{hoverCoord.y}
                        </span>
                      ) : (
                        <span className="text-[9px] md:text-[10px] font-mono text-zinc-700 flex items-center justify-center gap-1.5 opacity-50">
                          <MousePointer2 size={10} /> Hover Grid
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3 ml-auto shrink-0">
                    <button 
                      onClick={() => { setWidth(32); setHeight(32); setZoom(1); setStyle('thin'); }} 
                      className="p-2 bg-black/60 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all active:scale-90"
                      title="Reset Blueprint"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
              </div>

              {/* Grid Centered Container */}
              <div 
                ref={containerRef}
                className="flex-1 bg-[#050507] overflow-auto relative no-scrollbar group touch-none"
                style={{ 
                  backgroundImage: showGrid ? 'radial-gradient(circle, #18181b 1.5px, transparent 1.5px)' : 'none',
                  backgroundSize: '40px 40px'
                }}
              >
                <div className="min-w-full min-h-full grid place-items-center p-24 md:p-32 lg:p-48">
                    <canvas 
                    ref={canvasRef} 
                    onPointerMove={handlePointerMove} 
                    onPointerLeave={() => setHoverCoord(null)}
                    className="shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-zinc-900 cursor-crosshair transition-all duration-300 rounded touch-none"
                    />
                </div>
              </div>
           </div>
           
           {/* Mobile Coordinate Display */}
           <div className="flex sm:hidden items-center justify-between px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl mt-3 shadow-lg">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><MousePointer2 size={12}/> Focus</span>
              {hoverCoord ? (
                <span className="text-xs font-mono font-bold text-indigo-400 tabular-nums">X:{hoverCoord.x} Y:{hoverCoord.y}</span>
              ) : (
                <span className="text-xs font-mono text-zinc-700">-- : --</span>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};
