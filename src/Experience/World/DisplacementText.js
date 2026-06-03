import * as THREE from "three";
import Experience from "../Experience.js";

import textTextureUrl from "../../assets/text-effect/image.png?url";

const textVertexShader = `
  varying vec2 vUv;
  uniform vec3 uDisplacement;

  float easeInOutCubic(float x) {
    return x < 0.5
      ? 4.0 * x * x * x
      : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    vUv = uv;

    vec3 newPosition = position;

    vec4 localPosition = vec4(position, 1.0);
    vec4 worldPosition = modelMatrix * localPosition;

    float dist = length(uDisplacement - worldPosition.rgb);

    float minDistance = 0.25;

    if (dist < minDistance) {
      float distanceMapped = map(
        dist,
        0.0,
        minDistance,
        1.0,
        0.0
      );

      float val = easeInOutCubic(distanceMapped) * 0.35;

      newPosition.z += val;
    }

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(newPosition, 1.0);
  }
`;

const textFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec4 color = texture2D(uTexture, vUv);

    if(color.a < 0.01) discard;

    gl_FragColor = color;
  }
`;

export default class DisplacementText {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.debug = this.experience.debug;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);

    this.displacement = new THREE.Vector3(999, 999, 999);

    this.params = {
      x: 0.53,
      y: 2.05,
      z: 1.55,
      // x: -2.13,
      // y: 1,
      // z: 0.658,
      rotationX: 0,
      rotationY: -Math.PI / 2,
      rotationZ: 0,
      scale: 0.45,
      // scale: 0.28,
      visible: true,
    };

    this.setTexture();
    this.setHitPlane();
    this.setTextPlane();
    this.setEvents();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setTexture() {
    const loader = new THREE.TextureLoader();

    this.textTexture = loader.load(textTextureUrl);

    this.textTexture.colorSpace = THREE.SRGBColorSpace;
  }

  setHitPlane() {
    const geometry = new THREE.PlaneGeometry(20, 20);

    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    this.hitPlane = new THREE.Mesh(geometry, material);

    this.scene.add(this.hitPlane);
  }

  setTextPlane() {
    const geometry = new THREE.PlaneGeometry(6, 6, 200, 200);

    this.textMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: {
          value: this.textTexture,
        },

        uDisplacement: {
          value: this.displacement,
        },
      },

      vertexShader: textVertexShader,
      fragmentShader: textFragmentShader,

      transparent: true,
      depthWrite: false,

      side: THREE.DoubleSide,
    });

    this.textPlane = new THREE.Mesh(geometry, this.textMaterial);

    this.scene.add(this.textPlane);

    this.applyTransform();
  }

  setEvents() {
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  applyTransform() {
    this.textPlane.position.set(this.params.x, this.params.y, this.params.z);

    this.textPlane.rotation.set(
      this.params.rotationX,
      this.params.rotationY,
      this.params.rotationZ,
    );

    this.textPlane.scale.set(
      this.params.scale,
      this.params.scale,
      this.params.scale,
    );

    this.textPlane.visible = this.params.visible;

    this.hitPlane.position.copy(this.textPlane.position);

    this.hitPlane.rotation.copy(this.textPlane.rotation);

    this.hitPlane.scale.copy(this.textPlane.scale);
  }

  update() {
    if (!this.textPlane) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.hitPlane);

    if (intersects.length > 0) {
      this.displacement.copy(intersects[0].point);
    } else {
      this.displacement.set(999, 999, 999);
    }

    this.textMaterial.uniforms.uDisplacement.value = this.displacement;
  }

  setDebug() {
    const folder = this.debug.ui.addFolder("Displacement Text");

    folder.add(this.params, "visible").onChange(() => this.applyTransform());

    folder
      .add(this.params, "x")
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "y")
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "z")
      .min(-10)
      .max(10)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "rotationX")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "rotationY")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "rotationZ")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.01)
      .onChange(() => this.applyTransform());

    folder
      .add(this.params, "scale")
      .min(0.01)
      .max(1)
      .step(0.01)
      .onChange(() => this.applyTransform());
  }
}
