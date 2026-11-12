import test from 'node:test';
import assert from 'node:assert/strict';
import { deformPoint, radialBeatWeight, travelingFlow } from '../src/art/deformation.js';
import { ART } from '../src/config.js';
import { particleVertex, skyFragment, particleFragment } from '../src/gpu/shaders.js';

test('radial deformation is smooth and stronger in the interior', () => {
  assert.ok(radialBeatWeight(0, 1) > .99);
  assert.ok(radialBeatWeight(16, 1) >= .30);
  assert.ok(radialBeatWeight(16, 1) < .38);
  let previous = radialBeatWeight(0, 1);
  for (let x = .02; x <= 21; x += .02) {
    const value = radialBeatWeight(x, 1);
    assert.ok(Math.abs(value - previous) < .01);
    assert.ok(value <= previous + 1e-6);
    previous = value;
  }
});

test('inward and outward pulses never split core and contour into separate rules', () => {
  const rest = Math.hypot(12, 3 - 1);
  const inward = deformPoint(12, 3, -.05, 0);
  const outward = deformPoint(12, 3, .08, 0);
  const inwardR = Math.hypot(inward.x, inward.y - 1);
  const outwardR = Math.hypot(outward.x, outward.y - 1);
  assert.ok(inwardR < rest + .5);
  assert.ok(outwardR > rest);
  assert.ok(outwardR > inwardR);
  assert.match(particleVertex, /float weight = radialBeatWeight\(aPosition\)/);
  assert.doesNotMatch(particleVertex, /if\s*\(layer\s*>\s*0\.5/);
});

test('a traveling density wave moves inside particles both outward and inward', () => {
  const radius = 10 / 16;
  const first = (.25 * radius + .25) * ART.pulsePeriod;
  const second = first + ART.pulsePeriod / 2;
  const outgoing = travelingFlow(10, 1, first);
  const incoming = travelingFlow(10, 1, second);
  assert.ok(outgoing.x > 10.3);
  assert.ok(incoming.x < 9.7);
  assert.ok(Math.abs(outgoing.x - incoming.x) > .7);
  assert.match(particleVertex, /vec2 travelingFlow\(vec2 point, float seconds\)/);
  assert.match(particleVertex, /uniform float uPulsePeriod/);
});

test('film-oriented motion preserves appearance and optional secret detail sprites', () => {
  assert.equal(ART.desktopParticles, 14000);
  assert.equal(ART.mobileParticles, 4200);
  assert.ok(ART.rays > 0 && ART.rays < .4);
  assert.match(skyFragment, /float pulseGlow/);
  assert.match(particleFragment, /float miniHeart\(vec2 uv\)/);
  assert.match(particleFragment, /float heartShape = miniHeart\(gl_PointCoord\)/);
});
