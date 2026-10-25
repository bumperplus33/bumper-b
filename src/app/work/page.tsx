"use client";

import { useState } from "react";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { triggerPaperPushTransition } from "@/utils/animations";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import SingletonGlitch from "@/components/webgl/SingletonGlitch";
import FeaturedWorks from "@/components/sections/FeaturedWorks";
import { PROJECTS } from "@/data/projects";
import { useHud } from "@/hooks/useHud";

export default function WorkGallery() {
  useHud("Archive", [
    "Selected works",
    `${PROJECTS.length} projects`,
    "2021—2023",
  ]);
  const router = useTransitionRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleProjectClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    router.push(`/work/${slug}`, {
      onTransitionReady: () => triggerPaperPushTransition(),
    });
  };

  const isCinematicMode = hoveredIndex !== null;

  return (
    <>
      <main className="relative min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip">
        <RevealFooter>
          {/* THE FIX: Reverted back to "ARCHIVE" */}
          <StickyHeroReveal
            title="ARCHIVE"
            showTrademark={false}
            subtitle="Selected Works"
          />

          <div
            className={`relative z-10 pt-24 pb-32 transition-colors duration-1000 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]
              ${isCinematicMode ? "bg-zinc-100/40 dark:bg-zinc-950/40 backdrop-blur-sm" : "bg-zinc-100 dark:bg-zinc-950"}
            `}
          >
            <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-32 relative z-20">
              <p className="mb-12 text-sm font-bold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">
                Featured Works
              </p>
              <FeaturedWorks />
            </div>

            <div className="px-6 md:px-12 max-w-[1800px] mx-auto">
              <p className="mb-12 text-sm font-bold tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">
                Project Archive
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-16 md:gap-x-8 md:gap-y-24">
                {PROJECTS.map((project, index) => {
                  const isHovered = hoveredIndex === index;
                  const isOtherHovered = isCinematicMode && !isHovered;

                  return (
                    <div
                      key={project.slug}
                      className="flex flex-col group"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <a
                        href={`/work/${project.slug}`}
                        onClick={(e) => handleProjectClick(e, project.slug)}
                        className={`w-full cursor-none transition-all duration-700 ${isOtherHovered ? "opacity-40 blur-[2px]" : "opacity-100 blur-0"}`}
                      >
                        <div
                          className={`relative w-full aspect-[3/4] overflow-hidden bg-zinc-200 dark:bg-zinc-900 mb-4 transition-transform duration-700 ${isHovered ? "scale-[0.98]" : "scale-100"}`}
                        >
                          <Image
                            src={project.src}
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-all duration-700"
                          />

                          <SingletonGlitch
                            textureUrl={project.src}
                            active={isHovered}
                          />
                        </div>

                        <div className="flex justify-between items-start border-t border-zinc-200 dark:border-zinc-800 pt-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400">
                              Index — {project.id}
                            </span>
                            <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                              {project.name}
                            </h2>
                          </div>
                          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-zinc-400 text-right mt-[18px]">
                            {project.role}
                          </span>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </RevealFooter>
      </main>
    </>
  );
}
