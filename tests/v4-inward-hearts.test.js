import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { HEART } from '../src/v4/config.js';
import {
  returnProgress,returnStrength,returnDistance,burstStrength,
  heartbeat,beatPhase
} from '../src/v4/heartbeat.js';
import { pointVertex } from '../src/v4/shaders.js';

test('homebound hearts begin outside late in the cycle and fly inside during the inward beat',()=>{
  assert.equal(returnStrength(.76,0),0);
  assert.ok(returnStrength(.86,0)>.45);
  assert.ok(returnStrength(.94,0)>.75);
  assert.ok(returnStrength(0,0)>.9);
  assert.ok(returnStrength(.10,0)>.35);
  assert.equal(returnStrength(.22,0),0);
  assert.ok(returnDistance(.86,0)>returnDistance(0,0));
  assert.ok(returnDistance(0,0)>returnDistance(.10,0));
  assert.ok(returnDistance(.12,0)<-1);
  assert.ok(returnProgress(.96,0)<returnProgress(.02,0));
  assert.ok(HEART.returnTravel>HEART.burstTravel);
  assert.ok(heartbeat(.15*HEART.period)<-.12);
});

test('homebound motion is continuous across the cycle seam, including staggered particles',()=>{
  for(const delay of [0,.025,.075,.12,.15]){
    const before=returnStrength(1-1e-6,delay);
    const after=returnStrength(1e-6,delay);
    const distanceBefore=returnDistance(1-1e-6,delay);
    const distanceAfter=returnDistance(1e-6,delay);
    assert.ok(Math.abs(before-after)<.0001);
    assert.ok(Math.abs(distanceBefore-distanceAfter)<.001);
    assert.ok(Number.isFinite(returnDistance(.10,delay)));
    assert.equal(returnStrength(.5,delay),0);
  }
});

test('outbound and inbound envelopes are separately observable, with no permanent fireworks',()=>{
  assert.equal(burstStrength(.08),0);
  assert.ok(returnStrength(.08)>.5);
  assert.ok(burstStrength(.46)>.7);
  assert.equal(returnStrength(.46),0);
  assert.equal(burstStrength(.95),0);
  assert.ok(returnStrength(.95)>.7);
  assert.equal(beatPhase(HEART.period*2),0);
});

test('GPU shader and Canvas2D fallback use the same radial return path and phase shift',()=>{
  const canvas=readFileSync(new URL('../src/v4/fallback.js',import.meta.url),'utf8');
  const renderer=readFileSync(new URL('../src/v4/renderer.js',import.meta.url),'utf8');
  assert.match(pointVertex,/float homeT = \(wrapped\+\.18-returnShift\)\/\.36/);
  assert.match(pointVertex,/p\.xyz \+= vec3\(normal,normalZ\)\*distance/);
  assert.match(pointVertex,/float distance = mix\(uReturnTravel,-uReturnInset,eased\)/);
  assert.match(pointVertex,/burstAlpha = homeAlpha/);
  assert.match(canvas,/returnStrength\(phase,delay\)/);
  assert.match(canvas,/returnDistance\(phase,delay\)/);
  assert.match(renderer,/uReturnTravel/);
  assert.match(renderer,/uReturnInset/);
});
