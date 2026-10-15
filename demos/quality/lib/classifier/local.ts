// PURPOSE: Deterministic local classifier: resolves the product from legacy model aliases and the failure type from cue rules.
// ROLE: classifier. USED BY: classifier/index.ts (as the active Classifier).
// DEMO-ONLY: keyword rules, not a model. Every tag comes with the exact words that produced it; no scores.

import type { ClassifyRequest, ClassifyResponse, Evidence, FailureType, ModelId, ProductId, ReviewReason } from "../contracts";
import { MODELS, failureOrder, productName } from "../data/catalog";
import type { Classifier } from "./index";
import { CLAUSE_SPLIT, CUE_RULES, NEGATION } from "./rules";

/** Version stamped on every response, kept on the ticket as provenance. */
export const LOCAL_CLASSIFIER_VERSION = "local-keyword-rules-v1";

// --- Product resolution (legacy model aliases -> canonical product) ---

/** Alias regex tolerant of case, spaces and dashes: "NF-3000S" matches "nf3000s" and "NF 3000S". */
function aliasPattern(alias: string): RegExp {
  const chunks = alias.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return new RegExp(`(?<![a-z0-9])${chunks.join("[\\s\\-_/]*")}(?![a-z0-9])`, "i");
}

const ALIAS_MATCHERS = MODELS.flatMap((model) => (model.aliases as readonly string[]).map((alias) => ({ model, pattern: aliasPattern(alias) })));

type ProductResult = { productId: ProductId | null; modelId: ModelId | null; evidence: Evidence[]; rules: string[] };

/** Finds every model alias in a string and reports the spans that matched. */
function matchModels(source: string): { modelIds: Set<ModelId>; evidence: Evidence[] } {
  const modelIds = new Set<ModelId>();
  const evidence: Evidence[] = [];
  for (const { model, pattern } of ALIAS_MATCHERS) {
    const hit = pattern.exec(source);
    if (!hit || modelIds.has(model.id)) continue;
    modelIds.add(model.id);
    evidence.push({ span: hit[0], cue: `model alias ${model.label} → ${productName(model.productId)}` });
  }
  return { modelIds, evidence };
}

// The model field wins when it resolves; otherwise fall back to models named in the text. A product is
// only set when every matched model belongs to the same canonical product: we never pick one of two.
function resolveProduct(request: ClassifyRequest): ProductResult {
  const fromField = request.modelRaw ? matchModels(request.modelRaw) : null;
  const found = fromField && fromField.modelIds.size > 0 ? fromField : matchModels(request.text);
  const products = new Set(MODELS.filter((model) => found.modelIds.has(model.id)).map((model) => model.productId));
  if (products.size === 1) {
    const [productId] = products;
    const modelId = found.modelIds.size === 1 ? [...found.modelIds][0] : null;
    return { productId, modelId, evidence: found.evidence, rules: [`Legacy model resolved to canonical product → ${productName(productId)}`] };
  }
  const rules =
    products.size > 1
      ? ["Models from different products named → product left for a person"]
      : ["No known model ID in the text or model field → product left for a person"];
  return { productId: null, modelId: null, evidence: found.evidence, rules };
}

// --- Failure detection (cue rules, negation, competing cues) ---

type FailureResult = { fired: FailureType[]; evidence: Evidence[]; negated: Evidence[]; rules: string[]; bareSymptoms: string[] };

/** First match of a group in a clause, split into hits that stand and hits a negation word cancels. */
function groupHits(pattern: RegExp, clause: string, symptom: boolean): { hit: string | null; negated: string[] } {
  const negated: string[] = [];
  for (const match of clause.matchAll(pattern)) {
    // Negation only applies to symptoms and only looks backwards inside the clause: "no leak found" cancels
    // "leak", but "compressor fine" in the next clause cannot revive it.
    if (symptom && NEGATION.test(clause.slice(0, match.index))) {
      negated.push(match[0]);
      continue;
    }
    return { hit: match[0], negated };
  }
  return { hit: null, negated };
}

