import { ART } from '../config.js';

export function gaussian(value, center, spread) {
  const normalized = (value - center) / spread;
  return Math.exp(-normalized * normalized);
}

export function doubleBeat(seconds) {
  const phase = ((seconds / ART.pulsePeriod) % 1 + 1) % 1;
  return gaussian(phase, 0.15, 0.11) +
    0.40 * gaussian(phase, 0.39, 0.13);
}

export function pulseScale(seconds, timeSinceTouch = -1, reduced = false) {
  if (reduced) return 1;
  const extra = timeSinceTouch >= 0
    ? ART.touchPulse * Math.exp(-timeSinceTouch * 3.5) : 0;
  return 1 + ART.pulseStrength * doubleBeat(seconds) + extra;
}
