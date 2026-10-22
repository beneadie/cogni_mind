// PURPOSE: Deterministic local search: reads a plain-language question as filters and an intent, then answers from the records.
// ROLE: search. USED BY: search/index.ts (as the active QualitySearch).
// DEMO-ONLY: phrase lists and regexes, not a language model. Anything it cannot map to the records gets an honest fallback.

import type { CompanyId, FailureType, ModelId, ProductId, TagStatus, Ticket } from "../contracts";
import { COMPANIES, FAILURE_TYPES, MODELS, companyName, failureLabel, productName } from "../data/catalog";
import { selectAlerts } from "../selectors/alerts";
import { dedupeTickets, isCountable, normalizeText } from "../selectors/records";
import { dayNumber, isWithinDays } from "../time";
import type { QualitySearch, SearchAnswer, SearchRow } from "./index";

export const LOCAL_SEARCH_VERSION = "local-keyword-search-v1";

// --- Vocabulary (matched against normalized text: lowercase, punctuation as spaces) ---

/** Ways a person names each canonical product. */
const PRODUCT_PHRASES: Record<ProductId, string[]> = {
  "split-ac-3t": ["3 ton split", "3 ton ac", "split ac", "split system", "split air"],
  "heat-pump-4t": ["heat pump"],
  "rtu-10t": ["rooftop", "rtu"],
  "furnace-80k": ["furnace"],
};

/** Ways a person names each failure type (the catalog label is matched too). */
const FAILURE_PHRASES: Record<FailureType, string[]> = {
  compressor_leak: ["compressor leak", "compressor leaks", "leaking compressor"],
  coil_leak: ["coil leak", "coil leaks", "leaking coil"],
  refrigerant_low: ["low refrigerant", "refrigerant low", "low charge", "low on freon"],
  control_board_fault: ["control board", "board fault", "board failure"],
  fan_motor_failure: ["fan motor", "fan failure"],
  door_latch_panel: ["door latch", "latch", "panel"],
  condensate_drain: ["condensate", "drain"],
  electrical_trip: ["breaker", "electrical", "tripping"],
};

/** Review-status words; "confirmed" includes corrected tickets, since both passed a person. */
const STATUS_PHRASES: { statuses: TagStatus[]; label: string; pattern: RegExp }[] = [
  { statuses: ["needs_review"], label: "Needs review", pattern: /\b(need|needs|needing) review\b|\bunreviewed\b|\bmissing details\b/ },
  { statuses: ["suggested"], label: "Suggested (unconfirmed)", pattern: /\b(suggested|unconfirmed)\b/ },
  { statuses: ["confirmed", "corrected"], label: "Confirmed or corrected", pattern: /\bconfirmed\b/ },
  { statuses: ["corrected"], label: "Corrected", pattern: /\bcorrected\b/ },
];

/** Questions the records cannot answer: causes, money, stock, people. */
const OUT_OF_SCOPE = /\b(why|root cause|cause|cost|costs|price|spend|inventory|stock|supplier|warehouse|lead time|who fixed|technician name)\b/;

/** Filler words ignored by the plain keyword fallback. */
const STOPWORDS = new Set(
  "a an the me show list find give all any of for from in on at to and or with about what which who how many much is are was were we our us do does did have has had seen see get tell complaints complaint tickets ticket issues issue records record quality problems problem there that this most common".split(" "),
);

const has = (text: string, phrase: string) => ` ${text} `.includes(` ${phrase} `);
/** Model aliases compared without spaces or dashes, so "cc 410s" and "CC-410S" both match. */
const compact = (text: string) => text.replace(/[^a-z0-9]/g, "");

// --- Reading the question ---

type Parsed = {
  companyIds: CompanyId[];
  productIds: ProductId[];
  modelIds: ModelId[];
  failureTypes: FailureType[];
  statuses: TagStatus[];
  days: number | null;
  understood: string[];
  keywords: string[];
};

