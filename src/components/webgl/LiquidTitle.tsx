"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";

// A liquid hero: a soft milky blob drifts behind the title, a smaller one
// follows the pointer and swells while pressed, and the type inverts where
// it crosses the blob and melts and slices near its edges.
//
// The title stays in the DOM (for layout, screen readers and a fallback).
// Every element marked [data-gl-text] inside the hero is drawn into a 2D
// canvas at its exact DOM position, and that canvas is the shader's text
// texture, so CSS controls the layout.

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uText;
  uniform vec2 uSize;
  uniform float uTime;
  uniform vec3 uPointer;
  uniform float uPress;
  uniform float uVelocity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  float ball(vec2 p, vec2 c, float r) {
    vec2 d = p - c;
    return r * r / max(dot(d, d), 1e-4);
  }

  // Metaball field in aspect-correct space: 1.0 is the blob's edge
  float field(vec2 uv) {
    float aspect = uSize.x / uSize.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    vec2 c = vec2(aspect * 0.5, 0.5);
    float t = uTime * 0.22;
    // Radii are measured against the height; shrink them on tall screens
    float k = clamp(aspect, 0.55, 1.0);

    float f = 0.0;
    f += ball(p, c + vec2(sin(t * 1.1) * 0.22 * aspect, cos(t * 0.8) * 0.16), 0.24 * k);
    f += ball(p, c + vec2(cos(t * 0.7 + 1.3) * 0.26 * aspect, sin(t * 1.3) * 0.2), 0.2 * k);
    f += ball(p, c + vec2(sin(t * 0.5 + 2.1) * 0.18 * aspect, sin(t * 0.9 + 0.7) * 0.24), 0.17 * k);
    f += ball(p, c + vec2(cos(t * 1.2 + 4.0) * 0.3 * aspect, cos(t * 0.6 + 2.5) * 0.12), 0.13 * k);

    vec2 pointer = vec2(uPointer.x * aspect, uPointer.y);
    f += uPointer.z * ball(p, pointer, (0.11 + 0.09 * uPress) * k);

    // Two drifting holes, so the blob loops around itself like a ring
    vec2 h1 = c + vec2(sin(t * 0.9 + 0.5) * 0.12 * aspect, cos(t * 0.7) * 0.1) - p;
    vec2 h2 = c + vec2(cos(t * 0.6 + 2.0) * 0.16 * aspect, sin(t * 1.1 + 1.0) * 0.14) - p;
    float r1 = 0.17 * k;
    float r2 = 0.12 * k;
    f *= 1.0 - 0.8 * exp(-dot(h1, h1) / (r1 * r1));
    f *= 1.0 - 0.8 * exp(-dot(h2, h2) / (r2 * r2));

    // Organic edges, and smaller holes where the noise dips
    f *= 0.45 + 1.1 * fbm(p * 2.4 + vec2(t * 0.9, -t * 0.6));
    return f;
  }

  void main() {
    float f = field(vUv);

    // Melt the type along the blob's edge, following the field's slope
    float e = 0.002;
    vec2 grad = vec2(field(vUv + vec2(e, 0.0)) - f, field(vUv + vec2(0.0, e)) - f) / e;
    float edge = smoothstep(0.45, 0.95, f) * (1.0 - smoothstep(1.05, 2.2, f));
    vec2 warp = clamp(-grad * 0.003 * edge, vec2(-0.04), vec2(0.04));

    // Horizontal slices near the edge, and more of them with scroll speed
    float row = floor(vUv.y * 42.0);
    float tick = floor(uTime * 7.0);
    float slice = (hash(vec2(row, tick)) - 0.5) * 0.035 * (edge * 0.7 + abs(uVelocity) * 1.5);
    slice *= step(0.72, hash(vec2(row * 1.7, tick)));

    float text = texture2D(uText, vUv + warp + vec2(slice, 0.0)).r;

    // Blurred, milky blob on near-black, and type that inverts across it
    float blob = smoothstep(0.75, 1.45, f);
    vec3 ink = vec3(0.055, 0.055, 0.06);
    vec3 milk = vec3(0.92, 0.92, 0.9);
    vec3 base = mix(ink, milk, blob);
    vec3 col = abs(base - vec3(text * 0.96));

    // Fine grain, so the soft gradients don't band
    col += (hash(vUv * uSize + fract(uTime)) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`;

interface PointerState {
  x: number;
  y: number;
  inside: boolean;
  pressed: boolean;
}

function LiquidMesh({
  domRef,
  onReady,
}: {
  domRef: React.RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textRef = useRef<{
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
  } | null>(null);
  const textDirty = useRef(true);
  const readyRef = useRef(false);
  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    inside: false,
    pressed: false,
  });
  const reduceMotion = useReducedMotion();
  const { size, viewport, invalidate } = useThree();

  const initialUniforms = useMemo(
    () => ({
      uText: { value: null as THREE.Texture | null },
      uSize: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uPress: { value: 0 },
      uVelocity: { value: 0 },
    }),
    [],
  );

  // Redraw the text texture when the hero resizes or the fonts arrive
  useEffect(() => {
    const dom = domRef.current;
    if (!dom) return;
    const markDirty = () => {
      textDirty.current = true;
      invalidate();
    };
    const observer = new ResizeObserver(markDirty);
    observer.observe(dom);
    document.fonts?.ready.then(markDirty);
    return () => observer.disconnect();
  }, [domRef, invalidate]);

  // The canvas ignores pointer events, so follow the pointer on the window
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      const rect = domRef.current?.getBoundingClientRect();
      pointer.current.inside =
        !!rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      invalidate();
    };
    const down = (e: PointerEvent) => {
      move(e);
      pointer.current.pressed = pointer.current.inside;
    };
    const up = () => {
      pointer.current.pressed = false;
      invalidate();
    };
    const leave = () => {
      pointer.current.inside = false;
      pointer.current.pressed = false;
      invalidate();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [domRef, invalidate]);

  useFrame((_, delta) => {
    const dom = domRef.current;
    const mesh = meshRef.current;
    const uniforms = materialRef.current?.uniforms;
    if (!dom || !mesh || !uniforms) return;

    const rect = dom.getBoundingClientRect();
    const offscreen = rect.bottom <= 0 || rect.top >= size.height;
    mesh.visible = !offscreen && rect.width > 0;
    if (!mesh.visible) return;

    // Draw the DOM text into the texture at its exact on-screen layout
    if (textDirty.current) {
      textDirty.current = false;
      textRef.current ??= (() => {
        const canvas = document.createElement("canvas");
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return { canvas, texture };
      })();
      drawText(dom, rect, textRef.current.canvas);
      textRef.current.texture.needsUpdate = true;
      uniforms.uText.value = textRef.current.texture;
    }

    // The first frame after a pause sees the whole pause as its delta
    const step = Math.min(delta, 1 / 30);
    if (!reduceMotion) uniforms.uTime.value += step;

    // Ease the pointer blob in and out, and toward the pointer
    const p = pointer.current;
    const px = (p.x - rect.left) / rect.width;
    const py = 1 - (p.y - rect.top) / rect.height;
    const pu = uniforms.uPointer.value as THREE.Vector3;
    const ease = 1 - Math.pow(0.0015, step);
    pu.x += (px - pu.x) * ease;
    pu.y += (py - pu.y) * ease;
    pu.z += ((p.inside ? 1 : 0) - pu.z) * ease * 0.6;
    uniforms.uPress.value +=
      ((p.pressed ? 1 : 0) - uniforms.uPress.value) * ease * 0.5;

    const velocity = reduceMotion
      ? 0
      : THREE.MathUtils.clamp(useStore.getState().scrollVelocity / 40, -1, 1);
    uniforms.uVelocity.value += (velocity - uniforms.uVelocity.value) * 0.1;
    uniforms.uSize.value.set(rect.width, rect.height);

    // DOM-to-canvas sync: match the plane to the hero on screen
    const width = (rect.width / size.width) * viewport.width;
    const height = (rect.height / size.height) * viewport.height;
    mesh.scale.set(width, height, 1);
    mesh.position.set(
      (rect.left / size.width) * viewport.width -
        viewport.width / 2 +
        width / 2,
      -(rect.top / size.height) * viewport.height +
        viewport.height / 2 -
        height / 2,
      0,
    );

    if (!readyRef.current && uniforms.uText.value) {
      readyRef.current = true;
      onReady();
    }

    // The blob drifts all the time, so keep frames coming while the hero is
    // on screen. With reduced motion it is still, so only follow the pointer.
    const settling =
      Math.abs(px - pu.x) + Math.abs(py - pu.y) > 0.001 ||
      Math.abs((p.inside ? 1 : 0) - pu.z) > 0.001 ||
      Math.abs((p.pressed ? 1 : 0) - uniforms.uPress.value) > 0.001;
    if (!reduceMotion || settling) invalidate();
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms}
        toneMapped={false}
      />
    </mesh>
  );
}

// White text on black, at the same size and position as the DOM text
function drawText(dom: HTMLElement, rect: DOMRect, canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (const el of Array.from(
    dom.querySelectorAll<HTMLElement>("[data-gl-text]"),
  )) {
    const style = getComputedStyle(el);
    const raw = el.textContent ?? "";
    const text = style.textTransform === "uppercase" ? raw.toUpperCase() : raw;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = style.letterSpacing;

    // The line box is centred on the font's content area, as in CSS
    const r = el.getBoundingClientRect();
    const metrics = ctx.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    const baseline =
      r.top - rect.top + (r.height - (ascent + descent)) / 2 + ascent;
    ctx.fillText(text, r.left - rect.left, baseline);
  }
}

export default function LiquidTitle({
  domRef,
  onReady,
}: {
  domRef: React.RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  return (
    <tunnel.In>
      <LiquidMesh domRef={domRef} onReady={onReady} />
    </tunnel.In>
  );
}
