import { HEART } from './config.js';
import { seededRandom } from './geometry.js';
import { createCoreParticle } from './layers/core.js';
import { createShellParticle } from './layers/shell.js';
import { createBurstParticle } from './layers/burst.js';

export const STRIDE = 12;
export const CORE = 0;
export const SHELL = 1;
export const BURST = 2;

function write(data, index, particle, rand) {
  const o = index * STRIDE;
  data[o] = particle.x;
  data[o + 1] = particle.y;
  data[o + 2] = particle.z;
  data[o + 3] = particle.kind;
  data[o + 4] = rand() * Math.PI * 2;
  data[o + 5] = .56 + Math.pow(rand(), 1.9) *
    (particle.kind === CORE ? .84 : .75);
  data[o + 6] = particle.alpha;
  data[o + 7] = rand();
  data[o + 8] = particle.nx;
  data[o + 9] = particle.ny;
  data[o + 10] = rand() * .15;
  data[o + 11] = .55 + rand() * 1.15;
}

export function createParticleSystems(quality, seed = HEART.seed) {
  const rand = seededRandom(seed);
  const { core, shell, burst } = quality;
  const count = core + shell + burst;
  const data = new Float32Array(count * STRIDE);

  for (let i = 0; i < core; i++) {
    write(data, i, createCoreParticle(rand), rand);
  }
  for (let i = core; i < core + shell; i++) {
    write(data, i, createShellParticle(rand), rand);
  }
  for (let i = core + shell; i < count; i++) {
    write(data, i, createBurstParticle(rand), rand);
  }

  return {
    data, count,
    layers: {
      core: { first: 0, count: core },
      shell: { first: core, count: shell },
      burst: { first: core + shell, count: burst }
    }
  };
}
