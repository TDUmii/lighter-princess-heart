import test from 'node:test';
import assert from 'node:assert/strict';
import { deformPoint, radialBeatWeight } from '../src/art/deformation.js';
import { ART } from '../src/config.js';
import { particleVertex, skyFragment, particleFragment } from '../src/gpu/shaders.js';

test('radial deformation is continuous with stronger motion near the edge', () => {
  assert.ok(radialBeatWeight(0, 1) >= .45);
  assert.ok(radialBeatWeight(16, 1) > .97);
  let previous = radialBeatWeight(0, 1);

  for (let x = .02; x <= 20; x += .02) {
    const current = radialBeatWeight(x, 1);
    assert.ok(Math.abs(current - previous) < .01);
    assert.ok(current >= previous - .000001);
    previous = current;
  }
});

test('particles move both inward and outward; shell has no separate scaling rule', () => {
  const x = 12, y = 3;
  const rest = Math.hypot(x, y - 1);
  const inward = deformPoint(x, y, -.025);
  const outward = deformPoint(x, y, .075);

  assert.ok(Math.hypot(inward.x, inward.y - 1) < rest);
  assert.ok(Math.hypot(outward.x, outward.y - 1) > rest);
  assert.match(particleVertex, /float weight = radialBeatWeight\(aPosition\)/);
  assert.doesNotMatch(particleVertex, /if\s*\(layer\s*>\s*0\.5/);
});

test('background glow responds gently to pulse, with mini heart sprites', () => {
  assert.ok(ART.pulsePeriod > .9 && ART.pulsePeriod < 1.2);
  assert.ok(ART.pulseStrength > .06 && ART.pulseStrength < .09);
  assert.ok(ART.rays > 0 && ART.rays < .4);
  assert.match(skyFragment, /uniform float uBeat/);
  assert.match(skyFragment, /float pulseGlow/);
  assert.match(particleFragment, /float miniHeart\(vec2 uv\)/);
  assert.match(particleFragment, /float heartShape = miniHeart\(gl_PointCoord\)/);
});
