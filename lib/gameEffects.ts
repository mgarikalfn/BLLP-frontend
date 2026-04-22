/**
 * gameEffects.ts
 * 
 * Standalone (non-hook) utilities for triggering game audio and visual effects.
 * These can be safely called from Zustand store actions (outside React components).
 */

// ─── Audio Effects ────────────────────────────────────────────────────────────

let _audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  try {
    if (!_audioCtx || _audioCtx.state === "closed") {
      _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return _audioCtx;
  } catch {
    return null;
  }
};

export const soundDing = (): void => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  [880, 1320, 1760].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.4);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18 - i * 0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65 + i * 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75 + i * 0.1);
  });
};

export const soundHeartbeat = (): void => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.22].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now + offset);
    osc.frequency.exponentialRampToValueAtTime(40, now + offset + 0.18);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now + offset);
    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.28);
  });
};

// ─── Confetti Effect ──────────────────────────────────────────────────────────

export const launchConfetti = async (): Promise<void> => {
  try {
    // Dynamically import so SSR is unaffected
    const confetti = (await import("canvas-confetti")).default;

    // First burst from the center
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7", "#22c55e"],
    });

    // Staggered side cannons for extra wow
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#ffd700", "#a855f7"] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#ffd700", "#22c55e"] });
    }, 150);
  } catch {
    // Silently fail if canvas-confetti is unavailable
  }
};
