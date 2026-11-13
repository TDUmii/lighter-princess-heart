// Lightweight cursor dust in an independent transparent overlay.
// Rendering stays capped; no GPU buffer rebuilds or layout changes.
export class StardustTrail {
  constructor(heartCanvas) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'stardust-trail';
    this.canvas.setAttribute('aria-hidden', 'true');
    heartCanvas.insertAdjacentElement('afterend', this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.max = 86;
    this.lastEmit = -Infinity;
    this.lastX = -10000;
    this.lastY = -10000;
    this.width = 1;
    this.height = 1;
    this.ratio = 1;

    this.sprite = document.createElement('canvas');
    this.sprite.width = this.sprite.height = 32;
    const ctx = this.sprite.getContext('2d');
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(255,238,248,1)');
    glow.addColorStop(.14, 'rgba(255,178,211,.86)');
    glow.addColorStop(.38, 'rgba(255,99,162,.25)');
    glow.addColorStop(1, 'rgba(255,99,162,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 32, 32);
  }

  resize(width, height, ratio = 1) {
    this.width = width;
    this.height = height;
    this.ratio = Math.min(1.5, ratio);
    this.max = width < 640 ? 48 : 86;
    this.canvas.width = Math.max(1, Math.round(width * this.ratio));
    this.canvas.height = Math.max(1, Math.round(height * this.ratio));
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  emit(x, y, now, enabled) {
    if (!enabled || !this.ctx) return;
    if (now - this.lastEmit < 23 || Math.hypot(x - this.lastX, y - this.lastY) < 5) return;
    this.lastEmit = now;
    this.lastX = x;
    this.lastY = y;
    const count = this.width < 640 ? 1 : 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = .008 + Math.random() * .025;
      const lifetime = 540 + Math.random() * 320;
      this.particles.push({
        x: x + (Math.random() - .5) * 13,
        y: y + (Math.random() - .5) * 13,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .011,
        start: now, lifetime, size: 2.9 + Math.random() * 3.6
      });
    }
    if (this.particles.length > this.max)
      this.particles.splice(0, this.particles.length - this.max);
  }

  draw(now, delta, reduced = false) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    if (reduced) {
      this.particles.length = 0;
      return;
    }
    ctx.globalCompositeOperation = 'lighter';
    const dt = Math.min(60, Math.max(0, delta));
    let kept = 0;
    for (const p of this.particles) {
      const age = now - p.start;
      if (age >= p.lifetime) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const fade = (1 - age / p.lifetime) ** 1.5;
      ctx.globalAlpha = .78 * fade;
      const size = p.size * (.7 + .3 * fade);
      ctx.drawImage(this.sprite, p.x - size * 2, p.y - size * 2, size * 4, size * 4);
      this.particles[kept++] = p;
    }
    this.particles.length = kept;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
