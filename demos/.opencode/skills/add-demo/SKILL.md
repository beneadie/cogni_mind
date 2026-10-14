---
name: add-demo
description: Use when adding a new demo, prototype, or product walkthrough to the Cognimind demo site — creating demos/<slug>/, a thin app/<slug>/page.tsx route, and registering it in the demo switcher (lib/demos.ts). Covers demo boundaries, shared shell/brand reuse, design tokens, staged-animation conventions, and the required checks.
---

# Adding a demo to the Cognimind site

This repo hosts several **independent product demos** behind one shared shell.
Every demo is its own route and its own self-contained experience. `AGENTS.md`
is the source of truth for architecture; this skill is the actionable checklist.

## Invariants (do not break these)

- **One route per demo.** A thin `app/<slug>/page.tsx` renders the demo root.
- **Logic lives in the demo's own folder:** `demos/<slug>/` with `page.tsx`,
  `components/`, and `lib/` (mock data + types).
- **No shared runtime state.** Demos must not share a store, context, or a
  multi-view router. Cross-demo navigation is a normal link (`DemoNav`), never
  shared state.
- **Independently removable.** Deleting `demos/<slug>/` and `app/<slug>/` must
  not break any other demo. Never import another demo's files.
- **Global shell only.** The only shared code is `app/layout.tsx`,
  `app/globals.css`, `components/brand.tsx`, `components/app-header.tsx`,
  `components/demo-nav.tsx`, and `lib/demos.ts`. Reuse these; don't fork them.

## Steps

1. **Create the demo folder** `demos/<slug>/`:
   - `page.tsx` — the demo root. Add `"use client"` at the top (demos are
     interactive).
   - `components/` — demo-local components.
   - `lib/` — demo-local mock data and `types.ts`.
   Recreate any tiny primitives you need locally (e.g. a `CubeLoader` or
   `Typewriter`) so the demo stays removable instead of importing another
   demo's components.

2. **Add the thin route** `app/<slug>/page.tsx`:
   ```tsx
   import Demo from "@/demos/<slug>/page";

   export default function Page() {
     return <Demo />;
   }
   ```

3. **Register it in the switcher** — add an entry to `lib/demos.ts`:
   - Use `status: "live"` once the route exists. Use `status: "soon"` for a
     placeholder (rendered disabled with a "Soon" chip in `DemoNav`).
   - Set `href` to `/<slug>` (the root demo is `href: "/"`).
   - `slug` must match both the `demos/<slug>/` folder and the `app/<slug>/`
     route.

4. **Use the shared shell.** Render `Brand` (and the demo's own header) so it
   feels like the same product. `DemoNav` already lives inside
   `components/app-header.tsx`; if the demo needs its own header, import
   `DemoNav` into it rather than re-implementing a switcher.

5. **Build the UI from tokens, not hex.** All colors/fonts come from
   `@theme` in `app/globals.css`. Never hardcode a hex or introduce a new hue.
   Reuse the signature patterns:
   - Small labels: `font-mono text-[0.62rem] uppercase tracking-[0.12em]`.
   - Primary buttons: `rounded-full`, mono uppercase label,
     `bg-accent text-canvas`, `hover:bg-accent-hover`.
   - Cards: `rounded-2xl border border-line-strong bg-surface`.
   - Prefer the global helpers `.scroll-soft`, `.cube-loader`, `.cube-caret`,
     `.hint-pulse` over look-alikes.

6. **Animations follow the house pattern.**
   - Use `lucide-react` for icons only (no other icon library).
   - `framer-motion` is available for enter/exit and reveals.
   - Drive staged sequences with a `timeoutsRef` array plus an `after(ms, fn)`
     helper, and clear every timeout on unmount/reset. Never leak `setTimeout`
     or `setInterval`. See the HVAC demo's `streamTurn` for the reference.

7. **Keep it mocked.** Demo data lives in the demo's `lib/`. No secrets, no
   real network calls, no env vars. Don't add runtime dependencies without
   asking first — current runtime deps are `framer-motion` and `lucide-react`.

8. **TypeScript is strict.** No `any`. Give message/state shapes explicit
   types, using a discriminated union with a `kind` field where appropriate
   (see the HVAC `Message` type).

## Verify before you're done

Run all three and make them pass:

```bash
npx tsc --noEmit --incremental false
npx eslint .
npm run build
```

Then confirm removability: temporarily delete `demos/<slug>/` and
`app/<slug>/`, remove the `lib/demos.ts` entry, and check the rest still
builds.

## Environment gotchas (WSL / aarch64)

- If `npm run build` fails on `lightningcss-linux-arm64-gnu`, run:
  `npm i --no-save --no-package-lock lightningcss-linux-arm64-gnu`.
- `next dev` can wedge and serve a stale bundle (edits appear to do nothing).
  Restart `npm run dev` and hard-refresh; it may start on port 3001 if 3000 is
  taken — check the actual port before assuming your change didn't apply.
