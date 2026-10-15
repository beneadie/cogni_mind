// PURPOSE: Proves the seed story, the alert rule, the counting rule and the views behave as the demo promises.
// ROLE: test. USED BY: the TESTS command in docs/quality/STATUS.md.

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CompanyId, Ticket, TicketId } from "../contracts";
import { SAMPLE_COMPLAINT } from "../data/synthetic";
import { alertEvidence, selectAlerts } from "../selectors/alerts";
import { backfillProgress, ticketCounters } from "../selectors/records";
import { trendsByCompany, trendsByProduct } from "../selectors/trends";
import { type QualityAction, type QualityState, initialState, qualityReducer } from "../state/reducer";
import { ALERT_WINDOW_DAYS, EXAMPLE_TICKETS_SHOWN } from "../thresholds";
import { isoDaysBefore } from "../time";

/** Applies actions in order, starting from the seed. */
function run(...actions: QualityAction[]): QualityState {
  return actions.reduce(qualityReducer, initialState());
}

const SAMPLE: QualityAction = { type: "draft/classify", ...SAMPLE_COMPLAINT };
const CONFIRM: QualityAction = { type: "draft/confirm" };
const BACKFILL: QualityAction = { type: "backfill/run" };

/** A confirmed split-AC compressor leak, for building alert scenarios by hand. */
function leak(id: TicketId, companyId: CompanyId, ageDays: number, text = `leak ${id}`): Ticket {
  return {
    id,
    companyId,
    date: isoDaysBefore(ageDays),
    kind: "warranty",
    intake: "forced_choice",
    text,
    tags: { productId: "split-ac-3t", modelId: null, failureType: "compressor_leak", status: "confirmed" },
  };
}

// The simple-version story: nothing on load, one alert after the person confirms the sample complaint.
describe("seed story", () => {
  test("fresh load has no alert", () => {
    assert.deepEqual(selectAlerts(initialState().tickets), []);
  });

  test("confirming the sample complaint fires exactly one alert", () => {
    const alerts = selectAlerts(run(SAMPLE, CONFIRM).tickets);
    assert.equal(alerts.length, 1);
    const [alert] = alerts;
    assert.equal(alert.productId, "split-ac-3t");
    assert.equal(alert.failureType, "compressor_leak");
    assert.deepEqual(alert.ticketIds, ["Q-026", "Q-002", "Q-001"]);
    assert.deepEqual([...alert.companyIds].sort(), ["apex-air", "cascade-comfort", "northfield-hvac"]);
    assert.equal(alert.unconfirmedCount, 0);
  });

  test("the classified sample alone (not yet confirmed) changes nothing: HUMAN-GATE", () => {
    assert.deepEqual(selectAlerts(run(SAMPLE).tickets), []);
  });

  test("backfill adds no unexplained alert, before or after the sample", () => {
    assert.deepEqual(selectAlerts(run(BACKFILL).tickets), []);
    const alerts = selectAlerts(run(BACKFILL, SAMPLE, CONFIRM).tickets);
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].ticketIds.length, 3);
    assert.equal(alerts[0].duplicatesMerged, 1);
  });
});

// Non-triggers prove the rule needs every condition, not just volume.
describe("non-triggers", () => {
  test("three coil leaks from one company and board faults across three products raise nothing", () => {
    const tickets = run(BACKFILL).tickets;
    const coil = tickets.filter((ticket) => ticket.tags.failureType === "coil_leak" && ["Q-008", "Q-010", "Q-011"].includes(ticket.id));
    assert.equal(coil.length, 3);
    assert.deepEqual(selectAlerts(tickets), []);
  });
});

// The window is measured from DEMO_NOW: day 0 is today, so 29 days ago is in and 30 is out.
describe("window boundaries", () => {
  test(`a ticket ${ALERT_WINDOW_DAYS - 1} days old counts, ${ALERT_WINDOW_DAYS} days old does not`, () => {
    const base = [leak("Q-101", "apex-air", 0), leak("Q-102", "northfield-hvac", 1)];
    assert.equal(selectAlerts([...base, leak("Q-103", "apex-air", ALERT_WINDOW_DAYS - 1)]).length, 1);
    assert.equal(selectAlerts([...base, leak("Q-103", "apex-air", ALERT_WINDOW_DAYS)]).length, 0);
  });
});

// Evidence stays readable: a few examples up front, the full list one click away.
describe("evidence", () => {
  test(`examples capped at ${EXAMPLE_TICKETS_SHOWN}, newest first, full list available`, () => {
    const tickets = [0, 3, 6, 9, 12].map((age, index) => leak(`Q-20${index}`, index % 2 ? "apex-air" : "cascade-comfort", age));
    const [alert] = selectAlerts(tickets);
    const evidence = alertEvidence(alert, tickets);
    assert.equal(evidence.examples.length, EXAMPLE_TICKETS_SHOWN);
    assert.equal(evidence.all.length, 5);
    assert.equal(evidence.hiddenCount, 2);
    assert.deepEqual(evidence.examples.map((ticket) => ticket.id), ["Q-200", "Q-201", "Q-202"]);
  });

  test("same company + same text is merged and reported, never counted twice", () => {
    const tickets = [leak("Q-301", "apex-air", 2, "Comp leak!"), leak("Q-302", "apex-air", 1, "comp  LEAK"), leak("Q-303", "northfield-hvac", 3)];
    assert.deepEqual(selectAlerts(tickets), []);
    const withThird = [...tickets, leak("Q-304", "cascade-comfort", 4)];
    const [alert] = selectAlerts(withThird);
    assert.equal(alert.ticketIds.length, 3);
    assert.equal(alert.duplicatesMerged, 1);
  });
});

