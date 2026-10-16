# Demo — Product Data / PLM ("Product Care Inbox")

**Route:** `/plm` → thin wrapper at `app/plm/page.tsx` → renders `demos/plm/page.tsx`.
**Code:** everything under `demos/plm/` (`page.tsx`, `lib/`, `components/`).

## What it shows

A product-data copilot that works **across conversations** on one product family
(the DL-2400 brass door latch and the ACS product group). It shows two kinds of AI
work sitting side by side:

- **Ask** — you pull: turn a scanned spec into a governed data sheet, check
  documentation health, scan regulation exposure, find legacy parts, ingest supplier
  catalogs. These are the classic "chat with the agent" use cases.
- **Open items** — the system pushes: a queue of things that *found you* (a field
  report, a compliance alert, a change-propagation task). Working the queue turns
  signals into governed change: ECR/ECN, where-used impact, dispositions, compliance
  mitigation, downstream doc updates.

Core theme: **nothing publishes without a human**, and every value traces back to a
source.

## Screen layout

| Region | What's there |
| --- | --- |
| Header | Brand, title "PLM Product Care Copilot", demo switcher, Reset. |
| Progress strip (under header) | The current flow's step rail (see below); hidden on the launcher. |
| Left rail — **Ask** | "New conversation" + the five session starters. |
| Center | The conversation: work streams, cards, drawers. |
| Right rail | Tabs: **Open items** (the queue) and **Workspace** (documents in context + references). |

### The two "modes"

- **Ask mode** = the left **Ask** rail. Selecting a session resets the chat, greets
  you, and **auto-types that session's query into the composer** (press Enter to run).
- **Open-items mode** = clicking a card in the right **Open items** tab. It resets the
  chat and streams that item's opening turn.

The composer also **auto-types the expected reply** for the current stage when you
click an empty box (like the HVAC demo). It does *not* auto-fill while an open-items
item is active or during a queue stage.

### Progress-strip flows

Defined in `lib/flow.ts` (`FLOW_STEPS`):

- **Spec → Data Sheet** — Ingest → Extract & Verify → Resolve → Approve → Propagate
- **Documentation Health** — Health → Draft → Review → Publish
- **Ingest & Connect** — Connect → Understand → Reconcile → Deliver
- **Product Care** — Review → Apply → Resolve

---

# Part A — Ask mode (left rail)

Click a session in the **Ask** rail, then press **Enter** when the composer finishes
auto-typing. Each entry below lists the steps and what to expect.

## A1. Create / check a data sheet → *"Turn the DL-2400 spec into a data sheet."*

This is the flagship flow.

1. **Ingest.** Agent connects to the document vault, fetches the scanned
   `DL-2400_revC.pdf` (an **upload card** you can click to open the PDF), fetches the
   published `DL-2400_datasheet_2019.pdf` and the ERP BOM (both **source cards**), and
   notes the three sources are now in the Workspace.
2. **Extract.** Send *"Extract attributes"* (auto-filled). Agent runs OCR, fills the
   12-field template, cross-checks the published sheet, and opens the **data sheet
   card** + **exceptions card**. Five fields need a decision: **Warranty**
   (carried-over), **Weight** (missing), **Fire Rating** (missing), **Throw**
   (conflict: 0.75 in vs 0.625 in), **Cycle Rating** (low-confidence OCR).
   - Click a row to trace it to the spec line; click a **source chip** to highlight the
     source in the document viewer.
3. **Resolve.** Send *"Let's go through the exceptions one by one."* The agent walks
   each field in order (`RESOLUTION_ORDER`), researches it, proposes a value with a
   source, and asks to apply it. Confirm with the auto-filled *"Yes, apply that
   value."* (or type your own value — a short non-"yes" reply is taken as the value).
   - You can also **open any flagged row → the flag drawer** and use its buttons
     (preset values, **Enter value**, Defer). Resolved values render back onto the data
     sheet (e.g. Weight shows "1.2 lbs").
