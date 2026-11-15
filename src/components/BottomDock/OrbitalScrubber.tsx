import React, { useEffect, useState } from 'react';
import { OrbitalEpoch } from '../../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock 
} from 'lucide-react';

interface OrbitalScrubberProps {
  epochs: OrbitalEpoch[];
  currentEpochIndex: number;
  setCurrentEpochIndex: (idx: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
}

export const OrbitalScrubber: React.FC<OrbitalScrubberProps> = ({
  epochs,
  currentEpochIndex,
  setCurrentEpochIndex,
  isPlaying,
  setIsPlaying,
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(750 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentEpochIndex((prev) => (prev + 1) % epochs.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, epochs.length]);

  const currentEpoch = epochs[currentEpochIndex] || epochs[0];

  return (
    <div className="flex flex-col gap-1 flex-1 max-w-xl bg-[#060D18]/90 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2 font-mono select-none shadow-xl">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-[9.5px]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="font-bold text-slate-100">
            PASS #{String(currentEpoch.epochIndex + 1).padStart(2, '0')}/60
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">DAY {currentEpoch.dayNumber}</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-electric font-semibold">{currentEpoch.passDate}</span>
        </div>

        <span
          className={`px-2 py-0.2 rounded text-[8.5px] font-bold border ${
            currentEpoch.season === 'Peak Monsoon'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : currentEpoch.season === 'Rabi Harvest'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : currentEpoch.season === 'Surge Event'
              ? 'bg-crimson-anomaly/20 text-crimson-anomaly border-crimson-anomaly/40'
              : 'bg-emerald-recovery/20 text-emerald-recovery border-emerald-recovery/40'
          }`}
        >
          {currentEpoch.season}
        </span>
      </div>

      {/* Scrubber Range Slider */}
      <div className="relative flex flex-col gap-0.5">
        <input
          type="range"
          min={0}
          max={epochs.length - 1}
          value={currentEpochIndex}
          onChange={(e) => setCurrentEpochIndex(Number(e.target.value))}
          className="w-full h-1.5 bg-[#03060C] rounded-lg appearance-none cursor-pointer accent-cyan-electric focus:outline-none"
        />

        <div className="flex justify-between text-[7.5px] text-slate-400 px-1">
          <span className="text-emerald-400">Pre-Monsoon</span>
          <span className="text-blue-400">Peak Monsoon (T-15..29)</span>
          <span className="text-amber-400">Rabi Harvest (T-30..44)</span>
          <span className="text-purple-400">Post-Cycle / Surge</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() => setCurrentEpochIndex((prev) => Math.max(0, prev - 1))}
          className="p-1 rounded-md bg-surface-elevated text-slate-400 hover:text-cyan-electric transition-colors"
          title="Previous 12-Day Pass"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10.5px] font-bold border transition-all ${
            isPlaying
              ? 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
              : 'bg-surface-elevated text-slate-200 border-border-hairline hover:border-slate-500'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'PAUSE 12-DAY ORBIT' : 'PLAY 12-DAY ORBIT'}</span>
        </button>

        <button
          onClick={() => setCurrentEpochIndex((prev) => Math.min(epochs.length - 1, prev + 1))}
          className="p-1 rounded-md bg-surface-elevated text-slate-400 hover:text-cyan-electric transition-colors"
          title="Next 12-Day Pass"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Speed Toggles */}
        <div className="flex items-center bg-[#03060C] border border-border-hairline rounded-md p-0.5 text-[8.5px] ml-auto">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                playbackSpeed === speed
                  ? 'bg-cyan-electric/25 text-cyan-electric font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
