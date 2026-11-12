export const COLORS = [
  '#ff80b4', '#ff6aaa', '#ffa1cc', '#f55a9c',
  '#ffd0e4', '#f43d8c', '#ec6bac', '#ffc1db'
];

export const HEART = {
  mobileBreakpoint: 640,
  maxUnit: 25,
  shellThickness: 0.17,
  coreSize: 0.87,
  beatInterval: 1.54,
  beatStrength: 0.075,
  touchStrength: 0.085,
  background: '#000000'
};

export function getQuality(width, height) {
  const mobile = Math.min(width, height) < HEART.mobileBreakpoint;
  return {
    mobile,
    pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2),
    coreParticles: mobile ? 14500 : 29000,
    shellParticles: mobile ? 5800 : 11800,
    shimmerParticles: mobile ? 55 : 100
  };
}
