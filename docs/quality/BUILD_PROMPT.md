PROJECT CONTEXT
We are building three clickable sales demos for ACS (AirX Climate Solutions), a group of HVAC
companies that keeps acquiring more. Audience: Jenn's team, who must back AI before it goes to
the CEO. They are demos, only showing what we could really build. The repo is hvac-support-copilot
(Next.js). Tech Support is the existing app at "/". PLM is built by ANOTHER developer. I am
building QUALITY here, matching Support's UI/UX. Do not edit Support or PLM.
Rules for all three demos: fake but realistic data labeled "Illustrative", a human reviews before
anything changes, only features we can really build, no real client data.

ROLE: Senior frontend engineer in VS Code. Build "Quality Intelligence": warranty/quality issue
triage + recurring-failure alerts (not camera/vision inspection). All data fictional; no ACS API
exists.

USER STORY (source of truth)
As a quality manager, I need AI to read incoming warranty and quality issues, including messy
free-text ones, sort them by product and failure type, and alert me when the same failure keeps
showing up across our companies, so we fix root causes instead of answering the same complaint
again.
What ACS said: quality is a top-two problem. The old intake form was a free-text box, so issues
weren't sorted; they're switching to forced choices (e.g. compressor leak vs. coil leak). Years of
old records are buried in free text or missing. Nobody looks across tickets to find what keeps
going wrong. They want help sorting issues as they come in.
Simple version (one flow): a messy complaint comes in, AI tags product + failure type, and an
alert shows the same failure repeating across companies with a few example tickets.
Full version: (1) complaint -> tags for product, model, failure type; (2) AI sorts old free-text
records the same way; (3) simple view of most common failures by product and by company, with an
alert when one starts repeating; (4) each alert shows a few example tickets as evidence.

SESSION RULES (one stage per session)
1. Read docs/quality/STATUS.md first (repo findings from Phase 1: tokens, components, shell, nav,
   test command, PLM pattern, data decision, planned files). Trust it; do NOT re-explore the
   repo. Re-read a repo file only if the stage's own work needs it.
2. Save THIS WHOLE PROMPT to docs/quality/BUILD_PROMPT.md verbatim (overwrite any older copy),
   keeping the section headings. Later sessions read it by section (offset/limit), never whole.
3. Do exactly the stage named on the last line, then commit, update STATUS.md (done / next /
   decisions / not done, <40 lines), reply "STAGE N DONE. Run /clear, then paste the Phase 2
   prompt with the last line changed to Stage N+1.", and STOP. Never start the next stage.
4. If STATUS.md lists unresolved BLOCKERS, stop and ask me.
5. If files from an older version exist (confidence.ts, csv.ts, TicketSource, LangChain/LangGraph
   references, an unused PlmReviewRequest type), delete them and say so in one line.

WORKING STYLE (strict)
Finish fully, say little.
- COMPLETE: no stubs, placeholders, "similar for the rest", empty handlers, TODOs or dead buttons.
  Every control in scope works. Anything unfinished goes under "Not done" in STATUS.md; never
  silently cut scope or claim it works.
- VERIFIED: a stage is done only when its tests/lint/build were actually run and pass. If you
  cannot run or view something (e.g. the UI in a browser), write "unverified", not "works".
- NO REPETITION: one implementation per concept. Shared helpers for repeated logic; data-driven
  lists instead of copy-pasted components; one place for each constant, label and rule text.
- LOW TOKENS: no narration, plan restating or diff summaries; no re-reading files or re-running
  passing checks. Use grep/glob and targeted reads; make edits, not whole-file rewrites; write
  each file once, comments included (no separate comments pass). Show only failing output lines.
- Replies <= 10 lines: built, pass/fail counts, comment gaps, "Not done", open questions.

REPO FACTS (already confirmed)
Next 16.4.0 App Router, React 19.3.0, TypeScript 5, Tailwind 4 via @tailwindcss/turbopack (tokens
in app/globals.css), ESLint 9, framer-motion, lucide-react. Scripts: dev, build, start, lint
only. next.config.ts sets cacheComponents: true (do not edit). Support data is Carrier/Trane/
Lennox: never copy into Quality. Deployed on Netlify; Support at "/" must keep working unchanged.

RULES
- No new packages, backend, DB, auth, model calls or network requests. Branch
  feat/quality-intelligence; never push to main. Reuse framer-motion and lucide-react.
