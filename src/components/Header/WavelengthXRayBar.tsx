import React, { useEffect, useState } from 'react';
import { CloudRain, Radio, Zap, Scan, RefreshCw } from 'lucide-react';

interface WavelengthXRayBarProps {
  wavelengthPct: number;
  setWavelengthPct: (pct: number | ((prev: number) => number)) => void;
  isLoupeActive: boolean;
  setIsLoupeActive: (active: boolean | ((prev: boolean) => boolean)) => void;
}

export const WavelengthXRayBar: React.FC<WavelengthXRayBarProps> = ({
  wavelengthPct,
  setWavelengthPct,
  isLoupeActive,
  setIsLoupeActive,
}) => {
  const [isAutoSweeping, setIsAutoSweeping] = useState(false);

  useEffect(() => {
    runSweep();
  }, []);

  const runSweep = () => {
    setIsAutoSweeping(true);
    setWavelengthPct(0);

    const duration = 2400;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setWavelengthPct(Math.round(ease * 100));

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setIsAutoSweeping(false);
        setWavelengthPct(100);
      }
    };

    requestAnimationFrame(frame);
  };

  return (
    <div className="w-full h-12 bg-[#040812] border-b border-border-hairline px-4 flex items-center justify-between gap-3 text-xs select-none z-20">
      {/* 3 Step Buttons */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
        <button
          onClick={() => setWavelengthPct(0)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct === 0
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-glow-amber font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <span>☁️ 1. Normal Camera</span>
          <span className="text-[9px] text-amber-400 font-semibold">(Blocked by Clouds)</span>
        </button>

        <span className="text-slate-600">➔</span>

        <button
          onClick={() => setWavelengthPct(50)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct >= 40 && wavelengthPct <= 60
              ? 'bg-blue-500/25 text-blue-300 border-blue-500/60 font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <span>🌿 2. Standard Radar</span>
          <span className="text-[9px] text-blue-400 font-semibold">(Blocked by Leaves)</span>
        </button>

        <span className="text-slate-600">➔</span>

        <button
          onClick={() => setWavelengthPct(100)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all border ${
            wavelengthPct === 100
              ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-cyan-electric'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-electric" />
          <span>⚡ 3. DSpace NASA Radar</span>
          <span className="text-[9px] text-cyan-electric font-semibold">(Sees Under Clouds & Underground)</span>
        </button>
      </div>

      {/* Draggable Slider Track */}
      <div className="flex-1 max-w-sm flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={wavelengthPct}
          onChange={(e) => setWavelengthPct(Number(e.target.value))}
          className="w-full h-1.5 bg-gradient-to-r from-amber-700 via-blue-700 to-cyan-electric rounded-lg appearance-none cursor-pointer accent-cyan-electric focus:outline-none"
        />
        <button
          onClick={runSweep}
          disabled={isAutoSweeping}
          className="p-1 rounded bg-surface-elevated border border-border-hairline text-slate-400 hover:text-cyan-electric transition-all"
          title="Replay Penetration Sweep"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAutoSweeping ? 'animate-spin text-cyan-electric' : ''}`} />
        </button>
      </div>

      {/* Mouse Cursor Lens Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsLoupeActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-[10.5px] border transition-all ${
            isLoupeActive
              ? 'bg-cyan-electric text-slate-950 border-cyan-electric font-extrabold shadow-glow-cyan'
              : 'bg-surface-elevated text-slate-300 border-border-hairline hover:border-slate-500'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>🔍 X-Ray Cursor Lens [{isLoupeActive ? 'ON' : 'OFF'}]</span>
        </button>
      </div>
    </div>
  );
};

