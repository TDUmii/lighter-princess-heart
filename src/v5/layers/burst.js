import { surfacePoint } from '../geometry.js';

// Prefer side/shoulder particles while avoiding spikes at the notch or tip.
export function createBurstParticle(rand) {
  let point = surfacePoint(rand);
  const suitability = p => {
    const transverse = Math.hypot(p.nx, p.ny);
    const notch = (p.y < -10 && Math.abs(p.x) < 3.2) ? .50 : 1;
    const tip = p.y > 10.7 ? .35 : 1;
    return transverse * notch * tip;
  };
  if (rand() < .64) {
    let best = suitability(point);
    for (let i = 0; i < 6 && best < .78; i++) {
      const candidate = surfacePoint(rand);
      const score = suitability(candidate);
      if (score > best) { point = candidate; best = score; }
    }
  }
  return {
    x: point.x - point.nx * .12,
    y: point.y - point.ny * .12,
    z: point.z - point.nz * .12,
    kind: 2, nx: point.nx, ny: point.ny, nz: point.nz,
    alpha: .20 + rand() * .17
  };
}
