import { HEART } from './config.js';
import { isInsideHeart } from './geometry.js';

export const SHOCKWAVE = Object.freeze({
  first: .145,
  second: .325,
  duration: .38,
  startOffset: .18,
  travel: 2.65
});

export function smooth01(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

// Each beat triggers a ring once, including a ring that carries across phase 1 -> 0.
export function shockwaveRings(seconds, reducedMotion = false) {
  if (reducedMotion) return [];
  const phase = ((seconds / HEART.period) % 1 + 1) % 1;
  return [SHOCKWAVE.first, SHOCKWAVE.second].map((start, index) => {
    const age = (phase - start + 1) % 1;
    const progress = Math.min(1, age / SHOCKWAVE.duration);
    return {
      progress,
      // A short, feather-light ripple just outside the heart contour.
      offset: SHOCKWAVE.startOffset + SHOCKWAVE.travel * smooth01(progress),
      strength: age < SHOCKWAVE.duration
        ? (index === 0 ? .36 : .48) * (1 - smooth01(progress)) : 0
    };
  });
}

export function touchFalloff(distance, radius = 110) {
  if (radius <= 0 || !Number.isFinite(distance)) return 0;
  return 1 - smooth01(Math.abs(distance) / radius);
}

export function withinHeart(clientX, clientY, width, height, unit, zoom, panX, panY) {
  if (!(unit > 0 && zoom > 0)) return false;
  const cx = width * .5 + panX;
  const cy = height * .5 + unit * .9 + panY;
  const x = (clientX - cx) / (unit * zoom * .87);
  const y = (clientY - cy) / (unit * zoom * .88);
  return isInsideHeart(x, y);
}