import React from 'react';
import { motion } from 'framer-motion';
import { 
  Satellite, 
  MapPin, 
  Download, 
  HelpCircle, 
  Maximize, 
  Rotate3d, 
  Layers, 
  ShieldCheck, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { ScaleLevel, AOIId, AOIScenario, ProjectionMode } from '../types';

interface CommandBarProps {
  currentAOI: AOIScenario;
  onSelectAOI: (id: AOIId) => void;
  scaleLevel: ScaleLevel;
  onSelectScale: (scale: ScaleLevel) => void;
  projectionMode: ProjectionMode;
  setProjectionMode: (mode: ProjectionMode) => void;
  closurePhaseShieldActive: boolean;
  setClosurePhaseShieldActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  onOpenFieldPack: () => void;
  onOpenShortcuts: () => void;
  allAOIs: Record<string, AOIScenario>;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  currentAOI,
  onSelectAOI,
  scaleLevel,
  onSelectScale,
  projectionMode,
  setProjectionMode,
  closurePhaseShieldActive,
  setClosurePhaseShieldActive,
  onOpenFieldPack,
  onOpenShortcuts,
  allAOIs,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const scales: Array<{
    id: ScaleLevel;
    label: string;
    sub: string;
    range: string;
    color: string;
  }> = [
    {
      id: 'MICRO',
      label: 'MICRO',
      sub: 'GUNW InSAR Phase',
      range: '1mm – 24cm',
      color: '#FF2A85',
    },
    {
      id: 'MESO',
      label: 'MESO',
      sub: 'GCOV Polarimetry',
      range: '10cm – 30m',
      color: '#00F0FF',
    },
    {
      id: 'MACRO',
      label: 'MACRO',
      sub: 'GOFF Pixel Offset',
      range: '10m – 100km',
      color: '#00E676',
    },
  ];

  return (
    <header className="w-full h-13 bg-slate-950/85 backdrop-blur-xl border-b border-border-hairline px-4 flex items-center justify-between z-30 select-none">
      {/* LEFT: Strict DSpace Brand Cluster */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-electric/15 border border-cyan-electric/40 shadow-glow-cyan">
          <Satellite className="w-4 h-4 text-cyan-electric animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-electric animate-ping" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold tracking-wider text-base text-white flex items-center gap-1.5">
              <span className="text-cyan-electric glow-text-cyan">DSpace</span>
              <span className="text-slate-600 text-xs font-normal">|</span>
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300">
                DEEP-SPACE RADAR SURFACE INTELLIGENCE
              </span>
            </span>
            <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-mono tracking-wider font-bold bg-cyan-electric/10 text-cyan-electric border border-cyan-electric/30">
              NISAR L+S BAND // 12-DAY ORBIT
            </span>
          </div>
          <span className="text-[8.5px] font-mono text-slate-400 tracking-tight flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-recovery" />
            REAL-TIME SATELLITE ENGINE: 1.25 GHz L-BAND DUAL-POL VERIFIED
          </span>
        </div>

        {/* 40MB Field Pack Button */}
        <button
          onClick={onOpenFieldPack}
          className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[9.5px] font-mono font-medium tracking-wide bg-surface-elevated border border-border-hairline text-slate-300 hover:text-cyan-electric hover:border-cyan-electric/50 transition-all shadow-sm"
        >
          <Download className="w-3 h-3 text-cyan-electric" />
          <span>OFFLINE 40MB FIELD PACK</span>
        </button>
      </div>

      {/* CENTER: 3-Scale Gearshift + Camera & Closure Shield Controls */}
      <div className="flex items-center gap-2">
        {/* The 3-Scale Gearshift */}
        <div className="flex items-center bg-[#060D18] border border-border-hairline rounded-lg p-0.5 gap-1 shadow-inner">
          {scales.map((s) => {
            const isActive = scaleLevel === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectScale(s.id)}
                className="relative px-3 py-1 rounded-md text-left transition-all duration-200 flex flex-col items-center justify-center min-w-[100px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeScalePill"
                    className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-electric/25 via-cyan-electric/15 to-transparent border border-cyan-electric/60 shadow-glow-cyan"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span
                    className={`text-xs font-mono font-bold tracking-wider ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-400">
                    {s.range}
                  </span>
                </div>
                <span className="relative z-10 text-[7.5px] font-mono text-slate-400 tracking-tight">
                  {s.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Perspective Toggle: 3D Isometric vs 2D Ortho */}
        <div className="hidden md:flex items-center bg-[#060D18] border border-border-hairline rounded-lg p-0.5 text-[9.5px] font-mono">
          <button
            onClick={() => setProjectionMode('isometric')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
              projectionMode === 'isometric'
                ? 'bg-cyan-electric/25 text-cyan-electric border border-cyan-electric/50 shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>3D ISOMETRIC</span>
          </button>
          <button
            onClick={() => setProjectionMode('ortho')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
              projectionMode === 'ortho'
                ? 'bg-cyan-electric/25 text-cyan-electric border border-cyan-electric/50 shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D ORTHO MAP</span>
          </button>
        </div>

        {/* Triplet Closure Phase Bias Shield Toggle */}
        <button
          onClick={() => setClosurePhaseShieldActive((prev) => !prev)}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9.5px] font-mono border transition-all ${
            closurePhaseShieldActive
              ? 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/50 shadow-glow-emerald font-bold'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:border-slate-500'
          }`}
          title="Triplet Closure Phase (Φ = φ12 + φ23 - φ13) purges soil moisture phase bias"
        >
          {closurePhaseShieldActive ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-recovery" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-dielectric" />
          )}
          <span>CLOSURE SHIELD [{closurePhaseShieldActive ? 'ON' : 'OFF'}]</span>
        </button>
      </div>

      {/* RIGHT: AOI Scenario Preset Dropdown & Buttons */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <select
            value={currentAOI.id}
            onChange={(e) => onSelectAOI(e.target.value as AOIId)}
            className="appearance-none bg-[#060D18] border border-cyan-electric/40 rounded-lg pl-7 pr-8 py-1.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-electric cursor-pointer hover:border-cyan-electric transition-all shadow-md"
          >
            {Object.values(allAOIs).map((aoi) => (
              <option key={aoi.id} value={aoi.id} className="bg-slate-950 text-slate-200">
                {aoi.name}
              </option>
            ))}
          </select>
          <MapPin className="w-3.5 h-3.5 text-cyan-electric absolute left-2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg bg-surface-elevated border border-border-hairline text-slate-400 hover:text-cyan-electric hover:border-cyan-electric/40 transition-all"
          title="Keyboard Shortcuts & System Specifications"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-surface-elevated border border-border-hairline text-slate-400 hover:text-cyan-electric hover:border-cyan-electric/40 transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
