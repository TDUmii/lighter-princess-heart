export const HEART = Object.freeze({
  period: 0.90,
  mobileBreakpoint: 640,
  desktop: { core: 11500, shell: 4600, burst: 1400, dpr: 1.75 },
  mobile: { core: 4750, shell: 1900, burst: 550, dpr: 1.42 },
  zoomMin: 0.65,
  zoomMax: 4.5,
  seed: 20221104,
  bloom: 0.17,
  backgroundGlow: 0.26,
  shellMovement: 0.46,
  burstTravel: 3.05,
  secretZoom: 2.40
});

export function qualityFor(width, height, pixelRatio = 1) {
  const mobile = width < HEART.mobileBreakpoint;
  const base = mobile ? HEART.mobile : HEART.desktop;
  return { mobile, ...base, pixelRatio: Math.min(pixelRatio, base.dpr) };
}

export function heartUnit(width, height) {
  const mobile = width < HEART.mobileBreakpoint;
  return mobile
    ? Math.min(width / 44.5, height / 47, 21)
    : Math.min(width / 52, height / 50, 21);
}
