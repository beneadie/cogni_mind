# Cognimind demo site

A single Next.js app that hosts several **clickable prototypes**. Everything is
scripted and mocked — there is no backend, no real AI, and no live data. The point
is to show how an interaction is *supposed* to feel, not to do real work.

This file is the site-level index **and** the walkthrough for the HVAC demo, which
lives on the root route. Each demo also has its own README:

- **HVAC Field Support** (`/`) → this file
- **Product Data / PLM** (`/plm`) → [`demos/plm/README.md`](./demos/plm/README.md)
- **Quality Intelligence** (not routed) → [`quality/README.md`](./quality/README.md)

## Routes at a glance

`npm run build` produces exactly these pages:

| Route        | Demo                          | Status        | Code lives in                       |
| ------------ | ----------------------------- | ------------- | ----------------------------------- |
| `/`          | HVAC Field Support            | live          | `app/page.tsx` + `components/`      |
| `/plm`       | Product Data — Product Care Inbox | live      | `demos/plm/` (thin route at `app/plm/page.tsx`) |
| `/_not-found`| Next.js 404                   | built-in      | —                                   |
| `/icon.svg`  | favicon                       | built-in      | —                                   |

> **There is a third demo that is not reachable.** The Quality Intelligence demo
> exists under `quality/` but has **no `app/quality/page.tsx` route** and is **not
> registered** in `lib/demos.ts`, so `/quality` returns a 404 and it never appears
> in the demo switcher. See [`quality/README.md`](./quality/README.md) for what it
> does and how to turn it on.

## How to reach a demo

- Directly by URL (`/`, `/plm`).
- Via the **demo switcher**: the small chevron button (⌄) at the left of the
  header on any demo. It lists everything in `lib/demos.ts`. This is the single
  source of truth — to add a demo you add it there *and* add an `app/<slug>/page.tsx`.

## Run & verify

Run from this `demos/` folder:

```bash
npm run dev                                   # local dev server (http://localhost:3000)
npm run build                                 # production build (also lists the routes)
npx tsc --noEmit --incremental false          # type-check
npx eslint .                                  # lint
```

> **WSL note:** when the repo is on a `/mnt/c` Windows drive, `npm run dev` can fail
> with `Error: An IO error occurred while attempting to create and acquire the
> lockfile (Permission denied, os error 13)`. `npm run build`, `tsc`, and `eslint`
> work fine and are the fallback for verifying changes.

## Shared building blocks

| Piece | What it is |
| --- | --- |
| `app/layout.tsx` | Root layout + fonts (Inter, Newsreader, IBM Plex Mono) and page metadata. |
| `app/globals.css` | Design tokens (warm, low-contrast palette) and utility classes like `scroll-soft`. Reuse these instead of hardcoding colors. |
| `components/app-header.tsx` | Shared top bar: brand, title, `DemoNav`, Reset. |
| `components/demo-nav.tsx` | The demo switcher dropdown (reads `lib/demos.ts`). |
| `components/brand.tsx` | The Cognimind wordmark. |
| `lib/demos.ts` | The list of demos in the switcher. |
| `components/pdf-modal.tsx` | The HVAC demo's PDF page viewer (used by the HVAC route only). |

Each demo keeps its own UI and mock data; they do **not** share runtime state.

---

# Demo 1 — HVAC Field Support (route `/`)

**File:** `app/page.tsx` (the root page). Support cards are in `components/`, mock
content in `lib/mock-data.ts`, shared types in `lib/types.ts`.

## What it shows

A field technician asks about a fault on a specific unit. The copilot loads the
right service-manual pages, guides a **manual-grounded** diagnosis step by step,
offers a likely part, escalates a nearby-warehouse stock check to a named parts
specialist, and — when it hits something it can't answer (pricing, scheduling) —
**hands off to a human** with a briefing instead of guessing. It can also **draft an email to customer support** with the problem, the
steps already tried, and the technician's reply-to details. The theme: the technician
stays in control, and the agent never invents answers outside the loaded manuals.

## The scenario (fixed, scripted)

A 2019 Carrier **38MURA** shows error **E5** and the blower won't spin. The path is
always: `E5 → check 24VAC at CN2 → read the board flashes → 3 flashes = board fault
→ part CB-38MURA-2019 → stock check assigned to John Smith → replacement procedure →
email → handoff → callback`.

## Screen layout

- **Left rail** — case history (live case + past cases you can peek at). Collapsible.
- **Center** — the conversation, with activity "thinking" blocks, manual cards,
  citations, part/stock-check cards, and the composer.
- **Right rail** — *Loaded Context*: manuals available/loaded, bookmarked manual pages, and the planned Zoho / monday.com CRM integrations.
- **Header** — brand, demo switcher, Reset.

## The composer trick (important)

You mostly don't type. **Click the composer box** and it auto-types the exact prompt
that stage expects; press **Enter** to send. The prompt it fills is driven by
`EXPECTED_INPUT` in `app/page.tsx`. You can always type your own text instead.

Guided prompts stop when a branch reaches its planned end. After the email is sent
or discarded, or the callback is confirmed, the composer locks and no next-step
prompt is auto-filled. Use **Reset Demo** to run another path.

**Voice mode is appearance-only.** The mic button in the composer switches to a
spoken-interface state: the composer locks, shows *"Listening…"*, and displays an
animated waveform with a stop control. No microphone permission is requested and no
audio is recorded, transcribed, or played. Click the stop square to return to typing.

## Click-by-click walkthrough

Start fresh: open `/` and, if needed, click **Reset** in the header.

