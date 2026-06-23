import * as THREE from "three";
import Experience from "../Experience.js";
import backgroundUrl from "../../assets/textures/background.jpg?url";

const CONFIG = {
  // Centred on the room — the arc wraps around the left wall from here
  position: new THREE.Vector3(-5, 1.8, 0),

  radius: 7,
  height: 14,

  // Half circle (0.5) — wide enough that the cut edges are never visible
  arc: 0.5,

  radialSegments: 64,
  heightSegments: 6,

  // thetaStart centres the arc behind the LEFT wall.
  // Left wall faces -X direction = angle Math.PI on the unit circle.
  // Subtract half the arc length (0.25 * 2π) to centre it there:
  //   thetaStart = π - (0.5 * 0.5 * 2π) = π - 0.5π = 0.5π  ... wrong
  // Three.js CylinderGeometry thetaStart is in RADIANS not fractions:
  //   arc fraction 0.5 → thetaLength = 0.5 * 2π = π
  //   half of that   = π * 0.5
  //   centre on -X (angle π): thetaStart = π - π*0.5 = π*0.5
  // But -X in Three.js cylinder UV space: rotate so arc opens toward +X (into room).
  // thetaStart = Math.PI * 0.5  centres the arc facing the left wall (-X).
  thetaStart: Math.PI * 1.0,

  texturePath: backgroundUrl,
  repeatX: 1.0,
  repeatY: 1.0,

  side: THREE.BackSide,
  emissiveIntensity: 0.55,
};

export default class Backdrop {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this._build();
  }

  _build() {
    const {
      position,
      radius,
      height,
      arc,
      thetaStart,
      radialSegments,
      heightSegments,
      texturePath,
      repeatX,
      repeatY,
      side,
      emissiveIntensity,
    } = CONFIG;

    const geo = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      radialSegments,
      heightSegments,
      true,
      thetaStart,
      Math.PI * 2 * arc, // arc fraction → radians
    );

    const loader = new THREE.TextureLoader();
    const texture = loader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(repeatX, repeatY);

    this._material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: emissiveIntensity,
      side: side,
      depthWrite: false,
      fog: false,
    });

    this._mesh = new THREE.Mesh(geo, this._material);
    this._mesh.position.copy(position);
    this._mesh.renderOrder = -1;
    this.scene.add(this._mesh);
  }

  setBrightness(v) {
    if (this._material) this._material.emissiveIntensity = v;
  }

  destroy() {
    if (this._mesh) {
      this.scene.remove(this._mesh);
      this._mesh.geometry.dispose();
    }
    if (this._material) this._material.dispose();
  }
}
