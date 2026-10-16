// 音效與程序化音景。全部是可選功能：瀏覽器拒絕、沒有 Web Audio 或設定關閉時安靜退場。
export type CueKind =
  | "tap"
  | "safe"
  | "warning"
  | "breach"
  | "counter"
  | "reveal"
  | "dawn"
  | "intro";

export type AmbienceMode = "off" | "calm" | "night";
export type AmbienceStage = "idle" | "approach" | "warning" | "attack" | "breach" | "resolve";

/** 心跳間隔（毫秒）：接觸越近越快；沒有接觸時不跳。 */
export function heartbeatIntervalMs(stage: AmbienceStage): number {
  switch (stage) {
    case "approach":
      return 1050;
    case "warning":
      return 720;
    case "attack":
    case "breach":
      return 470;
    default:
      return 0;
  }
}

interface AmbienceGraph {
  sources: AudioScheduledSourceNode[];
  bus: GainNode;
}

export const MUSIC_URL = "assets/audio/night-theme.m4a";

export class AudioService {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private ambience: AmbienceGraph | null = null;
  private mode: AmbienceMode = "off";
  private stage: AmbienceStage = "idle";
  private clackTimer: ReturnType<typeof setInterval> | null = null;
  private heartTimer: ReturnType<typeof setInterval> | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicRequested = false;

