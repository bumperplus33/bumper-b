"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ClunkyReveal from "@/components/motion/ClunkyReveal";

interface StickyHeroRevealProps {
  title?: string;
  subtitle?: string;
  showTrademark?: boolean;
}

export default function StickyHeroReveal({
  title = "Bumper",
  subtitle = "Scroll to discover",
  showTrademark = true,
}: StickyHeroRevealProps) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Progress through the first screen: 0 at the top, 1 once the content
  // layer has slid fully over the hero.
  const { scrollY } = useScroll();
  const motionScroll = useTransform(scrollY, (y) =>
    typeof window === "undefined" ? 0 : Math.min(y / window.innerHeight, 1),
  );

  // Hold the title fully opaque for its first moments, until the scroll
  // position has settled after navigation. Each page mounts its own hero,
  // so this starts false on every route without resetting it here.
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const titleOpacity = useTransform(motionScroll, [0, 0.5], [1, 0]);
  const titleScale = useTransform(motionScroll, [0, 1], [1, 0.85]);
  const titleY = useTransform(motionScroll, [0, 1], ["0%", "20%"]);

  return (
    // THE FIX: Swapped 'h-screen' for 'h-[100dvh]' so Safari's URL bar doesn't cause the layout to jump!
    <div className="h-[100dvh] w-full sticky top-0 flex flex-col items-center justify-center overflow-hidden bg-zinc-200 dark:bg-zinc-900 transition-colors duration-500 z-0 isolate transform-gpu">
      <motion.div
        style={{
          scale: titleScale,
          opacity: isReady ? titleOpacity : 1,
          y: titleY,
        }}
        className={`flex flex-row items-start justify-center text-[22vw] leading-[0.75] tracking-tight uppercase text-zinc-900 dark:text-zinc-100 font-neue font-black whitespace-nowrap`}
      >
        <ClunkyReveal key={`text-${pathname}`} text={title} delay={0.2} />

        {showTrademark && (
          <motion.span
            key={`tm-${pathname}`}
            initial={{ opacity: 0, scale: 0, rotateY: -180, rotateZ: -45 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0 }}
            transition={{
              delay: 1.0,
              type: "spring",
              stiffness: 200,
              damping: 12,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="text-[8vw] align-top relative top-2 md:top-4 ml-2 inline-block"
          >
            ®
          </motion.span>
        )}
      </motion.div>
      <motion.p
        key={`${pathname}-subtitle`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
        style={{ opacity: isReady ? titleOpacity : 1 }}
        className="absolute bottom-12 text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
