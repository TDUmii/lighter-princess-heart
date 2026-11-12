import { insideVolumePoint } from '../geometry.js';

export function createCoreParticle(rand) {
  const p = insideVolumePoint(rand);
  const radial = Math.min(1, Math.hypot(
    p.x / 17.0, (p.y - 1.2) / 17.1, p.z / 14.0
  ));
  return {
    x: p.x, y: p.y, z: p.z,
    kind: 0, nx: 0, ny: 0, nz: 0,
    alpha: (.15 + rand() * .27) * (.76 + .24 * radial)
  };
}
