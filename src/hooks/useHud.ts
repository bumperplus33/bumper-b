"use client";

import { useEffect } from "react";
import { DEFAULT_HUD, useStore } from "@/store/useStore";

// Sets the metadata in the HUD's top-right corner while this page is mounted.
export function useHud(title: string, lines: string[]) {
  const key = lines.join("\n");

  useEffect(() => {
    useStore.getState().setHud({ title, lines: key.split("\n") });
    return () => useStore.getState().setHud(DEFAULT_HUD);
  }, [title, key]);
}
