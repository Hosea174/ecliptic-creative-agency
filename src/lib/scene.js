import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  BloomEffect,
  EffectPass,
} from "postprocessing";
import { setupControls } from "./controls.js"; // Import mouse controls
import { setupScrollAnimation, setupMagneticEffect } from "./animations.js";

// Dynamically import shaders
async function loadShaders() {
  const [vertexShader, fragmentShader] = await Promise.all([
    fetch("src/lib/shaders/vertex.glsl").then((res) => res.text()),
    fetch("src/lib/shaders/fragment.glsl").then((res) => res.text()),
  ]);
  return { vertexShader, fragmentShader };
}

export async function initScene(renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / (window.innerHeight + 200),
    0.1,
    2000
  );
  const composer = new EffectComposer(renderer);

  // Load shaders
  const { vertexShader, fragmentShader } = await loadShaders();

  // Create sphere with loaded shaders
  const uniforms = {
    u_time: { type: "f", value: 2 },
    u_frequency: { type: "f", value: 0.45 },
    u_red: { type: "f", value: 1 },
    u_green: { type: "f", value: 0.9 },
    u_blue: { type: "f", value: 0.1 },
    u_emissiveStrength: { type: "f", value: 0.17 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  let mesh;
  function createSphere() {
    const radius = window.innerWidth < 768 ? 2 : 4;
    const detail = window.innerWidth < 768 ? 20 : 40;

    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
    }

    const geometry = new THREE.IcosahedronGeometry(radius, detail);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.material.wireframe = true;
  }
  createSphere();

  // Set up post-processing effects
  const bloomEffect = new BloomEffect({
    luminanceThreshold: 0.0,
    luminanceSmoothing: 0.8,
    intensity: 0.85,
    mipmapBlur: true,
    radius: 0.18,
  });
  const effectPass = new EffectPass(camera, bloomEffect);
  effectPass.renderToScreen = true;

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  composer.addPass(effectPass);

  // Position the camera
  camera.position.set(0, 0, 18);
  camera.lookAt(0, 0, 0);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / (window.innerHeight + 200);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight + 200);
    composer.setSize(window.innerWidth, window.innerHeight + 200);
    createSphere(); // Recreate the sphere on resize
  });

  // Setup mouse controls
  let {
    getInitialPosition,
    getTargetPosition,
    updateOverlayPosition,
    getIsMouseOverScene,
    getIsMouseNearSphere,
  } = setupControls(mesh, camera, renderer);

  // Setup scroll animation
  setupScrollAnimation(
    mesh,
    camera,
    updateOverlayPosition,
    getInitialPosition()
  );

  // Start animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    if (mesh) {
      const elapsedTime = clock.getElapsedTime();
      mesh.rotation.x = elapsedTime * 0.6;
      mesh.rotation.y = elapsedTime * 0.8;
      uniforms.u_time.value = elapsedTime;
      uniforms.u_frequency.value = 45 + Math.sin(elapsedTime) * 5;
    }
    setupMagneticEffect(
      mesh,
      getInitialPosition(),
      getTargetPosition(),
      getIsMouseOverScene(),
      getIsMouseNearSphere()
    );

    composer.render();
  }

  animate();
}
