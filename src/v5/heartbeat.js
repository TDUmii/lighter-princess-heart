import { HEART } from './config.js';

// Two compact beats, with a softer recoil and a resting interval.
export const PULSE_KEYFRAMES = Object.freeze([
  [0.000, 0.000], [0.085, -0.020], [0.145, 0.075],
  [0.215, -0.034], [0.325, 0.116], [0.420, -0.042],
  [0.565, 0.014], [0.750, 0.000], [1.000, 0.000]
]);

// Equal out-and-back legs continue seamlessly over the beat boundary.
export const FLIGHT = Object.freeze({
  start: .24, leg: .445, stagger: .48, fadeIn: .19, fadeOut: 1.81
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
    if (phase <= end) return from + (to - from) * ease((phase - start) / (end - start));
  }
  return 0;
}

export function flightProgress(phase, delay = 0) {
  const p = ((phase % 1) + 1) % 1;
  const timeline = p < .18 ? p + 1 : p;
  const launch = FLIGHT.start + (delay - .075) * FLIGHT.stagger;
  return (timeline - launch) / FLIGHT.leg;
}

export function flightCurve(progress) {
  if (progress <= 0 || progress >= 2) return 0;
  return ease(progress <= 1 ? progress : 2 - progress);
}

export function flightDistance(phase, delay = 0) {
  return HEART.burstTravel * flightCurve(flightProgress(phase, delay));
}

export function flightOpacity(phase, delay = 0) {
  const p = flightProgress(phase, delay);
  if (p <= 0 || p >= 2) return 0;
  return ease(p / FLIGHT.fadeIn) * (1 - ease((p - FLIGHT.fadeOut) / (2 - FLIGHT.fadeOut)));
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
  return 1 + beat * (kind === 0 ? 1.08 - .13 * r * r : kind === 3 ? .20 : .94);
}
