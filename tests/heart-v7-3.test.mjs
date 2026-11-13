import test from 'node:test';
import assert from 'node:assert/strict';
import { traceMiniHeartPath, MINI_HEART } from '../src/v5/mini-heart.js';
import { HEART } from '../src/v5/config.js';
import { pointFragment, pointVertex } from '../src/v5/shaders.js';

test('mini-heart uses two rounded lobes, pronounced center cleft, pointed bottom', () => {
  const steps=[];
  const ctx={
    beginPath(){ steps.push(['begin']); },
    moveTo(...p){ steps.push(['move',...p]); },
    bezierCurveTo(...p){steps.push(['bezier',...p]);},
    closePath(){steps.push(['close']);}
  };
  traceMiniHeartPath(ctx);
  assert.deepEqual(steps[0],['begin']);
  assert.deepEqual(steps[1],['move',50,92]);
  assert.equal(steps.filter(s=>s[0]==='bezier').length,6);
  assert.deepEqual(steps.at(-1),['close']);
  const ends=steps.filter(s=>s[0]==='bezier').map(s=>s.slice(-2));
  assert.deepEqual(ends[2],[50,24]); // distinct cleft
  assert.deepEqual(ends.at(-1),[50,92]); // pointed tip
  assert.equal(ends[1][0] + ends[3][0],100); // symmetric top lobes
  assert.equal(MINI_HEART.cleftY,24);
  assert.ok(MINI_HEART.tipY-MINI_HEART.cleftY>60);
});

test('WebGL2 and Canvas2D use the same sprite silhouette without changing particle budgets', async () => {
  const { VolumeRenderer }=await import('../src/v5/renderer.js');
  const { CanvasRenderer }=await import('../src/v5/fallback.js');
  assert.match(VolumeRenderer.toString(),/createMiniHeartSprite\(128/);
  assert.match(CanvasRenderer.toString(),/createMiniHeartSprite\(96\)/);
  assert.match(pointFragment,/sampler2D uMiniHeart/);
  assert.match(pointFragment,/texture\(uMiniHeart, gl_PointCoord\)\.a/);
  assert.match(pointVertex,/pointSize = max\(pointSize,8\.0\*uRatio\)/);
  assert.equal(HEART.desktop.burst,3200);
  assert.equal(HEART.mobile.burst,1350);
});
