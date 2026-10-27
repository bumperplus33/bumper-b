"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useProgress } from "@react-three/drei";

// The preloader waits for the WebGL textures and the fonts, but never longer
// than this. Most textures are only for hover effects, and on a slow
// connection they can take tens of seconds; the page and its title reveal
// shouldn't wait on them.
const MAX_WAIT_MS = 3000;

export default function Preloader() {
  const isLoading = useStore((state) => state.isLoading);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompletelyHidden, setIsCompletelyHidden] = useState(false);

  const { progress: r3fProgress, active: r3fActive } = useProgress();

  // The loop below runs once for the preloader's whole life and reads the
  // latest loading state from these refs, so the counter never restarts
  const r3fRef = useRef({ progress: r3fProgress, active: r3fActive });
  const fontsReadyRef = useRef(false);

  useEffect(() => {
    r3fRef.current = { progress: r3fProgress, active: r3fActive };
  }, [r3fProgress, r3fActive]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fontsReadyRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const start = performance.now();
    let current = 0;
    let frame = 0;
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const timedOut = performance.now() - start > MAX_WAIT_MS;
      const { progress, active } = r3fRef.current;
      let target = timedOut || !active ? 100 : progress;
      // Hold short of 100 until the fonts are in, so the title doesn't
      // animate in a fallback face
      if (!timedOut && !fontsReadyRef.current) target = Math.min(target, 90);

      // Ease toward the target, but only ever count up
      current = Math.max(
        current,
        Math.min(current + (target - current) * 0.1 + Math.random() * 0.5, 100),
      );

      if (current >= 99.5) {
        setDisplayProgress(100);
        doneTimer = setTimeout(() => setIsLoading(false), 400);
        return;
      }
      setDisplayProgress(Math.min(Math.round(current), 99));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(doneTimer);
    };
  }, [setIsLoading]);

  if (isCompletelyHidden) return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isLoading ? 0 : "-100vh" }}
      transition={{
        duration: 1.2,
        ease: [0.76, 0, 0.24, 1],
        delay: 0.2,
      }}
      onAnimationComplete={() => {
        if (!isLoading) setIsCompletelyHidden(true);
      }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 touch-none"
    >
      <div className="overflow-hidden pt-4 pb-12 px-4 -mt-4 -mb-12 -mx-4">
        <motion.span
          animate={{ y: isLoading ? "0%" : "-120%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          // 2. THE FIX: Injected the custom font class into the massive percentage text
          className="block text-[22vw] leading-[0.75] tracking-tighter uppercase font-black pr-[0.05em] font-neue"
        >
          {displayProgress}%
        </motion.span>
      </div>

      <div className="absolute bottom-12 overflow-hidden pt-2 pb-2 -mt-2 -mb-2">
        <motion.p
          animate={{ y: isLoading ? "0%" : "-120%" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
          className="text-xs font-bold tracking-[0.4em] uppercase text-zinc-500"
        >
          Bumper Initializing
        </motion.p>
      </div>
    </motion.div>
  );
}
