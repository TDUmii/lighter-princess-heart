import { surfacePoint } from '../geometry.js';

// Transient particles live on the rounded 3D skin. A loose preference
// for the shoulders and sides makes the release visible from the front,
// without collecting a bright, spiky ring at the notch or bottom tip.
export function createBurstParticle(rand) {
  let point = surfacePoint(rand);
  const suitability = p => {
    const transverse = Math.hypot(p.nx, p.ny);
    const topNotch = (p.y < -10 && Math.abs(p.x) < 3.2) ? .55 : 1;
    const bottomTip = p.y > 10.7 ? .38 : 1;
    return transverse * topNotch * bottomTip;
  };
  if (rand() < .52) {
    let score = suitability(point);
    for (let i=0; i<5 && score<.76; i++) {
      const candidate=surfacePoint(rand);
      const next=suitability(candidate);
      if (next>score) {
        point=candidate;
        score=next;
      }
    }
  }
  // Begin just under the skin, so each flight emerges gently.
  return {
    x: point.x-point.nx*.12,
    y: point.y-point.ny*.12,
    z: point.z-point.nz*.12,
    kind: 2, nx: point.nx,ny:point.ny,nz:point.nz,
    alpha: .21+rand()*.16
  };
}
