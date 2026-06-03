import * as THREE from "three";
import gsap from "gsap";

import Experience from "../Experience.js";

export default class Drawer {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.camera = this.experience.camera.instance;
    this.room = this.experience.world?.room?.model;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.drawerMesh = null;
    this.buttonMesh = null;

    this.isOpen = false;
    this.isAnimating = false;

    this.openDistance = 0.45;

    this.drawerClosedZ = 0;
    this.buttonClosedZ = 0;

    if (this.room) {
      this.findObjects();
    } else {
      this.waitForModel();
    }

    this.setEvents();
  }

  waitForModel() {
    const interval = setInterval(() => {
      if (this.experience.world?.room?.model) {
        clearInterval(interval);

        this.room = this.experience.world.room.model;

        this.findObjects();
      }
    }, 100);
  }

  findObjects() {
    this.drawerMesh = this.room.getObjectByName("Drawer");
    this.buttonMesh = this.room.getObjectByName("button");

    if (!this.drawerMesh) {
      console.warn("Drawer: Drawer object not found");
      return;
    }

    if (!this.buttonMesh) {
      console.warn("Drawer: Button object not found");
      return;
    }

    this.drawerClosedZ = this.drawerMesh.position.z;
    this.buttonClosedZ = this.buttonMesh.position.z;
  }

  setEvents() {
    window.addEventListener("pointerdown", (event) => {
      if (!this.drawerMesh || this.isAnimating) return;

      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObject(this.drawerMesh, true);

      if (intersects.length > 0) {
        this.toggleDrawer();
      }
    });
  }

  toggleDrawer() {
    if (!this.isOpen) {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isOpen = true;
    this.isAnimating = true;

    gsap.to(this.drawerMesh.position, {
      z: this.drawerClosedZ + this.openDistance,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.to(this.buttonMesh.position, {
      z: this.buttonClosedZ + this.openDistance,
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => {
        this.isAnimating = false;
      },
    });
  }

  closeDrawer() {
    this.isOpen = false;
    this.isAnimating = true;

    gsap.to(this.drawerMesh.position, {
      z: this.drawerClosedZ,
      duration: 0.8,
      ease: "power3.inOut",
    });

    gsap.to(this.buttonMesh.position, {
      z: this.buttonClosedZ,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        this.isAnimating = false;
      },
    });
  }

  update() {}
}
