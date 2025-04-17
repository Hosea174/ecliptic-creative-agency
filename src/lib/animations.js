import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function setupScrollAnimation(
  mesh,
  camera,
  updateOverlayPosition,
  initialPosition
) {
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

// --- New section animations ---

export function animateHeroSection() {
  // GSAP animations for the hero section
  console.log("Animate Hero Section"); // Placeholder for now
}
export function animateServicesSection() {
  const cardsWrapper = gsap.utils.toArray(".studio-section");
  const cardsEl = gsap.utils.toArray(".studio-section .wrapper");

  cardsWrapper.forEach((e, i) => {
    const card = cardsEl[i];
    let scale = 1,
      rotate = 0;

    if (i !== cardsEl.length - 1) {
      scale = 0.9 + 0.025 * i;
      rotate = -10;
    }

    gsap.to(card, {
      scale: scale,
      rotationX: rotate,
      transformOrigin: "top center",
      ease: "none",
      scrollTrigger: {
        trigger: e ,
        start: "top " + (70 + 40 * i),
        end: "bottom +=650px",
        endTrigger: ".end-animation",
        pin: e,
        pinSpacing: false,
        scrub: true,
      },
    });
  });
}
