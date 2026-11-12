import { createParticleCloud, PARTICLE_STRIDE } from '../art/particles.js';
import { fullscreenVertex, skyFragment, particleVertex, particleFragment } from './shaders.js';

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed: ' + error);
  }
  return shader;
}

function link(gl, vertex, fragment) {
  const program = gl.createProgram();
  const vertexShader = compile(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program linking failed: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

function findUniforms(gl, program, names) {
  return Object.fromEntries(
    names.map(name => [name, gl.getUniformLocation(program, name)])
  );
}

export class ParticleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    if (!this.gl) throw new Error('WebGL2 is unavailable');

    const gl = this.gl;
    this.background = link(gl, fullscreenVertex, skyFragment);
    this.particles = link(gl, particleVertex, particleFragment);

    this.skyUniforms = findUniforms(gl, this.background, [
      'uResolution', 'uCenter', 'uUnit', 'uTime', 'uRays'
    ]);
    this.particleUniforms = findUniforms(gl, this.particles, [
      'uResolution', 'uCenter', 'uUnit', 'uTime',
      'uZoom', 'uRatio', 'uBeat', 'uPan', 'uPass'
    ]);

    this.vertexArray = gl.createVertexArray();
    this.particleBuffer = gl.createBuffer();
    gl.bindVertexArray(this.vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    const stride = PARTICLE_STRIDE * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 2 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 6 * 4);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 1);
    this.count = 0;
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.stats = null;
    this.lost = false;

    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.lost = true;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      window.location.reload();
    });
  }

  resize(width, height, ratio, count) {
    const gl = this.gl;
    this.width = width;
    this.height = height;
    this.ratio = ratio;
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    if (this.count !== count) {
      const cloud = createParticleCloud(count);
      this.count = count;
      this.stats = cloud.counts;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, cloud.data, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }

  render({ seconds, unit, zoom, panX, panY, beat, rays = .78 }) {
    if (this.lost || !this.width || !this.count) return;

    const gl = this.gl;
    const ratio = this.ratio;
    const resX = this.canvas.width;
    const resY = this.canvas.height;
    const centerX = (this.width * .5 + panX) * ratio;
    const centerY = (this.height * .5 + unit * 1.8 - panY) * ratio;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.useProgram(this.background);
    gl.uniform2f(this.skyUniforms.uResolution, resX, resY);
    gl.uniform2f(this.skyUniforms.uCenter, centerX, centerY);
    gl.uniform1f(this.skyUniforms.uUnit, unit * ratio * zoom);
    gl.uniform1f(this.skyUniforms.uTime, seconds);
    gl.uniform1f(this.skyUniforms.uRays, rays);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.useProgram(this.particles);
    gl.bindVertexArray(this.vertexArray);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform2f(this.particleUniforms.uResolution, resX, resY);
    gl.uniform2f(this.particleUniforms.uCenter, centerX, centerY);
    gl.uniform1f(this.particleUniforms.uUnit, unit * ratio);
    gl.uniform1f(this.particleUniforms.uTime, seconds);
    gl.uniform1f(this.particleUniforms.uZoom, zoom);
    gl.uniform1f(this.particleUniforms.uRatio, ratio);
    gl.uniform1f(this.particleUniforms.uBeat, beat);
    gl.uniform2f(this.particleUniforms.uPan, 0, 0);

    gl.uniform1i(this.particleUniforms.uPass, 0);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.uniform1i(this.particleUniforms.uPass, 1);
    gl.drawArrays(gl.POINTS, 0, this.count);

    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.particleBuffer);
    gl.deleteVertexArray(this.vertexArray);
    gl.deleteProgram(this.background);
    gl.deleteProgram(this.particles);
  }
}
