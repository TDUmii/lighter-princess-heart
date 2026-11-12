import { COLORS, HEART } from './config.js';
import { insidePoint, outlinePoint, seededRandom } from './geometry.js';

function makeCanvas(unit, pixelRatio) {
  const cssSize = unit * 43;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(cssSize * pixelRatio);
  canvas.height = Math.ceil(cssSize * pixelRatio);
  const context = canvas.getContext('2d', { alpha: true });
  context.setTransform(
    pixelRatio, 0, 0, pixelRatio,
    canvas.width / 2, canvas.height / 2
  );
  context.globalCompositeOperation = 'lighter';
  return { canvas, context, size: cssSize };
}

function makeGlowSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = 48;
  sprite.height = 48;
  const context = sprite.getContext('2d');
  const glow = context.createRadialGradient(24, 24, 0, 24, 24, 24);
  glow.addColorStop(0, 'rgba(255,218,238,0.9)');
  glow.addColorStop(0.14, 'rgba(255,122,187,0.46)');
  glow.addColorStop(0.5, 'rgba(246,57,139,0.10)');
  glow.addColorStop(1, 'rgba(255,50,131,0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 48, 48);
  return sprite;
}

const glowSprite = makeGlowSprite();

function drawParticle(context, random, x, y, unit, shell) {
  const bright = random();
  const big = bright > 0.984;
  const size = (big ? 1.35 + random() * 1.35 : 0.42 + random() * 1.05)
    * Math.max(0.70, unit / 18);
  const alpha = shell
    ? 0.26 + random() * 0.53
    : 0.29 + random() * 0.55;

  if (big) {
    const glowSize = size * (shell ? 7 : 8);
    context.globalAlpha = alpha * 0.63;
    context.drawImage(
      glowSprite,
      x - glowSize / 2, y - glowSize / 2,
      glowSize, glowSize
    );
  }

  context.fillStyle = COLORS[Math.floor(random() * COLORS.length)];
  context.globalAlpha = alpha;
  context.fillRect(x - size / 2, y - size / 2, size, size);
}

function makeShell(unit, quality) {
  const layer = makeCanvas(unit, quality.pixelRatio);
  const random = seededRandom(81021);
  const context = layer.context;

  for (let i = 0; i < quality.shellParticles; i++) {
    const point = outlinePoint(random);
    const category = random();
    let radius;
    let jitter;

    if (category < 0.16) {
      radius = 1.055 + Math.pow(random(), 1.65) * 0.16;
      jitter = 0.22;
    } else if (category < 0.69) {
      radius = 0.962 + random() * HEART.shellThickness;
      jitter = 0.24;
    } else {
      radius = 0.982 + random() * 0.041;
      jitter = 0.09;
    }

    const x = (point.x * radius + (random() - 0.5) * jitter) * unit;
    const y = (point.y * radius + (random() - 0.5) * jitter) * unit;
    drawParticle(context, random, x, y, unit, true);
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  return layer;
}

function makeCore(unit, quality) {
  const layer = makeCanvas(unit, quality.pixelRatio);
  const context = layer.context;
  const random = seededRandom(291104);

  const glow = context.createRadialGradient(0, -unit, unit * 2,
    0, -unit, unit * 16);
  glow.addColorStop(0, 'rgba(243,45,142,0.075)');
  glow.addColorStop(0.75, 'rgba(230,35,120,0.025)');
  glow.addColorStop(1, 'rgba(230,35,120,0)');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(0, 0, unit * 16, 0, Math.PI * 2);
  context.fill();

  for (let i = 0; i < quality.coreParticles; i++) {
    const point = insidePoint(random);
    const depth = 0.92 + random() * 0.13;
    const x = point.x * HEART.coreSize * depth * unit;
    const y = point.y * HEART.coreSize * depth * unit;
    drawParticle(context, random, x, y, unit, false);
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  return layer;
}

function makeTwinkles(unit, count) {
  const random = seededRandom(65189);
  return Array.from({ length: count }, () => {
    const point = insidePoint(random);
    return {
      x: point.x * HEART.coreSize * unit,
      y: point.y * HEART.coreSize * unit,
      phase: random() * Math.PI * 2,
      speed: 1.8 + random() * 2.5,
      radius: 0.48 + random() * 1.14
    };
  });
}

export function buildLayers(unit, quality) {
  return {
    shell: makeShell(unit, quality),
    core: makeCore(unit, quality),
    twinkles: makeTwinkles(unit, quality.shimmerParticles)
  };
}

export function drawTwinkles(context, points, seconds, unit) {
  context.fillStyle = '#ffe0f0';
  const sizeRatio = Math.max(0.7, unit / 18);

  for (const point of points) {
    const flicker = Math.pow(
      Math.max(0, Math.sin(seconds * point.speed + point.phase)), 4
    );
    if (flicker < 0.06) continue;

    const size = point.radius * sizeRatio;
    context.globalAlpha = flicker * 0.74;
    context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
  }

  context.globalAlpha = 1;
}
