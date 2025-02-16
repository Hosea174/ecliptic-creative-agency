import * as THREE from "three";
import { EffectComposer } from "postprocessing";
import { RenderPass } from "postprocessing";
import { BloomEffect, EffectPass } from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Vertex Shader
const vertexShader = `
  uniform float u_time;

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+10.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  uniform float u_frequency;

  void main() {
    float noise = 2.6 * pnoise(position + u_time, vec3(10.0));
    float displacement = (u_frequency / 30.) * (noise / 10.);
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform float u_red;
  uniform float u_green;
  uniform float u_blue;
  uniform float u_emissiveStrength; // Added for glow control

  void main() {
    // Calculate base color
    vec3 baseColor = vec3(u_red, u_green, u_blue);

    // Add emissive glow based on a uniform value
    vec3 glow = vec3(u_emissiveStrength);

    gl_FragColor = vec4(baseColor + glow, 1.0);
  }
`;

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(canvasWidth, canvasHeight);
renderer.setClearColor(0xffffff, 0);

const canvas = renderer.domElement;
// canvas.style.paddingBlock = "400px";
// canvas.style.position = "fixed";
// canvas.style.inset = "0";

const threeWrap = document.getElementsByClassName("three-wrapper")[0];
threeWrap.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  canvasWidth / canvasHeight,
  0.1,
  2000
);

// Raycaster for detecting mouse proximity to sphere
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const targetPosition = new THREE.Vector3();
const initialPosition = new THREE.Vector3(0, 0, 0);
let isMouseOverScene = false;
let isMouseNearSphere = false;

// Modified mouse position handler with proximity check
// function updateMousePosition(event) {
//   // Get mouse position in normalized device coordinates
//   mouse.x = (event.clientX / canvasWidth) * 2 - 1;
//   mouse.y = -(event.clientY / canvasHeight) * 2 + 1;

//   // Update raycaster
//   raycaster.setFromCamera(mouse, camera);

//   // Check for intersection with sphere
//   if (mesh) {
//     // Create a larger invisible sphere for intersection testing
//     const magneticRadius = mesh.geometry.parameters.radius * 1.3; // Adjust this multiplier to change the magnetic field size
//     const tempGeometry = new THREE.SphereGeometry(magneticRadius);
//     const boundingSphere = new THREE.Mesh(tempGeometry);
//     boundingSphere.position.copy(mesh.position);

//     const intersects = raycaster.intersectObject(boundingSphere);
//     isMouseNearSphere = intersects.length > 0;

//     // Set target position only if mouse is near sphere
//     if (isMouseNearSphere) {
//       targetPosition.set(
//         mouse.x * 1.5, // Reduced movement range
//         mouse.y * 1.5,
//         1.1
//       );
//     } else {
//       targetPosition.copy(initialPosition);
//     }

//     // Clean up temporary geometry
//     tempGeometry.dispose();
//   }
// }

function updateMousePosition(event) {
  // Get mouse position in normalized device coordinates
  mouse.x = (event.clientX / canvasWidth) * 2 - 1;
  mouse.y = -(event.clientY / canvasHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersection with sphere
  if (mesh) {
    // Calculate the distance between the mouse position and the mesh position
    const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(
      camera
    );
    console.log(`{"x":${mouseVector.x},"y":${mouseVector.y},"z":0}`);
    console.log(`initialPosition: ${JSON.stringify(initialPosition)}`);

    const ptDistance = Math.sqrt(
      Math.pow(mouseVector.x - initialPosition.x, 2) +
        Math.pow(mouseVector.y - initialPosition.y, 2)
    );

    // const magneticRadius = mesh.geometry.parameters.radius * 0.04; // Adjust this multiplier to change the magnetic field size
    const magneticRadius = 0.13;


    // Determine if the mouse is within the magnetic radius
    isMouseNearSphere = ptDistance <= magneticRadius;

    // Set target position only if mouse is near sphere
    if (isMouseNearSphere) {
      targetPosition.set(mouse.x * 1.8, mouse.y * 1.1, 1.1);
    } else {
      targetPosition.copy(initialPosition);
    }

    updateOverlayPosition();
  }
}

// Add mouse event listeners
threeWrap.addEventListener("mousemove", updateMousePosition);
threeWrap.addEventListener("mouseenter", () => {
  isMouseOverScene = true;
});
threeWrap.addEventListener("mouseleave", () => {
  isMouseOverScene = false;
  isMouseNearSphere = false;
  targetPosition.copy(initialPosition);
});

// Rest of your existing setup code
const uniforms = {
  u_time: { type: "f", value: 0.64 },
  u_frequency: { type: "f", value: 0.45 },
  u_red: { type: "f", value: 0.9 },
  u_green: { type: "f", value: 0.9 },
  u_blue: { type: "f", value: 0.2 },
  u_emissiveStrength: { type: "f", value: 0.15 },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
});

