import React from 'react';
import { 
  Satellite, 
  MapPin, 
  HelpCircle, 
  Maximize, 
  ChevronDown, 
  Sparkles, 
  Microscope,
  Play,
  Square
} from 'lucide-react';
import { AOIScenario, AOIId, UserViewMode } from '../../types';

interface AppHeaderProps {
  currentAOI: AOIScenario;
  allAOIs: Record<AOIId, AOIScenario>;
  onSelectAOI: (id: AOIId) => void;
  userMode: UserViewMode;
  setUserMode: (mode: UserViewMode) => void;
  onOpenHowItWorks: () => void;
  isTourActive?: boolean;
  onToggleTour?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentAOI,
  allAOIs,
  onSelectAOI,
  userMode,
  setUserMode,
  onOpenHowItWorks,
  isTourActive = false,
  onToggleTour,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full h-14 bg-slate-950/95 backdrop-blur-xl border-b border-border-hairline px-4 flex items-center justify-between z-30 select-none">
      {/* LEFT: DSpace Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-electric/15 border border-cyan-electric/40 shadow-glow-cyan">
          <Satellite className="w-4 h-4 text-cyan-electric animate-pulse" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-black tracking-wider text-base text-white">
              <span className="text-cyan-electric glow-text-cyan">DSpace</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-mono font-semibold text-slate-300">
              | Deep-Space Radar Surface Intelligence
            </span>
          </div>
          <span className="text-[8.5px] font-mono text-slate-400">
            NASA-ISRO NISAR L+S Band • 12-Day Orbital Cycle
          </span>
        </div>
      </div>

      {/* CENTER: Auto-Play Demo + Simple/Pro Mode Toggle + AOI Selector */}
      <div className="flex items-center gap-2.5">
        {/* 🎬 25-Second Auto-Guided Story Walkthrough Button */}
        {onToggleTour && (
          <button
            onClick={onToggleTour}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shadow-lg ${
              isTourActive
                ? 'bg-rose-500/25 text-rose-300 border-rose-500 animate-pulse shadow-glow-crimson'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 shadow-glow-emerald'
            }`}
          >
            {isTourActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>⏹ Stop Tour</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>🎬 Auto-Play Story (25s Demo)</span>
              </>
            )}
          </button>
        )}

        {/* Simple Guide View vs Pro SAR Telemetry Mode Switcher */}
        <div className="flex items-center bg-[#060D18] border border-border-hairline rounded-lg p-0.5 text-xs font-mono shadow-inner">
          <button
            onClick={() => setUserMode('simple')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold ${
              userMode === 'simple'
                ? 'bg-cyan-electric text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Simple Guide View</span>
          </button>

          <button
            onClick={() => setUserMode('pro')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold ${
              userMode === 'pro'
                ? 'bg-cyan-electric text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>🔬 Pro SAR Telemetry</span>
          </button>
        </div>

        {/* AOI Location Dropdown */}
        <div className="relative flex items-center">
          <select
            value={currentAOI.aoiId}
            onChange={(e) => onSelectAOI(e.target.value as AOIId)}
            className="appearance-none bg-[#060D18] border border-cyan-electric/40 rounded-lg pl-7 pr-8 py-1.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-electric cursor-pointer hover:border-cyan-electric transition-all shadow-md"
          >
            {Object.values(allAOIs).map((aoi) => (
              <option key={aoi.aoiId} value={aoi.aoiId} className="bg-slate-950 text-slate-200">
                {aoi.name}
              </option>
            ))}
          </select>
          <MapPin className="w-3.5 h-3.5 text-cyan-electric absolute left-2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* RIGHT: How It Works & Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHowItWorks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-cyan-electric/40 text-xs font-mono font-bold text-cyan-electric hover:bg-cyan-electric/20 hover:border-cyan-electric transition-all shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>❓ How It Works (30s Tour)</span>
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
