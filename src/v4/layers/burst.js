import { surfacePoint } from '../geometry.js';

export function createBurstParticle(rand) {
  let p = surfacePoint(rand);
  // More of the transient little hearts start near the rounded silhouette,
  // where their outward/inward 3D travel is actually visible from the front.
  // Surface normals stay genuinely 3D; no flat, permanently bright ring.
  if (rand() < .70) {
    let score = Math.hypot(p.nx, p.ny);
    for (let tries = 0; tries < 9 && score < .88; tries++) {
      const candidate = surfacePoint(rand);
      const candidateScore = Math.hypot(candidate.nx, candidate.ny);
      if (candidateScore > score) {
        p = candidate;
        score = candidateScore;
      }
    }
  }
  return {
    x: p.x - p.nx * .25,
    y: p.y - p.ny * .25,
    z: p.z - p.nz * .25,
    kind: 2,
    nx: p.nx, ny: p.ny, nz: p.nz,
    alpha: .31 + rand() * .31
  };
}
