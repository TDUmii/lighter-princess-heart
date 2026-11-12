export const ART = Object.freeze({
  title: 'Trái tim',
  mobileBreakpoint: 640,
  pulsePeriod: 1.06,
  pulseStrength: 0.075,
  touchPulse: 0.032,
  zoomMin: 0.65,
  zoomMax: 4.5,
  desktopParticles: 14000,
  mobileParticles: 4200,
  baseColor: [0.98, 0.13, 0.21],
  glows: 0.22,
  rays: 0.19
});

export function qualityFor(width, height, deviceRatio = 1) {
  const mobile = width < ART.mobileBreakpoint;
  const ratio = Math.min(deviceRatio, mobile ? 1.45 : 1.8);
  return {
    mobile,
    count: mobile ? ART.mobileParticles : ART.desktopParticles,
    pixelRatio: ratio,
    fieldOfView: mobile ? 36 : 45
  };
}

export function heartUnit(width, height) {
  const mobile = width < ART.mobileBreakpoint;
  return mobile
    ? Math.min(width / 43.5, height / 44, 21)
    : Math.min(width / 51, height / 44, 21);
}
