
// This component provides a pixel-accurate circle and ellipse generator for Minecraft builds.
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Circle, Maximize, Hash, Info, RotateCcw, Grid, Box, ZoomIn, ZoomOut, Target, Move, Layout } from 'lucide-react';

interface CircleGeneratorViewProps {
  onBack: () => void;
}

type RenderStyle = 'outline' | 'filled';

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(64);
  const [height, setHeight] = useState(64);
  const [style, setStyle] = useState<RenderStyle>('outline');
  const [isLocked, setIsLocked] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
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
          // Simple edge detection: if any neighbor is outside the ellipse, this is an edge
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

  // High-performance canvas drawing for the pixel grid
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

    ctx.fillStyle = '#6366f1'; // Indigo-500
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Tools
          </button>
          
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
               <Circle className="text-indigo-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                 Pixel Circle Generator
               </h1>
               <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Advanced Architectural Blueprint</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                <Maximize size={14} /> Dimensions
              </h3>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                  isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {isLocked ? 'Circle Locked' : 'Free Ellipse'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Width</span>
                  <span className="text-indigo-400 font-mono text-sm tabular-nums min-w-[3ch] text-right">{width}</span>
                </div>
                <input type="range" min="1" max="128" value={width} onChange={(e) => updateWidth(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Height</span>
                  <span className="text-indigo-400 font-mono text-sm tabular-nums min-w-[3ch] text-right">{height}</span>
                </div>
                <input type="range" min="1" max="128" value={height} onChange={(e) => updateHeight(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 space-y-4">
              <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5">
                 <Layout size={14} /> Style
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setStyle('outline')}
                  className={`flex flex-col items-center gap-2.5 p-6 rounded-2xl border transition-all ${
                    style === 'outline' ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <Circle size={22} className={style === 'outline' ? 'fill-none stroke-[3]' : 'fill-none stroke-2'} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Outline</span>
                </button>
                <button 
                  onClick={() => setStyle('filled')}
                  className={`flex flex-col items-center gap-2.5 p-6 rounded-2xl border transition-all ${
                    style === 'filled' ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400 shadow-xl' : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  }`}
                >
                  <Circle size={22} className={style === 'filled' ? 'fill-current' : 'fill-zinc-800'} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Filled</span>
                </button>
              </div>
            </div>
          </section>

          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Box size={140} />
            </div>
            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2.5 mb-6">
              <Hash size={14} /> Material Cost
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-white tabular-nums">{blockCount}</span>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Blocks</span>
            </div>
            <div className="bg-black/40 rounded-2xl p-4 border border-zinc-900 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Box className="text-indigo-400" size={20} />
              </div>
              <div>
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Total Requirement</div>
                <div className="text-sm font-black text-zinc-300 tabular-nums">
                  {Math.floor(blockCount / 64)} Stacks + {blockCount % 64} Blocks
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
           <div className="bg-[#09090b] border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col min-h-[680px] relative">
              <div className="bg-[#111114]/90 backdrop-blur-xl p-5 border-b border-zinc-900 flex items-center justify-between shrink-0 z-20">
                  <div className="flex items-center gap-5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Move size={14} /> Area
                    </span>
                    <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
                    <div className="min-w-[50px] text-center">
                      <span className="text-[10px] font-mono font-bold text-zinc-700 tabular-nums">
                        {width}x{height}
                      </span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
                    <div className="min-w-[120px]">
                      {hoverCoord && (
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 block text-center tabular-nums animate-in fade-in zoom-in-95 duration-200">
                          X: {hoverCoord.x} Y: {hoverCoord.y}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleFitDesign} 
                      className="flex items-center gap-2.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Target size={14} /> Fit Design
                    </button>
                    
                    <div className="flex items-center gap-4 bg-black/60 border border-zinc-900 px-4 py-1.5 rounded-2xl">
                      <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.2))} className="text-zinc-600 hover:text-zinc-400 transition-colors"><ZoomOut size={16} /></button>
                      <input 
                        type="range" 
                        min="0.2" 
                        max="4" 
                        step="0.1" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))} 
                        className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                      />
                      <button onClick={() => setZoom(prev => Math.min(4, prev + 0.2))} className="text-zinc-600 hover:text-zinc-400 transition-colors"><ZoomIn size={16} /></button>
                    </div>

                    <button 
                      onClick={() => { setWidth(64); setHeight(64); setZoom(1); setStyle('outline'); }} 
                      className="p-2.5 bg-black/60 border border-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
              </div>

              <div 
                ref={containerRef}
                className="flex-1 bg-[#050507] overflow-auto flex items-center justify-center relative custom-scrollbar group p-8"
                style={{ 
                  backgroundImage: showGrid ? 'radial-gradient(circle, #18181b 1.5px, transparent 1.5px)' : 'none',
                  backgroundSize: '40px 40px'
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  onMouseMove={handleMouseMove} 
                  onMouseLeave={() => setHoverCoord(null)}
                  className="shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-zinc-900 cursor-crosshair transition-opacity duration-300 rounded"
                />
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};
