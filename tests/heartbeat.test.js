import test from 'node:test';
import assert from 'node:assert/strict';
import { ART } from '../src/config.js';
import { gaussian, doubleBeat, pulseScale } from '../src/art/heartbeat.js';

test('two separate heartbeat peaks occur every cycle', () => {
  const first = doubleBeat(ART.pulsePeriod * .12);
  const second = doubleBeat(ART.pulsePeriod * .315);
  const rest = doubleBeat(ART.pulsePeriod * .7);
  assert.ok(first > second);
  assert.ok(second > rest);
  assert.ok(rest < .05);
});

test('heartbeat is periodic and remains bounded', () => {
  for (let index = 0; index < 200; index++) {
    const time = index * .031;
    assert.ok(Math.abs(doubleBeat(time) -
      doubleBeat(time + ART.pulsePeriod)) < 1e-8);
    assert.ok(doubleBeat(time) <= 1.65);
  }
});

test('heart core changes scale without requiring shell changes', () => {
  const beatScale = pulseScale(ART.pulsePeriod * .12);
  const restingScale = pulseScale(ART.pulsePeriod * .7);
  assert.ok(beatScale > restingScale);
  assert.equal(pulseScale(.12, -1, true), 1);
  assert.ok(pulseScale(.3, .05) >= 1);
  assert.ok(gaussian(0, 0, 1) === 1);
});
