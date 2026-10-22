// PURPOSE: SYNTHETIC seed tickets and the sample incoming complaint that tell the demo's story.
// ROLE: data. USED BY: state/reducer.ts (seed + reset), tests.
// SWAP-POINT: the ticket system of record (warranty/quality intake) replaces this file in a live system.
//
// Expected volumes (DEMO_NOW = day 0): 15 tickets in the last 7 days, 27 in the last 30 days, 40 in all.
// Expected alert set once the historical free text is classified (the dashboard does that on load):
// - Compressor leak on split-ac-3t: Q-001 Apex, Q-002 Northfield, Q-026 Cascade (Q-003 merged as a duplicate).
//   Supporting tickets inside the last 7 days, so it shows under every date filter.
// - Coil leak on heat-pump-4t: Q-008, Q-010, Q-011 Northfield + Q-027 Apex, all 13–24 days old, so it shows
//   under "Last 30 days" but not "Last 7 days".
// - Confirm SAMPLE_COMPLAINT (Cascade CC-410S compressor leak): no new alert; it joins the compressor-leak one (4 tickets).
// - Before classification only forced-choice tickets count, so neither alert exists yet: the HUMAN-GATE and
//   classifier still decide. Older compressor leaks fall outside the window and only feed the trends.

import type { CompanyId, FailureType, ModelId, Ticket, TicketId, TicketKind } from "../contracts";
import { isoDaysBefore } from "../time";
import { modelById } from "./catalog";

/** Untouched tags for a free-text ticket that no classifier has read yet. */
const UNCLASSIFIED = { productId: null, modelId: null, failureType: null, status: "unclassified" } as const;

/** Old free-text intake: the original words only, tags waiting for the backfill. */
function freeText(
  id: TicketId,
  companyId: CompanyId,
  ageDays: number,
  kind: TicketKind,
  text: string,
  links: Pick<Ticket, "duplicateOf" | "supportCaseId"> = {},
): Ticket {
  return { id, companyId, date: isoDaysBefore(ageDays), kind, intake: "free_text", text, ...links, tags: { ...UNCLASSIFIED } };
}

/** New forced-choice intake: the form already captured model and failure, and the submitter confirmed them. */
function forcedChoice(
  id: TicketId,
  companyId: CompanyId,
  ageDays: number,
  kind: TicketKind,
  modelId: ModelId,
  failureType: FailureType,
  text: string,
): Ticket {
  const model = modelById(modelId);
  return {
    id,
    companyId,
    date: isoDaysBefore(ageDays),
    kind,
    intake: "forced_choice",
    text,
    modelRaw: model.label,
    tags: { productId: model.productId, modelId, failureType, status: "confirmed" },
  };
}

