// PURPOSE: SYNTHETIC seed tickets and the sample incoming complaint that tell the demo's story.
// ROLE: data. USED BY: state/reducer.ts (seed + reset), tests.
// SWAP-POINT: the ticket system of record (warranty/quality intake) replaces this file in a live system.
//
// Expected alert set (alert window = last 30 days before DEMO_NOW):
// - Fresh load: none. Only Q-001 and Q-002 (forced choice) count: 2 compressor leaks on split-ac-3t.
// - Confirm SAMPLE_COMPLAINT: exactly one alert, compressor leak on split-ac-3t, 3 tickets,
//   3 companies (Q-001 Apex, Q-002 Northfield, new Cascade ticket).
// - Backfill (before or after the sample): no new alert. Q-003 joins the alert group only as a merged
//   duplicate of Q-001; older compressor leaks fall outside the window and only feed the trends.

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

  // Non-trigger: one company only. Three Northfield coil leaks inside the window, so no cross-company alert.
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
];

/** A complaint typed into the intake box, before any classifier or person has touched it. */
export type IncomingComplaint = { companyId: CompanyId; kind: TicketKind; text: string; modelRaw?: string };

/** SYNTHETIC: "Try sample" complaint. Trigger: a third split-ac-3t compressor leak, from a third company. */
export const SAMPLE_COMPLAINT: IncomingComplaint = {
  companyId: "cascade-comfort",
  kind: "warranty",
  text: "Hi - tech was out at the Riverside dental office again. CC-410S outdoor unit, freon leaking at the comprssor (oily mess on the base pan). Customer not happy, 2nd visit this season. Warranty??",
};
