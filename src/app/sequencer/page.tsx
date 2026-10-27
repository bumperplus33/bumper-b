"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { invalidate } from "@react-three/fiber";
import { usePageTransition } from "@/providers/PageTransitionProvider";
import SequencerScene, {
  CARD_ASPECT,
  CARD_CENTER_Y,
  CARD_HEIGHT,
  CARD_MAX_WIDTH,
  SequencerControl,
  cardSize,
} from "@/components/webgl/SequencerScene";
import Label from "@/components/ui/Label";
import { PROJECTS } from "@/data/projects";
import { useHud } from "@/hooks/useHud";
import { useStore } from "@/store/useStore";

// The immersive route. The page doesn't scroll: the scroll lock stops Lenis
// and the body, the canvas lays out every project as a card in an endless
// loop, and this page turns wheel, drag, keys and the step buttons into a
// target card. HTML only frames it: the HUD, the active project's details,
// the steps and a click zone over the centre card.

const N = PROJECTS.length;
const SOURCES = PROJECTS.map((project) => project.src);
const wrap = (i: number) => ((i % N) + N) % N;

// Pixels of wheel travel per card, and how far a wheel gesture has to go
// before it moves to the next card
const WHEEL_PX_PER_CARD = 300;
const WHEEL_SNAP_THRESHOLD = 0.15;

