// PURPOSE: Proves the local classifier tags clear complaints and sends unclear ones to a person, with evidence.
// ROLE: test. USED BY: the TESTS command in docs/quality/STATUS.md.

import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { activeClassifier } from "../classifier/index";
import type { ClassifyResponse } from "../contracts";
import { SAMPLE_COMPLAINT, SEED_TICKETS } from "../data/synthetic";

/** Classifies text the same way intake and backfill do. */
function classify(text: string, modelRaw?: string): ClassifyResponse {
  return activeClassifier.classify({ ticketId: "Q-900", text, modelRaw });
}

/** Seed ticket text by ID, so tests read the same words the demo shows. */
function seedText(id: string): string {
  const ticket = SEED_TICKETS.find((candidate) => candidate.id === id);
  assert.ok(ticket, `seed ticket ${id} exists`);
  return ticket.text;
}

// Clear cues produce a suggestion with product, model and the exact words used: what the reviewer checks.
describe("suggested tags", () => {
  test("compressor leak (sample complaint, with a typo) resolves product and model", () => {
    const result = classify(SAMPLE_COMPLAINT.text);
    assert.equal(result.status, "suggested");
    assert.equal(result.failureType, "compressor_leak");
    assert.equal(result.productId, "split-ac-3t");
    assert.equal(result.modelId, "cc-410s");
    const spans = result.evidence.map((item) => item.span.toLowerCase());
    assert.ok(spans.includes("comprssor") && spans.includes("leaking") && spans.includes("cc-410s"));
  });

  test("coil leak is never filed as a compressor leak", () => {
    const result = classify(seedText("Q-007"));
    assert.equal(result.failureType, "coil_leak");
    assert.equal(result.productId, "heat-pump-4t");
  });

  test("historical synonyms and typos map to the same failure type", () => {
    for (const id of ["Q-004", "Q-005", "Q-006"]) {
      const result = classify(seedText(id));
      assert.equal(result.failureType, "compressor_leak", id);
      assert.equal(result.productId, "split-ac-3t", id);
      assert.equal(result.status, "suggested", id);
    }
  });

  test("a located leak sets aside the low-refrigerant symptom instead of competing with it", () => {
    const result = classify(seedText("Q-004"));
    assert.deepEqual(result.possibleFailureTypes, []);
    assert.ok(result.rulesFired.some((rule) => rule.includes("low-refrigerant cue set aside")));
  });

  test("the model field resolves the product when the text names no model", () => {
    const result = classify("compressor leaking at the service valve", "NF 3000S");
    assert.equal(result.productId, "split-ac-3t");
    assert.equal(result.modelId, "nf-3000s");
  });

  test("a negated leak does not block a separate low-charge cue", () => {
    assert.equal(classify(seedText("Q-024")).failureType, "refrigerant_low");
  });
});

// Anything unclear goes to a person with the reason shown; the classifier never guesses.
describe("needs review", () => {
  test("ambiguous product: models from two products named", () => {
    const result = classify("AX-C36 and AX-HP48 both on site, one of them is leaking at the compressor");
    assert.equal(result.status, "needs_review");
    assert.equal(result.reviewReason, "product_unresolved");
    assert.equal(result.productId, null);
    assert.equal(result.failureType, "compressor_leak");
  });

  test("missing model ID", () => {
    const result = classify(seedText("Q-016"));
    assert.equal(result.reviewReason, "product_unresolved");
  });

  test("negated phrase is not a compressor leak", () => {
    const result = classify(seedText("Q-017"));
    assert.equal(result.status, "needs_review");
    assert.equal(result.reviewReason, "negated");
    assert.equal(result.failureType, null);
    assert.ok(result.evidence.some((item) => item.cue.startsWith("negated")));
  });

  test("competing cues list both options and pick neither", () => {
    const result = classify(seedText("Q-019"));
    assert.equal(result.reviewReason, "competing_cues");
    assert.equal(result.failureType, null);
    assert.deepEqual(result.possibleFailureTypes, ["compressor_leak", "coil_leak"]);
  });

  test("'leak' alone is not enough for a failure type", () => {
    const result = classify(seedText("Q-025"));
    assert.equal(result.reviewReason, "no_failure_cue");
    assert.equal(result.failureType, null);
  });

  test("empty text", () => {
    const result = classify("   ");
    assert.equal(result.status, "needs_review");
    assert.equal(result.reviewReason, "empty_text");
  });

  test("no score-like fields: every tag is explained by evidence and rules", () => {
    const result = classify(SAMPLE_COMPLAINT.text);
    assert.ok(result.rulesFired.length > 0);
    assert.ok(!Object.keys(result).some((key) => /confidence|score|probab/i.test(key)));
  });
});
