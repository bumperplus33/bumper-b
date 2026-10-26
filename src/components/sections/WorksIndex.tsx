"use client";

import { useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { triggerPaperPushTransition } from "@/utils/animations";
import FocusImage from "@/components/webgl/FocusImage";
import { PROJECTS } from "@/data/projects";
import Label from "@/components/ui/Label";

const SOURCES = PROJECTS.map((project) => project.src);

// A typographic index of the work. Hovering a row brings its picture into
// the image beside the list; the rest of the rows step back.
export default function WorksIndex() {
  const router = useTransitionRouter();
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const open = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    router.push(`/work/${slug}`, {
      onTransitionReady: () => triggerPaperPushTransition(),
    });
  };

  return (
    <section className="px-5 md:px-8 py-[12vw]">
      <div className="flex justify-between items-center type-micro text-zinc-400 border-b border-zinc-800 pb-3 mb-2">
        <Label>Index</Label>
        <p>{String(PROJECTS.length).padStart(2, "0")} projects</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <ul className="md:col-span-8" onMouseLeave={() => setIsHovering(false)}>
          {PROJECTS.map((project, i) => {
            const isDimmed = isHovering && i !== active;
            return (
              <li key={project.slug} className="border-b border-zinc-800">
                <a
                  href={`/work/${project.slug}`}
                  onClick={(e) => open(e, project.slug)}
                  onMouseEnter={() => {
                    setActive(i);
                    setIsHovering(true);
                  }}
                  onFocus={() => setActive(i)}
                  className={`grid grid-cols-12 items-baseline gap-4 py-3 transition-opacity duration-500 ${isDimmed ? "opacity-25" : "opacity-100"}`}
                >
                  <span className="col-span-2 md:col-span-1 type-micro text-zinc-500">
                    {project.id}
                  </span>
                  <span className="col-span-10 md:col-span-6 type-heading">
                    {project.name}
                  </span>
                  <span className="hidden md:block col-span-3 type-micro text-zinc-400">
                    {project.role}
                  </span>
                  <span className="hidden md:block col-span-2 type-micro text-zinc-400 text-right">
                    {project.location}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-[30vh] flex flex-col items-end gap-3">
            <FocusImage
              sources={SOURCES}
              index={active}
              alt={PROJECTS[active].name}
              className="w-[16vw] aspect-[3/4] bg-zinc-900"
            />
            <p className="type-micro text-zinc-400 w-[16vw]">
              {PROJECTS[active].id} — {PROJECTS[active].name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
