"use client";

import { useCallback, useRef, useState } from "react";
import LiquidTitle from "@/components/webgl/LiquidTitle";

// The Home hero: the SOJU wordmark, set twice, over a liquid WebGL blob.
// The DOM text is the layout, the accessible title and the fallback; the
// shader draws every [data-gl-text] element at the same place, then hides
// the DOM copy once it's on screen.

const LOCKUP = ["SOJU®", "Studio"];

export default function LiquidHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [glReady, setGlReady] = useState(false);
  const handleReady = useCallback(() => setGlReady(true), []);

  const lineClass = `block font-neue uppercase text-[19vw] md:text-[11vw] leading-[0.86] tracking-[-0.03em] transition-colors duration-300 ${glReady ? "text-transparent" : "text-zinc-100"}`;

  return (
    <section
      ref={sectionRef}
      className="relative h-[100dvh] bg-zinc-950 overflow-hidden flex flex-col justify-between items-center text-center px-5 md:px-8 pt-[16vh] pb-[9vh] select-none"
    >
      <h1 aria-label="SOJU Studio">
        {LOCKUP.map((line) => (
          <span key={line} className="block">
            <span data-gl-text className={`inline-block ${lineClass}`}>
              {line}
            </span>
          </span>
        ))}
      </h1>

      <p
        data-gl-text
        className={`type-micro transition-colors duration-300 ${glReady ? "text-transparent" : "text-zinc-500"}`}
      >
        Move to stir — press to swell
      </p>

      <div aria-hidden>
        {LOCKUP.map((line) => (
          <span key={line} className="block">
            <span data-gl-text className={`inline-block ${lineClass}`}>
              {line}
            </span>
          </span>
        ))}
      </div>

      <LiquidTitle domRef={sectionRef} onReady={handleReady} />
    </section>
  );
}
