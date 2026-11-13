import { HEART } from './config.js';
import { createParticleSystems, STRIDE } from './particles.js';
import { skyVertex, skyFragment, pointVertex, pointFragment } from './shaders.js';
import { createMiniHeartSprite } from './mini-heart.js';

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
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    if (!gl) throw new Error('WebGL2 unavailable');

    this.gl = gl;
    this.sky = program(gl, skyVertex, skyFragment);
    this.points = program(gl, pointVertex, pointFragment);
    this.skyU = uniforms(gl, this.sky, [
      'uResolution', 'uCenter', 'uUnit', 'uZoom', 'uTime', 'uBeat',
      'uPeriod', 'uMotion', 'uCharge', 'uChargeWave'
    ]);
    this.pointU = uniforms(gl, this.points, [
      'uResolution', 'uCenter', 'uUnit', 'uZoom', 'uRatio',
      'uTime', 'uPeriod', 'uBeat', 'uBurstTravel', 'uYaw', 'uPitch', 'uPass',
      'uTouch', 'uMotion', 'uHover', 'uCharge', 'uMiniHeart'
    ]);

    // Both renderers use the same antialiased Bézier silhouette.
    this.heartTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.heartTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
      createMiniHeartSprite(128, '#ffffff'));
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const stride = STRIDE * Float32Array.BYTES_PER_ELEMENT;
    const layout = [[0,3,0],[1,4,3],[2,4,7],[3,2,11]];
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

    const expected = quality.core + quality.shell + (quality.rim ?? 0) + quality.burst;
    if (expected !== this.count) {
      const system = createParticleSystems(quality);
      this.count = system.count;
      this.layers = system.layers;
      gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER,system.data,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
  }

  render({ time, beat, zoom, unit, panX, panY, yaw = 0, pitch = 0,
    touch = { x: -10000, y: -10000, strength: 0, radius: 110 },
    interaction = {}, reducedMotion = false }) {
    if (!this.layers || this.lost) return;
    const gl = this.gl;
    const ratio = this.ratio;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = (this.width * .5 + panX) * ratio;
    const cy = (this.height * .5 - unit * .9 - panY) * ratio;

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
    gl.uniform1f(this.skyU.uPeriod,HEART.period);
    gl.uniform1f(this.skyU.uMotion,reducedMotion?0:1);
    gl.uniform1f(this.skyU.uCharge,interaction.charge||0);
    const release=interaction.chargeWave||{progress:-1,strength:0};
    gl.uniform2f(this.skyU.uChargeWave,release.progress,release.strength);
    gl.drawArrays(gl.TRIANGLES,0,3);

    gl.useProgram(this.points);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heartTexture);
    gl.uniform1i(this.pointU.uMiniHeart, 0);
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
    gl.uniform4f(this.pointU.uTouch,touch.x*ratio,
      (this.height-touch.y)*ratio,touch.strength,touch.radius*ratio);
    gl.uniform1f(this.pointU.uMotion,reducedMotion?0:1);
    const hover=interaction.hover||{x:-10000,y:-10000,strength:0,radius:122};
    gl.uniform4f(this.pointU.uHover,hover.x*ratio,(this.height-hover.y)*ratio,
      hover.strength,hover.radius*ratio);
    gl.uniform1f(this.pointU.uCharge,interaction.charge||0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    for (let pass = 0; pass < 2; pass++) {
      gl.uniform1i(this.pointU.uPass,pass);
      for (const name of ['core','shell','rim','burst']) {
        const { first,count } = this.layers[name];
        gl.drawArrays(gl.POINTS,first,count);
      }
    }
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }
}
