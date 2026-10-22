// PURPOSE: Proves the seed story, the alert rule, the counting rule and the views behave as the demo promises.
// ROLE: test. USED BY: the TESTS command in docs/quality/STATUS.md.

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CompanyId, Ticket, TicketId } from "../contracts";
import { SAMPLE_COMPLAINT } from "../data/synthetic";
import { alertEvidence, selectAlerts } from "../selectors/alerts";
import { DEFAULT_DASHBOARD_FILTERS, filterAlerts, filterTickets } from "../selectors/dashboard";
import { backfillProgress, ticketCounters } from "../selectors/records";
import { trendTickets, trendsByCompany, trendsByProduct } from "../selectors/trends";
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

// The seed story: two historical recurring failures once history is classified; the sample joins one of them.
describe("seed story", () => {
  test("before classification only forced-choice tickets count, so no alert yet: the classifier and HUMAN-GATE decide", () => {
    assert.deepEqual(selectAlerts(initialState().tickets), []);
  });

  test("classified history shows two recurring failures across companies", () => {
    const alerts = selectAlerts(run(BACKFILL).tickets);
    assert.deepEqual(alerts.map((alert) => `${alert.productId}|${alert.failureType}`).sort(), ["heat-pump-4t|coil_leak", "split-ac-3t|compressor_leak"]);
    const compressor = alerts.find((alert) => alert.failureType === "compressor_leak");
    assert.deepEqual(compressor?.ticketIds, ["Q-026", "Q-002", "Q-001"]);
    assert.equal(compressor?.duplicatesMerged, 1);
    const coil = alerts.find((alert) => alert.failureType === "coil_leak");
    assert.deepEqual([...(coil?.companyIds ?? [])].sort(), ["apex-air", "northfield-hvac"]);
  });

  test("confirming the matching sample grows the existing alert; it adds no new one", () => {
    const alerts = selectAlerts(run(BACKFILL, SAMPLE, CONFIRM).tickets);
    assert.equal(alerts.length, 2);
    const compressor = alerts.find((alert) => alert.failureType === "compressor_leak");
    assert.deepEqual(compressor?.ticketIds, ["Q-041", "Q-026", "Q-002", "Q-001"]);
    assert.deepEqual([...(compressor?.companyIds ?? [])].sort(), ["apex-air", "cascade-comfort", "northfield-hvac"]);
  });

  test("the classified sample alone (not yet confirmed) changes nothing: HUMAN-GATE", () => {
    assert.deepEqual(selectAlerts(run(SAMPLE).tickets), []);
    assert.equal(selectAlerts(run(BACKFILL, SAMPLE).tickets).find((alert) => alert.failureType === "compressor_leak")?.ticketIds.length, 3);
  });
});

