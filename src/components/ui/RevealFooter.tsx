"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Footer from "@/components/ui/Footer";

// The page content slides up to uncover a footer pinned underneath it.
// The content keeps a bottom margin equal to the footer's height so the
// last scroll reveals all of it.
export default function RevealFooter({
  children,
  className = "",
  extra,
}: {
  children: ReactNode;
  className?: string;
  extra?: ReactNode;
}) {
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) setFooterHeight(entry.contentRect.height);
    });
    if (footerRef.current) resizeObserver.observe(footerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <div
        className={`relative z-10 ${className}`}
        style={{ marginBottom: `${footerHeight}px` }}
      >
        {children}
      </div>

      <div
        ref={footerRef}
        className="fixed bottom-0 left-0 w-full z-0 pointer-events-none"
      >
        <div className="pointer-events-auto">
          <Footer />
        </div>
        {extra}
      </div>
    </>
  );
}
