"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import RevealFooter from "@/components/ui/RevealFooter";
import FocusImage from "@/components/webgl/FocusImage";
import LinerNotes, { Passage } from "@/components/sections/LinerNotes";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import SwissVideoBlock from "@/components/sections/SwissVideoBlock";
import { useHud } from "@/hooks/useHud";

// Placeholder copy: swap in the studio's own words.
const PASSAGES: Passage[] = [
  {
    label: "SOJU",
    indent: "50%",
    segments: [
      "Digital creative studio working where code turns into material. SOJU builds sites, tools and moving pictures for people who make things: instruments, rings, glasses, shoes. Small by design, the studio is known for one thing above all: work that feels made by hand, even when it runs on the GPU.",
    ],
  },
  {
    indent: "33%",
    segments: [
      "The practice took shape with",
      {
        text: "Native Instruments,",
        note: {
          body: "Redefining the digital ecosystem for the leading maker of software and hardware for computer-based music.",
          href: "/work/native-instruments",
          linkLabel: "Case study",
        },
      },
      "a site that plays like the hardware it sells. Since then: a launch for",
      {
        text: "Oura",
        note: {
          body: "An immersive, hardware-first narrative for the Generation 3 smart ring.",
          href: "/work/oura",
          linkLabel: "Case study",
        },
      },
      "you can almost hold, a flagship for",
      {
        text: "Gentle Monster",
        note: {
          body: "A digital flagship as surreal and architectural as the stores themselves.",
          href: "/work/gentle-monster",
          linkLabel: "Case study",
        },
      },
      "stranger than its stores, and a campaign hub for",
      {
        text: "Puma",
        note: {
          body: "A high-velocity campaign hub built on kinetic type and hardware-accelerated video.",
          href: "/work/puma-pov",
          linkLabel: "Case study",
        },
      },
      "that never stands still.",
    ],
  },
  {
    label: "Practice",
    indent: "25%",
    segments: [
      "Direction, design and engineering sit at one table, so the idea that starts on paper is the one that ships, at sixty frames a second.",
    ],
  },
];

const NOTES_IMAGES = [
  "/assets/images/image_001.webp",
  "/assets/images/image_004.webp",
  "/assets/images/image_007.webp",
  "/assets/images/image_010.webp",
];

export default function Home() {
  useHud("Selected Works", [
    "aSide: Interactive WebGL",
    "bSide: Creative Direction",
    "Berlin — Seoul",
    "Index 2021—2026",
  ]);

  // The notes picture turns over slowly on its own, like a slideshow on a shelf
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(
      () => setImageIndex((i) => (i + 1) % NOTES_IMAGES.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [reduceMotion]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-clip">
      <RevealFooter
        extra={
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="pointer-events-auto absolute bottom-8 right-8 md:bottom-12 md:right-16 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-500 z-50 group"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-y-1 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 19V5M5 12l7-7 7 7"
              />
            </svg>
          </button>
        }
      >
        {/* Section 1: the SOJU type reveal, pinned while the page slides over it */}
        <StickyHeroReveal
          title="SOJU"
          subtitle="Explore our universe"
          showTrademark={true}
        />

        <div className="relative z-10 bg-zinc-950 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
          {/* Section 2: the video block */}
          <div className="w-full px-8 md:px-16 pt-32 relative z-20">
            <div className="flex justify-between items-end">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400">
                Production Capabilities
              </p>
              <div className="hidden md:block w-1/3 h-[1px] bg-zinc-800" />
            </div>
            <SwissVideoBlock />
          </div>

          {/* Section 3: liner notes, two viewports of type running into the footer */}
          <section className="min-h-[200vh] flex flex-col justify-between gap-[12vw] px-5 md:px-8 pt-[20vh] pb-[16vh]">
            <div>
              <FocusImage
                sources={NOTES_IMAGES}
                index={imageIndex}
                alt="Studio work in progress"
                className="mx-auto mb-[8vw] md:mb-[3vw] w-[28vw] md:w-[8vw] aspect-[4/5] bg-zinc-900"
              />
              <LinerNotes passages={PASSAGES.slice(0, 1)} />
            </div>
            <LinerNotes passages={PASSAGES.slice(1)} />
          </section>
        </div>
      </RevealFooter>
    </main>
  );
}