4. **Approve.** When all five are resolved, the agent shows an **approval card**: the
   change set (`5 changed`). Send *"Approve & publish"*.
5. **Propagate.** Agent publishes the sheet as **rev D** and finds **3 documents are
   now stale**. It offers to bring the installation manual current → send *"Update the
   installation manual."* This switches to the docs flow (see A2, steps from Draft).

## A2. Documentation Health → *"What documents are out of date?"*

- Agent indexes the DL Series registry and diffs each doc against spec rev C: **3
  stale** (installation manual trails **4 revisions**), shown in a **doc-health card**.
- Reply *"Update this manual"* → **Draft**: agent diffs the rev A installation manual
  against approved spec rev C and shows a **diff card** + **manual-changes card**
  (4 changes: Latch Throw, Strike Plate, Throw Adjustment added, legacy Torque step
  removed).
- **Review**: open each changed row in the **flag drawer** and accept/keep/edit. When
  all manual changes are resolved, publishing runs automatically.
- **Publish**: applies changes, republishes the manual as **rev C**, shows the
  publish summary, and marks "the loop is closed."

## A3. Regulation Risk → *"Show regulation risk across the portfolio."*

- Agent loads RoHS 2027 (Pb · Cd · Cr6) and EU Chrome Restriction 2026 (Cr), matches
  the BOM, and ranks exposure by **units shipped** → **regulation card** (a sortable
  product table with **Units shipped** and **Open orders** columns). DL-2400 is the
  top exposure (lead in C36000 brass, 5,200 units shipped).
- Each row has **View product** → the agent pulls the product's dossier into the
  **Workspace** (see B3) and offers mitigation options.
- Follow-up *"Why is DL-2400 high risk?"* → explains the lead-in-brass reason.

## A4. Legacy Part Search → *"Find a brass latch, 2-3/8 backset, 1980s."*

- Agent parses the request into attributes (material=brass · backset=2.375 in ·
  era=1980s), searches archived drawings, and scores matches → **legacy card**.
  DL-2400 is a 96% match.
- Follow-up *"Check regulation risk for DL-2400"* jumps to the regulation flow.

## A5. Ingest & Connect → *"Connect our supplier catalogs into one master."*

- **Connect**: pulls six supplier catalogs into one landing zone (raw rows) →
  **connections card**. Send *"Survey what you pulled."*
- **Understand**: detects the six dialects and the traps — German `µF` vs `MFD`,
  comma decimals, EUR pricing → **ingest-notes card**. Send *"Reconcile the records
  into one master."*
- **Reconcile**: matches 3,873 rows down to 1,500 parts, flags one ambiguous fan
  blade for a human → **master card** ("Master published").

---

# Part B — Open-items mode (right rail)

Click **Open items** in the right rail, then click a card. The queue starts with two
items and a third is injected by the cascade.

| Item | Severity | Scope | Summary |
| --- | --- | --- | --- |
| Field report | red | MAA-200 | "Wiring diagram on §7.2 doesn't match the unit" |
| Compliance alert | amber | ACS Group | "2 products exposed to the 2027 refrigerant ban" |
| Change propagation *(injected)* | amber | MAA-200 | "§7.2 change leaves 3 documents stale" |

Item cards show severity (Action needed / Review) when open, and a status
(Tracking / Resolved / Declined / Acknowledged) once closed; closed items move under
**Closed**.

## B1. Field report → documentation change

1. Click **Field report**. Agent reports the mismatch (manual §7.2 shows 2 wires, unit
   has 3), then a **finding** callout: *"**The technician is right** — the manual is
   two revisions behind the rev C spec."*
2. A **change-proposal card** appears: proposed change **ECR-2026-0142**, the count of
   other affected documents, the current manual vs current spec, a **line-level diff**
   (2-wire → 3-wire), and buttons **Open manual §7.2** / **Open spec §7.2** (open the
   sample PDFs).
