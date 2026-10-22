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

The audit adds two alerts:

- **Documentation mismatch** — the draft from spec rev C requires 3-wire
  control; the installation manual and published sheet still show 2-wire.
- **Compliance alert** — the draft lists R-410A, which is subject to an
  upcoming refrigerant ban.

A third escalation is already waiting when the demo opens:

- **Pricing Mismatch Escalation** — the same `CP-31K` compressor is priced at
  $320 through Delta and $400 through Summit across MAA-200 and NA-1500.

From there the demo continues into the existing work flows: edit/publish the
manual, propagate the change to downstream documents, mitigate the compliance
exposure, and decide the supplier pricing call. Nothing publishes or changes in
the source systems without a human.

Core theme: **the agent earns the right-hand panel.** The Alerts rail starts
with one existing pricing escalation and fills further after the audit finds
something.

Future compliance deadlines and the review reminder are derived from the current
date at runtime; historical document dates remain static.

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
- The composer auto-fills **"Draft a data sheet from the new spec."** when
  clicked.
- The Alerts tab already shows the **Pricing Mismatch Escalation** for `CP-31K`,
  without a **New** badge.
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

Before launching the specialists, the agent asks for permission with **Allow
once**, **Allow always**, and **Don't allow**:

- **Allow once** runs the checks without remembering the permission.
- **Allow always** remembers it for this session and shows **Permission
  remembered** in the Orchestrator.
- **Don't allow** skips the checks, creates no alerts, and leaves the draft
  summary/review available.

After permission is granted, the agent launches three specialists side by side
in a single light **orchestration panel**. The three lanes use the same cube loaders, timed
research nodes, pulsing agent icons, and inline findings as the main work
stream. Steps cascade down each lane slowly enough to read:

| Specialist | What it checks | Discovery |
| --- | --- | --- |
| Compliance agent | Refrigerant rules, ERP BOM, shipped units/open orders | R-410A ban with a future effective date; 8,400 shipped, 1,200 open |
| Manuals & drawings agent | Installation manual rev A §7.2 and reference drawings | Manual says 2-wire; draft/spec require 3-wire |
| Published data sheet agent | Published rev B control wiring and revision history | Customers still see rev B; the new draft is rev D |

### 4. Reactive alerts

Alerts are created **as each discovery lands**, not in a batch at the end:

- Compliance alert appears first.
- The documentation alert appears when both the manual and published-sheet
  agents finish.

Each alert produces a **New alert created** card in the chat and an animated
**New** badge in the Alerts rail. The composer is locked during the permission
request, the research, and while a decision card is waiting.

### 5. Audit summary, review, and publish

The seed closes with a short narrative and an **Audit summary** card focused on
the data sheet. The two audit alerts stay above it in their own notification
cards.

- `6` pages read, `12` fields drafted, `4` values need review.
- **Data sheet** — the spec left missing and conflicting values; weight and
  warranty came from other sources, control wiring conflicts with rev B, and the
  refrigerant charge needs a second read.

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

### Pricing Mismatch Escalation

1. The alert is already open when the demo starts. Click it to see the
   `CP-31K` compressor used by MAA-200 and NA-1500, with Delta at $320/unit and
   Summit at $400/unit. Both vendor records are active because each BOM points
   to a different supplier.
2. The card shows the 2,400 units affected, the $80/unit gap, the annual impact,
   and the supply tradeoff: Delta has the lower price but an 8-week lead and
   covers about 65% of peak; Summit covers 100% with a 4-week lead.
3. Choose one call:
   - **Keep both suppliers** — records the supply-cover rationale, leaves the
     gap in place, and records the outcome as **Acknowledged**.
   - **Consolidate on Delta** — opens a procurement change request at $320/unit,
     with capacity confirmation and the effective date tracked.
   - **Consolidate on Summit** — opens a procurement change request at
     $400/unit, closing the mismatch while retaining full peak coverage.
4. The decision record is added to the **Workspace**, and the alert is marked
   **Resolved**. No price is changed in the source system.

### Documentation mismatch

1. Click the alert (or **Review alert**). The agent compares §7.2 against the
   draft and spec, shows a finding, and opens a **change-proposal card**
   with a current-year ECR ID.
2. Choose:
   - **Send proposal** → sends the §7.2 proposal to the Docs team, moves the
     alert to **Tracking**, and injects the **Document updates** alert. The
     manual stays at rev A until the owner accepts.
   - **Edit page** → opens an inline editor for the full page 14 content
     (heading, callout, and body lines). Save regenerates the red/green line
     diff; Cancel restores the last saved page.
   - **Reject** → the alert is **Declined** and §7.2 is left for manual review.
