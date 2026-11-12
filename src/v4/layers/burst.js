import { outlineSample } from '../geometry.js';

export function createBurstParticle(rand) {
  const p = outlineSample(rand);
  const offset = -.62 + rand() * 1.40;
  const sideways = (rand() - .5) * .45;
  return {
    x: p.x + p.nx * offset + p.ny * sideways,
    y: p.y + p.ny * offset - p.nx * sideways,
    z: (rand() * 2 - 1) * 1.5,
    kind: 2,
    nx: p.nx, ny: p.ny,
    alpha: .25 + rand() * .30
  };
}
