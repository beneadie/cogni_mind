// PURPOSE: Pure record rules every view shares: duplicate collapsing, the counting rule, view filters and counters.
// ROLE: selector. USED BY: selectors/alerts.ts, selectors/trends.ts, rails and counters in the UI.
// Every view derives from these functions, so a confirm or correction anywhere updates every number.

import type { Filters, Ticket, TicketId, TimeRange } from "../contracts";
import { dayNumber, daysAgo, isWithinDays } from "../time";

// --- Duplicates (collapsed before anything is counted) ---

/** Case, punctuation and spacing are ignored when comparing ticket text. */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Deduplicated tickets plus, for each kept ticket, the IDs merged into it. */
export type DedupeResult = { unique: Ticket[]; mergedInto: Map<TicketId, TicketId[]> };

/** The duplicate rule in plain words, shown beside every alert. */
export const DUPLICATE_RULE_TEXT = "Same company and same wording, or a linked duplicate, is merged into one ticket before counting.";

// Duplicate = a seeded duplicateOf link, or the same company + same normalized text. The earliest ticket
// (by date, then ID) is kept; empty text never matches, since two blank records say nothing about each other.
/** Collapses duplicate tickets; order of `unique` follows the input order. */
export function dedupeTickets(tickets: readonly Ticket[]): DedupeResult {
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const firstByText = new Map<string, TicketId>();
  const canonical = new Map<TicketId, TicketId>();
  const chronological = [...tickets].sort((a, b) => dayNumber(a.date) - dayNumber(b.date) || a.id.localeCompare(b.id));

  for (const ticket of chronological) {
    let root = ticket.id;
    const seen = new Set<TicketId>();
    while (byId.get(root)?.duplicateOf && !seen.has(root)) {
      seen.add(root);
      root = byId.get(root)?.duplicateOf as TicketId;
    }
    const text = normalizeText(ticket.text);
    if (root === ticket.id && text) {
      const key = `${ticket.companyId}|${text}`;
      root = firstByText.get(key) ?? ticket.id;
      if (!firstByText.has(key)) firstByText.set(key, ticket.id);
    }
    canonical.set(ticket.id, byId.has(root) ? root : ticket.id);
  }

  const mergedInto = new Map<TicketId, TicketId[]>();
  for (const [id, root] of canonical) {
    if (id !== root) mergedInto.set(root, [...(mergedInto.get(root) ?? []), id]);
  }
  return { unique: tickets.filter((ticket) => canonical.get(ticket.id) === ticket.id), mergedInto };
}

// --- Counting rule ---

/** Statuses that count; needs_review and unclassified wait for a person. */
const COUNTED_STATUSES = new Set(["suggested", "confirmed", "corrected"]);

/** The counting rule in plain words, shown beside every alert. */
export const COUNTING_RULE_TEXT = "Counts include tickets tagged with a product and failure type that are suggested, confirmed or corrected. Needs-review and unclassified tickets wait for a person.";

// Counting rule: a ticket counts once it has a product and a failure type and is suggested, confirmed or
// corrected. Suggested tickets count but are reported as "unconfirmed" wherever counts show.
/** True when a ticket's tags are complete enough to count in trends and alerts. */
export function isCountable(ticket: Ticket): boolean {
  return Boolean(ticket.tags.productId && ticket.tags.failureType && COUNTED_STATUSES.has(ticket.tags.status));
}

/** Deduplicated, countable tickets: the only input trends and alerts read. */
export function countedTickets(tickets: readonly Ticket[]): Ticket[] {
  return dedupeTickets(tickets).unique.filter(isCountable);
}

/** Number of tickets in a list still at "suggested" (for the "includes N unconfirmed suggestions" note). */
export function unconfirmedCount(tickets: readonly Ticket[]): number {
  return tickets.filter((ticket) => ticket.tags.status === "suggested").length;
}

// --- View filters ---

/** Time range options in display order; days are measured back from DEMO_NOW (null = all time). */
export const TIME_RANGES: readonly { id: TimeRange; label: string; days: number | null }[] = [
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "all", label: "All", days: null },
];

/** Filters on first load and after Reset Demo. */
export const DEFAULT_FILTERS: Filters = { companyId: "all", range: "all" };

/** Tickets matching the company and time range filters. */
export function applyFilters(tickets: readonly Ticket[], filters: Filters): Ticket[] {
  const days = TIME_RANGES.find((range) => range.id === filters.range)?.days ?? null;
  return tickets.filter(
    (ticket) =>
      (filters.companyId === "all" || ticket.companyId === filters.companyId) &&
      (days === null || isWithinDays(ticket.date, days)),
  );
}

// --- Counters ---

/** Headline numbers for a set of tickets. */
export type TicketCounters = {
  total: number;
  counted: number;
  unconfirmed: number;
  needsReview: number;
  unclassified: number;
  duplicatesMerged: number;
};

/** Counters for the filtered tickets; needsReview + unclassified is the "unknown, not counted" figure. */
export function ticketCounters(tickets: readonly Ticket[], filters: Filters = DEFAULT_FILTERS): TicketCounters {
  // Dedupe across all records first, so a duplicate is merged even when its original falls outside the filter.
  const { unique: allUnique, mergedInto } = dedupeTickets(tickets);
  const unique = applyFilters(allUnique, filters);
  const counted = unique.filter(isCountable);
  return {
    total: applyFilters(tickets, filters).length,
    counted: counted.length,
    unconfirmed: unconfirmedCount(counted),
    needsReview: unique.filter((ticket) => ticket.tags.status === "needs_review").length,
    unclassified: unique.filter((ticket) => ticket.tags.status === "unclassified").length,
    duplicatesMerged: unique.reduce((sum, ticket) => sum + (mergedInto.get(ticket.id)?.length ?? 0), 0),
  };
}

/** True for old free-text records the backfill works on; anything dated before DEMO_NOW is historical. */
export function isHistoricalFreeText(ticket: Ticket): boolean {
  return ticket.intake === "free_text" && daysAgo(ticket.date) > 0;
}

/** Backfill progress over historical free-text records, read from what the classifier left on each ticket. */
export function backfillProgress(tickets: readonly Ticket[]): { total: number; classified: number; needsReview: number; pending: number } {
  const historical = tickets.filter(isHistoricalFreeText);
  return {
    total: historical.length,
    classified: historical.filter((ticket) => ticket.classification?.status === "suggested").length,
    needsReview: historical.filter((ticket) => ticket.classification?.status === "needs_review").length,
    pending: historical.filter((ticket) => !ticket.classification).length,
  };
}
