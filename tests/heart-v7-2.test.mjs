import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityFor, HEART } from '../src/v5/config.js';
import { heartField } from '../src/v5/geometry.js';
import { createParticleSystems, STRIDE } from '../src/v5/particles.js';
import { pointVertex } from '../src/v5/shaders.js';

test('V7.2 doubles flight coverage without greatly increasing total particles', () => {
  const desktop=qualityFor(1280,800,2,2);
  const mobile=qualityFor(393,852,2,2);
  assert.ok(desktop.burst >= 2500);
  assert.ok(mobile.burst >= 1100);
  assert.ok(desktop.burst > 1250*2);
  assert.ok(mobile.burst > 520*2);
  assert.ok(desktop.core+desktop.shell+desktop.rim+desktop.burst <= 22000);
  assert.ok(mobile.core+mobile.shell+mobile.rim+mobile.burst <= 9500);
  assert.ok(HEART.burstTravel>5.3 && HEART.burstTravel<7);
});

test('flight uses balanced, independently seeded, front-facing microdust', () => {
  const sys=createParticleSystems(qualityFor(1280,800,2,2));
  const {first,count}=sys.layers.burst;
  let dust=0, mirrored=0, middle=0, sumX=0, positiveX=0, negativeX=0;
  const quadrants=[0,0,0,0];
  for(let i=first;i<first+count;i++){
    const o=i*STRIDE, a=sys.data;
    const x=a[o],y=a[o+1],z=a[o+2];
    const kind=a[o+3], nx=a[o+8],ny=a[o+9],nz=a[o+12];
    assert.ok(kind>1.5 && kind<2.5);
    assert.ok(Math.abs(heartField(x,y,z))<.002 || heartField(x,y,z)<0);
    assert.ok(Number.isFinite(nx+ny+nz));
    assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<.0002);
    if(kind>2.1){dust++;assert.ok(z>=0);}
    if(Math.hypot(x,y-1.1)<8) middle++;
    if(x>0)positiveX++; else negativeX++;
    sumX+=nx;
    quadrants[(x>=0?1:0)+(y>=1.1?2:0)]++;
    if(i>first && (i-first)%2===1){
      const prev=o-STRIDE;
      if(Math.abs(a[prev]+x)<.0001 &&
        Math.abs(a[prev+1]-y)<.0001 &&
        Math.abs(a[prev+2]-z)<.0001)mirrored++;
    }
  }
  assert.ok(dust/count>.36 && dust/count<.52,`Dust ratio ${dust/count}`);
  assert.ok(middle/count>.10,`Middle coverage ${middle/count}`);
  assert.ok(positiveX/count>.40 && negativeX/count>.40);
  assert.ok(Math.abs(sumX/count)<.1);
  assert.ok(quadrants.every(n=>n>count*.12),JSON.stringify(quadrants));
  assert.ok(mirrored<3,`Found ${mirrored} mirrored pairs`);
});

test('WebGL2 and Canvas2D share the soft bloom duration and travel range', async () => {
  const {flightDistance}=await import('../src/v5/heartbeat.js');
  const {CanvasRenderer}=await import('../src/v5/fallback.js');
  assert.match(pointVertex,/float inhale/);
  assert.match(pointVertex,/mix\(\.70,1\.15,organic\)/);
  assert.match(pointVertex,/kind>2\.1 \? \.72/);
  assert.match(CanvasRenderer.prototype.render.toString(),/distance\*\(\.70\+\.45\*organic\)/);
  assert.ok(flightDistance(.65,.075)>0);
});
