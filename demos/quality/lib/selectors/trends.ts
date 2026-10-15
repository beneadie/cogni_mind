// PURPOSE: "By product" and "By company" views: ranked failure counts over counted tickets, after view filters.
// ROLE: selector. USED BY: trend views and their bar charts.
// Legacy models are already resolved to canonical products by the classifier, so each product appears once.

import type { CompanyId, FailureType, Filters, ProductId, Ticket } from "../contracts";
import { COMPANIES, failureOrder } from "../data/catalog";
import { applyFilters, countedTickets } from "./records";

/** One ranked bar: how many counted tickets share a key, and how many of those are unconfirmed. */
export type TrendRow<K> = K & { count: number; unconfirmed: number };

/** Groups tickets by a key and ranks the groups, largest first (ties keep failure-list order). */
function rank<K extends { failureType: FailureType }>(tickets: readonly Ticket[], keyOf: (ticket: Ticket) => K): TrendRow<K>[] {
  const rows = new Map<string, TrendRow<K>>();
  for (const ticket of tickets) {
    const key = keyOf(ticket);
    const id = JSON.stringify(key);
    const row = rows.get(id) ?? { ...key, count: 0, unconfirmed: 0 };
    row.count += 1;
    if (ticket.tags.status === "suggested") row.unconfirmed += 1;
    rows.set(id, row);
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || failureOrder(a.failureType) - failureOrder(b.failureType));
}

/** Ranked product + failure type pairs for the filtered, counted tickets. */
export function trendsByProduct(tickets: readonly Ticket[], filters: Filters): TrendRow<{ productId: ProductId; failureType: FailureType }>[] {
  return rank(applyFilters(countedTickets(tickets), filters), (ticket) => ({
    productId: ticket.tags.productId as ProductId,
    failureType: ticket.tags.failureType as FailureType,
  }));
}

/** Ranked failure types per company (companies in catalog order, only those in the filter). */
export function trendsByCompany(
  tickets: readonly Ticket[],
  filters: Filters,
): { companyId: CompanyId; total: number; rows: TrendRow<{ failureType: FailureType }>[] }[] {
  const counted = applyFilters(countedTickets(tickets), filters);
  return COMPANIES.filter((company) => filters.companyId === "all" || company.id === filters.companyId).map((company) => {
    const own = counted.filter((ticket) => ticket.companyId === company.id);
    return {
      companyId: company.id,
      total: own.length,
      rows: rank(own, (ticket) => ({ failureType: ticket.tags.failureType as FailureType })),
    };
  });
}
