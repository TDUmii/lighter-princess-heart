import { insidePoint, isInsideHeart, outlinePoint, seededRandom } from '../geometry.js';

export const PARTICLE_STRIDE = 10;

function makeParticle(random, kind) {
  let x = 0;
  let y = 0;
  let layer = 0;
  let drift = 0;

  if (kind === 'halo' || kind === 'contour') {
    const p = outlinePoint(random);
    const offset = kind === 'halo'
      ? 1.005 + Math.pow(random(), 1.9) * 0.27
      : 0.91 + random() * 0.15;
    x = p.x * offset + (random() - .5) * (kind === 'halo' ? 1.2 : 0.25);
    y = p.y * offset + (random() - .5) * (kind === 'halo' ? 1.2 : 0.25);
    layer = kind === 'halo' ? 2 : 0;
    drift = kind === 'halo' ? .3 + random() * .55 : .10 + random() * .2;
  } else {
    const p = insidePoint(random);
    x = p.x;
    y = p.y;
    layer = isInsideHeart(x / .81, y / .81) ? 1 : 0;
    drift = layer === 1 ? .10 + random() * .16 : .13 + random() * .29;
  }

  const depth = random() * 2 - 1;
  const sparkle = random();
  const size = (sparkle > .988
    ? 1.6 + random() * 1.15
    : .45 + Math.pow(random(), 1.65) * 1.05);
  const alpha = layer === 2
    ? .22 + random() * .40
    : .68 + random() * .38;
  return {
    x: x * (1 + depth * .036),
    y: y * (1 + depth * .036),
    layer,
    size,
    alpha,
    tone: random(),
    seed: random() * 6.2831853,
    speed: .57 + random() * 1.05,
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
    const kind = r < .105 ? 'halo'
      : r < .265 ? 'contour'
      : 'fill';
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
    data[index + 6] = p.alpha;
    data[index + 7] = p.tone;
    data[index + 8] = p.drift;
    data[index + 9] = p.depth;
  }

  return {
    data,
    count,
    counts: { core, shell, halo }
  };
}
