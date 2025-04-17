import * as THREE from "three";
import { initScene } from "../lib/scene.js";
import {
  animateHeroSection,
  animateServicesSection,
} from "../lib/animations.js";

// Preload shaders
async function preloadShaders() {
  const [vertexShader, fragmentShader] = await Promise.all([
    fetch("/shaders/vertex.glsl").then((res) => res.text()),
    fetch("/shaders/fragment.glsl").then((res) => res.text()),
  ]);
  return { vertexShader, fragmentShader };
}

const shadersPromise = preloadShaders();

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
shadersPromise.then((shaders) => {
  initScene(renderer, shaders).then(() => {
    // Handle window resizing
    window.addEventListener("resize", () => {
      const newCanvasWidth = window.innerWidth;
      const newCanvasHeight = window.innerHeight + 200;

      renderer.setSize(newCanvasWidth, newCanvasHeight);
      renderer.domElement.style.width = `${newCanvasWidth}px`;
      renderer.domElement.style.height = `${newCanvasHeight}px`;
    });
  });
});

// Initialize homepage animations
animateHeroSection();
animateServicesSection();

// Trigger a mousemove event on page load
window.addEventListener("load", () => {
  const event = new MouseEvent("mousemove", {
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
  });
  document.dispatchEvent(event);
});