3. Choose an action:
   - **Approve and apply** → agent publishes the manual to **rev C** and closes the
     change request as **ECN-2026-0088**, notifies case **CS-4821**, and **injects the
     Change propagation item** ("3 documents now stale"). The field-report item moves
     to **Resolved**.
   - **Edit** → opens the `wire-manual` **flag drawer** (change §7.2 to the 3-wire
     diagram).
   - **Reject** → item becomes **Declined**; §7.2 is flagged for manual review.

## B2. Change propagation → update downstream literature

1. Click **Change propagation** (appears after B1). Agent finds every document that
   used §7.2: **3 documents** → **propagation card** grouping them by how they're
   handled — *AI can update these automatically* (Product Page, Sell Sheet) and
   *A person needs to edit these* (Data Sheet, with an **Open file** link).
2. Click **Approve — update 2, task 1** → the 2 reusable docs are updated
   automatically and **TASK-7781** is raised for the Docs team. Item moves to
   **Resolved**.

## B3. Compliance alert → mitigation

1. Click **Compliance alert**. Agent checks the ACS catalog against the 2027
   refrigerant ban → **regulation card** listing MAA-200 and NA-1500 (both high risk,
   R-410A), ranked by **units shipped**.
2. **View product** runs a short fetch work-stream and drops everything on file into
   the right-rail **Workspace** (grouped under the product: item master, BOM, substance
   declaration, shipped units & open orders, compliance file, spec/data sheet/manual,
   open cases — openable ones link to the sample PDFs). The rail switches to the
   **Workspace** tab automatically.
3. Chat ends with a **finding** callout and four **suggested-reply chips**:
   - **Open change request** → opens **CR-118**, assigns the owner, sets a review
     reminder for **1 Sep 2026**; item → **Tracking**.
   - **Request declaration** → requests a full material declaration (FMD);
     item → **Tracking**.
   - **Set a reminder** → reminder for **1 Sep 2026**; item → **Tracking**.
   - **Acknowledge risk** → records an accepted risk with rationale; item →
     **Acknowledged**.
4. The finding states **units**, not dollars: *"ERP shows 8,400 units shipped in the
   last 12 months with 1,200 on open orders."* The ban takes effect **1 Jan 2027**
   (`deadline` per row; DL RoHS rows use the same date, EU Chrome rows **1 Jul 2026**).

## Closing the queue

When every item is closed, a **Queue summary card** appears ("Queue cleared") listing
the outcomes, with a **Start a new conversation** button.

---

# Cards you'll see

All card renderers live in `components/plm-cards.tsx`, `components/queue-cards.tsx`,
and the dispatcher `components/plm-message.tsx`.

- **Work stream** (`agent-stream.tsx`): the timed thought → action → observe beats.
- **Upload / Source** cards: the ingested files (clickable → PDF viewer).
- **Data sheet**, **Data-sheet diff**, **Exceptions**: the extracted sheet with
  provenance; rows open the flag drawer.
- **Proposal** (`proposalId`), **Approval**: the resolution proposal and the
  sign-off change set.
- **Propagation / doc-health / regulation / legacy / connections / ingest-notes /
  master**: the per-flow result cards.
- **Finding**: a gold callout that bolds the key phrase.
- **Change-proposal / queue-propagation / queue-regulation / prompts /
  queue-summary**: the inbox cards. **Prompts** are the clickable suggested-reply
  chips that dispatch a mitigation action.
- **Workspace** (`workspace-panel.tsx`): documents in context plus product-grouped
  dossier records; records with a linked PDF open the viewer.
- **Flag drawer** (`flag-drawer.tsx`): right-side sheet to resolve a field/change with
  preset buttons, **Enter value**, or **Defer**.
- **Document viewer** (`document-viewer.tsx`): structured spec/manual view with
  source highlighting. **PDF viewer** (`pdf-modal.tsx`): the sample PDFs.

# Mock data, IDs, and glossary

