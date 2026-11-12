import { insidePoint, isInsideHeart, outlinePoint, seededRandom } from '../geometry.js';

export const PARTICLE_STRIDE = 10;

function selectInteriorPoint(random) {
  let point;
  for (let attempt = 0; attempt < 18; attempt++) {
    point = insidePoint(random);
    const r = Math.hypot(point.x / 16, (point.y - 1) / 17);
    const t = Math.min(1, Math.max(0, (r - .20) / .83));
    const edgeBias = t * t * (3 - 2 * t);
    if (random() < .22 + .78 * edgeBias) break;
  }
  return point;
}

function makeParticle(random, kind) {
  let x;
  let y;
  let layer = 0;
  let drift;

  if (kind === 'halo' || kind === 'contour') {
    const p = outlinePoint(random);
    const offset = kind === 'halo'
      ? 1.008 + Math.pow(random(), 2.1) * .18
      : .88 + random() * .17;
    const spread = kind === 'halo' ? .72 : .40;
    x = p.x * offset + (random() - .5) * spread;
    y = p.y * offset + (random() - .5) * spread;
    layer = kind === 'halo' ? 2 : 0;
    drift = kind === 'halo' ? .12 + random() * .26 : .10 + random() * .21;
  } else {
    const p = selectInteriorPoint(random);
    x = p.x;
    y = p.y;
    layer = isInsideHeart(x / .81, y / .81) ? 1 : 0;
    drift = .10 + random() * .25;
  }

  const depth = random() * 2 - 1;
  const sparkle = random();
  const basicSize = sparkle > .995
    ? 1.25 + random() * .38
    : .58 + Math.pow(random(), 1.6) * .62;
  const alpha = kind === 'halo' ? .06 + random() * .16
    : kind === 'contour' ? .68 + random() * .25
    : .56 + random() * .30;

  return {
    x: x * (1 + depth * .036),
    y: y * (1 + depth * .036),
    layer,
    size: basicSize * (kind === 'contour' ? 1.10 : kind === 'halo' ? .75 : 1),
    alpha,
    tone: random(),
    seed: random() * Math.PI * 2,
    speed: .52 + random() * .95,
    drift,
    depth
  };
}

export function createParticleCloud(count, seed = 20221104) {
  const random = seededRandom(seed);
  const data = new Float32Array(count * PARTICLE_STRIDE);
  let shell = 0;
  let core = 0;
  let halo = 0;

  for (let i = 0; i < count; i++) {
    const r = random();
    const kind = r < .05 ? 'halo' : r < .35 ? 'contour' : 'fill';
    const p = makeParticle(random, kind);
    if (p.layer === 1) core++;
    else if (p.layer === 2) halo++;
    else shell++;

    const index = i * PARTICLE_STRIDE;
    data[index] = p.x;
    data[index + 1] = p.y;
    data[index + 2] = p.layer;
    data[index + 3] = p.seed;
    data[index + 4] = p.speed;
    data[index + 5] = p.size;
    data[index + 6] = p.alpha * (count < 7000 ? .88 : 1);
    data[index + 7] = p.tone;
    data[index + 8] = p.drift;
    data[index + 9] = p.depth;
  }
  return { data, count, counts: { core, shell, halo } };
}
