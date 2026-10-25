"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import { useHud } from "@/hooks/useHud";

export default function AboutPage() {
  useHud("About", [
    "Digital creative studio",
    "Creative direction / WebGL",
    "Berlin — Seoul",
  ]);

  return (
    <>
      <main className="relative bg-zinc-100 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip transition-colors duration-500">
        <RevealFooter className="transition-colors duration-500">
          {/* =======================================================
              1. THE UNIFIED HERO
              ======================================================= */}
          <StickyHeroReveal title="ABOUT" showTrademark={false} />

          {/* =======================================================
              2. THE SLIDING CONTENT LAYER
              ======================================================= */}
          <div className="relative z-10 bg-zinc-100 dark:bg-zinc-950 pt-24 md:pt-40 pb-32 transition-colors duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border-t border-zinc-200 dark:border-zinc-800">
            <div className="px-8 md:px-16 max-w-[1800px] mx-auto">
              {/* THE FIX: Added `items-start` to lock the columns to the absolute top */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">
                {/* Left Column: The Massive Text Hook */}
                {/* THE FIX: Removed `justify-center` so it rests naturally at the ceiling */}
                <div className="lg:col-span-8 flex flex-col pt-0">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-zinc-900 dark:text-zinc-100 mb-8">
                    We are a digital creative studio blurring the line between
                    technology and art.
                  </h2>
                  <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl leading-relaxed">
                    By combining strategic design with cutting-edge WebGL and
                    motion physics, we build immersive brand experiences for
                    venture portfolios and enterprise clients that drive
                    undeniable business results.
                  </p>
                </div>

                {/* Right Column: The Capabilities List */}
                {/* THE FIX: Removed `justify-end` and added `lg:mt-2` for perfect optical alignment with the 7xl text */}
                <div className="lg:col-span-4 mt-12 lg:mt-2 flex flex-col pt-0">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    Capabilities
                  </p>
                  <ul className="flex flex-col gap-y-4 text-lg md:text-xl font-medium text-zinc-900 dark:text-zinc-100">
                    <li className="flex items-center justify-between group cursor-pointer">
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        Creative Direction
                      </span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        Interactive WebGL
                      </span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        UI/UX Design
                      </span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        Headless CMS Integration
                      </span>
                    </li>
                    <li className="flex items-center justify-between group cursor-pointer">
                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        E-Commerce Architecture
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* A massive agency-style image block */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full mt-32 relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-900"
              >
                <Image
                  src="/images/project-10.jpg"
                  alt="unitPLUS Studio"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </motion.div>
            </div>
          </div>
        </RevealFooter>
      </main>
    </>
  );
}