/** SYNTHETIC: seed tickets grouped by what they exercise; ages are days before DEMO_NOW. */
export const SEED_TICKETS: readonly Ticket[] = [
  // Trigger (with the sample): new forced-choice form, already confirmed, two companies, inside the window.
  forcedChoice("Q-001", "apex-air", 12, "warranty", "ax-c36", "compressor_leak", "Form: Compressor leak. Note: oil at suction line, unit short of charge."),
  forcedChoice("Q-002", "northfield-hvac", 5, "quality", "nf-3000s", "compressor_leak", "Form: Compressor leak. Note: found during install QA, braze joint at compressor."),

  // Duplicate of Q-001 (seeded duplicateOf link): merged, never counted twice.
  freeText("Q-003", "apex-air", 8, "warranty", "Customer called back about the AX-C36 at the clinic - compressor still leaking oil. Same job as before.", { duplicateOf: "Q-001", supportCaseId: "SC-20418" }),

  // Historical synonyms for compressor leak, older than the window: feed trends, never the alert.
  freeText("Q-004", "apex-air", 118, "warranty", "freon leaking at the compressor on AX-C36. Topped off + added leak dye"),
  freeText("Q-005", "cascade-comfort", 84, "warranty", "comp seal weeping, oily residue under CC-410S. warranty claim"),
  freeText("Q-006", "northfield-hvac", 70, "quality", "NF3000S - compresser leeking at service valve braze"),

  // Coil leak group: must classify as coil leak, never compressor leak.
  freeText("Q-007", "northfield-hvac", 55, "warranty", "Evap coil leaking on NF-48HP, formicary corrosion suspected"),
  freeText("Q-009", "cascade-comfort", 104, "warranty", "indoor coil leak, CC-HP4, nitrogen pressure test failed"),

  // Three Northfield coil leaks inside the window: one company alone never alerts (Q-027 below adds a second company).
  freeText("Q-008", "northfield-hvac", 24, "quality", "A-coil leak again on NF-48HP. pinhole found in the coil"),
  freeText("Q-010", "northfield-hvac", 20, "warranty", "coil leak at the evap, NF-48HP, unit 4 of the condo block"),
  freeText("Q-011", "northfield-hvac", 13, "warranty", "NF-48HP evaporator leaking refrigerant, same building as last month"),

  // Non-trigger: same failure on different products. Board faults across three companies but three product lines.
  freeText("Q-012", "apex-air", 16, "warranty", "AX-F80 control board dead. Replaced under warranty"),
  freeText("Q-013", "cascade-comfort", 7, "quality", "CC-RTU10 main board fried after the storm. Unit dead on arrival."),
  freeText("Q-014", "northfield-hvac", 26, "warranty", "pcb failure on NF-3000S, error code 7"),

  // Duplicate of Q-013 (same company + same normalized text): merged by the duplicate rule, no link needed.
  freeText("Q-015", "cascade-comfort", 7, "quality", "cc-rtu10 main board fried after the storm  unit dead on arrival"),

  // Missing model ID: compressor leak cue, but no product to count it against -> needs review.
  freeText("Q-016", "apex-air", 34, "warranty", "Unit leaking at compressor, model plate unreadable"),

  // Negation: must NOT classify as compressor leak -> needs review.
  freeText("Q-017", "northfield-hvac", 18, "quality", "Callback on NF-RT120. No leak found, compressor fine, customer reports short cycling."),

  // Empty text: an old record with nothing in the free-text box -> needs review.
  freeText("Q-018", "cascade-comfort", 137, "warranty", ""),

  // Competing cues: compressor and coil both named next to the leak -> needs review with both options.
  freeText("Q-019", "apex-air", 96, "warranty", "AX-HP48 losing charge, oil spot between the compressor and coil, can't tell which is leaking"),

  // Noise: other failure types so the views have a realistic spread.
  freeText("Q-020", "apex-air", 63, "quality", "condensate drain clogged, water on ceiling tile. AX-F80"),
  freeText("Q-021", "cascade-comfort", 39, "quality", "access panel latch broken on CC-RTU10, panel rattles"),
  freeText("Q-022", "northfield-hvac", 126, "warranty", "breaker keeps tripping when NF-RT120 starts"),
  freeText("Q-023", "cascade-comfort", 47, "warranty", "condenser fan motor seized, CC-410S, bearings shot"),
  // Refrigerant low: the negated "no leak" must not block the low-charge cue.
  freeText("Q-024", "apex-air", 182, "warranty", "low on freon, recharged. AX-C36. no leak located"),

  // "Leak" alone: no compressor or coil named, so no failure type is invented -> needs review.
  freeText("Q-025", "cascade-comfort", 10, "warranty", "unit leaking all over, customer upset. CC-HP4"),

  // --- Recent volume (last 7 days unless noted) ---
  // Third company for the split-AC compressor leak: completes that recurring pattern inside the last 7 days.
  freeText("Q-026", "cascade-comfort", 3, "warranty", "CC-410S compressor leaking at the suction line, oil on the pad. Second visit."),
  // Second company for the heat-pump coil leak (15 days old): a recurring pattern visible in 30 days, not in 7.
  freeText("Q-027", "apex-air", 15, "warranty", "AX-HP48 evap coil leaking, dye test shows a pinhole"),

  // Structured-form tickets (confirmed on arrival); each product + failure pair stays below the alert rule.
  forcedChoice("Q-028", "northfield-hvac", 2, "quality", "nf-80g", "condensate_drain", "Form: Condensate drain. Note: drain pan overflowing at install check."),
  forcedChoice("Q-029", "apex-air", 4, "warranty", "ax-r10", "fan_motor_failure", "Form: Fan motor failure. Note: condenser fan not spinning on arrival."),
  forcedChoice("Q-030", "cascade-comfort", 1, "warranty", "cc-g80", "control_board_fault", "Form: Control board fault. Note: board flashing error 3, replaced."),
  forcedChoice("Q-031", "northfield-hvac", 6, "quality", "nf-rt120", "door_latch_panel", "Form: Door latch / panel. Note: service panel latch missing from crate."),

  // Free text the classifier can tag (suggested until a person confirms).
  freeText("Q-032", "apex-air", 3, "warranty", "AX-F80 inducer fan motor seized, bearings grinding"),
  freeText("Q-033", "cascade-comfort", 5, "warranty", "CC-RTU10 contactor keeps tripping the breaker on startup"),
  freeText("Q-034", "northfield-hvac", 2, "quality", "NF-80G condensate line clogged, water on the floor by the furnace"),
  freeText("Q-035", "apex-air", 6, "warranty", "low on refrigerant, recharged the AX-C36. no leak located yet"),
  freeText("Q-036", "cascade-comfort", 4, "warranty", "CC-HP4 outdoor fan motor dead, won't spin"),
  freeText("Q-037", "northfield-hvac", 1, "warranty", "NF-RT120 board fried after a power surge, unit dead"),

  // Free text a person must finish (needs review): no failure named, no model, competing cues.
  freeText("Q-038", "apex-air", 2, "warranty", "Customer says the AX-R10 is making a loud noise at night"),
  freeText("Q-039", "northfield-hvac", 5, "quality", "water dripping somewhere near the unit, model unknown"),
  freeText("Q-040", "cascade-comfort", 3, "warranty", "CC-410S losing charge, oily spot near the compressor and coil"),
];

/** A complaint typed into the intake box, before any classifier or person has touched it. */
export type IncomingComplaint = { companyId: CompanyId; kind: TicketKind; text: string; modelRaw?: string };

/** SYNTHETIC: "Try sample" complaint: another split-ac-3t compressor leak, so it joins the existing recurring alert. */
export const SAMPLE_COMPLAINT: IncomingComplaint = {
  companyId: "cascade-comfort",
  kind: "warranty",
  text: "Hi - tech was out at the Riverside dental office again. CC-410S outdoor unit, freon leaking at the comprssor (oily mess on the base pan). Customer not happy, 2nd visit this season. Warranty??",
};
