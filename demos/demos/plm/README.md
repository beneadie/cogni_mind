# Demo — Product Data / PLM ("Product Data Copilot")

**Route:** `/plm` → thin wrapper at `app/plm/page.tsx` → renders `demos/plm/page.tsx`.
**Code:** everything under `demos/plm/` (`page.tsx`, `lib/`, `components/`).

## What it shows

The demo opens as a normal chat, not a pre-filled inbox. The user asks the
copilot to draft a new HVAC data sheet, uploads an engineering spec, and watches
the agent:

1. read the spec and draft the standard data sheet,
2. flag missing, conflicting, and uncertain values for a human,
3. delegate specialist checks to subagents,
4. create **alerts** as each specialist discovers a downstream problem.

The two alerts are the payoff:

- **Documentation mismatch** — the draft from spec rev C requires 3-wire
  control; the installation manual and published sheet still show 2-wire.
- **Compliance alert** — the draft lists R-410A, which is banned from 2027.

From there the demo continues into the existing work flows: edit/publish the
manual, propagate the change to downstream documents, and mitigate the
compliance exposure. Nothing publishes without a human.

Core theme: **the agent earns the right-hand panel.** The Alerts rail starts
empty and fills only after the audit finds something.

## Screen layout

| Region | What's there |
| --- | --- |
| Header | Brand, title "HVAC Product Data Copilot", demo switcher, Reset. |
| Progress strip | Hidden at the start; shows **Data Sheet Audit** once the upload begins. |
| Left rail — **Ask** | Historical conversation starters. Intentionally left as-is: these are old examples and remain clickable. |
| Center | The chat: upload card, draft sheet, subagent research, alert notifications, and the working flows. |
| Right rail | Tabs: **Alerts** (the queue) and **Workspace** (documents in context and references). |

### Start state

- A fresh chat is active; the left rail shows the historical conversations.
- The composer auto-fills **"Draft the MAA-200 data sheet from the new spec."**
  when clicked.
- The Alerts tab is empty: *"No alerts yet. I'll add them here when the spec
  audit finds something."*
- No field report or compliance item is pre-seeded.

## The seed flow

### 1. Ask

Click the composer → it types *"Draft the MAA-200 data sheet from the new
spec."* → **Enter**.

The agent asks for the file and shows a **hollow cloud upload dropzone**. The
dropzone supports drag-and-drop and opens a **Windows 11-style file explorer**.
The sample file is `public/manuals/maa-200-spec.pdf`, shown in the explorer as
`MAA-200_spec_revC.pdf`.

The explorer is deliberately a single-file Windows 11 window: tab bar, command
bar, address bar, Quick access navigation, details columns, and a status bar.
Only the sample engineering spec is listed. Clicking the file or **Open** runs a
short upload progress before closing.

### 2. Upload + draft

After upload, the agent:

- reads the spec (6 pages),
- runs OCR and drafts 12 fields into the standard HVAC data-sheet template,
- cross-checks the draft against published rev B,
- flags four values that need a human: missing weight and warranty, conflicting
  control wiring, and an uncertain refrigerant-charge read.

It then shows the **Draft data sheet · MAA-200** card with provenance for each
field. The R-410A refrigerant and 3-wire control rows are highlighted, and the
missing/uncertain rows show their suggested source.

### 3. Delegate

The agent launches three specialists side by side in a single light
**orchestration panel**. The three lanes use the same cube loaders, timed
research nodes, pulsing agent icons, and inline findings as the main work
stream. Steps cascade down each lane slowly enough to read:

| Specialist | What it checks | Discovery |
| --- | --- | --- |
| Compliance agent | Refrigerant, 2027 rules, ERP BOM, shipped units/open orders | R-410A banned 1 Jan 2027; 8,400 shipped, 1,200 open |
| Manuals & drawings agent | Installation manual rev A §7.2 and reference drawings | Manual says 2-wire; draft/spec require 3-wire |
| Published data sheet agent | Published rev B control wiring and revision history | Customers still see rev B; the new draft is rev D |

### 4. Reactive alerts

Alerts are created **as each discovery lands**, not in a batch at the end:

- Compliance alert appears first.
- The documentation alert appears when both the manual and published-sheet
  agents finish.

Each alert produces a **New alert created** card in the chat and an animated
**New** badge in the Alerts rail. The composer is locked during the research and
while a decision card is waiting.

### 5. Audit summary, review, and publish

The seed closes with a short narrative and an **Audit summary** card:

- `6` pages read, `12` fields drafted, `4` values need review, `2` alerts.
- **Data sheet** — the spec left missing and conflicting values; weight and
  warranty came from other sources, control wiring conflicts with rev B, and the
  refrigerant charge needs a second read.
- **Documentation** — manual §7.2 and the published sheet still show 2-wire;
  the §7.2 change touches 3 related documents.
- **Compliance** — MAA-200 and NA-1500 use R-410A; 14,400 units shipped and
  2,100 open orders.

The alert rows are informational; only the data-sheet review is an in-chat
action.

1. **Review data sheet** opens the review card with the four flagged values.
   Each row is labelled **Missing**, **Conflict**, **Low confidence**, or
   **From last sheet**. Confirm or change them, then **Publish rev D**. The
   sheet is published, the Workspace flips to rev D, and a publish-summary card
   lists the final values. Typing **"Review the data sheet"** also opens it.
