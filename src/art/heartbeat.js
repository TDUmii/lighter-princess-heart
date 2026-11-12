import { ART } from '../config.js';

const KEYFRAMES = Object.freeze([
  [0.000,  0.00],
  [0.055, -0.30],
  [0.145,  1.00],
  [0.205, -0.27],
  [0.235, -0.12],
  [0.305,  0.52],
  [0.400, -0.16],
  [0.545,  0.05],
  [0.720,  0.00],
  [1.000,  0.00]
]);

function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function beatEnvelope(seconds) {
  const phase = ((seconds / ART.pulsePeriod) % 1 + 1) % 1;

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const [start, from] = KEYFRAMES[i];
    const [end, to] = KEYFRAMES[i + 1];

    if (phase <= end) {
      const progress = smoothstep((phase - start) / (end - start));
      return ART.pulseStrength * (from + (to - from) * progress);
    }
  }

  return 0;
}

export function doubleBeat(seconds) {
  return beatEnvelope(seconds);
}

export function pulseScale(seconds, timeSinceTouch = -1, reduced = false) {
  if (reduced) return 1;

  const touch = Number.isFinite(timeSinceTouch) && timeSinceTouch >= 0
    ? ART.touchPulse
      * Math.exp(-timeSinceTouch * 5.0)
      * Math.sin(timeSinceTouch * 20.0)
    : 0;

  return 1 + beatEnvelope(seconds) + touch;
}
