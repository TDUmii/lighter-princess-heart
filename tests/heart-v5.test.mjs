import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { HEART, qualityFor } from '../src/v5/config.js';
import { heartbeat, beatPhase, FLIGHT, flightProgress, flightDistance, flightOpacity } from '../src/v5/heartbeat.js';
import { heartField, seededRandom, surfacePoint } from '../src/v5/geometry.js';
import { createParticleSystems, STRIDE } from '../src/v5/particles.js';

const near = (a, b, tolerance = 1e-6) => assert.ok(
  Math.abs(a - b) < tolerance, `Expected ${a} near ${b} (tolerance ${tolerance})`
);

test('double beat is cyclic and has two distinct impulses', () => {
  near(heartbeat(0), heartbeat(HEART.period));
  const values = Array.from({ length: 1001 }, (_, i) => heartbeat(i * HEART.period / 1000));
  const peaks = values.filter((v, i) => i > 0 && i < 1000 && v > values[i - 1] && v > values[i + 1]);
  assert.ok(peaks.length >= 2);
  assert.ok(Math.max(...peaks) > .11);
  assert.ok(values.every(Number.isFinite));
});

test('outbound and return trips follow exactly the same path with equal durations', () => {
  for (const delay of [0, .075, .15]) {
    const launch = FLIGHT.start + (delay - .075) * FLIGHT.stagger;
    for (let i = 1; i <= 100; i++) {
      const u = i / 101;
      const phaseOut = (launch + u * FLIGHT.leg) % 1;
      const phaseBack = (launch + (2 - u) * FLIGHT.leg) % 1;
      near(flightDistance(phaseOut, delay), flightDistance(phaseBack, delay), 1e-9);
      assert.ok(flightOpacity(phaseOut, delay) >= 0);
      assert.ok(flightOpacity(phaseBack, delay) >= 0);
    }
    near(flightDistance((launch + FLIGHT.leg) % 1, delay), HEART.burstTravel, 1e-8);
    near(flightDistance((launch + 2 * FLIGHT.leg) % 1, delay), 0, 1e-8);
  }
  near(beatPhase(-.5), beatPhase(HEART.period - .5));
});

test('implicit 3D heart is symmetrical along X', () => {
  const rand = seededRandom(42);
  for (let i = 0; i < 240; i++) {
    const p = surfacePoint(rand);
    near(heartField(p.x, p.y, p.z), heartField(-p.x, p.y, p.z), 1e-9);
    assert.ok(Math.abs(heartField(p.x, p.y, p.z)) < 3e-5);
  }
});

test('balanced silhouette particles mirror the shell and remain finite', () => {
  const q = qualityFor(1280, 800, 2, 2);
  const sys = createParticleSystems(q);
  assert.equal(sys.count, q.core + q.shell + q.rim + q.burst);
  assert.equal(sys.data.length, sys.count * STRIDE);
  for (const x of sys.data) assert.ok(Number.isFinite(x));
  // Only the resting skin and rim are mirrored; flying sparks must be independent.
  for (const name of ['shell', 'rim']) {
    const { first, count } = sys.layers[name];
    for (let i = first; i < first + count - 1; i += 2) {
      const a = i * STRIDE, b = (i + 1) * STRIDE;
      near(sys.data[a], -sys.data[b], 1e-5);
      near(sys.data[a + 1], sys.data[b + 1], 1e-5);
      near(sys.data[a + 2], sys.data[b + 2], 1e-5);
    }
  }
  assert.deepEqual(sys.data, createParticleSystems(q).data);
});

test('adaptive quality is monotonic and mobile mode has a lower particle budget', () => {
  for (const [w, h] of [[1280,800], [393,852]]) {
    const levels = [0, 1, 2].map(tier => qualityFor(w, h, 3, tier));
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i].core > levels[i-1].core);
      assert.ok(levels[i].pixelRatio >= levels[i-1].pixelRatio);
      assert.equal(levels[i].shell % 2, 0);
      assert.equal(levels[i].burst % 2, 0);
    }
    assert.ok(levels[2].pixelRatio <= (w < 640 ? 1.42 : 1.75));
  }
});

test('particle generation stays bounded on desktop and mobile', () => {
  for (const [width, height] of [[1280,800], [393,852]]) {
    const q = qualityFor(width, height, 2, 2);
    const start = performance.now();
    createParticleSystems(q);
    const timeMs = performance.now() - start;
    console.log(`Particle setup ${width}x${height}: ${timeMs.toFixed(1)} ms`);
    assert.ok(timeMs < 5000);
  }
});
