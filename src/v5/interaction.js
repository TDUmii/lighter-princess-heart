// Pure interaction state: shared by WebGL2, Canvas2D and browser tests.
export const INTERACTION = Object.freeze({
  hoverRadius: 122,
  magnetDistance: 6,
  tapMaxMs: 320,
  doubleTapMs: 340,
  doubleTapRadius: 44,
  dragCancelPx: 13,
  holdDelayMs: 150,
  fullChargeMs: 1050,
  chargeWaveMs: 1050,
  burstMs: 1450
});

export function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function magneticFalloff(distance, radius = INTERACTION.hoverRadius) {
  return radius > 0 && Number.isFinite(distance)
    ? 1 - smoothstep(Math.abs(distance) / radius)
    : 0;
}

export function burstEnvelope(elapsedMs) {
  if (elapsedMs < 0 || elapsedMs >= INTERACTION.burstMs) return 0;
  const p = elapsedMs / INTERACTION.burstMs;
  return Math.sin(Math.PI * p) ** 2;
}

export class HeartInteraction {
  constructor() {
    this.hover = { x: -10000, y: -10000, target: 0, strength: 0 };
    this.press = null;
    this.charge = 0;
    this.chargeWave = { started: -Infinity, strength: 0 };
    this.burstStarted = -Infinity;
    this.lastTap = null;
    this.burstCount = 0;
    this.chargeCount = 0;
  }

  moveHover(x, y, eligible, type = 'mouse') {
    this.hover.target = eligible && type !== 'touch' ? 1 : 0;
    if (this.hover.target) {
      this.hover.x = x;
      this.hover.y = y;
    }
  }

  start(pointerId, x, y, now, inside) {
    if (!inside || this.press) return;
    this.press = { pointerId, x, y, start: now, moved: false };
    this.charge = 0;
    this.hover.target = 0;
  }

  move(pointerId, x, y) {
    if (!this.press || this.press.pointerId !== pointerId) return;
    if (Math.hypot(x - this.press.x, y - this.press.y) > INTERACTION.dragCancelPx) {
      this.press.moved = true;
      this.charge = 0;
    }
  }

  cancel(pointerId) {
    if (!this.press || this.press.pointerId !== pointerId) return;
    this.press = null;
    this.charge = 0;
  }

  finish(pointerId, x, y, now, { cancelled = false, reduced = false } = {}) {
    const held = this.press;
    if (!held || held.pointerId !== pointerId) return null;
    this.press = null;
    const duration = now - held.start;
    const moved = held.moved || Math.hypot(x - held.x, y - held.y) > INTERACTION.dragCancelPx;
    const charge = this.charge;
    this.charge = 0;
    if (cancelled || moved || reduced) { this.lastTap = null; return null; }
    if (duration >= INTERACTION.holdDelayMs + 120 && charge >= .12) {
      this.chargeWave = { started: now, strength: .42 + .50 * charge };
      this.lastTap = null;
      this.chargeCount++;
      return 'charge';
    }
    if (duration <= INTERACTION.tapMaxMs) {
      const prev = this.lastTap;
      if (prev && now - prev.time <= INTERACTION.doubleTapMs
          && Math.hypot(x - prev.x, y - prev.y) <= INTERACTION.doubleTapRadius) {
        this.burstStarted = now;
        this.burstCount++;
        this.lastTap = null;
        return 'burst';
      }
      this.lastTap = { x, y, time: now };
    }
    return null;
  }

  frame(deltaMs, now, reduced = false) {
    if (reduced) {
      this.hover.target = 0;
      this.hover.strength = 0;
      this.charge = 0;
      return;
    }
    const lambda = 1 - Math.exp(-Math.max(0, deltaMs) / (this.hover.target ? 110 : 180));
    this.hover.strength += (this.hover.target - this.hover.strength) * lambda;
    if (this.hover.strength < .001 && !this.hover.target) this.hover.strength = 0;
    if (this.press && !this.press.moved) {
      this.charge = smoothstep((now - this.press.start - INTERACTION.holdDelayMs)
        / (INTERACTION.fullChargeMs - INTERACTION.holdDelayMs));
    } else {
      this.charge = 0;
    }
    if (this.lastTap && now - this.lastTap.time > INTERACTION.doubleTapMs) this.lastTap = null;
  }

  state(now, reduced = false) {
    const elapsedWave = now - this.chargeWave.started;
    const chargeWave = !reduced && elapsedWave >= 0 && elapsedWave < INTERACTION.chargeWaveMs
      ? { progress: elapsedWave / INTERACTION.chargeWaveMs,
          strength: this.chargeWave.strength }
      : { progress: -1, strength: 0 };
    return {
      hover: {
        x: this.hover.x, y: this.hover.y,
        strength: reduced ? 0 : this.hover.strength,
        radius: INTERACTION.hoverRadius
      },
      charge: reduced ? 0 : this.charge,
      chargeWave,
      burst: reduced ? 0 : burstEnvelope(now - this.burstStarted)
    };
  }
}
