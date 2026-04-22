/**
 * useGameAudio — Synthesizes game sound effects with the Web Audio API.
 * No audio files are required. All sounds are generated programmatically.
 */
"use client";

import { useCallback } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAudioContext = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx || ctx.state === "closed") {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctx;
  };
})();

// ─── Sound Definitions ────────────────────────────────────────────────────────

/**
 * "Ding" — a bright, short chime used when a reward is claimed.
 * Built from two sine oscillators slightly detuned to create a bell-like
 * overtone effect.
 */
const playDing = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [880, 1320, 1760]; // A5, E6, A6 — major triad
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.4);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18 - i * 0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7 + i * 0.1);
    });
  } catch {
    // Audio will silently fail if user hasn't interacted yet or on SSR
  }
};

/**
 * "Heartbeat" — a low, thumping pulse used when the player loses a heart.
 * Simulated with a modulated sawtooth wave that decays quickly.
 */
const playHeartbeat = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two thumps, like a real heartbeat
    const thumps = [0, 0.22];
    thumps.forEach((offset) => {
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
      osc.stop(now + offset + 0.25);
    });
  } catch {
    // Silently fail
  }
};

/**
 * "Error Buzz" — a short, harsh buzz for out-of-hearts state or wrong answer.
 */
const playBuzz = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Silently fail
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGameAudio = () => {
  const ding = useCallback(() => {
    playDing();
  }, []);

  const heartbeat = useCallback(() => {
    playHeartbeat();
  }, []);

  const buzz = useCallback(() => {
    playBuzz();
  }, []);

  return { ding, heartbeat, buzz };
};
