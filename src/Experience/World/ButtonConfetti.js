import * as THREE from "three";
import Experience from "../Experience.js";

export default class KeyboardConfetti {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.time = this.experience.time;
    this.room = this.experience.world?.room?.model;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.keyboardMesh = null;
    this.pieces = [];

    this.colors = [0xff4d4d, 0x4dff88, 0x4da6ff, 0xffff4d, 0xff4dff, 0xffffff];

    if (this.room) {
      this.findKeyboard();
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
        this.findKeyboard();
      }
    }, 100);
  }

  findKeyboard() {
    this.keyboardMesh = this.room.getObjectByName("Button");

    if (!this.keyboardMesh) {
      console.warn("KeyboardConfetti: Keyboard object not found");
    }
  }

  setEvents() {
    window.addEventListener("pointerdown", (event) => {
      if (!this.keyboardMesh) return;

      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObject(
        this.keyboardMesh,
        true,
      );

      if (intersects.length > 0) {
        const position = intersects[0].point.clone();

        position.y += 0.05;

        this.explode(position);
      }
    });
  }

  explode(position) {
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.PlaneGeometry(0.025, 0.012);

      const material = new THREE.MeshBasicMaterial({
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });

      const piece = new THREE.Mesh(geometry, material);

      piece.position.copy(position);

      piece.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      piece.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        Math.random() * 1.4 + 0.7,
        (Math.random() - 0.5) * 1.8,
      );

      piece.userData.rotationSpeed = new THREE.Vector3(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
      );

      piece.userData.life = 1;

      this.scene.add(piece);
      this.pieces.push(piece);
    }
  }

  update() {
    const delta = this.time.delta * 0.001;

    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const piece = this.pieces[i];

      piece.userData.velocity.y -= 2.8 * delta;

      piece.position.addScaledVector(piece.userData.velocity, delta);

      piece.rotation.x += piece.userData.rotationSpeed.x * delta;
      piece.rotation.y += piece.userData.rotationSpeed.y * delta;
      piece.rotation.z += piece.userData.rotationSpeed.z * delta;

      piece.userData.life -= delta;

      piece.material.opacity = Math.max(piece.userData.life, 0);

      if (piece.userData.life <= 0) {
        this.scene.remove(piece);
        piece.geometry.dispose();
        piece.material.dispose();
        this.pieces.splice(i, 1);
      }
    }
  }
}
