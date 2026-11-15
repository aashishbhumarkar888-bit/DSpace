// DSpace Audible Voice Synthesis & Web Audio Mission Control Telemetry Sound Engine

class VoiceTourEngine {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoiceMuted: boolean = false;
  private isSpeakingActive: boolean = false;
  private speakingListeners: Array<(speaking: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play crisp NASA-ISRO mission-control telemetry harmonic chime (880Hz -> 1320Hz)
  public playTelemetryChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // Play confirmation success chord (440Hz + 554Hz + 659Hz)
  public playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
      });
    } catch {}
  }

  public subscribeSpeaking(callback: (speaking: boolean) => void): () => void {
    this.speakingListeners.push(callback);
    callback(this.isSpeakingActive);
    return () => {
      this.speakingListeners = this.speakingListeners.filter((cb) => cb !== callback);
    };
  }

  private notifySpeaking(speaking: boolean) {
    this.isSpeakingActive = speaking;
    this.speakingListeners.forEach((cb) => cb(speaking));
  }

  public setVoiceMuted(muted: boolean) {
    this.isVoiceMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getVoiceMuted(): boolean {
    return this.isVoiceMuted;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.notifySpeaking(false);
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.isVoiceMuted || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.playTelemetryChime();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best English voice available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Aria') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('Natural') ||
          v.lang.startsWith('en')) &&
        !v.name.includes('Bad')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.notifySpeaking(true);
    };

    utterance.onend = () => {
      this.notifySpeaking(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notifySpeaking(false);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export const voiceTourEngine = new VoiceTourEngine();

