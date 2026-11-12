import { outlineSample, surfacePoint } from '../geometry.js';

export function createShellParticle(rand) {
  // Most shell particles follow the actual front/back rounded volume.
  // The rest gently describe the silhouette edge to preserve the heart outline.
  if (rand() < .84) {
    const p = surfacePoint(rand);
    return {
      x: p.x, y: p.y, z: p.z,
      kind: 1, nx: p.nx, ny: p.ny, nz: p.nz,
      alpha: .49 + rand() * .31
    };
  }
  const p = outlineSample(rand);
  const offset = -1.12 + rand() * 1.86;
  const sideways = (rand() - .5) * .75;
  return {
    x: p.x + p.nx * offset + p.ny * sideways,
    y: p.y + p.ny * offset - p.nx * sideways,
    z: (rand() * 2 - 1) * 1.15,
    kind: 1, nx: p.nx, ny: p.ny, nz: 0,
    alpha: .42 + rand() * .29
  };
}
