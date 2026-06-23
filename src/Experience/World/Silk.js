import * as THREE from "three";
import Experience from "../Experience.js";

const CONFIG = {
  // Shape
  width: 5.5,
  height: 2.4,
  segmentsX: 180,
  segmentsY: 90,

  // Placement from your latest debug settings
  position: new THREE.Vector3(-1.87, 2.13, 2.87),
  rotation: new THREE.Euler(-1.41459, 1.442407, -0.17959),
  scale: new THREE.Vector3(0.36, 0.84, 1),

  // Look
  color: new THREE.Color("#ffffff"),
  highlightColor: new THREE.Color("#ffffff"),
  alpha: 0.25,

  // Motion
  amplitude: 0.19,
  underLift: 0.35,
  speed: 0.45,

  // Highlights
  fresnelPower: 2.35,
  rimStrength: 0.72,
  highlightStrength: 0.75,
};

const vertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uUnderLift;
  uniform float uSpeed;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vHeight;
  varying float vCrease;
  varying float vEdge;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
      + (c - a) * u.y * (1.0 - u.x)
      + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vUv = uv;

    vec3 newPosition = position;

    vec2 centeredUv = uv - 0.5;

    // Diagonal wind direction across the fabric.
    // This gives the folds that long flowing silk look.
    vec2 windDirection = normalize(vec2(0.92, 0.38));
    vec2 crossDirection = vec2(-windDirection.y, windDirection.x);

    float alongWind = dot(centeredUv, windDirection);
    float acrossWind = dot(centeredUv, crossDirection);

    float t = uTime * uSpeed;

    // Smooth noise so the cloth does not look like a perfect sine wave.
    float n = fbm(vec2(
      alongWind * 2.8 - t * 0.12,
      acrossWind * 4.0 + t * 0.18
    ));

    // Main broad silk wave.
    float mainWave = sin(
      alongWind * 10.0
      - t * 2.1
      + n * 1.5
    );

    // Smaller secondary ripples.
    float secondaryWave = sin(
      alongWind * 17.0
      - t * 2.7
      + acrossWind * 4.0
    );

    // Slow side-to-side drift.
    float slowRoll = sin(
      acrossWind * 6.0
      + t * 0.85
      + n * 2.0
    );

    // Edges move slightly more than the center.
    float edgeX = smoothstep(0.25, 0.5, abs(centeredUv.x));
    float edgeY = smoothstep(0.22, 0.5, abs(centeredUv.y));
    float edge = clamp(edgeX + edgeY * 0.7, 0.0, 1.0);

    // Soft upward pocket, like air pushing from underneath.
    vec2 puffCenter = vec2(
      -0.12 + sin(t * 0.33) * 0.05,
      -0.05 + cos(t * 0.27) * 0.04
    );

    vec2 puffVector = (centeredUv - puffCenter) * vec2(2.0, 3.2);
    float underPuff = exp(-dot(puffVector, puffVector) * 1.35);

    float height = 0.0;

    height += mainWave * 0.55;
    height += secondaryWave * 0.16;
    height += slowRoll * 0.12;
    height += (n - 0.5) * 0.28;

    height *= uAmplitude;

    // The edges flutter more naturally.
    height *= mix(0.62, 1.15, edge);

    // Wind pushing upward from underneath.
    height += underPuff * uUnderLift * (0.75 + sin(t * 0.7) * 0.25);

    // PlaneGeometry is in XY, so Z is the fabric's local "up".
    // Because the mesh is rotated, this feels like air lifting it from below.
    newPosition.z += height;

    // Tiny horizontal drift so the fabric feels alive instead of rigid.
    newPosition.x += sin(centeredUv.y * 8.0 + t * 1.1) * 0.025 * edge;
    newPosition.y += sin(centeredUv.x * 7.0 - t * 0.9) * 0.018 * edge;

    // Slight edge curling.
    newPosition.z += edgeY * sin(centeredUv.x * 6.0 - t * 1.2) * uAmplitude * 0.18;

    // White ridge highlights are stronger on one side,
    // similar to the reference image.
    float leadingSideMask = 1.0 - smoothstep(0.35, 1.0, uv.x);

    float ridgeA = pow(max(0.0, mainWave), 12.0);
    float ridgeB = pow(max(0.0, secondaryWave), 18.0) * 0.45;

    vCrease = clamp((ridgeA + ridgeB) * leadingSideMask + ridgeA * 0.18, 0.0, 1.0);
    vHeight = height;
    vEdge = edge;

    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);

    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec3 uColor;
  uniform vec3 uHighlightColor;
  uniform float uAlpha;
  uniform float uFresnelPower;
  uniform float uRimStrength;
  uniform float uHighlightStrength;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vHeight;
  varying float vCrease;
  varying float vEdge;

  void main() {
    // Real screen-space normal from the displaced surface.
    // This gives the silk its soft shifting highlights.
    vec3 dx = dFdx(vWorldPosition);
    vec3 dy = dFdy(vWorldPosition);
    vec3 normal = normalize(cross(dx, dy));

    if (!gl_FrontFacing) {
      normal *= -1.0;
    }

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

    float facingRatio = abs(dot(normal, viewDirection));
    float fresnel = pow(1.0 - facingRatio, uFresnelPower);

    float heightGlow = smoothstep(0.02, 0.28, abs(vHeight));

    vec3 color = uColor;

    // Soft transparent body color.
    color += uHighlightColor * heightGlow * 0.08;

    // Silky rim glow at grazing angles.
    color += uHighlightColor * fresnel * uRimStrength;

    // Thin brighter fold lines.
    color += uHighlightColor * vCrease * uHighlightStrength;

    // Very soft edge fade, but not fully gone.
    float edgeFade =
      smoothstep(0.0, 0.08, vUv.x) *
      smoothstep(0.0, 0.08, vUv.y) *
      smoothstep(0.0, 0.08, 1.0 - vUv.x) *
      smoothstep(0.0, 0.08, 1.0 - vUv.y);

    float alpha = uAlpha;

    alpha += fresnel * 0.18;
    alpha += vCrease * 0.22;
    alpha += vEdge * 0.025;

    alpha *= mix(0.58, 1.0, edgeFade);
    alpha = clamp(alpha, 0.0, 0.62);

    gl_FragColor = vec4(color, alpha);
  }
