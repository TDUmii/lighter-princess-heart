import { HeartScene } from './v4/scene.js';

const canvas=document.querySelector('#heart');
const zoomReset=document.querySelector('#zoom-reset');
const scene=new HeartScene(canvas,zoomReset);

document.querySelector('#zoom-in').addEventListener('click',()=>scene.zoomIn());
document.querySelector('#zoom-out').addEventListener('click',()=>scene.zoomOut());
zoomReset.addEventListener('click',()=>scene.resetZoom());
document.querySelector('#reset-view').addEventListener('click',()=>scene.resetView());
const orbitToggle=document.querySelector('#orbit-toggle');
orbitToggle.addEventListener('click',()=>{
  scene.setAutoRotate(!scene.autoRotate);
  orbitToggle.textContent=scene.autoRotate?'⏸':'▶';
  orbitToggle.setAttribute('aria-pressed',String(scene.autoRotate));
  orbitToggle.setAttribute('aria-label',scene.autoRotate?'Tạm dừng xoay tự động':'Bật xoay tự động');
});

scene.start();
