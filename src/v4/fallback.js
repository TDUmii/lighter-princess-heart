import { HEART } from './config.js';
import { createParticleSystems, STRIDE } from './particles.js';
import { beatPhase, flightProgress, flightOpacity, flightDistance, deformScale } from './heartbeat.js';
import { rotatePoint, perspectiveScale } from './camera.js';

function makeSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 48;
  const g = sprite.getContext('2d');
  g.fillStyle = '#ff92b5';
  g.beginPath();
  g.moveTo(24,40);
  g.bezierCurveTo(14,33,5,26,5,17);
  g.bezierCurveTo(5,7,16,4,24,13);
  g.bezierCurveTo(32,4,43,7,43,17);
  g.bezierCurveTo(43,26,34,33,24,40);
  g.fill();
  return sprite;
}

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d',{alpha:false});
    if (!this.ctx) throw new Error('Canvas2D unavailable');
    this.sprite = makeSprite();
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.data = null;
    this.count = 0;
    this.layers = null;
  }

  resize(width, height, quality) {
    this.width = width;
    this.height = height;
    this.ratio = Math.min(quality.pixelRatio,1.20);
    this.canvas.width = Math.round(width*this.ratio);
    this.canvas.height = Math.round(height*this.ratio);
    this.canvas.style.width = width+'px';
    this.canvas.style.height = height+'px';
    const weight = quality.mobile ? .48 : .31;
    const reduced = {
      core: Math.round(quality.core*weight),
      shell: Math.round(quality.shell*weight),
      burst: Math.round(quality.burst*weight)
    };
    const system = createParticleSystems(reduced);
    this.data = system.data;
    this.count = system.count;
    this.layers = system.layers;
  }

  render({ time, beat, zoom, unit, panX, panY, yaw = 0, pitch = 0 }) {
    if (!this.data) return;
    const ctx = this.ctx;
    const originX = this.width * .5 + panX;
    const originY = this.height * .5 - unit * 1.7 + panY;
    ctx.setTransform(this.ratio,0,0,this.ratio,0,0);
    ctx.fillStyle = '#000105';
    ctx.fillRect(0,0,this.width,this.height);

    ctx.save();
    ctx.translate(originX,originY);
    ctx.scale(zoom,zoom);
    const aura = ctx.createRadialGradient(0,0,unit*5,0,0,unit*34);
    aura.addColorStop(0,'rgba(132,12,45,.07)');
    aura.addColorStop(.54,'rgba(90,9,31,.025)');
    aura.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=aura;
    ctx.fillRect(-unit*34,-unit*34,unit*68,unit*68);
    ctx.globalCompositeOperation='screen';

    const a=this.data;
    const phase=beatPhase(time);
    for (let i=0;i<this.count;i++) {
      const j=i*STRIDE;
      let x=a[j],y=a[j+1],z=a[j+2];
      const kind=a[j+3];
      const seed=a[j+4], size=a[j+5], alpha=a[j+6];
      const tone=a[j+7], nx=a[j+8], ny=a[j+9], nz=a[j+12];
      const delay=a[j+10],speed=a[j+11];
      const radius=Math.min(1,Math.hypot(x/16,(y-1)/17));
      const scale=deformScale(kind,radius,beat);
      x*=scale;
      y=1+(y-1)*scale;

      z*=scale;
      if (kind!==0) {
        x+=nx*.10*Math.sin(time*speed+seed);
        y+=ny*.10*Math.sin(time*speed+seed);
        z+=nz*.10*Math.sin(time*speed+seed);
      }

      let opacity=1;
      if (kind===2) {
        const progress=flightProgress(phase,delay);
        opacity=flightOpacity(phase,delay);
        if(opacity<=0)continue;
        const distance=flightDistance(phase,delay);
        x+=nx*distance;
        y+=ny*distance;
        z+=nz*distance;
        // Outgoing and incoming hearts retain the same opacity.
      }

      const rotated=rotatePoint(x,y,z,yaw,pitch);
      const depthScale=perspectiveScale(rotated.z);
      const px=rotated.x*unit*.87*depthScale;
      const py=rotated.y*unit*.92*depthScale;
      const light=Math.min(1,Math.max(0,rotated.z/24+.54));
      const red=Math.round(226+29*tone);
      const green=Math.round(35+102*(.42*tone+.58*light));
      const blue=Math.round(74+95*(.42*tone+.58*light));
      const surfaceNormal=kind===1?rotatePoint(nx,ny,nz,yaw,pitch):null;
      const rimGlow=surfaceNormal
        ? .60+.98*Math.pow(Math.max(0,1-Math.abs(surfaceNormal.z)),1.55)
        : 1;
      ctx.globalAlpha=Math.min(1,alpha*(.75+.30*light)*opacity*rimGlow);
      ctx.fillStyle='rgb('+red+','+green+','+blue+')';
      const d=Math.max(.8,size*(kind===2?1.45:1.78)*Math.pow(zoom,.15));
      const isLittleHeart=kind===2 || (((Math.sin(seed*93.271)*43758.5453)%1+1)%1 > .946);
      if((zoom>2.25&&kind!==2)||isLittleHeart){
        const heartSize=Math.max(1.6,d*(kind===2?2.1:2.25));
        ctx.drawImage(this.sprite,px-heartSize/2,py-heartSize/2,heartSize,heartSize);
      } else {
        ctx.beginPath();
        ctx.arc(px,py,d*.51,0,Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
  }
}
