import * as THREE from "three";
import Experience from "../Experience.js";

// Clicking the "Text" object in the GLB (the K.K. Cruisin' cover/label near
// the desk) opens or closes the music player panel in the bottom right.
export default class MusicPlayerTrigger {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.camera = this.experience.camera.instance;
    this.pointer = this.experience.pointer;

    this.raycaster = new THREE.Raycaster();

    this.textMesh = null;

    window.addEventListener("room-loaded", () => this.findTextMesh(), {
      once: true,
    });

    this.setEvents();
  }

  findTextMesh() {
    const room = this.experience.world?.room?.model;
    if (!room) return;

    this.textMesh = room.getObjectByName("Text_Baked");

    if (!this.textMesh) {
      console.warn("MusicPlayerTrigger: Text_Baked not found");
    }
  }

  isHoveringText() {
    if (!this.textMesh) return false;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.textMesh, true);

    return intersects.length > 0;
  }

  setEvents() {
    window.addEventListener("pointermove", () => {
      // Don't fight MonitorFocus's cursor while zoomed into the monitor.
      if (this.experience.world?.monitorFocus?.isFocused) return;

      document.body.style.cursor = this.isHoveringText()
        ? "pointer"
        : "default";
    });

    window.addEventListener("pointerdown", () => {
      if (this.experience.world?.monitorFocus?.isFocused) return;
      if (!this.isHoveringText()) return;

      this.experience.musicPlayer?.togglePanel();
    });
  }

  update() {}
}
