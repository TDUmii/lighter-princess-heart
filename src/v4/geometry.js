const TAU = Math.PI * 2;
const SEGMENTS = 1024;
const SCANLINES = 900;
const Y_MIN = -13.5;
const Y_MAX = 18.5;

export function seededRandom(seed = 2026) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    v ^= v + Math.imul(v ^ (v >>> 7), 61 | v);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

export function heartPoint(t) {
  const s = Math.sin(t);
  return {
    x: 16 * s * s * s,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}

const contour = Array.from(
  { length: SEGMENTS + 1 },
  (_, i) => heartPoint(TAU * i / SEGMENTS)
);
const cumulative = [0];
for (let i = 1; i <= SEGMENTS; i++) {
  const a = contour[i - 1], b = contour[i];
  cumulative.push(cumulative[i - 1] + Math.hypot(a.x - b.x, a.y - b.y));
}
const outlineLength = cumulative[SEGMENTS];

const scanlines = Array.from({ length: SCANLINES }, (_, index) => {
  const y = Y_MIN + (index + .5) * (Y_MAX - Y_MIN) / SCANLINES;
  const crossings = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = contour[i], b = contour[i + 1];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      crossings.push(a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y));
    }
  }
  return crossings.sort((a, b) => a - b);
});

export function isInsideHeart(x, y) {
  const row = Math.floor((y - Y_MIN) / (Y_MAX - Y_MIN) * SCANLINES);
  if (row < 0 || row >= SCANLINES) return false;
  const boundaries = scanlines[row];
  for (let i = 0; i + 1 < boundaries.length; i += 2) {
    if (x >= boundaries[i] && x <= boundaries[i + 1]) return true;
  }
  return false;
}

export function insidePoint(rand) {
  for (let tries = 0; tries < 10000; tries++) {
    const x = (rand() * 2 - 1) * 16;
    const y = Y_MIN + rand() * (Y_MAX - Y_MIN);
    if (isInsideHeart(x, y)) return { x, y };
  }
  throw new Error('Could not sample the heart interior');
}

export function outlineSample(rand) {
  const distance = rand() * outlineLength;
  let lo = 0, hi = SEGMENTS - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid + 1] < distance) lo = mid + 1;
    else hi = mid;
  }
  const fraction = (distance - cumulative[lo]) /
    (cumulative[lo + 1] - cumulative[lo]);
  const t = (lo + fraction) / SEGMENTS * TAU;
  const p = heartPoint(t);
  const before = heartPoint(t - .003);
  const after = heartPoint(t + .003);
  const tx = after.x - before.x;
  const ty = after.y - before.y;
  const len = Math.max(.00001, Math.hypot(tx, ty));
  let nx = -ty / len, ny = tx / len;

  if (isInsideHeart(p.x + nx * .70, p.y + ny * .70)) {
    nx = -nx;
    ny = -ny;
  }
  if (isInsideHeart(p.x + nx * .70, p.y + ny * .70) &&
      Math.abs(p.x) < 2.5 && p.y < -4) {
    nx = p.x >= 0 ? -.37 : .37;
    ny = -.929;
  }
  return { x: p.x, y: p.y, nx, ny, t };
}

export function volumeThickness(x, y) {
  const radius = Math.hypot(x / 16.5, (y - 1.2) / 18);
  return 7.1 * Math.sqrt(Math.max(.035, 1 - Math.min(1, radius) ** 2));
}