3. **Document updates** → the affected-documents card suggests the three
   recipient teams, all selected by default. Deselect any team you don't want
   to notify, then send the remaining proposals:
   - Before sending, the agent asks for permission for the selected owners.
   - **Allow once** sends this batch without remembering the teams.
   - **Allow always** remembers those owners for the session and shows
     **Permission remembered** on the card.
   - **Don't allow** sends nothing and leaves the alert open.
   - Sent rows show **Sent**.
   - The alert stays open while any document still needs a proposal.
   - **Cancel** sends nothing further and leaves the alert open.
   - When every document is sent, the alert moves to **Tracking**.
   Each owner applies the change in their own system; nothing is edited in-app.

### Compliance alert

1. Click the alert. The agent opens one compact **Compliance case** for
   MAA-200 and NA-1500. MAA-200 is marked **Highest** and selected first.
2. The case uses product tabs, so you can switch between MAA-200 and NA-1500
   without going back to the alert. Switching loads that product's dossier into
   the **Workspace** tab.
3. Each product shows substance, units, open orders, deadline, review reminder,
   and owner. Choose one mitigation per product:
   - **Open change request** — creates a change request assigned to the owner,
     sets a future review reminder, and sends it to the owner's compliance
     queue. The product moves to **Tracking**.
   - **Request declaration** — asks the owner for an updated material
     declaration, with a response due date. The product moves to **Tracking**.
   - **Acknowledge risk** — records the risk without opening mitigation work.
     The product moves to **Acknowledged**.
   Only one option can be chosen per product. The resulting change
   request/request/acknowledgement is added to the Workspace, and the case
   header shows how many products are decided.
4. The alert stays open until both products have a decision. Then it moves to
   **Tracking** or **Acknowledged**. Reset the demo to choose again.

When every alert is handled, the **Queue cleared / Alerts handled** summary
appears in the chat and the composer locks.

## Composer behavior

- The composer auto-fills the expected prompt for the current stage when you
  click it and no decision card is waiting. The seed prompt is *"Draft a data
  sheet from the new spec."* At `done`, the composer locks and does not
  auto-fill another flow; start another conversation or reset.
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
- **Subagents** (`subagent-run.tsx`): a short single-cube launch delay, then a
  light orchestration panel with three side-by-side lanes, cube loaders,
  pulsing agents, slowly cascading research nodes, and inline findings.
- **Audit summary / review / published** (`audit-summary.tsx`): the data-sheet
  summary, the four-value review with missing/conflict/uncertain labels, and
  the rev D publish summary.
- **Alert created** (`alert-created.tsx`): the chat notification linking to the
  new Alerts item.
- **Permission request** (`permission-card.tsx`): Allow once / Allow always /
  Don't allow for specialist checks and recipient notifications.
- **Compliance case** (`compliance-card.tsx`): tabbed product review, exposure
  facts, per-product mitigation choices, and the resulting change request/
  declaration/acknowledgement record.
- **Pricing case** (`pricing-card.tsx`): side-by-side supplier prices, lead-time
  and peak-coverage tradeoffs, the three sourcing choices, and the decision
  record.
- **Existing cards**: change proposal with the page-14 editor, red/green doc
  diff, suggested-recipient document updates, regulation, suggested replies,
  and the queue summary.

## Files

| File | Role |
| --- | --- |
| `page.tsx` | Start state, audit orchestration, upload/alert callbacks, existing queue flows, layout. |
| `lib/flow.ts` | `PlmStage`, message kinds, `SubagentSpec`, audit greeting/prompt, expected inputs, flow steps. |
| `lib/audit-data.ts` | Sample spec, drafted MAA-200 fields, flagged review values, publish changes, three subagent scripts. |
| `lib/audit-turns.ts` | Intro/upload, draft/flag, subagent, and publish turns. |
| `components/file-upload.tsx` | Dropzone + Windows 11 single-file explorer. |
| `components/subagent-run.tsx` | Light orchestration console with timed agents. |
| `components/permission-card.tsx` | Allow once / always / deny permission prompt. |
| `components/compliance-card.tsx` | Compliance exposure, mitigation choices, and outcome record. |
| `components/pricing-card.tsx` | Supplier price comparison, sourcing choices, and decision record. |
| `lib/pricing-data.ts` | Seeded pricing alert, `CP-31K` supplier facts, options, and outcome helper. |
| `components/extracted-sheet.tsx` | Draft data-sheet card. |
| `components/audit-summary.tsx` | Audit summary, flagged-value review, and publish summary. |
| `components/alert-created.tsx` | New-alert notification card. |
| `lib/queue-data.ts` | Seeded pricing alert, generated documentation/compliance alerts, page-14 source, document updates item. |
| `lib/page-diff.ts` | Builds the red/green page diff from the edited page text. |
| `lib/queue-turns.ts` | Pricing, documentation change, recipient sends, compliance, and document update turns. |
| `components/open-items-panel.tsx` | Right-rail **Alerts** panel, empty state, New badges. |
| `components/workspace-panel.tsx` | Workspace documents, including the uploaded engineering spec. |
| `public/manuals/maa-200-spec.pdf` | The sample engineering spec and the only file in the explorer. |

**Reset** from the header returns to the fresh chat, clears transient alerts,
and restores the existing pricing escalation.