2. Open the **Documentation** alert from the Alerts rail to jump to the §7.2
   change proposal and its document updates.
3. Open the **Compliance** alert from the Alerts rail to jump to the ACS
   regulation card, the MAA-200 product dossier, and the mitigation prompts.

## Working the alerts

### Documentation mismatch

1. Click the alert (or **Review alert**). The agent compares §7.2 against the
   draft and spec, shows a finding, and opens a **change-proposal card**
   with **ECR-2026-0142**.
2. Choose:
   - **Send proposal** → sends the §7.2 proposal to the Docs team, moves the
     alert to **Tracking**, and injects the **Document updates** alert. The
     manual stays at rev A until the owner accepts.
   - **Edit** → opens an inline textarea with the full proposed change. Save
     updates the proposal wording; Cancel restores it.
   - **Reject** → the alert is **Declined** and §7.2 is left for manual review.
3. **Document updates** → the affected-documents card groups the three
   documents. **Send 3 proposals** sends the §7.2 proposal to the Web team for
   the product page and sell sheet, and to the Docs team for the data sheet.
   Each owner applies the change in their own system; nothing is edited in-app.

### Compliance alert

1. Click the alert. The agent shows the **regulation card** for MAA-200 and
   NA-1500, ranked by units shipped.
2. **View product** pulls the MAA-200 dossier into the **Workspace** tab.
3. Use the suggested replies: **Set a reminder**, **Close issue**, or **Send to
   responsible person**. The alert moves to Tracking, except **Close issue**,
   which resolves it.

When every alert is handled, the **Audit complete / Alerts handled** summary
appears in the chat and the composer locks.

## Composer behavior

- The composer auto-fills the expected prompt for the current stage when you
  click it and no decision card is waiting. The seed prompt is *"Draft the
  MAA-200 data sheet from the new spec."* At `done`, the composer locks and does
  not auto-fill another flow; start another conversation or reset.
- A **paperclip button** inside the composer opens the same file explorer, so the
  presenter can attach the engineering spec directly without waiting for the
  in-chat upload card. It is active in the fresh chat and upload step, and
  disabled while the agent is researching or another flow is active.
- The upload card drives the next step; drafting starts automatically after the
  file lands.
- The composer is disabled while a decision card is waiting: upload, data-sheet
  review, queue actions, and manual review. Use the card to continue.
- At the end of the audit, clicking the composer offers *"Review the
  documentation mismatch."* Once every alert is cleared, the summary appears and
  the composer locks.
- The old left-rail conversations still use their own prompts and flows, but
  completed ingest runs also end at the locked `done` state.

## Historical conversation starters (left rail)

These remain available and unchanged; they are useful for showing the broader
product-data surface, but they are not the default story:

- **Create / check a data sheet** — the older DL-2400 spec → data sheet flow.
- **Documentation Health** — the older DL Series health check.
- **Regulation Risk** — the older DL Series RoHS/Chrome scan.
- **Legacy Part Search** — the older archived-drawing search.
- **Ingest & Connect** — the six-supplier-catalog reconciliation.

## Cards you'll see

- **File upload / explorer** (`file-upload.tsx`): hollow dropzone, one-file
  Windows 11 explorer, upload progress, and the uploaded-file success state.
- **Draft data sheet** (`extracted-sheet.tsx`): the drafted standard fields with
  provenance and missing/conflicting notes.
- **Subagents** (`subagent-run.tsx`): a light orchestration panel with three
  side-by-side lanes, cube loaders, pulsing agents, slowly cascading research
  nodes, and inline findings.
- **Audit summary / review / published** (`audit-summary.tsx`): the final
  synthesis, the four-value review with missing/conflict/uncertain labels, and
  the rev D publish summary.
- **Alert created** (`alert-created.tsx`): the chat notification linking to the
  new Alerts item.
- **Existing cards**: change proposal, doc diff, document updates, regulation,
  suggested replies, and the queue summary.

## Files

| File | Role |
| --- | --- |
| `page.tsx` | Start state, audit orchestration, upload/alert callbacks, existing queue flows, layout. |
| `lib/flow.ts` | `PlmStage`, message kinds, `SubagentSpec`, audit greeting/prompt, expected inputs, flow steps. |
| `lib/audit-data.ts` | Sample spec, drafted MAA-200 fields, flagged review values, publish changes, three subagent scripts. |
| `lib/audit-turns.ts` | Intro/upload, draft/flag, subagent, and publish turns. |
| `components/file-upload.tsx` | Dropzone + Windows 11 single-file explorer. |
| `components/subagent-run.tsx` | Light orchestration console with timed agents. |
| `components/extracted-sheet.tsx` | Draft data-sheet card. |
| `components/audit-summary.tsx` | Audit summary, flagged-value review, and publish summary. |
| `components/alert-created.tsx` | New-alert notification card. |
| `lib/queue-data.ts` | Empty starting queue, generated documentation/compliance alerts, document updates item. |
| `lib/queue-turns.ts` | Documentation change, compliance, and document update turns. |
| `components/open-items-panel.tsx` | Right-rail **Alerts** panel, empty state, New badges. |
| `components/workspace-panel.tsx` | Workspace documents, including the uploaded engineering spec. |
| `public/manuals/maa-200-spec.pdf` | The sample engineering spec and the only file in the explorer. |

**Reset** from the header returns to the fresh chat, clears the alerts, and
restores the starting state.
