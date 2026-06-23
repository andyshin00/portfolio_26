import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import Experience from "./Experience.js";

export default class Camera {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
    this.setKeyboardShortcuts();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      100,
    );

    this.instance.position.set(1.75, 2.17, 4.53);
    this.scene.add(this.instance);
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.025;

    this.controls.rotateSpeed = 0.1;
    this.controls.zoomSpeed = 0.65;

    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;

    this.controls.screenSpacePanning = false;

    this.controls.target.set(-3.37, 0.33, -0.21);
    /**
     * Free camera mode while positioning.
     * Keep these loose so you can move freely.
     */
    this.controls.minPolarAngle = 1.25;
    this.controls.maxPolarAngle = 1.42;

    this.controls.minAzimuthAngle = 0.55;
    this.controls.maxAzimuthAngle = 1.05;

    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 7;

    this.controls.update();

    this.canvas.style.touchAction = "none";
  }

  setKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "p") {
        this.printCameraSettings();
      }
    });
  }

  printCameraSettings() {
    this.controls.update();

    console.log(`
/**
 * Paste these values into Camera.js
 */

this.instance.position.set(
  ${this.instance.position.x.toFixed(2)},
  ${this.instance.position.y.toFixed(2)},
  ${this.instance.position.z.toFixed(2)}
);

this.controls.target.set(
  ${this.controls.target.x.toFixed(2)},
  ${this.controls.target.y.toFixed(2)},
  ${this.controls.target.z.toFixed(2)}
);

this.controls.minPolarAngle = ${this.controls.minPolarAngle.toFixed(2)};
this.controls.maxPolarAngle = ${this.controls.maxPolarAngle.toFixed(2)};

this.controls.minAzimuthAngle = ${this.controls.minAzimuthAngle.toFixed(2)};
this.controls.maxAzimuthAngle = ${this.controls.maxAzimuthAngle.toFixed(2)};

this.controls.minDistance = ${this.controls.minDistance.toFixed(2)};
this.controls.maxDistance = ${this.controls.maxDistance.toFixed(2)};
`);
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
