import { HEART } from './config.js';
import { createParticleSystems, STRIDE } from './particles.js';
import { skyVertex, skyFragment, pointVertex, pointFragment } from './shaders.js';

function shader(gl, type, source) {
  const compiled = gl.createShader(type);
  gl.shaderSource(compiled, source);
  gl.compileShader(compiled);
  if (!gl.getShaderParameter(compiled, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(compiled) || 'Shader compilation failed');
  }
  return compiled;
}

function program(gl, vertex, fragment) {
  const p = gl.createProgram();
  const vs = shader(gl, gl.VERTEX_SHADER, vertex);
  const fs = shader(gl, gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'Shader link failed');
  }
  return p;
}

function uniforms(gl, p, keys) {
  return Object.fromEntries(keys.map(k => [k, gl.getUniformLocation(p, k)]));
}

export class VolumeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    if (!gl) throw new Error('WebGL2 unavailable');

    this.gl = gl;
    this.sky = program(gl, skyVertex, skyFragment);
    this.points = program(gl, pointVertex, pointFragment);
    this.skyU = uniforms(gl, this.sky, [
      'uResolution', 'uCenter', 'uUnit', 'uZoom', 'uTime', 'uBeat'
    ]);
    this.pointU = uniforms(gl, this.points, [
      'uResolution', 'uCenter', 'uUnit', 'uZoom', 'uRatio',
      'uTime', 'uPeriod', 'uBeat', 'uBurstTravel', 'uYaw', 'uPitch', 'uPass'
    ]);

    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const stride = STRIDE * Float32Array.BYTES_PER_ELEMENT;
    const layout = [[0,3,0],[1,4,3],[2,4,7],[3,1,11]];
    for (const [location, size, offset] of layout) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location,size,gl.FLOAT,false,stride,offset*4);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST);
    this.count = 0;
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.layers = null;
    this.lost = false;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      this.lost = true;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      window.location.reload();
    });
  }

  resize(width, height, quality) {
    const gl = this.gl;
    this.width = width;
    this.height = height;
    this.ratio = quality.pixelRatio;
    this.canvas.width = Math.max(1, Math.round(width * this.ratio));
    this.canvas.height = Math.max(1, Math.round(height * this.ratio));
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    gl.viewport(0,0,this.canvas.width,this.canvas.height);

    const expected = quality.core + quality.shell + quality.burst;
    if (expected !== this.count) {
      const system = createParticleSystems(quality);
      this.count = system.count;
      this.layers = system.layers;
      gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER,system.data,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
  }

  render({ time, beat, zoom, unit, panX, panY, yaw = 0, pitch = 0 }) {
    if (!this.layers || this.lost) return;
    const gl = this.gl;
    const ratio = this.ratio;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = (this.width * .5 + panX) * ratio;
    const cy = (this.height * .5 + unit * 1.7 - panY) * ratio;

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.BLEND);

    gl.useProgram(this.sky);
    gl.uniform2f(this.skyU.uResolution,width,height);
    gl.uniform2f(this.skyU.uCenter,cx,cy);
    gl.uniform1f(this.skyU.uUnit,unit*ratio);
    gl.uniform1f(this.skyU.uZoom,zoom);
    gl.uniform1f(this.skyU.uTime,time);
    gl.uniform1f(this.skyU.uBeat,beat);
    gl.drawArrays(gl.TRIANGLES,0,3);

    gl.useProgram(this.points);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.pointU.uResolution,width,height);
    gl.uniform2f(this.pointU.uCenter,cx,cy);
    gl.uniform1f(this.pointU.uUnit,unit*ratio);
    gl.uniform1f(this.pointU.uZoom,zoom);
    gl.uniform1f(this.pointU.uRatio,ratio);
    gl.uniform1f(this.pointU.uTime,time);
    gl.uniform1f(this.pointU.uPeriod,HEART.period);
    gl.uniform1f(this.pointU.uBeat,beat);
    gl.uniform1f(this.pointU.uBurstTravel,HEART.burstTravel);
    gl.uniform1f(this.pointU.uYaw,yaw);
    gl.uniform1f(this.pointU.uPitch,pitch);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    for (let pass = 0; pass < 2; pass++) {
      gl.uniform1i(this.pointU.uPass,pass);
      for (const name of ['core','shell','burst']) {
        const { first,count } = this.layers[name];
        gl.drawArrays(gl.POINTS,first,count);
      }
    }
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }
}
