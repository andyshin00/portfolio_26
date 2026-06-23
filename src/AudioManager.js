import { Howl } from "howler";

import whooshSrc from "./assets/sounds/whoosh.mp3";
import kkSongSrc from "./assets/sounds/kk.mp3";

export const whoosh = new Howl({
  src: [whooshSrc],
  volume: 0.5,
});

export const kkSong = new Howl({
  src: [kkSongSrc],
  volume: 0.1,
  html5: true,
});
