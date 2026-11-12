import test from 'node:test';
import assert from 'node:assert/strict';
import {
  heartField, surfacePoint, insideVolumePoint, volumeNormal,
  volumeThickness, seededRandom, isInsideVolume
} from '../src/v4/geometry.js';
import { createParticleSystems, STRIDE } from '../src/v4/particles.js';

function upperSurfaceAt(x,z) {
  let outside=-18,inside=-3;
  assert.ok(heartField(x,outside,z)>0);
  assert.ok(heartField(x,inside,z)<0);
  for(let i=0;i<25;i++){
    const mid=(outside+inside)*.5;
    if(heartField(x,mid,z)>0)outside=mid;
    else inside=mid;
  }
  return (outside+inside)*.5;
}

test('continuous 3D field creates two rounded lobes and a smooth top side profile',()=>{
  const lobeTop=upperSurfaceAt(7.6,0);
  const notchTop=upperSurfaceAt(0,0);
  assert.ok(lobeTop< -13.7);
  assert.ok(notchTop-lobeTop>2);
  assert.ok(notchTop-lobeTop<7);

  const topCenter=upperSurfaceAt(7.6,0);
  const topMiddle=upperSurfaceAt(7.6,5.0);
  const topSide=upperSurfaceAt(7.6,9.0);
  assert.ok(topCenter<topMiddle);
  assert.ok(topMiddle<topSide);
  assert.ok(topSide-topCenter>2.0);
  for(const z of [0,3,7,11]){
    assert.ok(Math.abs(heartField(7.6,-9,z)-heartField(-7.6,-9,z))<1e-9);
  }
});

test('inside 3D volume is a single connected rounded body with a smoothly tapered tip',()=>{
  assert.ok(isInsideVolume(0,1,0));
  assert.ok(volumeThickness(0,1)>10.5);
  assert.ok(volumeThickness(12,1)>5);
  assert.ok(volumeThickness(0,15)>0);
  assert.ok(volumeThickness(0,17.6)===0);
  assert.ok(heartField(0,0,26)>0);
  assert.ok(heartField(0,-18,0)>0);
});

test('surface-ray samples lie on the 3D implicit field with outward normals',()=>{
  const rand=seededRandom(741);
  let left=0,right=0,upper=0,lower=0;
  for(let i=0;i<900;i++){
    const p=surfacePoint(rand);
    assert.ok(Math.abs(heartField(p.x,p.y,p.z))<1e-4);
    assert.ok(Math.abs(Math.hypot(p.nx,p.ny,p.nz)-1)<1e-7);
    const further=heartField(
      p.x+p.nx*.2,p.y+p.ny*.2,p.z+p.nz*.2
    );
    assert.ok(further>-.001);
    if(p.z < -3)left++;
    if(p.z > 3)right++;
    if(p.y < -7)upper++;
    if(p.y > 8)lower++;
  }
  assert.ok(left>220&&right>220);
  assert.ok(upper>80&&lower>80);
});

test('core is sampled from the full 3D volume, not a 2D extruded silhouette',()=>{
  const rand=seededRandom(112);
  let nearFront=0,nearBack=0;
  for(let i=0;i<700;i++){
    const p=insideVolumePoint(rand);
    assert.ok(heartField(p.x,p.y,p.z)<0);
    if(p.z>5)nearFront++;
    if(p.z< -5)nearBack++;
  }
  assert.ok(nearFront>100&&nearBack>100);
});

test('particles no longer create a planar contour edge seam',()=>{
  const system=createParticleSystems({core:200,shell:1400,burst:380});
  let shell3d=0,burst3d=0;
  for(let i=200;i<1600;i++){
    const k=i*STRIDE;
    if(Math.abs(system.data[k+12])>.30)shell3d++;
  }
  for(let i=1600;i<1980;i++){
    const k=i*STRIDE;
    if(Math.abs(system.data[k+12])>.30)burst3d++;
  }
  assert.ok(shell3d>500);
  assert.ok(burst3d>120);
  const n=volumeNormal(0,1,volumeThickness(0,1));
  assert.ok(n.nz>.6);
});
