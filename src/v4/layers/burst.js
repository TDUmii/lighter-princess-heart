import { outlineSample, surfacePoint } from '../geometry.js';

export function createBurstParticle(rand) {
  if (rand() < .72) {
    const p = surfacePoint(rand);
    return {
      x: p.x, y: p.y, z: p.z,
      kind: 2, nx: p.nx, ny: p.ny, nz: p.nz,
      alpha: .25 + rand() * .31
    };
  }
  const p = outlineSample(rand);
  const offset = -.45 + rand() * .75;
  const sideways = (rand() - .5) * .40;
  return {
    x: p.x + p.nx * offset + p.ny * sideways,
    y: p.y + p.ny * offset - p.nx * sideways,
    z: (rand() * 2 - 1) * .9,
    kind: 2, nx: p.nx, ny: p.ny, nz: 0,
    alpha: .29 + rand() * .30
  };
}
