"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";

// The Sequencer's scene: every project as a card in an endless loop. The
// canvas lays the cards out itself (no DOM boxes to follow); the page moves
// them by changing `controlRef.current.target`, in cards, and the scene eases
// `controlRef.current.current` toward it.

export interface SequencerControl {
  target: number;
  current: number;
}

// Card size, shared with the page so its click zone and drag maths match.
// Fractions of the viewport height, capped by its width on narrow screens.
export const CARD_HEIGHT = 0.56;
export const CARD_MAX_WIDTH = 0.7;
export const CARD_ASPECT = 3 / 4;
// The centre card sits slightly above the middle of the screen
export const CARD_CENTER_Y = 0.46;

export function cardSize(width: number, height: number) {
  const h = Math.min(
    height * CARD_HEIGHT,
    (width * CARD_MAX_WIDTH) / CARD_ASPECT,
  );
  return { width: h * CARD_ASPECT, height: h };
}

const vertexShader = `
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // The middle of the card lags behind its edges while it moves
    pos.x -= sin(uv.y * 3.14159) * uVelocity * 0.08;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTex;
  uniform vec2 uImageRes;
  uniform vec2 uPlaneRes;
  uniform float uFocus;
  uniform float uVelocity;
  varying vec2 vUv;

  // object-fit: cover
  vec2 cover(vec2 uv) {
    vec2 ratio = vec2(
      min((uPlaneRes.x / uPlaneRes.y) / (uImageRes.x / uImageRes.y), 1.0),
      min((uPlaneRes.y / uPlaneRes.x) / (uImageRes.y / uImageRes.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

  void main() {
    // Cards out of focus are cropped in a little and dimmed
    vec2 uv = (cover(vUv) - 0.5) * mix(0.86, 1.0, uFocus) + 0.5;
    vec2 shift = vec2(uVelocity * 0.012, 0.0);
    vec3 c = vec3(
      texture2D(uTex, uv + shift).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - shift).b
    );
    float grey = dot(c, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(mix(vec3(grey) * 0.35, c, uFocus), 1.0);
  }
`;

function imageSize(texture: THREE.Texture) {
  const image = texture.image as HTMLImageElement | undefined;
  return new THREE.Vector2(image?.width || 1, image?.height || 1);
}

// Signed distance from `current` to card i, wrapped into [-n/2, n/2)
function wrappedOffset(i: number, current: number, n: number) {
  const off = i - current;
  return ((((off + n / 2) % n) + n) % n) - n / 2;
}

function Cards({
  sources,
  controlRef,
  reduceMotion,
  onActive,
  onReady,
}: {
  sources: string[];
  controlRef: React.RefObject<SequencerControl>;
  reduceMotion: boolean;
  onActive: (index: number) => void;
  onReady: () => void;
}) {
  const textures = useTexture(sources, (loaded) => {
    for (const t of [loaded].flat()) t.colorSpace = THREE.SRGBColorSpace;
  });
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const state = useRef({ active: -1, velocity: 0 });
  const { viewport, invalidate } = useThree();

  // Initial values only; the render loop updates them through the materials
  const initialUniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTex: { value: texture },
        uImageRes: { value: imageSize(texture) },
        uPlaneRes: { value: new THREE.Vector2(3, 4) },
        uFocus: { value: 0 },
        uVelocity: { value: 0 },
      })),
    [textures],
  );

  useEffect(() => {
    onReady();
    invalidate();
  }, [onReady, invalidate]);

  useFrame((_, delta) => {
    const c = controlRef.current;
    if (!c) return;

    // The first frame after a pause sees the whole pause as its delta
    const step = Math.min(delta, 1 / 30);
    const previous = c.current;
    if (reduceMotion) {
      c.current = c.target;
    } else {
      c.current += (c.target - c.current) * (1 - Math.pow(0.0008, step));
      if (Math.abs(c.target - c.current) < 0.0005) c.current = c.target;
    }

    // Speed in cards per second drives the bend and the colour split
    const speed = (c.current - previous) / Math.max(step, 1e-3);
    const velocity = reduceMotion ? 0 : THREE.MathUtils.clamp(speed / 6, -1, 1);
    const s = state.current;
    s.velocity += (velocity - s.velocity) * 0.2;
    if (Math.abs(s.velocity) < 0.0005) s.velocity = 0;

    const n = textures.length;
    const card = cardSize(viewport.width, viewport.height);
    const centerY = viewport.height * (0.5 - CARD_CENTER_Y);

    for (let i = 0; i < n; i++) {
      const mesh = meshes.current[i];
      const uniforms = materials.current[i]?.uniforms;
      if (!mesh || !uniforms) continue;

      const off = wrappedOffset(i, c.current, n);
      const a = Math.abs(off);
      const focus = 1 - Math.min(a, 1);
      const scale = 0.62 + 0.38 * focus;
      // The first step clears the large centre card, later steps pack tighter
      const x =
        Math.sign(off) *
        (Math.min(a, 1) * card.width * 0.95 +
          Math.max(a - 1, 0) * card.width * 0.72);
      const w = card.width * scale;
      const h = card.height * scale;

      mesh.position.set(x, centerY, 0);
      mesh.scale.set(w, h, 1);
      mesh.visible = Math.abs(x) - w / 2 < viewport.width / 2;
      uniforms.uFocus.value = focus;
      uniforms.uVelocity.value = s.velocity;
      uniforms.uPlaneRes.value.set(w, h);
    }

    const active = ((Math.round(c.current) % n) + n) % n;
    if (active !== s.active) {
      s.active = active;
      onActive(active);
    }

    // On-demand canvas: keep frames coming until everything has settled
    if (c.current !== c.target || s.velocity !== 0) invalidate();
  });

  return (
    <>
      {textures.map((_, i) => (
        <mesh
          key={sources[i]}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <planeGeometry args={[1, 1, 24, 24]} />
          <shaderMaterial
            ref={(el) => {
              materials.current[i] = el;
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={initialUniforms[i]}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function SequencerScene(props: {
  sources: string[];
  controlRef: React.RefObject<SequencerControl>;
  reduceMotion: boolean;
  onActive: (index: number) => void;
  onReady: () => void;
}) {
  return (
    <tunnel.In>
      <Suspense fallback={null}>
        <Cards {...props} />
      </Suspense>
    </tunnel.In>
  );
}
