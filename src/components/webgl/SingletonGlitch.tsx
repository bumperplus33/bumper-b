"use client";

import { useRef, useEffect, Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHoverState;
  
  // THE FIX: New uniforms for Object-Cover math!
  uniform vec2 uResolution;
  uniform vec2 uImageRes;
  
  varying vec2 vUv;

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    // THE FIX: WebGL Object-Cover Math
    // This perfectly crops the texture to match the DOM Image without squishing it!
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageRes.x / uImageRes.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageRes.y / uImageRes.x), 1.0)
    );
    vec2 p = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    
    // Glitch distortion math
    float jitter = rand(vec2(uTime, p.y)) * 0.02 * uHoverState;
    p.x += jitter - 0.01;

    float shiftX = 0.015 * uHoverState;
    vec4 cr = texture2D(uTexture, vec2(p.x + shiftX, p.y));
    vec4 cga = texture2D(uTexture, p);
    vec4 cb = texture2D(uTexture, vec2(p.x - shiftX, p.y));
    
    float scanline = sin(p.y * 800.0) * 0.04 * uHoverState;
    
    vec4 finalColor = vec4(cr.r, cga.g, cb.b, cga.a) - scanline;
    
    // The mesh goes completely invisible when uHoverState hits 0
    gl_FragColor = finalColor * uHoverState;
  }
`;

function GlitchMesh({
  domRef,
  textureUrl,
  active,
}: {
  domRef: React.RefObject<HTMLDivElement | null>;
  textureUrl: string;
  active: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(textureUrl);

  // THE FIX: State for the 1.5 second burst
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (active) {
      setIsGlitching(true);
      timeout = setTimeout(() => {
        setIsGlitching(false); // Turn off the glitch after 1.5 seconds!
      }, 1500);
    } else {
      setIsGlitching(false);
    }
    return () => clearTimeout(timeout);
  }, [active]);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const uniforms = useMemo(() => {
    // Grab the intrinsic width/height of the actual image file
    const image = texture?.image as HTMLImageElement | undefined;
    const imgRes = image
      ? new THREE.Vector2(image.width, image.height)
      : new THREE.Vector2(1, 1);

    return {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uHoverState: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageRes: { value: imgRes },
    };
  }, [texture]);

  const { size, viewport } = useThree();

  useFrame((state, delta) => {
    if (!domRef.current || !meshRef.current || !materialRef.current) return;

    materialRef.current.uniforms.uTime.value += delta;

    // Smoothly fade the glitch in and out based on the timer
    const targetHover = isGlitching ? 1 : 0;
    materialRef.current.uniforms.uHoverState.value +=
      (targetHover - materialRef.current.uniforms.uHoverState.value) * 0.1;

    if (materialRef.current.uniforms.uHoverState.value < 0.01) {
      meshRef.current.visible = false;
      return;
    } else {
      meshRef.current.visible = true;
    }

    const rect = domRef.current.getBoundingClientRect();
    const width = (rect.width / size.width) * viewport.width;
    const height = (rect.height / size.height) * viewport.height;

    // Update the resolution uniform dynamically as the container scales!
    materialRef.current.uniforms.uResolution.value.set(rect.width, rect.height);

    const x =
      (rect.left / size.width) * viewport.width -
      viewport.width / 2 +
      width / 2;
    const y =
      -(rect.top / size.height) * viewport.height +
      viewport.height / 2 -
      height / 2;

    meshRef.current.scale.set(width, height, 1);
    meshRef.current.position.set(x, y, 0);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function SingletonGlitch({
  textureUrl,
  active,
}: {
  textureUrl: string;
  active: boolean;
}) {
  const domRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={domRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
      />
      <tunnel.In>
        <Suspense fallback={null}>
          <GlitchMesh domRef={domRef} textureUrl={textureUrl} active={active} />
        </Suspense>
      </tunnel.In>
    </>
  );
}
