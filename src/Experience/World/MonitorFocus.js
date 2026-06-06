import * as THREE from "three";
import gsap from "gsap";
import Experience from "../Experience.js";
import { whoosh } from "../../AudioManager.js";

export default class MonitorFocus {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.controls = this.experience.camera.controls;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.isFocused = false;
    this.isAnimating = false;
    this.monitorMesh = null;

    this.defaultCameraPosition = this.camera.position.clone();
    this.defaultTarget = this.controls.target.clone();

    // Change these later after testing
    this.focusCameraPosition = new THREE.Vector3(0.2, 1.4, 0.3);
    this.focusTarget = new THREE.Vector3(-0.9, 1.75, -0.1);

    this.setEvents();
  }

  findMonitorMesh() {
    if (!this.experience.world.room.model) return;

    this.monitorMesh =
      this.experience.world.room.model.getObjectByName("Computer");

    if (!this.monitorMesh) {
      console.warn("MonitorFocus: Object_12 not found");
    }
  }

  setEvents() {
    window.addEventListener("pointerdown", (event) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (!this.monitorMesh) {
        this.findMonitorMesh();
      }

      if (this.isAnimating) return;

      if (!this.isFocused) {
        this.checkMonitorClick();
      } else {
        this.checkExitClick();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isFocused) {
        this.exitFocus();
      }
    });
  }

  checkMonitorClick() {
    if (!this.monitorMesh) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.monitorMesh, true);

    if (intersects.length > 0) {
      this.enterFocus();
    }
  }

  checkExitClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.monitorMesh, true);

    if (intersects.length === 0) {
      this.exitFocus();
    }
  }

  enterFocus() {
    this.isFocused = true;
    this.isAnimating = true;

    this.defaultCameraPosition.copy(this.camera.position);
    this.defaultTarget.copy(this.controls.target);

    this.controls.enabled = false;

    whoosh.play();

    gsap.to(this.camera.position, {
      x: this.focusCameraPosition.x,
      y: this.focusCameraPosition.y,
      z: this.focusCameraPosition.z,
      duration: 1.2,
      ease: "power3.inOut",
    });

    gsap.to(this.controls.target, {
      x: this.focusTarget.x,
      y: this.focusTarget.y,
      z: this.focusTarget.z,
      duration: 1.2,
      ease: "power3.inOut",
      onUpdate: () => {
        this.controls.update();
      },
      onComplete: () => {
        this.isAnimating = false;

        document.body.classList.add("monitor-focused");

        if (this.experience.world.monitor) {
          this.experience.world.monitor.showIframe();
        }
      },
    });
  }

  exitFocus() {
    this.isFocused = false;
    this.isAnimating = true;

    whoosh.play();

    document.body.classList.remove("monitor-focused");

    if (this.experience.world.monitor) {
      this.experience.world.monitor.hideIframe();
    }

    gsap.to(this.camera.position, {
      x: this.defaultCameraPosition.x,
      y: this.defaultCameraPosition.y,
      z: this.defaultCameraPosition.z,
      duration: 1.2,
      ease: "power3.inOut",
    });

    gsap.to(this.controls.target, {
      x: this.defaultTarget.x,
      y: this.defaultTarget.y,
      z: this.defaultTarget.z,
      duration: 1.2,
      ease: "power3.inOut",
      onUpdate: () => {
        this.controls.update();
      },
      onComplete: () => {
        this.controls.enabled = true;
        this.isAnimating = false;
      },
    });
  }

  update() {}
}