export default function SequencerPage() {
  const { navigate } = usePageTransition();
  const reduceMotion = useReducedMotion() ?? false;
  const control = useRef<SequencerControl>({ target: 0, current: 0 });
  const [active, setActive] = useState(0);
  const [glReady, setGlReady] = useState(false);
  const activeRef = useRef(0);
  const drag = useRef({
    down: false,
    moved: false,
    startX: 0,
    startTarget: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const project = PROJECTS[active];
  useHud(project.name, [
    `${project.id} / ${String(N).padStart(2, "0")}`,
    project.role,
    project.location,
  ]);

  // Lock scrolling while this route is mounted
  useEffect(() => {
    const { setScrollLocked } = useStore.getState();
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, []);

  const handleActive = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);
  const handleReady = useCallback(() => setGlReady(true), []);

  const go = useCallback((delta: number) => {
    const c = control.current;
    c.target = Math.round(c.target) + delta;
    invalidate();
  }, []);

  // Jump to a project by the shortest way round the loop
  const goTo = useCallback((index: number) => {
    const c = control.current;
    const base = Math.round(c.target);
    let d = index - wrap(base);
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    c.target = base + d;
    invalidate();
  }, []);

  const open = useCallback(
    (index: number) => navigate(`/work/${PROJECTS[index].slug}`),
    [navigate],
  );

  // Wheel and trackpad: move freely, then settle on a card when it stops
  useEffect(() => {
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    let gestureStart: number | null = null;

    const onWheel = (e: WheelEvent) => {
      const c = control.current;
      gestureStart ??= Math.round(c.target);
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const px = e.deltaMode === 1 ? delta * 16 : delta;
      c.target += px / WHEEL_PX_PER_CARD;
      invalidate();

      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const start = gestureStart ?? Math.round(c.target);
        const moved = c.target - start;
        let snapped = Math.round(c.target);
        // A short flick still moves one card
        if (snapped === start && Math.abs(moved) >= WHEEL_SNAP_THRESHOLD) {
          snapped = start + Math.sign(moved);
        }
        c.target = snapped;
        gestureStart = null;
        invalidate();
      }, 140);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      clearTimeout(snapTimer);
    };
  }, []);

  // Drag (mouse, pen or touch), with a flick on release
  useEffect(() => {
    const cardPx = () =>
      cardSize(window.innerWidth, window.innerHeight).width * 0.95;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = e.target as HTMLElement;
      if (el.closest("nav, [data-no-drag]")) return;
      const d = drag.current;
      d.down = true;
      d.moved = false;
      d.startX = d.lastX = e.clientX;
      d.lastT = performance.now();
      d.velocity = 0;
      d.startTarget = control.current.target;
    };
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.down) return;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > 6) d.moved = true;
      const now = performance.now();
      const px = cardPx();
      control.current.target = d.startTarget - dx / px;
      d.velocity =
        ((-(e.clientX - d.lastX) / px) * 1000) / Math.max(now - d.lastT, 1);
      d.lastX = e.clientX;
      d.lastT = now;
      invalidate();
    };
    const onUp = () => {
      const d = drag.current;
      if (!d.down) return;
      d.down = false;
      if (!d.moved) return;
      const flick = Math.max(-2, Math.min(2, d.velocity * 0.12));
      control.current.target = Math.round(control.current.target + flick);
      invalidate();
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // Keys: arrows move, Enter opens the centre card
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Enter" && !el.closest("a, button")) {
        open(activeRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, open]);

  return (
    <main
      // A native image drag would cancel the pointer stream mid-drag
      onDragStart={(e) => e.preventDefault()}
      className="relative h-[100dvh] overflow-hidden bg-zinc-950 text-zinc-100 select-none touch-none"
    >
      <h1 className="sr-only">Sequencer</h1>
      <p className="sr-only" aria-live="polite">
        {project.id} of {N}: {project.name}, {project.role}
      </p>

      <SequencerScene
        sources={SOURCES}
        controlRef={control}
        reduceMotion={reduceMotion}
        onActive={handleActive}
        onReady={handleReady}
      />

      {/* The HTML frame sits above the canvas (z-40) */}
      <div className="fixed inset-0 z-[45] pointer-events-none">
        {/* Click zone over the centre card, sized like the WebGL card. The
            DOM image shows until the textures are ready, and stays as the
            fallback without WebGL. */}
        <button
          type="button"
          onClick={() => {
            if (!drag.current.moved) open(activeRef.current);
          }}
          aria-label={`Open ${project.name}`}
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          style={{
            top: `${CARD_CENTER_Y * 100}%`,
            height: `min(${CARD_HEIGHT * 100}dvh, ${(CARD_MAX_WIDTH / CARD_ASPECT) * 100}vw)`,
            aspectRatio: `${CARD_ASPECT}`,
          }}
        >
          <Image
            src={project.src}
            alt=""
            fill
            sizes="40vw"
            draggable={false}
            className={`object-cover transition-opacity duration-300 ${glReady ? "opacity-0" : "opacity-100"}`}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-5 md:px-8 pb-6 md:pb-8 grid grid-cols-12 items-end gap-4">
          {/* Active project */}
          <div className="col-span-12 md:col-span-5 type-micro">
            <Label className="mb-3">Sequencer</Label>
            <p className="text-zinc-500">
              {project.id} / {String(N).padStart(2, "0")}
            </p>
            <p className="type-heading text-zinc-100 my-1">{project.name}</p>
            <p className="text-zinc-400">
              {project.role} — {project.location}
            </p>
          </div>

          {/* Steps: one per project, like a step sequencer */}
          <div
            data-no-drag
            className="col-span-12 md:col-span-4 flex md:justify-center gap-1.5 pointer-events-auto"
          >
            {PROJECTS.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.name}`}
                aria-current={i === active ? "true" : undefined}
                className="group p-1 cursor-pointer outline-none"
              >
                <span
                  className={`block w-2.5 h-2.5 md:w-3 md:h-3 transition-colors duration-300 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent ${i === active ? "bg-accent" : "bg-zinc-700 group-hover:bg-zinc-400"}`}
                />
              </button>
            ))}
          </div>

          {/* Open and hint */}
          <div className="col-span-12 md:col-span-3 md:text-right type-micro flex md:flex-col justify-between md:items-end gap-1">
            <button
              type="button"
              data-no-drag
              onClick={() => open(activeRef.current)}
              className="pointer-events-auto text-zinc-100 hover:text-accent transition-colors cursor-pointer"
            >
              Open project ↗
            </button>
            <p className="text-zinc-500 hidden md:block">
              Scroll, drag or ← → · Enter to open
            </p>
            <p className="text-zinc-500 md:hidden">Swipe or tap the steps</p>
          </div>
        </div>
      </div>
    </main>
  );
}
