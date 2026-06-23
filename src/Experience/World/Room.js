// src/Experience/World/Room.js

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import Experience from "../Experience.js";

import roomModelUrl from "../../assets/models/room.glb?url";

export default class Room {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;

    this.loader = new GLTFLoader();

    this.model = null;
    this.isLoaded = false;

    this.loadModel();
  }

  loadModel() {
    this.loader.load(
      roomModelUrl,

      (gltf) => {
        this.model = gltf.scene;
        this.isLoaded = true;

        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.model);

        console.log("Room: model loaded:", this.model);

        window.dispatchEvent(
          new CustomEvent("room-loaded", {
            detail: {
              model: this.model,
            },
          }),
        );
      },

      (progress) => {
        if (progress.total > 0) {
          console.log(
            "Loading:",
            (progress.loaded / progress.total) * 100 + "%",
          );
        }
      },

      (error) => {
        console.error("Error loading model:", error);
      },
    );
  }

  update() {}
}
