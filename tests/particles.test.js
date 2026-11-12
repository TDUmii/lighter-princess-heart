import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticleCloud, PARTICLE_STRIDE, filmicPoint } from '../src/art/particles.js';
import { ART, qualityFor, heartUnit } from '../src/config.js';

test('particle cloud is deterministic and contains independent layers', () => {
  const a = createParticleCloud(7000, 8171);
  const b = createParticleCloud(7000, 8171);
  assert.deepEqual(a.data, b.data);
  assert.equal(a.data.length, 7000 * PARTICLE_STRIDE);
  assert.equal(a.counts.core + a.counts.shell + a.counts.halo, 7000);
  assert.ok(a.counts.core > 1500);
  assert.ok(a.counts.shell > 1000);
  assert.ok(a.counts.halo > 100);
});

test('all GPU attributes are finite and layers are valid', () => {
  const cloud = createParticleCloud(10000);
  for (let i = 0; i < cloud.data.length; i += PARTICLE_STRIDE) {
    for (let j = 0; j < PARTICLE_STRIDE; j++) {
      assert.ok(Number.isFinite(cloud.data[i + j]));
    }
    assert.ok([0, 1, 2].includes(cloud.data[i + 2]));
    assert.ok(cloud.data[i + 5] > 0);
  }
});

test('responsive profile respects pixel ratio limits', () => {
  const mobile = qualityFor(390, 844, 3);
  const desktop = qualityFor(1440, 900, 2.5);
  assert.equal(mobile.mobile, true);
  assert.equal(desktop.mobile, false);
  assert.equal(mobile.count, ART.mobileParticles);
  assert.equal(desktop.count, ART.desktopParticles);
  assert.ok(mobile.pixelRatio <= 1.45);
  assert.ok(desktop.pixelRatio <= 1.8);
  assert.ok(heartUnit(390, 844) > 0);
});


test('landscape desktop uses desktop particle budget rather than mobile budget', () => {
  const landscape = qualityFor(1200, 637, 1);
  assert.equal(landscape.mobile, false);
  assert.equal(landscape.count, ART.desktopParticles);
  assert.ok(heartUnit(1200, 637) > 14);
  const portrait = qualityFor(390, 844, 2);
  assert.equal(portrait.mobile, true);
});

test('film-inspired lobe notch correction keeps particles finite', () => {
  const notch = filmicPoint(0, -5);
  const side = filmicPoint(10, -5);
  assert.ok(notch.y < -5.2);
  assert.ok(Math.abs(side.y + 5) < .01);
  const end = filmicPoint(0, 17);
  assert.equal(end.y, 17);
});
