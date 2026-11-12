import { HeartScene } from './scene.js';

const canvas = document.querySelector('#heart');
const zoomLabel = document.querySelector('#zoom-reset');
const scene = new HeartScene(canvas, zoomLabel);

document.querySelector('#zoom-in').addEventListener('click', () => scene.zoomIn());
document.querySelector('#zoom-out').addEventListener('click', () => scene.zoomOut());
zoomLabel.addEventListener('click', () => scene.resetZoom());

scene.start();
