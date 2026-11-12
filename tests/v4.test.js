import test from 'node:test';
import assert from 'node:assert/strict';
import { HEART, qualityFor, heartUnit } from '../src/v4/config.js';
import { heartbeat, beatPhase, burstStrength, deformScale } from '../src/v4/heartbeat.js';
import { outlineSample, isInsideHeart, seededRandom, volumeThickness } from '../src/v4/geometry.js';
import { createParticleSystems, STRIDE, CORE, SHELL, BURST } from '../src/v4/particles.js';

test('desktop and mobile use independent, bounded GPU budgets', () => {
  const desktop=qualityFor(1200,637,3);
  const mobile=qualityFor(390,844,3);
  assert.equal(desktop.mobile,false);
  assert.equal(mobile.mobile,true);
  assert.ok(desktop.core>mobile.core);
  assert.ok(desktop.pixelRatio<=1.75);
  assert.ok(mobile.pixelRatio<=1.42);
  assert.ok(heartUnit(1200,637)>12);
});

test('three particle systems have stable, contiguous buffers', () => {
  const q={core:2000,shell:900,burst:320};
  const a=createParticleSystems(q);
  const b=createParticleSystems(q);
  assert.deepEqual(a.data,b.data);
  assert.equal(a.count,3220);
  assert.equal(a.data.length,a.count*STRIDE);
  assert.deepEqual(a.layers,{
    core:{first:0,count:2000},
    shell:{first:2000,count:900},
    burst:{first:2900,count:320}
  });
  for(let i=0;i<a.count;i++){
    const offset=i*STRIDE;
    for(let j=0;j<STRIDE;j++)assert.ok(Number.isFinite(a.data[offset+j]));
    const kind=a.data[offset+3];
    if(i<2000)assert.equal(kind,CORE);
    else if(i<2900)assert.equal(kind,SHELL);
    else assert.equal(kind,BURST);
  }
});

test('core points have real front-to-back depth', () => {
  const p=createParticleSystems({core:1900,shell:0,burst:0}).data;
  const depths=[];
  for(let i=0;i<p.length;i+=STRIDE)depths.push(p[i+2]);
  assert.ok(Math.min(...depths)<-5);
  assert.ok(Math.max(...depths)>5);
  assert.ok(volumeThickness(0,1)>6);
  assert.ok(volumeThickness(16,1)<3);
});

test('rim normals point outward and never follow a tangential skew field', () => {
  const rand=seededRandom(8161);
  let valid=0;
  for(let i=0;i<250;i++){
    const p=outlineSample(rand);
    const len=Math.hypot(p.nx,p.ny);
    assert.ok(Math.abs(len-1)<.0001);
    if(!isInsideHeart(p.x+p.nx*.7,p.y+p.ny*.7))valid++;
  }
  assert.ok(valid>240);
});

test('contraction and expansion are symmetric around the heart origin', () => {
  const compressed=heartbeat(HEART.period*.145);
  const expanded=heartbeat(HEART.period*.315);
  assert.ok(compressed<-.05);
  assert.ok(expanded>.085);
  for(const radius of [0,.3,.7,1]){
    const inner=deformScale(CORE,radius,compressed);
    const outer=deformScale(CORE,radius,expanded);
    assert.ok(inner<1);
    assert.ok(outer>1);
    assert.ok(deformScale(SHELL,radius,expanded)>1);
    assert.ok(outer>deformScale(SHELL,radius,expanded));
  }
});

test('burst is a brief outward pulse at the rim, not continuous fireworks', () => {
  assert.equal(burstStrength(.13),0);
  assert.ok(burstStrength(.49)>.8);
  assert.equal(burstStrength(.85),0);
  assert.equal(burstStrength(.42,.15),0);
  assert.ok(burstStrength(.58,.13)>0);
});

test('beat loop is periodic, continuous and follows approximately 0.9 seconds', () => {
  assert.equal(HEART.period,.90);
  let previous=heartbeat(0);
  for(let i=1;i<=4000;i++){
    const v=heartbeat(HEART.period*i/4000);
    assert.ok(Math.abs(v-previous)<.001);
    previous=v;
  }
  assert.ok(Math.abs(heartbeat(.123)-heartbeat(.123+HEART.period))<1e-8);
  assert.ok(Math.abs(beatPhase(HEART.period*2.5)-.5)<1e-9);
});
