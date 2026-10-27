"use client";

import { ComponentProps } from "react";
import NextLink from "next/link";
import { usePageTransition } from "@/providers/PageTransitionProvider";

// A next/link (so it still prefetches and works without JavaScript) whose
// plain left clicks go through the page transition. Modified clicks
// (new tab, new window, download) keep the browser's behaviour.
export default function TransitionLink({
  href,
  onClick,
  ...props
}: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  const { navigate } = usePageTransition();

  return (
    <NextLink
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          props.target === "_blank"
        ) {
          return;
        }
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
