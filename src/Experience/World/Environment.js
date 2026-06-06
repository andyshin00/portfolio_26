// import * as THREE from "three";
// import Experience from "../Experience.js";

// export default class Environment {
//   constructor() {
//     this.experience = new Experience(document.querySelector("canvas.webgl"));

//     this.scene = this.experience.scene;
//     this.debug = this.experience.debug;

//     this.setBackground();
//     this.setFloor();
//     this.setLights();
//     this.setHelpers();
//   }

//   setBackground() {
//     this.scene.background = new THREE.Color("#cfc8c8");
//   }

//   setFloor() {
//     this.floor = new THREE.Mesh(
//       new THREE.PlaneGeometry(100, 100),
//       new THREE.ShadowMaterial({
//         color: "#000000",
//         opacity: 0.25,
//       }),
//     );

//     this.floor.rotation.x = -Math.PI * 0.5;

//     this.floor.receiveShadow = true;

//     this.scene.add(this.floor);
//   }

//   setLights() {
//     this.ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
//     this.scene.add(this.ambientLight);

//     this.directionalLight = new THREE.DirectionalLight("#fff2cc", 3);
//     this.directionalLight.position.set(5, 8, 5);
//     this.directionalLight.castShadow = true;

//     this.directionalLight.shadow.mapSize.set(2048, 2048);
//     this.directionalLight.shadow.camera.near = 0.1;
//     this.directionalLight.shadow.camera.far = 30;
//     this.directionalLight.shadow.camera.left = -10;
//     this.directionalLight.shadow.camera.right = 10;
//     this.directionalLight.shadow.camera.top = 10;
//     this.directionalLight.shadow.camera.bottom = -10;
//     this.directionalLight.shadow.radius = 8;

//     this.scene.add(this.directionalLight);

//     this.fillLight = new THREE.PointLight("#88aaff", 1.2, 20);
//     this.fillLight.position.set(-4, 4, 4);
//     this.scene.add(this.fillLight);

//     if (this.debug.active) {
//       this.setDebug();
//     }
//   }

//   setHelpers() {
//     if (!this.debug.active) return;

//     const directionalHelper = new THREE.DirectionalLightHelper(
//       this.directionalLight,
//       1,
//     );
//     this.scene.add(directionalHelper);

//     const pointHelper = new THREE.PointLightHelper(this.fillLight, 0.5);
//     this.scene.add(pointHelper);
//   }

//   setDebug() {
//     const environmentFolder = this.debug.ui.addFolder("Environment");

//     environmentFolder
//       .addColor({ backgroundColor: "#5a3026" }, "backgroundColor")
//       .name("Background Color")
//       .onChange((value) => {
//         this.scene.background.set(value);
//         this.floor.material.color.set(value);
//       });

//     const lightsFolder = this.debug.ui.addFolder("Lights");

//     const ambientFolder = lightsFolder.addFolder("Ambient Light");
//     ambientFolder.add(this.ambientLight, "intensity").min(0).max(5).step(0.01);

//     const directionalFolder = lightsFolder.addFolder("Directional Light");
//     directionalFolder
//       .add(this.directionalLight, "intensity")
//       .min(0)
//       .max(10)
//       .step(0.01);

//     directionalFolder
//       .add(this.directionalLight.position, "x")
//       .min(-20)
//       .max(20)
//       .step(0.01);

//     directionalFolder
//       .add(this.directionalLight.position, "y")
//       .min(-20)
//       .max(20)
//       .step(0.01);

//     directionalFolder
//       .add(this.directionalLight.position, "z")
//       .min(-20)
//       .max(20)
//       .step(0.01);

//     const fillFolder = lightsFolder.addFolder("Fill Light");
//     fillFolder.add(this.fillLight, "intensity").min(0).max(10).step(0.01);
//     fillFolder.add(this.fillLight, "distance").min(0).max(50).step(0.01);

//     fillFolder.add(this.fillLight.position, "x").min(-20).max(20).step(0.01);
//     fillFolder.add(this.fillLight.position, "y").min(-20).max(20).step(0.01);
//     fillFolder.add(this.fillLight.position, "z").min(-20).max(20).step(0.01);
//   }
// }
