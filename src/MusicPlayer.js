import { kkSong } from "./AudioManager.js";

export default class MusicPlayer {
  constructor() {
    this.sound = kkSong;

    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.3;

    this.duration = 0;
    this.raf = null;

    this.icons = {
      play: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
      pause: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
      skipBack: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`,
      skipForward: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
      volume: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
      mute: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`,
    };

    this.createElement();
    this.setElements();
    this.setEvents();
    this.setInitialState();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("music-player");

    this.element.innerHTML = `
      <div class="mp-top">
        <button class="mp-thumb" id="mp-thumb-btn" type="button">
          <div class="mp-thumb-icon">${this.icons.play}</div>
        </button>

        <div class="mp-info">
          <span class="mp-title">
K.K. Cruisin'</span>
          <span class="mp-artist">Mesmonium</span>
        </div>

        <div class="mp-controls">
          <button class="mp-btn" id="mp-prev" type="button">${this.icons.skipBack}</button>
          <button class="mp-btn mp-play-btn" id="mp-play" type="button">${this.icons.play}</button>
          <button class="mp-btn" id="mp-next" type="button">${this.icons.skipForward}</button>
          <button class="mp-btn" id="mp-mute" type="button">${this.icons.volume}</button>
          <input type="range" class="mp-vol-slider" id="mp-vol" min="0" max="1" step="0.01" value="0.1">
        </div>
      </div>

      <div class="mp-bottom">
        <span class="mp-time" id="mp-current">0:00</span>

        <div class="mp-seek-wrap">
          <div class="mp-seek-track">
            <div class="mp-seek-fill" id="mp-seek-fill"></div>
          </div>
          <input type="range" class="mp-seek-slider" id="mp-seek" min="0" max="100" step="0.1" value="0">
        </div>

        <span class="mp-time" id="mp-duration">0:00</span>
      </div>
    `;

    document.body.appendChild(this.element);
  }

  setElements() {
    this.playButton = this.element.querySelector("#mp-play");
    this.thumbButton = this.element.querySelector("#mp-thumb-btn");
    this.thumbIcon = this.element.querySelector(".mp-thumb-icon");

    this.prevButton = this.element.querySelector("#mp-prev");
    this.nextButton = this.element.querySelector("#mp-next");

    this.muteButton = this.element.querySelector("#mp-mute");
    this.volumeSlider = this.element.querySelector("#mp-vol");

    this.seekSlider = this.element.querySelector("#mp-seek");
    this.seekFill = this.element.querySelector("#mp-seek-fill");

    this.currentTimeText = this.element.querySelector("#mp-current");
    this.durationText = this.element.querySelector("#mp-duration");
  }

  setInitialState() {
    this.sound.volume(this.volume);

    this.sound.once("load", () => {
      this.duration = this.sound.duration();
      this.seekSlider.max = this.duration;
      this.durationText.textContent = this.formatTime(this.duration);
    });

    this.sound.on("end", () => {
      this.isPlaying = false;
      this.updatePlayIcon();
      this.stopProgressLoop();
    });

    if (this.sound.state() === "loaded") {
      this.duration = this.sound.duration();
      this.seekSlider.max = this.duration;
      this.durationText.textContent = this.formatTime(this.duration);
    }
  }

  setEvents() {
    this.playButton.addEventListener("click", () => this.toggle());
    this.thumbButton.addEventListener("click", () => this.toggle());

    this.prevButton.addEventListener("click", () => {
      this.seek(Math.max(0, this.sound.seek() - 10));
    });

    this.nextButton.addEventListener("click", () => {
      const duration = this.sound.duration() || 0;
      this.seek(Math.min(duration, this.sound.seek() + 10));
    });

    this.muteButton.addEventListener("click", () => this.toggleMute());

    this.volumeSlider.addEventListener("input", (event) => {
      this.setVolume(parseFloat(event.target.value));
    });

    this.seekSlider.addEventListener("input", (event) => {
      this.seek(parseFloat(event.target.value));
    });
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.sound.play();
    this.isPlaying = true;
    this.updatePlayIcon();
    this.startProgressLoop();
  }

  pause() {
    this.sound.pause();
    this.isPlaying = false;
    this.updatePlayIcon();
    this.stopProgressLoop();
  }

  seek(time) {
    this.sound.seek(time);
    this.updateProgress();
  }

  setVolume(volume) {
    this.volume = volume;
    this.sound.volume(volume);

    if (volume === 0) {
      this.isMuted = true;
      this.sound.mute(true);
    } else {
      this.isMuted = false;
      this.sound.mute(false);
    }

    this.updateMuteIcon();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.sound.mute(this.isMuted);
    this.updateMuteIcon();
  }

  updatePlayIcon() {
    const icon = this.isPlaying ? this.icons.pause : this.icons.play;

    this.playButton.innerHTML = icon;
    this.thumbIcon.innerHTML = icon;
  }

  updateMuteIcon() {
    this.muteButton.innerHTML = this.isMuted
      ? this.icons.mute
      : this.icons.volume;
  }

  startProgressLoop() {
    this.stopProgressLoop();

    const tick = () => {
      this.updateProgress();
      this.raf = window.requestAnimationFrame(tick);
    };

    tick();
  }

  stopProgressLoop() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  updateProgress() {
    const current = this.sound.seek() || 0;
    const duration = this.sound.duration() || 1;

    this.seekSlider.value = current;
    this.currentTimeText.textContent = this.formatTime(current);
    this.seekFill.style.width = `${(current / duration) * 100}%`;
  }

  formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }
}
