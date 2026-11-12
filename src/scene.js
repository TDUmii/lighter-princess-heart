import { ART, qualityFor, heartUnit } from './config.js';
import { pulseScale } from './art/heartbeat.js';
import { ParticleRenderer } from './gpu/renderer.js';
import { CanvasFallback } from './fallback.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class HeartScene {
  constructor(canvas, zoomLabel) {
    this.canvas = canvas;
    this.label = zoomLabel;
    this.secret = document.querySelector('#secret-message');
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.width = 1;
    this.height = 1;
    this.unit = 1;
    this.zoom = 1;
    this.targetZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.startedAt = performance.now();
    this.lastTap = -Infinity;
    this.lastFrame = this.startedAt;
    this.frameId = 0;
    this.resizeId = 0;
    this.pointers = new Map();
    this.pinch = null;
    this.quality = null;
    this.frameSamples = 0;
    this.sampleWindowStart = 0;
    this.qualityReduced = false;

    try {
      this.renderer = new ParticleRenderer(canvas);
      this.engine = 'WebGL2';
    } catch (error) {
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      this.canvas = replacement;
      this.renderer = new CanvasFallback(replacement);
      this.engine = 'Canvas2D';
      console.info('Using compatible canvas renderer:', error.message);
    }

    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
  }

  start() {
    this.resize();
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
    this.reduceMotion.addEventListener('change', () => {
      this.stop();
      this.draw(performance.now());
      this.resume();
    });

    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      const delta = clamp(event.deltaY, -180, 180);
      this.setZoom(this.targetZoom * Math.exp(-delta * .00145));
    }, { passive: false });

    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('dblclick', () => this.resetZoom());

    window.addEventListener('keydown', event => {
      if (event.target instanceof HTMLButtonElement) return;
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
    if (this.width === width && this.height === height && this.quality) return;

    this.width = width;
    this.height = height;
    this.unit = heartUnit(width, height);
    this.quality = qualityFor(width, height, window.devicePixelRatio || 1);
    this.renderer.resize(
      width, height, this.quality.pixelRatio, this.quality.count
    );
    this.draw(performance.now());
  }

  setZoom(value) {
    this.targetZoom = clamp(value, ART.zoomMin, ART.zoomMax);
    this.label.textContent = Math.round(this.targetZoom * 100) + '%';
    if (this.reduceMotion.matches) {
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

  onDown(event) {
    this.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });
    try { this.canvas.setPointerCapture(event.pointerId); } catch {}

    if (this.pointers.size === 2) {
      const [first, second] = this.pointers.values();
      this.pinch = {
        distance: Math.max(1, Math.hypot(
          first.x - second.x, first.y - second.y
        )),
        zoom: this.targetZoom
      };
    } else if (this.pointers.size === 1) {
      this.lastTap = performance.now();
    }
  }

  onMove(event) {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;
    this.pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });

    if (this.pointers.size === 2 && this.pinch) {
      const [first, second] = this.pointers.values();
      const distance = Math.hypot(
        first.x - second.x, first.y - second.y
      );
      this.setZoom(this.pinch.zoom * distance / this.pinch.distance);
    } else if (this.pointers.size === 1 && this.targetZoom > 1.04) {
      const maxX = this.unit * 19 * (this.targetZoom - 1);
      const maxY = this.unit * 20 * (this.targetZoom - 1);
      this.panX = clamp(
        this.panX + event.clientX - previous.x,
        -maxX, maxX
      );
      this.panY = clamp(
        this.panY + event.clientY - previous.y,
        -maxY, maxY
      );
      if (this.reduceMotion.matches) this.draw(performance.now());
    }
  }

  onUp(event) {
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

  resume() {
    if (document.hidden || this.reduceMotion.matches || this.frameId) return;
    this.lastFrame = performance.now();
    this.frameId = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  animate(now) {
    this.frameId = 0;
    const delta = clamp(now - this.lastFrame, 0, 80);
    this.lastFrame = now;
    const smoothing = 1 - Math.exp(-delta / 115);
    this.zoom += (this.targetZoom - this.zoom) * smoothing;
    if (Math.abs(this.zoom - this.targetZoom) < .001) {
      this.zoom = this.targetZoom;
    }

    this.draw(now);
    this.frameSamples++;

    if (!this.qualityReduced && this.engine === 'WebGL2') {
      if (!this.sampleWindowStart) this.sampleWindowStart = now;
      const time = now - this.sampleWindowStart;
      if (time > 5500) {
        if (this.frameSamples / (time / 1000) < 37) {
          this.qualityReduced = true;
          this.quality.pixelRatio = Math.max(
            .9, this.quality.pixelRatio * .78
          );
          this.renderer.resize(
            this.width, this.height, this.quality.pixelRatio,
            this.quality.count
          );
        } else {
          this.qualityReduced = true;
        }
      }
    }

    this.frameId = requestAnimationFrame(this.animate);
  }

  draw(now) {
    const reduced = this.reduceMotion.matches;
    const seconds = reduced ? 2.1 : (now - this.startedAt) / 1000;
    const sinceTap = (now - this.lastTap) / 1000;
    const beat = pulseScale(seconds, sinceTap, reduced) - 1;

    if (this.secret) {
      const amount = clamp((this.zoom - 2.45) / 0.85, 0, 1);
      if (amount <= 0.001) {
        if (this.secret.style.visibility !== 'hidden') {
          this.secret.style.visibility = 'hidden';
        }
      } else {
        this.secret.style.visibility = 'visible';
        this.secret.style.opacity = (amount * .9).toFixed(3);
        this.secret.style.left = (this.width * .5 + this.panX) + 'px';
        this.secret.style.top = (this.height * .5 - this.unit * 1.8 + this.panY) + 'px';
        this.secret.style.transform = 'translate(-50%, -50%) scale(' + (this.zoom * .68).toFixed(3) + ')';
      }
    }
    this.renderer.render({
      seconds, unit: this.unit,
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY,
      beat,
      rays: ART.rays
    });
  }
}
