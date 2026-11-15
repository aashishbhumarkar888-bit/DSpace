import React from 'react';
import { 
  Satellite, 
  MapPin, 
  Maximize, 
  ChevronDown, 
  User, 
  Microscope, 
  Play, 
  Square, 
  FileText,
  Bot,
  Lock,
  Unlock,
  LogOut
} from 'lucide-react';
import { AOIScenario, AOIId, UserViewMode } from '../../types';

interface AppHeaderProps {
  currentAOI: AOIScenario;
  allAOIs: Record<AOIId, AOIScenario>;
  onSelectAOI: (id: AOIId) => void;
  userMode: UserViewMode;
  setUserMode: (mode: UserViewMode) => void;
  isTourActive?: boolean;
  onToggleTour?: () => void;
  onOpenDistrictBrief?: () => void;
  isScientistAuthenticated?: boolean;
  scientistInfo?: { name: string; role: string; id: string } | null;
  onOpenLoginModal?: () => void;
  onLogoutScientist?: () => void;
  onOpenGroqChatbot?: () => void;
  onReturnHome?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentAOI,
  allAOIs,
  onSelectAOI,
  userMode,
  setUserMode,
  isTourActive = false,
  onToggleTour,
  onOpenDistrictBrief,
  isScientistAuthenticated = false,
  scientistInfo = null,
  onOpenLoginModal,
  onLogoutScientist,
  onOpenGroqChatbot,
  onReturnHome,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleScientistClick = () => {
    if (!isScientistAuthenticated) {
      if (onOpenLoginModal) onOpenLoginModal();
    } else {
      setUserMode('pro');
    }
  };

  return (
    <header className="w-full h-14 bg-slate-950/95 backdrop-blur-xl border-b border-border-hairline px-4 flex items-center justify-between gap-3 z-30 select-none whitespace-nowrap overflow-x-auto">
      {/* LEFT: Compact Brand Emblem & Engine Badge */}
      <div 
        onClick={onReturnHome}
        className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        title="Return to Home Dashboard"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-electric/15 border border-cyan-electric/40 shadow-glow-cyan">
          <Satellite className="w-4 h-4 text-cyan-electric animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display font-black tracking-wider text-base text-white">
            <span className="text-cyan-electric glow-text-cyan">DSpace</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-cyan-electric/90 border border-cyan-electric/30 font-semibold tracking-wide">
            NASA-ISRO NISAR L+S ENGINE
          </span>
        </div>
      </div>

      {/* CENTER-LEFT: Clean AOI Location Selector */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative flex items-center">
          <select
            value={currentAOI.aoiId}
            onChange={(e) => onSelectAOI(e.target.value as AOIId)}
            className="appearance-none bg-[#060D18] border border-cyan-electric/40 rounded-lg pl-7 pr-8 py-1.5 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-electric cursor-pointer hover:border-cyan-electric transition-all shadow-md whitespace-nowrap"
          >
            {Object.values(allAOIs).map((aoi) => (
              <option key={aoi.aoiId} value={aoi.aoiId} className="bg-slate-950 text-slate-200">
                📍 {aoi.name}
              </option>
            ))}
          </select>
          <MapPin className="w-3.5 h-3.5 text-cyan-electric absolute left-2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* CENTER-RIGHT: Single-Line Segmented Audience Mode Pill & Scientist Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center bg-[#060D18] border border-border-hairline rounded-lg p-0.5 text-xs font-mono shadow-inner">
          <button
            onClick={() => setUserMode('simple')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold whitespace-nowrap ${
              userMode === 'simple'
                ? 'bg-cyan-electric text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Civilian View</span>
          </button>

          <button
            onClick={handleScientistClick}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-bold whitespace-nowrap ${
              userMode === 'pro'
                ? 'bg-cyan-electric text-slate-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>🔬 Scientist View</span>
            {!isScientistAuthenticated && <Lock className="w-2.5 h-2.5 opacity-60" />}
          </button>
        </div>

        {/* Authenticated Scientist Badge */}
        {isScientistAuthenticated && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[9.5px] font-mono text-emerald-300">
            <Unlock className="w-3 h-3 text-emerald-400" />
            <span className="font-bold">LEVEL-4 SAR SCIENTIST</span>
            {onLogoutScientist && (
              <button
                onClick={onLogoutScientist}
                className="ml-1 text-slate-400 hover:text-rose-400"
                title="Exit Scientist View"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Master Tour + AI Copilot + Action Brief + Fullscreen */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Unified 60-Second Interactive Master Tour Button */}
        {onToggleTour && (
          <button
            onClick={onToggleTour}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border shadow-lg whitespace-nowrap ${
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
                <span>🎬 1-Min Interactive Tour</span>
              </>
            )}
          </button>
        )}

        {/* 🤖 Groq AI SAR Copilot Button */}
        {onOpenGroqChatbot && (
          <button
            onClick={onOpenGroqChatbot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-electric/20 to-purple-500/20 border border-cyan-electric/50 text-xs font-mono font-bold text-cyan-electric hover:bg-cyan-electric/30 transition-all shadow-sm whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-electric" />
            <span>🤖 Ask DSpace AI</span>
          </button>
        )}

        {/* Action Brief Button */}
        {onOpenDistrictBrief && (
          <button
            onClick={onOpenDistrictBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-cyan-electric/40 text-xs font-mono font-bold text-cyan-electric hover:bg-cyan-electric/20 hover:border-cyan-electric transition-all shadow-sm whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📋 Action Brief</span>
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-surface-elevated border border-border-hairline text-slate-400 hover:text-cyan-electric hover:border-cyan-electric/40 transition-all flex-shrink-0"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
