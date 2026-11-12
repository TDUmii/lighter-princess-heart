import { HEART } from './config.js';

export const PULSE_KEYFRAMES = Object.freeze([
  [0.00,  0.000],
  [0.150, -0.115],
  [0.320,  0.115],
  [0.515, -0.024],
  [0.685,  0.016],
  [1.00,  0.000]
]);

// Each miniature heart travels on one uninterrupted out-and-back path:
// phase .245 -> .690 -> 1.135 (two equal-length legs of .445 cycles).
// The small seeded start offset only staggers the hearts; each heart
// always returns along its own outbound 3D surface normal.
export const FLIGHT = Object.freeze({
  start: .245,
  leg: .445,
  stagger: .50,
  fadeIn: .23,
  fadeOut: 1.77
});

export function ease(t) {
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

// Treat the end of a heartbeat and the start of the next as the same
// continuous timeline, avoiding teleportation at phase 1 -> 0.
export function flightProgress(phase, delay = 0) {
  const p = ((phase % 1) + 1) % 1;
  const timeline = p < .20 ? p + 1 : p;
  const launch = FLIGHT.start + (delay - .075) * FLIGHT.stagger;
  return (timeline - launch) / FLIGHT.leg;
}

export function flightDistance(phase, delay = 0) {
  const p = flightProgress(phase, delay);
  if (p <= 0 || p >= 2) return 0;
  const half = p <= 1 ? p : 2 - p;
  return HEART.burstTravel * ease(half);
}

export function flightOpacity(phase, delay = 0) {
  const p = flightProgress(phase, delay);
  if (p <= 0 || p >= 2) return 0;
  const entrance = ease(p / FLIGHT.fadeIn);
  const exit = 1 - ease((p - FLIGHT.fadeOut) / (2 - FLIGHT.fadeOut));
  return entrance * exit;
}

export function burstStrength(phase, delay = 0) {
  const p = flightProgress(phase, delay);
  return p > 0 && p <= 1 ? flightOpacity(phase, delay) : 0;
}

export function returnProgress(phase, delay = 0) {
  return flightProgress(phase, delay) - 1;
}

export function returnStrength(phase, delay = 0) {
  const p = flightProgress(phase, delay);
  return p > 1 && p < 2 ? flightOpacity(phase, delay) : 0;
}

export function returnDistance(phase, delay = 0) {
  return flightDistance(phase, delay);
}

export function deformScale(kind, radial, beat) {
  const r = Math.min(1, Math.max(0, radial));
  const weight = kind === 0
    ? (1.12 - .15 * r * r)
    : (kind === 3 ? 0 : .91);
  return 1 + beat * weight;
}
