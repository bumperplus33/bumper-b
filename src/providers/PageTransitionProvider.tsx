"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { routeKind, routeLabel } from "@/utils/routeLabel";

// Page transitions as a typographic curtain.
//
// 1. Cover: a light curtain slides up over the page and the destination's
//    name rises into it, letter by letter.
// 2. Wait: only once the screen is covered does the router navigate. The
//    curtain waits for the new route however long it takes (after a moment
//    it says so), so a slow route can never time the transition out, which
//    the browser's View Transitions API does after about four seconds.
// 3. Reveal: once the new route has rendered and painted, the letters lift
//    out and the curtain slides away.
//
// With reduced motion, links navigate directly with no curtain.

type Phase = "idle" | "cover" | "wait" | "reveal";

interface TransitionState {
  phase: Phase;
  href: string;
  path: string;
  label: string;
  kind: string;
  slow: boolean;
}

const IDLE: TransitionState = {
  phase: "idle",
  href: "",
  path: "",
  label: "",
  kind: "",
  slow: false,
};

const EASE = [0.76, 0, 0.24, 1] as const;
const COVER_S = 0.55;
const REVEAL_S = 0.65;
// Keep the title up for a beat even when the route is instant
const MIN_HOLD_MS = 250;
// Say "Loading" if the route takes longer than this
const SLOW_MS = 1200;
// Never trap the visitor behind the curtain: reveal whatever is there
const MAX_WAIT_MS = 12000;

const PageTransitionContext = createContext<{
  navigate: (href: string) => void;
}>({ navigate: () => {} });

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

export default function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<TransitionState>(IDLE);
  const stateRef = useRef(state);
  const pushedAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const reveal = useCallback(() => {
    clearTimers();
    setState((s) => (s.phase === "wait" ? { ...s, phase: "reveal" } : s));
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const target = new URL(href, window.location.href);
      if (target.origin !== window.location.origin) {
        window.location.href = target.href;
        return;
      }
      // Busy, already here, or a same-page query/hash change: no curtain
      if (stateRef.current.phase !== "idle") return;
      if (target.pathname === window.location.pathname) {
        router.push(href);
        return;
      }
      if (reduceMotion) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      setState({
        phase: "cover",
        href,
        path: target.pathname,
        label: routeLabel(target.pathname),
        kind: routeKind(target.pathname),
        slow: false,
      });
    },
    [router, reduceMotion],
  );

  // The screen is covered: navigate, and start the clocks
  const startWait = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "cover") return;
    setState({ ...s, phase: "wait" });
    pushedAt.current = performance.now();
    router.push(s.href);
    timers.current.push(
      setTimeout(
        () => setState((x) => (x.phase === "wait" ? { ...x, slow: true } : x)),
        SLOW_MS,
      ),
      setTimeout(reveal, MAX_WAIT_MS),
    );
  }, [router, reveal]);

  // The new route has rendered: let it paint, hold for a beat, then reveal
  useEffect(() => {
    const s = stateRef.current;
    if (s.phase !== "wait" || pathname !== s.path) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const held = performance.now() - pushedAt.current;
        timers.current.push(
          setTimeout(reveal, Math.max(0, MIN_HOLD_MS - held)),
        );
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, state.phase, reveal]);

  useEffect(() => clearTimers, []);

  const handleAnimationComplete = () => {
    const phase = stateRef.current.phase;
    if (phase === "cover") startWait();
    else if (phase === "reveal") setState(IDLE);
  };

  const words = state.label.split(" ");
  let letterIndex = 0;

  return (
    <PageTransitionContext.Provider value={{ navigate }}>
      {children}

      {state.phase !== "idle" && (
        <motion.div
          aria-hidden
          initial={{ y: "100%" }}
          animate={{ y: state.phase === "reveal" ? "-100%" : "0%" }}
          transition={{
            duration: state.phase === "reveal" ? REVEAL_S : COVER_S,
            ease: EASE,
            delay: state.phase === "reveal" ? 0.12 : 0,
          }}
          onAnimationComplete={handleAnimationComplete}
          className="fixed inset-0 z-[110] flex flex-col justify-between px-5 md:px-8 py-5 bg-[#ecebe7] text-zinc-950 cursor-wait"
        >
          <div className="flex justify-between items-start">
            <p className="type-label flex items-center gap-2">
              <span className="block w-[7px] h-[7px] rounded-full bg-zinc-950" />
              {state.kind}
            </p>
            <p className="type-micro">Bumper® Studio</p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-[0.22em] font-neue uppercase text-center text-[min(15vw,16vh)] md:text-[min(10vw,18vh)] leading-[0.86] tracking-[-0.03em]">
            {words.map((word, w) => (
              <span
                key={w}
                className="flex overflow-hidden pt-[0.06em] pb-[0.04em]"
              >
                {word.split("").map((char) => {
                  const i = letterIndex++;
                  return (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={{ y: "110%" }}
                      animate={{ y: state.phase === "reveal" ? "-110%" : "0%" }}
                      transition={{
                        duration: state.phase === "reveal" ? 0.45 : 0.6,
                        ease: EASE,
                        delay:
                          state.phase === "reveal"
                            ? i * 0.012
                            : 0.18 + i * 0.025,
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-end type-micro">
            <p>Next</p>
            <p
              className={`transition-opacity duration-300 ${state.slow && state.phase === "wait" ? "opacity-100" : "opacity-0"}`}
            >
              Loading…
            </p>
          </div>
        </motion.div>
      )}
    </PageTransitionContext.Provider>
  );
}
