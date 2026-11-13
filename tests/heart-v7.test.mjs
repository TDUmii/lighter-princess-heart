import test from 'node:test';
import assert from 'node:assert/strict';
import { HeartInteraction, INTERACTION, magneticFalloff } from '../src/v5/interaction.js';

const near=(a,b,epsilon=.000001)=>assert.ok(Math.abs(a-b)<epsilon,
  `Expected ${a} near ${b}`);

test('magnet is strongest near the cursor and settles when leaving',()=>{
  near(magneticFalloff(0,120),1);
  near(magneticFalloff(60,120),.5);
  near(magneticFalloff(120,120),0);
  near(magneticFalloff(300,120),0);
  const active=new HeartInteraction();
  active.moveHover(150,200,true,'mouse');
  active.frame(150,150);
  assert.ok(active.hover.strength>.65);
  active.moveHover(0,0,false,'mouse');
  active.frame(900,1100);
  assert.ok(active.hover.strength<.01);
  active.moveHover(200,200,true,'touch');
  assert.equal(active.hover.target,0);
});

test('hold charges core and releases a finite extra heart wave',()=>{
  const engine=new HeartInteraction();
  engine.start(1,150,200,1000,true);
  engine.frame(600,1600);
  assert.ok(engine.charge>.25);
  const result=engine.finish(1,150,200,1610);
  assert.equal(result,'charge');
  assert.equal(engine.chargeCount,1);
  assert.equal(engine.charge,0);
  const wave=engine.state(1700).chargeWave;
  assert.ok(wave.progress>0 && wave.progress<1);
  assert.ok(wave.strength>.5);
  assert.equal(engine.state(2800).chargeWave.progress,-1);
});

test('repeated taps including double and triple taps trigger no special event',()=>{
  const engine=new HeartInteraction();
  for(const [index,time] of [100,235,370,505,640].entries()){
    engine.start(index+1,150,200,time,true);
    assert.equal(engine.finish(index+1,150,200,time+45),null);
    assert.equal(engine.chargeCount,0);
    assert.equal(engine.state(time+45).charge,0);
    assert.equal(engine.state(time+45).chargeWave.strength,0);
  }
  assert.equal('burst' in engine.state(800),false);
  assert.equal('burstCount' in engine,false);
  assert.equal('lastTap' in engine,false);
});

test('drag, cancelled gestures and multitouch never release a charge',()=>{
  const engine=new HeartInteraction();
  engine.start(1,150,200,0,true);
  engine.move(1,180,200);
  engine.frame(1100,1100);
  assert.equal(engine.finish(1,180,200,1101),null);
  assert.equal(engine.chargeCount,0);
  engine.start(2,150,200,1300,true);
  engine.frame(800,2100);
  engine.cancel(2);
  assert.equal(engine.finish(2,150,200,2110),null);
  assert.equal(engine.charge,0);
  assert.equal(engine.state(2100,true).charge,0);
});

test('short tap does not trigger hold; long hold in reduced motion is inert',()=>{
  const engine=new HeartInteraction();
  engine.start(1,150,200,0,true);
  engine.frame(80,80);
  assert.equal(engine.finish(1,150,200,85),null);
  assert.equal(engine.chargeCount,0);
  engine.start(2,150,200,1000,true);
  engine.frame(1100,2100,true);
  assert.equal(engine.finish(2,150,200,2110,{reduced:true}),null);
  assert.equal(engine.chargeCount,0);
});
