import { HEART } from './config.js';
import { seededRandom } from './geometry.js';
import { createCoreParticle } from './layers/core.js';
import { createShellParticle } from './layers/shell.js';
import { createBurstParticle } from './layers/burst.js';
import { createRimParticle } from './layers/rim.js';

export const STRIDE = 13;
export const CORE = 0;
export const SHELL = 1;
export const BURST = 2;
export const RIM = 3;

function write(data, index, particle, rand) {
  const o = index * STRIDE;
  data[o] = particle.x;
  data[o + 1] = particle.y;
  data[o + 2] = particle.z;
  data[o + 3] = particle.kind;
  data[o + 4] = rand() * Math.PI * 2;
  data[o + 5] = particle.kind === RIM
    ? .48 + Math.pow(rand(), 1.7) * .33
    : .56 + Math.pow(rand(), 1.9) * (particle.kind === CORE ? .84 : .75);
  data[o + 6] = particle.alpha;
  data[o + 7] = rand();
  data[o + 8] = particle.nx;
  data[o + 9] = particle.ny;
  data[o + 10] = rand() * .15;
  data[o + 11] = .55 + rand() * 1.15;
  data[o + 12] = particle.nz || 0;
}

// Mirror only the outer fixed/fringe and flying particles. This gives
// a balanced two-sided silhouette without duplicating the entire core.
function writeBalancedPairs(data, first, count, factory, rand) {
  for (let i = 0; i < count; i += 2) {
    const left = first + i;
    write(data, left, factory(rand), rand);
    if (i + 1 < count) {
      const from = left * STRIDE;
      const to = (left + 1) * STRIDE;
      data.set(data.subarray(from, from + STRIDE), to);
      data[to] = -data[from];          // mirror X
      data[to + 8] = -data[from + 8];  // mirror the X normal
    }
  }
}

export function createParticleSystems(quality, seed = HEART.seed) {
  const rand = seededRandom(seed);
  const { core, shell, burst } = quality;
  const rim = quality.rim ?? 0;
  const count = core + shell + rim + burst;
  const data = new Float32Array(count * STRIDE);

  for (let i = 0; i < core; i++) {
    write(data, i, createCoreParticle(rand), rand);
  }
  for (let i = core; i < core + shell; i++) {
    write(data, i, createShellParticle(rand), rand);
  }
  const rimFirst = core + shell;
  const burstFirst = rimFirst + rim;
  writeBalancedPairs(data, rimFirst, rim, createRimParticle, rand);
  writeBalancedPairs(data, burstFirst, burst, createBurstParticle, rand);

  return {
    data, count,
    layers: {
      core: { first: 0, count: core },
      shell: { first: core, count: shell },
      rim: { first: rimFirst, count: rim },
      burst: { first: burstFirst, count: burst }
    }
  };
}