- New code only in: app/quality/, components/quality/, lib/quality/, docs/quality/. One outside
  edit allowed: the one-line "Quality" nav link at the spot named in STATUS.md (comment it
  `// Quality demo link`), listed in STATUS.md with a warning that it may conflict with the PLM
  developer's nav edit (Stage 2 only).
- Docs only: docs/quality/INTEGRATION.md (<40 lines), BUILD_PROMPT.md, STATUS.md.
- Reuse components per STATUS.md COMPONENTS: import only the ones marked "import"; never modify
  them; never import Support's lib/mock-data.ts. Look-alikes live in components/quality/ and use
  the same tokens.
- CLOCK (cacheComponents is strict): always use a fixed DEMO_NOW constant, never the real clock,
  for seed dates, the rolling alert window and time filters, so results are identical every run.
  No Date.now(), new Date() or Math.random() in server components or at module top level. No
  route-segment config exports. app/quality/page.tsx is a static shell; stateful UI is in client
  components, with Suspense if the build asks. The store is hydration-safe (useSyncExternalStore
  with getServerSnapshot returning seed state).

LOOK AND FEEL
Use the tokens and components in STATUS.md; never guess colors, fonts, radii, shadows, spacing or
motion. If anything here conflicts with the repo's real tokens, the repo wins.
Layout (three regions, one screen, responsive; rails collapse on mobile), mirroring Support:
- Header: Cognimind brand, title "Quality Intelligence", subtitle "Quality Control Console",
  status badge "Demo data / Illustrative" (never "Online" or "Connected"), one-line hint, "Reset
  Demo" button restoring seed state.
- Left rail "Tickets": "New complaint" button; list grouped Today / Previous 7 days / Earlier
  (relative to DEMO_NOW); rows show title, subtitle, date tag, status tag (Needs review,
  Suggested, Confirmed, Alert).
- Center: original complaint beside suggested tags, then steps, cards and actions for the flow.
- Right rail "Evidence": count badge; sections "Active filters", "Alert tickets", "Rule applied",
  each with a friendly empty state.
Reuse Support's patterns: step-list blocks showing how a ticket was classified (rendered
immediately from real classifier output: matched keywords, resolved alias, rule fired; NO
artificial delays, even though Support's steps are timed), evidence-style cards, a citation-style
modal showing a ticket's original text with matched words highlighted, compact tags/badges, subtle
motion honoring prefers-reduced-motion.

ARCHITECTURE (UI depends only on contracts and selectors)
- lib/quality/contracts.ts: typed IDs/records:
    Ticket { id, companyId, date, kind: "warranty" | "quality", intake: "free_text" |
      "forced_choice", text, modelRaw?, supportCaseId?, duplicateOf?,
      tags: { productId | null, modelId | null, failureType | null,
              status: "unclassified" | "suggested" | "needs_review" | "confirmed" | "corrected" } }
    QualityAlert, FailureType, CompanyId, ProductId, ModelId, TicketId
    ClassifyRequest  { ticketId, text, companyId?, modelRaw? }
    ClassifyResponse { ticketId, classifierVersion, productId | null, modelId | null,
      failureType | null, evidence: {span, cue}[], possibleFailureTypes: FailureType[] (only when
      cues compete), status: "suggested" | "needs_review", reviewReason?: "no_failure_cue" |
      "negated" | "competing_cues" | "product_unresolved" | "empty_text" }
  Reuse PLM ID names read-only (per STATUS.md DATA).
- lib/quality/data/synthetic.ts: see SEED STORY.
- lib/quality/classifier/: `Classifier` interface (ClassifyRequest -> ClassifyResponse) + one
  deterministic local implementation (keyword/synonym maps, negation, evidence). The UI calls only
  the interface, so a different classifier could replace it later without UI changes.
- lib/quality/thresholds.ts: the only place the alert constants are defined.
- lib/quality/state/: one store/reducer; corrections and confirmations dispatch here.
- lib/quality/selectors/: pure functions for trends (by product, by company), counters, alerts,
  evidence. UI renders selector output only, so every change updates every view.
- components/quality/: small components. app/quality/page.tsx: static shell.

CLASSIFICATION RULES (deterministic, explainable; no scores)
- No confidence, percentages, probabilities or score badges anywhere. Show evidence spans and the
  plain-language reason instead.
