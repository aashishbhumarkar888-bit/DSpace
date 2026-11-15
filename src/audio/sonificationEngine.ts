// Web Audio API Polyphonic Synthesizer for "Listen to the Earth's Waltz"

class EarthWaltzSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private onSpectrumUpdate: ((freqData: Uint8Array) => void) | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSpectrumCallback(cb: (freqData: Uint8Array) => void) {
    this.onSpectrumUpdate = cb;
  }

  public start(
    roughnessHV_dB: number,
    dielectricHH_dB: number,
    phaseMotion_mm: number,
    isAnomaly: boolean,
    scaleFreqs: number[]
  ) {
    this.init();
    if (!this.ctx) return;
    if (this.isPlaying) {
      this.updateParameters(roughnessHV_dB, dielectricHH_dB, phaseMotion_mm, isAnomaly, scaleFreqs);
      return;
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.3);

    // Spectrum Analyser
    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 64;
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(ctx.destination);

    // Biquad Filter (Dielectric HH controls Cutoff & Resonance Q)
    this.filterNode = ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    const cutoff = Math.max(180, Math.min(3800, (dielectricHH_dB + 30) * 120 + 400));
    const resonance = isAnomaly ? 8.5 : 2.5;
    this.filterNode.frequency.setValueAtTime(cutoff, now);
    this.filterNode.Q.setValueAtTime(resonance, now);
    this.filterNode.connect(this.masterGain);

    // LFO for Phase Motion rhythmic pulse
    this.lfoOsc = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    // Phase motion mapped to pulse rate: 0.5Hz (calm) up to 8Hz (violent creep/earthquake)
    const lfoRate = Math.max(0.5, Math.min(8.0, Math.abs(phaseMotion_mm) * 0.15 + 0.8));
    this.lfoOsc.frequency.setValueAtTime(lfoRate, now);
    this.lfoGain.gain.setValueAtTime(isAnomaly ? 0.35 : 0.12, now);
    this.lfoOsc.connect(this.lfoGain.gain);
    this.lfoOsc.start(now);

    // Build Polyphonic Ambient Chord
    this.padOscs = [];
    const notes = isAnomaly 
      ? [scaleFreqs[0] || 110, (scaleFreqs[0] || 110) * 1.414, (scaleFreqs[1] || 130) * 1.5] // tritone tension
      : (scaleFreqs.length >= 3 ? scaleFreqs.slice(0, 3) : [110, 164.81, 196.00]); // consonant triad

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      // Roughness HV controls waveform timbre: smooth sine for low roughness, detuned saw for high roughness
      osc.type = isAnomaly ? 'sawtooth' : (idx === 0 ? 'sine' : 'triangle');
      // Subtle detune for shimmer
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1) * (isAnomaly ? 18 : 6), now);

      oscGain.gain.setValueAtTime(0.18 / (idx + 1), now);
      osc.connect(oscGain);
      oscGain.connect(this.filterNode!);
      osc.start(now);
      this.padOscs.push(osc);
    });

    this.isPlaying = true;
    this.runSpectrumLoop();
  }

  public updateParameters(
    roughnessHV_dB: number,
    dielectricHH_dB: number,
    phaseMotion_mm: number,
    isAnomaly: boolean,
    scaleFreqs: number[]
  ) {
    if (!this.ctx || !this.isPlaying || !this.filterNode || !this.lfoOsc) return;
    const now = this.ctx.currentTime;

    // Filter update
    const cutoff = Math.max(180, Math.min(3800, (dielectricHH_dB + 30) * 120 + 400));
    const resonance = isAnomaly ? 9.0 : 2.5;
    this.filterNode.frequency.setTargetAtTime(cutoff, now, 0.1);
    this.filterNode.Q.setTargetAtTime(resonance, now, 0.1);

    // LFO rate update
    const lfoRate = Math.max(0.5, Math.min(8.0, Math.abs(phaseMotion_mm) * 0.15 + 0.8));
    this.lfoOsc.frequency.setTargetAtTime(lfoRate, now, 0.1);

    // Oscillator frequency updates
    const notes = isAnomaly 
      ? [scaleFreqs[0] || 110, (scaleFreqs[0] || 110) * 1.414, (scaleFreqs[1] || 130) * 1.5]
      : (scaleFreqs.length >= 3 ? scaleFreqs.slice(0, 3) : [110, 164.81, 196.00]);

    this.padOscs.forEach((osc, idx) => {
      const targetFreq = notes[idx] || (scaleFreqs[0] * (idx + 1));
      osc.frequency.setTargetAtTime(targetFreq, now, 0.15);
      osc.type = isAnomaly ? 'sawtooth' : (idx === 0 ? 'sine' : 'triangle');
    });
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.001, now, 0.2);
    }

    setTimeout(() => {
      this.padOscs.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch {}
      });
      this.padOscs = [];
      if (this.lfoOsc) {
        try { this.lfoOsc.stop(); this.lfoOsc.disconnect(); } catch {}
        this.lfoOsc = null;
      }
      this.isPlaying = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }, 250);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private runSpectrumLoop() {
    if (!this.isPlaying || !this.analyserNode) return;
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    if (this.onSpectrumUpdate) {
      this.onSpectrumUpdate(dataArray);
    }

    this.animationFrameId = requestAnimationFrame(() => this.runSpectrumLoop());
  }
}

export const earthSynthesizer = new EarthWaltzSynthesizer();

