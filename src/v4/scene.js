import { HEART, heartUnit, qualityFor } from './config.js';
import { heartbeat } from './heartbeat.js';
import { VolumeRenderer } from './renderer.js';
import { CanvasRenderer } from './fallback.js';
import { ORBIT, clamp } from './camera.js';

export class HeartScene {
  constructor(canvas, zoomLabel) {
    this.canvas = canvas;
    this.label = zoomLabel;
    this.secret = document.querySelector('#secret-message');
    if (this.secret) this.secret.setAttribute('aria-hidden', 'false');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.width = 1;
    this.height = 1;
    this.unit = 1;
    this.zoom = 1;
    this.targetZoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.yaw = ORBIT.initialYaw;
    this.pitch = ORBIT.initialPitch;
    this.yawVelocity = 0;
    this.pitchVelocity = 0;
    this.autoRotate = true;
    this.lastInteraction = performance.now();
    this.quality = null;
    this.startedAt = performance.now();
    this.lastFrame = this.startedAt;
    this.touchStart = -Infinity;
    this.frameId = 0;
    this.resizeTimer = 0;
    this.pointers = new Map();
    this.pinch = null;
    this.fpsWindow = 0;
    this.frameCounter = 0;
    this.adjusted = false;

    try {
      this.renderer = new VolumeRenderer(canvas);
      this.engine = 'WebGL2';
    } catch (error) {
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      this.canvas = replacement;
      this.renderer = new CanvasRenderer(replacement);
      this.engine = 'Canvas2D';
      console.info('Using Canvas2D compatibility mode:',error.message);
    }

    this.drawFrame = this.drawFrame.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  start() {
    this.resize();
    window.addEventListener('resize',this.handleResize,{passive:true});
    this.canvas.addEventListener('wheel',event=>{
      event.preventDefault();
      const delta=clamp(event.deltaY,-200,200);
      this.setZoom(this.targetZoom*Math.exp(-delta*.00145));
    },{passive:false});
    this.canvas.addEventListener('dblclick',()=>this.resetView());

    this.canvas.addEventListener('pointerdown',event=>{
      const now = performance.now();
      this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,time:now});
      this.touchStart=now;
      this.lastInteraction=now;
      this.yawVelocity=0;
      this.pitchVelocity=0;
      try{this.canvas.setPointerCapture(event.pointerId);}catch{}
      this.updatePinch();
    });
    this.canvas.addEventListener('pointermove',event=>{
      const prev=this.pointers.get(event.pointerId);
      if(!prev)return;
      const now = performance.now();
      this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,time:now});
      this.lastInteraction=now;
      if(this.pointers.size===2&&this.pinch){
        const [a,b]=this.pointers.values();
        this.setZoom(this.pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/this.pinch.distance);
      }else if(this.pointers.size===1){
        const dx=event.clientX-prev.x;
        const dy=event.clientY-prev.y;
        if(event.shiftKey && this.targetZoom>1.04){
          const maxX=unitLimit(this.unit,this.targetZoom,19);
          const maxY=unitLimit(this.unit,this.targetZoom,20);
          this.panX=clamp(this.panX+dx,-maxX,maxX);
          this.panY=clamp(this.panY+dy,-maxY,maxY);
        }else{
          this.yaw += dx*ORBIT.dragSensitivity;
          this.pitch=clamp(this.pitch+dy*ORBIT.dragSensitivity*.82,ORBIT.minPitch,ORBIT.maxPitch);
          const elapsed=Math.max(.008,(now-prev.time)/1000);
          this.yawVelocity=clamp(dx*ORBIT.dragSensitivity/elapsed,-3,3);
          this.pitchVelocity=clamp(dy*ORBIT.dragSensitivity*.82/elapsed,-2,2);
        }
        if(this.reducedMotion.matches)this.draw(now);
      }
    });
    for(const type of ['pointerup','pointercancel']){
      this.canvas.addEventListener(type,event=>{
        this.pointers.delete(event.pointerId);
        if(this.canvas.hasPointerCapture(event.pointerId)){
          this.canvas.releasePointerCapture(event.pointerId);
        }
        this.pinch=null;
        if(this.pointers.size===2)this.updatePinch();
      });
    }
    window.addEventListener('keydown',event=>{
      if(event.target instanceof HTMLButtonElement)return;
      if(event.key==='+'||event.key==='=')this.zoomIn();
      if(event.key==='-')this.zoomOut();
      if(event.key==='0')this.resetZoom();
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)this.stop();
      else this.resume();
    });
    this.reducedMotion.addEventListener('change',()=>{
      this.stop();
      this.draw(performance.now());
      this.resume();
    });
    this.resume();
  }

  updatePinch(){
    if(this.pointers.size!==2)return;
    const [a,b]=this.pointers.values();
    this.pinch={
      distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),
      zoom:this.targetZoom
    };
  }

  handleResize(){
    clearTimeout(this.resizeTimer);
    this.resizeTimer=setTimeout(()=>this.resize(),120);
  }

  resize(){
    const width=Math.max(1,window.innerWidth);
    const height=Math.max(1,window.innerHeight);
    if(this.quality&&width===this.width&&height===this.height)return;
    this.width=width;
    this.height=height;
    this.unit=heartUnit(width,height);
    this.quality=qualityFor(width,height,window.devicePixelRatio||1);
    this.renderer.resize(width,height,this.quality);
    this.draw(performance.now());
  }

  setZoom(value){
    this.targetZoom=clamp(value,HEART.zoomMin,HEART.zoomMax);
    this.label.textContent=Math.round(this.targetZoom*100)+'%';
    if(this.reducedMotion.matches){
      this.zoom=this.targetZoom;
      this.draw(performance.now());
    }
  }

  resetView(){
    this.yaw=0;
    this.pitch=0;
    this.yawVelocity=0;
    this.pitchVelocity=0;
    this.lastInteraction=performance.now();
    if(this.reducedMotion.matches)this.draw(performance.now());
  }
  setAutoRotate(enabled){
    this.autoRotate=Boolean(enabled);
    this.lastInteraction=performance.now();
  }

  zoomIn(){this.setZoom(this.targetZoom*1.24);}
  zoomOut(){this.setZoom(this.targetZoom/1.24);}
  resetZoom(){
    this.panX=0;
    this.panY=0;
    this.setZoom(1);
  }

  stop(){
    if(this.frameId)cancelAnimationFrame(this.frameId);
    this.frameId=0;
  }
  resume(){
    if(document.hidden||this.reducedMotion.matches||this.frameId)return;
    this.lastFrame=performance.now();
    this.frameId=requestAnimationFrame(this.drawFrame);
  }

  drawFrame(now){
    this.frameId=0;
    const delta=clamp(now-this.lastFrame,0,80);
    this.lastFrame=now;
    this.zoom+=(this.targetZoom-this.zoom)*(1-Math.exp(-delta/110));
    if(Math.abs(this.zoom-this.targetZoom)<.001)this.zoom=this.targetZoom;

    if(!this.pointers.size){
      const dt=delta/1000;
      this.yaw+=this.yawVelocity*dt;
      this.pitch=clamp(this.pitch+this.pitchVelocity*dt,ORBIT.minPitch,ORBIT.maxPitch);
      this.yawVelocity*=Math.exp(-4.1*dt);
      this.pitchVelocity*=Math.exp(-4.1*dt);
      if(this.autoRotate && now-this.lastInteraction>1800){
        this.yaw+=ORBIT.autoSpeed*dt;
      }
      if(Math.abs(this.yaw)>100)this.yaw%=Math.PI*2;
    }

    this.draw(now);
    this.frameCounter++;
    if(this.engine==='WebGL2'&&!this.adjusted){
      if(!this.fpsWindow)this.fpsWindow=now;
      const elapsed=now-this.fpsWindow;
      if(elapsed>5500){
        this.adjusted=true;
        const fps=this.frameCounter/(elapsed/1000);
        if(fps<39&&this.quality.pixelRatio>1.0){
          this.quality={...this.quality,pixelRatio:Math.max(1,this.quality.pixelRatio*.74)};
          this.renderer.resize(this.width,this.height,this.quality);
        }
      }
    }
    this.frameId=requestAnimationFrame(this.drawFrame);
  }

  draw(now){
    const reduced=this.reducedMotion.matches;
    const time=reduced?HEART.period*.7:(now-this.startedAt)/1000;
    const beat=reduced?0:heartbeat(time);
    this.renderer.render({
      time,beat,zoom:this.zoom,unit:this.unit,
      panX:this.panX,panY:this.panY,
      yaw:this.yaw,pitch:this.pitch
    });
    if(!this.secret)return;
    this.secret.style.visibility='visible';
    this.secret.style.opacity='.96';
    this.secret.style.left=(this.width*.5+this.panX)+'px';
    this.secret.style.top=(this.height*.5-this.unit*1.7+this.panY)+'px';
    this.secret.style.transform='translate(-50%, -50%) scale('+clamp(this.zoom*.86,1,2.25).toFixed(3)+')';
  }
}

function unitLimit(unit,zoom,span){
  return Math.max(0,unit*span*(zoom-1));
}
