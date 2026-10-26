"use client";

import { useRef, useState } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { Link } from "next-view-transitions";
import Label from "@/components/ui/Label";

// Editorial passages in the style of a record's liner notes: big type that
// brightens word by word as it is read, with a small label or margin note
// sitting in the indent of the first line.

export interface MarginNote {
  body: string;
  href: string;
  linkLabel: string;
}

export type Segment = string | { text: string; note: MarginNote };

export interface Passage {
  label?: string;
  // First-line indent, as a share of the column on desktop
  indent: string;
  segments: Segment[];
}

const DIM = 0.16;

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = (index / total) * 0.9;
  const opacity = useTransform(progress, [start, start + 0.1], [DIM, 1]);
  // .liner-word: under reduced motion, CSS shows every word at full opacity
  return (
    <motion.span className="liner-word" style={{ opacity }}>
      {word}
    </motion.span>
  );
}

function PassageBlock({ passage }: { passage: Passage }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  const notes = passage.segments.flatMap((s) =>
    typeof s === "string" ? [] : [s.note],
  );
  const [activeNote, setActiveNote] = useState(notes[0]);

  // Number every word once so the brightening runs through the whole passage
  const total = passage.segments.reduce(
    (sum, s) => sum + (typeof s === "string" ? s : s.text).split(" ").length,
    0,
  );
  let counter = 0;
  // Words are joined with plain spaces so a linked phrase's underline
  // doesn't run past its last word
  const renderWords = (text: string) =>
    text.split(" ").map((word, i) => {
      const index = counter++;
      return (
        <span key={index}>
          {i > 0 && " "}
          <Word
            word={word}
            index={index}
            total={total}
            progress={scrollYProgress}
          />
        </span>
      );
    });

  return (
    <div
      ref={ref}
      className="relative"
      style={{ "--indent": passage.indent } as React.CSSProperties}
    >
      {/* The indent slot: a label, or the note for the hovered phrase */}
      <aside className="md:absolute md:left-0 md:top-[0.6vw] md:w-[calc(var(--indent)-2vw)] mb-4 md:mb-0 type-micro text-zinc-400">
        {passage.label && <Label>{passage.label}</Label>}
        {activeNote && (
          <motion.div
            key={activeNote.href}
            role="note"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            // Short enough to sit inside the first line's height
            className="max-w-[38ch]"
          >
            {activeNote.body}{" "}
            <Link
              href={activeNote.href}
              className="text-zinc-100 hover:text-accent transition-colors whitespace-nowrap"
            >
              {activeNote.linkLabel} ↗
            </Link>
          </motion.div>
        )}
      </aside>

      <p className="type-display text-zinc-100 md:[text-indent:var(--indent)]">
        {passage.segments.map((segment, i) =>
          typeof segment === "string" ? (
            <span key={i}>
              {i > 0 && " "}
              {renderWords(segment)}{" "}
            </span>
          ) : (
            <Link
              key={i}
              href={segment.note.href}
              onMouseEnter={() => setActiveNote(segment.note)}
              onFocus={() => setActiveNote(segment.note)}
              className="underline decoration-[0.06em] underline-offset-[0.12em] decoration-zinc-600 hover:decoration-accent focus-visible:decoration-accent outline-none transition-colors"
            >
              {renderWords(segment.text)}
            </Link>
          ),
        )}
      </p>
    </div>
  );
}

export default function LinerNotes({ passages }: { passages: Passage[] }) {
  return (
    <div className="flex flex-col gap-[6vw]">
      {passages.map((passage, i) => (
        <PassageBlock key={i} passage={passage} />
      ))}
    </div>
  );
}
