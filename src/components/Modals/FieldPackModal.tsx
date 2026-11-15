import React, { useState } from 'react';
import { AOIScenario } from '../../types';
import { X, Download, FileText, Database, CheckCircle2, HardDrive, ShieldCheck } from 'lucide-react';

interface FieldPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAOI: AOIScenario;
}

export const FieldPackModal: React.FC<FieldPackModalProps> = ({
  isOpen,
  onClose,
  currentAOI,
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloadProgress(0);
    setDownloadSuccess(false);

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setDownloadSuccess(true);
        const blob = new Blob(
          [
            `=== DSpace // OFFLINE DISASTER FIELD PACK ===\n`,
            `Application: DSpace (Deep-Space Radar Surface Intelligence)\n`,
            `AOI: ${currentAOI.name}\n`,
            `Granule ID: ${currentAOI.granuleId}\n`,
            `Coordinates: ${currentAOI.coordinates.lat}°N, ${currentAOI.coordinates.lng}°E, ${currentAOI.coordinates.elevation}m\n`,
            `Orbit Pass: ${currentAOI.orbitPass}\n`,
            `Timestamp: ${new Date().toISOString()}\n\n`,
            `--- PHYSICS ATTRIBUTION TELEMETRY ---\n`,
            `Roughness HV: ${currentAOI.physicsParameters.roughnessHV_dB} dB\n`,
            `Dielectric HH: ${currentAOI.physicsParameters.dielectricHH_dB} dB\n`,
            `Phase Motion Δd: ${currentAOI.physicsParameters.phaseMotion_mm} mm\n`,
            `Closure Phase |Φ|: ${currentAOI.physicsParameters.closurePhaseRad} rad\n`,
            `WLS Residual χ²: ${currentAOI.physicsParameters.wlsResidualChi2}\n`,
            `Unmixed Dihedral s: ${currentAOI.physicsParameters.unmixedDihedral_s_dB} dB\n\n`,
            `--- MITIGATION ENGINEERING PLAN ---\n`,
            `Action: ${currentAOI.mitigationPlan.title}\n`,
            `Impact: ${currentAOI.mitigationPlan.populationProtected.toLocaleString()} population, ${currentAOI.mitigationPlan.hectaresProtected.toLocaleString()} ha protected\n`,
            `Target Recovery: ${currentAOI.mitigationPlan.predictedRecoveryDays} days\n`,
          ],
          { type: 'text/plain;charset=utf-8' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DSpace_${currentAOI.id}_FIELD_PACK.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setDownloadProgress(p);
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-xl select-none">
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-cyan-electric/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-electric" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                DSpace OFFLINE 40MB FIELD PACK
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                DISASTER DISPATCH & OFFLINE SATELLITE RADAR ANALYTICS
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

        {/* Granule Metadata Box */}
        <div className="bg-[#03060C] p-3 rounded-lg border border-border-hairline text-xs font-mono flex flex-col gap-1.5">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>TARGET GRANULE:</span>
            <span className="text-cyan-electric font-bold">{currentAOI.granuleId}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>COORDINATES:</span>
            <span className="text-slate-200">
              {currentAOI.coordinates.lat}°N, {currentAOI.coordinates.lng}°E ({currentAOI.location})
            </span>
          </div>
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>PACKAGE PAYLOAD:</span>
            <span className="text-emerald-recovery font-bold">39.4 MB (Compressed TAR.GZ)</span>
          </div>
        </div>

        {/* Included Data Assets */}
        <div className="flex flex-col gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            INCLUDED SATELLITE & HYDRAULIC ARTIFACTS:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 rounded bg-surface-elevated border border-border-hairline flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-electric" />
              <span>NISAR L2 GCOV (COGs GeoTIFF)</span>
            </div>
            <div className="p-2 rounded bg-surface-elevated border border-border-hairline flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-electric" />
              <span>GUNW Phase Unwrapped (HDF5)</span>
            </div>
            <div className="p-2 rounded bg-surface-elevated border border-border-hairline flex items-center gap-2 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-cyan-electric" />
              <span>Manning Hydro Simulation Grid</span>
            </div>
            <div className="p-2 rounded bg-surface-elevated border border-border-hairline flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-recovery" />
              <span>WASM Physics Attribution Engine</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {downloadProgress !== null && (
          <div className="flex flex-col gap-1 text-[10px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>GENERATING 40MB BUNDLE...</span>
              <span className="text-cyan-electric">{downloadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-[#091322] rounded-full overflow-hidden border border-border-hairline">
              <div
                className="h-full bg-cyan-electric transition-all duration-150"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-hairline pt-3">
          <span className="text-[10px] font-mono text-slate-400">
            {downloadSuccess ? (
              <span className="text-emerald-recovery flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PACK READY & SAVED
              </span>
            ) : (
              'STANDALONE FIELD READY'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white"
            >
              CANCEL
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-electric text-void font-mono font-bold text-xs tracking-wider uppercase hover:bg-cyan-400 transition-all shadow-glow-cyan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadProgress !== null ? 'DOWNLOADING...' : 'DOWNLOAD 40MB PACK'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
