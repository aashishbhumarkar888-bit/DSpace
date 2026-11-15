import React, { useEffect, useState } from 'react';
import { 
  Scan, 
  CloudRain, 
  Radio, 
  Zap, 
  RefreshCw 
} from 'lucide-react';

interface WavelengthSliderProps {
  wavelengthPct: number;
  setWavelengthPct: (pct: number | ((prev: number) => number)) => void;
  isLoupeActive: boolean;
  setIsLoupeActive: (active: boolean | ((prev: boolean) => boolean)) => void;
}

export const WavelengthSlider: React.FC<WavelengthSliderProps> = ({
  wavelengthPct,
  setWavelengthPct,
  isLoupeActive,
  setIsLoupeActive,
}) => {
  const [isAutoSweeping, setIsAutoSweeping] = useState(false);

  useEffect(() => {
    runSweepAnimation();
  }, []);

  const runSweepAnimation = () => {
    setIsAutoSweeping(true);
    setWavelengthPct(0);

    const durationMs = 2500;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const easeVal = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setWavelengthPct(Math.round(easeVal * 100));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAutoSweeping(false);
        setWavelengthPct(100);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-border-hairline px-4 py-1.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs select-none z-20">
      {/* Quick Jump Band Buttons */}
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] shrink-0">
        <span className="text-slate-400 font-semibold tracking-wider text-[9.5px] uppercase mr-1">
          WAVELENGTH X-RAY:
        </span>

        {/* 0%: 400nm Optical */}
        <button
          onClick={() => setWavelengthPct(0)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct === 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-glow-amber font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <CloudRain className="w-3 h-3 text-amber-400" />
          <span>400nm Optical (Clouds)</span>
        </button>

        {/* 50%: 5.6cm C-Band */}
        <button
          onClick={() => setWavelengthPct(50)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct >= 40 && wavelengthPct <= 60
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <Radio className="w-3 h-3 text-blue-400" />
          <span>5.6cm C-Band (Speckle)</span>
        </button>

        {/* 100%: 23.8cm L-Band NISAR */}
        <button
          onClick={() => setWavelengthPct(100)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct === 100
              ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-cyan-electric'
          }`}
        >
          <Zap className="w-3 h-3 text-cyan-electric" />
          <span>23.8cm L-Band NISAR (Sub-Canopy X-Ray)</span>
        </button>
      </div>

      {/* Draggable Range Slider */}
      <div className="flex-1 max-w-xl w-full flex items-center gap-3">
        <span className="text-[9.5px] font-mono text-slate-400 whitespace-nowrap">
          {wavelengthPct === 0
            ? 'OPTICAL (0%)'
            : wavelengthPct < 50
            ? `VISIBLE / NIR (${wavelengthPct}%)`
            : wavelengthPct < 90
            ? `C-BAND SAR (${wavelengthPct}%)`
            : `NISAR L-BAND (${wavelengthPct}%)`}
        </span>

        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            value={wavelengthPct}
            onChange={(e) => setWavelengthPct(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-emerald-950/60 via-blue-950/60 to-cyan-electric/80 rounded-lg appearance-none cursor-ew-resize accent-cyan-electric focus:outline-none"
            style={{
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.25)',
            }}
          />
        </div>

        <button
          onClick={runSweepAnimation}
          disabled={isAutoSweeping}
          className="p-1 rounded-md bg-surface-elevated border border-border-hairline text-slate-400 hover:text-cyan-electric hover:border-cyan-electric/40 transition-all"
          title="Replay 2.5s Penetration Sweep"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAutoSweeping ? 'animate-spin text-cyan-electric' : ''}`} />
        </button>
      </div>

      {/* Split-Screen Loupe Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsLoupeActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-[10.5px] border transition-all ${
            isLoupeActive
              ? 'bg-cyan-electric/30 text-cyan-electric border-cyan-electric shadow-glow-cyan font-bold'
              : 'bg-surface-elevated text-slate-300 border-border-hairline hover:border-slate-500'
          }`}
          title="Split-Screen X-Ray Loupe: Cursor acts as a circular lens showing Optical outside and 24cm L-Band inside"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>SPLIT-SCREEN X-RAY LOUPE [{isLoupeActive ? 'ON' : 'OFF'}]</span>
        </button>
      </div>
    </div>
  );
};
