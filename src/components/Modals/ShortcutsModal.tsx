import React from 'react';
import { X, Keyboard, Satellite } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 / 2 / 3', desc: 'Shift Scale: MICRO (GUNW) / MESO (GCOV) / MACRO (GOFF)' },
    { key: 'Space', desc: 'Play / Pause 12-Day Orbital Timeline Scrubber' },
    { key: 'X', desc: 'Cycle Wavelength (400nm Optical → 5.6cm C-Band → 24cm L-Band)' },
    { key: 'L', desc: 'Toggle Split-Screen X-Ray Loupe Magnifier' },
    { key: 'C', desc: 'Toggle Triplet Closure Phase Bias Shield (Φ = φ12 + φ23 - φ13)' },
    { key: 'M', desc: 'Trigger 60-Day Physical Intervention Solver (<35ms)' },
    { key: 'S', desc: "Toggle 'Listen to the Earth\\'s Waltz' Web Audio Sonification" },
    { key: 'B', desc: 'Toggle Break-It Test (Inject Fake Moisture / Calibration Noise)' },
    { key: 'R', desc: 'Reset 3D Isometric Camera Angle & Zoom' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-cyan-electric/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-electric" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                DSpace MISSION CONTROL SHORTCUTS
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                HIGH-THROUGHPUT ANALYST WORKFLOWS & RADAR SATELLITE SPECS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2 rounded-lg bg-[#03060C] border border-border-hairline"
            >
              <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-cyan-electric/40 text-cyan-electric font-bold text-[11px] shadow-sm">
                {sc.key}
              </kbd>
              <span className="text-slate-300 text-[10px] text-right font-medium">{sc.desc}</span>
            </div>
          ))}
        </div>

        {/* Satellite Radar Specs */}
        <div className="bg-[#050C16] p-3 rounded-lg border border-cyan-electric/20 text-[10px] font-mono text-slate-300 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-cyan-electric font-semibold uppercase">
            <Satellite className="w-3.5 h-3.5" />
            <span>NISAR L+S BAND RADAR ARCHITECTURE</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-relaxed">
            NISAR utilizes a 12-meter deployable mesh reflector providing dual-frequency SweepSAR polarimetry.
            The 1.25 GHz L-Band (23.84cm wavelength) enables deep canopy and ground penetration, whereas the 3.2 GHz S-Band (9.3cm) captures upper vegetation and crop phenology across a global 12-day repeat orbit.
          </p>
        </div>

        <div className="flex justify-end border-t border-border-hairline pt-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-electric text-void font-mono font-bold text-xs uppercase hover:bg-cyan-400 transition-all shadow-glow-cyan"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
