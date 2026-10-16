# Demo — Quality Intelligence (⚠️ not routed)

**Status: this demo is committed but NOT reachable.**

- There is **no `app/quality/page.tsx`**, so `http://localhost:3000/quality` returns
  the 404 page.
- It is **not listed in `lib/demos.ts`**, so it never appears in the demo switcher.

Everything below still compiles and lints (it's included in `tsconfig`/`eslint`), it's
just not served. See [Making it live](#making-it-live) to turn it on.

## What it shows

A quality/warranty **intake and review console** for a fictional multi-company group
(ACS) whose acquired brands each keep their own legacy model names. The story:

1. A new complaint arrives as **free text** ("freon leaking at the comprssor…").
2. A **deterministic local classifier** suggests tags (product, model, failure type) and
   shows the exact words it used — or sends the ticket to a person when it's unsure.
3. A human **confirms or corrects** the tags. **Only then does the ticket join the
   records.**
4. Once several confirmed/corrected tickets line up (**same product + failure type,
   ≥3 tickets, ≥2 companies, within 30 days**), a **recurring-failure alert** fires.
5. Old free-text tickets are **backfilled** through the same classifier, and **trend
   views** rank the most common failures.

The theme: **AI suggests, a person decides, and the rules are plain and stated** — no
scores, no black box, no autopublishing.

## Making it live

Two small edits, no logic changes:

1. Create `app/quality/page.tsx`:

   ```tsx
   import { QualityDemo } from "@/quality/page";

   export default function Page() {
     return <QualityDemo />;
   }
   ```

2. Register it in `lib/demos.ts`:

   ```ts
   { slug: "quality", name: "Quality Intelligence", tagline: "…", href: "/quality", status: "live" },
   ```

> The demo's own file comments reference `app/quality/page.tsx` and a
> `docs/quality/STATUS.md` that do not exist — those are stale. `quality/page.tsx`
> exports `QualityDemo` and imports its own `./lib` and `./components`.

## Screen layout

| Region | What's there |
| --- | --- |
| Header | Demo switcher, brand, "Quality Intelligence" title, a **"Demo data / Illustrative"** badge (never claims "Online"), a hint, and **Reset Demo**. |
| Left rail — **Tickets** | **New complaint** button + every record grouped **Today / Previous 7 days / Earlier**. |
| Center | The workspace: the intake **composer**, the **ticket review** card, the **alerts** panel, the **historical records** (backfill) card, and the **trends** panel. |
| Right rail — **Evidence** | Active filters, the open alert's tickets, and the **rules** behind every count. |
| Below `lg` | The rails collapse; buttons open them as slide-over drawers. |
| Modal | Clicking a ticket opens a citation-style modal with the matched words highlighted. |

## The rules (all plain-language, all in one place)

From `lib/thresholds.ts` and `lib/selectors/records.ts`:

- **Alert rule:** `ALERT_MIN_TICKETS` (3) **+** distinct tickets, same canonical product
  and failure type, dated within a rolling **30 days** of the demo clock, across
  `ALERT_MIN_COMPANIES` (2) **+** companies.
- **Counting rule:** a ticket counts once it has a product **and** failure type and is
  `suggested`, `confirmed`, or `corrected`. Needs-review/unclassified wait for a person.
- **Duplicate rule:** same company + same normalized text, or a seeded `duplicateOf`
  link, is merged into one ticket **before** counting.
- **Caveat on every alert:** *"A lead for investigation, not proof of root cause."*
- **View filters** (company, time range) affect trends and counters only — **alerts
  ignore filters** and always use their own 30-day window.

## The demo clock

`DEMO_NOW = "2026-10-14"` (`lib/time.ts`). Every window, filter and date group is
measured from this fixed date (never the real clock) so the story is identical on every
run. All data is synthetic and fictional.

---

# Click-by-click walkthrough

## 1. Confirm a complaint → fire an alert

1. Left rail → **New complaint**. In the composer, click **Try sample** (fills in a
   Cascade Comfort warranty complaint: CC-410S, freon leaking at the compressor).
2. Click **Classify**. The **ticket review** card appears, labelled *"Incoming
   complaint · Q-026 · not yet in records"*:
   - Left: the **original words** with matched spans highlighted.
   - Right: **suggested tags** — Product *3-ton split AC condenser*, Model *CC-410S*,
     Failure type *Compressor leak* — plus the **classification steps** (rules that
     fired) and the classifier version.
3. Click **Confirm** (or **Correct**/**Set tags** to change the tags first). The ticket
   **joins the records** dated today, and the center now shows it as **Q-026**.
4. The **Recurring failure alerts** panel now shows exactly **one alert**: *Compressor
   leak · 3-ton split AC condenser*, **3 tickets · 3 companies** (Apex, Northfield,
   Cascade). Expand it to see the example tickets (newest first) and the rule text.

> Before you confirm, there is **no** alert: only two compressor-leak tickets count
> (both inside the window, one company each). The sample is the third, from a third
> company — that's what crosses the threshold.

## 2. Work an alert

- Expand the alert → click an **example ticket** to open the **ticket modal** (original
  text with highlighted matched words, tags, provenance).
- Click **Flag for engineering review**. This is **demo-only** — it marks the card
  ("Demo / not submitted") and creates nothing; the chip says so explicitly.
- With an alert expanded, the right **Evidence** rail lists **Alert tickets** and the
  **Rule applied** (alert/duplicates/counting wording).

> Note the **non-alert**: three **coil-leak** tickets exist on one product but from a
> **single** company (Northfield), so they never alert. Also, "board faults" appear
> across three companies but on **different products**, so they don't group.

## 3. Backfill the historical records

1. Center → **Historical records** card. It shows Total / Suggested / Needs review /
   Not yet read over the old free-text tickets.
2. Click **Classify historical tickets**. The same classifier runs over every old
   free-text record. Each lands as **Suggested** or **Needs review** (never confirmed);
   the original words are untouched.
3. Open any historical ticket in the left rail and **Confirm** or **Correct** it.
   Confirming a `suggested` ticket doesn't change counts but removes the "unconfirmed"
   note; correcting re-tags it and every count/alert recomputes.
   - The backfill does **not** create new alerts: the older compressor leaks fall
     outside the 30-day window (they only feed trends), and Q-003 merges as a duplicate
     of Q-001.

## 4. Read the trends

- Center → **Most common failures**. Toggle **By product** / **By company**.
- Change the **Company** filter and the **Time range** (Last 30 days / 90 days / All).
  The **Evidence** rail's "Active filters" updates to match.
- Each row shows a count bar, an **Alert** chip when that product+failure is firing an
  alert, and an "unconfirmed" note when some counted tickets are still suggestions.

## 5. Reset

Header → **Reset Demo** returns to the seed story (and clears filters, alerts, the open
ticket, the draft, and any flags).

---

# Architecture

Clean, testable separation — worth knowing if you extend it:

- **Contracts** (`lib/contracts.ts`) — the shared shapes (`Ticket`, `QualityAlert`,
  `ClassifyRequest/Response`, `Filters`). These are what a real PLM/Support system
  would consume.
- **Catalog** (`lib/data/catalog.ts`) — fictional companies, canonical products, each
  company's legacy model aliases, and the forced-choice failure list.
- **Classifier** (`lib/classifier/`) — `local.ts` + `rules.ts` behind one `Classifier`
  interface (`index.ts`). Deterministic keyword rules, **not** a model; every tag comes
  with the exact words that produced it. **Swap-point** for a trained/LLM classifier.
- **Selectors** (`lib/selectors/`) — pure functions: `records.ts` (dedupe, counting,
  filters, counters), `alerts.ts` (the alert rule + evidence), `trends.ts` (ranked
  views). Every number on screen is selector output.
- **State** (`lib/state/`) — a pure `qualityReducer` + a `useSyncExternalStore` wrapper.
  Records live in state; **counts/trends/alerts are recomputed after every action**.
- **Components** (`components/`) — presentation only.

## The classifier, briefly

- **Product**: legacy model aliases resolve to one canonical product (loose matching:
  case, spaces, dashes). If models from two different products are named, the product
  is left for a person rather than picking one.
- **Failure**: cue rules fire per clause; a **negation** word cancels a symptom
  (`"no leak found"` does not tag a leak); an **located** leak suppresses the
  "refrigerant low" cue. Two competing cues → list the options, let the person choose.
- **Outcomes**: `suggested` when confident, `needs_review` with a reason otherwise
  (`no_failure_cue`, `negated`, `competing_cues`, `product_unresolved`, `empty_text`).

# Files

| File | Role |
| --- | --- |
| `page.tsx` | `QualityDemo` — header, rails, center workspace, mobile drawers, modal. |
| `lib/contracts.ts` | Shared types/records. |
| `lib/thresholds.ts` | Alert constants + user-facing rule text. |
| `lib/time.ts` | `DEMO_NOW`, day math, date groups. |
| `lib/data/catalog.ts` | Companies, products, model aliases, failure types. |
| `lib/data/synthetic.ts` | Seed tickets + the "Try sample" complaint. |
| `lib/classifier/{index,local,rules}.ts` | The active classifier and its rules. |
| `lib/selectors/{records,alerts,trends}.ts` | Pure counting/alert/trend logic. |
| `lib/state/{reducer,store}.ts` | Pure reducer + React store. |
| `components/composer.tsx` | New-complaint intake form. |
| `components/ticket-review.tsx`, `correction-form.tsx`, `classification-steps.tsx` | Review/confirm/correct. |
| `components/alerts-panel.tsx`, `trends-panel.tsx`, `backfill-card.tsx` | Center panels. |
| `components/ticket-rail.tsx`, `evidence-rail.tsx`, `mobile-drawer.tsx` | Rails + responsive drawers. |
| `components/ticket-modal.tsx` | Citation-style ticket modal. |
| `components/quality-header.tsx` | Top bar. |
| `components/ui.tsx` | Shared chips/tags/buttons/labels. |

# Tests

The rules are covered by `node:test` suites:

- `lib/tests/classifier.test.ts` — clear complaints get tagged; unclear ones go to a
  person, with evidence.
- `lib/tests/selectors.test.ts` — the seed story, the alert rule, the counting rule,
  and the views.

There is **no npm script** for these. The suites use extensionless TS imports, so they
need a TypeScript-capable loader (`lib/tests/register-ts.mjs` is a resolve hook for
that):

```bash
node --import ./quality/lib/tests/register-ts.mjs --test quality/lib/tests/*.test.ts
```

> On the current dev machine (Node `v22.22.1`) this fails with
> `ERR_NO_TYPESCRIPT` ("Node.js is not compiled with TypeScript support"). Run it under
> a Node build with type stripping (or `tsx`), and consider adding a `test` script to
> `package.json`.
