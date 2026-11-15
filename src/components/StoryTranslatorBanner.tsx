import React from 'react';
import { AOIScenario } from '../types';
import { AlertCircle, Eye, Zap, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

interface StoryTranslatorBannerProps {
  currentAOI: AOIScenario;
  isMitigationActive: boolean;
  onMitigate: () => void;
}

export const StoryTranslatorBanner: React.FC<StoryTranslatorBannerProps> = ({
  currentAOI,
  isMitigationActive,
  onMitigate,
}) => {
  const story = currentAOI.storyTranslator;
  const impact = story.mondayMorningImpact;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pointer-events-none select-none">
      <div className="pointer-events-auto grid grid-cols-1 md:grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-cyan-electric/25 shadow-2xl">
        {/* Column 1: The Hidden Crisis */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-elevated/60 border border-border-hairline">
          <div className="flex items-center gap-1.5 text-crimson-anomaly">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold">
              1. THE HIDDEN CRISIS (WHAT'S HAPPENING)
            </span>
          </div>
          <p className="text-[11px] font-sans text-slate-300 leading-snug line-clamp-2">
            {story.hiddenCrisis}
          </p>
        </div>

        {/* Column 2: Why Only DSpace Sees It */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-surface-elevated/60 border border-border-hairline">
          <div className="flex items-center gap-1.5 text-cyan-electric">
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold">
              2. WHY ONLY DSpace SEES IT (THE PHYSICS)
            </span>
          </div>
          <p className="text-[11px] font-sans text-slate-300 leading-snug line-clamp-2">
            {story.whyDSpaceSeesIt}
          </p>
        </div>

        {/* Column 3: Monday-Morning Action & Impact Delta */}
        <div className="flex flex-col justify-between p-2 rounded-lg bg-surface-elevated/80 border border-cyan-electric/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-emerald-recovery flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3. MONDAY-MORNING ACTION (IMPACT)</span>
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              isMitigationActive ? 'bg-emerald-recovery/20 text-emerald-recovery' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isMitigationActive ? 'SOLVED' : 'UNMITIGATED'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-col text-[10px] font-mono">
              <span className={isMitigationActive ? 'text-emerald-recovery font-bold' : 'text-slate-400'}>
                {isMitigationActive ? impact.afterLabel : impact.beforeLabel}
              </span>
            </div>

            <button
              onClick={onMitigate}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[10.5px] font-bold uppercase transition-all duration-200 border shadow-lg ${
                isMitigationActive
                  ? 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/60 hover:bg-emerald-recovery/30 shadow-glow-emerald'
                  : 'bg-cyan-electric text-void border-cyan-electric hover:bg-cyan-400 shadow-glow-cyan'
              }`}
            >
              {isMitigationActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-recovery" />
                  <span>REVERT STATE</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-void fill-current" />
                  <span>SIMULATE ACTION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

