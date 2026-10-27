"use client";

import { useState } from "react";
import Image from "next/image";
import { usePageTransition } from "@/providers/PageTransitionProvider";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import SingletonGlitch from "@/components/webgl/SingletonGlitch";
import { PROJECTS } from "@/data/projects";
import Label from "@/components/ui/Label";
import { useHud } from "@/hooks/useHud";

export default function WorkGallery() {
  useHud("Archive", [
    "Selected works",
    `${PROJECTS.length} projects`,
    "2021—2023",
  ]);
  const { navigate } = usePageTransition();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleProjectClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    navigate(`/work/${slug}`);
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
            <div className="px-5 md:px-8">
              <Label className="mb-12">Project Archive</Label>
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

                        <div className="flex justify-between items-baseline gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-3 type-micro">
                          <h2 className="flex gap-4 text-zinc-900 dark:text-zinc-100">
                            <span className="text-zinc-500">{project.id}</span>
                            {project.name}
                          </h2>
                          <span className="text-zinc-400 text-right">
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
