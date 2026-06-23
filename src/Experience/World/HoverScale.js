// src/Experience/World/HoverScale.js

import * as THREE from "three";
import Experience from "../Experience.js";

export default class HoverScale {
  constructor(roomModel) {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.camera = this.experience.camera.instance;
    this.canvas = this.experience.canvas;

    this.roomModel = roomModel;

    this.raycaster = new THREE.Raycaster();

    this.hoverScaleMultiplier = 1.5;
    this.ease = 0.12;

    this.targetNames = [
      "bone_Baked",
      "Object_4_Baked",
      "3_Baked",
      "D_Baked",
      "W_Baked",
      "E_Baked",
      "B_Baked",
      "naruto_Baked",
    ];

    this.hoverObjects = [];
    this.hoveredObject = null;

    if (!this.roomModel) return;

    this.setObjects();
    this.setEvents();
  }

  setObjects() {
    this.hoverObjects = [];

    this.targetNames.forEach((name) => {
      const object = this.roomModel.getObjectByName(name);

      if (!object) {
        console.warn(`HoverScale: object not found: ${name}`);
        return;
      }

      object.userData.hoverScale = {
        originalScale: object.scale.clone(),
        targetScale: object.scale.clone(),
      };

      this.hoverObjects.push(object);
    });
  }

  setEvents() {
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  onPointerMove = () => {
    if (!this.hoverObjects.length) return;

    this.raycaster.setFromCamera(this.experience.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(this.hoverObjects, true);

    if (intersects.length === 0) {
      this.setHoveredObject(null);
      return;
    }

    const clickedChild = intersects[0].object;
    const hoverObject = this.getParentHoverObject(clickedChild);

    this.setHoveredObject(hoverObject);
  };

  onPointerLeave = () => {
    this.setHoveredObject(null);
  };

  getParentHoverObject(object) {
    let current = object;

    while (current) {
      if (this.hoverObjects.includes(current)) {
        return current;
      }

      current = current.parent;
    }

    return null;
  }

  setHoveredObject(object) {
    if (this.hoveredObject === object) return;

    this.hoveredObject = object;

    if (this.hoveredObject) {
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "";
    }
  }

  update() {
    if (!this.hoverObjects.length) return;

    this.hoverObjects.forEach((object) => {
      const hoverData = object.userData.hoverScale;

      if (!hoverData) return;

      const originalScale = hoverData.originalScale;
      const target = hoverData.targetScale;

      if (object === this.hoveredObject) {
        target.set(
          originalScale.x * this.hoverScaleMultiplier,
          originalScale.y * this.hoverScaleMultiplier,
          originalScale.z * this.hoverScaleMultiplier,
        );
      } else {
        target.copy(originalScale);
      }

      if (object.scale.distanceToSquared(target) < 1e-8) {
        object.scale.copy(target);
        return;
      }

      object.scale.lerp(target, this.ease);
    });
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
      this.canvas.style.cursor = "";
    }

    this.hoverObjects.forEach((object) => {
      const hoverData = object.userData.hoverScale;

      if (hoverData) {
        object.scale.copy(hoverData.originalScale);
      }

      delete object.userData.hoverScale;
    });

    this.hoverObjects = [];
    this.hoveredObject = null;
  }
}
