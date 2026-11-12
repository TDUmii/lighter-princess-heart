import { createParticleCloud, PARTICLE_STRIDE } from './art/particles.js';
import { deformPoint } from './art/deformation.js';

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
    this.sprite = document.createElement('canvas');
    this.sprite.width = this.sprite.height = 48;
    const brush = this.sprite.getContext('2d');
    brush.fillStyle = '#ff4662';
    brush.beginPath();
    brush.moveTo(24, 40);
    brush.bezierCurveTo(16, 34, 5, 27, 5, 16);
    brush.bezierCurveTo(5, 7, 16, 3, 24, 13);
    brush.bezierCurveTo(32, 3, 43, 7, 43, 16);
    brush.bezierCurveTo(43, 27, 32, 34, 24, 40);
    brush.fill();
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

  render({ seconds, unit, zoom, panX, panY, beat, rays = .34 }) {
    const ctx = this.context;
    const width = this.width;
    const height = this.height;
    const centerX = width * .5 + panX;
    const centerY = height * .5 - unit * 2.0 + panY;

    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);

    const glow = ctx.createRadialGradient(0, -unit, unit * 3, 0, 0, unit * 30);
    glow.addColorStop(0, 'rgba(134,10,20,.085)');
    glow.addColorStop(.54, 'rgba(88,5,13,.028)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, unit * 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8 + Math.sin(i * 1.8) * .08;
      const length = unit * (23 + 7 * Math.abs(Math.sin(i * 6.3)));
      const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * length, Math.sin(angle) * length);
      grad.addColorStop(0, 'rgba(85,6,14,0)');
      grad.addColorStop(.45, 'rgba(95,6,16,' + (0.018 * rays) + ')');
      grad.addColorStop(1, 'rgba(80,2,8,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = unit * 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * unit * 10, Math.sin(angle) * unit * 10);
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      ctx.stroke();
    }

    const points = this.particles;
    const time = seconds * .55;
    for (let i = 0; i < points.length; i += PARTICLE_STRIDE) {
      const seed = points[i + 3];
      const speed = points[i + 4];
      const size = points[i + 5];
      const alpha = points[i + 6];
      const tone = points[i + 7];
      const drift = points[i + 8];
      const depth = points[i + 9];

      const motionX = Math.sin(time * speed + seed) * drift;
      const motionY = Math.cos(time * speed * .82 + seed) * drift;
      let x = points[i] * (1 + depth * .045) + motionX;
      let y = points[i + 1] * (1 + depth * .045) + motionY;

      const position = deformPoint(x, y, beat);
      x = position.x;
      y = position.y;

      const flicker = .86 + .14 * Math.sin(seconds * (1.45 + speed) + seed * 2.4);
      const red = Math.round(200 + 55 * tone);
      const green = Math.round(7 + 39 * tone);
      const blue = Math.round(14 + 34 * tone);
      ctx.globalAlpha = alpha * flicker;
      ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
      const px = x * unit * .80;
      const py = y * unit * .88;
      if (points[i + 2] < 1.5) {
        const heartSize = Math.max(1.6, size * 2.75);
        ctx.drawImage(this.sprite, px - heartSize / 2, py - heartSize / 2, heartSize, heartSize);
      } else {
        const pixelSize = Math.max(.55, size * .9);
        ctx.fillRect(px - pixelSize / 2, py - pixelSize / 2, pixelSize, pixelSize);
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  dispose() {}
}
