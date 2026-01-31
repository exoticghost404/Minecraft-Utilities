import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Circle, Maximize, RotateCcw, Target, Move, 
  Layout, MousePointer2, Lock, Unlock, HardDrive, 
  Download, Ruler, Palette 
} from 'lucide-react';

// ... previous interface and types ...

export const CircleGeneratorView: React.FC<CircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [style, setStyle] = useState<RenderStyle>('thin');
  const [isLocked, setIsLocked] = useState(true);
  const [showRulers, setShowRulers] = useState(true); // New: Ruler mode
  const [zoom, setZoom] = useState(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 1. ENHANCED ALGORITHM: Midpoint/Bresenham Logic ---
  const gridData = useMemo(() => {
    const data = Array.from({ length: height }, () => new Array(width).fill(false));
    const rx = width / 2;
    const ry = height / 2;

    if (style === 'filled') {
      // Standard geometric fill is best for solid shapes
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = (x + 0.5) - rx;
          const dy = (y + 0.5) - ry;
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) data[y][x] = true;
        }
      }
    } else {
      // "Perfect" Outline Algorithm: Prevents ugly double-diagonals
      // We iterate through angles to ensure a continuous 1-block thick line
      const segments = Math.max(width, height) * 4; 
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.floor(rx + (rx - 0.5) * Math.cos(theta));
        const y = Math.floor(ry + (ry - 0.5) * Math.sin(theta));
        if (x >= 0 && x < width && y >= 0 && y < height) {
          data[y][x] = true;
          // For thick mode, we fill the immediate neighbors
          if (style === 'thick') {
             if (x + 1 < width) data[y][x+1] = true;
             if (y + 1 < height) data[y+1][x] = true;
          }
        }
      }
    }
    return data;
  }, [width, height, style]);

  // --- 2. PNG EXPORT FUNCTION ---
  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas for a clean export without UI guides
    const exportCanvas = document.createElement('canvas');
    const size = 16; // Export blocks at 16x16 pixels
    exportCanvas.width = width * size;
    exportCanvas.height = height * size;
    const eCtx = exportCanvas.getContext('2d');
    if (!eCtx) return;

    eCtx.fillStyle = '#111114'; // Dark background
    eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    eCtx.fillStyle = '#6366f1';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gridData[y][x]) {
          eCtx.fillRect(x * size, y * size, size, size);
        }
      }
    }

    const link = document.createElement('a');
    link.download = `minecraft-circle-${width}x${height}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  };

  // --- 3. RENDERING WITH RULERS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = Math.max(1, 12 * zoom);
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gridData[y][x]) {
          // Visual highlight for every 5th or 10th block (Rulers)
          if (showRulers && ((x + 1) % 10 === 0 || (y + 1) % 10 === 0)) {
            ctx.fillStyle = '#818cf8'; // Lighter indigo for 10s
          } else if (showRulers && ((x + 1) % 5 === 0 || (y + 1) % 5 === 0)) {
            ctx.fillStyle = '#4f46e5'; // Darker for 5s
          } else {
            ctx.fillStyle = '#6366f1';
          }
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
    
    // Draw Grid Lines
    if (cellSize > 5) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, canvas.height);
      }
      for (let i = 0; i <= height; i++) {
        ctx.moveTo(0, i * cellSize); ctx.lineTo(canvas.width, i * cellSize);
      }
      ctx.stroke();
    }
  }, [gridData, zoom, width, height, showRulers]);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden font-sans">
      {/* HEADER (Restored original style) */}
      <header className="flex-none bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-end">
          <div>
            <button onClick={onBack} className="mb-2 flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors text-xs font-medium uppercase tracking-widest">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                <Circle className="text-indigo-400 w-6 h-6" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Circle Pro</h1>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={exportAsPNG} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
                <Download size={14} /> Export PNG
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          {/* DIMENSIONS */}
          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Maximize size={14} /> Size
              </h3>
              <button onClick={() => setIsLocked(!isLocked)} className="text-zinc-500 hover:text-indigo-400">
                {isLocked ? <Lock size={16}/> : <Unlock size={16}/>}
              </button>
            </div>
            <div className="space-y-4">
              {['Width', 'Height'].map((label, i) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                    <span>{label}</span>
                    <span className="text-indigo-400 font-mono">{i === 0 ? width : height}</span>
                  </div>
                  <input 
                    type="range" min="1" max="256" 
                    value={i === 0 ? width : height} 
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (i === 0) { setWidth(v); if(isLocked) setHeight(v); }
                      else { setHeight(v); if(isLocked) setWidth(v); }
                    }}
                    className="w-full accent-indigo-500" 
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ADVANCED VIEW OPTIONS */}
          <section className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Ruler size={14} /> Build Aids
            </h3>
            <button 
              onClick={() => setShowRulers(!showRulers)}
              className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${showRulers ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}
            >
              <span className="text-xs font-bold uppercase">Guide Rulers (5x5)</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showRulers ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${showRulers ? 'left-5' : 'left-1'}`} />
              </div>
            </button>
            
            <div className="grid grid-cols-3 gap-2">
              {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${style === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}>
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#09090b] border border-zinc-900 rounded-[2rem] overflow-hidden relative shadow-2xl">
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-[#111114]/50">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Coord:</span>
                <span className="text-[10px] font-mono text-indigo-400">{hoverCoord ? `${hoverCoord.x}, ${hoverCoord.y}` : '--, --'}</span>
             </div>
             <div className="flex items-center gap-4">
                <input type="range" min="0.1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-24 accent-zinc-700" />
                <button onClick={() => setZoom(1)} className="text-zinc-500 hover:text-white"><Target size={14}/></button>
             </div>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-12 no-scrollbar">
            <canvas 
              ref={canvasRef} 
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverCoord(null)}
              className="image-pixelated shadow-[0_0_80px_rgba(99,102,241,0.1)]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
