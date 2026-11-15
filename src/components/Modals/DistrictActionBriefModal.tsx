import React from 'react';
import { X, Printer, ShieldCheck, AlertTriangle, FileText, Download, Building, MapPin, CheckCircle2 } from 'lucide-react';
import { AOIScenario } from '../../types';

interface DistrictActionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAOI: AOIScenario;
  isMitigationActive: boolean;
}

export const DistrictActionBriefModal: React.FC<DistrictActionBriefModalProps> = ({
  isOpen,
  onClose,
  currentAOI,
  isMitigationActive,
}) => {
  if (!isOpen) return null;

  const summary = currentAOI.plainEnglishSummary;
  const plan = currentAOI.mitigationPlan;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl select-none animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-electric/40 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-electric/15 border border-cyan-electric/40 text-cyan-electric">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  PRIORITY 1: DISASTER RISK ATTRIBUTION
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  REF: NDMA-NISAR-{currentAOI.aoiId.toUpperCase()}-2026
                </span>
              </div>
              <h2 className="text-base font-mono font-black text-white tracking-wider mt-1">
                OFFICIAL DISTRICT COLLECTOR ACTION DOSSIER
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Authority & Location Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase">TARGET AUTHORITY</span>
            <span className="font-bold text-white text-[11px] mt-0.5">District Magistrate, {currentAOI.region.split(',')[0]}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase">LINE DEPARTMENT</span>
            <span className="font-bold text-cyan-electric text-[11px] mt-0.5">Water Resources Dept (WRD)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase">GPS COORDINATES</span>
            <span className="font-bold text-slate-200 text-[11px] mt-0.5">{currentAOI.coordinates.lat}°N, {currentAOI.coordinates.lng}°E</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#060D18] border border-border-hairline flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase">NISAR SENSOR PROVENANCE</span>
            <span className="font-bold text-emerald-recovery text-[11px] mt-0.5">L-Band 23.84cm Pass #35</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-3.5 rounded-xl bg-[#081220] border border-cyan-electric/30 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono font-bold text-cyan-electric uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>EXECUTIVE DISASTER DIAGNOSIS</span>
          </span>
          <p className="text-xs font-sans text-slate-200 leading-relaxed">
            {summary.crisis}
          </p>
          <div className="text-[11px] font-sans text-slate-300 mt-1 pt-1 border-t border-border-hairline">
            <strong className="text-amber-400">Why Optical Imagery Failed:</strong> {summary.whyMissed}
          </div>
        </div>

        {/* Before vs After Impact Comparison Table */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            BEFORE VS. AFTER MITIGATION IMPACT MATRIX:
          </span>
          <div className="overflow-hidden rounded-xl border border-border-hairline">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#050C16] text-[10px] text-slate-400 border-b border-border-hairline">
                <tr>
                  <th className="py-2 px-3">EVALUATION METRIC</th>
                  <th className="py-2 px-3 text-rose-400">STATUS QUO (UNMITIGATED)</th>
                  <th className="py-2 px-3 text-emerald-recovery">AFTER DSPACE INTERVENTION</th>
                  <th className="py-2 px-3 text-cyan-electric">NET BENEFIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline bg-[#07111F] text-[11px]">
                <tr>
                  <td className="py-2 px-3 text-slate-300 font-bold">Populations & Villages at Risk</td>
                  <td className="py-2 px-3 text-rose-400 font-bold">{summary.villagesSaved} Villages Submerged</td>
                  <td className="py-2 px-3 text-emerald-recovery font-bold">0 Villages (Fully Drained)</td>
                  <td className="py-2 px-3 text-cyan-electric font-bold">+{summary.villagesSaved} Villages Protected</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-300 font-bold">Agricultural Cropland</td>
                  <td className="py-2 px-3 text-rose-400 font-bold">{summary.hectaresRecovered.toLocaleString()} Hectares Ruined</td>
                  <td className="py-2 px-3 text-emerald-recovery font-bold">100% Silt Flush & Drained</td>
                  <td className="py-2 px-3 text-cyan-electric font-bold">{summary.hectaresRecovered.toLocaleString()} ha Recovered</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-300 font-bold">Economic Asset Loss</td>
                  <td className="py-2 px-3 text-rose-400 font-bold">{summary.economicValueProtected} Projected Loss</td>
                  <td className="py-2 px-3 text-emerald-recovery font-bold">₹0 Crop Inundation Loss</td>
                  <td className="py-2 px-3 text-cyan-electric font-bold">{summary.economicValueProtected} Preserved</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-300 font-bold">Hydraulic Drainage SLA</td>
                  <td className="py-2 px-3 text-rose-400 font-bold">58 Days Stagnation Trap</td>
                  <td className="py-2 px-3 text-emerald-recovery font-bold">{plan.predictedRecoveryDays} Days Relief Siphon</td>
                  <td className="py-2 px-3 text-cyan-electric font-bold">44 Days Faster Drainage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Action & Engineering Prescription */}
        <div className="p-3.5 rounded-xl bg-[#06111D] border border-emerald-recovery/40 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-recovery uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PRESCRIBED ENGINEERING ACTION</span>
            </span>
            <span className="text-[9.5px] font-mono font-bold text-cyan-electric">
              RECOVERY WINDOW: {plan.predictedRecoveryDays} DAYS
            </span>
          </div>
          <h4 className="text-xs font-mono font-bold text-white">
            {plan.actionTitle}
          </h4>
          <p className="text-[11.5px] font-sans text-slate-300 leading-snug">
            {plan.actionDescription}
          </p>
        </div>

        {/* Footer & Buttons */}
        <div className="flex items-center justify-between border-t border-border-hairline pt-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-recovery" />
            <span>AUDITED VIA DSPACE NISAR CLOSED-LOOP INVERSION • MONGODB AUDIT ID: 6734c8a2f</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
            >
              CLOSE
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-electric text-slate-950 font-mono font-bold text-xs uppercase hover:bg-cyan-400 transition-all shadow-glow-cyan"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / EXPORT ACTION BRIEF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

