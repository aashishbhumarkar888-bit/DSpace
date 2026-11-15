import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  User, 
  Sparkles, 
  Microscope, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ScientistAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (scientistInfo: { name: string; role: string; id: string }) => void;
}

export const ScientistAdminLoginModal: React.FC<ScientistAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('scientist@nisar.space');
  const [passcode, setPasscode] = useState('NISAR-2026');
  const [role, setRole] = useState('Lead SAR Scientist (ISRO/NASA SAC)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() !== 'NISAR-2026') {
      setError('Invalid mission access passcode. Use NISAR-2026 or click 1-Click Demo Login.');
      return;
    }
    setError(null);
    onLoginSuccess({
      name: email.split('@')[0].toUpperCase(),
      role: role,
      id: 'NISAR-SAC-4029',
    });
    onClose();
  };

  const handle1ClickBypass = () => {
    setEmail('scientist@nisar.space');
    setPasscode('NISAR-2026');
    setRole('Lead SAR Scientist (ISRO/NASA SAC)');
    setError(null);
    onLoginSuccess({
      name: 'DR. A. BHUMARKAR',
      role: 'Lead SAR Scientist (ISRO/NASA SAC)',
      id: 'NISAR-SAC-4029',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto select-none animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-cyan-electric/40 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-electric/15 border border-cyan-electric/40 text-cyan-electric shadow-glow-cyan">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/30">
                  LEVEL-4 TELEMETRY PORTAL
                </span>
              </div>
              <h2 className="text-base font-mono font-black text-white tracking-wider mt-1">
                SCIENTIST & ADMIN AUTHENTICATION
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Judge & Scientist Instant Access Bypass (Prominent CTA) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-electric/20 via-emerald-500/20 to-cyan-electric/20 border border-cyan-electric/50 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-electric flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-electric animate-spin" />
              <span>JUDGE / EVALUATOR DEMO ACCESS</span>
            </span>
            <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              INSTANT 1-CLICK
            </span>
          </div>
          <p className="text-[11px] font-sans text-slate-200">
            Instantly bypass password verification to unlock full Microwave Polarimetric Matrix controls, WLS Chi-Square calibration sliders, and raw MongoDB telemetry inspection.
          </p>
          <button
            onClick={handle1ClickBypass}
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-electric text-slate-950 font-mono text-xs font-black tracking-wider uppercase hover:bg-cyan-400 shadow-glow-cyan transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 fill-current" />
            <span>⚡ INSTANT JUDGE DEMO LOGIN (1-CLICK BYPASS)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 my-1 text-slate-500 text-xs font-mono">
          <div className="h-[1px] bg-slate-800 flex-1" />
          <span>OR MANUAL CREDENTIALS</span>
          <div className="h-[1px] bg-slate-800 flex-1" />
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleManualLogin} className="flex flex-col gap-3 text-xs font-mono">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">SCIENTIST ID / EMAIL</label>
            <div className="relative flex items-center">
              <User className="w-3.5 h-3.5 text-cyan-electric absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#060D18] border border-border-hairline rounded-lg pl-8 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-electric"
                placeholder="scientist@nisar.space"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">ACCESS PASSCODE (DEFAULT: NISAR-2026)</label>
            <div className="relative flex items-center">
              <Key className="w-3.5 h-3.5 text-cyan-electric absolute left-2.5 pointer-events-none" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#060D18] border border-border-hairline rounded-lg pl-8 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-electric"
                placeholder="NISAR-2026"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-[10px]">OPERATIONAL ROLE</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#060D18] border border-border-hairline rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-electric cursor-pointer"
            >
              <option value="Lead SAR Scientist (ISRO/NASA SAC)">Lead SAR Scientist (ISRO/NASA SAC)</option>
              <option value="Mission Director (NDMA / PMO Operations)">Mission Director (NDMA / PMO Operations)</option>
              <option value="Senior Hydrologist (Central Water Commission)">Senior Hydrologist (Central Water Commission)</option>
            </select>
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-border-hairline font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>AUTHENTICATE MANUAL ACCESS</span>
          </button>
        </form>
      </div>
    </div>
  );
};