**Products / brands** (`lib/risk-catalog.ts`): the DL Series (DL-2400 latch + siblings,
*Above Air*) and MAA-200 / NA-1500 (*Marvair* / *Northern Air*, R-410A). Exposure is
measured in **units shipped** and **open orders** (no revenue). `queue-data.ts`
re-exports the ACS subset as `complianceProducts`; `demoData.ts` re-exports the DL
subset as `regulationRisks`. Brand names are illustrative.

**Recurring IDs**

| ID | Meaning |
| --- | --- |
| `ECR-2026-0142` | Engineering change **request** raised from the field report. |
| `ECN-2026-0088` | Engineering change **notice** that closes it. |
| `CR-118` | Change request opened for the compliance mitigation. |
| `TASK-7781` | Authoring task raised by propagation (Docs team). |
| `CS-4821` | Field technician's case. |
| `1 Jan 2027` / `1 Sep 2026` | Refrigerant/RoHS deadline / review reminder date. |
| `1 Jul 2026` | EU Chrome Restriction deadline. |

**Glossary**

- **ECR / ECN**: change request → change notice (approve = implement).
- **Where-used**: which other documents reference a changed section.
- **Disposition**: how a downstream doc is handled — auto-update, author, review, none.
- **Effectivity / rev**: the revision a change takes effect in (e.g. manual rev C,
  sheet rev D).
- **FMD / substance declaration**: a supplier's full material declaration for
  compliance.
- **Propagation**: pushing an approved upstream change to stale downstream docs.

# Files

| File | Role |
| --- | --- |
| `page.tsx` | Orchestration: stages, sessions, queue actions, resolution, handlers, layout. |
| `lib/flow.ts` | `PlmStage`, `PlmMessage` kinds, `sessions`, `EXPECTED_INPUT`, `PLACEHOLDERS`, `FLOW_STEPS`. |
| `lib/turns.ts` | Ask-mode turn scripts (`specIngestTurn`, `extractTurn`, `resolutionTurn`, `verifyTurn`, `publishTurn`, `healthTurn`, `manualDraftTurn`, `manualPublishTurn`, `regulationTurn`, `legacyTurn`, ingest turns) + `RESOLUTIONS`. |
| `lib/queue-data.ts` | Queue items, impact rows, IDs/dates; re-exports ACS risk products. |
| `lib/risk-catalog.ts` | The authoritative risk list (ACS + DL), `riskRecord`, and per-product `productDossiers`. |
| `lib/queue-turns.ts` | Open-items turn scripts (field report/approve, propagation/apply, view-product, compliance-act). |
| `lib/demoData.ts` | Spec doc, data-sheet rows, flag details/actions, manual draft, health/regulation/legacy data. |
| `lib/types.ts` | Queue types, `ComplianceAction`, `ImpactRow`, `FlagAction`, `ResolvedValues`, etc. |
| `lib/pdf-pages.ts` | The sample PDF files/pages used by the viewer. |
| `lib/ingest-data.ts` | The six supplier-catalog systems + dialects. |
| `lib/use-agent-turns.ts` | The beat-streaming engine for the conversation. |
| `components/plm-message.tsx` | Dispatches each message kind to its card. |
| `components/plm-cards.tsx`, `queue-cards.tsx` | The card renderers. |
| `components/suggested-replies.tsx` | The clickable mitigation chips (`kind: "prompts"`). |
| `components/open-items-panel.tsx` | The right-rail queue. |
| `components/workspace-panel.tsx` | The right-rail Workspace (grouped product dossiers + references). |
| `components/session-rail.tsx` | The left "Ask" rail. |
| `components/progress-strip.tsx` | The flow step rail. |
| `components/flag-drawer.tsx`, `data-sheet-table.tsx`, `manual-draft-table.tsx`, `template-fields.tsx` | Resolution UI. |
| `components/document-viewer.tsx`, `pdf-modal.tsx` | Source viewers. |

**Reset** from the header returns to the launcher and restores the starting queue.