function parse(question: string): Parsed {
  const text = normalizeText(question);
  const squashed = compact(text);
  const understood: string[] = [];

  const companyIds = COMPANIES.filter((company) => has(text, normalizeText(company.name)) || has(text, normalizeText(company.name).split(" ")[0])).map((company) => company.id);
  for (const id of companyIds) understood.push(`Company: ${companyName(id)}`);

  const modelIds = MODELS.filter((model) => model.aliases.some((alias) => squashed.includes(compact(alias.toLowerCase())))).map((model) => model.id);
  for (const id of modelIds) understood.push(`Model: ${MODELS.find((model) => model.id === id)?.label}`);

  const productIds = (Object.keys(PRODUCT_PHRASES) as ProductId[]).filter((id) => PRODUCT_PHRASES[id].some((phrase) => has(text, phrase)));
  for (const id of productIds) understood.push(`Product: ${productName(id)}`);

  let failureTypes = FAILURE_TYPES.filter((failure) => [normalizeText(failure.label), ...FAILURE_PHRASES[failure.id]].some((phrase) => has(text, phrase))).map((failure) => failure.id);
  // "leak" alone names no component; read it as either located leak type rather than picking one.
  if (failureTypes.length === 0 && /\bleak(s|ing)?\b/.test(text)) failureTypes = ["compressor_leak", "coil_leak"];
  for (const id of failureTypes) understood.push(`Failure: ${failureLabel(id)}`);

  const statusMatches = STATUS_PHRASES.filter((entry) => entry.pattern.test(text));
  const statuses = [...new Set(statusMatches.flatMap((entry) => entry.statuses))];
  for (const entry of statusMatches) understood.push(`Status: ${entry.label}`);

  // Only explicit windows ("last 30 days", "past 2 weeks"); no guessing what "recent" means.
  const window = /\b(last|past|previous)\s+(\d+)\s+(day|days|week|weeks)\b/.exec(text);
  const days = window ? Number(window[2]) * (window[3].startsWith("week") ? 7 : 1) : null;
  if (days !== null) understood.push(`Date: last ${days} days`);

  const keywords = text.split(" ").filter((word) => word.length > 2 && !STOPWORDS.has(word));
  return { companyIds, productIds, modelIds, failureTypes, statuses, days, understood, keywords };
}

function hasFilters(parsed: Parsed): boolean {
  return Boolean(parsed.companyIds.length || parsed.productIds.length || parsed.modelIds.length || parsed.failureTypes.length || parsed.statuses.length || parsed.days !== null);
}

function matches(ticket: Ticket, parsed: Parsed): boolean {
  const { tags } = ticket;
  return (
    (!parsed.companyIds.length || parsed.companyIds.includes(ticket.companyId)) &&
    (!parsed.modelIds.length || (tags.modelId !== null && parsed.modelIds.includes(tags.modelId))) &&
    (!parsed.productIds.length || (tags.productId !== null && parsed.productIds.includes(tags.productId))) &&
    (!parsed.failureTypes.length || (tags.failureType !== null && parsed.failureTypes.includes(tags.failureType))) &&
    (!parsed.statuses.length || parsed.statuses.includes(tags.status)) &&
    (parsed.days === null || isWithinDays(ticket.date, parsed.days))
  );
}

// --- Answering ---

