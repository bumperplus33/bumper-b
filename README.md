# Bumper B

The site for **SOJU**, a digital creative studio, built with Next.js and React Three Fiber.

The pages are ordinary HTML laid out with Tailwind, and a single WebGL canvas behind them adds a few image effects that follow DOM elements on screen. The look is type-first: a small text HUD, big display paragraphs, and small WebGL images rather than full-screen 3D.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (type-checks too)
npm run start   # serve the production build
npm run lint
```

**Stack:**
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- React Three Fiber 9, drei, three
- Lenis for smooth scrolling, Framer Motion for DOM animation, Zustand for shared state
- `next-view-transitions` for page transitions, `tunnel-rat` for sending scenes into the canvas

## Architecture

### 1. One canvas for the whole site

`<GlobalCanvas />` (`src/components/webgl/GlobalCanvas.tsx`) is rendered once in `src/app/layout.tsx`. It is fixed full-screen at `z-[40]` with `pointer-events: none`, so it sits over the page without blocking clicks. It listens for pointer events on `document.body`.

**What survives a page change:**
- The canvas and its WebGL context.
- drei's texture cache, so an image already loaded as a texture isn't fetched again.

**What doesn't:**
- The scenes. Each scene belongs to the page that renders it, so its meshes and materials are created when the page mounts and removed when it unmounts.

The canvas runs with `frameloop="always"`, so it renders every frame even on pages with no WebGL (About).

### 2. Sending scenes into the canvas (`tunnel-rat`)

`src/providers/TunnelProvider.ts` exports one tunnel. A component anywhere in the page renders its scene inside `<tunnel.In>`, and the canvas renders everything that arrives at `<tunnel.Out />`. Page code can own its WebGL without the canvas knowing about it.

In use:
- `FocusImage`: the small image in Home's liner notes.
- `SingletonGlitch`: the hover glitch on the Work archive cards.

### 3. DOM-to-canvas sync

Both WebGL components follow the same pattern:
1. Render an ordinary DOM box with an `<img>` inside it.
2. Every frame, measure the box with `getBoundingClientRect()`.
3. Move and scale a plane in the canvas to cover it exactly.

The layout stays in CSS and works at any screen size. The DOM image is the fallback while textures load or if WebGL is unavailable.

`FocusImage` (`src/components/webgl/FocusImage.tsx`):
- Bends the plane and splits its colour channels with scroll speed.
- Dissolves between pictures when its `index` prop changes.
- Turns motion off under `prefers-reduced-motion`.

### 4. Shared state (`src/store/useStore.ts`)

A Zustand store holds what several components need:

| State | Set by | Read by |
| --- | --- | --- |
| `isLoading` | `Preloader` | `Preloader`, `ClunkyReveal` (hero title reveal) |
| `scrollVelocity` | `SmoothScrollProvider`, on every Lenis scroll | `FocusImage`, inside its render loop via `getState()`, so scrolling doesn't re-render React |
| `scrollProgress` | `SmoothScrollProvider`, on every Lenis scroll | nothing yet; available for scroll-driven effects |
| `hud` | pages, through `useHud()` | `NavBar` (the metadata in the top-right corner) |
| `isScrollLocked` | **nothing yet** | `SmoothScrollProvider` |

### 5. Scrolling (`src/providers/SmoothScrollProvider.tsx`)

- **Smooth scroll:** Lenis runs on every page and publishes progress and velocity to the store.
- **Route changes:** scroll jumps to the top through Lenis (`immediate`), so Lenis's own position stays in sync.
- **Scroll lock:** when `isScrollLocked` is true, Lenis stops and the body gets `overflow: hidden`. The lock works, but no page turns it on yet (see *Not built yet*).

### 6. Preloader (`src/components/ui/Preloader.tsx`)

The full-screen counter waits for the WebGL textures (drei's `useProgress`) and the fonts (`document.fonts.ready`). It never waits longer than 3 seconds. When it finishes, it sets `isLoading` to false, which starts the hero title animation.

- **Why the cap:** most textures are only for hover effects, and on a slow connection they can take tens of seconds. They keep loading in the background.
- **Backstop:** `ClunkyReveal` reveals the title on its own after 6 seconds.

## Pages

| Route | File | Sections |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Featured Works list → liner-notes text with a `FocusImage` (two viewports tall) → video block → footer |
| `/work` | `src/app/work/page.tsx` | ARCHIVE title reveal → project archive grid (hover glitch via `SingletonGlitch`) → footer |
| `/work/[slug]` | `src/app/work/[slug]/page.tsx` | Title, metadata row, hero image, the challenge as a liner-notes passage, gallery, Next Project link → footer |
| `/about` | `src/app/about/page.tsx` | ABOUT title reveal → studio statement → capabilities index → image → footer |

**Shared on every page** (`src/app/layout.tsx`):
- **Chrome:** the preloader, the canvas, the nav HUD and slide-out menu, and the film grain.
- **Navigation:** page changes use `next-view-transitions`, and project links add a "paper push" animation (`src/utils/animations.ts`).

## Design system

**Type scale** (`src/app/globals.css`), as Tailwind utilities:

| Utility | Size | Used for |
| --- | --- | --- |
| `type-micro` | 11px | nav, metadata, notes, captions |
| `type-label` | 11px caps | section labels |
| `type-heading` | 7vw → 3vw | index rows and names |
| `type-display` | 8.4vw → 4.4vw | paragraphs set as display type |

**Fonts** are loaded once in the layout with `next/font`:
- Neue Montreal → `font-neue`.
- NB International → `font-sans`, the body default.

**Shared pieces:**
- `NavBar` (`src/components/ui/NavBar.tsx`): the HUD.
  - Left: logo and links.
  - Right: the page's metadata, set with `useHud(title, lines)`.
  - Menu: `StairsMenu` opens from the HUD and closes with Escape.
- `Label` (`src/components/ui/Label.tsx`): the ● section label.
- `LinerNotes` (`src/components/sections/LinerNotes.tsx`): display paragraphs.
  - Words brighten as they are read.
  - A label or margin note sits in each first-line indent.
  - Linked phrases swap the note on hover.
- `RevealFooter` (`src/components/ui/RevealFooter.tsx`): the page slides up to uncover a footer pinned underneath.
- `StickyHeroReveal` + `ClunkyReveal`: the big title that springs in letter by letter (ARCHIVE, ABOUT).

## Content

| Content | Where | Notes |
| --- | --- | --- |
| Work archive list | `src/data/projects.ts` | 11 projects |
| Project page details | `PROJECT_DB` in `src/app/work/[slug]/page.tsx` | An unknown slug falls back to Native Instruments |
| Featured Works list | `FEATURED` in `src/components/sections/FeaturedWorks.tsx` | |
| Home and About copy | in each page file | |

**All copy and project details are placeholder.**

## Not built yet

**An immersive, scroll-locked WebGL route.** A route where the canvas takes over the layout and handles its own input, with HTML only as framing. The pieces it would use exist:
- The scroll lock in the store and `SmoothScrollProvider`.
- The tunnel.

But no route uses them, and nothing locks or unlocks scrolling per route. The earlier "DOM Sandwich" and `/archive` design described this; it isn't implemented.

## Removed code

Components, packages and assets that no page used were removed in one cleanup commit. They can be restored from git history if needed:

- **Components:**
  - `HorizontalGLParallaxBlock` and `HorizontalGLParallaxScene`: a horizontal WebGL gallery.
  - `InfiniteParallaxHero`, `ProjectShowcase`.
  - `WorksIndex`: a typographic project list with a `FocusImage` beside it.
  - `WebGLScene`, `FluidWatermark`, `GlitchImage`.
  - `MagneticWrapper`, `HardwareParallax`, `KineticTypography`, `ParallaxImage`, `VelocityMarquee`.
  - `src/utils/math.ts`.
- **Packages:** `gsap`, `@vimeo/player`, `@types/vimeo__player`.
- **Assets:**
  - The duplicate `public/assets/fonts` and `public/assets/videos` folders.
  - The six `showcase-reel-1…6.mp4` clips.
  - The unused `assets/images` and parallax images, `project-12.jpg` (the SOJU branding image) and the Next.js starter SVGs.

## Known issues

- **Lint:** `npm run lint` reports 7 problems (4 errors, 3 warnings), all in older code. `next build` does not run ESLint, so it still passes.
  - Errors:
    - An `any` type in `PROJECT_DB`.
    - Two `setState` calls inside effects (`StickyHeroReveal`, `GlobalCanvas`).
    - One mutated hook value (`SingletonGlitch`).
  - Warnings: three plain `<img>` tags in `FeaturedWorks`.
- **Every-frame rendering:** the canvas renders every frame on every page, including pages with no WebGL.
