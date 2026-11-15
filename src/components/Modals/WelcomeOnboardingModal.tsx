import React from 'react';
import { X, CloudRain, Satellite, Zap, ArrowRight, Play, Sparkles } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#07111F] to-[#03070E] border border-cyan-electric/40 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-electric/15 border border-cyan-electric/40 shadow-glow-cyan">
              <Satellite className="w-5 h-5 text-cyan-electric animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-mono font-extrabold text-white tracking-wider flex items-center gap-2">
                <span>WELCOME TO DSpace</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/40">
                  30s GUIDE
                </span>
              </h2>
              <p className="text-xs font-sans text-slate-400">
                Understand Earth's hidden surface crises in 3 simple clicks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Cards for Complete Beginners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: The Problem */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-border-hairline flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400">
              <CloudRain className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                1. The Problem
              </span>
            </div>
            <p className="text-[11.5px] font-sans text-slate-300 leading-snug">
              Normal satellites act like phone cameras—they are <strong className="text-amber-300">blinded by monsoon storm clouds, smoke, and tree leaves</strong>, unable to see pooling floodwater or sinking ground.
            </p>
          </div>

          {/* Card 2: The DSpace Solution */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-electric/30 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-cyan-electric">
              <Satellite className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                2. The Solution
              </span>
            </div>
            <p className="text-[11.5px] font-sans text-slate-300 leading-snug">
              DSpace uses NASA-ISRO's <strong className="text-cyan-electric">24cm radar waves like a medical X-Ray</strong>—peeling away clouds and trees to spot hidden floods, sinking farmland, and landslide risks.
            </p>
          </div>

          {/* Card 3: Try It in 10 Seconds */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-recovery/40 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-recovery">
              <Zap className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                3. Try It in 10s
              </span>
            </div>
            <p className="text-[11.5px] font-sans text-slate-300 leading-snug">
              <span className="font-bold text-white">①</span> Drag the top <strong className="text-white">X-Ray Slider</strong>,<br />
              <span className="font-bold text-white">②</span> Click beacons <strong className="text-white">①–④</strong> on map,<br />
              <span className="font-bold text-white">③</span> Click <strong className="text-emerald-400">⚡ Simulate Solution</strong>!
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-hairline pt-3">
          <span className="text-[10px] font-mono text-slate-400">
            Switch anytime between ✨ Simple Guide View and 🔬 Pro Radar Telemetry
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-electric text-slate-950 font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-glow-cyan"
          >
            <span>START EXPLORING EARTH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

