"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useStore } from "@/store/useStore";

// A backstop: if the preloader hasn't signalled by now (it caps itself at
// 3s), reveal anyway rather than leave the title hidden
const FALLBACK_REVEAL_MS = 6000;

interface ClunkyRevealProps {
  text: string;
  delay?: number;
}

export default function ClunkyReveal({ text, delay = 0 }: ClunkyRevealProps) {
  const isLoading = useStore((state) => state.isLoading);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), FALLBACK_REVEAL_MS);
    return () => clearTimeout(timer);
  }, []);

  const shouldReveal = !isLoading || timedOut;
  const words = text.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay + 0.8,
      },
    },
  };

  const characterVariants: Variants = {
    hidden: {
      // THE FIX: Increased from 150% to 250% to ensure massive 22vw letters fully clear the bottom mask on tall phones!
      y: "250%",
      rotate: 15,
    },
    visible: {
      y: "0%",
      rotate: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 150,
      },
    },
  };

  // The perfect sweet spot
  const kerningEm = 0.02;

  const maskBleedEm = 0.3;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={shouldReveal ? "visible" : "hidden"}
      className="flex whitespace-nowrap tracking-tighter uppercase font-neue font-bold"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="flex mr-[0.25em] last:mr-0">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="inline-block overflow-hidden pt-32 pb-12 -mt-32 -mb-12"
              style={{
                paddingLeft: `${maskBleedEm}em`,
                paddingRight: `${maskBleedEm}em`,
                marginLeft: `-${maskBleedEm}em`,
                marginRight: `${-maskBleedEm + kerningEm}em`,
              }}
            >
              <motion.span
                variants={characterVariants}
                className="inline-block origin-bottom-left"
              >
                {char}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
