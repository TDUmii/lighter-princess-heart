import { outlineSample } from '../geometry.js';

export function createShellParticle(rand) {
  const p = outlineSample(rand);
  const offset = -1.55 + rand() * 2.42;
  const sideways = (rand() - .5) * 1.05;
  return {
    x: p.x + p.nx * offset + p.ny * sideways,
    y: p.y + p.ny * offset - p.nx * sideways,
    z: (rand() * 2 - 1) * 3.5,
    kind: 1,
    nx: p.nx, ny: p.ny,
    alpha: .44 + rand() * .31
  };
}
