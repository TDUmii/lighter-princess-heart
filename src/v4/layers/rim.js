import { surfacePoint } from '../geometry.js';

// Subtle stationary glints, very close to the 3D skin. They fade at
// front-facing angles and do not form a permanent chunky dotted border.
export function createRimParticle(rand) {
  let point=surfacePoint(rand);
  if (rand()<.42) {
    let best=Math.hypot(point.nx,point.ny);
    for(let i=0;i<3 && best<.69;i++){
      const candidate=surfacePoint(rand);
      const score=Math.hypot(candidate.nx,candidate.ny);
      if(score>best){point=candidate;best=score;}
    }
  }
  const offset=.08+rand()*.34;
  return {
    x:point.x+point.nx*offset,
    y:point.y+point.ny*offset,
    z:point.z+point.nz*offset,
    kind:3,nx:point.nx,ny:point.ny,nz:point.nz,
    alpha:.075+rand()*.085
  };
}
