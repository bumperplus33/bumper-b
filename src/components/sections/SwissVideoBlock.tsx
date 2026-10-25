"use client";

import { motion } from "framer-motion";
import InteractiveVideoBlock from "../ui/InteractiveVideoBlock";


export default function SwissVideoBlock() {
  return (
    <section className="w-full pt-16 pb-24 md:pt-24 md:pb-40 transition-colors duration-500 overflow-hidden">
      {/* THE FULL-BREADTH THIN RULE */}
      <div className="w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 mb-12 md:mb-24 transition-colors duration-500" />

      {/* THE CRT TELEVISION SVG FILTER */}
      <svg className="hidden">
        <filter id="tv-glitch" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="1"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"
            in="noise"
            result="coloredNoise"
          />
          <feComposite
            operator="in"
            in="coloredNoise"
            in2="SourceGraphic"
            result="composite"
          />
          <feBlend mode="screen" in="composite" in2="SourceGraphic" />
        </filter>
      </svg>

      <div className="w-full px-6 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* LEFT COLUMN: The 16:9 Cinematic Video Block */}
        <div className="md:col-span-8 w-full relative group cursor-crosshair">
          <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-zinc-900 shadow-2xl">
            <InteractiveVideoBlock
              src="/videos/showcase-reel.mp4"
              poster="/images/video-poster.jpg"
            />

            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay z-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  to bottom,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.8) 2px,
                  rgba(0, 0, 0, 0.8) 4px
                )`,
              }}
            />

            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] z-20" />

            <div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30"
              style={{ filter: "url(#tv-glitch)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4 transition-colors duration-500">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mb-1">
                Context
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest transition-colors duration-500">
                Cinematic UI
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mb-1">
                Index
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest transition-colors duration-500">
                016.90
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Condensed Typographic Block */}
        {/* THE FIX: Removed `h-full justify-end pb-8`. This allows the content to naturally sit flush at the top! */}
        <div className="md:col-span-4 flex flex-col pt-4 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
          >
            <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-zinc-500 mb-6">
              Visual Architecture — 04
            </p>

            <h2
              className="text-[18vw] md:text-[5vw] tracking-tighter leading-[0.82] uppercase text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-neue"
            >
              THE <br />
              MOTION <br />
              STUDY.
            </h2>

            <p className="mt-8 text-sm md:text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              A study in kinetic motion and structural layout. By treating video
              not as media, but as moving textural geometry, we dissolve the
              boundary between the interface and the content itself.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