const newestFirst = (a: Ticket, b: Ticket) => dayNumber(b.date) - dayNumber(a.date) || b.id.localeCompare(a.id);
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** "3 confirmed, 2 suggested, 1 needs review" over a ticket list, leaving out zero parts. */
function statusBreakdown(tickets: readonly Ticket[]): string {
  const confirmed = tickets.filter((ticket) => ticket.tags.status === "confirmed" || ticket.tags.status === "corrected").length;
  const suggested = tickets.filter((ticket) => ticket.tags.status === "suggested").length;
  const review = tickets.filter((ticket) => ticket.tags.status === "needs_review").length;
  const unclassified = tickets.filter((ticket) => ticket.tags.status === "unclassified").length;
  const parts = [
    confirmed ? `${confirmed} confirmed` : "",
    suggested ? `${suggested} suggested, not yet confirmed` : "",
    review ? `${review} need${review === 1 ? "s" : ""} review` : "",
    unclassified ? `${unclassified} not classified yet` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Ranks counted (deduplicated, tagged) tickets by a key, the same counting rule the dashboard bars use. */
function ranking(tickets: readonly Ticket[], keyOf: (ticket: Ticket) => string, order: (key: string) => number = () => 0): SearchRow[] {
  const rows = new Map<string, SearchRow>();
  for (const ticket of dedupeTickets(tickets).unique.filter(isCountable)) {
    const label = keyOf(ticket);
    const row = rows.get(label) ?? { label, count: 0, unconfirmed: 0 };
    row.count += 1;
    if (ticket.tags.status === "suggested") row.unconfirmed += 1;
    rows.set(label, row);
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || order(a.label) - order(b.label));
}

function unanswerable(answer: string, understood: string[] = []): SearchAnswer {
  return { kind: "unanswerable", answer, understood, ticketIds: [], rows: [] };
}

function answer(question: string, tickets: readonly Ticket[]): SearchAnswer {
  const text = normalizeText(question);
  if (!text) return unanswerable("Type a question about the ticket records.");
  if (OUT_OF_SCOPE.test(text)) {
    return unanswerable("The ticket records don't hold causes, costs, inventory or supplier data, so I can't answer that. I can find tickets by product, model, company, failure type, review status or date.");
  }

  const parsed = parse(question);
  const scoped = tickets.filter((ticket) => matches(ticket, parsed));

  // Recurring failures: the dashboard's own alert rule, never a separate notion of "recurring".
  if (/\b(recurring|repeat|repeating|repeated|alert|alerts|pattern|patterns)\b|across companies/.test(text)) {
    const alerts = selectAlerts(tickets).filter((alert) => (!parsed.productIds.length || parsed.productIds.includes(alert.productId)) && (!parsed.failureTypes.length || parsed.failureTypes.includes(alert.failureType)));
    const ids = alerts.flatMap((alert) => alert.ticketIds);
    const list = alerts.map((alert) => `${failureLabel(alert.failureType)} on the ${productName(alert.productId)} (${plural(alert.ticketIds.length, "ticket")}, ${alert.companyIds.length} companies)`);
    return {
      kind: "alerts",
      answer: alerts.length
        ? `${plural(alerts.length, "recurring failure")} right now: ${list.join("; ")}. A lead for investigation, not proof of root cause.`
        : "No failure is repeating across companies right now under the alert rule.",
      understood: ["Recurring failures (alert rule)", ...parsed.understood],
      ticketIds: [...new Set(ids)],
      rows: [],
    };
  }

  // "Which product / company has the most…", "most common failures": grouped counts.
  if (/\b(most|top|common|rank|ranking|breakdown|biggest|worst)\b/.test(text)) {
    const byCompany = /\bcompan(y|ies)\b/.test(text);
    const byProduct = !byCompany && /\bproducts?\b/.test(text);
    const rows = byCompany
      ? ranking(scoped, (ticket) => companyName(ticket.companyId), (label) => COMPANIES.findIndex((company) => company.name === label))
      : byProduct
        ? ranking(scoped, (ticket) => productName(ticket.tags.productId as ProductId))
        : ranking(scoped, (ticket) => failureLabel(ticket.tags.failureType as FailureType), (label) => FAILURE_TYPES.findIndex((failure) => failure.label === label));
    if (rows.length === 0) return unanswerable("No tagged tickets match that yet.", parsed.understood);
    const top = rows[0];
    const ties = rows.filter((row) => row.count === top.count).map((row) => row.label);
    const subject = byCompany ? "company" : byProduct ? "product" : "failure";
    const lead = ties.length > 1 ? `${ties.join(" and ")} are tied` : `${top.label} leads`;
    return {
      kind: "ranking",
      answer: `${lead} with ${plural(top.count, "ticket")}. Duplicates merged, untagged tickets left out.`,
      understood: [`Most common by ${subject}`, ...parsed.understood],
      ticketIds: [],
      rows,
    };
  }

  // Filtered list ("show compressor leaks", "how many coil leaks", "complaints from Apex Air").
  let found = hasFilters(parsed) ? scoped : [];
  let understood = parsed.understood;
  // Plain keyword search over the original words when no filter was recognized.
  if (!hasFilters(parsed) && parsed.keywords.length) {
    found = tickets.filter((ticket) => {
      // Whole-word starts only, so "oil" finds "oily" but not "coil".
      const words = ` ${normalizeText(ticket.text)}`;
      return parsed.keywords.every((keyword) => words.includes(` ${keyword}`));
    });
    understood = [`Words: ${parsed.keywords.map((keyword) => `"${keyword}"`).join(", ")}`];
  }
  if (!hasFilters(parsed) && !found.length) {
    return unanswerable("I couldn't match that to the ticket records. Try a product, model, company, failure type or review status, for example \"Show tickets from Apex Air\".", understood);
  }

  const sorted = [...found].sort(newestFirst);
  const merged = new Set([...dedupeTickets(tickets).mergedInto.values()].flat());
  const duplicates = sorted.filter((ticket) => merged.has(ticket.id)).length;
  const how = /\bhow many\b/.test(text);
  return {
    kind: "tickets",
    answer: sorted.length
      ? `${how ? "There are " : "Found "}${plural(sorted.length, "ticket")}: ${statusBreakdown(sorted)}.${duplicates ? ` ${duplicates === 1 ? "1 is a duplicate" : `${duplicates} are duplicates`} of an earlier ticket.` : ""}`
      : "No tickets match that in the current records.",
    understood,
    ticketIds: sorted.map((ticket) => ticket.id),
    rows: [],
  };
}

/** The local search. SWAP-POINT: replace with an LLM-backed search behind the same QualitySearch contract. */
export const localSearch: QualitySearch = {
  version: LOCAL_SEARCH_VERSION,
  ask: answer,
};
