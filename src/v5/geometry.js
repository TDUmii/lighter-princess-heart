const TAU = Math.PI * 2;
const CENTER_Y = 1.1;
const EPS = 0.045;
const MAX_RADIUS = 45;

// Single rounded heart volume. x is horizontal, y is vertical (down),
// z is depth. Unlike unions of ellipsoids, the front lobes, side dome
// and taper all belong to the SAME continuous implicit surface.
export function heartField(x, y, z) {
  const u = x / 17.0;
  const v = (CENTER_Y - y) / 15.5;
  const w = z / 19.4;
  const r2 = u * u + v * v + 2.25 * w * w - 1;
  const rise = v * v * v;
  // Keep the frontal cleft and pointed-but-soft lower tip. Only the
  // *upper* depth lobe contributes to the vertical cleft so that from
  // the side the bottom remains round, rather than ending in a spike.
  return r2 * r2 * r2
    - u * u * rise
    - .1125 * w * w * Math.max(0, v) ** 3;
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
  const length = Math.hypot(gx, gy, gz);
  if (length < 1e-12) {
    // The implicit polynomial has stationary points near the cleft.
    const dl = Math.max(1e-8, Math.hypot(x, y - CENTER_Y, z));
    return { nx: x / dl, ny: (y - CENTER_Y) / dl, nz: z / dl };
  }
  return { nx: gx / length, ny: gy / length, nz: gz / length };
}

// Find the first surface intersection along a ray that starts INSIDE.
// Bisection is deterministic and avoids seams between geometric patches.
function surfaceRay(dx, dy, dz) {
  let inside = 0, outside = MAX_RADIUS;
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
  const p = surfaceRay(
    radius * Math.cos(angle), vertical, radius * Math.sin(angle)
  );
  return { ...p, ...volumeNormal(p.x, p.y, p.z) };
}

export function insideVolumePoint(rand) {
  for (let tries = 0; tries < 20000; tries++) {
    const x = (rand() * 2 - 1) * 20;
    const y = -19 + rand() * 37;
    const z = (rand() * 2 - 1) * 14.4;
    if (isInsideVolume(x, y, z)) return { x, y, z };
  }
  throw new Error('Unable to sample the 3D heart volume');
}

export function insidePoint(rand) {
  for (let tries = 0; tries < 10000; tries++) {
    const x = (rand() * 2 - 1) * 20;
    const y = -19 + rand() * 37;
    if (isInsideHeart(x, y)) return { x, y };
  }
  throw new Error('Unable to sample the frontal heart');
}

export function outlineSample(rand) {
  const angle = rand() * TAU;
  const p = surfaceRay(Math.cos(angle), Math.sin(angle), 0);
  const normal = volumeNormal(p.x, p.y, 0);
  const length = Math.max(1e-8, Math.hypot(normal.nx, normal.ny));
  return {
    x: p.x, y: p.y,
    nx: normal.nx / length,
    ny: normal.ny / length,
    t: angle
  };
}

export function heartPoint(t) {
  const angle = t - Math.PI * .5;
  const p = surfaceRay(Math.cos(angle), Math.sin(angle), 0);
  return { x: p.x, y: p.y };
}

export function volumeThickness(x, y) {
  if (!isInsideHeart(x, y)) return 0;
  let low = 0, high = 20;
  for (let i = 0; i < 23; i++) {
    const m = (low + high) * .5;
    if (isInsideVolume(x, y, m)) low = m;
    else high = m;
  }
  return (low + high) * .5;
}
