"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { usePageTransition } from "@/providers/PageTransitionProvider";
import React, { useEffect } from "react";

// Timeline. Open: the panels rise, then the rules draw in and the type
// arrives. Close: the rules and type leave first, and the panels drop a beat
// later, so nothing is left hanging over the page as the lime retracts.
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
const PANELS_EXIT_DELAY = 0.2;

const heightAnim: Variants = {
  initial: { height: "0dvh" },
  enter: (i: number) => ({
    height: "100dvh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: EASE_IN_OUT },
  }),
  exit: (i: number) => ({
    height: "0dvh",
    transition: {
      duration: 0.45,
      delay: PANELS_EXIT_DELAY + 0.04 * i,
      ease: EASE_IN_OUT,
    },
  }),
};

// The index rules draw in from the left and retract to the right
const lineAnim: Variants = {
  initial: { scaleX: 0, originX: 0 },
  enter: (i: number) => ({
    scaleX: 1,
    originX: 0,
    transition: {
      scaleX: {
        duration: 0.6,
        delay: 0.45 + i * 0.06,
        ease: [0.16, 1, 0.3, 1],
      },
      originX: { duration: 0 },
    },
  }),
  exit: (i: number) => ({
    scaleX: 0,
    originX: 1,
    transition: {
      scaleX: { duration: 0.25, delay: i * 0.03, ease: [0.7, 0, 0.84, 0] },
      originX: { duration: 0 },
    },
  }),
};

const charAnim: Variants = {
  initial: { y: "100%" },
  enter: (i: number) => ({
    y: "0%",
    transition: {
      duration: 0.8,
      delay: 0.4 + i * 0.02,
      ease: EASE_IN_OUT,
    },
  }),
  exit: (i: number) => ({
    y: "-120%",
    opacity: 0,
    transition: { duration: 0.3, delay: i * 0.01, ease: EASE_IN_OUT },
  }),
};

const opacityAnim: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function Rule({ index, className }: { index: number; className: string }) {
  return (
    <motion.span
      aria-hidden
      custom={index}
      variants={lineAnim}
      initial="initial"
      animate="enter"
      exit="exit"
      className={`absolute left-0 w-full h-px bg-zinc-900/20 ${className}`}
    />
  );
}

const NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "Projects", href: "/work" },
  { title: "Sequencer", href: "/sequencer" },
  { title: "About", href: "/about" },
];

export default function StairsMenu({
  isOpen,
  closeMenu,
}: {
  isOpen: boolean;
  closeMenu: () => void;
}) {
  const { navigate } = usePageTransition();
  const pathname = usePathname();

  // Escape closes the menu while it's open
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeMenu]);

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === path) {
        closeMenu();
        return;
      }
      // The transition's curtain rises over the closing menu
      closeMenu();
      navigate(path);
    };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] h-[100dvh] pointer-events-none flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 flex z-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                custom={5 - i}
                variants={heightAnim}
                initial="initial"
                animate="enter"
                exit="exit"
                // THE FIX: Added `origin-center scale-x-105` to force a tiny overlap and destroy sub-pixel gaps!
                className="w-1/5 bg-[#CCFF00] origin-center scale-x-105"
              />
            ))}
          </div>

          {/* Top bar: sits where the HUD's own links sit */}
          <motion.div
            variants={opacityAnim}
            initial="initial"
            animate="enter"
            exit="exit"
            className="relative z-10 flex justify-between items-start px-5 md:px-8 pt-5 type-micro text-zinc-900 pointer-events-auto"
          >
            <p className="type-label flex items-center gap-2">
              <span className="block w-[7px] h-[7px] rounded-full bg-zinc-900" />
              Menu
            </p>
            <button
              type="button"
              onClick={closeMenu}
              className="group flex items-center gap-2 cursor-pointer hover:opacity-60 transition-opacity"
            >
              Close
              <svg
                viewBox="0 0 68 68"
                fill="none"
                aria-hidden
                className="w-[9px] h-[9px] transition-transform duration-500 group-hover:rotate-90"
              >
                <path
                  d="M1.5 1.5L67 67"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <path
                  d="M66.5 1L0.999997 66.5"
                  stroke="currentColor"
                  strokeWidth="8"
                />
              </svg>
            </button>
          </motion.div>

          {/* The links as a numbered index */}
          <nav
            aria-label="Site menu"
            className="relative z-10 flex-1 flex flex-col justify-center px-5 md:px-8 pointer-events-auto text-zinc-900"
          >
            <ul className="relative">
              <Rule index={0} className="top-0" />
              {NAV_LINKS.map((link, linkIndex) => {
                const staggerOffset = linkIndex * 5;
                const isCurrent = pathname === link.href;

                return (
                  <li key={link.title} className="relative">
                    <Rule index={linkIndex + 1} className="bottom-0" />
                    <a
                      href={link.href}
                      onClick={handleNavigation(link.href)}
                      aria-current={isCurrent ? "page" : undefined}
                      className="group grid grid-cols-12 items-baseline gap-4 py-3 outline-none"
                    >
                      <motion.span
                        variants={opacityAnim}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="col-span-2 md:col-span-1 type-micro text-zinc-900/60"
                      >
                        {String(linkIndex + 1).padStart(2, "0")}
                      </motion.span>
                      <span
                        className="col-span-7 md:col-span-9 flex overflow-hidden type-display"
                        // Room for descenders, so a rolled-away letter's tail
                        // doesn't peek in above the copy replacing it
                        style={{ lineHeight: 1.2 }}
                      >
                        {link.title.split("").map((char, charIndex) => (
                          <motion.span
                            key={charIndex}
                            custom={charIndex + staggerOffset}
                            variants={charAnim}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="relative inline-block"
                          >
                            <span
                              className="block transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
                              style={{
                                transitionDelay: `${charIndex * 0.02}s`,
                              }}
                            >
                              <span className="block">{char}</span>
                              <span className="absolute left-0 top-full block italic opacity-60">
                                {char}
                              </span>
                            </span>
                          </motion.span>
                        ))}
                      </span>
                      <motion.span
                        variants={opacityAnim}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="col-span-3 md:col-span-2 type-micro text-right text-zinc-900/60"
                      >
                        {isCurrent ? "Current page" : ""}
                      </motion.span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom row: the footer's small type */}
          <motion.div
            variants={opacityAnim}
            initial="initial"
            animate="enter"
            exit="exit"
            className="relative z-10 w-full flex justify-between items-end px-5 md:px-8 pb-5 type-micro text-zinc-900 pointer-events-auto"
          >
            <a
              href="mailto:hello@bumper.studio"
              className="hover:opacity-60 transition-opacity"
            >
              hello@bumper.studio
            </a>
            <div className="flex gap-6">
              {["Instagram", "Twitter", "LinkedIn"].map((name) => (
                <a
                  key={name}
                  href="#"
                  className="hover:opacity-60 transition-opacity"
                >
                  {name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
