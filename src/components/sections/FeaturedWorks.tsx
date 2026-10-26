"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { triggerPaperPushTransition } from "@/utils/animations"; // <-- Import

const FEATURED = [
  {
    client: "Puma POV",
    name: "Breathing Video",
    tag: "Creative Design",
    src: "/images/project-1.jpg",
    slug: "puma-pov",
  },
  {
    client: "Jaarvis",
    name: "Jaarvis Noir",
    tag: "Event",
    src: "/images/project-2.jpg",
    slug: "jaarvis",
  },
  {
    client: "Puma",
    name: "DPSC x Puma",
    tag: "Creative Concept",
    src: "/images/project-3.jpg",
    slug: "dpsc-puma",
  },
  {
    client: "Grid",
    name: "Grid 7 Years",
    tag: "Art Direction",
    src: "/images/project-4.jpg",
    slug: "grid-7-years",
  },
  {
    client: "Puma",
    name: "Music Battle",
    tag: "Direction",
    src: "/images/project-5.jpg",
    slug: "puma-music",
  },
  {
    client: "Native",
    name: "Digital Flow",
    tag: "Interface",
    src: "/images/project-6.jpg",
    slug: "native-instruments",
  },
];

const clipVariants = {
  hiddenBottom: { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
  visible: { clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)" },
  hiddenTop: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
};

const MaskText = ({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}) => {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <div className={`relative w-full overflow-hidden block ${className}`}>
      <motion.div
        variants={{ initial: { top: "0%" }, hover: { top: "-100%" } }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className={`absolute left-0 w-full h-full ${alignClass} text-zinc-400 dark:text-zinc-600`}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ initial: { top: "100%" }, hover: { top: "0%" } }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className={`absolute left-0 w-full h-full ${alignClass} text-zinc-900 dark:text-zinc-100`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function FeaturedWorks() {
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [prevProject, setPrevProject] = useState<number | null>(null);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const floatingImageRef = useRef<HTMLDivElement>(null);
  const router = useTransitionRouter();

  // 1. Core target values (Raw JS numbers, skipping React State)
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // 2. Heavy Springs doing the physics calculations
  const cursorX = useSpring(targetX, {
    damping: 20,
    stiffness: 100,
    mass: 0.5,
  });
  const cursorY = useSpring(targetY, {
    damping: 20,
    stiffness: 100,
    mass: 0.5,
  });

  // 3. The Direct DOM Mutation Subscription
  // This completely bypasses React's render phase!
  useEffect(() => {
    // Unsubscribe from X
    const unsubX = cursorX.on("change", (latestX) => {
      if (floatingImageRef.current) {
        // Using translate3d offloads this specific math to the GPU
        floatingImageRef.current.style.transform = `translate3d(${latestX}px, ${cursorY.get()}px, 0)`;
      }
    });

    // Unsubscribe from Y
    const unsubY = cursorY.on("change", (latestY) => {
      if (floatingImageRef.current) {
        floatingImageRef.current.style.transform = `translate3d(${cursorX.get()}px, ${latestY}px, 0)`;
      }
    });

    return () => {
      unsubX();
      unsubY();
    };
  }, [cursorX, cursorY]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const isLeftHalf = mouseX < rect.width / 2;
    // Set the motion values directly, triggering the springs
    targetX.set(isLeftHalf ? rect.width * 0.1 : rect.width * 0.9 - 225);
    targetY.set(e.clientY - rect.top - 137);
  };

  const handleMouseEnterRow = (index: number) => {
    if (activeProject !== index && window.innerWidth >= 768) {
      setPrevProject(activeProject);
      setActiveProject(index);
    }
  };

  const handleMouseLeaveMenu = () => {
    setIsHoveringMenu(false);
  };

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push(path, {
        onTransitionReady: () => triggerPaperPushTransition(),
      });
    };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHoveringMenu(true)}
      onMouseLeave={handleMouseLeaveMenu}
      className="relative w-full py-0 md:py-12 group/menu transition-colors duration-500"
    >
      <div className="flex flex-col w-full relative z-10 max-w-7xl mx-auto">
        {FEATURED.map((project, index) => (
          <a
            key={project.slug}
            href={`/work/${project.slug}`}
            onClick={handleNavigation(`/work/${project.slug}`)}
            className="w-full block cursor-pointer group/item transition-colors duration-500 relative z-10 hover:z-20"
          >
            {/* MOBILE LAYOUT */}
            <div className="flex md:hidden flex-col w-full gap-4 py-8 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <Image
                  src={project.src}
                  alt={project.name}
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="type-micro text-zinc-500 dark:text-zinc-400 mb-2">
                    {project.client}
                  </span>
                  <span className="type-heading text-zinc-900 dark:text-zinc-100">
                    {project.name}
                  </span>
                </div>
                <span className="type-micro text-zinc-500 dark:text-zinc-400 pb-1">
                  {project.tag}
                </span>
              </div>
            </div>

            {/* DESKTOP LAYOUT */}
            <motion.div
              initial="initial"
              whileHover="hover"
              onMouseEnter={() => handleMouseEnterRow(index)}
              className="hidden md:flex w-full h-[55px] justify-between items-start"
            >
              <MaskText
                align="left"
                className="flex-1 h-full mt-[12px] type-micro"
              >
                {project.client}
              </MaskText>
              <MaskText
                align="center"
                // Taller than the 55px row so descenders sit inside their own
                // mask: the rows still stack at 55px, but no copy is clipped
                // or peeks in from the next position
                className="flex-[4] h-[1.25em] font-neue text-[60px] tracking-[-0.02em] leading-[1.25]"
              >
                {project.name}
              </MaskText>
              <MaskText
                align="right"
                className="flex-1 h-full mt-[12px] type-micro"
              >
                {project.tag}
              </MaskText>
            </motion.div>
          </a>
        ))}
      </div>

      {/* =======================================================
        THE DIRECT DOM REF CONTAINER
        Removed motion.div, replaced with standard div and a ref.
        Because we use translate3d in the hook above, the GPU handles it.
        ======================================================= 
      */}
      <div
        ref={floatingImageRef}
        className="hidden md:block pointer-events-none absolute top-0 left-0 z-0 will-change-transform"
      >
        <div className="relative w-[225px] h-[275px]">
          <div className="absolute inset-0">
            {FEATURED.map((proj, i) => {
              const isActive = activeProject === i;
              const isPrev = prevProject === i;

              if (!isActive && !isPrev) return null;

              let variant = "hiddenBottom";
              if (!isHoveringMenu) {
                variant = "hiddenTop";
              } else if (isActive || isPrev) {
                variant = "visible";
              }

              return (
                <motion.div
                  key={`img1-${i}`}
                  className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800"
                  variants={clipVariants}
                  initial="hiddenBottom"
                  animate={variant}
                  transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  style={{
                    zIndex: isActive ? 20 : isPrev ? 10 : 1,
                    willChange: "clip-path",
                  }}
                >
                  {/* Decorative: the link text already names the project */}
                  <Image
                    src={proj.src}
                    alt=""
                    fill
                    sizes="225px"
                    className="object-cover"
                  />
                </motion.div>
              );
            })}
          </div>

          <div className="absolute inset-0 top-[20px] left-[20px]">
            {FEATURED.map((proj, i) => {
              const isActive = activeProject === i;
              const isPrev = prevProject === i;

              if (!isActive && !isPrev) return null;

              let variant = "hiddenBottom";
              if (!isHoveringMenu) {
                variant = "hiddenTop";
              } else if (isActive || isPrev) {
                variant = "visible";
              }

              return (
                <motion.div
                  key={`img2-${i}`}
                  className="absolute inset-0 bg-zinc-300 dark:bg-zinc-900"
                  variants={clipVariants}
                  initial="hiddenBottom"
                  animate={variant}
                  transition={{
                    duration: 0.6,
                    ease: [0.33, 1, 0.68, 1],
                    delay: 0.05,
                  }}
                  style={{
                    zIndex: isActive ? 20 : isPrev ? 10 : 1,
                    willChange: "clip-path",
                  }}
                >
                  {/* Decorative: the link text already names the project */}
                  <Image
                    src={proj.src}
                    alt=""
                    fill
                    sizes="225px"
                    className="object-cover"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
