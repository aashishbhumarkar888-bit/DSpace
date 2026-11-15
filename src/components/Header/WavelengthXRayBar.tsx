import React, { useEffect, useState } from 'react';
import { CloudRain, Radio, Zap, Scan, RefreshCw, Layers } from 'lucide-react';
import { PolarizationMode } from '../../types';

interface WavelengthXRayBarProps {
  wavelengthPct: number;
  setWavelengthPct: (pct: number | ((prev: number) => number)) => void;
  isLoupeActive: boolean;
  setIsLoupeActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  polarizationMode: PolarizationMode;
  setPolarizationMode: (mode: PolarizationMode) => void;
}

export const POLARIZATION_DESCRIPTIONS: Record<PolarizationMode, { title: string; badge: string; color: string }> = {
  HH: {
    title: 'HH Co-Pol (Horizontal-Horizontal)',
    badge: 'HH (Horizontal-Horizontal): Best for water-trunk double-bounce on land & wet-snow/crevasse boundaries on ice.',
    color: '#00F0FF',
  },
  HV: {
    title: 'HV Cross-Pol (Horizontal-Vertical)',
    badge: 'HV (Cross-Pol): Best for forest biomass, wildfire burn scars, crop growth on land & volumetric ice structure.',
    color: '#FFB800',
  },
  RATIO: {
    title: 'HH/HV Ratio (Dielectric-to-Structure)',
    badge: 'HH/HV Ratio: Highlights dielectric-to-structure ratio, separating crop harvest from flood inundation.',
    color: '#00E676',
  },
  INSAR: {
    title: 'InSAR Phase (GUNW/GOFF)',
    badge: 'InSAR Phase (GUNW/GOFF): Highlights millimeter ground subsidence fringes (11.9 cm/fringe) & macro glacier velocity vectors.',
    color: '#FF2A85',
  },
};

export const WavelengthXRayBar: React.FC<WavelengthXRayBarProps> = ({
  wavelengthPct,
  setWavelengthPct,
  isLoupeActive,
  setIsLoupeActive,
  polarizationMode,
  setPolarizationMode,
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

  const currentPolInfo = POLARIZATION_DESCRIPTIONS[polarizationMode];

  return (
    <div className="w-full bg-[#040812] border-b border-border-hairline px-4 py-1.5 flex items-center justify-between gap-3 text-xs select-none z-20 overflow-x-auto whitespace-nowrap">
      {/* LEFT: 3 Step Wavelength Quick Presets */}
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] shrink-0">
        <button
          onClick={() => setWavelengthPct(0)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all border ${
            wavelengthPct === 0
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-glow-amber font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <span>☁️ 1. Camera</span>
          <span className="text-[8.5px] text-amber-400 font-semibold">(Clouds)</span>
        </button>

        <span className="text-slate-600">➔</span>

        <button
          onClick={() => setWavelengthPct(50)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all border ${
            wavelengthPct >= 40 && wavelengthPct <= 60
              ? 'bg-blue-500/25 text-blue-300 border-blue-500/60 font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <span>🌿 2. C-Band</span>
          <span className="text-[8.5px] text-blue-400 font-semibold">(Leaves)</span>
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
          <Zap className="w-3 h-3 text-cyan-electric" />
          <span>⚡ 3. 24cm Radar</span>
          <span className="text-[8.5px] text-cyan-electric font-semibold">(Penetrates All)</span>
        </button>
      </div>

      {/* CENTER-LEFT: Draggable Wavelength Slider Track */}
      <div className="flex items-center gap-2 w-48 shrink-0">
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
          <RefreshCw className={`w-3 h-3 ${isAutoSweeping ? 'animate-spin text-cyan-electric' : ''}`} />
        </button>
      </div>

      {/* CENTER-RIGHT: Interactive Polarization Mode Selector Strip */}
      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
        <span className="text-[9px] text-slate-400 font-bold px-1 uppercase flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-electric" />
          <span>POLARIZATION:</span>
        </span>
        <div className="flex items-center bg-[#060D18] p-0.5 rounded-lg border border-border-hairline">
          {(['HH', 'HV', 'RATIO', 'INSAR'] as PolarizationMode[]).map((mode) => {
            const isActive = polarizationMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setPolarizationMode(mode)}
                className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all border ${
                  isActive
                    ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                }`}
                title={POLARIZATION_DESCRIPTIONS[mode].badge}
              >
                {mode === 'HH' ? 'HH Co-Pol' : mode === 'HV' ? 'HV Cross-Pol' : mode === 'RATIO' ? 'HH/HV Ratio' : 'InSAR Phase'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Polarization 1-Sentence Badge */}
      <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#060D18] border border-cyan-electric/30 text-[9.5px] font-mono text-slate-200 max-w-sm truncate shrink-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPolInfo.color }} />
        <span className="truncate" title={currentPolInfo.badge}>{currentPolInfo.badge}</span>
      </div>

      {/* RIGHT: Mouse Cursor Lens Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsLoupeActive((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] border transition-all ${
            isLoupeActive
              ? 'bg-cyan-electric text-slate-950 border-cyan-electric font-extrabold shadow-glow-cyan'
              : 'bg-surface-elevated text-slate-300 border-border-hairline hover:border-slate-500'
          }`}
        >
          <Scan className="w-3 h-3" />
          <span>🔍 X-Ray Lens [{isLoupeActive ? 'ON' : 'OFF'}]</span>
        </button>
      </div>
    </div>
  );
};

