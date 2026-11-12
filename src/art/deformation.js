export function radialBeatWeight(x, y) {
  const radius = Math.hypot(x / 16.0, (y - 1.0) / 16.0);
  const normalized = Math.max(0, Math.min(1, (radius - 0.08) / 0.95));
  const eased = normalized * normalized * (3 - 2 * normalized);
  return 0.46 + 0.54 * eased;
}

export function deformPoint(x, y, beat) {
  const weight = radialBeatWeight(x, y);
  const relativeY = y - 1.0;
  return {
    x: x * (1 + beat * weight),
    y: 1.0 + relativeY * (1 + beat * weight)
  };
}
