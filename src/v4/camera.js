export const ORBIT = Object.freeze({
  initialYaw: -0.26,
  initialPitch: 0.10,
  minPitch: -1.12,
  maxPitch: 1.12,
  perspectiveDistance: 72,
  autoSpeed: 0.095,
  dragSensitivity: 0.0075
});

export const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export function rotatePoint(x, y, z, yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const turnedX = x * cy + z * sy;
  const turnedZ = -x * sy + z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return {
    x: turnedX,
    y: y * cp - turnedZ * sp,
    z: y * sp + turnedZ * cp
  };
}

export function perspectiveScale(z) {
  return ORBIT.perspectiveDistance /
    (ORBIT.perspectiveDistance - clamp(z, -40, 40));
}

export function roundedHeartTip(x, y) {
  const t = clamp((y - 7.0) / 10.0, 0, 1);
  const roundness = t * t * (3 - 2 * t);
  return x + Math.sign(x) * roundness * Math.sqrt(Math.abs(x) / 16) * 0.5;
}
