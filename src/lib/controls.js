import gsap from "gsap";
import * as THREE from "three";

export function setupControls(mesh, camera, renderer) {
  const threeWrap = document.querySelector(".three-wrapper");
  const bodyElem = document.querySelector("body");

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isMouseOverScene = false;
  let isMouseNearSphere = false;
  const initialPosition = new THREE.Vector3(0, 0, 0); // True initial position
  const scrollAnimationPosition = new THREE.Vector3(0, 0, 0); // Position updated by scroll animation
  const targetPosition = new THREE.Vector3();

  function updateMousePosition(event) {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight + 200;
    // Get mouse position in normalized device coordinates
    mouse.x = (event.clientX / canvasWidth) * 2 - 1;
    mouse.y = -(event.clientY / canvasHeight) * 2 + 1;
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    if (mesh) {
      // Calculate the distance between the mouse position and the mesh position
      const initialPositionNDC = scrollAnimationPosition.clone().project(camera); 

      // Calculate the distance between the mouse position and the initial position in NDC
      const ptDistance = Math.sqrt(
        Math.pow(mouse.x - initialPositionNDC.x, 2) +
          Math.pow(mouse.y - initialPositionNDC.y, 2)
      );

      const magneticRadius = 1;

      // Determine if the mouse is within the magnetic radius
      isMouseNearSphere = ptDistance <= magneticRadius;
      // Set target position only if mouse is near sphere
      if (isMouseNearSphere) {
        console.log("targetPosition from updatemouseposition", targetPosition);
        targetPosition.set(mouse.x * 1.5, mouse.y * 0.5, 0);
      } else {
        targetPosition.copy(initialPosition); 
      }

      // updateOverlayPosition();
    }
  }
  // Add event listeners for mouse interactions
  bodyElem.addEventListener("mousemove", updateMousePosition);
  bodyElem.addEventListener("mouseenter", () => {
    isMouseOverScene = true;
  });
  bodyElem.addEventListener("mouseleave", () => {
    isMouseOverScene = false;
    isMouseNearSphere = false;
    targetPosition.copy(initialPosition); // Reset targetPosition when mouse leaves - same as above, might need to change this back to scrollAnimationPosition?
  });

  // Function to update the overlay position
  function updateOverlayPosition(mesh, camera) {
    if (mesh) {
      const screenPosition = mesh.position.clone().project(camera);
      const screenX = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;

      const overlay = document.querySelector(".three-overlay");
      overlay.style.left = `${screenX}px`;
      overlay.style.top = `${screenY}px`;
    }
  }

  return {
    updateOverlayPosition,
    getIsMouseOverScene: () => isMouseOverScene,
    getIsMouseNearSphere: () => isMouseNearSphere,
    getInitialPosition: () => initialPosition, // Return true initial position
    getScrollAnimationPosition: () => scrollAnimationPosition, // Return scroll animation position
    getTargetPosition: () => targetPosition,
  };
}
