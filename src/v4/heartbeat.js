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
  const p = (phase - .30 - delay) / .355;
  if (p <= 0 || p >= 1) return 0;
  return Math.sin(Math.PI * p) ** 1.45;
}

// The expelled mini-hearts reappear outside the surface in the final part
// of a beat, then fly back along their actual 3D normals as contraction starts.
// Unwrap the cycle around phase zero so the homeward path never jumps.
export function returnProgress(phase, delay = 0) {
  const wrapped = phase > .65 ? phase - 1 : phase;
  const shift = (delay - .075) * .36;
  return (wrapped + .18 - shift) / .36;
}

export function returnStrength(phase, delay = 0) {
  const progress = returnProgress(phase, delay);
  if (progress <= 0 || progress >= 1) return 0;
  return Math.sin(Math.PI * progress) ** .72;
}

export function returnDistance(phase, delay = 0) {
  const t = ease(returnProgress(phase, delay));
  return HEART.returnTravel * (1 - t) - HEART.returnInset * t;
}

export function deformScale(kind, radial, beat) {
  const r = Math.min(1, Math.max(0, radial));
  const weight = kind === 0
    ? (1.12 - .15 * r * r)
    : .91;
  return 1 + beat * weight;
}
