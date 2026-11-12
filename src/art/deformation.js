export function radialBeatWeight(x, y) {
  const radius = Math.hypot(x / 16.0, (y - 1.0) / 16.0);
  const t = Math.max(0, Math.min(1, (radius - 0.28) / 0.82));
  const smooth = t * t * (3 - 2 * t);
  return 0.18 + 0.82 * (1 - smooth);
}

export function deformPoint(x, y, beat) {
  const weight = radialBeatWeight(x, y);
  const relativeY = y - 1.0;
  return {
    x: x * (1 + beat * weight),
    y: 1.0 + relativeY * (1 + beat * weight)
  };
}
