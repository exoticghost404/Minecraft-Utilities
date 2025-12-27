
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Circle, Grid, Maximize, Boxes, Info, Layers, Box, ZoomIn, ZoomOut, Target, Maximize2, LayoutGrid, Type, Crosshair } from 'lucide-react';

interface PixelCircleGeneratorViewProps {
  onBack: () => void;
}

export const PixelCircleGeneratorView: React.FC<PixelCircleGeneratorViewProps> = ({ onBack }) => {
  const [width, setWidth] = useState(21);
  const [height, setHeight] = useState(21);
  const [filled, setFilled] = useState(false);
  const [forceCircle, setForceCircle] = useState(true);
  const [blockSize, setBlockSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showCenter, setShowCenter] = useState(true);
  
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{x: number, y: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    let count = 0;
    const rx = width / 2;
    const ry = height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x + 0.5) - rx;
        const dy = (y + 0.5) - ry;
        const isInside = Math.pow(dx / rx, 2) + Math.pow(dy / ry, 2) <= 1;

        if (isInside) {
          if (filled) {
            count++;
          } else {
            const neighbors = [
              { nx: x - 1, ny: y }, { nx: x + 1, ny: y },
              { nx: x, ny: y - 1 }, { nx: x, ny: y + 1 },
            ];
            const isEdge = neighbors.some(n => {
              if (n.nx < 0 || n.nx >= width || n.ny < 0 || n.ny >= height) return true;
              const ndx = (n.nx + 0.5) - rx;
              const ndy = (n.ny + 0.5) - ry;
              return Math.pow(ndx / rx, 2) + Math.pow(ndy / ry, 2) > 1;
            });
            if (isEdge) count++;
          }
        }
      }
    }
    return { blockCount: count };
  }, [width, height, filled]);

  const fitToView = () => {
    if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 100;
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;
        
        const sizeW = availableW / width;
        const sizeH = availableH / height;
        
        const newSize = Math.floor(Math.min(sizeW, sizeH));
        setBlockSize(Math.min(Math.max(1, newSize), 100));
    }
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const timer = setTimeout(fitToView, 50);
    return () => clearTimeout(timer);
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);
      
      const centerX = w / 2 + offset.x;
      const centerY = h / 2 + offset.y;
      const totalWidth = width * blockSize;
      const totalHeight = height * blockSize;
      const startX = centerX - totalWidth / 2;
      const startY = centerY - totalHeight / 2;

      // Drafting Paper Texture
      ctx.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 1;
      if (blockSize < 8) {
          ctx.beginPath();
          for(let x=0; x<w; x+=20) { ctx.moveTo(x,0); ctx.lineTo(x,h); }
          for(let y=0; y<h; y+=20) { ctx.moveTo(0,y); ctx.lineTo(w,y); }
          ctx.stroke();
      }

      // Grid Lines
      if (showGrid && blockSize > 2) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= width; i++) {
          const x = startX + i * blockSize;
          ctx.moveTo(x, startY);
          ctx.lineTo(x, startY + totalHeight);
        }
        for (let j = 0; j <= height; j++) {
          const y = startY + j * blockSize;
          ctx.moveTo(startX, y);
          ctx.lineTo(startX + totalWidth, y);
        }
        ctx.stroke();

        // 5x5 Major Grid
        if (blockSize > 4) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i <= width; i += 5) {
                const x = startX + i * blockSize;
                ctx.moveTo(x, startY);
                ctx.lineTo(x, startY + totalHeight);
            }
            for (let j = 0; j <= height; j += 5) {
                const y = startY + j * blockSize;
                ctx.moveTo(startX, y);
                ctx.lineTo(startX + totalWidth, y);
            }
            ctx.stroke();
        }
      }

      // Center Markers
      if (showCenter) {
        ctx.beginPath();
        ctx.strokeStyle = '#fbbf24'; // Amber
        ctx.lineWidth = 1.5;
        const midX = startX + (width / 2) * blockSize;
        const midY = startY + (height / 2) * blockSize;
        
        // Vertical Center Line
        ctx.moveTo(midX, startY - 20);
        ctx.lineTo(midX, startY + totalHeight + 20);
        
        // Horizontal Center Line
        ctx.moveTo(startX - 20, midY);
        ctx.lineTo(startX + totalWidth + 20, midY);
        ctx.stroke();

        // Center crosshair circles
        ctx.beginPath();
        ctx.arc(midX, midY, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Blocks
      const rx = width / 2;
      const ry = height / 2;
      ctx.fillStyle = '#6366f1'; 
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = (x + 0.5) - rx;
          const dy = (y + 0.5) - ry;
          const isInside = Math.pow(dx / rx, 2) + Math.pow(dy / ry, 2) <= 1;

          let active = false;
          if (isInside) {
            if (filled) {
              active = true;
            } else {
              const neighbors = [
                { nx: x - 1, ny: y }, { nx: x + 1, ny: y },
                { nx: x, ny: y - 1 }, { nx: x, ny: y + 1 },
              ];
              active = neighbors.some(n => {
                if (n.nx < 0 || n.nx >= width || n.ny < 0 || n.ny >= height) return true;
                const ndx = (n.nx + 0.5) - rx;
                const ndy = (n.ny + 0.5) - ry;
                return Math.pow(ndx / rx, 2) + Math.pow(ndy / ry, 2) > 1;
              });
            }
          }

          if (active) {
            const bx = startX + x * blockSize;
            const by = startY + y * blockSize;
            ctx.fillRect(bx + 0.5, by + 0.5, blockSize - 0.5, blockSize - 0.5);
            
            if (blockSize > 8) {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(bx + 0.5, by + 0.5, blockSize - 0.5, 1.5);
                ctx.fillRect(bx + 0.5, by + 0.5, 1.5, blockSize - 0.5);
                ctx.fillStyle = '#6366f1';
            }
          }
        }
      }

      // Labels (Numerical Coordinates)
      if (showLabels && blockSize > 10) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        
        for (let i = 0; i <= width; i += 10) {
           ctx.fillText(i.toString(), startX + i * blockSize, startY - 12);
           ctx.fillText(i.toString(), startX + i * blockSize, startY + totalHeight + 20);
        }
        
        ctx.textAlign = 'right';
        for (let j = 0; j <= height; j += 10) {
           ctx.fillText(j.toString(), startX - 12, startY + j * blockSize + 4);
           ctx.textAlign = 'left';
           ctx.fillText(j.toString(), startX + totalWidth + 12, startY + j * blockSize + 4);
           ctx.textAlign = 'right';
        }
      }
    };

    const animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame);
  }, [width, height, filled, blockSize, offset, showGrid, showLabels, showCenter]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - mousePos.x;
      const dy = e.clientY - mousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setMousePos({ x: e.clientX, y: e.clientY });
    }

    const canvas = canvasRef.current;
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2 + offset.x;
        const centerY = h / 2 + offset.y;
        const startX = centerX - (width * blockSize) / 2;
        const startY = centerY - (height * blockSize) / 2;
        
        const gridX = Math.floor((mx - startX) / blockSize);
        const gridY = Math.floor((my - startY) / blockSize);
        
        if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
            setHoverCoord({ x: gridX, y: gridY });
        } else {
            setHoverCoord(null);
        }
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWidthChange = (val: number) => {
    const newVal = Math.min(Math.max(1, val), 128);
    setWidth(newVal);
    if (forceCircle) setHeight(newVal);
  };

  const handleHeightChange = (val: number) => {
    const newVal = Math.min(Math.max(1, val), 128);
    setHeight(newVal);
    if (forceCircle) setWidth(newVal);
  };

  const toggleForceCircle = () => {
    setForceCircle(!forceCircle);
    if (!forceCircle) setHeight(width);
  };

  const stacks = Math.floor(stats.blockCount / 64);
  const remainder = stats.blockCount % 64;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 select-none">
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
               <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                 Pixel Circle Generator
               </h1>
               <p className="text-xs text-zinc-400">Professional Blueprint Architect</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Maximize size={14} /> Dimensions
                        </label>
                        <button 
                            onClick={toggleForceCircle}
                            className={`text-[10px] px-2 py-1 rounded border transition-all font-bold uppercase ${forceCircle ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                        >
                            {forceCircle ? 'Circle Locked' : 'Free Ellipse'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span>Width</span>
                                <span className="font-mono text-indigo-400">{width}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="128" 
                                value={width} 
                                onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-400">
                                <span>Height</span>
                                <span className="font-mono text-indigo-400">{height}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="128" 
                                value={height} 
                                onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                disabled={forceCircle}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-800" />

                <div className="space-y-4">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={14} /> Render Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setFilled(false)}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${!filled ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <div className="w-6 h-6 border-2 border-current rounded-full" />
                            Outline
                        </button>
                        <button 
                            onClick={() => setFilled(true)}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${filled ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <div className="w-6 h-6 bg-current rounded-full opacity-50" />
                            Filled
                        </button>
                    </div>
                </div>

                <div className="h-px bg-zinc-800" />

                <div className="space-y-4">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid size={14} /> View Settings
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        <button 
                            onClick={() => setShowGrid(!showGrid)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${showGrid ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                        >
                            <div className="flex items-center gap-2"><Grid size={16} /> Grid Lines</div>
                            <span className="opacity-50">{showGrid ? 'ON' : 'OFF'}</span>
                        </button>
                        <button 
                            onClick={() => setShowCenter(!showCenter)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${showCenter ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                        >
                            <div className="flex items-center gap-2"><Crosshair size={16} /> Center Crosshair</div>
                            <span className="opacity-50">{showCenter ? 'ON' : 'OFF'}</span>
                        </button>
                        <button 
                            onClick={() => setShowLabels(!showLabels)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${showLabels ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}
                        >
                            <div className="flex items-center gap-2"><Type size={16} /> Axis Labels</div>
                            <span className="opacity-50">{showLabels ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                    <Boxes size={120} />
                </div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Boxes size={14} /> Material Cost
                </h3>
                <div className="space-y-4 relative z-10">
                    <div>
                        <div className="text-3xl font-black text-white flex items-baseline gap-2">
                            {stats.blockCount} <span className="text-xs text-zinc-500 uppercase font-bold">Blocks</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Box size={20} /></div>
                        <div>
                            <div className="text-xs font-bold text-zinc-300">Total Requirement</div>
                            <div className="text-sm font-mono text-indigo-400">
                                {stacks > 0 && `${stacks} Stacks + `}{remainder} Blocks
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex gap-3 text-[11px] text-zinc-500 italic">
                <Info size={14} className="shrink-0 text-indigo-500" />
                <p>Axis Labels and Center Markers help pinpoint your build's core. Use 'Fit Design' to restore perfect framing.</p>
            </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 shadow-2xl flex flex-col min-h-[500px] lg:h-[750px] overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center bg-zinc-900/50 backdrop-blur-sm shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Grid size={16} className="text-indigo-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Architectural Canvas</span>
                        </div>
                        <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
                        <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-3">
                            <span>{width}x{height}</span>
                            {hoverCoord && (
                                <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 tabular-nums">
                                    COORD: {hoverCoord.x}, {hoverCoord.y}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fitToView}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-900/40"
                            title="Fit design to current window"
                        >
                            <Maximize2 size={14} />
                            Fit Design
                        </button>
                        <button 
                            onClick={() => setOffset({x: 0, y: 0})}
                            className="p-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
                            title="Reset pan to center"
                        >
                            <Target size={16} />
                        </button>
                        <div className="flex items-center gap-4 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 w-full sm:w-auto">
                            <button onClick={() => setBlockSize(prev => Math.max(1, prev - 1))} className="text-zinc-500 hover:text-white"><ZoomOut size={16} /></button>
                            <div className="flex-1 sm:w-32 flex flex-col items-center">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="60" 
                                    value={blockSize} 
                                    onChange={(e) => setBlockSize(parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                            <button onClick={() => setBlockSize(prev => Math.min(60, prev + 1))} className="text-zinc-500 hover:text-white"><ZoomIn size={16} /></button>
                        </div>
                    </div>
                </div>
                
                <div 
                    ref={containerRef}
                    className={`flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas 
                        ref={canvasRef}
                        className="w-full h-full block"
                    />
                </div>
                
                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex flex-wrap justify-center gap-6 sm:gap-8 shrink-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <div className="w-3 h-3 bg-indigo-500 rounded-sm shadow-[0_0_5px_rgba(99,102,241,0.5)]" /> Block
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <div className="w-3 h-3 bg-amber-500 border border-amber-600 rounded-sm" /> Center
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <div className="w-3 h-3 bg-zinc-950 border border-zinc-800 rounded-sm" /> Empty
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};
