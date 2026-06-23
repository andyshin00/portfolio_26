import * as THREE from "three";

import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import Experience from "./Experience.js";

export default class Renderer {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.setWebGLRenderer();
    this.setCSSRenderer();
  }

  setWebGLRenderer() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.instance.setSize(this.sizes.width, this.sizes.height);

    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.instance.outputColorSpace = THREE.SRGBColorSpace;

    this.instance.shadowMap.enabled = true;

    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setCSSRenderer() {
    this.cssRenderer = new CSS3DRenderer();

    this.cssRenderer.setSize(this.sizes.width, this.sizes.height);

    this.cssRenderer.domElement.classList.add("css3d-renderer");

    this.cssRenderer.domElement.style.position = "absolute";
    this.cssRenderer.domElement.style.top = "0";
    this.cssRenderer.domElement.style.left = "0";

    document.body.appendChild(this.cssRenderer.domElement);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);

    this.cssRenderer.setSize(this.sizes.width, this.sizes.height);
  }

  update() {
    // CSS3DRenderer only updates the camera's matrixWorld itself when the
    // camera has no parent. Our camera is added to `scene`, so without this
    // explicit call CSS3DRenderer reads a stale (previous frame's) camera
    // matrix while WebGLRenderer always gets the fresh one via
    // scene.updateMatrixWorld() - causing the CSS3D object to lag one frame
    // behind and "wobble" relative to the 3D scene while orbiting.
    this.camera.instance.updateMatrixWorld();

    this.cssRenderer.render(this.experience.cssScene, this.camera.instance);

    if (this.experience.world?.godRays) {
      return;
    }

    this.instance.render(
      this.experience.scene,
      this.experience.camera.instance,
    );
  }
}
