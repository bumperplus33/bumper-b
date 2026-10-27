# Development plan

Next steps for Bumper, drawn from a study of gilhuybrecht.com (cursor burn
simulation, contact-sheet work grid, velocity-driven sound, compressed
textures). Each item says what it is, where it lands in the codebase, how to
build it, and when it is done.

| #   | Item                              | Size   | Depends on | Status  |
| --- | --------------------------------- | ------ | ---------- | ------- |
| 1   | Paint along segments              | Small  | —          | Planned |
| 2   | Scroll-advected stir trail        | Medium | 1          | Planned |
| 3   | Contact-sheet grid for /work      | Medium | —          | Planned |
| 4   | Sound tied to Sequencer velocity  | Small  | —          | Planned |
| 5   | KTX2 textures                     | Medium | Growth     | Deferred |

Order: 1 → 2 is one thread of work on the hero; 3 and 4 are independent and
can run in parallel; 5 waits until the image count makes it worth it.

---

## 1. Paint along segments

**What.** Fast pointer moves currently make the LiquidTitle blob jump between
samples. Interpolate between the previous and current pointer positions so a
fast swipe reads as one continuous stroke.

**Where.** `src/components/webgl/LiquidTitle.tsx` (the `useFrame` pointer
block and the `ball()` term in the fragment shader).

**How.**
- Keep the previous eased pointer position (`uPointerPrev`) alongside
  `uPointer`.
- In the shader, replace the point distance for the pointer blob with the
  distance to the segment `prev → current` (closest point on a line
  segment: `clamp(dot(p - a, b - a) / dot(b - a, b - a), 0, 1)`).
- Leave the drifting metaballs as they are; only the pointer blob changes.

**Done when.** A fast horizontal swipe across the hero leaves no gaps or
beading at 60fps or at 30fps (throttled CPU); slow moves look unchanged;
reduced motion is unaffected.

---

## 2. Scroll-advected stir trail

**What.** Moving the pointer leaves "stir marks" in the liquid lockup that
stay attached to the type as the page scrolls and slowly heal. It gives the
"Move to stir — press to swell" caption a memory.

**Where.**
- New `src/components/webgl/StirTrail.ts`: the simulation (render targets,
  sim material, `step()`).
- `src/components/webgl/LiquidTitle.tsx`: owns a `StirTrail`, feeds it the
  pointer segment and scroll delta, samples it in the composite shader.

**How.**
- **Ping-pong feedback buffer.** Two half-float render targets, about 512²
  (1024² on large screens), swapped each frame. Channels:
  - R = heat (fast decay, drives the bright/wet edge)
  - G = char/stir (slow decay, drives the lasting mark)
  - BA = stroke direction (for directional displacement)
