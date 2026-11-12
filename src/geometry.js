const TAU = Math.PI * 2;

export function seededRandom(seed = 2026) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function heartPoint(t) {
  const sine = Math.sin(t);
  return {
    x: 16 * sine * sine * sine,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}

const outline = Array.from({ length: 512 }, (_, i) =>
  heartPoint(i / 512 * TAU)
);
const lengths = [0];

for (let i = 0; i < outline.length; i++) {
  const current = outline[i];
  const next = outline[(i + 1) % outline.length];
  lengths.push(lengths[i] + Math.hypot(next.x - current.x, next.y - current.y));
}

export function outlinePoint(random) {
  const length = random() * lengths[lengths.length - 1];
  let start = 0;
  let end = outline.length - 1;

  while (start < end) {
    const middle = (start + end) >> 1;
    if (lengths[middle + 1] < length) start = middle + 1;
    else end = middle;
  }

  const amount = (length - lengths[start]) /
    (lengths[start + 1] - lengths[start]);
  const current = outline[start];
  const next = outline[(start + 1) % outline.length];

  return {
    x: current.x + (next.x - current.x) * amount,
    y: current.y + (next.y - current.y) * amount
  };
}

const scanlines = Array.from({ length: 1024 }, (_, index) => {
  const y = -13.5 + (index + 0.5) * 32 / 1024;
  const crossings = [];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      crossings.push(a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y));
    }
  }

  crossings.sort((a, b) => a - b);
  return crossings;
});

export function isInsideHeart(x, y) {
  const index = Math.floor((y + 13.5) / 32 * scanlines.length);
  if (index < 0 || index >= scanlines.length) return false;

  const crossings = scanlines[index];
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (x >= crossings[i] && x <= crossings[i + 1]) return true;
  }
  return false;
}

export function insidePoint(random) {
  let x;
  let y;
  do {
    x = (random() * 2 - 1) * 16;
    y = random() * 32 - 13.5;
  } while (!isInsideHeart(x, y));
  return { x, y };
}
