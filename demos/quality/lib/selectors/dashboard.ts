// PURPOSE: Dashboard view filters (date range, company, product) and the functions that apply them.
// ROLE: selector. USED BY: demos/quality/page.tsx, components/dashboard-filters.tsx, tests.
// View-only: filters narrow what the dashboard shows; they never change records or the alert rule itself.

import type { CompanyId, ProductId, QualityAlert, Ticket } from "../contracts";
import { DEMO_NOW, isWithinDays, isoDaysBefore } from "../time";

/** Dashboard filters; custom dates are inclusive ISO days. */
export type DashboardFilters = {
  range: "7d" | "30d" | "custom";
  from: string;
  to: string;
  companyId: CompanyId | "all";
  productId: ProductId | "all";
};

/** Default on load and after Reset Demo: last 30 days, everything. */
export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = { range: "30d", from: isoDaysBefore(29), to: DEMO_NOW, companyId: "all", productId: "all" };


/** True when a ticket's date falls inside the selected range (days counted back from the demo clock). */
function inRange(ticket: Ticket, filters: DashboardFilters): boolean {
  if (filters.range === "7d") return isWithinDays(ticket.date, 7);
  if (filters.range === "30d") return isWithinDays(ticket.date, 30);
  return (!filters.from || ticket.date >= filters.from) && (!filters.to || ticket.date <= filters.to);
}

/** Tickets matching every dashboard filter. Tickets with no product yet drop out only when a product is chosen. */
export function filterTickets(tickets: readonly Ticket[], filters: DashboardFilters): Ticket[] {
  return tickets.filter(
    (ticket) =>
      inRange(ticket, filters) &&
      (filters.companyId === "all" || ticket.companyId === filters.companyId) &&
      (filters.productId === "all" || ticket.tags.productId === filters.productId),
  );
}

/** Alerts relevant to the filters. The alert rule itself always runs over all records; this only hides alerts
 *  for another product or company, or with no supporting ticket inside the selected dates. */
export function filterAlerts(alerts: readonly QualityAlert[], tickets: readonly Ticket[], filters: DashboardFilters): QualityAlert[] {
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  return alerts.filter(
    (alert) =>
      (filters.productId === "all" || alert.productId === filters.productId) &&
      (filters.companyId === "all" || alert.companyIds.includes(filters.companyId)) &&
      alert.ticketIds.some((id) => {
        const ticket = byId.get(id);
        return ticket ? inRange(ticket, filters) : false;
      }),
  );
}