- **Sim pass.** Each frame: sample the previous buffer at `uv + uShift`
  (scroll advection, from the hero rect's movement since last frame), decay
  heat and stir by `exp(-rate * dt)`, then add along the pointer segment from
  item 1. Press (`uPress`) raises the paint radius and rate.
- **Composite.** In LiquidTitle's fragment shader, read the trail:
  - offset the text UV perpendicular to the stroke direction (a "smear")
  - add stir to the metaball field so marks thicken the liquid
  - a faint rim on the heat band, in the existing palette (no new colours)
- **Tunables** in one config object, like Gil's
  `{ heatDecay, stirDecay, stirRate, radius }`, so they can be tuned in one
  place.
- **Frameloop.** The canvas is on-demand: keep invalidating while any trail
  value is above a threshold, then stop. Track the max cheaply (decay is
  known, so estimate time-to-zero from the last paint instead of reading
  pixels back).
- **Reduced motion.** No trail; keep the current behaviour.
- **Resize.** Recreate targets on resize; losing the trail then is fine.

**Done when.** Marks follow the type exactly while scrolling (no swimming),
heal fully within about 3–4s, the canvas returns to idle frames afterwards,
and the hero holds 60fps on a mid-range laptop.

**Risk.** Half-float render targets on older mobile GPUs: fall back to
`UnsignedByteType` with packed values, or disable the trail below a GPU tier.

---

## 3. Contact-sheet grid for /work

**What.** Re-lay the Archive as a contact sheet: each project is a run of
numbered frames, the name over frame 1, everything dimmed except the project
under the pointer (a spotlight). It fits the HUD's "record sleeve credits"
style.

**Where.**
- `src/data/projects.ts`: add `frames: string[]` per project (the hero image
  plus 2–4 more). Until real assets exist, extend
  `scripts/placeholder-variations.py` to generate them.
- `src/app/work/page.tsx`: replace the current card grid.
- Possibly a new `src/components/sections/ContactSheet.tsx`.

**How.**
- A dense grid (6 columns desktop, 2 mobile) built from the existing gutters;
  projects flow continuously so one project's frames can wrap rows.
- Frame headers in `type-micro`: project name on frame 1, index number on
  each frame (`1 2 3 …`).
- Spotlight: hovering any frame sets the active project; others drop to about
  35% opacity with a short CSS transition. Keyboard focus does the same.
- Clicking any frame navigates via `usePageTransition().navigate`.
- Keep `useHud("Archive", …)`; add the hovered project's role/location to
  the HUD lines while hovering.
- Keep or drop the current cinematic hover and `SingletonGlitch`: decide at
  review (they compete with the spotlight).

**Done when.** All projects show as frame runs, the spotlight works with mouse
and keyboard, images are `next/image` with correct `sizes`, and Lighthouse
CLS on /work stays at 0.

---

## 4. Sound tied to Sequencer velocity

**What.** An optional hum or tick in the Sequencer whose pitch and volume
follow drag/flick speed. Muted by default, with a saved toggle.

**Where.**
- New `src/hooks/useSound.ts` (or `src/audio/`): Web Audio context, loading,
  mute state.
- `src/store/useStore.ts`: `soundOn` flag.
- `src/components/webgl/SequencerScene.tsx`: already computes a smoothed
  `velocity`; publish it to the audio layer.
- `src/app/sequencer/page.tsx`: the toggle (in the existing control strip,
  `type-micro`: "Sound Off / On").
- `public/sound/`: one short loop (hum) and one tick, both small (<100KB).

**How.**
- Create the `AudioContext` only on the first user gesture that turns sound
  on (autoplay policy).
- Hum: a looping `AudioBufferSourceNode` → `GainNode`. Each frame, ramp
  `gain` and `playbackRate` toward values mapped from `|velocity|` with
  `setTargetAtTime` (no clicks).
- Tick: play once per card crossed (when the active index changes), pitch
  shifted slightly by velocity.
- Persist `soundOn` in `localStorage` (wrapped in try/catch); default off.
- Suspend the context when the route unmounts or the tab is hidden.

**Done when.** No sound plays until the toggle is turned on; the setting
survives reloads; hum pitch clearly tracks flicks; there are no clicks or
pops at start/stop; leaving the Sequencer silences it.

---

## 5. KTX2 textures (deferred)

**What.** Ship WebGL textures as KTX2/Basis so they upload to the GPU
compressed and decode in a worker.

**When.** Worth it once WebGL scenes hold roughly 20+ large images at once
(e.g. if the Sequencer or a WebGL Work grid grows). Today's 12 JPEGs don't
justify the pipeline.

**How (when triggered).**
- Encode with `toktx` (KTX-Software) in a script next to
  `placeholder-variations.py`; output to `public/textures/`.
- Copy the Basis transcoder into `public/basis/`.
- Swap `useTexture` for drei's `useKTX2` in `SequencerScene.tsx`,
  `FocusImage.tsx` and `SingletonGlitch.tsx`, keeping JPEGs for the DOM
  `next/image` paths.
- Check colour space (`SRGBColorSpace`) and flipY match the JPEG versions.

**Done when.** GPU memory for the Sequencer drops measurably (Spector.js or
`renderer.info`), first-frame jank on entering the Sequencer is gone, and
images look identical.

---

## Working agreement

- One branch and PR per item; items 1 and 2 may share a PR.
- Each PR: `npm run lint` and `npm run build` clean, checked in the browser
  at desktop and mobile widths and with reduced motion on, and the README
  updated where architecture changes.
- Update the status column above as items land.
