import test from 'node:test';
import assert from 'node:assert/strict';
import {volumeThickness,surfacePoint,seededRandom,isInsideHeart} from '../src/v4/geometry.js';
import {createParticleSystems,STRIDE} from '../src/v4/particles.js';
import {HEART} from '../src/v4/config.js';
import {pointVertex} from '../src/v4/shaders.js';

test('heart has a rounded 3D body, not a thin planar extrusion',()=>{
  assert.ok(volumeThickness(0,1)>12);
  assert.ok(volumeThickness(12,1)>5);
  assert.ok(volumeThickness(16,1)<2);
  assert.ok(volumeThickness(0,1)>volumeThickness(12,1));
  assert.ok(volumeThickness(0,15)<volumeThickness(0,1));
});

test('surface samples hug the rounded heart front and back with outward normals',()=>{
  const rand=seededRandom(1911);
  let front=0,back=0,positive=0;
  for(let i=0;i<650;i++){
    const p=surfacePoint(rand);
    assert.ok(isInsideHeart(p.x,p.y));
    assert.ok(Number.isFinite(p.z));
    const l=Math.hypot(p.nx,p.ny,p.nz);
    assert.ok(Math.abs(l-1)<.00001);
    if(p.z>5)front++;
    if(p.z< -5)back++;
    if(p.nz*p.z>0)positive++;
  }
  assert.ok(front>130);
  assert.ok(back>130);
  assert.ok(positive>630);
});

test('shell and burst wrap the 3D body instead of staying on a flat contour',()=>{
  const q=createParticleSystems({core:500,shell:1800,burst:700});
  let shellFront=0,shellBack=0,burstZ=0;
  for(let i=500;i<2300;i++){
    const z=q.data[i*STRIDE+2];
    if(z>5)shellFront++;
    if(z< -5)shellBack++;
  }
  for(let i=2300;i<3000;i++){
    const nz=q.data[i*STRIDE+12];
    if(Math.abs(nz)>.30)burstZ++;
  }
  assert.ok(shellFront>250);
  assert.ok(shellBack>250);
  assert.ok(burstZ>180);
  assert.equal(STRIDE,13);
  assert.match(pointVertex,/normalZ \* uBurstTravel \* flight/);
});

test('center message remains hidden at normal zoom and not tied to orbit angle',()=>{
  assert.ok(HEART.secretZoom>2);
  assert.ok(HEART.secretZoom<HEART.zoomMax);
});