`;

export default class Silk {
  constructor() {
    this.experience = new Experience();

    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

    this.debugObject = {
      color: `#${CONFIG.color.getHexString()}`,
      highlightColor: `#${CONFIG.highlightColor.getHexString()}`,
    };

    this.setGeometry();
    this.setMaterial();
    this.setMesh();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(
      CONFIG.width,
      CONFIG.height,
      CONFIG.segmentsX,
      CONFIG.segmentsY,
    );
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,

      uniforms: {
        uTime: { value: 0 },

        uColor: { value: CONFIG.color.clone() },
        uHighlightColor: { value: CONFIG.highlightColor.clone() },

        uAlpha: { value: CONFIG.alpha },

        uAmplitude: { value: CONFIG.amplitude },
        uUnderLift: { value: CONFIG.underLift },
        uSpeed: { value: CONFIG.speed },

        uFresnelPower: { value: CONFIG.fresnelPower },
        uRimStrength: { value: CONFIG.rimStrength },
        uHighlightStrength: { value: CONFIG.highlightStrength },
      },

      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.copy(CONFIG.position);
    this.mesh.rotation.copy(CONFIG.rotation);
    this.mesh.scale.copy(CONFIG.scale);

    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;

    // Helps transparent objects render on top of your background.
    this.mesh.renderOrder = 10;
    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  setDebug() {
    const silkFolder = this.debug.ui.addFolder("Silk");

    silkFolder
      .add(this.mesh.position, "x")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionX");

    silkFolder
      .add(this.mesh.position, "y")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionY");

    silkFolder
      .add(this.mesh.position, "z")
      .min(-10)
      .max(10)
      .step(0.01)
      .name("positionZ");

    silkFolder
      .add(this.mesh.rotation, "x")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name("rotationX");

    silkFolder
      .add(this.mesh.rotation, "y")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name("rotationY");

    silkFolder
      .add(this.mesh.rotation, "z")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name("rotationZ");

    silkFolder
      .add(this.mesh.scale, "x")
      .min(0.1)
      .max(5)
      .step(0.01)
      .name("scaleX");

    silkFolder
      .add(this.mesh.scale, "y")
      .min(0.1)
      .max(5)
      .step(0.01)
      .name("scaleY");

    silkFolder
      .add(this.material.uniforms.uAlpha, "value")
      .min(0)
      .max(0.8)
      .step(0.01)
      .name("alpha");

    silkFolder
      .add(this.material.uniforms.uAmplitude, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("amplitude");

    silkFolder
      .add(this.material.uniforms.uUnderLift, "value")
      .min(0)
      .max(1)
      .step(0.01)
      .name("underLift");

    silkFolder
      .add(this.material.uniforms.uSpeed, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("speed");

    silkFolder
      .add(this.material.uniforms.uRimStrength, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("rimStrength");

    silkFolder
      .add(this.material.uniforms.uHighlightStrength, "value")
      .min(0)
      .max(2)
      .step(0.01)
      .name("highlightStrength");

    silkFolder
      .addColor(this.debugObject, "color")
      .name("color")
      .onChange((value) => {
        this.material.uniforms.uColor.value.set(value);
      });

    silkFolder
      .addColor(this.debugObject, "highlightColor")
      .name("highlight")
      .onChange((value) => {
        this.material.uniforms.uHighlightColor.value.set(value);
      });
  }

  update() {
    const elapsed = this.time?.elapsed ?? performance.now();

    this.material.uniforms.uTime.value = elapsed * 0.001;
  }

  destroy() {
    this.scene.remove(this.mesh);

    this.geometry.dispose();
    this.material.dispose();
  }
}
