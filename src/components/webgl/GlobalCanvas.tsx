"use client";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";
import type { RefObject } from "react";

// R3F reads its event source once, when the canvas is created on the client.
// A ref whose current is the body gives it the right element every time,
// with no state and no window where it could connect to its own wrapper
// (which has pointer-events: none) instead.
const bodyRef = {
  get current() {
    return typeof document === "undefined" ? null : document.body;
  },
} as unknown as RefObject<HTMLElement>;

export default function GlobalCanvas() {
  return (
    // PERMANENTLY set to pointer-events-none so it NEVER blocks your HTML!
    <div className="fixed inset-0 z-[40] pointer-events-none">
      <Canvas
        style={{ pointerEvents: "none" }}
        // SECRET WEAPON: Tell WebGL to listen to the document body for interactions!
        eventSource={bodyRef}
        eventPrefix="client"
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
        camera={{ position: [0, 0, 5], fov: 75 }}
        frameloop="always"
      >
        <tunnel.Out />
        <Preload all />
      </Canvas>
    </div>
  );
}