function detectFailure(text: string): FailureResult {
  const clauses = text.split(CLAUSE_SPLIT).filter((clause) => clause.trim());
  const firedRules: { failureType: FailureType; evidence: Evidence[]; rule: string; suppressedBy?: readonly FailureType[] }[] = [];
  const negated: Evidence[] = [];
  const bareSymptoms: string[] = [];

  for (const cueRule of CUE_RULES) {
    for (const clause of clauses) {
      const hits = cueRule.groups.map((group) => ({ group, ...groupHits(group.pattern, clause, group.symptom) }));
      for (const { group, negated: cancelled } of hits) {
        for (const span of cancelled) negated.push({ span, cue: `negated ${group.label}` });
      }
      if (hits.every((entry) => entry.hit)) {
        firedRules.push({
          failureType: cueRule.failureType,
          evidence: hits.map((entry) => ({ span: entry.hit as string, cue: entry.group.label })),
          rule: cueRule.rule,
          suppressedBy: cueRule.suppressedBy,
        });
        break;
      }
      // A symptom with no component ("unit leaking") is remembered only to explain why nothing fired.
      const symptomHit = hits.find((entry) => entry.group.symptom && entry.hit);
      if (symptomHit?.hit && hits.length > 1) bareSymptoms.push(symptomHit.hit);
    }
  }

  const firedTypes = new Set(firedRules.map((fired) => fired.failureType));
  const rules: string[] = [];
  const kept = firedRules.filter((fired) => {
    const winner = fired.suppressedBy?.find((type) => firedTypes.has(type));
    if (winner) rules.push("Located leak explains the low charge → low-refrigerant cue set aside");
    return !winner;
  });
  rules.unshift(...kept.map((fired) => fired.rule));

  return {
    fired: kept.map((fired) => fired.failureType).sort((a, b) => failureOrder(a) - failureOrder(b)),
    evidence: kept.flatMap((fired) => fired.evidence),
    negated: dedupeEvidence(negated),
    rules,
    bareSymptoms: [...new Set(bareSymptoms.map((span) => span.toLowerCase()))],
  };
}

/** Drops repeated span/cue pairs so the same words are not listed twice. */
function dedupeEvidence(evidence: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  return evidence.filter((item) => {
    const key = `${item.span.toLowerCase()}|${item.cue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- Decision (which tags to suggest, or why a person must decide) ---

/** The local keyword classifier. SWAP-POINT: replace with a trained or LLM classifier behind the same Classifier contract. */
export const localClassifier: Classifier = {
  version: LOCAL_CLASSIFIER_VERSION,
  classify(request: ClassifyRequest): ClassifyResponse {
    const base = { ticketId: request.ticketId, classifierVersion: LOCAL_CLASSIFIER_VERSION, possibleFailureTypes: [] as FailureType[] };
    if (!request.text.trim()) {
      return {
        ...base,
        productId: null,
        modelId: null,
        failureType: null,
        evidence: [],
        rulesFired: ["No text to read → needs a person"],
        status: "needs_review",
        reviewReason: "empty_text",
      };
    }

    const product = resolveProduct(request);
    const failure = detectFailure(request.text);
    const rulesFired = [...product.rules, ...failure.rules];
    let reviewReason: ReviewReason | undefined;
    let failureType: FailureType | null = null;
    let possibleFailureTypes: FailureType[] = [];

    if (failure.fired.length === 0) {
      // A cancelled cue is reported as "negated" so the reviewer sees we read it and deliberately did not tag it.
      reviewReason = failure.negated.length > 0 ? "negated" : "no_failure_cue";
      if (failure.negated.length > 0) rulesFired.push("Symptom is negated in the text → no failure type suggested");
      else if (failure.bareSymptoms.length > 0) rulesFired.push(`"${failure.bareSymptoms.join('", "')}" found without a component → not enough to pick a failure type`);
      else rulesFired.push("No failure cue found → needs a person");
    } else if (failure.fired.length > 1) {
      // Competing cues: we list the options instead of guessing; the person picks one.
      reviewReason = "competing_cues";
      possibleFailureTypes = failure.fired;
      rulesFired.push("Cues for more than one failure type → person chooses");
    } else {
      failureType = failure.fired[0];
      if (!product.productId) reviewReason = "product_unresolved";
    }

    return {
      ...base,
      productId: product.productId,
      modelId: product.modelId,
      failureType,
      evidence: dedupeEvidence([...product.evidence, ...failure.evidence, ...failure.negated]),
      possibleFailureTypes,
      rulesFired,
      status: reviewReason ? "needs_review" : "suggested",
      reviewReason,
    };
  },
};
