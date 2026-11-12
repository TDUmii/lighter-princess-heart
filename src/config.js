export const ART = Object.freeze({
  title: 'Trái tim',
  mobileBreakpoint: 640,
  pulsePeriod: 1.72,
  pulseStrength: 0.034,
  touchPulse: 0.026,
  zoomMin: 0.65,
  zoomMax: 4.5,
  desktopParticles: 26000,
  mobileParticles: 11000,
  baseColor: [0.95, 0.10, 0.14],
  glows: 0.35,
  rays: 0.76
});

export function qualityFor(width, height, deviceRatio = 1) {
  const mobile = Math.min(width, height) < ART.mobileBreakpoint;
  const ratio = Math.min(deviceRatio, mobile ? 1.45 : 1.8);
  return {
    mobile,
    count: mobile ? ART.mobileParticles : ART.desktopParticles,
    pixelRatio: ratio,
    fieldOfView: mobile ? 35 : 39
  };
}

export function heartUnit(width, height) {
  return Math.min(width / 39.5, height / 36, 27);
}
