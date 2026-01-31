import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Circle, Maximize, RotateCcw, Target, Move, 
  Layout, MousePointer2, Lock, Unlock, HardDrive, 
  ZoomIn, Copy, Check 
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
  const [showGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized circle/ellipse calculation
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
            const isEdge = !isInside(x - 1, y) || !isInside(x + 1, y) || !isInside(x, y - 1) || !isInside(x, y + 1) ||
                           !isInside(x - 1, y - 1) || !isInside(x + 1, y + 1) || !isInside(x - 1, y + 1) || !isInside(x + 1, y - 1);
            row.push(isEdge);
          }
        } else {
          if (!inside) {
            row.push(false);
          } else {
            const xVal = xDistSq[x];
            const yVal = dyDistSq;
            let isEdge = false;
            if (xVal > yVal) {
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
    return { stacks, blocks };
  }, [blockCount]);

  // Handle Clipboard
  const copyDetails = () => {
    const text = `Minecraft Blueprint: ${width}x${height} ${style} circle. Blocks needed: ${blockCount} (${inventoryStats.stacks} stacks + ${inventoryStats.blocks}).`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Performance optimization
    if (!ctx) return;

    const baseCellSize = 16; // Increased base size for mobile visibility
    const cellSize = Math.max(0.1, baseCellSize * zoom);
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    
    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cellSize > 0.5) {
        ctx.fillStyle = '#6366f1'; 
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (gridData[y][x]) {
              ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
            }
          }
        }

        if (showGrid && cellSize > 5) {
          ctx.beginPath();
          ctx.strokeStyle = '#18181b'; 
          ctx.lineWidth = 1;
          for (let x = 0; x <= width; x++) { ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, canvas.height); }
          for (let y = 0; y <= height; y++) { ctx.moveTo(0, y * cellSize); ctx.lineTo(canvas.width, y * cellSize); }
          ctx.stroke();

          // Center axes
          ctx.beginPath();
          ctx.strokeStyle = '#3f3f46';
          const midX = Math.floor(width / 2);
          const midY = Math.floor(height / 2);
          ctx.moveTo(midX * cellSize, 0); ctx.lineTo(midX * cellSize, canvas.height);
          ctx.moveTo(0, midY * cellSize); ctx.lineTo(canvas.width, midY * cellSize);
          ctx.stroke();
        }
    }

    if (hoverCoord) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverCoord.x * cellSize, hoverCoord.y * cellSize, cellSize, cellSize);
    }
  }, [gridData, showGrid, zoom, hoverCoord, width, height]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cellSize = rect.width / width;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x >= 0 && x < width && y >= 0 && y < height) setHoverCoord({ x, y });
    else setHoverCoord(null);
  };

  const handleFitDesign = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 40;
    const scaleW = (clientWidth - padding) / (width * 16);
    const scaleH = (clientHeight - padding) / (height * 16);
    setZoom(Math.min(scaleW, scaleH, 2.0));
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-zinc-950 text-zinc-200 font-sans">
      {/* Header: Compact for Mobile */}
      <header className="flex-none bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm md:text-lg font-bold">Circle Generator</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Precision Blueprint</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={copyDetails}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">Copy Stats</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Sidebar: Scrollable on Desktop, Collapsible/Grid on Mobile */}
        <aside className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950/50 overflow-y-auto no-scrollbar p-4 space-y-6 order-2 lg:order-1">
          
          {/* Dimensions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Dimensions</span>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className={`p-1.5 rounded-md border transition-all ${isLocked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
              >
                {isLocked ? <Lock size={14}/> : <Unlock size={14}/>}
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase">Width: {width}</label>
                <input 
                  type="range" min="1" max="256" value={width} 
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setWidth(v); if(isLocked) setHeight(v);
                  }}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase">Height: {height}</label>
                <input 
                  type="range" min="1" max="256" value={height} 
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setHeight(v); if(isLocked) setWidth(v);
                  }}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none accent-indigo-500 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* Render Style */}
          <div className="space-y-3">
            <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Outline Style</span>
            <div className="grid grid-cols-3 gap-2">
              {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                <button 
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight border transition-all ${style === s ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Card: Important for Survival Players */}
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 space-y-3">
             <div className="flex items-center gap-2 text-indigo-400">
                <HardDrive size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">Resources</span>
             </div>
             <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{blockCount}</span>
                <span className="text-xs text-zinc-500">Blocks</span>
             </div>
             <div className="text-[11px] text-zinc-400 font-medium">
               ≈ {inventoryStats.stacks} stacks + {inventoryStats.blocks} items
             </div>
          </div>
        </aside>

        {/* Canvas Area: Flexible */}
        <main className="flex-1 relative bg-[#050507] overflow-hidden order-1 lg:order-2 flex flex-col">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MousePointer2 size={12} className="text-zinc-500" />
                <span className="text-[10px] font-mono text-indigo-400">
                  {hoverCoord ? `${hoverCoord.x}, ${hoverCoord.y}` : '--, --'}
                </span>
              </div>
              <div className="w-[1px] h-3 bg-zinc-800" />
              <div className="flex items-center gap-1">
                <ZoomIn size={12} className="text-zinc-500" />
                <span className="text-[10px] font-mono text-zinc-400">{Math.round(zoom * 100)}%</span>
              </div>
            </div>

            <div className="pointer-events-auto flex gap-2">
              <button onClick={handleFitDesign} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all shadow-xl">
                <Target size={18} />
              </button>
              <button 
                onClick={() => { setWidth(32); setHeight(32); setZoom(1); }}
                className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all shadow-xl"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-8 md:p-20 no-scrollbar touch-auto"
          >
             <canvas 
               ref={canvasRef} 
               onPointerMove={handlePointerMove}
               onPointerLeave={() => setHoverCoord(null)}
               className="image-pixelated shadow-2xl ring-1 ring-zinc-800 transition-shadow duration-300"
               style={{ 
                 imageRendering: 'pixelated',
                 touchAction: 'none' 
               }}
             />
          </div>

          {/* Zoom Slider for Mobile (Bottom Over Canvas) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800/50 flex items-center gap-3">
            <span className="text-[10px] text-zinc-500">-</span>
            <input 
              type="range" min="0.1" max="3" step="0.1" value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))} 
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none accent-indigo-500"
            />
            <span className="text-[10px] text-zinc-500">+</span>
          </div>
        </main>
      </div>

      {/* Global CSS for Pixel Art Rendering */}
      <style dangerouslySetInnerHTML={{ __html: `
        .image-pixelated {
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-crisp-edges;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
        input[type='range']::-webkit-slider-thumb {
          width: 16px;
          height: 16px;
          background: #6366f1;
          border-radius: 50%;
          cursor: pointer;
          appearance: none;
        }
      `}} />
    </div>
  );
};
