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
import { useTransitionRouter } from "next-view-transitions";
import { triggerPaperPushTransition } from "@/utils/animations";

import RevealFooter from "@/components/ui/RevealFooter";
import { useHud } from "@/hooks/useHud";

// FULLY MAPPED SEQUENCE
const PROJECT_DB: Record<string, any> = {
  "native-instruments": {
    name: "Native Instruments",
    client: "NI GmbH",
    role: "Lead Agency",
    timeline: "Q3 2023",
    location: "Berlin, DE",
    heroImage: "/images/project-1.jpg",
    images: [
      "/images/project-2.jpg",
      "/images/project-3.jpg",
      "/images/project-4.jpg",
    ],
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
    images: [
      "/images/project-5.jpg",
      "/images/project-6.jpg",
      "/images/project-7.jpg",
    ],
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
    images: [
      "/images/project-8.jpg",
      "/images/project-1.jpg",
      "/images/project-2.jpg",
    ],
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
    images: [
      "/images/project-3.jpg",
      "/images/project-5.jpg",
      "/images/project-6.jpg",
    ],
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
    images: [
      "/images/project-7.jpg",
      "/images/project-8.jpg",
      "/images/project-1.jpg",
    ],
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
    images: [
      "/images/project-2.jpg",
      "/images/project-4.jpg",
      "/images/project-5.jpg",
    ],
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
    images: [
      "/images/project-6.jpg",
      "/images/project-8.jpg",
      "/images/project-3.jpg",
    ],
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
    images: [
      "/images/project-1.jpg",
      "/images/project-5.jpg",
      "/images/project-2.jpg",
    ],
    challenge:
      "An exclusive, ephemeral digital invitation exploring themes of darkness, luxury, and brutalist typography.",
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
  const router = useTransitionRouter();
  const { scrollYProgress } = useScroll();

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const project = PROJECT_DB[slug] || PROJECT_DB["native-instruments"];
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
    if (typeof triggerPaperPushTransition === "function")
      triggerPaperPushTransition();

    setTimeout(() => {
      router.push(`/work/${targetSlug}`, {
        onTransitionReady: () => triggerPaperPushTransition(),
      });
    }, 400);
  };

  return (
    <>
      <main className="relative bg-zinc-100 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip selection:bg-[#CCFF00] selection:text-zinc-900 transition-colors duration-500">
        <RevealFooter className="bg-zinc-100 dark:bg-zinc-950 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-colors duration-500">
          <section className="pt-40 md:pt-56 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
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
              className="grid grid-cols-2 md:grid-cols-4 gap-y-8 border-t border-b border-zinc-300 dark:border-zinc-800 py-6 mt-12 md:mt-24"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                  Client
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {project.client}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                  Role
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {project.role}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                  Timeline
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {project.timeline}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                  Location
                </span>
                <span className="text-xs font-bold uppercase tracking-widest">
                  {project.location}
                </span>
              </div>
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

          <section className="px-6 md:px-12 py-24 md:py-40 max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
            <div className="md:col-span-4 flex flex-col gap-8">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">
                The Challenge
              </h2>
              <div className="hidden md:block w-[1px] h-24 bg-zinc-300 dark:bg-zinc-800 mt-auto origin-top" />
            </div>
            <div className="md:col-span-8 md:col-start-6">
              <p className="text-3xl md:text-5xl font-medium leading-[1.1] tracking-tight">
                {project.challenge}
              </p>
            </div>
          </section>

          <section className="px-6 md:px-12 pb-32 max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 relative z-10 cursor-auto md:cursor-none">
            <ParallaxGalleryImage
              src={project.images[0]}
              alt="Detail 1"
              className="md:col-span-7 aspect-[4/3]"
            />
            <ParallaxGalleryImage
              src={project.images[1]}
              alt="Detail 2"
              className="md:col-span-4 md:col-start-9 aspect-[3/4] mt-12 md:mt-40"
            />
            <ParallaxGalleryImage
              src={project.images[2]}
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
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-500 mb-8 transition-colors hover:text-[#CCFF00]">
              Next Project
            </p>
            <div className="group flex overflow-hidden pt-4 pb-2 px-8 -mt-4 -mb-2 -mx-8 relative z-10 cursor-auto md:cursor-none">
              {project.nextProject.name
                .split("")
                .map((char: string, index: number) => (
                  <span
                    key={index}
                    className="relative inline-block"
                    style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                  >
                    <span
                      className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full"
                      style={{ transitionDelay: `${index * 0.02}s` }}
                    >
                      <span className="block text-[12vw] font-black font-neue leading-none tracking-tighter uppercase pr-[0.1em]">
                        {char}
                      </span>
                      <span className="absolute left-0 top-full block text-[12vw] font-black font-neue leading-none tracking-tighter uppercase pr-[0.1em]">
                        {char}
                      </span>
                    </span>
                  </span>
                ))}
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
              className="absolute top-0 left-0 w-32 h-32 rounded-full bg-[#CCFF00] text-zinc-900 hidden md:flex items-center justify-center text-xs font-bold tracking-widest uppercase pointer-events-none z-50 mix-blend-difference"
            >
              View
            </motion.div>
          </a>
        </RevealFooter>
      </main>
    </>
  );
}
