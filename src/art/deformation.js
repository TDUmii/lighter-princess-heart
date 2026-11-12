export function softBreathWeight(x, y) {
  const radial = Math.hypot(x / 17.6, (y - 1.2) / 18.4);
  const t = Math.max(0, Math.min(1, (radial - 0.16) / 0.78));
  const smooth = t * t * (3 - 2 * t);
  const weight = 1 - smooth;
  return weight * weight * (3 - 2 * weight);
}
