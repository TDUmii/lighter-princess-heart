// A single crisp mini-heart silhouette shared by WebGL2 and Canvas2D.
// Symmetric rounded lobes, a visible V-shaped cleft, and a clean pointed tip.
export const MINI_HEART = Object.freeze({
  width: 100,
  height: 100,
  centerX: 50,
  cleftY: 24,
  tipY: 92
});

export function traceMiniHeartPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(50, 92);
  ctx.bezierCurveTo(37, 83, 9, 60, 8, 34);
  ctx.bezierCurveTo(7, 15, 20, 7, 35, 10);
  ctx.bezierCurveTo(43, 10, 48, 16, 50, 24);
  ctx.bezierCurveTo(52, 16, 57, 10, 65, 10);
  ctx.bezierCurveTo(80, 7, 93, 15, 92, 34);
  ctx.bezierCurveTo(91, 60, 63, 83, 50, 92);
  ctx.closePath();
}

export function createMiniHeartSprite(size = 96, fill = '#ff92b5') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Mini-heart canvas unavailable');
  ctx.scale(size / MINI_HEART.width, size / MINI_HEART.height);
  ctx.fillStyle = fill;
  traceMiniHeartPath(ctx);
  ctx.fill();
  return canvas;
}
