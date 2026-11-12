import { HEART } from './config.js';

function gaussian(value, center, width) {
  const distance = (value - center) / width;
  return Math.exp(-distance * distance);
}

export function heartbeat(seconds) {
  const phase = ((seconds % HEART.beatInterval) +
    HEART.beatInterval) % HEART.beatInterval / HEART.beatInterval;

  return gaussian(phase, 0.125, 0.059) +
    0.63 * gaussian(phase, 0.33, 0.07);
}

export function easeOutCubic(value) {
  const t = Math.min(1, Math.max(0, value));
  return 1 - Math.pow(1 - t, 3);
}

export function coreScale(seconds, elapsedSinceTouch, reducedMotion) {
  if (reducedMotion) return 1;

  const touch = elapsedSinceTouch >= 0
    ? Math.exp(-elapsedSinceTouch * 5.5) : 0;

  return 1 + HEART.beatStrength * heartbeat(seconds) +
    HEART.touchStrength * touch;
}
