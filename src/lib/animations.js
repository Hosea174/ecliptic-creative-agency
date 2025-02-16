import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function setupScrollAnimation(
  mesh,
  camera,
  updateOverlayPosition,
  initialPosition
) {
  const threeWrapper = document.querySelector(".three-wrapper");
  console.log(threeWrapper);
  gsap.to(mesh.position, {
    x: 5,
    y: -3,
    scrollTrigger: {
      // markers: true,
      trigger: ".three-wrapper",
      start: "top 40%",
      end: "115% bottom",
      scrub: 2.5,
      ease: "power3.out",
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
    console.log("targetPosition from gsap", targetPosition);
    gsap.to(mesh.position, {
      x: initialPosition.x + targetPosition.x, // Add targetPosition as offset
      y: initialPosition.y + targetPosition.y, // Add targetPosition as offset
      z: initialPosition.z + targetPosition.z, // Add targetPosition as offset
      duration: 0.8, // Adjust duration for smoother effect
      ease: "power2.out", // Add easing for smoother transition
    });
  } else {
    // Return to scroll animation position with easing
    gsap.to(mesh.position, {
      x: initialPosition.x,
      y: initialPosition.y,
      z: initialPosition.z,
      duration: 0.6, // Adjust duration for smoother return
      ease: "power2.out", // Add easing for smoother transition
    });
  }
}
