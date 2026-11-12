import test from 'node:test';
import assert from 'node:assert/strict';
import { particlePosition, particleOpacity } from '../src/motion.js';

const particle = {
  x: 10, y: -5, depth: 0.2, seed: 1.5,
  drift: 0.4, speed: 0.9, alpha: 0.72
};

test('outer particles drift but remain near their fixed anchors', () => {
  const original = particlePosition(particle, 0, 20);
  const later = particlePosition(particle, 1.7, 20);
  assert.notDeepEqual(original, later);
  const anchorX = particle.x * (1 + particle.depth * 0.045) * 20;
  const anchorY = particle.y * (1 + particle.depth * 0.045) * 20;
  for (const point of [original, later]) {
    assert.ok(Math.abs(point.x - anchorX) <= particle.drift * 20 * 1.05);
    assert.ok(Math.abs(point.y - anchorY) <= particle.drift * 20 * 1.05);
  }
});

test('outer particle flicker is bounded and changes over time', () => {
  const initial = particleOpacity(particle, 0);
  const later = particleOpacity(particle, 1.7);
  assert.notEqual(initial, later);
  for (const value of [initial, later]) {
    assert.ok(value >= particle.alpha * 0.54 - 0.00001);
    assert.ok(value <= particle.alpha + 0.00001);
  }
});
