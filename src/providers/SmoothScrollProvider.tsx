"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useStore } from "@/store/useStore";

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const isScrollLocked = useStore((state) => state.isScrollLocked);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize standard Lenis smooth scrolling for the site
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Publish scroll state for the WebGL loop and anything else that reads it.
    // Lenis emits once more with velocity 0 when it settles.
    const unsubscribe = lenis.on("scroll", (l: Lenis) => {
      useStore.getState().setScroll(l.progress || 0, l.velocity);
    });

    let frame: number;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  // Every route starts at the top. Going through Lenis keeps its animated
  // position in sync, where a bare window.scrollTo would be undone.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // --- THE ZUSTAND AIR TRAFFIC CONTROLLER ---
  // Listens for the lock signal and safely disables/enables scrolling
  useEffect(() => {
    if (isScrollLocked) {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = "auto";
    }

    // Failsafe cleanup in case the component unmounts while locked
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isScrollLocked]);

  return <>{children}</>;
}
