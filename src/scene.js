import { HEART, getQuality } from './config.js';
import { coreScale, easeOutCubic } from './heartbeat.js';
import { buildLayers, drawTwinkles } from './particles.js';

export class HeartScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.width = 0;
    this.height = 0;
    this.unit = 0;
    this.pixelRatio = 1;
    this.layers = null;
    this.frameId = 0;
    this.resizeId = 0;
    this.startedAt = performance.now();
    this.lastTouchAt = -Infinity;
    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
  }

  start() {
    if (!this.context) return;

    this.resize();
    this.canvas.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.reducedMotion.addEventListener('change', this.onMotionChange);
    this.resume();
  }

  onResize() {
    window.clearTimeout(this.resizeId);
    this.resizeId = window.setTimeout(() => this.resize(), 120);
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    if (width === this.width && height === this.height && this.layers) return;

    this.width = width;
    this.height = height;
    this.unit = Math.min(width / 40.6, height / 42, HEART.maxUnit);

    const quality = getQuality(width, height);
    this.pixelRatio = quality.pixelRatio;
    this.canvas.width = Math.round(width * this.pixelRatio);
    this.canvas.height = Math.round(height * this.pixelRatio);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.layers = buildLayers(this.unit, quality);
    this.draw(performance.now());
  }

  onPointerDown() {
    this.lastTouchAt = performance.now();
    if (this.reducedMotion.matches) this.draw(this.lastTouchAt);
  }

  onVisibility() {
    if (document.hidden) this.stop();
    else this.resume();
  }

  onMotionChange() {
    this.stop();
    this.draw(performance.now());
    this.resume();
  }

  resume() {
    if (!document.hidden && !this.reducedMotion.matches && !this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  animate(now) {
    this.frameId = 0;
    this.draw(now);
    this.resume();
  }

  draw(now) {
    if (!this.layers) return;

    const context = this.context;
    const seconds = (now - this.startedAt) / 1000;
    const reduced = this.reducedMotion.matches;
    const appearance = reduced ? 1 : easeOutCubic(seconds / 1.1);
    const scale = coreScale(
      seconds, (now - this.lastTouchAt) / 1000, reduced
    );
    const centerX = this.width / 2;
    const centerY = this.height * 0.51 - this.unit * 1.3;

    context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    context.fillStyle = HEART.background;
    context.fillRect(0, 0, this.width, this.height);

    context.save();
    context.translate(centerX, centerY);
    context.globalCompositeOperation = 'screen';

    const core = this.layers.core;
    const scaledSize = core.size * scale;
    context.globalAlpha = appearance;
    context.drawImage(core.canvas,
      -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize);

    if (!reduced) {
      context.save();
      context.scale(scale, scale);
      context.globalAlpha = appearance;
      drawTwinkles(context, this.layers.twinkles, seconds, this.unit);
      context.restore();
    }

    const shell = this.layers.shell;
    context.globalAlpha = appearance;
    context.drawImage(shell.canvas,
      -shell.size / 2, -shell.size / 2, shell.size, shell.size);

    context.restore();
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
  }
}