1. **Ask (start).** Click the composer → it types *"Customer's 2019 Carrier 38MURA
   shows error code E5…"* → **Enter**.
   - Agent shows a "thinking" block running searches, then a line: *"I found 3
     manuals… Select the ones you'd like me to load."* and three manual cards.
   - Stage → `load` (the composer is now locked).

2. **Load manuals.** Click the **Service Manual** card (and optionally the
   Installation and Parts cards). A **"Load N into context"** button appears on the
   manual card group — click it.
   - Agent indexes each manual, runs concurrent searches, then answers: *E5 is an AC
     overcurrent fault… start by checking for 24VAC at connector CN2*, with a
     **citations** block (p.6, p.8, p.14). Pages are added to the right rail as
     bookmarks. Stage → `reportVoltage`.
   - The selected manual cards stay checked after loading. If extra manuals were
     loaded, the answer appends an **Also loaded** line naming the manual and its
     finding.
   - Tip: click any citation or bookmark to open that page in the **PDF viewer**.

3. **Report the reading.** Click the composer → *"No voltage at CN2."* → **Enter**.
   - Agent: *"the fault is upstream of the motor… read the control-board LED and count
     the flashes."* Bookmarks p.11. Stage → `reportFlashes`.

4. **Report the flashes.** Click the composer → *"3 flashes."* → **Enter**.
   - Agent: *3 flashes = internal control-board fault; likely fix is to replace the
     board. Part CB-38MURA-2019* — plus a **part card** and a **recommendation card**
     (explicitly labelled as a recommendation, not a confirmed diagnosis). Then:
     *"Want me to ask the parts desk to check nearby warehouse stock?"* Stage →
     `recommend`.

5. **Request a stock check.** Either press **Enter** (the composer fills *"Yes,
   request a stock check."*) or click **Request Stock Check** on the part card.
   - Agent explains it cannot see live warehouse inventory, then shows a **stock
     check request card**: assigned to **John Smith**, Regional Parts Specialist, to
     check nearby warehouses. No stock or lead time is claimed; both are pending.
     Stage → `discussion`.

6. **Optional follow-ups at `discussion`.** Try:
   - *"Show the replacement procedure"* → the 5-step control-board swap from p.18,
     **and the composer auto-fills `@email`** (stage → `handoff`).
   - *"Start another unit"* / *"Add a note"* → other canned replies.
   - Alternatively, at any point type `@human` yourself to jump to handoff, or
     `@email` to draft an email instead.

7. **Draft the email (`@email`).** Send `@email` (or take the auto-filled path after
   the replacement procedure).
   - Agent drafts an email to the customer-support inbox. The **Email Draft** card
     shows the recipient and subject, the problem as reported, the troubleshooting
     steps completed so far, and the technician's name, role, email, and phone.
   - Choose **Send email** (approval step) or **Discard draft**. Sending shows a
     confirmation and logs the case for quality-control review. Either action ends
     this branch and locks the composer; nothing leaves the browser.

8. **Hand off (human-in-the-loop).** Before drafting the email — or from
   `discussion` — send `@human` manually.
   - Agent: *"I can't quote pricing or an install window from here, but I can route
     this to a senior controls specialist — 15 years on Carrier boards and blower
     faults. Let me brief them first…"* then *"Briefing sent — this conversation, the
     CN2 readings, the recommended part, and the manual pages are attached."* A
     **callback card** appears (SLA ~2 minutes). Stage → `callback` (composer locked).

9. **Confirm the callback.** On the callback card:
   - **"Yes, call this number"** uses the profile number, **or**
   - **"No, use a different number"** reveals a phone field → **Confirm number**.
   - Agent confirms the callback, ends the branch, and locks the composer.

**Reset** from the header clears everything back to `ask`.

## Things to point out in a demo

- Grounding: every claim ties to a manual page via a citation you can open.
- The recommendation is explicitly *not* a confirmed diagnosis ("technician verifies").
- Stock is never asserted: the agent escalates the check to **John Smith**, a named
  parts specialist, instead of pretending to query live inventory.
- The planned **Zoho** and **monday.com** marks show intended direct CRM sync; the
  right rail labels them as illustrative with no live connection.
- The agent refuses out-of-scope asks (pricing/scheduling) and routes to a **senior
  controls specialist** with a briefing rather than guessing.
- The email is a **reviewable draft**: the technician sends or discards it, and the
  reply-to contact is always included.
- The technician stays in control at each step (confirm the reading, decide to load).

## Files

| File | Role |
| --- | --- |
| `app/page.tsx` | Whole demo: stages, turn streaming, autofill, handlers, layout. |
| `components/chat-message.tsx` | Renders each message kind (text, thinking, manuals, citations, part, stock check, recommendation, callback, email). |
| `components/manual-card.tsx` | Selectable manual card + "Load N into context" button. |
| `components/activity-block.tsx` | The timed "thinking / tool call" steps. |
| `components/case-history.tsx` | Left rail: live + past cases. |
| `components/context-sidebar.tsx` | Right rail: available/loaded manuals, bookmarks, and planned CRM integrations. |
| `components/crm-integrations.tsx` | Illustrative Zoho and monday.com marks labelled as planned integration. |
| `components/part-card.tsx`, `stock-check-card.tsx`, `recommendation-card.tsx`, `callback-card.tsx`, `email-card.tsx` | The structured cards. |
| `components/pdf-modal.tsx` | PDF page viewer opened by citations/bookmarks. |
| `components/voice-controls.tsx` | Appearance-only voice-mode toggle and animated recording pill. |
| `lib/mock-data.ts` | Manuals, part, stock check, case history, activity steps, PDF pages, profile/support addresses. |
| `lib/email-draft.ts` | Builds the email subject and body from the reported problem and current stage. |
| `lib/types.ts` | `Stage`, `Message`, `MessageKind`, `EmailDraft`, etc. |
