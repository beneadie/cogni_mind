<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Demo application guide

## Project boundaries
- This folder is an independent Next.js application, with its own `package.json`, lockfile, `next.config.ts`, `app/`, `components/`, and `demos/` source tree.
- The company landing-page app lives at the repository root and is a separate Next.js project. Do not turn demo pages into root-app routes, import root-app runtime code, or change root build settings as part of demo work unless the user explicitly requests an integration.
- The personal Netlify site `cognidemos` deploys this application only. Its Base directory is `demos`; its build and publish paths are configured for this project. Keep Netlify runtime configuration in this folder.
- This fork exists to simplify demo deployment and keep the code together for the team. The canonical company repository remains owned separately. Aim to make user-requested demo/product changes reviewable for upstream contribution, while keeping deployment-only work scoped to this folder unless upstream should own it too.

## Upstream contribution workflow
- Before preparing an upstream contribution, inspect the root guidance, `git remote -v`, `git status`, and branch state. Do not assume `origin` and `upstream` are correctly configured.
- The current `upstream` URL may be a placeholder (`https://github.com/company/repo.git`). Verify the canonical repository URL before fetching or creating a PR; ask the user if it is unresolved.
- Start an upstream topic branch from the canonical default branch, then cherry-pick or reapply only the requested changes. Do not use the fork's `main` as the PR base or send the entire fork history upstream.
- Review the PR diff to ensure it contains the intended demo/product changes and any necessary demo-specific files. Keep fork-owned Netlify wiring out of the PR unless the user wants the canonical repo to own it.
- Push topic branches to the fork and target the canonical repository in the PR. Never push directly to either repository's `main` branch.

## App structure
- `app/page.tsx` is the root HVAC support copilot demo.
- `app/plm/page.tsx` is a thin route wrapper for `demos/plm/page.tsx`.
- `demos/plm/` and `demos/ingest/` hold demo-specific UI, components, and data. Keep each demo self-contained; do not share runtime state between demos.
- Shared demo shell, styles, and components live in `components/`, `app/layout.tsx`, and `app/globals.css`.

## Design and coding conventions
- Preserve Cognimind's warm, low-contrast visual language. Reuse tokens and patterns in `app/globals.css`; avoid new hardcoded colors.
- Use TypeScript with explicit types; avoid `any`. Add `"use client"` only where interactivity requires it.
- Use `lucide-react` for icons. Ask before adding a new application runtime dependency; build-time tooling such as the Netlify adapter belongs in `devDependencies`.
- Keep demos on mocked data unless the user requests a real integration. Do not add secrets or environment variables for demo-only flows.
- Clear timers and event listeners on unmount. Follow the existing cleanup patterns in the neighboring demo code.

## Commands
Run these from `demos/` when the user asks for verification:

```bash
npm run dev
npm run build
npx tsc --noEmit --incremental false
npx eslint .
```

## Environment notes
- Resolve Next.js documentation from `demos/node_modules/next/dist/docs/` before changing this app.
- Do not remove the generated `BEGIN/END nextjs-agent-rules` block at the top of this file; `next dev` re-adds it.