- Failure types are the forced-choice list ACS is moving to: compressor leak, coil leak, plus about
  six more plausible HVAC ones (e.g. refrigerant low, control board fault, fan motor failure,
  door latch/panel, condensate drain, electrical/breaker trip). Illustrative; ACS owns the real
  list (open question in INTEGRATION.md). One list, defined once.
- status = needs_review when: no failure cue; the cue is negated; cues for two failure types
  compete (list them in possibleFailureTypes); the product can't be resolved against the canonical
  product list (missing/unknown model); or the text is empty. Otherwise suggested.
- Never invent a product or failure type. "Compressor leak" != "coil leak"; "leak" alone is not
  enough.
- Every suggestion still needs a human Confirm/Correct before it joins the records.
- COUNTING: trends and alerts count deduplicated tickets whose tags have a product and failure
  type and status suggested, confirmed or corrected. needs_review and unclassified tickets are
  excluded until a person confirms or corrects them. Wherever counts show, add a small note
  "includes N unconfirmed suggestions" when N > 0.

SEED STORY (SYNTHETIC; design so the simple version works from a fresh load)
~24 fictional tickets, 3 fictional companies (or PLM's per STATUS.md), canonical products with
per-company legacy model/part aliases. Mix kind warranty/quality. Include:
- 2 recent forced_choice tickets, already confirmed: same product + compressor leak, from two
  different companies, within 30 days of DEMO_NOW. (Shows the new intake form.)
- ~18 older free_text tickets, unclassified until the backfill: messy wording, typos, equivalent
  phrasings ("freon leaking at the compressor" vs "comp seal weeping"), a coil leak group, a
  non-trigger group (same failure on one company only, or same failure on different products),
  duplicates (duplicateOf or same company + same text), missing model IDs, a negated phrase
  ("no leak found, compressor fine"), an empty-text record, and noise failure types.
- 1 sample incoming complaint (offered by "Try sample"): messy free text, a third compressor leak
  on the same product from a company different from at least one of the two above.
- Fresh load: NO alert. Confirming the sample complaint fires exactly one alert (compressor leak,
  that product, 3 tickets, 2+ companies, within 30 days). Backfill may add older contributing
  tickets to the trends but must not create unexplained alerts; state the expected alert set in a
  comment above the data.
- Forced_choice tickets count without any classification step.

SIMPLE VERSION (must work end to end after Stage 2)
Open /quality -> list shows recent tickets, no alert -> "Try sample" fills a messy complaint ->
tags appear with evidence spans and any reviewReason -> person clicks Confirm (or Correct) -> the
ticket joins the records (HUMAN-GATE) -> an alert appears: product, failure, count, companies,
period -> click it -> up to 3 example tickets (newest first; ID, date, company, original words,
tags) with "Show all N" if more, and "N duplicates merged" when duplicates were collapsed.
- Alert rule, shown in the UI: >=3 distinct tickets in a rolling 30-day window, same canonical
  product + failure type, spanning >=2 companies. A lead for investigation, not proof of root
  cause.
- Duplicate = same company + same normalized text, or a seeded duplicateOf link; collapse before
  counting.
- "Flag for engineering review" on an alert, visibly marked "Demo / not submitted"; never imply a
  real ticket or PLM task exists.

FULL VERSION (Stage 3, on top of the simple version)
1. Incoming (done in simple version): also accept typed text, not just the sample; missing model
   or product -> needs_review with the reason shown.
2. "Classify historical tickets": runs the SAME classifier over the unclassified free_text
   records; classified / needs-review / total computed from records; original text and provenance
   preserved; tickets land as suggested or needs_review (never auto-confirmed).
3. Views, derived from state: "By product" (ranked product + failure type with counts) and "By
   company" (ranked failure types per company), plain SVG/div bars; filters for company and time
   range (Last 30 days / Last 90 days / All, measured back from DEMO_NOW); legacy models resolve
   to one canonical product; missing/unknown fields shown as unknown.
4. Evidence per alert: as in the simple version.
5. Correcting any ticket's tag recomputes views and alerts immediately.

HONESTY
Offline, deterministic; label output "Demo classification"; no LLM pretense or hidden network.
Negation, ambiguity and missing identifiers -> Needs review. No fake timings, percentages, scores
or dead controls. Nothing labeled "Online" or "Connected".

CODE COMMENTS (every new file; clear, short, useful)
A new developer can tell what each file, type and function does, why it exists and where a real
system would replace it, without running anything. Comment intent and reasoning, never line-by-line
restatement. Match the STYLE line in STATUS.md.
- File header (2-4 lines): PURPOSE, ROLE (contract / data / classifier / state / selector /
  component / page / test), USED BY.
- `/** */` on every exported type, function, constant, component and hook: one line; @param/
  @returns only when not obvious.
- Inline comments only where the reason isn't obvious: business rules (alert rule, duplicate
  definition, counting rule, window math relative to DEMO_NOW); classifier decisions (negation,
  competing cues, why "leak" alone isn't enough, each reviewReason); workarounds (client component
  reasons, getServerSnapshot, cacheComponents); reducer actions (trigger and which selectors
  recompute).
