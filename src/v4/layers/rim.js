import { surfacePoint } from '../geometry.js';

// A quiet fringe of points anchored to the actual curved 3D surface.
// They never fly away or get replaced during a heartbeat. Silhouette
// lighting is decided in the shader from the current camera direction.
export function createRimParticle(rand) {
  let point = surfacePoint(rand);
  const score = p => {
    const transverse = Math.hypot(p.nx, p.ny);
    const tipPenalty = p.y > 10.5 || p.y < -13.4 ? .42 : 1;
    return transverse * tipPenalty;
  };
  let best = score(point);
  for (let i = 0; i < 9 && best < .87; i++) {
    const next = surfacePoint(rand);
    const value = score(next);
    if (value > best) {
      point = next;
      best = value;
    }
  }
  const outside = .65 + rand() * .76;
  return {
    x: point.x + point.nx * outside,
    y: point.y + point.ny * outside,
    z: point.z + point.nz * outside,
    kind: 3,
    nx: point.nx, ny: point.ny, nz: point.nz,
    alpha: .16 + rand() * .12
  };
}
