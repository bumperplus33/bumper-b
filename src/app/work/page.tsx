"use client";

import { useState } from "react";
import Image from "next/image";
import { usePageTransition } from "@/providers/PageTransitionProvider";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import { PROJECTS } from "@/data/projects";
import Label from "@/components/ui/Label";
import { useHud } from "@/hooks/useHud";

// The archive as a contact sheet under a spotlight: pointing at (or tabbing
// to) a project lights it and dims the rest to grey, and the HUD reads out
// its credits.
export default function WorkGallery() {
  const { navigate } = usePageTransition();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : PROJECTS[activeIndex];

  useHud(
    "Archive",
    active
      ? [`${active.id} — ${active.name}`, active.role, active.location]
      : ["Selected works", `${PROJECTS.length} projects`, "2021—2023"],
  );

  const handleProjectClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    navigate(`/work/${slug}`);
  };

  return (
    <>
      <main className="relative min-h-screen text-zinc-900 dark:text-zinc-100 overflow-clip">
        <RevealFooter>
          <StickyHeroReveal
            title="ARCHIVE"
            showTrademark={false}
            subtitle="Selected Works"
          />

          <div className="relative z-10 pt-24 pb-32 bg-zinc-100 dark:bg-zinc-950 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
            <div className="px-5 md:px-8">
              <Label className="mb-12">Project Archive</Label>
              <ul
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-20"
                onMouseLeave={() => setActiveIndex(null)}
              >
                {PROJECTS.map((project, index) => {
                  const isActive = activeIndex === index;
                  const isDimmed = activeIndex !== null && !isActive;

                  return (
                    <li key={project.slug}>
                      <a
                        href={`/work/${project.slug}`}
                        onClick={(e) => handleProjectClick(e, project.slug)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => setActiveIndex(null)}
                        className={`block outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current transition-opacity duration-300 motion-reduce:transition-none ${isDimmed ? "opacity-25" : "opacity-100"}`}
                      >
                        {/* Frame header, like the edge of a contact sheet */}
                        <div
                          className={`flex justify-between items-baseline gap-4 border-t pt-2 mb-2 type-micro transition-colors duration-300 ${isActive ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-300 dark:border-zinc-800"}`}
                        >
                          <h2 className="flex items-center text-zinc-900 dark:text-zinc-100">
                            <span
                              aria-hidden
                              className={`block h-[7px] rounded-full bg-current transition-[width,margin] duration-300 ${isActive ? "w-[7px] mr-2" : "w-0 mr-0"}`}
                            />
                            {project.name}
                          </h2>
                          <span className="text-zinc-500 tabular-nums">
                            {project.id}
                          </span>
                        </div>

                        <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                          <Image
                            src={project.src}
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className={`object-cover transition-[filter] duration-300 motion-reduce:transition-none ${isDimmed ? "grayscale brightness-75" : "grayscale-0 brightness-100"}`}
                          />
                        </div>

                        <p className="mt-2 type-micro text-zinc-500 flex justify-between gap-4">
                          <span>{project.role}</span>
                          <span className="text-right">{project.location}</span>
                        </p>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </RevealFooter>
      </main>
    </>
  );
}
