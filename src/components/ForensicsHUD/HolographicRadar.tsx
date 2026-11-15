import React from 'react';
import { AOIScenario, CellInspectionData } from '../../types';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface HolographicRadarProps {
  currentAOI: AOIScenario;
  selectedCell: CellInspectionData | null;
  isMitigationActive: boolean;
  closurePhaseShieldActive: boolean;
}

export const HolographicRadar: React.FC<HolographicRadarProps> = ({
  currentAOI,
  selectedCell,
  isMitigationActive,
  closurePhaseShieldActive,
}) => {
  const params = currentAOI.physicsParameters;

  // Triangle geometry (Center at 100, 75; Radius = 56)
  const cx = 100;
  const cy = 72;
  const r = 54;

  const topV = { x: cx, y: cy - r };
  const rightV = { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };
  const leftV = { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) };

  // Baseline normalized values
  const baseRoughness = 0.25;
  const baseDielectric = 0.30;
  const basePhase = 0.20;

  // Current epoch normalized
  const curRoughness = isMitigationActive ? 0.32 : 0.78;
  const curDielectric = isMitigationActive ? 0.28 : 0.88;
  const curPhase = isMitigationActive ? 0.22 : 0.92;

  const getPoints = (rough: number, diel: number, ph: number) => {
    const pt1 = { x: cx + (topV.x - cx) * rough, y: cy + (topV.y - cy) * rough };
    const pt2 = { x: cx + (rightV.x - cx) * diel, y: cy + (rightV.y - cy) * diel };
    const pt3 = { x: cx + (leftV.x - cx) * ph, y: cy + (leftV.y - cy) * ph };
    return `${pt1.x},${pt1.y} ${pt2.x},${pt2.y} ${pt3.x},${pt3.y}`;
  };

  const baselinePts = getPoints(baseRoughness, baseDielectric, basePhase);
  const currentPts = getPoints(curRoughness, curDielectric, curPhase);

  const isAnomaly = !isMitigationActive;
  const polygonColor = isAnomaly ? '#FF1E56' : '#00F0FF';
  const polygonFill = isAnomaly ? 'rgba(255, 30, 86, 0.28)' : 'rgba(0, 240, 255, 0.22)';

  const hhL = selectedCell ? selectedCell.hh_L_dB : (isMitigationActive ? params.dielectricBaseline_dB : params.dielectricHH_dB);
  const hvL = selectedCell ? selectedCell.hv_L_dB : (isMitigationActive ? params.roughnessBaseline_dB : params.roughnessHV_dB);
  const dispMm = selectedCell ? selectedCell.displacementMm : (isMitigationActive ? currentAOI.mitigationPlan.mitigatedPhase_mm : params.phaseMotion_mm);
  const closureRad = selectedCell ? selectedCell.closurePhaseRad : params.closurePhaseRad;

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 select-none">
      {/* Header & Verdict Badge */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-1">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-slate-200">
            3-PHYSICS RADAR & WLS UNMIXING
          </span>
        </div>
        <span
          className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold border ${
            isAnomaly
              ? 'bg-crimson-anomaly/20 text-crimson-anomaly border-crimson-anomaly/40'
              : 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/40'
          }`}
        >
          {isAnomaly ? '⚠ RADAR ANOMALY DETECTED' : '✓ EQUILIBRIUM RESTORED'}
        </span>
      </div>

      {/* SVG Holographic Triangle */}
      <div className="relative w-full flex items-center justify-center py-0.5">
        <svg width="200" height="135" viewBox="0 0 200 135" className="overflow-visible">
          {/* Outer Triangle */}
          <polygon
            points={`${topV.x},${topV.y} ${rightV.x},${rightV.y} ${leftV.x},${leftV.y}`}
            fill="none"
            stroke="rgba(0, 240, 255, 0.2)"
            strokeWidth="1.2"
          />

          {/* Inner concentric ring */}
          <polygon
            points={`${cx},${cy - r * 0.5} ${cx + r * 0.5 * Math.cos(Math.PI / 6)},${cy + r * 0.5 * Math.sin(Math.PI / 6)} ${cx - r * 0.5 * Math.cos(Math.PI / 6)},${cy + r * 0.5 * Math.sin(Math.PI / 6)}`}
            fill="none"
            stroke="rgba(0, 240, 255, 0.1)"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />

          {/* Radiating lines */}
          <line x1={cx} y1={cy} x2={topV.x} y2={topV.y} stroke="rgba(0, 240, 255, 0.2)" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1={cx} y1={cy} x2={rightV.x} y2={rightV.y} stroke="rgba(0, 240, 255, 0.2)" strokeWidth="0.8" strokeDasharray="2,2" />
          <line x1={cx} y1={cy} x2={leftV.x} y2={leftV.y} stroke="rgba(0, 240, 255, 0.2)" strokeWidth="0.8" strokeDasharray="2,2" />

          {/* Baseline polygon (dashed slate) */}
          <polygon
            points={baselinePts}
            fill="rgba(148, 163, 184, 0.1)"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeDasharray="3,2"
          />

          {/* Current Epoch polygon */}
          <polygon
            points={currentPts}
            fill={polygonFill}
            stroke={polygonColor}
            strokeWidth="1.8"
          />

          {/* Vertex Labels */}
          <text x={topV.x} y={topV.y - 6} textAnchor="middle" fill="#00F0FF" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
            ROUGHNESS (HV)
          </text>
          <text x={rightV.x + 6} y={rightV.y + 10} textAnchor="start" fill="#FFB800" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
            DIELECTRIC (HH)
          </text>
          <text x={leftV.x - 6} y={leftV.y + 10} textAnchor="end" fill="#FF2A85" fontSize="8" fontFamily="JetBrains Mono" fontWeight="600">
            PHASE (Δd mm)
          </text>
        </svg>
      </div>

      {/* Tabular Telemetry Badges */}
      <div className="grid grid-cols-3 gap-1 text-[9.5px] font-mono tabular-nums">
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">ΔHH_L (dB)</span>
          <span className="font-semibold text-cyan-electric">{hhL > 0 ? `+${hhL}` : hhL}</span>
        </div>
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">ΔHV_L (dB)</span>
          <span className="font-semibold text-slate-300">{hvL}</span>
        </div>
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">Dihedral s</span>
          <span className="font-semibold text-amber-dielectric">+{params.unmixedDihedral_s_dB} dB</span>
        </div>
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">WLS Residual χ²</span>
          <span className="font-semibold text-emerald-recovery">{params.wlsResidualChi2}</span>
        </div>
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">GUNW Δh (mm)</span>
          <span className={`font-semibold ${dispMm < -10 ? 'text-crimson-anomaly' : 'text-slate-200'}`}>
            {dispMm} mm
          </span>
        </div>
        <div className="bg-[#050C16] p-1 rounded border border-border-hairline flex flex-col">
          <span className="text-[7.5px] text-slate-400">Closure |Φ|</span>
          <span className="font-semibold text-slate-200">{closureRad} rad</span>
        </div>
      </div>
    </div>
  );
};
