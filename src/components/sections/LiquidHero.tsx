"use client";

import { useCallback, useRef, useState } from "react";
import LiquidTitle from "@/components/webgl/LiquidTitle";
import Label from "@/components/ui/Label";
import Link from "@/components/ui/TransitionLink";
import { PROJECTS } from "@/data/projects";

// The Home hero: the SOJU wordmark, set twice, over a liquid WebGL blob.
// The DOM text is the layout, the accessible title and the fallback; the
// shader draws every [data-gl-text] element at the same place, then hides
// the DOM copy once it's on screen.
//
// The WebGL plane is opaque and covers its box, so the Sequencer link sits
// in a strip below the box, outside the canvas, where it stays ordinary
// HTML: hoverable, focusable and readable without WebGL.

const LOCKUP = ["SOJU®", "Studio"];

export default function LiquidHero() {
  const glRef = useRef<HTMLDivElement>(null);
  const [glReady, setGlReady] = useState(false);
  const handleReady = useCallback(() => setGlReady(true), []);

  const lineClass = `block font-neue uppercase text-[19vw] md:text-[11vw] leading-[0.86] tracking-[-0.03em] transition-colors duration-300 ${glReady ? "text-transparent" : "text-zinc-100"}`;

  return (
    <section className="relative h-[100dvh] bg-zinc-950 overflow-hidden flex flex-col select-none">
      <div
        ref={glRef}
        className="relative flex-1 flex flex-col justify-between items-center text-center px-5 md:px-8 pt-[14vh] pb-[5vh]"
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
      </div>

      <LiquidTitle domRef={glRef} onReady={handleReady} />

      {/* The way into the Sequencer */}
      <Link
        href="/sequencer"
        className="group relative grid grid-cols-12 items-center gap-4 px-5 md:px-8 py-4 md:py-5 border-t border-zinc-800 hover:bg-zinc-900 focus-visible:bg-zinc-900 outline-none transition-colors duration-300"
      >
        <Label className="col-span-12 md:col-span-3">Sequencer</Label>
        <span className="col-span-9 md:col-span-6 type-heading">
          Enter the Sequencer
        </span>
        <span className="col-span-3 md:col-span-3 type-micro text-zinc-400 text-right">
          <span className="hidden md:inline">
            Every project, in one loop —{" "}
          </span>
          {String(PROJECTS.length).padStart(2, "0")}{" "}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-zinc-100">
            ↗
          </span>
        </span>
      </Link>
    </section>
  );
}
