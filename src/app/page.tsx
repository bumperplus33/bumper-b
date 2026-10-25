"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import RevealFooter from "@/components/ui/RevealFooter";
import FocusImage from "@/components/webgl/FocusImage";
import LinerNotes, { Passage } from "@/components/sections/LinerNotes";
import WorksIndex from "@/components/sections/WorksIndex";
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

const HERO_IMAGES = [
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

  // The hero picture turns over slowly on its own, like a slideshow on a shelf
  const reduceMotion = useReducedMotion();
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(
      () => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-clip">
      <RevealFooter className="bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <section className="px-5 md:px-8 pt-[26vh] md:pt-[30vh]">
          <FocusImage
            sources={HERO_IMAGES}
            index={heroIndex}
            alt="Studio work in progress"
            className="mx-auto mb-[8vw] md:mb-[3vw] w-[28vw] md:w-[8vw] aspect-[4/5] bg-zinc-900"
          />
          <LinerNotes passages={PASSAGES} />
        </section>

        <WorksIndex />
      </RevealFooter>
    </main>
  );
}
