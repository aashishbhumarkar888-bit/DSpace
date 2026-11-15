import React, { useState } from 'react';
import { AOIScenario, CompactCascadeStep } from '../../types';
import { GitCommit, ArrowDown, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CascadeDAGProps {
  currentAOI: AOIScenario;
  isMitigationActive: boolean;
  onSelectLayerHighlight?: (key: string) => void;
}

export const CascadeDAG: React.FC<CascadeDAGProps> = ({
  currentAOI,
  isMitigationActive,
  onSelectLayerHighlight,
}) => {
  const [selectedStep, setSelectedStep] = useState<CompactCascadeStep | null>(null);

  const steps = currentAOI.cascadeSteps;

  const handleStepClick = (step: CompactCascadeStep) => {
    setSelectedStep((prev) => (prev?.stepNumber === step.stepNumber ? null : step));
    if (onSelectLayerHighlight) {
      onSelectLayerHighlight(step.layerHighlightKey);
    }
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-1">
        <div className="flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-slate-200">
            4-STEP CAUSAL CASCADE TIMELINE
          </span>
        </div>
        <span className="text-[8.5px] font-mono text-slate-400">
          CLICK STEP TO INSPECT
        </span>
      </div>

      {/* 4 Steps - Compact, zero scrolling */}
      <div className="flex flex-col gap-1">
        {steps.map((step, idx) => {
          const isSelected = selectedStep?.stepNumber === step.stepNumber;
          const isLast = idx === steps.length - 1;
          const isCritical = isLast && !isMitigationActive;

          return (
            <div key={step.stepNumber} className="flex flex-col">
              <div
                onClick={() => handleStepClick(step)}
                className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-cyan-electric/20 border-cyan-electric shadow-glow-cyan'
                    : isCritical
                    ? 'bg-crimson-anomaly/10 border-crimson-anomaly/40 hover:border-crimson-anomaly'
                    : 'bg-[#050C16] border-border-hairline hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-mono font-bold ${
                      isCritical
                        ? 'bg-crimson-anomaly text-white'
                        : isSelected
                        ? 'bg-cyan-electric text-void'
                        : 'bg-surface-elevated text-cyan-electric border border-cyan-electric/40'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9.5px] font-mono font-bold text-slate-200 leading-tight">
                      {step.title}
                    </span>
                    <span className="text-[8px] font-mono text-slate-400">
                      {step.phaseCategory} • {step.scale}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-crimson-anomaly/20 text-crimson-anomaly border-crimson-anomaly/40'
                        : 'bg-surface-elevated text-cyan-electric border-border-hairline'
                    }`}
                  >
                    {step.metricBadge}
                  </span>
                </div>
              </div>

              {!isLast && (
                <div className="flex justify-center my-0.2">
                  <ArrowDown className="w-2.5 h-2.5 text-cyan-electric/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pop-up Equation & Detail Inspector if a step is clicked */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2 rounded-lg bg-[#07111E] border border-cyan-electric/40 text-[9.5px] font-mono flex flex-col gap-1 shadow-lg mt-0.5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border-hairline pb-0.5">
              <span className="font-bold text-cyan-electric text-[9.5px]">
                STEP {selectedStep.stepNumber}: {selectedStep.title}
              </span>
              <button
                onClick={() => setSelectedStep(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-slate-300 text-[9px] leading-tight">
              {selectedStep.description}
            </p>
            <div className="bg-[#03060C] p-1 rounded border border-border-hairline">
              <span className="text-[7.5px] text-slate-500 block uppercase">GOVERNING EQUATION:</span>
              <code className="text-emerald-recovery font-bold text-[8.5px]">
                {selectedStep.equation}
              </code>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
