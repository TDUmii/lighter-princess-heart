import { HeartScene } from './v5/scene.js';

const canvas=document.querySelector('#heart');
const zoomReset=document.querySelector('#zoom-reset');
const scene=new HeartScene(canvas,zoomReset);

document.querySelector('#zoom-in').addEventListener('click',()=>scene.zoomIn());
document.querySelector('#zoom-out').addEventListener('click',()=>scene.zoomOut());
zoomReset.addEventListener('click',()=>scene.resetZoom());
document.querySelector('#reset-view').addEventListener('click',()=>scene.resetView());
scene.start();
// Diagnostics are opt-in and never add visible controls.
if (new URLSearchParams(location.search).has('debug')) {
  window.__heartDebug = () => scene.diagnostics();
}
