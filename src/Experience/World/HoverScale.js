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
    this.pointer = new THREE.Vector2();

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

    if (!this.roomModel) {
      console.warn("HoverScale: no room model was provided.");
      return;
    }

    this.setObjects();
    this.setEvents();

    console.log("HoverScale: ready.");
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

      console.log("HoverScale: object added:", object.name);
    });
  }

  setEvents() {
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerleave", this.onPointerLeave);
  }

  onPointerMove = (event) => {
    if (!this.hoverObjects.length) return;

    const rect = this.canvas.getBoundingClientRect();

    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

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
      console.log("HoverScale: hovering:", this.hoveredObject.name);
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

      if (object === this.hoveredObject) {
        hoverData.targetScale.set(
          originalScale.x * this.hoverScaleMultiplier,
          originalScale.y * this.hoverScaleMultiplier,
          originalScale.z * this.hoverScaleMultiplier,
        );
      } else {
        hoverData.targetScale.copy(originalScale);
      }

      object.scale.lerp(hoverData.targetScale, this.ease);
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
