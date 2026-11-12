import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  heartField, volumeThickness, surfacePoint, seededRandom
} from '../src/v4/geometry.js';
import { pointVertex, pointFragment } from '../src/v4/shaders.js';
import { HEART, heartUnit } from '../src/v4/config.js';

function firstUpperY(x,z) {
  let outside=-25,inside=-3;
  for(let i=0;i<34;i++){
    const m=(outside+inside)*.5;
    if(heartField(x,m,z)>0)outside=m;
    else inside=m;
  }
  return (outside+inside)*.5;
}

function lowerY(x,z) {
  let inside=3,outside=25;
  for(let i=0;i<34;i++){
    const m=(inside+outside)*.5;
    if(heartField(x,m,z)<0)inside=m;
    else outside=m;
  }
  return (inside+outside)*.5;
}

test('reference front: two round raised lobes, visible notch, softly tapered tip',()=>{
  const left=firstUpperY(-9,0);
  const right=firstUpperY(9,0);
  const notch=firstUpperY(0,0);
  assert.ok(Math.abs(left-right)<1e-8);
  assert.ok(notch-left>3 && notch-left<5.5);
  assert.ok(left< -17.3);
  assert.ok(lowerY(0,0)>16 && lowerY(0,0)<17.2);
  for(const x of [-10,-5,0,5,10]){
    assert.ok(Math.abs(heartField(x,0,0)-heartField(-x,0,0))<1e-12);
  }
});

test('rounded 3D side profile has no horizontal top cut or vertical extrusion cap',()=>{
  const topCenter=firstUpperY(0,0);
  const topMid=firstUpperY(0,5);
  const topSide=firstUpperY(0,9);
  assert.ok(topMid<topCenter);
  assert.ok(topSide>topCenter+1);
  const bottomCenter=lowerY(0,0);
  const bottomSide=lowerY(0,8);
  assert.ok(bottomCenter-bottomSide>2);
  assert.ok(volumeThickness(0,1)>12 && volumeThickness(12,1)>8);
});

test('surface particles stay on the same smooth closed 3D field',()=>{
  const rand=seededRandom(4305);
  let front=0,back=0;
  for(let i=0;i<800;i++){
    const p=surfacePoint(rand);
    assert.ok(Math.abs(heartField(p.x,p.y,p.z))<1e-4);
    assert.ok(Math.abs(Math.hypot(p.nx,p.ny,p.nz)-1)<1e-6);
    if(p.z>4)front++;
    if(p.z< -4)back++;
  }
  assert.ok(front>160 && back>160);
});

test('reference lighting uses rim emphasis and some miniature heart glyphs at normal zoom',()=>{
  assert.match(pointVertex,/vRim = silhouette/);
  assert.match(pointVertex,/vIsHeart=isSymbol/);
  assert.match(pointFragment,/vIsHeart/);
  assert.match(pointFragment,/rimLight/);
  assert.match(pointVertex,/p\.z \*= \(1\. \+ uBeat\*\.46\)/);
  assert.ok(heartUnit(1200,637)>14);
  assert.ok(heartUnit(390,844)>8);
});

test('message still hidden until zoomed and instruction text is absent',()=>{
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const scene=readFileSync(new URL('../src/v4/scene.js',import.meta.url),'utf8');
  assert.ok(HEART.secretZoom>2);
  assert.doesNotMatch(index,/class="orbit-hint"/);
  assert.match(scene,/HEART\.secretZoom/);
  assert.match(scene,/visibility=reveal>0\.005\?'visible':'hidden'/);
});
