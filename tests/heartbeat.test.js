import test from 'node:test';
import assert from 'node:assert/strict';
import { HEART } from '../src/config.js';
import { heartbeat, coreScale, easeOutCubic } from '../src/heartbeat.js';

test('heartbeat produces two distinct pulses in each cycle', () => {
  const beat1 = heartbeat(HEART.beatInterval * 0.12);
  const beat2 = heartbeat(HEART.beatInterval * 0.31);
  const rest = heartbeat(HEART.beatInterval * 0.7);
  assert.ok(beat1 > beat2);
  assert.ok(beat2 > rest);
  assert.ok(rest < 0.03);
});

test('outer shell can remain static while the core changes', () => {
  const rest = coreScale(HEART.beatInterval * 0.7, -1, false);
  const beat = coreScale(HEART.beatInterval * 0.12, -1, false);
  assert.ok(beat > rest);
  assert.equal(coreScale(0.2, 0.1, true), 1);
});

test('fade in easing respects its range', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(2), 1);
});
