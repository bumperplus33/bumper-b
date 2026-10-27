import * as THREE from "three";

// The stir marks behind the liquid hero: a small feedback simulation.
//
// Two render targets take turns (ping-pong). Each step reads last frame's
// marks, lets them heal, and paints the pointer's path since last frame into
// them. Every texel holds:
//   R  heat: the wet, fresh edge of a stroke, which fades fast
//   G  stir: the lasting mark, which fades slowly
//   BA the stroke's direction, packed into 0..1
//
// The buffer is laid out over the hero itself, not the screen, so the marks
// move with the type as the page scrolls. A pointer held still while the page
// scrolls drags across the hero, and stirs it like any other stroke.

export const STIR = {
  // Brush radius as a fraction of the hero's height, and the extra on press
  radius: 0.04,
  pressRadius: 0.035,
  // Pointer speed (px/s) that lays down a full-strength stroke
  fullSpeed: 900,
  // Exponential fade per second, plus a linear floor so 8-bit buffers reach
  // zero instead of sticking at their last step
  heatDecay: 3,
  heatFloor: 0.1,
  stirDecay: 1.2,
  stirFloor: 0.05,
  // How much of each stroke's heat becomes a lasting mark
  stirRate: 0.6,
  // Long side of the buffer in texels
  resolution: 512,
};

// Seconds for a full-strength value to heal to exactly zero
function lifetime(decay: number, floor: number) {
  const ratio = floor / decay;
  return Math.log((1 + ratio) / ratio) / decay;
}

export const STIR_LIFETIME = Math.max(
  lifetime(STIR.heatDecay, STIR.heatFloor),
  lifetime(STIR.stirDecay, STIR.stirFloor),
);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uPrev;
  uniform vec2 uA;
  uniform vec2 uB;
  uniform vec2 uDir;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uDeposit;
  uniform float uDt;
  uniform float uHeatDecay;
  uniform float uHeatFloor;
  uniform float uStirDecay;
  uniform float uStirFloor;
  uniform float uStirRate;
  varying vec2 vUv;

  // Distance from p to the segment a-b
  float segDist(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    return length(p - a - ab * t);
  }

  void main() {
    vec4 prev = texture2D(uPrev, vUv);

    // Heal
    float heat = max(prev.r * exp(-uHeatDecay * uDt) - uHeatFloor * uDt, 0.0);
    float stir = max(prev.g * exp(-uStirDecay * uDt) - uStirFloor * uDt, 0.0);
    vec2 dir = prev.ba * 2.0 - 1.0;

    // Paint the whole path since last frame, so fast strokes don't break up
    vec2 asp = vec2(uAspect, 1.0);
    float d = segDist(vUv * asp, uA * asp, uB * asp);
    float brush = exp(-d * d / (uRadius * uRadius)) * uDeposit;

    heat = min(heat + brush, 1.0);
    stir = min(stir + brush * uStirRate, 1.0);
    dir = mix(dir, uDir, clamp(brush * 2.0, 0.0, 1.0));

    gl_FragColor = vec4(heat, stir, dir * 0.5 + 0.5);
  }
`;

export interface StirStroke {
  // Start and end of the stroke in hero UV (0..1, y up)
  a: THREE.Vector2;
  b: THREE.Vector2;
  // 0..1: how strongly to paint
  deposit: number;
  // 0..1: how far the pointer is pressed
  press: number;
}

export class StirTrail {
  private read: THREE.WebGLRenderTarget;
  private write: THREE.WebGLRenderTarget;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: THREE.ShaderMaterial;
  private geometry = new THREE.PlaneGeometry(2, 2);

  constructor(gl: THREE.WebGLRenderer) {
    // Half floats where the GPU can render to them; 8-bit works too, thanks
    // to the linear floor on the fade
    const type =
      gl.extensions.has("EXT_color_buffer_float") ||
      gl.extensions.has("EXT_color_buffer_half_float")
        ? THREE.HalfFloatType
        : THREE.UnsignedByteType;
    const options = {
      type,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.read = new THREE.WebGLRenderTarget(1, 1, options);
    this.write = new THREE.WebGLRenderTarget(1, 1, options);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uPrev: { value: null },
        uA: { value: new THREE.Vector2() },
        uB: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2(1, 0) },
        uAspect: { value: 1 },
        uRadius: { value: STIR.radius },
        uDeposit: { value: 0 },
        uDt: { value: 0 },
        uHeatDecay: { value: STIR.heatDecay },
        uHeatFloor: { value: STIR.heatFloor },
        uStirDecay: { value: STIR.stirDecay },
        uStirFloor: { value: STIR.stirFloor },
        uStirRate: { value: STIR.stirRate },
      },
      depthTest: false,
      depthWrite: false,
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
  }

  get texture() {
    return this.read.texture;
  }

  // Match the hero's shape. Resizing clears the marks, which is fine.
  resize(width: number, height: number) {
    const scale = STIR.resolution / Math.max(width, height, 1);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    if (w === this.read.width && h === this.read.height) return;
    this.read.setSize(w, h);
    this.write.setSize(w, h);
    this.material.uniforms.uAspect.value = width / Math.max(height, 1);
  }

  step(gl: THREE.WebGLRenderer, dt: number, stroke: StirStroke | null) {
    const u = this.material.uniforms;
    u.uPrev.value = this.read.texture;
    u.uDt.value = dt;
    u.uDeposit.value = stroke ? stroke.deposit : 0;
    if (stroke) {
      u.uA.value.copy(stroke.a);
      u.uB.value.copy(stroke.b);
      u.uRadius.value = STIR.radius + STIR.pressRadius * stroke.press;
      // The stroke's direction in aspect-correct space
      const dir = u.uDir.value as THREE.Vector2;
      dir
        .set(
          (stroke.b.x - stroke.a.x) * u.uAspect.value,
          stroke.b.y - stroke.a.y,
        )
        .normalize();
    }

    const previous = gl.getRenderTarget();
    gl.setRenderTarget(this.write);
    gl.render(this.scene, this.camera);
    gl.setRenderTarget(previous);

    [this.read, this.write] = [this.write, this.read];
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
    this.material.dispose();
    this.geometry.dispose();
  }
}
