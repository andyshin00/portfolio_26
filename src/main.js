import "./style.css";
import gsap from "gsap";

import Experience from "./Experience/Experience";

const canvas = document.querySelector("canvas.webgl");

if (!canvas) {
  throw new Error("Canvas not found");
}

// Loading screen
const loadingScreen = document.createElement("div");
loadingScreen.classList.add("loading-screen");

loadingScreen.innerHTML = `
  <div class="loading-box">
    <div class="loading-track">
      <div class="loading-segment segment-1"></div>
      <div class="loading-segment segment-2"></div>
      <div class="loading-segment segment-3"></div>
    </div>
  </div>
`;

document.body.appendChild(loadingScreen);

// GSAP looping loading animation
const loadingTimeline = gsap.timeline({
  repeat: -1,
});

loadingTimeline.fromTo(
  ".loading-segment",
  {
    x: -40,
    opacity: 0,
  },
  {
    x: 140,
    opacity: 1,
    duration: 1.1,
    stagger: 0.08,
    ease: "power1.inOut",
  },
);

// Listen for loading done
window.addEventListener("room-loaded", () => {
  loadingTimeline.kill();

  gsap.to(".loading-box", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
    onComplete: () => {
      document.querySelector(".loading-box").style.display = "none";

      const enterText = document.createElement("div");
      enterText.classList.add("enter-text");
      enterText.textContent = "Click anywhere to enter";

      loadingScreen.appendChild(enterText);

      gsap.fromTo(
        enterText,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
      );
    },
  });
});

loadingScreen.addEventListener("click", () => {
  gsap.to(loadingScreen, {
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    onComplete: () => {
      loadingScreen.remove();
    },
  });
});

new Experience(canvas);
