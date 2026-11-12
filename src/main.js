import { HeartScene } from './scene.js';

const canvas = document.querySelector('#heart');
const scene = new HeartScene(canvas);

scene.start();
