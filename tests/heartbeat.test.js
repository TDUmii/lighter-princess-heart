import test from 'node:test';
import assert from 'node:assert/strict';
import { ART } from '../src/config.js';
import { beatEnvelope, doubleBeat, pulseScale } from '../src/art/heartbeat.js';

const at = phase => phase * ART.pulsePeriod;

test('film-sampled heart cycle uses approximately 0.9 seconds', () => {
  assert.ok(ART.pulsePeriod >= .87 && ART.pulsePeriod <= .93);
  assert.ok(beatEnvelope(at(.22)) < -.045);
  assert.ok(beatEnvelope(at(.72)) > .073);
  assert.ok(beatEnvelope(at(.72)) > beatEnvelope(at(.22)));
  assert.equal(doubleBeat(at(.50)), beatEnvelope(at(.50)));
});

test('breathing loop has no sudden jump at the seam', () => {
  let previous = beatEnvelope(0);
  for (let i = 1; i <= 3000; i++) {
    const next = beatEnvelope(at(i / 3000));
    assert.ok(Number.isFinite(next));
    assert.ok(Math.abs(next - previous) < .002);
    assert.ok(next > -.075 && next < .110);
    previous = next;
  }
  assert.ok(Math.abs(beatEnvelope(0) - beatEnvelope(ART.pulsePeriod)) < 1e-9);
  assert.ok(Math.abs(beatEnvelope(.123) -
    beatEnvelope(.123 + ART.pulsePeriod)) < 1e-9);
});

test('touch impulse is finite and reduced motion disables movement', () => {
  assert.equal(pulseScale(at(.72), .05, true), 1);
  assert.ok(Number.isFinite(pulseScale(.3, Infinity)));
  assert.ok(Number.isFinite(pulseScale(.3, NaN)));
  assert.ok(Math.abs(pulseScale(.45, -1) - (1 + beatEnvelope(.45))) < 1e-9);
  assert.notEqual(pulseScale(.45, .04), pulseScale(.45, -1));
});
