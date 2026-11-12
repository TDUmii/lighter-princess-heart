import { createParticleCloud, PARTICLE_STRIDE } from './art/particles.js';

export class CanvasFallback {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('2D canvas is unavailable');
    this.count = 0;
    this.particles = null;
    this.ratio = 1;
    this.width = 0;
    this.height = 0;
  }

  resize(width, height, ratio, count) {
    this.width = width;
    this.height = height;
    this.ratio = Math.min(ratio, 1.2);
    this.canvas.width = Math.round(width * this.ratio);
    this.canvas.height = Math.round(height * this.ratio);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    const amount = Math.min(count, width < 650 ? 2600 : 4600);
    if (this.count !== amount) {
      const cloud = createParticleCloud(amount);
      this.particles = cloud.data;
      this.count = amount;
      this.stats = cloud.counts;
    }
  }

  render({ seconds, unit, zoom, panX, panY, beat, rays = .78 }) {
    const ctx = this.context;
    const width = this.width;
    const height = this.height;
    const centerX = width * .5 + panX;
    const centerY = height * .5 - unit * 1.8 + panY;

    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    const glow = ctx.createRadialGradient(0, 0, unit, 0, 0, unit * 31);
    glow.addColorStop(0, 'rgba(240,43,132,.11)');
    glow.addColorStop(.55, 'rgba(116,17,62,.035)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, unit * 31, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 32; i++) {
      const angle = i * (Math.PI * 2 / 32) + .12 * Math.sin(i * 2.7 + seconds * .07);
      const length = unit * (17 + 15 * Math.abs(Math.sin(i * 6.3)));
      ctx.strokeStyle = 'rgba(240,72,152,' + (0.018 * rays) + ')';
      ctx.lineWidth = unit * (0.2 + (i % 3) * .13);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * unit * 5, Math.sin(angle) * unit * 5);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
    }

    const points = this.particles;
    const t = seconds * .6;
    for (let i = 0; i < points.length; i += PARTICLE_STRIDE) {
      const layer = points[i + 2];
      const seed = points[i + 3];
      const speed = points[i + 4];
      const size = points[i + 5];
      const alpha = points[i + 6];
      const tone = points[i + 7];
      const drift = points[i + 8];
      const depth = points[i + 9];
      const motionX = Math.sin(t * speed + seed) * drift;
      const motionY = Math.cos(t * speed * .82 + seed) * drift;
      let x = (points[i] * (1 + depth * .045) + motionX);
      let y = (points[i + 1] * (1 + depth * .045) + motionY);
      if (layer === 1) {
        const radius = Math.hypot(points[i] / 16, points[i + 1] / 16);
        const envelope = Math.max(0, 1 - radius);
        const sizeMultiplier = 1 + beat * (0.32 + 0.68 * envelope);
        x *= sizeMultiplier;
        y *= sizeMultiplier;
      }
      const intensity = .80 + .20 * Math.sin(seconds * (1.8 + speed) + seed * 2.7);
      const red = 255;
      const green = Math.round(70 + 70 * tone);
      const blue = Math.round(132 + 67 * tone);
      ctx.globalAlpha = alpha * intensity;
      ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
      const px = x * unit;
      const py = y * unit;
      const pointSize = Math.max(.55, size * .91);
      ctx.fillRect(px - pointSize / 2, py - pointSize / 2, pointSize, pointSize);
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  dispose() {}
}
