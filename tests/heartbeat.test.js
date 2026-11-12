import test from 'node:test';
import assert from 'node:assert/strict';
import { ART } from '../src/config.js';
import { beatEnvelope, doubleBeat, pulseScale } from '../src/art/heartbeat.js';

const at = phase => ART.pulsePeriod * phase;

test('each beat compresses, expands, recoils and recovers', () => {
  assert.ok(beatEnvelope(at(.055)) < -0.015);
  assert.ok(beatEnvelope(at(.145)) > 0.065);
  assert.ok(beatEnvelope(at(.205)) < -0.015);
  assert.ok(beatEnvelope(at(.305)) > 0.03);
  assert.ok(beatEnvelope(at(.400)) < 0);
  assert.ok(Math.abs(beatEnvelope(at(.750))) < 1e-8);
  assert.ok(beatEnvelope(at(.145)) > beatEnvelope(at(.305)));
});

test('cycle is periodic, bounded and continuous across frame boundaries', () => {
  assert.equal(doubleBeat(at(.145)), beatEnvelope(at(.145)));
  let previous = beatEnvelope(0);
  for (let i = 1; i <= 2000; i++) {
    const value = beatEnvelope(at(i / 2000));
    assert.ok(Math.abs(value - previous) < 0.002);
    assert.ok(value <= ART.pulseStrength + 1e-8);
    assert.ok(value >= -ART.pulseStrength * .31);
    previous = value;
  }
  assert.ok(Math.abs(beatEnvelope(0) - beatEnvelope(ART.pulsePeriod)) < 1e-10);
  assert.ok(Math.abs(beatEnvelope(.23) -
    beatEnvelope(.23 + ART.pulsePeriod)) < 1e-10);
});

test('pulseScale includes touch impulse and respects reduced motion', () => {
  assert.ok(pulseScale(at(.145)) > 1.06);
  assert.ok(pulseScale(at(.055)) < 0.98);
  assert.equal(pulseScale(at(.145), .02, true), 1);
  assert.ok(Number.isFinite(pulseScale(at(.145), Infinity)));
  assert.ok(Number.isFinite(pulseScale(at(.145), NaN)));
  assert.ok(pulseScale(at(.145), .07) > pulseScale(at(.145), -1));
});