// Counting rule: only tickets with product + failure that are suggested/confirmed/corrected count.
describe("counting", () => {
  test("forced-choice tickets count without classification; unclassified tickets do not", () => {
    const counters = ticketCounters(initialState().tickets);
    assert.equal(counters.counted, 2);
    assert.equal(counters.unclassified, 21);
    assert.deepEqual(trendsByProduct(initialState().tickets, { companyId: "all", range: "all" }), [
      { productId: "split-ac-3t", failureType: "compressor_leak", count: 2, unconfirmed: 0 },
    ]);
  });

  test("backfill: suggested tickets count as unconfirmed, needs-review ones are excluded", () => {
    const tickets = run(BACKFILL).tickets;
    const progress = backfillProgress(tickets);
    assert.deepEqual(progress, { total: 23, classified: 18, needsReview: 5, pending: 0 });
    const counters = ticketCounters(tickets);
    assert.equal(counters.needsReview, 5);
    assert.equal(counters.duplicatesMerged, 2);
    assert.equal(counters.counted, 2 + 18 - 2);
    assert.equal(counters.unconfirmed, 16);
    assert.ok(!tickets.some((ticket) => ticket.tags.status === "confirmed" && ticket.classification && ticket.intake === "free_text"));
  });

  test("by-product view ranks resolved products; by-company view splits per company", () => {
    const tickets = run(BACKFILL).tickets;
    const all = { companyId: "all", range: "all" } as const;
    const [top] = trendsByProduct(tickets, all);
    assert.deepEqual(top, { productId: "split-ac-3t", failureType: "compressor_leak", count: 5, unconfirmed: 3 });
    const byCompany = trendsByCompany(tickets, all);
    assert.deepEqual(byCompany.map((row) => row.companyId), ["apex-air", "northfield-hvac", "cascade-comfort"]);
    assert.deepEqual(byCompany[1].rows[0], { failureType: "coil_leak", count: 4, unconfirmed: 4 });
  });

  test("filters narrow by company and by time range from DEMO_NOW", () => {
    const tickets = run(BACKFILL).tickets;
    const recent = trendsByProduct(tickets, { companyId: "all", range: "30d" });
    assert.deepEqual(recent.find((row) => row.failureType === "compressor_leak"), { productId: "split-ac-3t", failureType: "compressor_leak", count: 2, unconfirmed: 0 });
    const cascade = trendsByCompany(tickets, { companyId: "cascade-comfort", range: "90d" });
    assert.equal(cascade.length, 1);
    assert.equal(cascade[0].total, 4);
  });
});

// Corrections and reset flow through the same selectors, so every view agrees.
describe("state", () => {
  test("correcting a contributing ticket removes the alert immediately", () => {
    const withAlert = run(SAMPLE, CONFIRM);
    const corrected = qualityReducer(withAlert, { type: "ticket/correct", ticketId: "Q-002", correction: { productId: "split-ac-3t", modelId: "nf-3000s", failureType: "coil_leak" } });
    assert.equal(selectAlerts(corrected.tickets).length, 0);
    assert.equal(corrected.tickets.find((ticket) => ticket.id === "Q-002")?.tags.status, "corrected");
  });

  test("a needs-review draft cannot be confirmed, only corrected", () => {
    const draft = run({ type: "draft/classify", companyId: "apex-air", kind: "warranty", text: "unit leaking, no model plate" });
    assert.equal(draft.draft?.response.status, "needs_review");
    assert.equal(qualityReducer(draft, CONFIRM), draft);
    const corrected = qualityReducer(draft, { type: "draft/correct", correction: { productId: "rtu-10t", modelId: null, failureType: "condensate_drain" } });
    assert.equal(corrected.tickets.at(-1)?.tags.status, "corrected");
  });

  test("confirming a backfilled suggestion clears its unconfirmed note", () => {
    const before = run(BACKFILL);
    const after = qualityReducer(before, { type: "ticket/confirm", ticketId: "Q-005" });
    assert.equal(ticketCounters(after.tickets).unconfirmed, ticketCounters(before.tickets).unconfirmed - 1);
  });

  test("reset restores the seed and shares no objects with the old state", () => {
    const changed = run(BACKFILL, SAMPLE, CONFIRM, { type: "filters/set", filters: { range: "30d" } });
    const reset = qualityReducer(changed, { type: "reset" });
    assert.deepEqual(reset, initialState());
    assert.equal(selectAlerts(reset.tickets).length, 0);
    assert.notEqual(reset.tickets[0].tags, initialState().tickets[0].tags);
  });
});
