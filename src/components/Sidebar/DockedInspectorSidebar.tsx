import React, { useState } from 'react';
import { 
  AOIScenario, 
  HotspotBeacon, 
  CompactCascadeStep, 
  RightSidebarTab, 
  UserViewMode 
} from '../../types';
import { 
  BookOpen, 
  GitCommit, 
  Activity, 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Info,
  Orbit,
  Music,
  Volume2,
  VolumeX,
  ArrowDown,
  FileText,
  HelpCircle,
  X
} from 'lucide-react';
import { earthSynthesizer } from '../../audio/sonificationEngine';

interface DockedInspectorSidebarProps {
  currentAOI: AOIScenario;
  cascadeSteps: CompactCascadeStep[];
  activeTab: RightSidebarTab;
  setActiveTab: (tab: RightSidebarTab) => void;
  userMode: UserViewMode;
  selectedHotspot: HotspotBeacon | null;
  isMitigationActive: boolean;
  onMitigate: () => void;
  closurePhaseShieldActive: boolean;
  setClosurePhaseShieldActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  isBreakItNoiseActive: boolean;
  setIsBreakItNoiseActive: (active: boolean | ((prev: boolean) => boolean)) => void;
  timeEpochIndex: number;
  onOpenDistrictBrief?: () => void;
}

const GLOSSARY: Record<string, { title: string; analogy: string; detail: string }> = {
  'Double-Bounce': {
    title: 'Double-Bounce Radar Reflection',
    analogy: '💡 Analogy: Like shining a flashlight at a mirror in a dark forest — water + tree trunk reflects a strong signal straight back to the satellite.',
    detail: 'NISAR L-band (24cm) penetrates leaves and bounces off vertical trunks standing in standing water, producing a +6.2 dB surge.'
  },
  'InSAR Phase': {
    title: 'Interferometric Synthetic Aperture Radar (InSAR)',
    analogy: '💡 Analogy: Like measuring the distance to the floor with a 24cm ruler before and after — any millimeter shift creates color fringes.',
    detail: 'By comparing radar phase wave crests between 12-day repeat orbits, DSpace detects surface sinking down to 1 mm accuracy.'
  },
  'Closure Phase': {
    title: 'Closure Phase Loop Consistency',
    analogy: '💡 Analogy: Like walking in a triangle and checking if your steps add up to zero — filters out fake soil moisture signals.',
    detail: 'Sum of 3 interferometric phase differences in a closed temporal loop cancels out dielectric soil moisture bias (|Φ| < 0.05 rad).'
  },
  'Manning\'s Slope': {
    title: 'Manning\'s Hydraulic Roughness & Energy Gradient',
    analogy: '💡 Analogy: Like water trying to slide down a slide that suddenly tilts backwards — water stops flowing and pools.',
    detail: 'When ground subsidence reverses the channel bed slope, hydraulic conveyance drops from 18.4 m³/s to stagnant backwater.'
  }
};

