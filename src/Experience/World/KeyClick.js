import * as THREE from "three";
import gsap from "gsap";
import { Howl } from "howler";

import Experience from "../Experience.js";

import popSoundUrl from "../../assets/sounds/pop.mp3?url";

export default class KeyClick {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.canvas = this.experience.canvas;
    this.room = this.experience.world?.room?.model;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.keys = {
      ctrl: {
        objectName: "key1_Baked",
        mesh: null,
        startY: 0,
      },
      c: {
        objectName: "key2_Baked",
        mesh: null,
        startY: 0,
      },
      v: {
        objectName: "key3_Baked",
        mesh: null,
        startY: 0,
      },
    };

    this.isAnimating = new Map();

    this.sound = new Howl({
      src: [popSoundUrl],
      volume: 0.45,
    });

    if (this.room) {
      this.findKeys();
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

        this.findKeys();
      }
    }, 100);
  }

  findKeys() {
    Object.values(this.keys).forEach((keyData) => {
      keyData.mesh = this.room.getObjectByName(keyData.objectName);

      if (!keyData.mesh) {
        console.warn(`KeyClick: ${keyData.objectName} not found`);
        return;
      }

      keyData.startY = keyData.mesh.position.y;
      this.isAnimating.set(keyData.objectName, false);
    });
  }

  setPointer(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  getClickableMeshes() {
    return Object.values(this.keys)
      .map((keyData) => keyData.mesh)
      .filter(Boolean);
  }

  getHoveredKey() {
    const clickableMeshes = this.getClickableMeshes();

    if (clickableMeshes.length === 0) return null;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObjects(clickableMeshes, true);

    if (intersects.length === 0) return null;

    const clickedObject = intersects[0].object;

    return Object.values(this.keys).find((data) => {
      if (!data.mesh) return false;

      return (
        clickedObject === data.mesh ||
        data.mesh.children.includes(clickedObject) ||
        clickedObject.parent === data.mesh
      );
    });
  }

  setEvents() {
    window.addEventListener("pointermove", (event) => {
      this.setPointer(event);

      const hoveredKey = this.getHoveredKey();

      if (hoveredKey) {
        this.canvas.style.cursor = "pointer";
      } else if (this.canvas.style.cursor === "pointer") {
        this.canvas.style.cursor = "default";
      }
    });

    window.addEventListener("pointerdown", (event) => {
      this.setPointer(event);

      const keyData = this.getHoveredKey();

      if (!keyData) return;

      this.pressKey(keyData);
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (event.ctrlKey && key === "control") {
        this.pressKey(this.keys.ctrl);
        return;
      }

      if (key === "control") {
        this.pressKey(this.keys.ctrl);
        return;
      }

      if (key === "c") {
        this.pressKey(this.keys.c);
        return;
      }

      if (key === "v") {
        this.pressKey(this.keys.v);
      }
    });
  }

  pressKey(keyData) {
    if (!keyData || !keyData.mesh) return;

    const animating = this.isAnimating.get(keyData.objectName);

    if (animating) return;

    this.isAnimating.set(keyData.objectName, true);

    this.sound.stop();
    this.sound.play();

    gsap.killTweensOf(keyData.mesh.position);

    gsap
      .timeline({
        onComplete: () => {
          keyData.mesh.position.y = keyData.startY;
          this.isAnimating.set(keyData.objectName, false);
        },
      })
      .to(keyData.mesh.position, {
        y: keyData.startY - 0.025,
        duration: 0.07,
        ease: "power2.out",
      })
      .to(keyData.mesh.position, {
        y: keyData.startY,
        duration: 0.12,
        ease: "back.out(2)",
      });
  }

  update() {}
}
