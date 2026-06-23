import "./style.css";
import gsap from "gsap";

import Experience from "./Experience/Experience";
import MusicPlayer from "./MusicPlayer.js";

const canvas = document.querySelector("canvas.webgl");

if (!canvas) {
  throw new Error("Canvas not found");
}

// Loading screen
const loadingScreen = document.createElement("div");
loadingScreen.classList.add("loading-screen");

loadingScreen.innerHTML = `
  <div class="loading-box">
    <div class="loading-dots">
      <span class="loading-dot dot-1"></span>
      <span class="loading-dot dot-2"></span>
      <span class="loading-dot dot-3"></span>
      <span class="loading-dot dot-4"></span>
    </div>

    <div class="loading-text">
      Loading <span class="loading-percent">0%</span>
    </div>
  </div>
`;

document.body.appendChild(loadingScreen);

// Loading dots animation
const loadingTimeline = gsap.timeline({
  repeat: -1,
  repeatDelay: 0.45,
});

loadingTimeline
  .to(".dot-1", {
    y: -12,
    duration: 0.22,
    ease: "power2.out",
  })
  .to(".dot-1", {
    y: 0,
    duration: 0.22,
    ease: "bounce.out",
  })
  .to(".dot-2", {
    y: -12,
    duration: 0.22,
    ease: "power2.out",
  })
  .to(".dot-2", {
    y: 0,
    duration: 0.22,
    ease: "bounce.out",
  })
  .to(".dot-3", {
    y: -12,
    duration: 0.22,
    ease: "power2.out",
  })
  .to(".dot-3", {
    y: 0,
    duration: 0.22,
    ease: "bounce.out",
  })
  .to(".dot-4", {
    y: -12,
    duration: 0.22,
    ease: "power2.out",
  })
  .to(".dot-4", {
    y: 0,
    duration: 0.22,
    ease: "bounce.out",
  });

// Fake percent counter while assets load
const loadingPercent = {
  value: 0,
};

gsap.to(loadingPercent, {
  value: 95,
  duration: 4,
  ease: "power1.out",
  onUpdate: () => {
    const percentElement = document.querySelector(".loading-percent");

    if (percentElement) {
      percentElement.textContent = `${Math.round(loadingPercent.value)}%`;
    }
  },
});

// Hero text
const heroText = document.createElement("div");
heroText.classList.add("hero-text");
heroText.style.opacity = "0";
heroText.style.transform = "translateY(20px)";

heroText.innerHTML = `
  <h1>안녕, hi, i'm andrew</h1>
  <p>software developer - portfolio '26</p>
`;

document.body.appendChild(heroText);

// When the room is done loading, fade into the scene
window.addEventListener("room-loaded", () => {
  loadingTimeline.kill();

  const percentElement = document.querySelector(".loading-percent");

  gsap.to(loadingPercent, {
    value: 100,
    duration: 0.4,
    ease: "power1.out",
    onUpdate: () => {
      if (percentElement) {
        percentElement.textContent = `${Math.round(loadingPercent.value)}%`;
      }
    },
    onComplete: () => {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => {
          loadingScreen.remove();

          gsap.to(heroText, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          });
        },
      });
    },
  });
});

// App start
new MusicPlayer();
new Experience(canvas);
