// The Sequencer's sound, synthesised with Web Audio, so there are no files
// to load. Two voices:
//   hum   a low, filtered drone of detuned saws. Its pitch, brightness and
//         level follow how fast the cards are moving.
//   tick  a short blip each time a card crosses the centre, so a fast
//         scroll ratchets.
//
// Browsers only let audio start from a user gesture, so the AudioContext is
// created on the first enable() and every call before that is a no-op.

export const SOUND = {
  // Speed (cards per second) at which the hum peaks
  fullSpeed: 10,
  // Hum pitch at rest, and how many octaves it climbs at full speed
  baseHz: 55,
  octaves: 1.5,
  // Lowpass cutoff at rest and at full speed
  cutoff: [180, 2800],
  // Hum level at rest (a faint bed, so "on" is audible) and at full speed
  level: [0.02, 0.16],
  // How quickly the hum follows the speed (seconds)
  glide: 0.06,
  tickHz: 1400,
  tickLevel: 0.12,
  master: 0.7,
};

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export class SequencerSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private hum: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private enabled = false;
  private lastNorm = 0;

  // Call from a user gesture (a click on the toggle, or the first press)
  enable() {
    this.enabled = true;
    if (!this.ctx && !this.build()) return;
    const ctx = this.ctx!;
    ctx.resume().catch(() => {});
    this.master!.gain.setTargetAtTime(SOUND.master, ctx.currentTime, 0.05);
  }

  disable() {
    this.enabled = false;
    const ctx = this.ctx;
    if (!ctx) return;
    this.master!.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
    // Let the fade finish, then stop the audio thread
    setTimeout(() => {
      if (!this.enabled && ctx.state === "running") ctx.suspend();
    }, 250);
  }

  // Pause while the tab is hidden, and pick up again when it's back
  setVisible(visible: boolean) {
    const ctx = this.ctx;
    if (!ctx) return;
    if (!visible) ctx.suspend();
    else if (this.enabled) ctx.resume().catch(() => {});
  }

  // Speed in cards per second, signed. Called every frame the cards move.
  setSpeed(speed: number) {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || ctx.state !== "running") return;
    const n = Math.min(Math.abs(speed) / SOUND.fullSpeed, 1);
    this.lastNorm = n;
    const t = ctx.currentTime;
    const hz = SOUND.baseHz * Math.pow(2, n * SOUND.octaves);
    this.oscillators[0].frequency.setTargetAtTime(hz, t, SOUND.glide);
    this.oscillators[1].frequency.setTargetAtTime(hz * 1.005, t, SOUND.glide);
    this.oscillators[2].frequency.setTargetAtTime(hz / 2, t, SOUND.glide);
    const [c0, c1] = SOUND.cutoff;
    this.filter!.frequency.setTargetAtTime(c0 + (c1 - c0) * n, t, SOUND.glide);
    const [l0, l1] = SOUND.level;
    this.hum!.gain.setTargetAtTime(l0 + (l1 - l0) * n, t, SOUND.glide);
  }

  // A card crossed the centre
  tick() {
    const ctx = this.ctx;
    if (!ctx || !this.enabled || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    // Faster scrolling ticks a little higher
    osc.frequency.value = SOUND.tickHz * (1 + 0.4 * this.lastNorm);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(SOUND.tickLevel, t + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(env).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.07);
    osc.onended = () => env.disconnect();
  }

  dispose() {
    this.enabled = false;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.oscillators = [];
  }

  private build() {
    const Ctor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return false;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const hum = ctx.createGain();
    hum.gain.value = SOUND.level[0];
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = SOUND.cutoff[0];
    filter.Q.value = 6;
    filter.connect(hum).connect(master);

    // Two detuned saws and a sine an octave down
    const voices: [OscillatorType, number, number][] = [
      ["sawtooth", 1, 0.5],
      ["sawtooth", 1.005, 0.5],
      ["sine", 0.5, 0.8],
    ];
    this.oscillators = voices.map(([type, ratio, level]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = SOUND.baseHz * ratio;
      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain).connect(filter);
      osc.start();
      return osc;
    });

    this.ctx = ctx;
    this.master = master;
    this.hum = hum;
    this.filter = filter;
    return true;
  }
}
