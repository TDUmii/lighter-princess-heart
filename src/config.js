export const COLORS = [
  '#ff8cbd', '#ff6aa7', '#ffa5ce', '#f578af',
  '#ffd1e6', '#f44d97', '#e95b9d', '#ffc0da'
];

export const HEART = {
  mobileBreakpoint: 550,
  maxUnit: 21,
  coreSize: 1,
  beatInterval: 1.62,
  beatStrength: 0.105,
  touchStrength: 0.085,
  minZoom: 0.65,
  maxZoom: 3.3,
  background: '#000000'
};

export function getQuality(width, height) {
  const mobile = Math.min(width, height) < HEART.mobileBreakpoint;
  const total = mobile ? 6200 : 14500;

  return {
    mobile,
    pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.7 : 2),
    haloParticles: Math.floor(total * .15),
    fillParticles: Math.floor(total * .73),
    edgeParticles: Math.floor(total * .12),
    shimmerParticles: mobile ? 30 : 55
  };
}
