import { ART } from '../config.js';

const FULL_TURN = Math.PI * 2;

export function beatEnvelope(seconds) {
  const phase = ((seconds / ART.pulsePeriod) % 1 + 1) % 1;
  const angle = FULL_TURN * (phase - .47);
  const main = Math.sin(angle);
  const gentleEcho = .08 * Math.sin(angle * 2 + .35);
  return ART.pulseOffset + ART.pulseStrength * (main + gentleEcho);
}

export function doubleBeat(seconds) {
  return beatEnvelope(seconds);
}

export function pulseScale(seconds, timeSinceTouch = -1, reduced = false) {
  if (reduced) return 1;

  const touch = Number.isFinite(timeSinceTouch) && timeSinceTouch >= 0
    ? ART.touchPulse
      * Math.exp(-timeSinceTouch * 5)
      * Math.sin(timeSinceTouch * 20)
    : 0;

  return 1 + beatEnvelope(seconds) + touch;
}
