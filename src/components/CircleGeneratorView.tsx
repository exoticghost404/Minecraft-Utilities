// This component provides a pixel-accurate circle and ellipse generator for Minecraft builds.
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Circle, Maximize, Hash, RotateCcw, Box, ZoomIn, ZoomOut, Target, Move, Layout, MousePointer2} from 'lucide-react';

interface CircleGeneratorViewProps {
  onBack: () => void;
}

type RenderStyle = 'outline' | 'filled';

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [style, setStyle] = useState<RenderStyle>('outline');
  const [isLocked, setIsLocked] = useState(true);
  const [showGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Precision circle/ellipse calculation using the midpoint circle algorithm principles
  const gridData = useMemo(() => {
    const data: boolean[][] = [];
    const rx = width / 2;
    const ry = height / 2;

    for (let y = 0; y < height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < width; x++) {
        const dx = (x + 0.5) - rx;
        const dy = (y + 0.5) - ry;
        const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

        if (style === 'filled') {
          row.push(dist <= 1.0);
        } else {
          const isInside = dist <= 1.0;
          if (!isInside) {
            row.push(false);
            continue;
          }
          const nxL = ((x - 0.5) - rx)**2 / (rx*rx) + (dy*dy)/(ry*ry);
          const nxR = ((x + 1.5) - rx)**2 / (rx*rx) + (dy*dy)/(ry*ry);
          const nyT = (dx*dx)/(rx*rx) + ((y - 0.5) - ry)**2 / (ry*ry);
          const nyB = (dx*dx)/(rx*rx) + ((y + 1.5) - ry)**2 / (ry*ry);
          const isEdge = nxL > 1.0 || nxR > 1.0 || nyT > 1.0 || nyB > 1.0;
          row.push(isEdge);
        }
      }
      data.push(row);
    }
    return data;
  }, [width, height, style]);

  const blockCount = useMemo(() => {
    return gridData.reduce((acc, row) => acc + row.filter(cell => cell).length, 0);
  }, [gridData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseCellSize = 12;
    const cellSize = Math.max(1, baseCellSize * zoom);
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#6366f1'; 
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gridData[y][x]) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - (cellSize > 4 ? 0.5 : 0), cellSize - (cellSize > 4 ? 0.5 : 0));
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

    if (hoverCoord) {
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
    const padding = window.innerWidth < 768 ? 40 : 120;
    const scaleW = (clientWidth - padding) / (width * 12);
    const scaleH = (clientHeight - padding) / (height * 12);
    setZoom(Math.min(scaleW, scaleH, 2.5));
  };

  const updateWidth = (val: number) => {
    const v = Math.max(1, Math.min(128, val));
    setWidth(v);
    if (isLocked) setHeight(v);
  };

  const updateHeight = (val: number) => {
    const v = Math.max(1, Math.min(128, val));
    setHeight(v);
    if (isLocked) setWidth(v);
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
               <p className="text-[10px] md:text-xs text-zinc-500">Advanced Architectural Blueprint</p>
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
                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border active:scale-95 ${
                  isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {isLocked ? 'Circle Locked' : 'Free Ellipse'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Width</span>
                  <span className="text-indigo-400 font-mono text-sm tabular-nums">{width}</span>
                </div>
                <input type="range" min="1" max="128" value={width} onChange={(e) => updateWidth(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Height</span>
                  <span className="text-indigo-400 font-mono text-sm tabular-nums">{height}</span>
                </div>
                <input type="range" min="1" max="128" value={height} onChange={(e) => updateHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-900 space-y-4">
              <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                 <Layout size={14} /> Render Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setStyle('outline')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                    style === 'outline' ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <Circle size={20} className={style === 'outline' ? 'fill-none stroke-[3]' : 'fill-none stroke-2'} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Outline</span>
                </button>
                <button 
                  onClick={() => setStyle('filled')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                    style === 'filled' ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <Circle size={20} className={style === 'filled' ? 'fill-current' : 'fill-zinc-800'} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Filled</span>
                </button>
              </div>
            </div>
          </section>

          <section className="flex-none bg-[#111114]/50 border border-zinc-900 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden group">
            <h3 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5 mb-5">
              <Hash size={14} /> Material Cost
            </h3>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl md:text-4xl font-black text-white tabular-nums">{blockCount}</span>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Blocks</span>
            </div>
            <div className="bg-black/40 rounded-xl md:rounded-2xl p-4 border border-zinc-900 flex items-center gap-4">
              <div className="p-2 md:p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Box className="text-indigo-400" size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Inventory</div>
                <div className="text-xs md:text-sm font-black text-zinc-300 tabular-nums truncate">
                  {Math.floor(blockCount / 64)} Stacks + {blockCount % 64} Blocks
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[450px] lg:min-h-0">
           <div className="bg-[#09090b] border border-zinc-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full relative">
              <div className="flex-none bg-[#111114]/90 backdrop-blur-xl p-3 md:p-4 border-b border-zinc-900 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
                  <div className="flex items-center gap-3 md:gap-5 overflow-x-auto no-scrollbar flex-1 min-w-0">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Move size={12} className="text-zinc-600 md:w-[14px]" />
                      <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Area</span>
                      <span className="text-[10px] font-mono font-bold text-zinc-700 tabular-nums ml-1">
                        {width}x{height}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />
                    
                    {/* Magnifier Scroll Bar (Zoom Slider) */}
                    <div className="flex items-center gap-2 md:gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-800/50 group/zoom">
                      <ZoomOut size={12} className="text-zinc-600 group-hover/zoom:text-zinc-400 transition-colors" />
                      <input 
                        type="range" 
                        min="0.2" 
                        max="4" 
                        step="0.1" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))} 
                        className="w-20 md:w-32 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                      />
                      <ZoomIn size={12} className="text-zinc-600 group-hover/zoom:text-zinc-400 transition-colors" />
                      <div className="h-3 w-[1px] bg-zinc-800 mx-1" />
                      <span className="text-[9px] font-mono font-bold text-indigo-400 tabular-nums min-w-[30px]">{Math.round(zoom * 100)}%</span>
                    </div>

                    <div className="h-4 w-[1px] bg-zinc-800 shrink-0 hidden sm:block" />
                    <div className="min-w-[80px] md:min-w-[120px] hidden sm:block">
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
                      onClick={handleFitDesign} 
                      className="p-2 md:px-5 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                      title="Fit Design"
                    >
                      <Target size={14} /> <span className="hidden sm:inline">Fit Design</span>
                    </button>
                    
                    <button 
                      onClick={() => { setWidth(32); setHeight(32); setZoom(1); setStyle('outline'); }} 
                      className="p-2 bg-black/60 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all active:scale-90"
                      title="Reset Camera"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
              </div>

              <div 
                ref={containerRef}
                className="flex-1 bg-[#050507] overflow-auto flex items-center justify-center relative no-scrollbar group p-4 md:p-8 touch-none"
                style={{ 
                  backgroundImage: showGrid ? 'radial-gradient(circle, #18181b 1.5px, transparent 1.5px)' : 'none',
                  backgroundSize: '40px 40px'
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  onPointerMove={handlePointerMove} 
                  onPointerLeave={() => setHoverCoord(null)}
                  className="shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-zinc-900 cursor-crosshair transition-opacity duration-300 rounded touch-none"
                />
              </div>
           </div>
           
           {/* Mobile Coordinate Display */}
           <div className="flex sm:hidden items-center justify-between px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl mt-3">
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
