import test from 'node:test';
import assert from 'node:assert/strict';
import { heartPoint, insidePoint, isInsideHeart, outlinePoint, seededRandom } from '../src/geometry.js';

test('the outline has two lobes and a lower tip', () => {
  const tip = heartPoint(Math.PI);
  assert.ok(Math.abs(tip.x) < 0.0001);
  assert.ok(tip.y > 15);
  assert.ok(heartPoint(Math.PI / 2).x > 15);
  assert.ok(heartPoint(3 * Math.PI / 2).x < -15);
});

test('samples never leave the heart interior', () => {
  const random = seededRandom(123);
  for (let index = 0; index < 20000; index++) {
    const { x, y } = insidePoint(random);
    assert.equal(isInsideHeart(x, y), true);
    assert.ok(x >= -16 && x <= 16);
  }
});

test('outline sampling remains finite', () => {
  const random = seededRandom(991);
  for (let index = 0; index < 1000; index++) {
    const point = outlinePoint(random);
    assert.ok(Number.isFinite(point.x));
    assert.ok(Number.isFinite(point.y));
  }
});
