"use client";

import Link from "next/link";


export default function Footer() {
  return (
    <footer className="h-screen w-full flex flex-col justify-between overflow-hidden bg-zinc-200 dark:bg-zinc-900 transition-colors duration-500 relative">
      {/* =========================================
          TOP: Brutalist Flush Info
          ========================================= */}
      {/* THE FIX: Replaced absolute positioning with standard flex flow and minimal pt-8 to lock it flush to the ceiling */}
      <div className="w-full px-6 md:px-12 pt-8 flex justify-between items-start font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400 relative z-10">
        <p>This is SOJU studio.</p>
        <Link
          href="mailto:hello@soju.studio"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          hello@soju.studio
        </Link>
      </div>

      {/* =========================================
          CENTER: The Massive SOJU Graphic
          ========================================= */}
      <div className="flex-grow flex items-center justify-center w-full">
        <div
          className="text-[25vw] leading-[0.75] tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-neue"
        >
          SOJU
        </div>
      </div>

      {/* =========================================
          BOTTOM: Copyright & Socials
          ========================================= */}
      <div className="w-full px-6 md:px-12 pb-8 flex justify-between items-end font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400 transition-colors duration-500 relative z-10">
        <p>© {new Date().getFullYear()}</p>
        <div className="flex gap-6">
          <Link
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Instagram
          </Link>
          <Link
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Twitter
          </Link>
          <Link
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
