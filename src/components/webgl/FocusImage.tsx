"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { tunnel } from "@/providers/TunnelProvider";
import { useStore } from "@/store/useStore";

// The one WebGL moment on a page: a small image, synced to a DOM box, that
// bends with scroll speed and dissolves from one picture to the next.

const vertexShader = `
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Bow the plane against the scroll direction
    pos.y += sin(uv.x * 3.14159) * uVelocity * 0.06;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec2 uFromRes;
  uniform vec2 uToRes;
  uniform vec2 uResolution;
  uniform float uProgress;
  uniform float uVelocity;
  varying vec2 vUv;

  // object-fit: cover
  vec2 cover(vec2 uv, vec2 imageRes) {
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (imageRes.x / imageRes.y), 1.0),
      min((uResolution.y / uResolution.x) / (imageRes.y / imageRes.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

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

  // Split the channels vertically as the page moves
  vec3 sampleShifted(sampler2D tex, vec2 uv) {
    vec2 shift = vec2(0.0, uVelocity * 0.012);
    return vec3(
      texture2D(tex, uv + shift).r,
      texture2D(tex, uv).g,
      texture2D(tex, uv - shift).b
    );
  }

  void main() {
    vec3 from = sampleShifted(uFrom, cover(vUv, uFromRes));
    vec3 to = sampleShifted(uTo, cover(vUv, uToRes));

    // A grainy dissolve rather than a plain crossfade
    float n = noise(vUv * 9.0) * 0.7 + hash(vUv * 300.0) * 0.3;
    float edge = uProgress * 1.2 - 0.1;
    float t = smoothstep(edge - 0.1, edge, n);

    gl_FragColor = vec4(mix(to, from, t), 1.0);
  }
`;

function imageSize(texture: THREE.Texture) {
  const image = texture.image as HTMLImageElement | undefined;
  return new THREE.Vector2(image?.width || 1, image?.height || 1);
}

function FocusMesh({
  domRef,
  sources,
  index,
  onReady,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
  sources: string[];
  index: number;
  onReady: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textures = useTexture(sources, (loaded) => {
    for (const texture of [loaded].flat()) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  });
  const reduceMotion = useReducedMotion();
  const { size, viewport } = useThree();

  // Initial values only: from here on the uniforms change through the
  // material, never through this object
  const initialUniforms = useMemo(
    () => ({
      uFrom: { value: textures[0] },
      uTo: { value: textures[0] },
      uFromRes: { value: imageSize(textures[0]) },
      uToRes: { value: imageSize(textures[0]) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uProgress: { value: 1 },
      uVelocity: { value: 0 },
    }),
    [textures],
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((_, delta) => {
    const dom = domRef.current;
    const mesh = meshRef.current;
    const uniforms = materialRef.current?.uniforms;
    if (!dom || !mesh || !uniforms) return;

    const rect = dom.getBoundingClientRect();
    const offscreen = rect.bottom < 0 || rect.top > size.height;
    mesh.visible = !offscreen && rect.width > 0;
    if (!mesh.visible) return;

    // A new picture was picked: dissolve to it from whatever is showing now
    const target = textures[index];
    if (target && uniforms.uTo.value !== target) {
      uniforms.uFrom.value = uniforms.uTo.value;
      uniforms.uFromRes.value = uniforms.uToRes.value;
      uniforms.uTo.value = target;
      uniforms.uToRes.value = imageSize(target);
      uniforms.uProgress.value = reduceMotion ? 1 : 0;
    }

    // Ease the dissolve and the scroll velocity toward their targets
    uniforms.uProgress.value = Math.min(
      uniforms.uProgress.value + delta * 1.4,
      1,
    );
    const velocity = reduceMotion
      ? 0
      : THREE.MathUtils.clamp(useStore.getState().scrollVelocity / 40, -1, 1);
    uniforms.uVelocity.value += (velocity - uniforms.uVelocity.value) * 0.1;

    // DOM-to-canvas sync: match the plane to the box on screen
    const width = (rect.width / size.width) * viewport.width;
    const height = (rect.height / size.height) * viewport.height;
    uniforms.uResolution.value.set(rect.width, rect.height);
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
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1, 32, 32]} />
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

export default function FocusImage({
  sources,
  index,
  alt,
  className = "",
}: {
  sources: string[];
  index: number;
  alt: string;
  className?: string;
}) {
  const domRef = useRef<HTMLDivElement>(null);
  const [glReady, setGlReady] = useState(false);
  const handleReady = useMemo(() => () => setGlReady(true), []);

  return (
    <div ref={domRef} className={`relative overflow-hidden ${className}`}>
      {/* The DOM picture shows until the textures are on the GPU, and stays
          as the fallback when WebGL is unavailable */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[index]}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${glReady ? "opacity-0" : "opacity-100"}`}
      />
      <tunnel.In>
        <Suspense fallback={null}>
          <FocusMesh
            domRef={domRef}
            sources={sources}
            index={index}
            onReady={handleReady}
          />
        </Suspense>
      </tunnel.In>
    </div>
  );
}
