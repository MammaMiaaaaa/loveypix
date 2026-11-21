// Retro 8-bit Web Audio API sound effects for LoveyPix

class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  _ensureCtx() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  beep(freq = 660, duration = 0.09, type = "square", volume = 0.08) {
    const ctx = this._ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  countdown(isFinal = false) {
    if (isFinal) {
      this.beep(1046, 0.16, "square", 0.09);
    } else {
      this.beep(660, 0.08, "square", 0.07);
    }
  }

  shutter() {
    const ctx = this._ensureCtx();
    if (!ctx) return;

    // Crisp mechanical shutter noise burst + retro chirp
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    this.beep(1320, 0.06, "triangle", 0.06);
  }

  pop() {
    this.beep(520, 0.05, "triangle", 0.06);
  }

  success() {
    this.beep(523, 0.08, "square", 0.06);
    setTimeout(() => this.beep(659, 0.08, "square", 0.06), 80);
    setTimeout(() => this.beep(784, 0.14, "square", 0.07), 160);
  }
}

export const sound = new SoundEngine();
