import * as THREE from "three";
import { initScene } from "../lib/scene.js";

// Set up the renderer
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight + 200;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(canvasWidth, canvasHeight, false);
renderer.setClearColor(0xffffff, 0);

// Append the renderer to the DOM
document.querySelector(".three-wrapper").appendChild(renderer.domElement);

// Initialize the scene
initScene(renderer).then(() => {
  // Handle window resizing
  window.addEventListener("resize", () => {
    const newCanvasWidth = window.innerWidth;
    const newCanvasHeight = window.innerHeight + 200;

    renderer.setSize(newCanvasWidth, newCanvasHeight);
    renderer.domElement.style.width = `${newCanvasWidth}px`;
    renderer.domElement.style.height = `${newCanvasHeight}px`;
  });
});
