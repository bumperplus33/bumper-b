# Bumper B

The site for **Bumper**, a digital creative studio, built with Next.js and React Three Fiber.

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
- `tunnel-rat` for sending scenes into the canvas

## Architecture

### 1. One canvas for the whole site

`<GlobalCanvas />` (`src/components/webgl/GlobalCanvas.tsx`) is rendered once in `src/app/layout.tsx`. It is fixed full-screen at `z-[40]` with `pointer-events: none`, so it sits over the page without blocking clicks. It listens for pointer events on `document.body`.

**What survives a page change:**

- The canvas and its WebGL context.
- drei's texture cache, so an image already loaded as a texture isn't fetched again.

**What doesn't:**

- The scenes. Each scene belongs to the page that renders it, so its meshes and materials are created when the page mounts and removed when it unmounts.

The canvas renders on demand (`frameloop="demand"`), so it only draws when something has changed:

- **Scrolling and resizing** request a frame, because they move the DOM boxes the scenes follow. They only do this when a page has sent a scene into the canvas, so About never draws.
- **Each scene** keeps requesting frames while it animates, and stops once it is still:
  - `FocusImage`: while its box moves, a dissolve runs or the scroll bend eases out.
  - `LiquidTitle`: the whole time the hero is on screen, since its blob always drifts. Its stir-trail simulation only runs while marks are left to heal. Under reduced motion the blob holds still, so it only draws while the pointer blob settles.
- **Resizing the canvas** clears it, so a size change also requests a frame.

With nothing moving, the canvas draws no frames at all. A scene that animates over time must call `invalidate()` from its `useFrame` while it is still changing, and cap `delta`: the first frame after a pause sees the whole pause as its delta.

### 2. Sending scenes into the canvas (`tunnel-rat`)

`src/providers/TunnelProvider.ts` exports one tunnel. A component anywhere in the page renders its scene inside `<tunnel.In>`, and the canvas renders everything that arrives at `<tunnel.Out />`. Page code can own its WebGL without the canvas knowing about it.

In use:

- `SequencerScene`: the Sequencer route's full-screen card loop (see below).
- `LiquidTitle`: Home's hero (`LiquidHero`).
  - A milky metaball blob with drifting holes, plus a smaller blob that follows the pointer and swells while pressed.
  - The wordmark inverts where it crosses the blob, and melts and slices near its edges and with scroll speed.
  - Stir marks (`StirTrail.ts`): a ping-pong feedback buffer laid over the hero records heat, stir and stroke direction along the pointer's path each frame. The marks smear the type along the stroke, thicken the liquid, and heal in about 3s. They are pinned to the type as the page scrolls. The pointer blob is a capsule spanning its path since the last frame, so fast moves stay whole. No marks under reduced motion.
  - Text source: every `[data-gl-text]` element in the hero is drawn into a 2D canvas at its exact DOM position, and that canvas is the shader's text texture. The layout stays in CSS, and the DOM text stays as the accessible title and the no-WebGL fallback.
- `FocusImage`: the small image in Home's liner notes.

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

| State            | Set by                                        | Read by                                                                                     |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `isLoading`      | `Preloader`                                   | `Preloader`, `ClunkyReveal` (hero title reveal)                                             |
| `scrollVelocity` | `SmoothScrollProvider`, on every Lenis scroll | `FocusImage`, inside its render loop via `getState()`, so scrolling doesn't re-render React |
| `scrollProgress` | `SmoothScrollProvider`, on every Lenis scroll | nothing yet; available for scroll-driven effects                                            |
| `hud`            | pages, through `useHud()`                     | `NavBar` (the metadata in the top-right corner)                                             |
| `isScrollLocked` | the Sequencer route, while it's mounted       | `SmoothScrollProvider`, `NavBar` (never hides the HUD while locked)                         |

### 5. Scrolling (`src/providers/SmoothScrollProvider.tsx`)

- **Smooth scroll:** Lenis runs on every page and publishes progress and velocity to the store.
- **Route changes:** scroll jumps to the top through Lenis (`immediate`), so Lenis's own position stays in sync.
- **Scroll lock:** when `isScrollLocked` is true, Lenis stops and the body gets `overflow: hidden`. The Sequencer route turns it on while it's mounted and off when you leave, so every other page scrolls normally.

### 6. Preloader (`src/components/ui/Preloader.tsx`)

