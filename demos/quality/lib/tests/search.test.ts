// PURPOSE: Proves "Ask Quality Control" answers only from the records: right tickets, same counts as the dashboard, honest fallbacks.
// ROLE: test. USED BY: the TESTS command in docs/quality/STATUS.md.

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SAMPLE_COMPLAINT } from "../data/synthetic";
import { activeSearch } from "../search/index";
import { selectAlerts } from "../selectors/alerts";
import { countedTickets } from "../selectors/records";
import { initialState, qualityReducer } from "../state/reducer";

/** Demo state as the dashboard shows it: history classified, sample complaint created. */
function dashboardState() {
  const history = qualityReducer(initialState(), { type: "backfill/run" });
  return qualityReducer(qualityReducer(history, { type: "draft/classify", text: SAMPLE_COMPLAINT.text }), { type: "draft/confirm" });
}

describe("search", () => {
  const { tickets } = dashboardState();

  test("a failure type returns exactly the tickets tagged with it", () => {
    const result = activeSearch.ask("Show me compressor leak complaints", tickets);
    const expected = tickets.filter((ticket) => ticket.tags.failureType === "compressor_leak").map((ticket) => ticket.id);
    assert.equal(result.kind, "tickets");
    assert.deepEqual([...result.ticketIds].sort(), [...expected].sort());
  });

  test("company and status filters combine", () => {
    const result = activeSearch.ask("Which Apex Air complaints need review?", tickets);
    assert.ok(result.ticketIds.length > 0);
    for (const id of result.ticketIds) {
      const ticket = tickets.find((candidate) => candidate.id === id);
      assert.equal(ticket?.companyId, "apex-air");
      assert.equal(ticket?.tags.status, "needs_review");
    }
  });

  test("rankings use the dashboard counting rule", () => {
    const result = activeSearch.ask("Which product has the most complaints?", tickets);
    assert.equal(result.kind, "ranking");
    assert.equal(result.rows.reduce((sum, row) => sum + row.count, 0), countedTickets(tickets).length);
  });

  test("recurring failures are the alert rule's alerts", () => {
    const result = activeSearch.ask("Show recurring failures across companies", tickets);
    assert.deepEqual(result.ticketIds, selectAlerts(tickets).flatMap((alert) => alert.ticketIds));
  });

  test("keyword search matches whole words only", () => {
    const result = activeSearch.ask("oil", tickets);
    for (const id of result.ticketIds) {
      assert.match(tickets.find((ticket) => ticket.id === id)?.text ?? "", /\boil/i);
    }
  });

  test("questions outside the records get an honest fallback, never tickets", () => {
    for (const question of ["Why do compressors fail?", "what's the weather", "How much did warranty cost?"]) {
      const result = activeSearch.ask(question, tickets);
      assert.equal(result.kind, "unanswerable", question);
      assert.deepEqual(result.ticketIds, []);
    }
  });

  test("answers follow corrections in the records", () => {
    const corrected = qualityReducer(dashboardState(), { type: "ticket/correct", ticketId: "Q-025", correction: { productId: "heat-pump-4t", modelId: "cc-hp4", failureType: "coil_leak" } });
    const before = activeSearch.ask("How many coil leak issues do we have?", tickets).ticketIds.length;
    const after = activeSearch.ask("How many coil leak issues do we have?", corrected.tickets).ticketIds.length;
    assert.equal(after, before + 1);
  });
});
