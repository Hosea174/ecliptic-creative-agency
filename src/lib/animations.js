import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function setupScrollAnimation(
  mesh,
  camera,
  updateOverlayPosition,
  initialPosition,
) {
  gsap.to(mesh.position, {
    x: 5,
    y: -4,
    scrollTrigger: {
      trigger: ".three-wrapper",
      start: "40% top",
      end: "bottom bottom",
      scrub: 2.5,
      ease: "power2.out",
    },
    onUpdate: () => {
      initialPosition.copy(mesh.position);
      updateOverlayPosition(mesh, camera);
    },
  });
}

export function setupMagneticEffect(
  mesh,
  initialPosition,
  targetPosition,
  isMouseOverScene,
  isMouseNearSphere
) {
  if (isMouseOverScene && isMouseNearSphere) {
    // Apply magnetic effect with easing when mouse is near
    gsap.to(mesh.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 0.8, // Adjust duration for smoother effect
      ease: "power2.out", // Add easing for smoother transition
    });
  } else {
    // Return to center with easing
    gsap.to(mesh.position, {
      x: initialPosition.x,
      y: initialPosition.y,
      z: initialPosition.z,
      duration: 0.6, // Adjust duration for smoother return
      ease: "power2.out", // Add easing for smoother transition
    });
  }
}
