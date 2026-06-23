import * as THREE from "three";
import Experience from "../Experience.js";

const CONFIG = {
  canvasWidth: 120,
  canvasHeight: 120,

  // 10x10 character + 1 pixel border on each side = 12x12
  dotsX: 12,
  dotsY: 12,

  dotFill: 0.72,

  bgColor: "#080808",
  dotOffColor: "#131313",

  characterColor: "#26c95a",

  glowRadius: 2.2,
  glowAlpha: 0.42,

  characterStartCol: 1,
  characterStartRow: 1,
};

// 10x10 green pixel character
const CHARACTER_10X10 = [
  "0GGG00GGG0",
  "0GGG00GGG0",
  "GGGGGGGGGG",
  "GG0GGGG0GG",
  "GGGGGGGGGG",
  "GG000000GG",
  "GGGGGGGGGG",
  "GGGGGGGGGG",
  "GGG00GGG0G",
  "GGG00GGG0G",
];

export default class LEDBoard {
  constructor() {
    this.experience = new Experience();

    this.clock = new THREE.Clock();

    this.room = this.experience.world?.room?.model;

    this._attached = false;

    this._mesh = null;
    this._material = null;
    this._canvas = null;
    this._ctx = null;
    this._texture = null;

    this._buildCanvas();
  }

  _buildCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.width = CONFIG.canvasWidth;
    this._canvas.height = CONFIG.canvasHeight;

    this._ctx = this._canvas.getContext("2d");

    this._texture = new THREE.CanvasTexture(this._canvas);
    this._texture.colorSpace = THREE.SRGBColorSpace;

    // Keeps pixels sharp
    this._texture.magFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;

    this._texture.needsUpdate = true;
  }

  findAndAttachMesh() {
    if (this._attached) return;

    this.room = this.experience.world?.room?.model;

    if (!this.room) return;

    this.room.traverse((child) => {
      if (this._attached) return;

      const isLedScreen =
        child.isMesh &&
        (child.name === "LEDScreen" ||
          child.name === "LEDScreen_Baked" ||
          child.material?.name === "LEDScreen" ||
          child.material?.name === "LEDScreen_Baked");

      if (!isLedScreen) return;

      this.attachToMesh(child);
      this._attached = true;
    });
  }

  _normalizeUVs(geometry) {
    if (!geometry.attributes || !geometry.attributes.uv) return;

    const uv = geometry.attributes.uv.array;

    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;

    for (let i = 0; i < uv.length; i += 2) {
      const u = uv[i];
      const v = uv[i + 1];

      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }

    const width = maxU - minU;
    const height = maxV - minV;

    if (width <= 0 || height <= 0) return;

    for (let i = 0; i < uv.length; i += 2) {
      uv[i] = (uv[i] - minU) / width;
      uv[i + 1] = (uv[i + 1] - minV) / height;
    }

    geometry.attributes.uv.needsUpdate = true;
  }

  attachToMesh(mesh) {
    this._mesh = mesh;

    if (mesh.geometry) {
      this._normalizeUVs(mesh.geometry);
    }

    this._material = new THREE.MeshBasicMaterial({
      map: this._texture,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    mesh.material = this._material;
  }

  _drawFrame() {
    const ctx = this._ctx;

    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    this._drawOffGrid();
    this._drawCharacter();

    this._texture.needsUpdate = true;
  }

  _drawOffGrid() {
    for (let row = 0; row < CONFIG.dotsY; row++) {
      for (let col = 0; col < CONFIG.dotsX; col++) {
        this._drawSquareDot(col, row, CONFIG.dotOffColor, false);
      }
    }
  }

  _drawCharacter() {
    for (let row = 0; row < CHARACTER_10X10.length; row++) {
      const line = CHARACTER_10X10[row];

      for (let col = 0; col < line.length; col++) {
        if (line[col] !== "G") continue;

        this._drawSquareDot(
          CONFIG.characterStartCol + col,
          CONFIG.characterStartRow + row,
          CONFIG.characterColor,
          true,
        );
      }
    }
  }

  _drawSquareDot(col, row, color, lit = true) {
    if (col < 0 || col >= CONFIG.dotsX) return;
    if (row < 0 || row >= CONFIG.dotsY) return;

    const ctx = this._ctx;

    const cellW = CONFIG.canvasWidth / CONFIG.dotsX;
    const cellH = CONFIG.canvasHeight / CONFIG.dotsY;

    const size = Math.min(cellW, cellH) * CONFIG.dotFill;

    const centerX = col * cellW + cellW / 2;
    const centerY = row * cellH + cellH / 2;

    const x = centerX - size / 2;
    const y = centerY - size / 2;

    if (lit) {
      const glowSize = size * CONFIG.glowRadius;

      const alphaHex = Math.round(CONFIG.glowAlpha * 255)
        .toString(16)
        .padStart(2, "0");

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowSize / 2,
      );

      gradient.addColorStop(0, color + alphaHex);
      gradient.addColorStop(1, color + "00");

      ctx.fillStyle = gradient;
      ctx.fillRect(
        centerX - glowSize / 2,
        centerY - glowSize / 2,
        glowSize,
        glowSize,
      );
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }

  update() {
    this.findAndAttachMesh();

    if (!this._attached) return;
    if (!this._texture) return;

    this._drawFrame();
  }

  destroy() {
    if (this._texture) this._texture.dispose();
    if (this._material) this._material.dispose();
  }
}
