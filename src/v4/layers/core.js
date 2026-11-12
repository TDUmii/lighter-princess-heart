import { insidePoint, volumeThickness } from '../geometry.js';

export function createCoreParticle(rand) {
  let p = insidePoint(rand);
  for (let attempt = 0; attempt < 14; attempt++) {
    const radius = Math.hypot(p.x / 16, (p.y - 1) / 17);
    if (rand() < .23 + .77 * Math.min(1, radius)) break;
    p = insidePoint(rand);
  }
  const z = (rand() * 2 - 1) * volumeThickness(p.x, p.y);
  const radius = Math.min(1, Math.hypot(p.x / 16, (p.y - 1) / 17));
  const nearRim = Math.min(1, Math.max(0, (radius - .40) / .57));
  return {
    x: p.x, y: p.y, z,
    kind: 0, nx: 0, ny: 0, nz: 0,
    alpha: (.37 + rand() * .34) * (.81 + .29 * nearRim)
  };
}