export const DockedInspectorSidebar: React.FC<DockedInspectorSidebarProps> = ({
  currentAOI,
  cascadeSteps,
  activeTab,
  setActiveTab,
  userMode,
  selectedHotspot,
  isMitigationActive,
  onMitigate,
  closurePhaseShieldActive,
  setClosurePhaseShieldActive,
  isBreakItNoiseActive,
  setIsBreakItNoiseActive,
  timeEpochIndex,
  onOpenDistrictBrief,
}) => {
  const summary = currentAOI.plainEnglishSummary;
  const metrics = isMitigationActive ? currentAOI.mitigatedMetrics : currentAOI.baselineMetrics;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<string | null>(null);

  const toggleSonification = () => {
    if (isPlayingAudio) {
      earthSynthesizer.stop();
      setIsPlayingAudio(false);
    } else {
      const isAnomaly = !isMitigationActive && (timeEpochIndex >= 22 && timeEpochIndex <= 46);
      earthSynthesizer.start(
        metrics.roughnessHV_dB,
        metrics.dielectricHH_dB,
        metrics.phaseMotion_mm,
        isAnomaly,
        [110, 130.81, 146.83, 164.81, 196.00]
      );
      setIsPlayingAudio(true);
    }
  };

  // Holographic triangle coordinates
  const cx = 95;
  const cy = 68;
  const r = 50;
  const topV = { x: cx, y: cy - r };
  const rightV = { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };
  const leftV = { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };

  const curRoughness = isMitigationActive ? 0.32 : 0.78;
  const curDielectric = isMitigationActive ? 0.28 : 0.88;
  const curPhase = isMitigationActive ? 0.22 : 0.92;

  const ptTop = { x: cx + (topV.x - cx) * curRoughness, y: cy + (topV.y - cy) * curRoughness };
  const ptRight = { x: cx + (rightV.x - cx) * curDielectric, y: cy + (rightV.y - cy) * curDielectric };
  const ptLeft = { x: cx + (leftV.x - cx) * curPhase, y: cy + (leftV.y - cy) * curPhase };
  const curPoints = `${ptTop.x},${ptTop.y} ${ptRight.x},${ptRight.y} ${ptLeft.x},${ptLeft.y}`;

  return (
    <aside className="w-full h-full bg-slate-950/95 backdrop-blur-xl border border-cyan-electric/25 rounded-xl shadow-2xl flex flex-col overflow-hidden select-none">
      {/* Tab Navigation Header (Zero Overlap!) */}
      <div className="flex items-center justify-between border-b border-border-hairline p-1.5 bg-[#060D18]">
        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'story'
              ? 'bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Story & Action</span>
        </button>

        <button
          onClick={() => setActiveTab('cascade')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'cascade'
              ? 'bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Chain Reaction</span>
        </button>

        <button
          onClick={() => setActiveTab('pro_radar')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'pro_radar'
              ? 'bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Radar Math</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* ================= TAB 1: PLAIN-ENGLISH STORY & ACTION ================= */}
        {activeTab === 'story' && (
          <div className="flex flex-col gap-3">
            {/* Crisis Overview with Plain-English Severity Pill */}
            <div className="p-3 rounded-xl bg-[#060E1A] border border-border-hairline flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>WHAT IS THE CRISIS?</span>
                </span>
                <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  isMitigationActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                }`}>
                  {isMitigationActive ? '🟢 SAFE / RESOLVED' : '🔴 CRITICAL ACTION NEEDED'}
                </span>
              </div>
              <p className="text-[11.5px] font-sans text-slate-200 leading-relaxed">
                {summary.crisis}
              </p>
            </div>

            {/* Why Missed vs How DSpace Found It */}
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-amber-500/30 flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span>☁️</span>
                  <span>WHY NORMAL CAMERAS MISSED IT</span>
                </span>
                <p className="text-[11px] font-sans text-slate-300 leading-snug">
                  {summary.whyMissed}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-cyan-electric/40 flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-cyan-electric uppercase tracking-wider flex items-center gap-1">
                  <span>⚡</span>
                  <span>HOW DSpace FOUND IT (24cm RADAR)</span>
                </span>
                <p className="text-[11px] font-sans text-slate-300 leading-snug">
                  {summary.howFound}
                </p>
              </div>
            </div>

            {/* Interactive Terms Micro-Glossary Trigger Bar */}
            <div className="p-2 rounded-lg bg-[#040810] border border-border-hairline flex flex-wrap items-center gap-1.5 text-[9.5px] font-mono">
              <span className="text-slate-400 flex items-center gap-1 mr-1">
                <HelpCircle className="w-3 h-3 text-cyan-electric" />
                <span>Tap to Learn:</span>
              </span>
              {Object.keys(GLOSSARY).map((term) => (
                <button
                  key={term}
                  onClick={() => setActiveGlossaryTerm(activeGlossaryTerm === term ? null : term)}
                  className={`px-1.5 py-0.5 rounded transition-all border ${
                    activeGlossaryTerm === term
                      ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric font-bold'
                      : 'bg-surface-elevated text-slate-300 border-border-hairline hover:text-cyan-electric hover:border-cyan-electric/40'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Micro-Glossary Popup Card */}
            {activeGlossaryTerm && GLOSSARY[activeGlossaryTerm] && (
              <div className="p-2.5 rounded-xl bg-cyan-electric/10 border border-cyan-electric/50 flex flex-col gap-1 shadow-glow-cyan animate-fadeIn relative">
                <button
                  onClick={() => setActiveGlossaryTerm(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10.5px] font-mono font-bold text-cyan-electric">
                  {GLOSSARY[activeGlossaryTerm].title}
                </div>
                <div className="text-[11px] font-sans text-emerald-300 font-medium">
                  {GLOSSARY[activeGlossaryTerm].analogy}
                </div>
                <div className="text-[10px] font-sans text-slate-300 mt-0.5">
                  {GLOSSARY[activeGlossaryTerm].detail}
                </div>
              </div>
            )}

            {/* Active Selected Hotspot Details */}
            {selectedHotspot && (
              <div className="p-2.5 rounded-xl bg-cyan-electric/10 border border-cyan-electric/40 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-electric">
                    SELECTED BEACON {selectedHotspot.number}: {selectedHotspot.name}
                  </span>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-recovery">
                    {selectedHotspot.metricValue}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-slate-200">
                  {selectedHotspot.description}
                </p>
              </div>
            )}

            {/* Before vs. After Transformation Comparison Pills */}
            <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col gap-1.5">
              <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                PHYSICS ATTRIBUTION IMPACT (BEFORE ➔ AFTER):
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-[10.5px] font-mono">
                <div className="p-1.5 rounded-lg bg-[#040810] border border-border-hairline flex items-center justify-between">
                  <span className="text-slate-400">Trapped Flood Basin:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-rose-400">4.2M m³</span>
                    <span className="text-cyan-electric">➔</span>
                    <span className="font-bold text-emerald-400">
                      {isMitigationActive ? '0.1M m³ (Drained)' : '4.2M m³'}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-[#040810] border border-border-hairline flex items-center justify-between">
                  <span className="text-slate-400">Canal Bed Sinking:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-rose-400">-19.4 mm/yr</span>
                    <span className="text-cyan-electric">➔</span>
                    <span className="font-bold text-emerald-400">
                      {isMitigationActive ? '-0.8 mm/yr (Arrested)' : '-19.4 mm/yr'}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-[#040810] border border-border-hairline flex items-center justify-between">
                  <span className="text-slate-400">Village Flood Risk:</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-rose-400">88/100 (HIGH)</span>
                    <span className="text-cyan-electric">➔</span>
                    <span className="font-bold text-emerald-400">
                      {isMitigationActive ? '12/100 (SAFE)' : '88/100 (HIGH)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Action / Simulate Solution CTA + Action Dossier */}
            <div className="p-3 rounded-xl bg-[#081322] border border-cyan-electric/40 flex flex-col gap-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-recovery uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>DECISION & IMPACT OUTCOME</span>
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  isMitigationActive ? 'bg-emerald-recovery/20 text-emerald-recovery' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isMitigationActive ? 'SOLVED' : 'AT RISK'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#040810] border border-border-hairline flex flex-col">
                  <span className="text-[8.5px] text-slate-400">VILLAGES PROTECTED</span>
                  <span className="text-sm font-bold text-emerald-recovery">
                    {isMitigationActive ? summary.villagesSaved : 0} / {summary.villagesSaved}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#040810] border border-border-hairline flex flex-col">
                  <span className="text-[8.5px] text-slate-400">CROPLAND RECOVERED</span>
                  <span className="text-sm font-bold text-emerald-recovery">
                    {isMitigationActive ? `${summary.hectaresRecovered.toLocaleString()} ha` : '0 ha'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Simulate Solution & Open District Action Dossier */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={onMitigate}
                  className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border shadow-xl ${
                    isMitigationActive
                      ? 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/60 hover:bg-emerald-recovery/30 shadow-glow-emerald'
                      : 'bg-cyan-electric text-slate-950 border-cyan-electric hover:bg-cyan-400 shadow-glow-cyan'
                  }`}
                >
                  {isMitigationActive ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>RESET TO UNMITIGATED CRISIS</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current animate-pulse" />
                      <span>⚡ SIMULATE SOLUTION (SAVE {summary.villagesSaved} VILLAGES)</span>
                    </>
                  )}
                </button>

                {onOpenDistrictBrief && (
                  <button
                    onClick={onOpenDistrictBrief}
                    className="w-full py-2 px-3 rounded-xl font-mono text-[11px] font-bold text-slate-200 bg-slate-900 border border-border-hairline hover:border-cyan-electric/50 hover:text-cyan-electric transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-electric" />
                    <span>📋 VIEW DISTRICT ACTION BRIEF (NDMA DOSSIER)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: 4-STEP CHAIN REACTION ================= */}
        {activeTab === 'cascade' && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              HOW ONE EVENT TRIGGERED THE NEXT ACROSS SCALES:
            </span>

            {cascadeSteps.map((step, idx) => {
              const isLast = idx === cascadeSteps.length - 1;
              const isCritical = isLast && !isMitigationActive;

              return (
                <div key={step.stepNumber} className="flex flex-col">
                  <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                    isCritical
                      ? 'bg-rose-950/30 border-rose-500/50 text-white'
                      : 'bg-[#060D18] border-border-hairline text-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyan-electric flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-cyan-electric text-slate-950 flex items-center justify-center text-[9px] font-bold">
                          {step.stepNumber}
                        </span>
                        <span>{step.title}</span>
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-slate-300 border border-border-hairline">
                        {step.scale}
                      </span>
                    </div>

                    <p className="text-[10.5px] font-sans text-slate-300 leading-snug">
                      {step.description}
                    </p>

                    <div className="bg-[#03060C] p-1.5 rounded border border-border-hairline text-[8.5px] font-mono text-emerald-recovery flex items-center justify-between">
                      <span>{step.equation}</span>
                      <span className="text-slate-400">{step.satelliteBand}</span>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="flex justify-center my-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-electric/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAB 3: RADAR MATH & AUDIO SYNTH ================= */}
        {activeTab === 'pro_radar' && (
          <div className="flex flex-col gap-3">
            {/* Holographic Triangle Radar with Dual Human/Science Labels */}
            <div className="p-3 rounded-xl bg-[#060D18] border border-cyan-electric/30 flex flex-col items-center">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                3-VECTOR SAR RADAR FINGERPRINT
              </span>

              <svg width="220" height="145" viewBox="0 0 220 145" className="overflow-visible">
                {/* Outer frame */}
                <polygon
                  points={`${cx},${cy - r} ${cx + r * Math.cos(Math.PI / 6)},${cy + r * Math.sin(Math.PI / 6)} ${cx - r * Math.cos(Math.PI / 6)},${cy + r * Math.sin(Math.PI / 6)}`}
                  fill="none"
                  stroke="rgba(0, 240, 255, 0.25)"
                  strokeWidth="1.2"
                />
                <polygon
                  points={curPoints}
                  fill={isMitigationActive ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 30, 86, 0.3)'}
                  stroke={isMitigationActive ? '#00E676' : '#FF1E56'}
                  strokeWidth="1.8"
                />
                {/* Dual Human & Science Labels */}
                <text x={cx} y={cy - r - 6} textAnchor="middle" fill="#00F0FF" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  🌲 STRUCTURE / ROUGHNESS (HV)
                </text>
                <text x={cx + r * Math.cos(Math.PI / 6) + 6} y={cy + r * Math.sin(Math.PI / 6) + 8} textAnchor="start" fill="#FFB800" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  💧 WATER / MOISTURE (HH)
                </text>
                <text x={cx - r * Math.cos(Math.PI / 6) - 6} y={cy + r * Math.sin(Math.PI / 6) + 8} textAnchor="end" fill="#FF2A85" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">
                  📉 SINKING (InSAR Phase)
                </text>
              </svg>

              {/* 1-Line Dynamic Summary Under Triangle */}
              <div className="w-full mt-2 p-1.5 rounded-lg bg-[#040810] border border-border-hairline text-center">
                <span className="text-[9.5px] font-mono text-slate-300">
                  {isMitigationActive 
                    ? '🟢 Balanced Normal: Sluice gate opened, surface water & ground motion stabilized.' 
                    : '🔴 Crisis Signature: Severe asymmetric distortion from trapped flood & rapid ground sinking.'}
                </span>
              </div>
            </div>

            {/* Self-Explanatory Human-Translator Metric Cards with Severity Meters */}
            <div className="flex flex-col gap-2">
              <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                RADAR TELEMETRY & PLAIN-ENGLISH TRANSLATIONS:
              </span>

              {/* Metric 1: ΔHH_L Backscatter */}
              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-border-hairline flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-electric">
                    ΔHH_L POLARIZATION ({metrics.dielectricHH_dB} dB)
                  </span>
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isMitigationActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isMitigationActive ? '🟢 SAFE' : '🔴 CRITICAL'}
                  </span>
                </div>
                {/* Meter Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isMitigationActive ? 'bg-emerald-400 w-1/4' : 'bg-rose-500 w-4/5'}`}
                  />
                </div>
                <p className="text-[10.5px] font-sans text-slate-300 leading-snug">
                  {isMitigationActive
                    ? '🟢 Normal Sub-Canopy — Radar waves pass through foliage to dry soil; no stagnant standing water detected.'
                    : '🔴 Hidden Water Detected — 24cm radar waves are double-bouncing off tree trunks standing in 45 cm of floodwater under the canopy.'}
                </p>
              </div>

              {/* Metric 2: GUNW InSAR Phase Displacement */}
              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-border-hairline flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-400">
                    GUNW PHASE DISPLACEMENT ({metrics.phaseMotion_mm} mm/yr)
                  </span>
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isMitigationActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isMitigationActive ? '🟢 STABILIZED' : '🔴 SINKING FAST'}
                  </span>
                </div>
                {/* Meter Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isMitigationActive ? 'bg-emerald-400 w-1/6' : 'bg-rose-500 w-5/6'}`}
                  />
                </div>
                <p className="text-[10.5px] font-sans text-slate-300 leading-snug">
                  {isMitigationActive
                    ? '🟢 Subsidence Arrested — Aquifer recharge and flow balance restored ground level displacement to -0.8 mm/yr.'
                    : '🔴 Ground Sinking Fast — Over-pumping groundwater is dropping the land by ~2 cm/year, tilting the canal bed.'}
                </p>
              </div>

              {/* Metric 3: Closure Phase Consistency */}
              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-border-hairline flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    CLOSURE PHASE |Φ| (0.042 rad)
                  </span>
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                    🟢 95% SENSOR TRUST
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-1/4" />
                </div>
                <p className="text-[10.5px] font-sans text-slate-300 leading-snug">
                  🟢 95% Sensor Trust — Temporal triplet loop cancelled out dielectric soil moisture bias. Zero false alarms.
                </p>
              </div>

              {/* Metric 4: WLS Residual Chi-Squared */}
              <div className="p-2.5 rounded-xl bg-[#060E1A] border border-border-hairline flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    WLS RESIDUAL χ² (0.038)
                  </span>
                  <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                    🟢 PHYSICS VERIFIED
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-1/5" />
                </div>
                <p className="text-[10.5px] font-sans text-slate-300 leading-snug">
                  🟢 Physics Verified — L-Band, C-Band, and Optical signals agree with 96.2% statistical confidence.
                </p>
              </div>
            </div>

            {/* Closure Phase Shield & Break-It Noise Toggle */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#060D18] border border-border-hairline">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-bold">CLOSURE PHASE SHIELD</span>
                <button
                  onClick={() => setClosurePhaseShieldActive((prev) => !prev)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                    closurePhaseShieldActive
                      ? 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {closurePhaseShieldActive ? 'ACTIVE (94.8%)' : 'OFF (61%)'}
                </button>
              </div>

              <button
                onClick={() => setIsBreakItNoiseActive((prev) => !prev)}
                className={`w-full py-1 px-2 rounded-lg text-[9px] font-mono tracking-wide border transition-all ${
                  isBreakItNoiseActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-surface-elevated text-slate-400 border-border-hairline hover:text-slate-200'
                }`}
              >
                {isBreakItNoiseActive
                  ? 'FAKE MOISTURE NOISE INJECTED'
                  : 'BREAK-IT TEST: INJECT DIELECTRIC NOISE'}
              </button>
            </div>

            {/* Earth Waltz Audio Synthesizer */}
            <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-electric" />
                  <span>EARTH WALTZ SYNTH</span>
                </span>
                <span className="text-[8px] font-bold text-cyan-electric">
                  {isPlayingAudio ? 'SONIFYING' : 'MUTED'}
                </span>
              </div>

              <button
                onClick={toggleSonification}
                className={`w-full py-1.5 px-3 rounded-lg text-[10.5px] font-mono font-bold tracking-wide border transition-all ${
                  isPlayingAudio
                    ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
                    : 'bg-surface-elevated text-slate-300 border-border-hairline hover:border-cyan-electric hover:text-cyan-electric'
                }`}
              >
                {isPlayingAudio ? 'MUTE SONIFICATION' : '🔊 SONIFY SURFACE PHYSICS'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
