import { insidePoint, surfacePoint, volumeNormal, volumeThickness } from '../geometry.js';

const PI2 = Math.PI * 2;
const CENTER_Y = 1.1;

// V7.2: sample the entire 3D heart, not only the two sidewalls.
// 44% finely dispersed front-facing microdust + 56% brighter sparks.
// Individual flights are seeded and independent: no mirrored diagonal streams.
export function createBurstParticle(rand) {
  const dust = rand() < .44;
  const onSkin = !dust && rand() < .47;
  let p;
  let surfaceNormal = null;

  if (onSkin) {
    p = surfacePoint(rand);
    surfaceNormal = { x: p.nx, y: p.ny, z: p.nz };
    // Begin just within the silhouette; no detached debris when at rest.
    p = {
      x: p.x - p.nx * .20,
      y: p.y - p.ny * .20,
      z: p.z - p.nz * .20
    };
  } else {
    // Spread over the projected heart rather than favoring left/right edges.
    const interior = insidePoint(rand);
    const thickness = volumeThickness(interior.x, interior.y);
    const z = thickness * (.12 + .72 * rand());
    p = { x: interior.x, y: interior.y, z };
    if (!dust) {
      const n = volumeNormal(p.x, p.y, p.z);
      surfaceNormal = { x: n.nx, y: n.ny, z: n.nz };
    }
  }

  // Broad, approximately isotropic 3D motion, gently compressed laterally.
  // This prevents the lower corners from becoming two synchronized cracks.
  const radial = {
    x: p.x * .78,
    y: (p.y - CENTER_Y) * .92,
    z: p.z * .56
  };
  const radius = Math.max(1e-5, Math.hypot(radial.x, radial.y, radial.z));
  radial.x /= radius;
  radial.y /= radius;
  radial.z /= radius;

  const angle = rand() * PI2;
  const height = 2 * rand() - 1;
  const ring = Math.sqrt(Math.max(0, 1 - height * height));
  const noise = { x: Math.cos(angle) * ring, y: height, z: Math.sin(angle) * ring };
  const normal = surfaceNormal || radial;
  const dir = {
    x: (.74 * radial.x + .26 * normal.x + .38 * noise.x) * .82,
    y: .74 * radial.y + .26 * normal.y + .38 * noise.y,
    z: (.74 * radial.z + .26 * normal.z + .38 * noise.z) * .9
  };
  const directionLength = Math.max(1e-5, Math.hypot(dir.x, dir.y, dir.z));

  return {
    x: p.x, y: p.y, z: p.z,
    kind: dust ? 2.2 : 2,
    nx: dir.x / directionLength,
    ny: dir.y / directionLength,
    nz: dir.z / directionLength,
    alpha: dust ? .16 + rand() * .17 : .25 + rand() * .17
  };
}
