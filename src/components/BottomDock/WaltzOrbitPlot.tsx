import React from 'react';
import { OrbitalEpoch } from '../../types';
import { Orbit } from 'lucide-react';

interface WaltzOrbitPlotProps {
  currentEpoch: OrbitalEpoch;
  epochs: OrbitalEpoch[];
  isMitigationActive: boolean;
}

export const WaltzOrbitPlot: React.FC<WaltzOrbitPlotProps> = ({
  currentEpoch,
  epochs,
  isMitigationActive,
}) => {
  const cx = 75;
  const cy = 50;
  const rx = 44;
  const ry = 26;

  const trailPoints = epochs.slice(0, currentEpoch.epochIndex + 1).map((ep) => {
    const angle = (ep.epochIndex / 60) * Math.PI * 4;
    const basePX = cx + Math.cos(angle) * rx;
    const basePY = cy + Math.sin(angle) * ry;

    const anomalyOffset = (!isMitigationActive && ep.anomalyIntensity > 0.4)
      ? ep.anomalyIntensity * 28
      : 0;

    return {
      x: basePX + anomalyOffset,
      y: basePY - anomalyOffset * 0.7,
      isAnomaly: ep.anomalyIntensity > 0.5 && !isMitigationActive,
    };
  });

  const pathD = trailPoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const currentPt = trailPoints[trailPoints.length - 1] || { x: cx, y: cy, isAnomaly: false };
  const isCurrentlySnapping = currentEpoch.anomalyIntensity > 0.45 && !isMitigationActive;

  return (
    <div className="flex flex-col gap-1 bg-[#060D18]/90 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2 w-[185px] shrink-0 font-mono select-none shadow-xl">
      <div className="flex items-center justify-between text-[9px] border-b border-border-hairline pb-0.5">
        <span className="text-slate-200 font-bold tracking-wider flex items-center gap-1">
          <Orbit className="w-3 h-3 text-cyan-electric" />
          <span>WALTZ ORBIT (HH, HV)</span>
        </span>
        <span
          className={`text-[8px] font-bold px-1 rounded ${
            isCurrentlySnapping ? 'bg-crimson-anomaly/20 text-crimson-anomaly animate-pulse' : 'text-slate-400'
          }`}
        >
          {isCurrentlySnapping ? 'SNAP OUT' : 'NORMAL'}
        </span>
      </div>

      <div className="relative w-full h-[62px] flex items-center justify-center">
        <svg width="150" height="62" viewBox="0 0 150 62" className="overflow-visible">
          {/* Normal seasonal ellipse orbit */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="rgba(0, 240, 255, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="3,2"
          />

          {/* Anomaly arc */}
          <ellipse
            cx={cx + 20}
            cy={cy - 12}
            rx={rx * 0.7}
            ry={ry * 0.7}
            fill="none"
            stroke="rgba(255, 30, 86, 0.2)"
            strokeWidth="0.8"
            strokeDasharray="2,3"
          />

          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={isCurrentlySnapping ? '#FF1E56' : '#00F0FF'}
              strokeWidth="1.6"
              strokeOpacity="0.85"
            />
          )}

          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="3.5"
            fill={isCurrentlySnapping ? '#FF1E56' : '#00F0FF'}
            className={isCurrentlySnapping ? 'animate-ping' : ''}
          />
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r="2"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[8px] text-slate-400">
        <span>HH: {currentEpoch.hhDrift.toFixed(1)} dB</span>
        <span>HV: {currentEpoch.hvDrift.toFixed(1)} dB</span>
      </div>
    </div>
  );
};
