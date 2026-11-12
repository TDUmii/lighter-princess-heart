export function particlePosition(particle, seconds, unit) {
  const ambient = seconds * 0.6;
  const driftX = Math.sin(ambient * particle.speed + particle.seed) * particle.drift;
  const driftY = Math.cos(ambient * particle.speed * 0.82 + particle.seed) * particle.drift;
  const depthScale = 1 + particle.depth * 0.045;
  return {
    x: (particle.x + driftX) * depthScale * unit,
    y: (particle.y + driftY) * depthScale * unit
  };
}

export function particleOpacity(particle, seconds) {
  const flicker = 0.77 + 0.23 * Math.sin(
    seconds * (1.8 + particle.speed) + particle.seed * 2.7
  );
  return particle.alpha * flicker;
}
