export const HEART = Object.freeze({
  period: 1.08,
  mobileBreakpoint: 640,
  desktop: { core: 8500, shell: 8800, rim: 210, burst: 1250, dpr: 1.75 },
  mobile: { core: 3700, shell: 3700, rim: 90, burst: 520, dpr: 1.42 },
  zoomMin: 0.65,
  zoomMax: 4.5,
  seed: 20221104,
  bloom: 0.20,
  backgroundGlow: 0.26,
  shellMovement: 0.40,
  burstTravel: 5.3,
  secretZoom: 2.40
});

export const QUALITY_TIERS = Object.freeze([
  { density: .52, dpr: .86 },
  { density: .76, dpr: 1.18 },
  { density: 1, dpr: 1.75 }
]);

export function qualityFor(width, height, pixelRatio = 1, tier = 2) {
  const mobile = width < HEART.mobileBreakpoint;
  const base = mobile ? HEART.mobile : HEART.desktop;
  const level = Math.max(0, Math.min(2, tier | 0));
  const profile = QUALITY_TIERS[level];
  const paired = n => Math.max(2, Math.round(n * profile.density / 2) * 2);
  return {
    mobile, level,
    core: Math.round(base.core * profile.density),
    shell: paired(base.shell),
    rim: paired(base.rim),
    burst: paired(base.burst),
    pixelRatio: Math.min(pixelRatio, base.dpr, profile.dpr)
  };
}

export function heartUnit(width, height) {
  const mobile = width < HEART.mobileBreakpoint;
  return mobile
    ? Math.min(width / 44, height / 46, 21)
    : Math.min(width / 57, height / 42, 21);
}