- Every threshold is a named constant defined once in thresholds.ts with a comment that it is a
  demo value: ALERT_MIN_TICKETS = 3, ALERT_MIN_COMPANIES = 2, ALERT_WINDOW_DAYS = 30,
  EXAMPLE_TICKETS_SHOWN = 3.
- Seed data: a comment above each ticket group says what it exercises ("Trigger: ...",
  "Non-trigger: one company only", "Duplicate of Q-007", "Negation: must NOT classify as
  compressor leak", "Missing model ID", "Empty text"), plus the expected alert set.
- Tests: one comment above each group stating the behavior and why it matters.
- Section dividers in files over ~80 lines, e.g. `// --- Alert rule (deterministic, not AI) ---`.
- Greppable tags: `DEMO-ONLY:`, `SYNTHETIC:`, `HUMAN-GATE:` (where a person confirms/corrects),
  `SWAP-POINT:` (where a real system would replace this; name it), `CONTRACT:` (shape shared with
  PLM/Support).
- Never: commented-out code; TODO without a reason; comments that restate code or contradict it.
  No comments in JSON. Do not change comments in Ben's files.
- COMMENT-GAP CHECK (end of every stage; grep/glob only, no lint plugins): list new files with no
  header and exports with no `/** */`; fix them; report "comment gaps: N" (must be 0 to commit).

STAGES
Stage 1: lib/quality contracts, thresholds, synthetic data (per SEED STORY), classifier,
  selectors, unit tests. No UI.
Stage 2: store, shell (header, rails), nav link, Reset Demo, and the SIMPLE VERSION end to end.
Stage 3: FULL VERSION (items 1-5), a11y/mobile pass, docs/quality/INTEGRATION.md, final report
  (<=20 lines).
Stage 4 (OPTIONAL; run only if I ask): a "Send to PLM review" card building a PlmReviewRequest
  labeled "Integration pending" (no runtime link to other demos, no fake sync; align to PLM's
  record shape read-only if one exists), and a restrained "Potential impact" panel (suggested vs
  needs-review counts, repeated groups found, editable labeled placeholders for time-to-
  classify/detect; no fabricated savings).
After every stage run `npm run lint`, `npm run build` and the tests per STATUS.md TESTS.

INTEGRATION.md (Stage 3; <40 lines; documentation only)
1. QualityAlert and Ticket fields, and how PLM or Support would consume them.
2. Classifier contract (ClassifyRequest/Response) as the swap point for a real classifier.
3. Swap points: one line per SWAP-POINT tag (file -> replacement), from a single grep.
4. Demo click path (the SIMPLE VERSION sequence, 6 lines) and the one line to say at each step.
5. Open questions for ACS: who owns the failure taxonomy, the alert rule in their words, where
   tickets live today.

TESTS (node:test, no new dependencies, pure modules in lib/quality; command from STATUS.md)
Classifier: compressor leak, coil leak, ambiguous product, negated phrase, historical synonym,
competing cues -> needs_review with possibleFailureTypes, empty text -> needs_review.
Selectors/state: fresh load has no alert; confirming the sample complaint yields exactly one
alert with the expected product, count and companies; non-trigger gives no alert; example tickets
capped at EXAMPLE_TICKETS_SHOWN with the full list available; duplicates merged and reported;
needs_review and unclassified excluded from counts; forced_choice tickets counted without
classification; backfill counts; by-product and by-company views; filters; window boundaries
relative to DEMO_NOW; correction recompute; reset. Final: lint and build pass; Support at "/"
unchanged; comment gaps: 0.

DO NOW: Stage 3
