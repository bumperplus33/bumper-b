"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import LinerNotes, { Passage } from "@/components/sections/LinerNotes";
import Label from "@/components/ui/Label";
import { useHud } from "@/hooks/useHud";

const STATEMENT: Passage[] = [
  {
    label: "Studio",
    indent: "33%",
    segments: [
      "We are a digital creative studio blurring the line between technology and art. By combining strategic design with cutting-edge WebGL and motion physics, we build immersive brand experiences for venture portfolios and enterprise clients that drive undeniable business results.",
    ],
  },
];

const CAPABILITIES = [
  "Creative Direction",
  "Interactive WebGL",
  "UI/UX Design",
  "Headless CMS Integration",
  "E-Commerce Architecture",
];

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
          <div className="relative z-10 bg-zinc-100 dark:bg-zinc-950 px-5 md:px-8 pt-[20vh] pb-[16vh] transition-colors duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border-t border-zinc-200 dark:border-zinc-800">
            {/* The statement, set like the liner notes on Home */}
            <LinerNotes passages={STATEMENT} />

            {/* Capabilities as an index */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-[12vw]">
              <Label className="md:col-span-4 md:pt-3 self-start">
                Capabilities
              </Label>
              <ul className="md:col-span-8 border-t border-zinc-800">
                {CAPABILITIES.map((capability, i) => (
                  <li
                    key={capability}
                    className="grid grid-cols-12 items-baseline gap-4 py-3 border-b border-zinc-800"
                  >
                    <span className="col-span-2 md:col-span-1 type-micro text-zinc-500">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="col-span-10 md:col-span-11 type-heading">
                      {capability}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* A massive agency-style image block */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-[12vw] relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-zinc-200 dark:bg-zinc-900"
            >
              <Image
                src="/images/project-10.jpg"
                alt="unitPLUS Studio"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </motion.div>
          </div>
        </RevealFooter>
      </main>
    </>
  );
}
