"use client";

import { useState } from "react";
import Image from "next/image";
import { usePageTransition } from "@/providers/PageTransitionProvider";

import RevealFooter from "@/components/ui/RevealFooter";
import StickyHeroReveal from "@/components/sections/StickyHeroReveal";
import { PROJECTS } from "@/data/projects";
import Label from "@/components/ui/Label";
import { useHud } from "@/hooks/useHud";

// The archive as a contact sheet under a spotlight: each project is a run of
// numbered frames (its cover, then its gallery), and pointing at (or tabbing
// to) any of them lights the project, dims the rest and reads its credits
// out in the HUD.
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
              {/* Every project is a run of numbered frames, and the runs flow
                  on from one another and wrap across rows like a contact
                  sheet. Each frame opens its project; only the first is a
                  tab stop, so the keyboard moves project by project. */}
              <ol
                className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10"
                onMouseLeave={() => setActiveIndex(null)}
              >
                {PROJECTS.map((project, index) => {
                  const isActive = activeIndex === index;
                  const isDimmed = activeIndex !== null && !isActive;
                  const frames = [project.src, ...project.gallery];

                  return (
                    <li key={project.slug} className="contents">
                      {frames.map((src, frame) => {
                        const isFirst = frame === 0;
                        return (
                          <a
                            key={frame}
                            href={`/work/${project.slug}`}
                            onClick={(e) => handleProjectClick(e, project.slug)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onFocus={() => setActiveIndex(index)}
                            onBlur={() => setActiveIndex(null)}
                            tabIndex={isFirst ? undefined : -1}
                            aria-hidden={isFirst ? undefined : true}
                            aria-label={
                              isFirst
                                ? `${project.name}, ${project.role}, ${project.location}`
                                : undefined
                            }
                            className={`block outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-current transition-opacity duration-300 motion-reduce:transition-none ${isDimmed ? "opacity-25" : "opacity-100"}`}
                          >
                            {/* Frame edge: the name on the first frame, a
                                number on every frame */}
                            <div
                              className={`flex justify-between items-baseline gap-2 border-t pt-1.5 mb-1.5 type-micro transition-colors duration-300 ${isActive ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-300 dark:border-zinc-800"}`}
                            >
                              {isFirst ? (
                                <h2 className="flex items-center min-w-0 text-zinc-900 dark:text-zinc-100">
                                  <span
                                    aria-hidden
                                    className={`block shrink-0 h-[7px] rounded-full bg-current transition-[width,margin] duration-300 ${isActive ? "w-[7px] mr-2" : "w-0 mr-0"}`}
                                  />
                                  <span className="truncate">
                                    {project.name}
                                  </span>
                                </h2>
                              ) : (
                                <span />
                              )}
                              <span
                                className={`tabular-nums transition-colors duration-300 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"}`}
                              >
                                {frame + 1}
                              </span>
                            </div>

                            <div className="relative w-full aspect-[3/2] overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                              <Image
                                src={src}
                                alt=""
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
                                className={`object-cover transition-[filter] duration-300 motion-reduce:transition-none ${isDimmed ? "grayscale brightness-75" : "grayscale-0 brightness-100"}`}
                              />
                            </div>
                          </a>
                        );
                      })}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </RevealFooter>
      </main>
    </>
  );
}
