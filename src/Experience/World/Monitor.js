import * as THREE from "three";

import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import Experience from "../Experience.js";

import sleepTextureUrl from "../../assets/textures/sleep.png?url";

export default class Monitor {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.cssScene = this.experience.cssScene;
    this.room = this.experience.world?.room?.model;

    this.screenMesh = null;
    this.iframe = null;
    this.cssObject = null;

    this.setTexture();

    if (this.room) {
      this.setScreen();
    } else {
      this.waitForModel();
    }
  }

  setTexture() {
    const textureLoader = new THREE.TextureLoader();

    this.sleepTexture = textureLoader.load(sleepTextureUrl);

    this.sleepTexture.colorSpace = THREE.SRGBColorSpace;

    // This is usually needed for textures placed onto GLB objects.
    // If your image appears upside down, change this to true.
    this.sleepTexture.flipY = false;
  }

  waitForModel() {
    const interval = setInterval(() => {
      if (this.experience.world?.room?.model) {
        clearInterval(interval);

        this.room = this.experience.world.room.model;

        this.setScreen();
      }
    }, 100);
  }

  setScreen() {
    this.screenMesh = this.room.getObjectByName("Object_9");

    if (!this.screenMesh) {
      console.warn("Monitor: Object_9 screen mesh not found");
      return;
    }

    this.setSleepScreen();
    this.setIframeScreen();
    this.hideIframe();
  }

  setSleepScreen() {
    this.screenMesh.visible = true;

    this.screenMesh.material = new THREE.MeshBasicMaterial({
      map: this.sleepTexture,
      toneMapped: false,
    });
  }

  setIframeScreen() {
    this.iframe = document.createElement("iframe");

    this.iframe.src = "https://xp-portfolio-hlfn.vercel.app/";

    this.iframe.style.width = "1280px";
    this.iframe.style.height = "720px";
    this.iframe.style.border = "0px";
    this.iframe.style.background = "#000";

    this.iframe.style.backfaceVisibility = "hidden";
    this.iframe.style.webkitBackfaceVisibility = "hidden";

    this.cssObject = new CSS3DObject(this.iframe);

    this.screenMesh.updateWorldMatrix(true, false);

    this.cssObject.position.copy(
      this.screenMesh.getWorldPosition(new THREE.Vector3()),
    );

    this.cssObject.quaternion.copy(
      this.screenMesh.getWorldQuaternion(new THREE.Quaternion()),
    );

    this.cssObject.rotateX(-Math.PI / 2);

    this.cssObject.scale.set(0.000535, 0.00068, 0.0005);

    this.cssScene.add(this.cssObject);
  }

  showIframe() {
    if (!this.cssObject || !this.iframe || !this.screenMesh) return;

    this.screenMesh.visible = false;

    this.cssObject.visible = true;
    this.iframe.style.display = "block";
    this.iframe.style.pointerEvents = "auto";
  }

  hideIframe() {
    if (!this.cssObject || !this.iframe || !this.screenMesh) return;

    this.screenMesh.visible = true;

    this.cssObject.visible = false;
    this.iframe.style.display = "none";
    this.iframe.style.pointerEvents = "none";
  }

  update() {}
}
