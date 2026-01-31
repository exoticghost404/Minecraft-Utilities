import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Circle, Maximize, RotateCcw, Target, Move, 
  Layout, MousePointer2, Lock, Unlock, HardDrive, 
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
  const [zoom, setZoom] = useState(1);
  const [hoverCoord, setHoverCoord] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- SYMMETRICAL ALGORITHM ---
  const gridData = useMemo(() => {
    const data = Array.from({ length: height }, () => new Array(width).fill(false));
    const rx = width / 2;
    const ry = height / 2;

    const plot = (x: number, y: number) => {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
        data[iy][ix] = true;
      }
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
      // Step-based outline for precision
      const precision = Math.max(width, height) * 10;
      for (let i = 0; i <= precision; i++) {
        const angle = (i / precision) * Math.PI * 2;
        // The "-0.5" adjustment aligns the circle to the Minecraft grid centers
        const x = rx + (rx - 0.5) * Math.cos(angle);
        const y = ry + (ry - 0.5) * Math.sin(angle);
        plot(x, y);
        
        if (style === 'thick') {
          plot(x + 0.5, y);
          plot(x, y + 0.5);
        }
      }
    }
    return data;
  }, [width, height, style]);

  const blockCount = useMemo(() => gridData.reduce((acc, row) => acc + row.filter(c => c).length, 0), [gridData]);

  // --- DRAWING LOGIC (Fixed Black Screen Issue) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseCellSize = 16;
    const cellSize = Math.max(1, baseCellSize * zoom);
    
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // 1. Force Clear/Background
    ctx.fillStyle = '#09090b'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Blocks
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (gridData[y][x]) {
          if (showRulers && ((x + 1) % 10 === 0 || (y + 1) % 10 === 0)) {
            ctx.fillStyle = '#818cf8'; // 10th block marker
          } else if (showRulers && ((x + 1) % 5 === 0 || (y + 1) % 5 === 0)) {
            ctx.fillStyle = '#4f46e5'; // 5th block marker
          } else {
            ctx.fillStyle = '#6366f1'; // Standard indigo
          }
          ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    // 3. Hover Highlight
    if (hoverCoord) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverCoord.x * cellSize, hoverCoord.y * cellSize, cellSize, cellSize);
    }
  }, [gridData, zoom, width, height, showRulers, hoverCoord]);

  const exportAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `circle-${width}x${height}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
      <header className="flex-none bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-all"><ArrowLeft size={18}/></button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Circle Blueprint</h1>
          </div>
          <button onClick={exportAsPNG} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold active:scale-95"><Download size={14}/> Save PNG</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* SIDEBAR */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between text-zinc-500 uppercase text-[10px] font-black tracking-widest">
              <span>Dimensions</span>
              <button onClick={() => setIsLocked(!isLocked)}>{isLocked ? <Lock size={14}/> : <Unlock size={14}/>}</button>
            </div>
            <div className="space-y-4">
              {['Width', 'Height'].map((l, i) => (
                <div key={l}>
                  <div className="flex justify-between text-xs font-mono text-indigo-400 mb-2"><span>{l}</span><span>{i===0?width:height}</span></div>
                  <input type="range" min="1" max="128" value={i===0?width:height} onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if(i===0){ setWidth(v); if(isLocked) setHeight(v); }
                    else { setHeight(v); if(isLocked) setWidth(v); }
                  }} className="w-full accent-indigo-500"/>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111114]/50 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-black tracking-widest"><Layout size={14}/> Style</div>
            <div className="grid grid-cols-3 gap-2">
              {(['thin', 'thick', 'filled'] as RenderStyle[]).map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${style === s ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{s}</button>
              ))}
            </div>
            <button onClick={() => setShowRulers(!showRulers)} className={`w-full py-3 rounded-xl border text-[10px] font-bold uppercase flex items-center justify-center gap-2 ${showRulers ? 'border-indigo-500/50 text-indigo-400' : 'border-zinc-800 text-zinc-600'}`}><Ruler size={14}/> Guide Rulers {showRulers ? 'ON' : 'OFF'}</button>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
            <div className="text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-4">Material Estimate</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{blockCount}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase">Blocks</span>
            </div>
            <div className="mt-1 text-sm text-indigo-400/80 font-mono">
              {Math.floor(blockCount/64)} stacks + {blockCount % 64}
            </div>
          </div>
        </div>

        {/* PREVIEW CANVAS */}
        <div className="lg:col-span-8 flex flex-col bg-[#050507] border border-zinc-900 rounded-[2rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-md p-2 rounded-lg border border-zinc-800">
             <MousePointer2 size={12} className="text-zinc-500"/>
             <span className="text-[10px] font-mono text-indigo-400">{hoverCoord ? `${hoverCoord.x}, ${hoverCoord.y}` : '--, --'}</span>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
             <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="w-8 h-8 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">+</button>
             <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.1))} className="w-8 h-8 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">-</button>
             <button onClick={() => setZoom(1)} className="w-8 h-8 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400"><RotateCcw size={14}/></button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-12 no-scrollbar scroll-smooth">
            <canvas 
              ref={canvasRef} 
              onPointerMove={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if(!rect) return;
                const cs = rect.width / width;
                setHoverCoord({ x: Math.floor((e.clientX - rect.left) / cs), y: Math.floor((e.clientY - rect.top) / cs) });
              }}
              onPointerLeave={() => setHoverCoord(null)}
              className="shadow-[0_0_100px_rgba(0,0,0,0.5)]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
