import test from 'node:test';
import assert from 'node:assert/strict';
import { HEART } from '../src/v5/config.js';
import { shockwaveRings, SHOCKWAVE, touchFalloff, withinHeart } from '../src/v5/effects.js';

const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,`${a} differs from ${b}`);

test('two shockwaves trigger at heartbeat peaks and decay without flashing',()=>{
  for(const [start,index] of [[SHOCKWAVE.first,0],[SHOCKWAVE.second,1]]){
    const born=shockwaveRings(start*HEART.period)[index];
    near(born.progress,0);
    near(born.offset,SHOCKWAVE.startOffset);
    assert.ok(born.strength>.3);
    const after=shockwaveRings((start+SHOCKWAVE.duration*.85)*HEART.period)[index];
    assert.ok(after.offset>born.offset);
    assert.ok(after.strength<born.strength);
    assert.ok(after.strength>=0);
  }
  assert.deepEqual(shockwaveRings(0,true),[]);
});

test('shockwave looping and motion curves remain continuous',()=>{
  for(const t of [0,.17,1.6,8.9]){
    const first=shockwaveRings(t);
    const oneCycle=shockwaveRings(t+HEART.period);
    for(let i=0;i<2;i++){
      near(first[i].offset,oneCycle[i].offset);
      near(first[i].strength,oneCycle[i].strength);
      assert.ok(first[i].strength>=0 && first[i].strength<=1);
    }
  }
});

test('touch influence falls off smoothly and never affects distant particles',()=>{
  near(touchFalloff(0,110),1);
  near(touchFalloff(110,110),0);
  near(touchFalloff(500,110),0);
  near(touchFalloff(110/2,110),.5);
  near(touchFalloff(20,0),0);
  assert.ok(touchFalloff(1,110)>touchFalloff(40,110));
});

test('touch hotspot only activates inside visible front-facing heart',()=>{
  const w=393,h=852,unit=8.9,zoom=1,panX=0,panY=0;
  const cx=w*.5,cy=h*.5+unit*.9;
  assert.equal(withinHeart(cx,cy,w,h,unit,zoom,panX,panY),true);
  assert.equal(withinHeart(0,0,w,h,unit,zoom,panX,panY),false);
  assert.equal(withinHeart(w-1,h-1,w,h,unit,zoom,panX,panY),false);
  assert.equal(withinHeart(cx,cy,w,h,0,zoom,panX,panY),false);
  assert.equal(withinHeart(cx+80,cy+20,w,h,unit,2,panX,panY),true);
});
test('soft wave tracks the real heart outline, not a circle',async()=>{
  const { heartPoint, heartField } = await import('../src/v5/geometry.js');
  const { skyFragment, pointVertex } = await import('../src/v5/shaders.js');
  const distances=[];
  for(let i=0;i<80;i++){
    const p=heartPoint(i*Math.PI*2/80);
    assert.ok(Math.abs(heartField(p.x,p.y,0))<.001);
    assert.ok(Math.abs(heartField(-p.x,p.y,0))<.001);
    distances.push(Math.hypot(p.x,p.y-1.1));
  }
  assert.ok(Math.max(...distances)-Math.min(...distances)>2);
  assert.ok(SHOCKWAVE.travel<3);
  assert.ok(shockwaveRings(SHOCKWAVE.second*HEART.period)[1].strength<.5);
  assert.match(skyFragment,/heartEdgeDistance\(p\)/);
  assert.match(pointVertex,/heartRipple\(edgeDistance/);
});
