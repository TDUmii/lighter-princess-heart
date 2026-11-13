import { HEART, heartUnit, qualityFor } from './config.js';
import { heartbeat } from './heartbeat.js';
import { VolumeRenderer } from './renderer.js';
import { CanvasRenderer } from './fallback.js';
import { ORBIT, clamp } from './camera.js';
import { withinHeart } from './effects.js';
import { HeartInteraction } from './interaction.js';
import { StardustTrail } from './trail.js';

export class HeartScene {
  constructor(canvas, zoomLabel) {
    this.canvas = canvas;
    this.label = zoomLabel;
    this.secret = document.querySelector('#secret-message');
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
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    const modestDevice = (navigator.deviceMemory && navigator.deviceMemory <= 4)
      || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    this.qualityTier = lowMemory ? 0 : modestDevice ? 1 : 2;
    this.lastQualityChange = performance.now();
    this.stableWindows = 0;
    this.fps = 0;
    this.touch = { x: -10000, y: -10000, strength: 0, target: 0, owner: null };
    this.touchRadius = 110;
    this.interaction = new HeartInteraction();

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

    this.trail = new StardustTrail(this.canvas);
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
    this.canvas.addEventListener('pointerleave',event=>{
      if (event.pointerType!=='touch') this.interaction.moveHover(0,0,false);
    });

    this.canvas.addEventListener('pointerdown',event=>{
      const now = performance.now();
      this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,time:now});
      if (this.pointers.size===1) {
        const inside=withinHeart(event.clientX,event.clientY,
          this.width,this.height,this.unit,this.zoom,this.panX,this.panY);
        this.interaction.start(event.pointerId,event.clientX,event.clientY,now,inside);
        this.interaction.moveHover(0,0,false);
      } else {
        for (const id of this.pointers.keys()) this.interaction.cancel(id);
      }
      this.touchStart=now;
      this.lastInteraction=now;
      if (this.pointers.size===1 && withinHeart(event.clientX,event.clientY,
        this.width,this.height,this.unit,this.zoom,this.panX,this.panY)) {
        this.touch.x=event.clientX;
        this.touch.y=event.clientY;
        this.touch.owner=event.pointerId;
        this.touch.target=1;
        if(this.reducedMotion.matches){this.touch.strength=1;this.draw(now);}
      } else if(this.pointers.size>1){
        this.touch.target=0;
        this.touch.owner=null;
      }
      this.yawVelocity=0;
      this.pitchVelocity=0;
      try{this.canvas.setPointerCapture(event.pointerId);}catch{}
      this.updatePinch();
    });
    this.canvas.addEventListener('pointermove',event=>{
      const now = performance.now();
      const prev=this.pointers.get(event.pointerId);
      const near=withinHeart(event.clientX,event.clientY,this.width,this.height,
        this.unit,this.zoom*1.13,this.panX,this.panY);
      this.interaction.moveHover(event.clientX,event.clientY,near&&!prev,event.pointerType);
      this.trail.emit(event.clientX,event.clientY,now,near&&!this.reducedMotion.matches);
      if(!prev)return;
      this.interaction.move(event.pointerId,event.clientX,event.clientY);
      this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,time:now});
      this.lastInteraction=now;
      if (this.touch.owner===event.pointerId && this.pointers.size===1) {
        this.touch.x=event.clientX;
        this.touch.y=event.clientY;
      }
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
          this.yawVelocity=0;
          this.pitchVelocity=0;
        }
        if(this.reducedMotion.matches)this.draw(now);
      }
    });
    for(const type of ['pointerup','pointercancel']){
      this.canvas.addEventListener(type,event=>{
        const now=performance.now();
        if(type==='pointercancel'||this.pointers.size!==1)
          this.interaction.cancel(event.pointerId);
        else
          this.interaction.finish(event.pointerId,event.clientX,event.clientY,now,
            {reduced:this.reducedMotion.matches});
        this.pointers.delete(event.pointerId);
        if(event.pointerType!=='touch')
          this.interaction.moveHover(event.clientX,event.clientY,
            withinHeart(event.clientX,event.clientY,this.width,this.height,
              this.unit,this.zoom*1.13,this.panX,this.panY),event.pointerType);
        if (this.touch.owner===event.pointerId || this.pointers.size===0) {
          this.touch.owner=null;
          this.touch.target=0;
          if(this.reducedMotion.matches){this.touch.strength=0;this.draw(performance.now());}
        }
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
      if(document.hidden){
        if(this.interaction.press)this.interaction.cancel(this.interaction.press.pointerId);
        this.interaction.moveHover(0,0,false);
        this.stop();
      }
      else this.resume();
    });
    this.reducedMotion.addEventListener('change',()=>{
      this.stop();
      this.draw(performance.now());
      this.trail.draw(performance.now(),0,this.reducedMotion.matches);
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
    this.quality=qualityFor(width,height,window.devicePixelRatio||1,this.qualityTier);
    this.touchRadius=width<640?96:128;
    this.renderer.resize(width,height,this.quality);
    this.trail.resize(width,height,this.quality.pixelRatio);
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
    this.panX=0;
    this.panY=0;
    this.yawVelocity=0;
    this.pitchVelocity=0;
    this.lastInteraction=performance.now();
    if(this.reducedMotion.matches)this.draw(performance.now());
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
    this.touch.strength+=(this.touch.target-this.touch.strength)
      *(1-Math.exp(-delta/(this.touch.target?90:240)));
    if(this.touch.strength<.001 && !this.touch.target)this.touch.strength=0;
    this.interaction.frame(delta,now,this.reducedMotion.matches);

    if(!this.pointers.size){
      // Preserve the exact camera angle after a drag: no automatic spin or inertia.
      if(Math.abs(this.yaw)>100)this.yaw%=Math.PI*2;
    }

    this.draw(now);
    this.trail.draw(now,delta,this.reducedMotion.matches);
    this.frameCounter++;
    if (!this.fpsWindow) this.fpsWindow = now;
    const elapsed = now - this.fpsWindow;
    if (elapsed >= 4500) {
      const fps = this.frameCounter / (elapsed / 1000);
      this.fps = Math.round(fps);
      const cooldown = now - this.lastQualityChange;
      if (fps < 43 && this.qualityTier > 0 && cooldown > 6000) {
        this.setQualityTier(this.qualityTier - 1, now);
      } else if (fps > 56 && this.qualityTier < 2 && cooldown > 18000) {
        if (++this.stableWindows >= 2) this.setQualityTier(this.qualityTier + 1, now);
      } else {
        this.stableWindows = 0;
      }
      this.frameCounter = 0;
      this.fpsWindow = now;
    }
    this.frameId=requestAnimationFrame(this.drawFrame);
  }

  setQualityTier(tier, now = performance.now()) {
    const next = clamp(tier, 0, 2);
    if (next === this.qualityTier) return;
    this.qualityTier = next;
    this.quality = qualityFor(this.width, this.height, window.devicePixelRatio || 1, next);
    this.renderer.resize(this.width, this.height, this.quality);
    this.trail.resize(this.width, this.height, this.quality.pixelRatio);
    this.lastQualityChange = now;
    this.stableWindows = 0;
  }

  diagnostics() {
    return {
      version: '7.2',
      engine: this.engine,
      tier: this.qualityTier,
      fps: this.fps,
      particles: this.quality ? this.quality.core + this.quality.shell
        + this.quality.rim + this.quality.burst : 0,
      pixelRatio: this.quality?.pixelRatio ?? 0,
      yaw: this.yaw,
      pitch: this.pitch,
      zoom: this.zoom,
      touchStrength: Number(this.touch.strength.toFixed(3)),
      touchActive: !!this.touch.target,
      hoverStrength: Number(this.interaction.hover.strength.toFixed(3)),
      charge: Number(this.interaction.charge.toFixed(3)),
      chargeWave: Number(this.interaction.state(performance.now()).chargeWave.strength.toFixed(3)),
      chargeCount: this.interaction.chargeCount,
      trailCount: this.trail.particles.length
    };
  }

  draw(now){
    const reduced=this.reducedMotion.matches;
    const time=reduced?HEART.period*.7:(now-this.startedAt)/1000;
    const beat=reduced?0:heartbeat(time);
    this.renderer.render({
      time,beat,zoom:this.zoom,unit:this.unit,
      panX:this.panX,panY:this.panY,
      yaw:this.yaw,pitch:this.pitch,
      touch:{x:this.touch.x,y:this.touch.y,strength:this.touch.strength,
        radius:this.touchRadius},
      interaction:this.interaction.state(now,reduced),reducedMotion:reduced
    });
    if(!this.secret)return;
    const reveal=clamp((this.zoom-HEART.secretZoom)/.68,0,1);
    this.secret.style.visibility=reveal>0.005?'visible':'hidden';
    this.secret.setAttribute('aria-hidden',reveal>0.005?'false':'true');
    this.secret.style.opacity=(reveal*.93).toFixed(3);
    this.secret.style.left=(this.width*.5+this.panX)+'px';
    this.secret.style.top=(this.height*.5+this.unit*.9+this.panY)+'px';
    this.secret.style.transform='translate(-50%, -50%) scale('+clamp(this.zoom*.74,.8,2.25).toFixed(3)+')';
  }
}

function unitLimit(unit,zoom,span){
  return Math.max(0,unit*span*(zoom-1));
}
