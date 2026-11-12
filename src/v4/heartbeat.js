import { HEART } from './config.js';

export const PULSE_KEYFRAMES = Object.freeze([
  [0.00,  0.000],
  [0.150, -0.132],
  [0.320,  0.103],
  [0.515, -0.029],
  [0.685,  0.018],
  [1.00,  0.000]
]);

function ease(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export function beatPhase(seconds) {
  return ((seconds / HEART.period) % 1 + 1) % 1;
}

export function heartbeat(seconds) {
  const phase = beatPhase(seconds);
  for (let i = 0; i < PULSE_KEYFRAMES.length - 1; i++) {
    const [start, from] = PULSE_KEYFRAMES[i];
    const [end, to] = PULSE_KEYFRAMES[i + 1];
    if (phase <= end) {
      return from + (to - from) * ease((phase - start) / (end - start));
    }
  }
  return 0;
}

export function burstStrength(phase, delay = 0) {
  const p = (phase - .30 - delay) / .42;
  if (p <= 0 || p >= 1) return 0;
  return Math.sin(Math.PI * p) ** 1.45;
}

export function deformScale(kind, radial, beat) {
  const r = Math.min(1, Math.max(0, radial));
  const weight = kind === 0
    ? (1.12 - .15 * r * r)
    : .91;
  return 1 + beat * weight;
}
