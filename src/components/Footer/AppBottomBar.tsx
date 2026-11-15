import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock, 
  Database,
  Layers
} from 'lucide-react';
import { OrbitalEpoch, ScaleLevel } from '../../types';
import { StorageStatus } from '../../services/dataService';

interface AppBottomBarProps {
  epochs: OrbitalEpoch[];
  currentEpochIndex: number;
  setCurrentEpochIndex: (idx: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  scaleLevel: ScaleLevel;
  setScaleLevel: (scale: ScaleLevel) => void;
  storageStatus: StorageStatus;
}

export const AppBottomBar: React.FC<AppBottomBarProps> = ({
  epochs,
  currentEpochIndex,
  setCurrentEpochIndex,
  isPlaying,
  setIsPlaying,
  scaleLevel,
  setScaleLevel,
  storageStatus,
}) => {
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(750 / speed);
    const timer = setInterval(() => {
      setCurrentEpochIndex((prev) => (prev + 1) % epochs.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, epochs.length]);

  const currentEpoch = epochs[currentEpochIndex] || epochs[0];

  const scales: Array<{ id: ScaleLevel; label: string; range: string; color: string }> = [
    { id: 'MICRO', label: 'MICRO', range: '1mm–24cm Phase', color: '#FF2A85' },
    { id: 'MESO', label: 'MESO', range: '10cm–30m Pol', color: '#00F0FF' },
    { id: 'MACRO', label: 'MACRO', range: '10m–100km Offset', color: '#00E676' },
  ];

  return (
    <footer className="w-full h-16 bg-slate-950/95 backdrop-blur-xl border-t border-border-hairline px-4 flex items-center justify-between gap-3 text-xs font-mono select-none z-30">
      {/* Left: 3-Scale Mode Switcher */}
      <div className="flex items-center gap-1.5 bg-[#050B14] p-1 rounded-lg border border-border-hairline">
        <span className="text-[9px] text-slate-400 font-bold px-1 uppercase flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-electric" />
          <span>SCALE:</span>
        </span>
        {scales.map((s) => {
          const isActive = scaleLevel === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setScaleLevel(s.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[10px] font-bold ${
                isActive
                  ? 'bg-cyan-electric text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
              <span className="text-[8px] font-normal opacity-80">({s.range})</span>
            </button>
          );
        })}
      </div>

      {/* Center: 12-Day Orbital Timeline Scrubber */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        <div className="flex items-center gap-1 shrink-0 text-[10px]">
          <Clock className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-white font-bold">PASS #{currentEpoch.epochIndex + 1}/60</span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-electric font-semibold">{currentEpoch.passDate}</span>
          <span className="text-slate-500">•</span>
          <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border ${
            currentEpoch.season === 'Peak Monsoon'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : currentEpoch.season === 'Rabi Harvest'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/40'
          }`}>
            {currentEpoch.season}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={epochs.length - 1}
          value={currentEpochIndex}
          onChange={(e) => setCurrentEpochIndex(Number(e.target.value))}
          className="w-full h-1.5 bg-[#07111E] rounded-lg appearance-none cursor-pointer accent-cyan-electric focus:outline-none"
        />

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCurrentEpochIndex((p) => Math.max(0, p - 1))}
            className="p-1 rounded bg-surface-elevated text-slate-400 hover:text-cyan-electric"
          >
            <SkipBack className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold border ${
              isPlaying
                ? 'bg-cyan-electric text-slate-950 border-cyan-electric shadow-glow-cyan'
                : 'bg-surface-elevated text-slate-200 border-border-hairline'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={() => setCurrentEpochIndex((p) => Math.min(epochs.length - 1, p + 1))}
            className="p-1 rounded bg-surface-elevated text-slate-400 hover:text-cyan-electric"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right: Telemetry, Voice & MongoDB Status Badges */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050C16] border border-border-hairline text-[9px] text-cyan-electric">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-electric animate-pulse" />
          <span>📡 NISAR: 60 Orbits Loaded</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050C16] border border-border-hairline text-[9px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>🔊 Voice Engine: Ready</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050C16] border border-border-hairline text-[9.5px]">
          <Database className="w-3.5 h-3.5 text-emerald-recovery" />
          <span className="text-slate-400">STORAGE:</span>
          <span className={`font-bold ${storageStatus.isConnected ? 'text-emerald-recovery' : 'text-cyan-electric'}`}>
            {storageStatus.isConnected ? 'MongoDB Active' : 'MongoDB Hybrid: Active'}
          </span>
        </div>
      </div>
    </footer>
  );
};

