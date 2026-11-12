import { surfacePoint } from '../geometry.js';

export function createShellParticle(rand) {
  const p = surfacePoint(rand);
  const inset = (rand() - .5) * .35;
  return {
    x: p.x + p.nx * inset,
    y: p.y + p.ny * inset,
    z: p.z + p.nz * inset,
    kind: 1,
    nx: p.nx, ny: p.ny, nz: p.nz,
    alpha: .48 + rand() * .33
  };
}