let mesh;
function createSphere() {
  let radius = window.innerWidth < 768 ? 2 : 4;
  let detail = canvasWidth < 768 ? 20 : 40;
  const geometry = new THREE.IcosahedronGeometry(radius, detail);
  if (mesh) {
    scene.remove(mesh);
  }
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.material.wireframe = true;
  // mesh.position.y -= mesh.geometry.parameters.radius * 0.65;
}

createSphere();

// Set up post-processing effects
const effectPass = new EffectPass(
  camera,
  new BloomEffect({
    luminanceThreshold: 0.0,
    luminanceSmoothing: 0.8,
    intensity: 0.85,
    mipmapBlur: true,
    radius: 0.18,
  })
);
const renderPass = new RenderPass(scene, camera);
effectPass.renderToScreen = true;

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(effectPass);
composer.setSize(canvasWidth, canvasHeight);
camera.position.set(0, 0, 14);
camera.lookAt(0, 0, 0);

function updateOverlayPosition() {
  if (mesh) {
    // Project the mesh position to 2D screen space
    const screenPosition = mesh.position.clone().project(camera);

    // Convert the screen position to pixel coordinates
    const screenX = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;

    // Update the position of the overlay element
    const overlay = document.querySelector(".three-overlay");
    // overlay.style.transform = `translate(-50%, -50%) translate(${screenX}px, ${screenY}px)`;
    overlay.style.left = `${screenX}px`;
    overlay.style.top = `${screenY}px`;
  }
}

// Modified animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  renderer.clear();

  const elapsedTime = clock.getElapsedTime();

  if (mesh) {
    // console.log(isMouseNearSphere);
    // console.log(isMouseOverScene);
    if (isMouseOverScene && isMouseNearSphere) {
      // Apply magnetic effect with easing when mouse is near
      gsap.to(mesh.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 0.8, // Adjust duration for smoother effect
        ease: "power2.out", // Add easing for smoother transition
      });
      console.log(`from if mouse block ${JSON.stringify(targetPosition)}`);
    } else {
      // Return to center with easing
      gsap.to(mesh.position, {
        x: initialPosition.x,
        y: initialPosition.y,
        z: initialPosition.z,
        duration: 0.6, // Adjust duration for smoother return
        ease: "power2.out", // Add easing for smoother transition
      });
      console.log(`from else block ${JSON.stringify(initialPosition)}`);
    }

    // Continue rotation
    mesh.rotation.x = elapsedTime * 0.6;
    mesh.rotation.y = elapsedTime * 0.8;
  }

  uniforms.u_time.value = elapsedTime;
  uniforms.u_frequency.value = 45 + Math.sin(elapsedTime) * 5;

  composer.render();
  updateOverlayPosition();
}

animate();

// Window resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  // createSphere();
  const radius = window.innerWidth < 768 ? 2 : 4;
  const detail = window.innerWidth < 768 ? 20 : 40;
  mesh.geometry.dispose(); // Dispose of the old geometry
  mesh.geometry = new THREE.IcosahedronGeometry(radius, detail);
});

// GSAP ScrollTrigger animation

gsap.to(mesh.position, {
  x: 5,
  y: -4,
  scrollTrigger: {
    trigger: ".three-wrapper",
    start: "40% top",
    end: "bottom bottom",
    scrub: 2.5,
    ease: "power2.out",
    // markers: true,
  },
  onUpdate: () => {
    initialPosition.copy(mesh.position);
    updateOverlayPosition();
  },
});
