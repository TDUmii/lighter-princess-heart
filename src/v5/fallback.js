import { HEART } from './config.js';
import { createParticleSystems, STRIDE } from './particles.js';
import { beatPhase, flightProgress, flightOpacity, flightDistance, deformScale } from './heartbeat.js';
import { rotatePoint, perspectiveScale } from './camera.js';
import { heartPoint, volumeNormal } from './geometry.js';
import { shockwaveRings, touchFalloff } from './effects.js';
import { magneticFalloff, smoothstep } from './interaction.js';

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
    // Sample once: the ripple follows exactly the same implicit outline as
    // the 3D particle heart, with no heavy geometry work per animation frame.
    this.waveOutline = Array.from({ length: 128 }, (_, i) => {
      const p = heartPoint(i * Math.PI * 2 / 128);
      const n = volumeNormal(p.x, p.y, 0);
      return { ...p, nx: n.nx, ny: n.ny };
    });
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
      rim: Math.round((quality.rim ?? 0)*weight),
      burst: Math.round(quality.burst*weight)
    };
    const system = createParticleSystems(reduced);
    this.data = system.data;
    this.count = system.count;
    this.layers = system.layers;
  }

  render({ time, beat, zoom, unit, panX, panY, yaw = 0, pitch = 0,
    touch = { x:-10000, y:-10000, strength:0, radius:110 },
    interaction = {}, reducedMotion = false }) {
    if (!this.data) return;
    const ctx = this.ctx;
    const originX = this.width * .5 + panX;
    const originY = this.height * .5 + unit * .9 + panY;
    ctx.setTransform(this.ratio,0,0,this.ratio,0,0);
    ctx.fillStyle = '#030104';
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
    for (const ring of shockwaveRings(time,reducedMotion)) {
      if (ring.strength < .006) continue;
      ctx.beginPath();
      for (let i = 0; i < this.waveOutline.length; i++) {
        const p = this.waveOutline[i];
        const x = (p.x + p.nx * ring.offset) * unit * .87;
        const y = (p.y + p.ny * ring.offset) * unit * .88;
        if (i === 0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.lineWidth = Math.max(.65,unit*.08);
      ctx.strokeStyle = 'rgba(255,96,153,'+(ring.strength*.19).toFixed(3)+')';
      ctx.stroke();
    }
    const release=interaction.chargeWave;
    if(release && release.progress>=0 && release.progress<1 && !reducedMotion) {
      const u=smoothstep(release.progress);
      const offset=.18+12.5*u;
      ctx.beginPath();
      for(let i=0;i<this.waveOutline.length;i++) {
        const p=this.waveOutline[i];
        const x=(p.x+p.nx*offset)*unit*.87;
        const y=(p.y+p.ny*offset)*unit*.88;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.lineWidth=Math.max(.85,unit*.11);
      ctx.strokeStyle='rgba(255,125,184,'+
        (release.strength*(1-u)*.22).toFixed(3)+')';
      ctx.stroke();
    }
    const sweepX=-.2+.55*Math.sin(time*.43*(reducedMotion?0:1));
    const sweepY=.12+.25*Math.cos(time*.33*(reducedMotion?0:1));
    const sweepLen=Math.hypot(sweepX,sweepY,.96);
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
      if (kind===1) {
        x+=nx*.08*Math.sin(time*speed+seed);
        y+=ny*.10*Math.sin(time*speed+seed);
        z+=nz*.10*Math.sin(time*speed+seed);
      }

      let opacity=1;
      if (kind===2) {
        const progress=flightProgress(phase,delay);
        opacity=flightOpacity(phase,delay);
        if(opacity<=0)continue;
        const distance=flightDistance(phase,delay);
        const organic=((Math.sin(seed*19.731)*43563.123)%1+1)%1;
        const travel=distance*(.79+.39*organic);
        const arc=Math.sin(Math.PI*distance/HEART.burstTravel);
        x+=nx*travel-ny*arc*(organic-.5)*.72;
        y+=ny*travel+nx*arc*(organic-.5)*.72;
        z+=nz*travel+arc*.26*Math.sin(seed*2.21);
        // Outgoing and incoming hearts retain the same opacity.
      }

      const extraBurst=interaction.burst||0;
      if(extraBurst>.001) {
        const direction=kind===0
          ? {x, y:y-1, z:z+.05} : {x:nx, y:ny, z:nz};
        const len=Math.max(.001,Math.hypot(direction.x,direction.y,direction.z));
        const force=(kind===0?4.3:kind===1?6.2:kind===2?3.8:2.0)*extraBurst/len;
        x+=direction.x*force;
        y+=direction.y*force;
        z+=direction.z*force;
      }
      const rotated=rotatePoint(x,y,z,yaw,pitch);
      const depthScale=perspectiveScale(rotated.z);
      const px=rotated.x*unit*.87*depthScale;
      const py=rotated.y*unit*.88*depthScale;
      const t=Math.max(0,Math.min(1,(rotated.z+19)/39));
      const light=t*t*(3-2*t);
      const screenX=originX+px*zoom, screenY=originY+py*zoom;
      const touchDistance=Math.hypot(screenX-touch.x,screenY-touch.y);
      const influence=touch.strength*touchFalloff(touchDistance,touch.radius);
      let drawX=px, drawY=py;
      const hover=interaction.hover;
      let magnet=0;
      if(hover && hover.strength>.001) {
        const dx=hover.x-screenX,dy=hover.y-screenY;
        const d=Math.hypot(dx,dy);
        magnet=hover.strength*magneticFalloff(d,hover.radius);
        drawX+=dx/(d+.01)*magnet*6/zoom;
        drawY+=dy/(d+.01)*magnet*6/zoom;
      }
      if(influence>.001){
        drawX+=(screenX-touch.x)/(touchDistance+.01)*influence*7/zoom;
        drawY+=(screenY-touch.y)/(touchDistance+.01)*influence*7/zoom;
      }
      const red=Math.round(226+29*tone);
      const green=Math.round(35+102*(.42*tone+.58*light));
      const blue=Math.round(74+95*(.42*tone+.58*light));
      const surfaceNormal=(kind===1||kind===3)?rotatePoint(nx,ny,nz,yaw,pitch):null;
      const grazing=surfaceNormal ? Math.max(0,1-Math.abs(surfaceNormal.z)) : 0;
      const diffuse=surfaceNormal
        ? Math.max(0,surfaceNormal.x*(-.34)+surfaceNormal.y*.26+surfaceNormal.z*.91) : .57;
      const sheen=surfaceNormal
        ? Math.pow(Math.max(0,(surfaceNormal.x*sweepX+
            surfaceNormal.y*sweepY+surfaceNormal.z*.96)/sweepLen),13) : .10;
      const rimGlow=kind===3
        ? .07+.36*Math.pow(grazing,2.25)
        : surfaceNormal ? .38+.80*Math.pow(grazing,1.55) : 1;
      const charge=interaction.charge||0;
      ctx.globalAlpha=Math.min(1,alpha*(.75+.30*light)*opacity*rimGlow
        *(.87+.20*diffuse+.06*sheen)*
          (1+.52*influence+.22*magnet+
            charge*(kind===0?.55:.08)+.14*extraBurst)*1.55);
      ctx.fillStyle='rgb('+red+','+green+','+blue+')';
      const d=Math.max(.55,size*(kind===2?1.20:kind===3?.90:2.0)*
        Math.pow(zoom,.15)*(1+.15*magnet+(kind===0?.23*charge:0)+.17*extraBurst));
      const symbol=((Math.sin(seed*93.271)*43758.5453)%1+1)%1;
      const isLittleHeart=(kind===0 && symbol>.992) || (kind===2 && symbol>.83);
      if((zoom>2.25&&kind<3)||isLittleHeart){
        const heartSize=Math.max(1.4,d*(kind===2?1.55:2.0));
        ctx.drawImage(this.sprite,drawX-heartSize/2,drawY-heartSize/2,heartSize,heartSize);
      } else {
        ctx.beginPath();
        ctx.arc(drawX,drawY,d*.51*(1+.12*influence),0,Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
  }
}