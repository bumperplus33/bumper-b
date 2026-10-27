"use client";

import { useRef, use } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { usePageTransition } from "@/providers/PageTransitionProvider";

import RevealFooter from "@/components/ui/RevealFooter";
import LinerNotes from "@/components/sections/LinerNotes";
import Label from "@/components/ui/Label";
import { useHud } from "@/hooks/useHud";
import { PROJECTS } from "@/data/projects";

// FULLY MAPPED SEQUENCE
interface ProjectDetail {
  name: string;
  client: string;
  role: string;
  timeline: string;
  location: string;
  heroImage: string;
  challenge: string;
  nextProject: { name: string; slug: string };
}

const PROJECT_DB: Record<string, ProjectDetail> = {
  "native-instruments": {
    name: "Native Instruments",
    client: "NI GmbH",
    role: "Lead Agency",
    timeline: "Q3 2023",
    location: "Berlin, DE",
    heroImage: "/images/project-1.jpg",
    challenge:
      "Redefining the digital ecosystem for the world's leading provider of software and hardware for computer-based audio production.",
    nextProject: { name: "Oura", slug: "oura" },
  },
  oura: {
    name: "Oura",
    client: "Oura Health",
    role: "Digital Partner",
    timeline: "Q2 2023",
    location: "Oulu, FI",
    heroImage: "/images/project-2.jpg",
    challenge:
      "Creating an immersive, hardware-focused narrative to launch the Generation 3 smart ring to a global audience.",
    nextProject: { name: "Hender Scheme", slug: "hender-scheme" },
  },
  "hender-scheme": {
    name: "Hender Scheme",
    client: "Hender Scheme",
    role: "Creative Direction",
    timeline: "Q1 2023",
    location: "Tokyo, JP",
    heroImage: "/images/project-3.jpg",
    challenge:
      "Translating the physical craftsmanship of premium Japanese leather goods into a tactile digital commerce experience.",
    nextProject: { name: "B&O Play", slug: "bo-play" },
  },
  "bo-play": {
    name: "B&O Play",
    client: "Bang & Olufsen",
    role: "Interactive Design",
    timeline: "Q4 2022",
    location: "Struer, DK",
    heroImage: "/images/project-4.jpg",
    challenge:
      "A sonic interaction study pushing the boundaries of WebGL audio visualization for premium acoustic hardware.",
    nextProject: { name: "Nothing", slug: "nothing" },
  },
  nothing: {
    name: "Nothing",
    client: "Nothing Tech",
    role: "Technical Partner",
    timeline: "Q3 2022",
    location: "London, UK",
    heroImage: "/images/project-5.jpg",
    challenge:
      "Embracing radical transparency in both hardware engineering and digital interface architecture.",
    nextProject: { name: "Gentle Monster", slug: "gentle-monster" },
  },
  "gentle-monster": {
    name: "Gentle Monster",
    client: "IICOMBINED",
    role: "Lead Agency",
    timeline: "Q2 2022",
    location: "Seoul, KR",
    heroImage: "/images/project-6.jpg",
    challenge:
      "Designing an avant-garde digital flagship that matches the surreal, architectural brilliance of their physical retail spaces.",
    nextProject: { name: "Puma POV", slug: "puma-pov" },
  },
  "puma-pov": {
    name: "Puma POV",
    client: "Puma SE",
    role: "Creative Design",
    timeline: "Q1 2021",
    location: "Global",
    heroImage: "/images/project-7.jpg",
    challenge:
      "A high-velocity campaign hub built around kinetic typography and hardware-accelerated video transitions.",
    nextProject: { name: "Jaarvis Noir", slug: "jaarvis" },
  },
  jaarvis: {
    name: "Jaarvis Noir",
    client: "Jaarvis",
    role: "Event",
    timeline: "Q4 2021",
    location: "Paris, FR",
    heroImage: "/images/project-8.jpg",
    challenge:
      "An exclusive, ephemeral digital invitation exploring themes of darkness, luxury, and brutalist typography.",
    nextProject: { name: "DPSC x Puma", slug: "dpsc-puma" },
  },
  // The three featured works below share the placeholder status of the rest
  // of this data: swap in the real details and copy.
  "dpsc-puma": {
    name: "DPSC x Puma",
    client: "Puma SE",
    role: "Creative Concept",
    timeline: "Q3 2022",
    location: "Global",
    heroImage: "/images/project-3.jpg",
    challenge:
      "A creative concept pairing two visual languages in one capsule launch, told through bold colour and motion-led product storytelling.",
    nextProject: { name: "Grid 7 Years", slug: "grid-7-years" },
  },
  "grid-7-years": {
    name: "Grid 7 Years",
    client: "Grid",
    role: "Art Direction",
    timeline: "Q2 2022",
    location: "Berlin, DE",
    heroImage: "/images/project-4.jpg",
    challenge:
      "An anniversary piece marking seven years of work, set as an archive that rearranges itself on a strict typographic grid.",
    nextProject: { name: "Music Battle", slug: "puma-music" },
  },
  "puma-music": {
    name: "Music Battle",
    client: "Puma SE",
    role: "Direction",
    timeline: "Q4 2021",
    location: "Global",
    heroImage: "/images/project-5.jpg",
    challenge:
      "A live music battle staged for the screen, directed so the crowd, the sound and the product cut together in real time.",
    nextProject: { name: "Native Instruments", slug: "native-instruments" },
  },
};

function ParallaxGalleryImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-sm ${className}`}
    >
      <motion.div
        style={{ y, scale: 1.15 }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </motion.div>
    </div>
  );
}

export default function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { navigate } = usePageTransition();
  const { scrollYProgress } = useScroll();

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const project = PROJECT_DB[slug] || PROJECT_DB["native-instruments"];
  // The gallery is shared with the Archive's contact sheet
  const gallery = (PROJECTS.find((p) => p.slug === slug) ?? PROJECTS[0])
    .gallery;
  useHud(project.name, [
    `Client: ${project.client}`,
    `Role: ${project.role}`,
    `${project.location} / ${project.timeline}`,
  ]);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorOpacity = useMotionValue(0);

  const cursorXSpring = useSpring(cursorX, {
    damping: 25,
    stiffness: 400,
    mass: 0.5,
  });
  const cursorYSpring = useSpring(cursorY, {
    damping: 25,
    stiffness: 400,
    mass: 0.5,
  });
  const cursorOpacitySpring = useSpring(cursorOpacity, {
    damping: 20,
    stiffness: 300,
  });

  const handleFooterMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const handleNavigation = (e: React.MouseEvent, targetSlug: string) => {
    e.preventDefault();
    navigate(`/work/${targetSlug}`);
  };

  return (
    <>
      <main className="relative bg-zinc-100 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip selection:bg-[#CCFF00] selection:text-zinc-900 transition-colors duration-500">
        <RevealFooter className="bg-zinc-100 dark:bg-zinc-950 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-colors duration-500">
          <section className="pt-40 md:pt-56 px-5 md:px-8 relative z-10">
            <div className="overflow-hidden py-10 -my-10">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                className="text-[15vw] md:text-[11vw] font-black font-neue leading-[0.85] tracking-tighter uppercase pr-[0.05em]"
              >
                {project.name}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              className="grid grid-cols-2 md:grid-cols-4 gap-y-6 border-t border-b border-zinc-300 dark:border-zinc-800 py-4 mt-12 md:mt-24 type-micro"
            >
              {[
                ["Client", project.client],
                ["Role", project.role],
                ["Timeline", project.timeline],
                ["Location", project.location],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>
          </section>

          {/* THE FIX: Replaced h-[70vh] and md:h-screen with dvh values, and disabled custom cursor on mobile */}
          <section className="w-full h-[70dvh] md:h-[100dvh] mt-12 md:mt-24 overflow-hidden relative cursor-auto md:cursor-none">
            <motion.div
              style={{ y: heroY, scale: heroScale }}
              className="w-full h-full absolute inset-0"
            >
              <Image
                src={project.heroImage}
                alt={project.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          </section>

          <section className="px-5 md:px-8 py-[16vh] relative z-10">
            <LinerNotes
              passages={[
                {
                  label: "The Challenge",
                  indent: "33%",
                  segments: [project.challenge],
                },
              ]}
            />
          </section>

          <section className="px-5 md:px-8 pb-32 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 relative z-10 cursor-auto md:cursor-none">
            <ParallaxGalleryImage
              src={gallery[0]}
              alt="Detail 1"
              className="md:col-span-7 aspect-[4/3]"
            />
            <ParallaxGalleryImage
              src={gallery[1]}
              alt="Detail 2"
              className="md:col-span-4 md:col-start-9 aspect-[3/4] mt-12 md:mt-40"
            />
            <ParallaxGalleryImage
              src={gallery[2]}
              alt="Detail 3"
              className="md:col-span-10 md:col-start-2 aspect-[16/9] mt-12 md:mt-32"
            />
          </section>

          {/* THE FIX: Replaced h-screen with h-[100dvh] */}
          <a
            href={`/work/${project.nextProject.slug}`}
            onClick={(e) => handleNavigation(e, project.nextProject.slug)}
            onMouseMove={handleFooterMouseMove}
            onMouseEnter={() => cursorOpacity.set(1)}
            onMouseLeave={() => cursorOpacity.set(0)}
            className="relative w-full h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center overflow-hidden z-20 cursor-auto md:cursor-none block"
          >
            <Label className="mb-8">Next Project</Label>
            {/* Long names wrap between words; each word clips its own
                letters so the hover copies stay hidden on every line */}
            <div className="group flex flex-wrap justify-center gap-x-[0.25em] text-[9vw] relative z-10 cursor-auto md:cursor-none">
              {project.nextProject.name
                .split(" ")
                .map((word: string, wordIndex: number, words: string[]) => {
                  const offset = words
                    .slice(0, wordIndex)
                    .reduce((sum, w) => sum + w.length, 0);
                  return (
                    <span
                      key={wordIndex}
                      className="flex overflow-hidden pt-4 pb-2 -mt-4 -mb-2"
                    >
                      {word.split("").map((char, charIndex) => (
                        <span key={charIndex} className="relative inline-block">
                          <span
                            className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                            style={{
                              transitionDelay: `${(offset + charIndex) * 0.02}s`,
                            }}
                          >
                            <span className="block font-black font-neue leading-none tracking-tighter uppercase pr-[0.1em]">
                              {char}
                            </span>
                            <span className="absolute left-0 top-full block font-black font-neue leading-none tracking-tighter uppercase pr-[0.1em]">
                              {char}
                            </span>
                          </span>
                        </span>
                      ))}
                    </span>
                  );
                })}
            </div>

            {/* THE FIX: Added `hidden md:flex` to prevent the ghost cursor bug on mobile touchscreens */}
            <motion.div
              style={{
                x: cursorXSpring,
                y: cursorYSpring,
                opacity: cursorOpacitySpring,
                translateX: "-50%",
                translateY: "-50%",
              }}
              className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#CCFF00] text-zinc-900 hidden md:flex items-center justify-center type-label pointer-events-none z-50 mix-blend-difference"
            >
              View
            </motion.div>
          </a>
        </RevealFooter>
      </main>
    </>
  );
}
