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
    this.pointer = this.experience.pointer;

    this.isFocused = false;
    this.isAnimating = false;

    this.monitorMeshes = [];

    this.defaultCameraPosition = this.camera.position.clone();
    this.defaultTarget = this.controls.target.clone();

    // Move the camera closer to the monitor to increase the zoom-in effect.
    this.focusCameraPosition = new THREE.Vector3(-0.9, 1.7, 1);
    this.focusTarget = new THREE.Vector3(-0.9, 1.7, -0.05);

    this.defaultControlLimits = {
      minPolarAngle: this.controls.minPolarAngle,
      maxPolarAngle: this.controls.maxPolarAngle,
      minAzimuthAngle: this.controls.minAzimuthAngle,
      maxAzimuthAngle: this.controls.maxAzimuthAngle,
      minDistance: this.controls.minDistance,
      maxDistance: this.controls.maxDistance,
    };

    window.addEventListener("room-loaded", () => this.findMonitorMesh(), { once: true });

    this.setEvents();
  }

  findMonitorMesh() {
    const room = this.experience.world?.room?.model;
    if (!room) return;

    const computer = room.getObjectByName("Computer_Baked");
    const comp2 = room.getObjectByName("comp2_Baked");

    this.monitorMeshes = [computer, comp2].filter(Boolean);

    if (this.monitorMeshes.length === 0) {
      console.warn("MonitorFocus: Computer_Baked / comp2_Baked not found");

      room.traverse((child) => {
        if (child.isMesh) {
          console.log(child.name);
        }
      });
    }
  }

  isHoveringMonitor() {
    if (!this.monitorMeshes || this.monitorMeshes.length === 0) return false;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.monitorMeshes,
      true,
    );

    return intersects.length > 0;
  }

  setEvents() {
    window.addEventListener("pointermove", () => {
      if (this.isFocused || this.isAnimating) {
        document.body.style.cursor = "default";
        return;
      }

      document.body.style.cursor = this.isHoveringMonitor()
        ? "pointer"
        : "default";
    });

    window.addEventListener("pointerdown", () => {
      if (this.isAnimating) return;

      if (!this.isFocused) {
        this.checkMonitorClick();
      } else {
        this.checkExitClick();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isFocused && !this.isAnimating) {
        this.exitFocus();
      }
    });
  }

  checkMonitorClick() {
    if (this.isHoveringMonitor()) {
      document.body.style.cursor = "default";
      this.enterFocus();
    }
  }

  checkExitClick() {
    if (!this.isHoveringMonitor()) {
      this.exitFocus();
    }
  }

  hideHeroText() {
    const heroText = document.querySelector(".hero-text");

    if (!heroText) return;

    gsap.to(heroText, {
      opacity: 0,
      y: 20,
      duration: 0.55,
      ease: "power2.out",
      pointerEvents: "none",
    });
  }

  showHeroText() {
    const heroText = document.querySelector(".hero-text");

    if (!heroText) return;

    gsap.to(heroText, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      ease: "power2.out",
      pointerEvents: "none",
    });
  }

  disableControlLimits() {
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;

    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;

    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;
  }

  restoreControlLimits() {
    this.controls.minPolarAngle = this.defaultControlLimits.minPolarAngle;
    this.controls.maxPolarAngle = this.defaultControlLimits.maxPolarAngle;

    this.controls.minAzimuthAngle = this.defaultControlLimits.minAzimuthAngle;
    this.controls.maxAzimuthAngle = this.defaultControlLimits.maxAzimuthAngle;

    this.controls.minDistance = this.defaultControlLimits.minDistance;
    this.controls.maxDistance = this.defaultControlLimits.maxDistance;
  }

  enterFocus() {
    this.isFocused = true;
    this.isAnimating = true;

    document.body.style.cursor = "default";

    this.hideHeroText();

    this.defaultCameraPosition.copy(this.camera.position);
    this.defaultTarget.copy(this.controls.target);

    this.controls.enabled = false;
    this.disableControlLimits();

    whoosh.play();

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

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
        this.camera.lookAt(this.controls.target);
      },
      onComplete: () => {
        this.camera.lookAt(this.controls.target);

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

    document.body.style.cursor = "default";

    whoosh.play();

    document.body.classList.remove("monitor-focused");

    if (this.experience.world.monitor) {
      this.experience.world.monitor.hideIframe();
    }

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

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
        this.camera.lookAt(this.controls.target);
      },
      onComplete: () => {
        this.restoreControlLimits();

        this.controls.enabled = true;
        this.controls.update();

        this.isAnimating = false;

        this.showHeroText();
      },
    });
  }

  update() {}
}
