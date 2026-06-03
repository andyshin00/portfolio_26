import { Howl } from "howler";

import ambienceSrc from "./assets/sounds/ambience.mp3";
import whooshSrc from "./assets/sounds/whoosh.mp3";

export const ambience = new Howl({
  src: [ambienceSrc],
  loop: true,
  volume: 0.25,
});

export const whoosh = new Howl({
  src: [whooshSrc],
  volume: 0.5,
});

export function initAmbience() {
  if (ambience.playing()) return;

  const tryPlay = () => {
    try {
      ambience.play();
    } catch (error) {
      console.warn("Failed to start ambience:", error);
    }
  };

  tryPlay();

  if (!ambience.playing()) {
    window.addEventListener(
      "pointerdown",
      () => {
        if (!ambience.playing()) {
          tryPlay();
        }
      },
      { once: true },
    );
  }
}
