"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useProgress } from "@react-three/drei";


export default function Preloader() {
  const { isLoading, setIsLoading } = useStore();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isCompletelyHidden, setIsCompletelyHidden] = useState(false);

  const { progress: r3fProgress, active: r3fActive } = useProgress();

  useEffect(() => {
    let currentProgress = 0;
    let animationFrameId: number;

    const updateProgress = () => {
      const targetProgress = r3fActive ? r3fProgress : 100;
      currentProgress += (targetProgress - currentProgress) * 0.1;
      currentProgress += Math.random() * 0.5;

      if (currentProgress >= 99.5) {
        setDisplayProgress(100);
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      } else {
        setDisplayProgress(Math.min(Math.round(currentProgress), 99));
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrameId);
  }, [r3fProgress, r3fActive, setIsLoading]);

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
          {/* 3. THE FIX: Updated the old branding to match the new SOJU identity */}
          SOJU Initializing
        </motion.p>
      </div>
    </motion.div>
  );
}
