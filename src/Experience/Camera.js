import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Experience from "./Experience.js";

export default class Camera {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;

    this.setInstance();
    this.setControls();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      100,
    );

    this.instance.position.set(-6.4, 2.3, 6.25);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);

    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minAzimuthAngle = -Math.PI / 2;
    this.controls.maxAzimuthAngle = 0;

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.screenSpacePanning = false;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    this.canvas.style.touchAction = "none";
  }

  setDebug() {
    const cameraFolder = this.debug.ui.addFolder("Camera");

    cameraFolder.add(this.instance.position, "x").min(-20).max(20).step(0.01);

    cameraFolder.add(this.instance.position, "y").min(-20).max(20).step(0.01);

    cameraFolder.add(this.instance.position, "z").min(-20).max(20).step(0.01);

    cameraFolder.add(this.controls.target, "x").min(-20).max(20).step(0.01);

    cameraFolder.add(this.controls.target, "y").min(-20).max(20).step(0.01);

    cameraFolder.add(this.controls.target, "z").min(-20).max(20).step(0.01);
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;

    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
