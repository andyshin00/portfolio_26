import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Debug from "./Utils/Debug.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";

let instance = null;

export default class Experience {
  constructor(canvas) {
    if (instance) return instance;

    instance = this;

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.cssScene = new THREE.Scene();
    this.pointer = new THREE.Vector2();

    this.sizes = new Sizes();
    this.time = new Time();
    this.debug = new Debug();

    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("tick", () => {
      this.update();
    });

    // Capture phase so pointer is fresh before any element handler reads it.
    // Also update on pointerdown so a first click with no prior mouse move
    // (e.g. touch, or the cursor already resting over the target) still
    // raycasts against the real position instead of a stale (0, 0).
    const updatePointer = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener("pointermove", updatePointer, { capture: true });
    window.addEventListener("pointerdown", updatePointer, { capture: true });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