  public async enable(): Promise<void> {
    const AudioCtor = globalThis.AudioContext ?? (globalThis as typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    if (!AudioCtor) return;
    try {
      if (!this.context) this.context = new AudioCtor();
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      // Sound is optional; a browser restriction must not block a game action.
    }
  }

  private running(): AudioContext | null {
    return this.context && this.context.state === "running" ? this.context : null;
  }

  private output(context: AudioContext): AudioNode {
    if (!this.master) {
      this.master = context.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(context.destination);
    }
    return this.master;
  }

  private tone(
    context: AudioContext,
    frequency: number,
    endFrequency: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== frequency)
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.012, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.output(context));
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private noiseBuffer(context: AudioContext): AudioBuffer | null {
    if (this.noise) return this.noise;
    if (typeof context.createBuffer !== "function") return null;
    const length = Math.floor(context.sampleRate * 2);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < length; index += 1) {
      // Brown-ish noise: a low rumble that loops without obvious clicks.
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.2;
    }
    this.noise = buffer;
    return buffer;
  }

  private burst(context: AudioContext, start: number, frequency: number, volume: number, duration: number): void {
    const buffer = this.noiseBuffer(context);
    if (!buffer) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 1.4;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(this.output(context));
    source.start(start, Math.random() * 1.5);
    source.stop(start + duration + 0.02);
  }

  public cue(kind: CueKind): void {
    const context = this.running();
    if (!context) return;
    const now = context.currentTime;
    try {
      switch (kind) {
        case "tap":
          this.tone(context, 260, 240, now, 0.05, 0.035);
          break;
        case "safe":
          this.tone(context, 392, 392, now, 0.35, 0.06);
          this.tone(context, 494, 494, now + 0.09, 0.4, 0.05);
          this.tone(context, 587, 587, now + 0.18, 0.55, 0.045);
          break;
        case "warning":
          this.tone(context, 180, 150, now, 0.22, 0.1, "triangle");
          this.tone(context, 180, 150, now + 0.28, 0.22, 0.08, "triangle");
          break;
        case "breach":
          this.burst(context, now, 220, 0.5, 0.35);
          this.tone(context, 90, 45, now, 0.45, 0.2, "sawtooth");
          break;
        case "counter":
          // Metallic shutter thunk followed by a short rising "clear" chime.
          this.burst(context, now, 1400, 0.28, 0.12);
          this.tone(context, 110, 70, now, 0.18, 0.16, "square");
          this.tone(context, 523, 784, now + 0.12, 0.28, 0.05);
          break;
        case "reveal":
          this.tone(context, 70, 62, now, 1.1, 0.12, "sawtooth");
          this.tone(context, 932, 880, now + 0.05, 0.9, 0.025, "triangle");
          break;
        case "dawn":
          for (const [index, frequency] of [262, 330, 392, 523].entries())
            this.tone(context, frequency, frequency, now + index * 0.12, 1.4, 0.045);
          break;
        case "intro":
          this.tone(context, 55, 52, now, 2.6, 0.14, "sawtooth");
          this.tone(context, 220, 207, now + 0.4, 2.2, 0.03, "triangle");
          break;
      }
    } catch {
      // A partially implemented audio graph must never block the game.
    }
  }

  /** 依畫面切換環境音；重複呼叫同一狀態不會重建節點。 */
  public setAmbience(mode: AmbienceMode, stage: AmbienceStage = "idle"): void {
    if (mode === this.mode && stage === this.stage) return;
    const context = this.running();
    if (!context) {
      if (mode === "off") this.stopAmbience();
      return;
    }
    const previousMode = this.mode;
    this.mode = mode;
    this.stage = stage;
    if (mode === "off") {
      this.stopAmbience();
      return;
    }
    try {
      if (!this.ambience) this.startAmbience(context);
      if (previousMode !== mode) this.retuneAmbience(context);
      this.syncHeartbeat(context);
      this.syncMusic(context);
    } catch {
      this.stopAmbience();
    }
  }

  private startAmbience(context: AudioContext): void {
    const buffer = this.noiseBuffer(context);
    if (!buffer) return;
    const bus = context.createGain();
    bus.gain.setValueAtTime(0.0001, context.currentTime);
    bus.gain.exponentialRampToValueAtTime(0.7, context.currentTime + 1.8);
    bus.connect(this.output(context));
    const rumble = context.createBufferSource();
    rumble.buffer = buffer;
    rumble.loop = true;
    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 150;
    const rumbleGain = context.createGain();
    rumbleGain.gain.value = 0.28;
    rumble.connect(low).connect(rumbleGain).connect(bus);
    const rain = context.createBufferSource();
    rain.buffer = buffer;
    rain.loop = true;
    rain.playbackRate.value = 2.7;
    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 2400;
    const rainGain = context.createGain();
    rainGain.gain.value = 0.05;
    rain.connect(high).connect(rainGain).connect(bus);
    rumble.start();
    rain.start(0, 0.7);
    this.ambience = { sources: [rumble, rain], bus };
    this.clackTimer = setInterval(() => {
      const live = this.running();
      if (!live || this.mode === "off") return;
      const at = live.currentTime + 0.02;
      // "ka-chunk": two wheel bogies crossing the same rail joint.
      this.burst(live, at, 700, 0.07, 0.07);
      this.burst(live, at + 0.17, 520, 0.09, 0.09);
    }, 1180);
  }

  private retuneAmbience(context: AudioContext): void {
    if (!this.ambience) return;
    const target = this.mode === "night" ? 0.95 : 0.7;
    this.ambience.bus.gain.cancelScheduledValues(context.currentTime);
    this.ambience.bus.gain.setTargetAtTime(target, context.currentTime, 0.6);
  }

  private syncHeartbeat(context: AudioContext): void {
    if (this.heartTimer) clearInterval(this.heartTimer);
    this.heartTimer = null;
    const interval = this.mode === "night" ? heartbeatIntervalMs(this.stage) : 0;
    if (!interval) return;
    const beat = () => {
      const live = this.running();
      if (!live) return;
      const at = live.currentTime + 0.02;
      this.tone(live, 62, 42, at, 0.16, 0.22);
      this.tone(live, 58, 40, at + 0.2, 0.14, 0.15);
    };
    beat();
    void context;
    this.heartTimer = setInterval(beat, interval);
  }

  private syncMusic(context: AudioContext): void {
    if (!this.musicRequested) {
      this.musicRequested = true;
      void this.loadMusic(context);
    }
    if (!this.musicGain) return;
    const target = this.mode === "night" ? 0.06 : 0.2;
    this.musicGain.gain.setTargetAtTime(target, context.currentTime, 0.8);
  }

  private async loadMusic(context: AudioContext): Promise<void> {
    try {
      if (typeof fetch !== "function" || typeof context.decodeAudioData !== "function") return;
      const response = await fetch(new URL(MUSIC_URL, globalThis.document?.baseURI ?? "http://localhost/").href);
      if (!response.ok) return;
      this.musicBuffer = await context.decodeAudioData(await response.arrayBuffer());
      if (this.mode === "off") return;
      this.startMusic(context);
    } catch {
      // The procedural soundscape stays as the fallback when the track is missing.
    }
  }

  private startMusic(context: AudioContext): void {
    if (!this.musicBuffer || this.musicSource) return;
    const source = context.createBufferSource();
    source.buffer = this.musicBuffer;
    source.loop = true;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.setTargetAtTime(this.mode === "night" ? 0.06 : 0.2, context.currentTime, 1.2);
    source.connect(gain).connect(this.output(context));
    source.start();
    this.musicSource = source;
    this.musicGain = gain;
  }

  private stopAmbience(): void {
    this.mode = "off";
    this.stage = "idle";
    if (this.clackTimer) clearInterval(this.clackTimer);
    if (this.heartTimer) clearInterval(this.heartTimer);
    this.clackTimer = null;
    this.heartTimer = null;
    for (const source of [...(this.ambience?.sources ?? []), ...(this.musicSource ? [this.musicSource] : [])]) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    this.ambience = null;
    this.musicSource = null;
    this.musicGain = null;
  }

  public async suspend(): Promise<void> {
    try {
      if (this.context?.state === "running") await this.context.suspend();
    } catch {
      // Ignore browser refusal.
    }
  }

  public async resume(): Promise<void> {
    try {
      if (this.context?.state === "suspended" && this.mode !== "off") await this.context.resume();
    } catch {
      // Ignore browser refusal.
    }
  }

  /** 測試與除錯用：目前的環境音狀態。 */
  public describeAmbience(): { mode: AmbienceMode; stage: AmbienceStage; heartbeat: boolean } {
    return { mode: this.mode, stage: this.stage, heartbeat: Boolean(this.heartTimer) };
  }
}
