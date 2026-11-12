import test from 'node:test';
import assert from 'node:assert/strict';
import { softBreathWeight } from '../src/art/deformation.js';
import { ART } from '../src/config.js';
import { particleVertex, skyFragment } from '../src/gpu/shaders.js';

test('breathing field fades smoothly from the center with no fixed-layer seam', () => {
  assert.ok(softBreathWeight(0, 0) > .94);
  assert.ok(softBreathWeight(16, 0) < .08);
  assert.ok(softBreathWeight(20, 0) < .00001);

  const points = [];
  for (let x = 0; x <= 20; x += .02) points.push(softBreathWeight(x, 0));
  for (let i = 1; i < points.length; i++) {
    assert.ok(Math.abs(points[i] - points[i - 1]) < .01);
    assert.ok(points[i] <= points[i - 1] + .00001);
  }

  assert.match(particleVertex, /float breath = softBreathWeight\(aPosition\)/);
  assert.doesNotMatch(particleVertex, /if\s*\(layer\s*>\s*0\.5/);
});

test('ruby-red palette and rear halo are configured', () => {
  assert.ok(ART.baseColor[0] > ART.baseColor[1] * 5);
  assert.ok(ART.baseColor[0] > ART.baseColor[2] * 4);
  assert.ok(ART.pulseStrength < .05);
  assert.ok(ART.rays < .5);
  assert.match(skyFragment, /float aura = max\(upper, lower\)/);
});