// Non-triggers prove the rule needs every condition, not just volume.
describe("non-triggers", () => {
  test("board faults on different products, and pairs below three tickets, raise nothing", () => {
    const alerts = selectAlerts(run(BACKFILL).tickets);
    assert.ok(!alerts.some((alert) => alert.failureType === "control_board_fault"));
    assert.equal(alerts.length, 2);
  });

  test("one company alone never alerts: the Northfield coil leaks need Q-027 from Apex", () => {
    const withoutApex = run(BACKFILL).tickets.filter((ticket) => ticket.id !== "Q-027");
    assert.ok(!selectAlerts(withoutApex).some((alert) => alert.failureType === "coil_leak"));
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
    assert.equal(counters.counted, 6);
    assert.equal(counters.unclassified, 32);
    assert.ok(trendsByProduct(initialState().tickets, { companyId: "all", range: "all" }).every((row) => row.unconfirmed === 0));
  });

  test("backfill: suggested tickets count as unconfirmed, needs-review ones are excluded", () => {
    const tickets = run(BACKFILL).tickets;
    const progress = backfillProgress(tickets);
    assert.deepEqual(progress, { total: 34, classified: 26, needsReview: 8, pending: 0 });
    const counters = ticketCounters(tickets);
    assert.equal(counters.needsReview, 8);
    assert.equal(counters.duplicatesMerged, 2);
    assert.equal(counters.counted, 6 + 26 - 2);
    assert.equal(counters.unconfirmed, 24);
    assert.ok(!tickets.some((ticket) => ticket.tags.status === "confirmed" && ticket.classification && ticket.intake === "free_text"));
  });

  test("by-product view ranks resolved products; by-company view splits per company", () => {
    const tickets = run(BACKFILL).tickets;
    const all = { companyId: "all", range: "all" } as const;
    const [top] = trendsByProduct(tickets, all);
    assert.deepEqual(top, { productId: "split-ac-3t", failureType: "compressor_leak", count: 6, unconfirmed: 4 });
    const byCompany = trendsByCompany(tickets, all);
    assert.deepEqual(byCompany.map((row) => row.companyId), ["apex-air", "northfield-hvac", "cascade-comfort"]);
    assert.deepEqual(byCompany[1].rows[0], { failureType: "coil_leak", count: 4, unconfirmed: 4 });
  });

  test("filters narrow by company and by time range from DEMO_NOW", () => {
    const tickets = run(BACKFILL).tickets;
    const recent = trendsByProduct(tickets, { companyId: "all", range: "30d" });
    assert.deepEqual(recent.find((row) => row.failureType === "compressor_leak"), { productId: "split-ac-3t", failureType: "compressor_leak", count: 3, unconfirmed: 1 });
    const cascade = trendsByCompany(tickets, { companyId: "cascade-comfort", range: "90d" });
    assert.equal(cascade.length, 1);
    assert.equal(cascade[0].total, 8);
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

// Each clickable "N confirmed / N suggested" label opens exactly N records, using the chart's own counting.
describe("trend drill-down", () => {
  test("every product and company label lists as many tickets as it shows", () => {
    const withSample = qualityReducer(qualityReducer(initialState(), { type: "draft/classify", ...SAMPLE_COMPLAINT }), { type: "draft/confirm" });
    const { tickets } = qualityReducer(withSample, { type: "backfill/run" });
    const all = { companyId: "all", range: "all" } as const;
    for (const row of trendsByProduct(tickets, all)) {
      const scope = { productId: row.productId, failureType: row.failureType };
      assert.equal(trendTickets(tickets, { ...scope, status: "confirmed" }).length, row.count - row.unconfirmed);
      assert.equal(trendTickets(tickets, { ...scope, status: "suggested" }).length, row.unconfirmed);
    }
    for (const company of trendsByCompany(tickets, all)) {
      for (const row of company.rows) {
        const scope = { companyId: company.companyId, failureType: row.failureType };
        assert.equal(trendTickets(tickets, { ...scope, status: "confirmed" }).length, row.count - row.unconfirmed);
        assert.equal(trendTickets(tickets, { ...scope, status: "suggested" }).length, row.unconfirmed);
      }
    }
  });
});

// Dashboard filters narrow what is shown; the alert rule itself still runs over every record.
describe("dashboard filters", () => {
  const seeded = qualityReducer(initialState(), { type: "backfill/run" });
  const withSample = qualityReducer(qualityReducer(seeded, { type: "draft/classify", ...SAMPLE_COMPLAINT }), { type: "draft/confirm" });

  test("date, company and product filters match the records", () => {
    const tickets = filterTickets(withSample.tickets, { ...DEFAULT_DASHBOARD_FILTERS, companyId: "apex-air", productId: "split-ac-3t" });
    assert.ok(tickets.length > 0);
    for (const ticket of tickets) {
      assert.equal(ticket.companyId, "apex-air");
      assert.equal(ticket.tags.productId, "split-ac-3t");
      assert.ok(ticket.date >= isoDaysBefore(ALERT_WINDOW_DAYS - 1));
    }
    const custom = filterTickets(withSample.tickets, { ...DEFAULT_DASHBOARD_FILTERS, range: "custom", from: "2000-01-01", to: "2099-12-31" });
    assert.equal(custom.length, withSample.tickets.length);
  });

  test("seed volumes: 15 tickets in 7 days, 27 in 30 days", () => {
    assert.equal(filterTickets(seeded.tickets, { ...DEFAULT_DASHBOARD_FILTERS, range: "7d" }).length, 15);
    assert.equal(filterTickets(seeded.tickets, DEFAULT_DASHBOARD_FILTERS).length, 27);
  });

  test("date filters show alerts by real supporting dates: 1 in 7 days, 2 in 30; filters never force one", () => {
    const alerts = selectAlerts(seeded.tickets);
    assert.equal(filterAlerts(alerts, seeded.tickets, { ...DEFAULT_DASHBOARD_FILTERS, range: "7d" }).length, 1);
    assert.equal(filterAlerts(alerts, seeded.tickets, DEFAULT_DASHBOARD_FILTERS).length, 2);
    assert.equal(filterAlerts(alerts, seeded.tickets, { ...DEFAULT_DASHBOARD_FILTERS, productId: "furnace-80k" }).length, 0);
    assert.equal(filterAlerts(selectAlerts(withSample.tickets), withSample.tickets, DEFAULT_DASHBOARD_FILTERS).length, 2);
  });
});
