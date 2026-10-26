"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { tunnel } from "@/providers/TunnelProvider";
import { useEffect, type RefObject } from "react";

// R3F reads its event source once, when the canvas is created on the client.
// A ref whose current is the body gives it the right element every time,
// with no state and no window where it could connect to its own wrapper
// (which has pointer-events: none) instead.
const bodyRef = {
  get current() {
    return typeof document === "undefined" ? null : document.body;
  },
} as unknown as RefObject<HTMLElement>;

// The canvas renders on demand: scenes ask for frames while they animate.
// Scrolling and resizing move the DOM boxes the scenes follow, so they ask
// for a frame too, but only when the page has sent a scene into the canvas.
function RenderOnScroll() {
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);

  // Resizing the canvas clears it, and its new size lands a moment after the
  // window's resize event, so draw again once the size itself has changed
  useEffect(() => {
    invalidate();
  }, [size, invalidate]);

  useEffect(() => {
    const requestFrame = () => {
      if (scene.children.length > 0) invalidate();
    };
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame);
    return () => {
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
    };
  }, [scene, invalidate]);

  return null;
}

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
        frameloop="demand"
      >
        <RenderOnScroll />
        <tunnel.Out />
        <Preload all />
      </Canvas>
    </div>
  );
}
