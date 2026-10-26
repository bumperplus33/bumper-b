"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { triggerPaperPushTransition } from "@/utils/animations";
import React from "react";

const heightAnim: Variants = {
  initial: { height: "0dvh" },
  enter: (i: number) => ({
    height: "100dvh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
  exit: (i: number) => ({
    height: "0dvh",
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.76, 0, 0.24, 1] },
  }),
};

const charAnim: Variants = {
  initial: { y: "100%" },
  enter: (i: number) => ({
    y: "0%",
    transition: {
      duration: 0.8,
      delay: 0.4 + i * 0.02,
      ease: [0.76, 0, 0.24, 1],
    },
  }),
  exit: (i: number) => ({
    y: "-120%",
    opacity: 0,
    transition: { duration: 0.3, delay: i * 0.01, ease: [0.76, 0, 0.24, 1] },
  }),
};

const opacityAnim: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const NAV_LINKS = [
  { title: "Home", href: "/" },
  { title: "Projects", href: "/work" },
  { title: "About", href: "/about" },
];

export default function StairsMenu({
  isOpen,
  closeMenu,
}: {
  isOpen: boolean;
  closeMenu: () => void;
}) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname === path) {
        closeMenu();
        return;
      }
      closeMenu();
      setTimeout(() => {
        router.push(path, {
          onTransitionReady: () => triggerPaperPushTransition(),
        });
      }, 600);
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
            <ul className="border-t border-zinc-900/20">
              {NAV_LINKS.map((link, linkIndex) => {
                const staggerOffset = linkIndex * 5;
                const isCurrent = pathname === link.href;

                return (
                  <li key={link.title} className="border-b border-zinc-900/20">
                    <a
                      href={link.href}
                      onClick={handleNavigation(link.href)}
                      aria-current={isCurrent ? "page" : undefined}
                      className="group grid grid-cols-12 items-baseline gap-4 py-3 outline-none"
                    >
                      <span className="col-span-2 md:col-span-1 type-micro opacity-60">
                        {String(linkIndex + 1).padStart(2, "0")}
                      </span>
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
                      <span className="col-span-3 md:col-span-2 type-micro text-right opacity-60">
                        {isCurrent ? "Current page" : ""}
                      </span>
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
              href="mailto:hello@soju.studio"
              className="hover:opacity-60 transition-opacity"
            >
              hello@soju.studio
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
