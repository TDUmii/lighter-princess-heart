import { HEART, getQuality } from './config.js';
import { coreScale } from './heartbeat.js';
import { buildLayers, drawTwinkles, drawShell } from './particles.js';

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export class HeartScene {
  constructor(canvas, zoomLabel) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    this.zoomLabel = zoomLabel;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.width = 0;
    this.height = 0;
    this.unit = 0;
    this.quality = null;
    this.layers = null;
    this.frameId = 0;
    this.resizeId = 0;
    this.detailId = 0;
    this.startedAt = performance.now();
    this.lastTouchAt = -Infinity;
    this.lastFrameAt = this.startedAt;
    this.zoom = 1;
    this.targetZoom = 1;
    this.renderZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.pointers = new Map();
    this.pinch = null;

    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  start() {
    if (!this.context) return;

    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.reducedMotion.addEventListener('change', this.onMotionChange);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('dblclick', () => this.resetZoom());
    window.addEventListener('keydown', event => {
      if (event.key === '+' || event.key === '=') this.zoomIn();
      if (event.key === '-') this.zoomOut();
      if (event.key === '0') this.resetZoom();
    });
    this.resume();
  }

  onResize() {
    clearTimeout(this.resizeId);
    this.resizeId = setTimeout(() => this.resize(), 120);
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    if (width === this.width && height === this.height && this.layers) return;

    this.width = width;
    this.height = height;
    this.unit = Math.min(width * .0275, height * .0235, HEART.maxUnit);
    this.quality = getQuality(width, height);
    const ratio = this.quality.pixelRatio;

    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.layers = buildLayers(this.unit, this.quality, this.renderZoom);
    this.draw(performance.now());
  }

  setZoom(value) {
    this.targetZoom = clamp(value, HEART.minZoom, HEART.maxZoom);
    this.zoomLabel.textContent = Math.round(this.targetZoom * 100) + '%';

    if (this.targetZoom > this.renderZoom + .35) {
      clearTimeout(this.detailId);
      this.detailId = setTimeout(() => {
        this.renderZoom = Math.min(2, this.targetZoom);
        this.layers = buildLayers(this.unit, this.quality, this.renderZoom);
      }, 220);
    }

    if (this.reducedMotion.matches) {
      this.zoom = this.targetZoom;
      this.draw(performance.now());
    }
  }

  zoomIn() {
    this.setZoom(this.targetZoom * 1.24);
  }

  zoomOut() {
    this.setZoom(this.targetZoom / 1.24);
  }

  resetZoom() {
    this.panX = 0;
    this.panY = 0;
    this.setZoom(1);
  }

  onWheel(event) {
    event.preventDefault();
    const factor = Math.exp(-clamp(event.deltaY, -160, 160) * .0014);
    this.setZoom(this.targetZoom * factor);
  }

  onPointerDown(event) {
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.canvas.setPointerCapture(event.pointerId);

    if (this.pointers.size === 2) {
      const [first, second] = [...this.pointers.values()];
      this.pinch = {
        distance: Math.max(1, Math.hypot(first.x - second.x, first.y - second.y)),
        zoom: this.targetZoom
      };
    } else if (this.pointers.size === 1) {
      this.lastTouchAt = performance.now();
    }

    if (this.reducedMotion.matches) this.draw(performance.now());
  }

  onPointerMove(event) {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;

    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 2 && this.pinch) {
      const [first, second] = [...this.pointers.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      this.setZoom(this.pinch.zoom * distance / this.pinch.distance);
    } else if (this.pointers.size === 1 && this.targetZoom > 1.06) {
      const maxX = this.unit * 19 * (this.targetZoom - 1);
      const maxY = this.unit * 18 * (this.targetZoom - 1);
      this.panX = clamp(this.panX + event.clientX - previous.x, -maxX, maxX);
      this.panY = clamp(this.panY + event.clientY - previous.y, -maxY, maxY);
      if (this.reducedMotion.matches) this.draw(performance.now());
    }
  }

  onPointerUp(event) {
    this.pointers.delete(event.pointerId);
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
    this.pinch = null;
  }

  onVisibility() {
    if (document.hidden) this.stop();
    else this.resume();
  }

  onMotionChange() {
    this.stop();
    this.zoom = this.targetZoom;
    this.draw(performance.now());
    this.resume();
  }

  resume() {
    if (!document.hidden && !this.reducedMotion.matches && !this.frameId) {
      this.lastFrameAt = performance.now();
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  animate(now) {
    this.frameId = 0;
    const delta = Math.min(80, Math.max(0, now - this.lastFrameAt));
    this.lastFrameAt = now;

    const smoothing = 1 - Math.exp(-delta / 95);
    this.zoom += (this.targetZoom - this.zoom) * smoothing;
    if (Math.abs(this.zoom - this.targetZoom) < .001) this.zoom = this.targetZoom;

    this.draw(now);
    this.frameId = requestAnimationFrame(this.animate);
  }

  draw(now) {
    if (!this.layers) return;

    const context = this.context;
    const seconds = (now - this.startedAt) / 1000;
    const reduced = this.reducedMotion.matches;
    const fade = 1;
    const beat = coreScale(seconds, (now - this.lastTouchAt) / 1000, reduced);
    const ratio = this.quality.pixelRatio;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = HEART.background;
    context.fillRect(0, 0, this.width, this.height);

    context.save();
    context.translate(
      this.width * .5 + this.panX,
      this.height * .5 - this.unit * 1.8 + this.panY
    );
    context.scale(this.zoom, this.zoom);
    context.globalCompositeOperation = 'screen';
    context.globalAlpha = fade;

    const core = this.layers.core;
    context.save();
    context.scale(beat, beat);
    context.drawImage(core.canvas, -core.size / 2, -core.size / 2, core.size, core.size);
    if (!reduced) drawTwinkles(context, this.layers.twinkles, seconds, this.unit);
    context.restore();

    drawShell(context, this.layers.shell, reduced ? 4.2 : seconds, this.unit);

    context.restore();
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }
}
