import { surfacePoint } from '../geometry.js';

export function createBurstParticle(rand) {
  const p = surfacePoint(rand);
  return {
    x: p.x - p.nx * .25,
    y: p.y - p.ny * .25,
    z: p.z - p.nz * .25,
    kind: 2,
    nx: p.nx, ny: p.ny, nz: p.nz,
    alpha: .24 + rand() * .27
  };
}
