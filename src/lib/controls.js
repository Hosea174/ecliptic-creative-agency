import gsap from "gsap";
import * as THREE from "three";

export function setupControls(mesh, camera, renderer) {
  const threeWrap = document.querySelector(".three-wrapper");
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isMouseOverScene = false;
  let isMouseNearSphere = false;
  const initialPosition = new THREE.Vector3(0, 0, 0);
  const targetPosition = new THREE.Vector3();

  // Function to calculate the distance between two points
  function calculateDistance(pointA, pointB) {
    return Math.sqrt(
      Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
    );
  }

  function updateMousePosition(event) {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    // Get mouse position in normalized device coordinates
    mouse.x = (event.clientX / canvasWidth) * 2 - 1;
    mouse.y = -(event.clientY / canvasHeight) * 2 + 1;
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    if (mesh) {
      // Calculate the distance between the mouse position and the mesh position
      const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(
        camera
      );

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

      // updateOverlayPosition();
    }
  }

  let isRequestingFrame = false;

  // Add event listeners for mouse interactions
  threeWrap.addEventListener("mousemove", updateMousePosition);
  threeWrap.addEventListener("mouseenter", () => {
    isMouseOverScene = true;
  });
  threeWrap.addEventListener("mouseleave", () => {
    isMouseOverScene = false;
    isMouseNearSphere = false;
    targetPosition.copy(initialPosition);
  });

  // Function to update the overlay position
  function updateOverlayPosition(mesh, camera) {
    if (mesh) {
      console.log("initialPosition from updateoverlay")
      console.log(initialPosition)
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
    getInitialPosition: () => initialPosition,
    getTargetPosition: () => targetPosition,
  };
}
