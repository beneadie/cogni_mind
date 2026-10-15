// PURPOSE: Typed IDs and records every Quality module agrees on: tickets, alerts, filters, classifier request/response.
// ROLE: contract. USED BY: data, classifier, selectors, state, components.
// CONTRACT: Ticket, QualityAlert and ClassifyRequest/Response are the shapes PLM or Support would consume.

import type { COMPANIES, FAILURE_TYPES, MODELS, PRODUCTS } from "./data/catalog";

/** ID of a fictional ACS operating company, derived from the catalog so IDs are defined once. */
export type CompanyId = (typeof COMPANIES)[number]["id"];

/** ID of a canonical ACS-wide product line. */
export type ProductId = (typeof PRODUCTS)[number]["id"];

/** ID of one company's legacy model of a canonical product. */
export type ModelId = (typeof MODELS)[number]["id"];

/** One value from the forced-choice failure list. */
export type FailureType = (typeof FAILURE_TYPES)[number]["id"];

/** Quality ticket ID, e.g. "Q-007". */
export type TicketId = `Q-${string}`;

/** Warranty claim or internal quality report. */
export type TicketKind = "warranty" | "quality";

/** How the ticket was captured: the old free-text box or the new forced-choice form. */
export type IntakeChannel = "free_text" | "forced_choice";

/** Lifecycle of a ticket's tags; only confirmed/corrected have passed the human gate. */
export type TagStatus = "unclassified" | "suggested" | "needs_review" | "confirmed" | "corrected";

/** Product, model and failure tags on a ticket, plus where they are in review. */
export type TicketTags = {
  productId: ProductId | null;
  modelId: ModelId | null;
  failureType: FailureType | null;
  status: TagStatus;
};

/** CONTRACT: one warranty or quality ticket. Original text is never rewritten; tags change through review. */
export type Ticket = {
  id: TicketId;
  companyId: CompanyId;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  kind: TicketKind;
  intake: IntakeChannel;
  text: string;
  modelRaw?: string;
  supportCaseId?: string;
  duplicateOf?: TicketId;
  tags: TicketTags;
  /** Provenance: the classifier output these tags came from, kept even after a person confirms or corrects. */
  classification?: ClassifyResponse;
};

/** Why a ticket was left for a person instead of being suggested. */
export type ReviewReason = "no_failure_cue" | "negated" | "competing_cues" | "product_unresolved" | "empty_text";

/** One matched piece of the original text and what it was taken as. */
export type Evidence = { span: string; cue: string };

/** CONTRACT: input to any classifier. companyId is passed for real classifiers that keep per-company vocab. */
export type ClassifyRequest = {
  ticketId: TicketId;
  text: string;
  companyId?: CompanyId;
  modelRaw?: string;
};

/** CONTRACT: classifier output. No scores: evidence spans and plain-language rules explain every tag. */
export type ClassifyResponse = {
  ticketId: TicketId;
  classifierVersion: string;
  productId: ProductId | null;
  modelId: ModelId | null;
  failureType: FailureType | null;
  evidence: Evidence[];
  /** Filled only when cues for two or more failure types compete. */
  possibleFailureTypes: FailureType[];
  /** Plain-language rules that fired, in order, for the step list. */
  rulesFired: string[];
  status: "suggested" | "needs_review";
  reviewReason?: ReviewReason;
};

/** CONTRACT: a repeating failure that met the alert rule. A lead for investigation, not a root cause. */
export type QualityAlert = {
  id: string;
  productId: ProductId;
  failureType: FailureType;
  /** Deduplicated contributing tickets, newest first. */
  ticketIds: TicketId[];
  companyIds: CompanyId[];
  /** First and last ISO day of the rolling window. */
  windowStart: string;
  windowEnd: string;
  /** Contributing tickets still at "suggested" (not yet human-confirmed). */
  unconfirmedCount: number;
  /** Duplicate tickets collapsed into the contributing ones. */
  duplicatesMerged: number;
};

/** Time range options for the views, measured back from DEMO_NOW. */
export type TimeRange = "30d" | "90d" | "all";

/** View filters for trends and counters (alerts ignore them and always use the alert window). */
export type Filters = { companyId: CompanyId | "all"; range: TimeRange };
