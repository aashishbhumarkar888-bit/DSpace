import React, { useEffect, useState } from 'react';
import { earthSynthesizer } from '../../audio/sonificationEngine';
import { AOIScenario } from '../../types';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface AudioStudioProps {
  currentAOI: AOIScenario;
  isMitigationActive: boolean;
  timeEpochIndex: number;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({
  currentAOI,
  isMitigationActive,
  timeEpochIndex,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [spectrumBars, setSpectrumBars] = useState<number[]>(() => new Array(24).fill(12));

  useEffect(() => {
    earthSynthesizer.setSpectrumCallback((freqData: Uint8Array) => {
      const bars: number[] = [];
      const barCount = 24;
      const step = Math.max(1, Math.floor(freqData.length / barCount));
      for (let i = 0; i < barCount; i++) {
        bars.push(freqData[i * step] || 0);
      }
      setSpectrumBars(bars);
    });

    return () => {
      earthSynthesizer.stop();
    };
  }, []);

  useEffect(() => {
    if (isPlayingAudio) {
      const isAnomaly = !isMitigationActive && (timeEpochIndex >= 22 && timeEpochIndex <= 46);
      earthSynthesizer.updateParameters(
        currentAOI.physicsParameters.roughnessHV_dB,
        currentAOI.physicsParameters.dielectricHH_dB,
        currentAOI.physicsParameters.phaseMotion_mm,
        isAnomaly,
        currentAOI.audioSignature.scale
      );
    }
  }, [currentAOI, isMitigationActive, timeEpochIndex, isPlayingAudio]);

  const toggleSonification = () => {
    if (isPlayingAudio) {
      earthSynthesizer.stop();
      setIsPlayingAudio(false);
    } else {
      const isAnomaly = !isMitigationActive && (timeEpochIndex >= 22 && timeEpochIndex <= 46);
      earthSynthesizer.start(
        currentAOI.physicsParameters.roughnessHV_dB,
        currentAOI.physicsParameters.dielectricHH_dB,
        currentAOI.physicsParameters.phaseMotion_mm,
        isAnomaly,
        currentAOI.audioSignature.scale
      );
      setIsPlayingAudio(true);
    }
  };

  const isAnomalyPlaying = !isMitigationActive && (timeEpochIndex >= 22 && timeEpochIndex <= 46);

  return (
    <div className="flex flex-col gap-1 bg-[#060D18]/90 backdrop-blur-xl border border-cyan-electric/25 rounded-xl p-2 w-[240px] shrink-0 font-mono select-none shadow-xl">
      <div className="flex items-center justify-between text-[9px] border-b border-border-hairline pb-0.5">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-cyan-electric" />
          <span className="text-slate-200 font-bold tracking-wider">
            EARTH WALTZ SYNTHESIZER
          </span>
        </div>
        <span
          className={`text-[8px] font-bold px-1 rounded ${
            isAnomalyPlaying ? 'bg-crimson-anomaly/20 text-crimson-anomaly' : 'bg-cyan-electric/20 text-cyan-electric'
          }`}
        >
          {isPlayingAudio ? (isAnomalyPlaying ? 'DISSONANT ALARM' : 'CONSONANT') : 'MUTED'}
        </span>
      </div>

      {/* 24-Bar Real-Time Frequency Spectrum Visualizer */}
      <div className="flex items-end justify-between h-[32px] bg-[#02050B] rounded-lg px-1.5 py-1 gap-0.5 border border-border-hairline">
        {spectrumBars.map((val, idx) => {
          const heightPct = isPlayingAudio ? Math.max(8, (val / 255) * 100) : 10;
          return (
            <div
              key={idx}
              className={`w-full rounded-t-sm transition-all duration-75 ${
                isAnomalyPlaying ? 'bg-crimson-anomaly' : 'bg-cyan-electric'
              }`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>

      <button
        onClick={toggleSonification}
        className={`w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-bold tracking-wide border transition-all duration-200 ${
          isPlayingAudio
            ? isAnomalyPlaying
              ? 'bg-crimson-anomaly/25 text-crimson-anomaly border-crimson-anomaly shadow-glow-crimson'
              : 'bg-cyan-electric/25 text-cyan-electric border-cyan-electric shadow-glow-cyan'
            : 'bg-surface-elevated text-slate-300 border-border-hairline hover:border-cyan-electric hover:text-cyan-electric'
        }`}
      >
        {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{isPlayingAudio ? 'MUTE SONIFICATION' : '🔊 SONIFY SURFACE PHYSICS'}</span>
      </button>

      <span className="text-[7px] text-slate-400 text-center leading-none">
        HV→Pitch • HH→Filter Cutoff/Q • Δφ→LFO Pulse
      </span>
    </div>
  );
};
