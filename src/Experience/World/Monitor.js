import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import Experience from "../Experience.js";

export default class Monitor {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.cssScene = this.experience.cssScene;
    this.room = this.experience.world?.room?.model;

    this.screenMesh = null;
    this.iframe = null;
    this.cssObject = null;

    if (this.room) {
      this.setScreen();
    } else {
      this.waitForModel();
    }
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
    this.screenMesh = this.room.getObjectByName("Object_9_Baked");

    if (!this.screenMesh) {
      console.warn("Monitor: Object_9_Baked screen mesh not found");
      return;
    }

    this.setIframeScreen();

    // Hide the Blender screen mesh permanently.
    // The iframe will now be visible all the time.
    this.screenMesh.visible = false;
    this.cssObject.visible = true;
    this.iframe.style.display = "block";
  }

  setIframeScreen() {
    this.iframe = document.createElement("iframe");

    this.iframe.src = "https://andrew-os-two.vercel.app/";
    this.iframe.style.width = "1280px";
    this.iframe.style.height = "720px";
    this.iframe.style.border = "0px";
    this.iframe.style.background = "#000";
    this.iframe.style.display = "block";

    // Keep pointer events off by default so OrbitControls still work.
    // Your MonitorFocus/body.monitor-focused CSS can enable interaction when zoomed in.
    this.iframe.style.pointerEvents = "none";

    this.cssObject = new CSS3DObject(this.iframe);

    this.screenMesh.updateWorldMatrix(true, false);

    this.cssObject.position.copy(
      this.screenMesh.getWorldPosition(new THREE.Vector3()),
    );

    this.cssObject.quaternion.copy(
      this.screenMesh.getWorldQuaternion(new THREE.Quaternion()),
    );

    this.cssObject.scale.set(0.000619, 0.00072, 0.00049);

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

    // Do not hide the iframe anymore.
    // This keeps the website visible even after exiting monitor focus.
    this.screenMesh.visible = false;

    this.cssObject.visible = true;
    this.iframe.style.display = "block";
    this.iframe.style.pointerEvents = "none";
  }

  update() {}
}
