import React from 'react';
import { AOIScenario } from '../../types';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface DecisionScorecardProps {
  currentAOI: AOIScenario;
  isMitigationActive: boolean;
  onMitigate: () => void;
  isBreakItNoiseActive: boolean;
  setIsBreakItNoiseActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  closurePhaseShieldActive: boolean;
  setClosurePhaseShieldActive: (active: boolean | ((prev: boolean) => boolean)) => void;
}

export const DecisionScorecard: React.FC<DecisionScorecardProps> = ({
  currentAOI,
  isMitigationActive,
  onMitigate,
  isBreakItNoiseActive,
  setIsBreakItNoiseActive,
  closurePhaseShieldActive,
  setClosurePhaseShieldActive,
}) => {
  const plan = currentAOI.mitigationPlan;
  const impact = currentAOI.storyTranslator.mondayMorningImpact;

  // Confidence computation based on closure phase shield and noise injection
  let confidenceScore = plan.confidenceScore;
  let confidenceLabel = 'Verified InSAR Deformation';

  if (isBreakItNoiseActive && !closurePhaseShieldActive) {
    confidenceScore = 61.0;
    confidenceLabel = 'Soil Moisture Bias Contaminating Phase';
  } else if (!closurePhaseShieldActive) {
    confidenceScore = 78.4;
    confidenceLabel = 'Unshielded Moisture Drift';
  } else {
    confidenceScore = 94.8;
    confidenceLabel = 'Triplet Closure Filtered (Φ ≈ 0)';
  }

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-1">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-slate-200">
            LIVE INTERVENTION SCORECARD
          </span>
        </div>
        <span className="text-[8.5px] font-mono text-emerald-recovery font-bold px-1.5 py-0.5 rounded bg-emerald-recovery/15 border border-emerald-recovery/30">
          SLA &lt;35ms
        </span>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono tabular-nums">
        {/* Metric 1: Population Protected */}
        <div className="bg-[#050C16] p-1.5 rounded-lg border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-cyan-electric" />
            <span>POPULATION PROTECTED</span>
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-sm font-bold ${isMitigationActive ? 'text-emerald-recovery' : 'text-slate-200'}`}>
              {isMitigationActive ? plan.populationProtected.toLocaleString() : '0'}
            </span>
            <span className="text-[8px] text-slate-400">
              / {plan.populationProtected.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 2: Area Recovered */}
        <div className="bg-[#050C16] p-1.5 rounded-lg border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-emerald-recovery" />
            <span>AREA RECOVERED</span>
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-sm font-bold ${isMitigationActive ? 'text-emerald-recovery' : 'text-slate-200'}`}>
              {isMitigationActive ? `${plan.hectaresProtected.toLocaleString()} ha` : '0 ha'}
            </span>
            <span className="text-[8px] text-emerald-recovery font-semibold ml-auto">
              {impact.economicValueProtected}
            </span>
          </div>
        </div>

        {/* Metric 3: Confidence Score */}
        <div className="bg-[#050C16] p-1.5 rounded-lg border border-border-hairline flex flex-col col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] text-slate-400 uppercase tracking-wider">
              PHYSICAL ATTRIBUTION CONFIDENCE
            </span>
            <span className={`text-[8px] font-bold ${
              confidenceScore > 85 ? 'text-emerald-recovery' : 'text-amber-dielectric'
            }`}>
              {confidenceLabel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className={`text-base font-bold ${
              confidenceScore > 85 ? 'text-emerald-recovery' : 'text-amber-dielectric'
            }`}>
              {confidenceScore.toFixed(1)}%
            </span>
            <div className="w-32 h-1.5 bg-[#081220] rounded-full overflow-hidden border border-border-hairline">
              <div
                className={`h-full transition-all duration-300 ${
                  confidenceScore > 85 ? 'bg-emerald-recovery' : 'bg-amber-dielectric'
                }`}
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Mitigation / Reset Button */}
      <div className="flex flex-col gap-1 pt-0.5">
        <button
          onClick={onMitigate}
          className={`w-full py-1.5 px-3 rounded-lg font-mono text-[10.5px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 border shadow-lg ${
            isMitigationActive
              ? 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/60 hover:bg-emerald-recovery/30 shadow-glow-emerald'
              : 'bg-cyan-electric text-void border-cyan-electric hover:bg-cyan-400 shadow-glow-cyan'
          }`}
        >
          {isMitigationActive ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET TO ACTIVE CRISIS</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ DEPLOY PHYSICAL MITIGATION</span>
            </>
          )}
        </button>

        {/* Break-It Noise Injection Toggle */}
        <button
          onClick={() => setIsBreakItNoiseActive((prev) => !prev)}
          className={`w-full py-1 px-2 rounded-lg text-[9px] font-mono tracking-wide flex items-center justify-center gap-1.5 border transition-all ${
            isBreakItNoiseActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-glow-amber'
              : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3 h-3 text-amber-dielectric" />
          <span>
            {isBreakItNoiseActive
              ? 'BREAK-IT NOISE ACTIVE (CHECK CLOSURE SHIELD)'
              : 'BREAK-IT TEST: INJECT DIELECTRIC MOISTURE NOISE'}
          </span>
        </button>
      </div>
    </div>
  );
};
