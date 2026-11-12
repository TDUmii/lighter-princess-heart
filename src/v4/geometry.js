const TAU = Math.PI * 2;
const CENTER_Y = 1.2;
const EPS = 0.070;
const MAX_DISTANCE = 42;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function smoothUnion(a, b, smoothing) {
  const h = Math.max(smoothing - Math.abs(a - b), 0) / smoothing;
  return Math.min(a, b) - h * h * smoothing * .25;
}

function ellipsoidDistance(x, y, z, cx, cy, rx, ry, rz) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const dz = z / rz;
  return (Math.sqrt(dx * dx + dy * dy + dz * dz) - 1) * Math.min(rx, ry, rz);
}

/**
 * A continuous signed 3D heart field.
 *
 * Two smoothly joined round upper lobes and a tapered lower ellipsoid.
 * Every cross-section is curved, with no extrusion caps, scanline seams,
 * or flat depth planes. Negative values are inside.
 */
export function heartField(x, y, z) {
  const left = ellipsoidDistance(x, y, z, -7.6, -4.85, 9.1, 9.25, 11.45);
  const right = ellipsoidDistance(x, y, z, 7.6, -4.85, 9.1, 9.25, 11.45);
  const lobes = smoothUnion(left, right, 2.05);

  const taper = smoothstep(4.0, 16.5, y);
  const bodyRx = 15.55 - 8.05 * taper;
  const bodyRz = 12.5 - 3.1 * taper;
  const body = ellipsoidDistance(
    x, y, z,
    0, 5.05,
    bodyRx, 11.7, bodyRz
  );

  return smoothUnion(lobes, body, 3.1);
}

export const isInsideVolume = (x, y, z) => heartField(x, y, z) <= 0;
export const isInsideHeart = (x, y) => isInsideVolume(x, y, 0);

export function seededRandom(seed = 2026) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    v ^= v + Math.imul(v ^ (v >>> 7), 61 | v);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

export function volumeNormal(x, y, z) {
  const gx = heartField(x + EPS, y, z) - heartField(x - EPS, y, z);
  const gy = heartField(x, y + EPS, z) - heartField(x, y - EPS, z);
  const gz = heartField(x, y, z + EPS) - heartField(x, y, z - EPS);
  const length = Math.max(1e-8, Math.hypot(gx, gy, gz));
  return { nx: gx / length, ny: gy / length, nz: gz / length };
}

function surfaceRay(dx, dy, dz) {
  let inside = 0, outside = MAX_DISTANCE;
  for (let iteration = 0; iteration < 26; iteration++) {
    const m = (inside + outside) * .5;
    if (heartField(dx * m, CENTER_Y + dy * m, dz * m) < 0) {
      inside = m;
    } else {
      outside = m;
    }
  }
  const t = (inside + outside) * .5;
  return { x: dx * t, y: CENTER_Y + dy * t, z: dz * t };
}

export function surfacePoint(rand) {
  const angle = rand() * TAU;
  const vertical = rand() * 2 - 1;
  const radius = Math.sqrt(Math.max(0, 1 - vertical * vertical));
  const direction = {
    x: radius * Math.cos(angle),
    y: vertical,
    z: radius * Math.sin(angle)
  };
  const point = surfaceRay(direction.x, direction.y, direction.z);
  const normal = volumeNormal(point.x, point.y, point.z);
  return { ...point, ...normal };
}

/** Uniform 3D core, not a flat x/y sheet extended along z. */
export function insideVolumePoint(rand) {
  for (let tries = 0; tries < 20000; tries++) {
    const x = (rand() * 2 - 1) * 18.0;
    const y = -14.5 + rand() * 31.9;
    const z = (rand() * 2 - 1) * 14.7;
    if (isInsideVolume(x, y, z)) return { x, y, z };
  }
  throw new Error('Could not sample inside the 3D heart volume');
}

export function insidePoint(rand) {
  for (let tries = 0; tries < 10000; tries++) {
    const x = (rand() * 2 - 1) * 18.0;
    const y = -14.5 + rand() * 31.9;
    if (isInsideHeart(x, y)) return { x, y };
  }
  throw new Error('Could not sample the front heart shape');
}

export function outlineSample(rand) {
  const angle = rand() * TAU;
  const point = surfaceRay(Math.cos(angle), Math.sin(angle), 0);
  const normal = volumeNormal(point.x, point.y, 0);
  const length = Math.max(1e-8, Math.hypot(normal.nx, normal.ny));
  return {
    x: point.x,
    y: point.y,
    nx: normal.nx / length,
    ny: normal.ny / length,
    t: angle
  };
}

/** Front-profile helper used for mathematical and visual QA. */
export function heartPoint(t) {
  const angle = t - Math.PI * .5;
  const point = surfaceRay(Math.cos(angle), Math.sin(angle), 0);
  return { x: point.x, y: point.y };
}

/** Front/back half-thickness at an x/y position, for inspectable QA. */
export function volumeThickness(x, y) {
  if (!isInsideHeart(x, y)) return 0;
  let low = 0, high = 24;
  for (let i = 0; i < 22; i++) {
    const mid = (low + high) * .5;
    if (isInsideVolume(x, y, mid)) low = mid;
    else high = mid;
  }
  return (low + high) * .5;
}