The full-screen counter waits for the WebGL textures (drei's `useProgress`) and the fonts (`document.fonts.ready`). It never waits longer than 3 seconds. When it finishes, it sets `isLoading` to false, which starts the hero title animation.

- **Why the cap:** most textures are only for hover effects, and on a slow connection they can take tens of seconds. They keep loading in the background.
- **Backstop:** `ClunkyReveal` reveals the title on its own after 6 seconds.

## Pages

| Route          | File                           | Sections                                                                                                                                           |
| -------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | `src/app/page.tsx`             | Liquid hero (`LiquidHero`) → Featured Works list → liner-notes text with a `FocusImage` (two viewports tall) → video block → footer                |
| `/work`        | `src/app/work/page.tsx`        | ARCHIVE title reveal → project archive grid (spotlight hover: other projects dim, the HUD shows the hovered or focused project's credits) → footer |
| `/work/[slug]` | `src/app/work/[slug]/page.tsx` | Title, metadata row, hero image, the challenge as a liner-notes passage, gallery, Next Project link → footer                                       |
| `/sequencer`   | `src/app/sequencer/page.tsx`   | Immersive, scroll-locked project browser (see below)                                                                                               |
| `/about`       | `src/app/about/page.tsx`       | ABOUT title reveal → studio statement → capabilities index → image → footer                                                                        |

**Shared on every page** (`src/app/layout.tsx`):

- **Chrome:** the preloader, the canvas, the nav HUD and slide-out menu, and the film grain.
- **Navigation:** every internal link goes through the page transition (below).

### Page transitions

`src/providers/PageTransitionProvider.tsx` runs a typographic curtain for every navigation. Use `TransitionLink` (`src/components/ui/TransitionLink.tsx`) for links, or `usePageTransition().navigate(href)` from code.

1. **Cover:** a light curtain slides up and the destination's name (`routeLabel` in `src/utils/routeLabel.ts`) rises into it, letter by letter.
2. **Wait:** the router navigates only once the screen is covered. The curtain waits for the new route however long it takes, and shows "Loading…" after 1.2s.
3. **Reveal:** once the new route has rendered and painted, the letters lift out and the curtain slides away.

Rules:

- **Safety cap:** after 12s the curtain lifts anyway, so it can never trap anyone.
- **No curtain for:** same-page links, modified clicks (new tab or window), and reduced motion (links navigate directly).
- **Why not View Transitions:** the site used to use the browser's View Transitions API (`next-view-transitions`). It freezes the page while the next route renders, and gives up after about four seconds with `TimeoutError: Transition was aborted because of timeout in DOM update`. That happened on slow connections and on first visits to a route in `next dev`.

## Design system

**Type scale** (`src/app/globals.css`), as Tailwind utilities:

| Utility        | Size          | Used for                       |
| -------------- | ------------- | ------------------------------ |
| `type-micro`   | 11px          | nav, metadata, notes, captions |
| `type-label`   | 11px caps     | section labels                 |
| `type-heading` | 7vw → 3vw     | index rows and names           |
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

| Content              | Where                                                                                  | Notes                                            |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Work archive list    | `src/data/projects.ts`                                                                 | 11 projects                                      |
| Project page details | `PROJECT_DB` in `src/app/work/[slug]/page.tsx`                                         | An unknown slug falls back to Native Instruments |
| Featured Works list  | `FEATURED` in `src/components/sections/FeaturedWorks.tsx`                              |                                                  |
| Home and About copy  | in each page file                                                                      |                                                  |
| Images               | `public/images/project-*.jpg`, `video-poster.jpg`, `public/assets/images/image_*.webp` | See below                                        |

**All copy, project details and images are placeholder.**

**Placeholder images:**

- Every image on the site is a variation of one black-and-white photo, made by `scripts/placeholder-variations.py`.
- Each variation is a crop with its own tone treatment (contrast, matte, low key, high key), sometimes mirrored, plus fine grain.
- The script writes them under the file names the code already uses, so real images can replace them one file at a time.
- To regenerate: `python3 scripts/placeholder-variations.py SOURCE OUT_DIR` (needs Pillow), then copy the output over `public/images` and `public/assets/images`.
- The crops are tuned to the current 560×322 source; a different photo needs new crops.
- In development, clear `.next/cache/images` after replacing an image, or `next/image` keeps serving the old one.

## The Sequencer (`/sequencer`)

The one immersive route: the page doesn't scroll, and the WebGL canvas lays out the whole page itself.

- **Scene** (`src/components/webgl/SequencerScene.tsx`):
  - Every project is a card in an endless loop.
  - The centre card is large and in colour; the others shrink and dim.
  - While moving, the cards bow against the motion and split their colour channels.
  - The page sets a target position (in cards) on a shared ref, and the scene eases toward it, drawing frames only until it settles.
- **Input** (`src/app/sequencer/page.tsx`):
  - **Wheel and trackpad:** move freely, then snap to a card; a short flick still moves one card.
  - **Drag (mouse, pen or touch):** follows the pointer, with a flick on release.
  - **Arrow keys** move one card.
  - **Step buttons:** one per project, taking the shortest way round the loop.
  - **Opening a project:** click or tap the centre card, press Enter, or use "Open project".
- **HTML frame:**
  - The HUD shows the active project's details.
  - The bottom bar shows its number, name, role and location, the steps and the open link.
  - The page has an `sr-only` heading and a live region announcing each project.
  - A click zone sized like the centre card holds the DOM image, shown until the textures load and as the fallback without WebGL.
- **Scroll lock:** set when the route mounts and cleared when it unmounts.
- **Reduced motion:** cards jump straight to the target, without the bend or colour split.

## Roadmap

Planned work (stir trail, contact-sheet Archive, Sequencer sound, KTX2 textures) is in [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md).

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
  - The unused `assets/images` and parallax images, the old `project-12.jpg` (the SOJU branding image) and the Next.js starter SVGs. `project-12.jpg` now holds a placeholder crop for Grid 7 Years.
