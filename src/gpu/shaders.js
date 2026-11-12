export const fullscreenVertex = `#version 300 es
precision highp float;
precision highp int;

void main() {
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2(3.0, -1.0),
    vec2(-1.0, 3.0)
  );
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`;

export const skyFragment = `#version 300 es
precision highp float;
precision highp int;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uUnit;
uniform float uTime;
uniform float uRays;
out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 p = (gl_FragCoord.xy - uCenter) / max(uUnit, 1.0);
  float radius = length(p);
  float angle = atan(p.y, p.x);
  float slow = uTime * 0.12;

  float aura = exp(-pow(radius / 16.0, 2.0));
  float outerMist = exp(-pow(radius / 31.0, 2.0));
  float breathing = 0.96 + 0.04 * sin(uTime * 1.2);

  float bandA = cos(angle * 25.0 + sin(angle * 7.0) * 0.95 + slow);
  float bandB = cos(angle * 41.0 - sin(angle * 12.0) * 0.75 - slow * 0.53);
  float bandC = cos(angle * 11.0 + slow * 0.18);

  float shafts =
      0.66 * pow(max(bandA, 0.0), 15.0) +
      0.42 * pow(max(bandB, 0.0), 26.0) +
      0.20 * pow(max(bandC, 0.0), 33.0);

  float outside = smoothstep(4.0, 11.0, radius);
  float distanceFade = exp(-radius * 0.032) *
      (1.0 - smoothstep(48.0, 90.0, radius));
  float ray = shafts * outside * distanceFade * uRays;

  vec3 color = vec3(0.045, 0.004, 0.022) * outerMist;
  color += vec3(0.16, 0.015, 0.079) * aura * breathing;
  color += vec3(0.37, 0.071, 0.185) * ray;
  color += vec3(0.016, 0.001, 0.011) *
      exp(-pow(radius / 44.0, 2.0));

  vec2 cell = gl_FragCoord.xy / 43.0;
  vec2 id = floor(cell);
  vec2 local = fract(cell) - 0.5;
  float starSeed = hash21(id);
  vec2 offset = vec2(hash21(id + 13.1), hash21(id + 52.7)) - 0.5;
  float star = (1.0 - smoothstep(0.015, 0.055, length(local - offset))) *
      step(0.985, starSeed);
  star *= 0.42 + 0.27 * sin(uTime * (0.7 + starSeed * 1.8) + starSeed * 32.0);
  color += star * vec3(0.37, 0.27, 0.38);

  fragColor = vec4(color, 1.0);
}
`;

export const particleVertex = `#version 300 es
precision highp float;
precision highp int;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aExtra;
layout(location = 2) in vec4 aAppearance;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uUnit;
uniform float uTime;
uniform float uZoom;
uniform float uRatio;
uniform float uBeat;
uniform vec2 uPan;
uniform int uPass;

out vec3 vColor;
out float vAlpha;
out float vSparkle;

void main() {
  float layer = aExtra.x;
  float seed = aExtra.y;
  float speed = aExtra.z;
  float size = aExtra.w;
  float brightness = aAppearance.x;
  float tone = aAppearance.y;
  float drift = aAppearance.z;
  float depth = aAppearance.w;

  vec2 point = aPosition * (1.0 + depth * 0.045);
  float time = uTime * 0.6;
  vec2 displacement = vec2(
    sin(time * speed + seed),
    cos(time * speed * 0.82 + seed)
  ) * drift;
  point += displacement;

  if (layer > 0.5 && layer < 1.5) {
    float radial = length(vec2(aPosition.x / 16.0, aPosition.y / 16.0));
    float envelope = 1.0 - smoothstep(0.33, 0.83, radial);
    point *= 1.0 + uBeat * (0.32 + 0.68 * envelope);
  }

  vec2 pixels = uCenter + vec2(point.x, -point.y) * uUnit * uZoom + uPan;
  vec2 projected = pixels / uResolution * 2.0 - 1.0;
  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = max(1.0, size * uRatio *
      pow(max(uZoom, 0.6), 0.69) * (uPass == 0 ? 7.2 : 3.25));

  float shimmer = 0.80 + 0.20 *
    sin(uTime * (1.8 + speed) + seed * 2.7);
  vAlpha = brightness * shimmer *
    (layer > 1.5 ? 0.69 : 1.0);
  vColor = mix(
    vec3(1.00, 0.37, 0.66),
    vec3(1.00, 0.76, 0.90),
    clamp(tone * 1.09, 0.0, 1.0)
  );
  vSparkle = smoothstep(1.55, 2.6, size);
}
`;

export const particleFragment = `#version 300 es
precision highp float;
precision highp int;

uniform int uPass;
in vec3 vColor;
in float vAlpha;
in float vSparkle;
out vec4 fragColor;

void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  float radial = dot(point, point);
  if (radial > 1.0) discard;

  if (uPass == 0) {
    float softness = exp(-radial * 3.7) *
      (1.0 - smoothstep(0.15, 1.0, radial));
    fragColor = vec4(
      vColor * (0.82 + 0.22 * vSparkle),
      vAlpha * softness * (0.22 + 0.18 * vSparkle)
    );
  } else {
    float bright = exp(-radial * 5.8);
    float alpha = (0.63 + 0.65 * bright) * vAlpha;
    vec3 tint = mix(vColor, vec3(1.0, 0.91, 0.95), 0.24 * vSparkle);
    fragColor = vec4(tint, alpha * bright);
  }
}
`;
