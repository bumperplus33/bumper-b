"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { usePathname } from "next/navigation";
import StairsMenu from "@/components/ui/StairsMenu";
import { useStore } from "@/store/useStore";

// Using next-view-transitions to ensure a seamless, app-like crossfade
import { Link } from "next-view-transitions";

const LINKS = [
  { title: "Work", href: "/work" },
  { title: "Sequencer", href: "/sequencer" },
  { title: "About", href: "/about" },
];

// The HUD: a quiet row of small type. Links on the left, the current page's
// metadata on the right (set with useHud), like the credits on a record sleeve.
export default function NavBar() {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();
  const [nearBottom, setNearBottom] = useState(false);
  // A scroll-locked page can't scroll, so its scroll progress means nothing
  const isScrollLocked = useStore((state) => state.isScrollLocked);
  const isHidden = nearBottom && !isScrollLocked;
  const [menuOpen, setMenuOpen] = useState(false);
  const hud = useStore((state) => state.hud);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Get out of the way of the footer at the very bottom of the page
    setNearBottom(latest > 0.95);
  });

  return (
    <>
      {/* Fades the page out under the HUD so the small type stays readable */}
      <motion.div
        aria-hidden
        animate={{ opacity: isHidden ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-full h-32 z-[45] pointer-events-none bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-transparent"
      />

      <motion.nav
        variants={{
          visible: { y: "0px", opacity: 1 },
          hidden: { y: "-40px", opacity: 0 },
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-start gap-8 px-5 md:px-8 pt-5 type-micro text-zinc-100 mix-blend-difference pointer-events-none"
      >
        {/* LEFT: logo and links */}
        <div className="flex items-start gap-8 md:gap-16 pointer-events-auto">
          <Link
            href="/"
            className="font-neue text-sm leading-none uppercase tracking-tight"
          >
            SOJU®
          </Link>

          <ul className="hidden md:flex gap-16">
            {LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`transition-opacity duration-300 hover:opacity-100 ${isActive ? "opacity-100" : "opacity-60"}`}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button" // Prevents phantom page reloads on click
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            className="flex items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            <span className="block w-[7px] h-[7px] rounded-full bg-current" />
            Menu
          </button>
        </div>

        {/* RIGHT: the page's metadata */}
        <div className="text-right max-w-[45vw]">
          <p className="font-neue uppercase text-sm leading-none mb-1 tracking-tight">
            “{hud.title}”
          </p>
          {hud.lines.map((line) => (
            <p key={line} className="opacity-60">
              {line}
            </p>
          ))}
        </div>
      </motion.nav>

      {/* The Fullscreen Navigation Menu */}
      <StairsMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
    </>
  );
}
