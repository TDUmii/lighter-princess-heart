import { ART } from '../config.js';

const TAU = Math.PI * 2;

export function radialBeatWeight(x, y) {
  const radius = Math.hypot(x / 16, (y - 1) / 16);
  const t = Math.max(0, Math.min(1, (radius - .30) / .76));
  const eased = t * t * (3 - 2 * t);
  return .32 + .68 * (1 - eased);
}

export function travelingFlow(x, y, seconds) {
  const centerY = y - 1;
  const distance = Math.hypot(x, centerY);
  const radius = Math.hypot(x / 16, centerY / 16);
  const delta = (radius - .60) / .38;
  const band = Math.exp(-delta * delta);
  const phase = TAU * (seconds / ART.pulsePeriod - .25 * radius);
  const radial = .42 * band * Math.sin(phase);
  const tangent = .12 * band * Math.cos(phase + .75);

  if (distance < 1e-8) return { x, y };

  const dx = x / distance;
  const dy = centerY / distance;
  return {
    x: x + dx * radial - dy * tangent,
    y: y + dy * radial + dx * tangent
  };
}

export function deformPoint(x, y, beat, seconds = 0) {
  const amount = 1 + beat * radialBeatWeight(x, y);
  const flowed = travelingFlow(x, y, seconds);
  return {
    x: flowed.x * amount,
    y: 1 + (flowed.y - 1) * amount
  };
}
