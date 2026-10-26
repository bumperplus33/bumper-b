import { create } from "zustand";

interface AppState {
  // 1. GLOBAL LOADING STATE
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 2. LENIS SCROLL STATE (published by SmoothScrollProvider on every scroll)
  scrollProgress: number;
  scrollVelocity: number;
  setScroll: (progress: number, velocity: number) => void;

  // 3. BROWSER PIPELINE STATE: SmoothScrollProvider stops Lenis and locks the
  // body while this is true. The Sequencer route sets it while mounted.
  isScrollLocked: boolean;
  setScrollLocked: (locked: boolean) => void;

  // 4. HUD: the metadata block in the top-right corner, set per page
  hud: HudMeta;
  setHud: (hud: HudMeta) => void;
}

export interface HudMeta {
  title: string;
  lines: string[];
}

export const DEFAULT_HUD: HudMeta = {
  title: "SOJU Studio",
  lines: ["Digital creative studio", "Technology / Art", "Index 2021—2026"],
};

export const useStore = create<AppState>((set) => ({
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  scrollProgress: 0,
  scrollVelocity: 0,
  setScroll: (progress, velocity) =>
    set({ scrollProgress: progress, scrollVelocity: velocity }),

  isScrollLocked: false,
  setScrollLocked: (locked) => set({ isScrollLocked: locked }),

  hud: DEFAULT_HUD,
  setHud: (hud) => set({ hud }),
}));
