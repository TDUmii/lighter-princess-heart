import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ORBIT, rotatePoint, perspectiveScale } from '../src/v4/camera.js';
import { heartPoint, outlineSample, seededRandom, isInsideHeart } from '../src/v4/geometry.js';
import { pointVertex } from '../src/v4/shaders.js';

test('orbital camera rotates all the way around the Y axis', () => {
  const front=rotatePoint(12,0,0,0,0);
  const side=rotatePoint(12,0,0,Math.PI/2,0);
  const back=rotatePoint(12,0,0,Math.PI,0);
  assert.ok(Math.abs(front.x-12)<1e-7);
  assert.ok(Math.abs(side.x)<1e-7);
  assert.ok(Math.abs(side.z+12)<1e-7);
  assert.ok(Math.abs(back.x+12)<1e-7);
  assert.ok(perspectiveScale(10)>perspectiveScale(-10));
});

test('camera tilt stays reversible and numerically stable', () => {
  const top=rotatePoint(0,10,0,0,Math.PI/2);
  const bottom=rotatePoint(0,10,0,0,-Math.PI/2);
  assert.ok(Math.abs(top.y)<1e-7);
  assert.ok(Math.abs(top.z-10)<1e-7);
  assert.ok(Math.abs(bottom.z+10)<1e-7);
  assert.ok(ORBIT.minPitch<0 && ORBIT.maxPitch>0);
});

test('heart tip is rounded and shortened without breaking symmetry', () => {
  const middle=heartPoint(Math.PI);
  const left=heartPoint(Math.PI-.18);
  const right=heartPoint(Math.PI+.18);
  assert.ok(middle.y<16);
  assert.ok(middle.y>14);
  assert.ok(Math.abs(left.x+right.x)<1e-5);
  assert.ok(Math.abs(left.y-right.y)<1e-5);
  assert.ok(Math.abs(left.x)>.45);
});

test('soft shell normal still points outward after shape correction', () => {
  const rand=seededRandom(15);
  let valid=0;
  for(let i=0;i<250;i++){
    const p=outlineSample(rand);
    if(!isInsideHeart(p.x+p.nx*.7,p.y+p.ny*.7))valid++;
  }
  assert.ok(valid>235);
});

test('billboard message always visible and not attached to rotating GPU points', () => {
  const scene=readFileSync(new URL('../src/v4/scene.js',import.meta.url),'utf8');
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(scene,/this\.secret\.style\.visibility='visible'/);
  assert.match(scene,/yaw:this\.yaw,pitch:this\.pitch/);
  assert.match(index,/id="reset-view"/);
  assert.match(index,/id="orbit-toggle"/);
  assert.match(index,/love you/);
  assert.match(pointVertex,/uniform float uYaw/);
  assert.match(pointVertex,/uniform float uPitch/);
  assert.match(pointVertex,/vec3 cameraPoint/);
});
