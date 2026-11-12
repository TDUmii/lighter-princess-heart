import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HEART } from '../src/v4/config.js';
import { heartbeat, burstStrength, deformScale } from '../src/v4/heartbeat.js';
import { pointVertex, pointFragment } from '../src/v4/shaders.js';

const source = (relative) => readFileSync(new URL(relative, import.meta.url),'utf8');

test('contraction is visibly stronger than before at all shell depths', () => {
  const minimum = heartbeat(HEART.period * .15);
  const maximum = heartbeat(HEART.period * .32);
  assert.ok(minimum <= -.13);
  assert.ok(maximum >= .10);
  assert.ok(deformScale(1, 0, minimum) < .89);
  assert.ok(deformScale(1, 1, minimum) < .89);
  assert.ok(deformScale(0, .3, minimum) < .86);
  assert.ok(deformScale(0, .9, minimum) < .88);
  assert.ok(deformScale(1, 0, maximum) > 1.09);
  assert.ok(Math.abs(heartbeat(0)-heartbeat(HEART.period)) < 1e-8);
});

test('GPU contraction uses one uniform 3D scale for the entire particle volume',()=>{
  assert.match(pointVertex, /float pulseScale = 1\. \+ uBeat \* weight/);
  assert.match(pointVertex, /p\.xy = center \+ \(p\.xy-center\)\*pulseScale/);
  assert.match(pointVertex, /p\.z \*= pulseScale/);
  assert.doesNotMatch(pointVertex, /p\.z \*= \(1\. \+ uBeat\*\.46\)/);
});

test('additional miniature hearts are visible in the body and expelled at the rim',()=>{
  assert.ok(HEART.desktop.burst>=1900);
  assert.ok(HEART.mobile.burst>=800);
  assert.ok(HEART.burstTravel>=3.3);
  assert.match(pointVertex, /step\(\.946, symbolRandom\)/);
  assert.match(pointVertex, /vIsHeart=kind>1\.5\?1\.0:isSymbol/);
  assert.match(pointFragment, /miniHeart\(gl_PointCoord\)/);
  assert.ok(burstStrength(.54,.05)>.4);
  assert.equal(burstStrength(.88),0);
});

test('the heart no longer rotates automatically and front-view shortcut is centered',()=>{
  const scene=source('../src/v4/scene.js');
  const html=source('../index.html');
  const main=source('../src/main.js');
  const css=source('../styles.css');
  assert.doesNotMatch(scene, /this\.autoRotate/);
  assert.doesNotMatch(main, /orbitToggle|setAutoRotate/);
  assert.doesNotMatch(html, /id="orbit-toggle"/);
  assert.match(html, /id="reset-view" class="front-view-button"/);
  assert.match(main, /'#reset-view'/);
  assert.match(css, /\.front-view-button \{/);
  assert.match(css, /left: 50%/);
  assert.match(scene, /this\.yaw=0;\s*this\.pitch=0/);
  assert.match(scene, /no automatic spin or inertia/);
});
