<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cognimind — repo guide (for coding agents)

## What this repo is
A **single Cognimind-branded website** that hosts a growing set of **independent product demos/prototypes**. It started as one demo (`hvac-support-copilot`) and is becoming the home for several. Each demo is its own route and its own self-contained experience — but they all share the same look, feel, and brand.

## Architecture: one site, many isolated demos
- **Shared shell, isolated apps.** The site chrome (fonts, global CSS, brand mark) is shared. The demos are not wired together as a single app.
- **No shared runtime state.** Demos must not share a store, context, or a multi-view router flow. Each demo owns its root component and local `useState`. Cross-demo navigation is a normal link, never shared state.
- **Independently removable.** A demo should be removable by deleting its folder under `demos/<slug>/` plus its thin route file under `app/<slug>/`. If removing a demo would break another demo, the boundary is wrong.
- **One route per demo.** The route file is a thin wrapper; the demo's logic lives in its own folder.

### Target layout
```
app/
  layout.tsx          # root: fonts + globals.css (shared by every demo)
  globals.css         # brand tokens (@theme) + shared utility/animation classes
  page.tsx            # landing / demo index that links to each demo
  <slug>/page.tsx     # one thin route per demo
components/
  brand.tsx           # shared Brand + LogoMark
  app-header.tsx      # shared shell header
demos/
  <slug>/
    page.tsx          # demo root component (the actual UI)
    components/       # demo-local components
    lib/              # demo-local mock data + types
public/               # shared static assets (manuals/, icons)
scripts/              # one-off asset generators (e.g. generate-manuals.mjs)
```

### Adding a new demo
1. Create `demos/<slug>/` with its own `page.tsx` (client interactivity → `"use client"`), `components/`, and `lib/` (mock data + types). Keep it self-contained; do not import another demo's files.
2. Add a thin route `app/<slug>/page.tsx` that renders the demo root.
3. Build the UI **using the shared tokens and shell** (below) so it feels like the same product.
4. Add a card/link for it on the landing page `app/page.tsx`.
5. Reuse `Brand` (and `AppHeader` where appropriate) for branding. Don't re-draw the logo.
6. Verify: `npx tsc --noEmit --incremental false`, `npx eslint .`, `npm run build`.

### Current state / known next steps
- `hvac-support-copilot` currently lives at the root route (`app/page.tsx`) with top-level `components/` and `lib/`. **Planned migration:** move it to `demos/hvac-support-copilot/`, make `app/page.tsx` the landing/demo index, and add `app/hvac-support-copilot/page.tsx` as the thin route. Do the migration when the landing page / second demo lands.

## Design system & brand (keep every demo consistent)
All shared styling lives in **`app/globals.css` under `@theme`** (Tailwind v4). **Never hardcode hex or introduce a new hue** — use the tokens.

- **Palette tokens:** `canvas` (warm off-white bg), `surface` (cards), `elevated` (subtle fill), `ink` / `ink-soft` / `muted` (text), `line` / `line-strong` (borders), `accent` / `accent-hover` / `accent-soft` (near-black primary actions), `amber` / `amber-soft` (attention), `gold` (brand highlight), `forest`, `online` (status green).
- **Fonts** (loaded once in `app/layout.tsx` via `next/font`): `font-sans` (Inter) body, `font-serif` (Newsreader) brand/headline, `font-mono` (IBM Plex Mono) for metadata, labels, and IDs.
- **Signature patterns** to reuse so demos feel like one product:
  - Small labels: `font-mono text-[0.62rem] uppercase tracking-[0.12em]`.
  - Primary buttons: `rounded-full`, uppercase mono label, `bg-accent text-canvas`, `hover:bg-accent-hover`.
  - Cards: `rounded-2xl border border-line-strong bg-surface`.
  - Warm, low-contrast, rounded; subtle borders over heavy shadows.
- **Shared components/classes:** `Brand`/`LogoMark`, `AppHeader`, and the global helpers `.scroll-soft`, `.cube-loader`, `.cube-caret`, `.hint-pulse`. Prefer these over re-implementing look-alikes.
- Accessibility: animation is already collapsed under `prefers-reduced-motion` in `globals.css` — keep new motion consistent and don't fight it.

## Coding conventions
- TypeScript, strict. No `any`; give message/state shapes explicit types (see `lib/types.ts` pattern: a `Message` union with a `kind` discriminator).
- Add `"use client"` only where interactivity demands it; keep leaf presentational components server-safe where possible.
- **Timers:** the copilot drives staged animations with a `timeoutsRef` + `after()` helper and clears them on unmount/reset. Follow that pattern — never leak `setInterval`/`setTimeout`.
- Icons: **lucide-react** only. Don't add another icon library.
- **New runtime dependencies:** ask first. Current runtime deps are intentionally lean (`framer-motion`, `lucide-react`).
- Prefer extending the shared tokens/components over copy-pasting styles.
- Demos use mocked data in their own `lib/`; no secrets, no real network calls, no env vars.

## Commands
```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run start   # serve the build

# Checks (use npx; the `lint` script passes no path)
npx tsc --noEmit --incremental false
npx eslint .
```

## Environment gotchas (this machine)
- WSL on **aarch64**. `npm run build` can fail with a missing `lightningcss-linux-arm64-gnu`; fix with `npm i --no-save --no-package-lock lightningcss-linux-arm64-gnu`.
- `next dev` under WSL can **wedge and stop recompiling** while still serving the old bundle (symptom: your edits have no effect and `.next/dev/server` mtimes freeze). Fix: restart `npm run dev` and hard-refresh the browser. If port 3000 is taken it may start on **3001** — check which port the server is actually on before concluding your change "didn't apply."
- Never delete the `BEGIN/END nextjs-agent-rules` block at the top of this file; `next dev` re-adds it.