import { COLORS } from './config.js';
import { isInsideHeart, outlinePoint, seededRandom } from './geometry.js';
import { particlePosition, particleOpacity } from './motion.js';

const SIZE_IN_UNITS = 46;

function createSurface(unit, quality, detailZoom) {
  const size = unit * SIZE_IN_UNITS;
  const maxPixels = quality.mobile ? 1800 : 2560;
  const ratio = Math.min(
    quality.pixelRatio * Math.min(detailZoom, 2),
    quality.mobile ? 2.6 : 2.85,
    maxPixels / size
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(size * ratio));
  canvas.height = Math.max(1, Math.round(size * ratio));

  const context = canvas.getContext('2d', { alpha: true });
  context.setTransform(
    ratio, 0, 0, ratio,
    canvas.width / 2, canvas.height / 2
  );
  context.globalCompositeOperation = 'screen';

  return { canvas, context, size };
}

function createGlowSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = 56;
  sprite.height = 56;

  const context = sprite.getContext('2d');
  const gradient = context.createRadialGradient(28, 28, 0, 28, 28, 28);
  gradient.addColorStop(0, 'rgba(255,190,223,.92)');
  gradient.addColorStop(.17, 'rgba(255,123,181,.65)');
  gradient.addColorStop(.43, 'rgba(253,77,158,.15)');
  gradient.addColorStop(1, 'rgba(255,57,134,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 56, 56);

  return sprite;
}

const glowSprite = createGlowSprite();

function createParticle(kind, random) {
  const anchor = outlinePoint(random);
  let factor;

  if (kind === 'edge') factor = .968 + random() * .075;
  else if (kind === 'halo') factor = 1.015 + Math.pow(random(), 1.85) * .24;
  else factor = 1;

  const scatter = kind === 'halo' ? 1.12 : kind === 'edge' ? .14 : .35;
  let x = anchor.x * factor + (random() - .5) * scatter;
  let y = anchor.y * factor + (random() - .5) * scatter;

  if (kind === 'fill') {
    do {
      x = (random() * 2 - 1) * 15.95;
      y = random() * 29.2 - 12.1;
    } while (!isInsideHeart(x, y));
  }

  const depth = random() * 2 - 1;
  const glow = random();
  const particle = {
    kind,
    x,
    y,
    depth,
    glow,
    color: COLORS[Math.floor(random() * COLORS.length)],
    size: (kind === 'halo' ? .57 : .85) +
      Math.pow(random(), 2) * (glow > .965 ? 2.1 : 1.32),
    alpha: kind === 'halo' ? .12 + random() * .46 : .52 + random() * .45,
    seed: random() * Math.PI * 2,
    speed: .55 + random() * 1.4,
    drift: .12 + random() * (kind === 'halo' ? .64 : .21)
  };

  random();
  random();
  random();

  return particle;
}

function paintParticle(surface, particle, unit) {
  const context = surface.context;
  const frozenSeconds = 4.2;
  const movement = frozenSeconds * .6;
  const driftX = Math.sin(movement * particle.speed + particle.seed) * particle.drift;
  const driftY = Math.cos(movement * particle.speed * .82 + particle.seed) * particle.drift;
  const depthScale = 1 + particle.depth * .045;
  const x = (particle.x + driftX) * depthScale * unit;
  const y = (particle.y + driftY) * depthScale * unit;
  const flicker = .77 + .23 * Math.sin(
    frozenSeconds * (1.8 + particle.speed) + particle.seed * 2.7
  );
  const alpha = particle.alpha * flicker;

  if (particle.glow > .968 && particle.kind !== 'halo') {
    const glowSize = (5 + particle.glow * 8) * (unit / 16);
    context.globalAlpha = alpha * .7;
    context.drawImage(
      glowSprite,
      x - glowSize / 2, y - glowSize / 2,
      glowSize, glowSize
    );
  }

  context.globalAlpha = alpha;
  context.fillStyle = particle.color;
  const size = particle.size * Math.max(.70, unit / 16);
  context.fillRect(x - size / 2, y - size / 2, size, size);
}

function makeTwinkles(unit, count) {
  const random = seededRandom(8729);
  const points = [];

  for (let i = 0; i < count; i++) {
    let x;
    let y;
    do {
      x = (random() * 2 - 1) * 15.95;
      y = random() * 29.2 - 12.1;
    } while (!isInsideHeart(x / .83, y / .83));

    points.push({
      x: x * unit,
      y: y * unit,
      phase: random() * Math.PI * 2,
      speed: 1.35 + random() * 2.3,
      radius: .45 + random() * .72
    });
  }

  return points;
}

export function buildLayers(unit, quality, detailZoom = 1) {
  const shell = [];
  const core = createSurface(unit, quality, detailZoom);
  const random = seededRandom(20221104);

  for (let i = 0; i < quality.haloParticles; i++) {
    shell.push(createParticle('halo', random));
  }

  for (let i = 0; i < quality.fillParticles; i++) {
    const particle = createParticle('fill', random);
    const isCore = isInsideHeart(
      particle.x / .86,
      particle.y / .86
    );
    if (isCore) paintParticle(core, particle, unit);
    else shell.push(particle);
  }

  for (let i = 0; i < quality.edgeParticles; i++) {
    shell.push(createParticle('edge', random));
  }

  return {
    shell,
    core,
    twinkles: makeTwinkles(unit, quality.shimmerParticles)
  };
}

export function drawTwinkles(context, points, seconds, unit) {
  const density = Math.max(.7, unit / 16);
  context.fillStyle = '#ffd4ea';

  for (const point of points) {
    const light = Math.pow(
      Math.max(0, Math.sin(seconds * point.speed + point.phase)),
      5
    );
    if (light < .12) continue;

    context.globalAlpha = light * .46;
    const size = point.radius * density;
    context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
  }

  context.globalAlpha = 1;
}

export function drawShell(context, particles, seconds, unit) {
  const sizeRatio = Math.max(0.70, unit / 16);

  for (const particle of particles) {
    const point = particlePosition(particle, seconds, unit);
    const alpha = particleOpacity(particle, seconds);

    if (particle.glow > .968 && particle.kind !== 'halo') {
      const glowSize = (5 + particle.glow * 8) * (unit / 16);
      context.globalAlpha = alpha * .7;
      context.drawImage(
        glowSprite,
        point.x - glowSize / 2,
        point.y - glowSize / 2,
        glowSize, glowSize
      );
    }

    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    const size = particle.size * sizeRatio;
    context.fillRect(
      point.x - size / 2,
      point.y - size / 2,
      size, size
    );
  }

  context.globalAlpha = 1;
}