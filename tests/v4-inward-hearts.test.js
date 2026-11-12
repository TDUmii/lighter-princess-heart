import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { HEART } from '../src/v4/config.js';
import {
  FLIGHT, flightProgress, flightDistance, flightOpacity,
  burstStrength,returnStrength,returnDistance,heartbeat,beatPhase,
  deformScale
} from '../src/v4/heartbeat.js';
import { pointVertex } from '../src/v4/shaders.js';
import { createParticleSystems, STRIDE } from '../src/v4/particles.js';

const close = (a,b,tol=1e-8) => assert.ok(Math.abs(a-b)<tol,`Expected ${a} ≈ ${b}`);

test('one continuous flight: outward and inward travel exactly the same distance',()=>{
  assert.equal(FLIGHT.leg,.445);
  assert.equal(HEART.burstTravel,6.0);
  assert.ok(FLIGHT.start-FLIGHT.stagger*.075>.2);
  assert.ok(FLIGHT.start+2*FLIGHT.leg+FLIGHT.stagger*.075<1.2);

  for(const delay of [0,.025,.075,.12,.15]){
    const shift=(delay-.075)*FLIGHT.stagger;
    const launch=FLIGHT.start+shift;
    const peak=launch+FLIGHT.leg;
    const arrival=peak+FLIGHT.leg;
    const phase=(t)=>t>=1?t-1:t;
    close(flightDistance(phase(launch),delay),0);
    close(flightDistance(phase(peak),delay),HEART.burstTravel);
    close(flightDistance(phase(arrival),delay),0);

    for(const fraction of [.1,.25,.5,.75,.9]){
      const outgoing=phase(launch+FLIGHT.leg*fraction);
      const returning=phase(peak+FLIGHT.leg*(1-fraction));
      close(flightDistance(outgoing,delay),flightDistance(returning,delay),1e-7);
    }
  }
});

test('both travel legs have equal duration and smooth speed at the turn-around',()=>{
  const delay=.075;
  const launch=.245,peak=.690,finish=1.135;
  for(let k=0;k<50;k++){
    const t=(k+.5)/50;
    const outward=flightDistance(launch+t*FLIGHT.leg,delay);
    const backward=flightDistance((peak+(1-t)*FLIGHT.leg)%1,delay);
    close(outward,backward,1e-8);
  }
  const epsilon=1e-4;
  const before=flightDistance(peak-epsilon,delay);
  const after=flightDistance(peak+epsilon,delay);
  close(before,after,1e-7);
  assert.ok(flightOpacity(peak,delay)>.99);
  close(flightOpacity(launch,delay),0);
  close(flightOpacity(finish%1,delay),0);
});

test('flight remains continuous at the exact cycle boundary without respawning',()=>{
  for(const delay of [0,.025,.075,.12,.15]){
    const before=flightDistance(1-1e-6,delay);
    const after=flightDistance(1e-6,delay);
    close(before,after,.0001);
    close(flightOpacity(1-1e-6,delay),flightOpacity(1e-6,delay),.0001);
    assert.ok(returnStrength(.95,delay)>.5);
    assert.equal(returnStrength(.46,delay),0);
    assert.equal(burstStrength(.95,delay),0);
    assert.ok(flightProgress(.96,delay)<flightProgress(.02,delay));
  }
});

test('visible outbound movement is no smaller than visible inbound movement',()=>{
  for(const progress of [.2,.4,.6,.8]){
    const outgoing=.245+.445*progress;
    const arriving=(.690+.445*(1-progress))%1;
    const dOut=flightDistance(outgoing,.075);
    const dIn=returnDistance(arriving,.075);
    close(dOut,dIn);
    assert.ok(flightOpacity(outgoing,.075)>.25);
    assert.ok(flightOpacity(arriving,.075)>.05);
  }
  assert.ok(burstStrength(.49,.075)>.8);
  assert.ok(returnStrength(.95,.075)>.8);
  assert.equal(flightOpacity(.19,.075),0);
});

test('heart volume contracts and expands by equal magnitudes',()=>{
  const compressed=heartbeat(.15*HEART.period);
  const expanded=heartbeat(.32*HEART.period);
  close(compressed,-expanded);
  for(const kind of [0,1,2]){
    for(const radius of [0,.25,.75,1]){
      const contraction=deformScale(kind,radius,compressed);
      const expansion=deformScale(kind,radius,expanded);
      close(1-contraction,expansion-1);
    }
  }
  close(heartbeat(0),heartbeat(HEART.period));
  close(beatPhase(HEART.period*2),0);
});

test('GPU shader and Canvas2D fallback share exact easing and one flight path',()=>{
  const canvas=readFileSync(new URL('../src/v4/fallback.js',import.meta.url),'utf8');
  const renderer=readFileSync(new URL('../src/v4/renderer.js',import.meta.url),'utf8');
  assert.match(pointVertex,/float launch = \.245 \+ \(launchDelay-\.075\)\*\.50/);
  assert.match(pointVertex,/float progress = \(timeline-launch\)\/\.445/);
  assert.match(pointVertex,/float leg = progress <= 1\. \? progress : 2\.-progress/);
  assert.match(pointVertex,/travel = uBurstTravel \* eased/);
  assert.match(pointVertex,/p\.xyz \+= vec3\(normal,normalZ\)\*travel/);
  assert.doesNotMatch(pointVertex,/uReturnTravel|uReturnInset/);
  assert.match(canvas,/flightProgress\(phase,delay\)/);
  assert.match(canvas,/flightOpacity\(phase,delay\)/);
  assert.match(canvas,/flightDistance\(phase,delay\)/);
  assert.match(renderer,/uBurstTravel/);
  assert.doesNotMatch(renderer,/uReturnTravel|uReturnInset/);
});

test('flight particles are concentrated near the 3D silhouette for a visible release',()=>{
  const system=createParticleSystems({core:0,shell:0,burst:2000});
  let rim=0,positiveDepth=0,negativeDepth=0;
  for(let i=0;i<2000;i++){
    const o=i*STRIDE;
    const nx=system.data[o+8],ny=system.data[o+9],nz=system.data[o+12];
    if(Math.hypot(nx,ny)>.8)rim++;
    if(nz>.2)positiveDepth++;
    if(nz<-.2)negativeDepth++;
  }
  assert.ok(rim>1400);
  assert.ok(positiveDepth>350 && negativeDepth>350);
});

test('outward and inward hearts have equal sprite size and glow in WebGL',()=>{
  assert.match(pointVertex,/if\(kind>1\.5\)pointFactor \*= 1\.54/);
  assert.match(pointVertex,/vAlpha \*= 1\.17/);
  assert.doesNotMatch(pointVertex,/mix\(1\.35,1\.72,returning\)/);
  assert.doesNotMatch(pointVertex,/mix\(1\.04,1\.33,returning\)/);
});
