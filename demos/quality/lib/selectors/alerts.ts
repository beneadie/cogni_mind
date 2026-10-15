// PURPOSE: Finds recurring failures that meet the alert rule and assembles each alert's example tickets.
// ROLE: selector. USED BY: alert cards, evidence rail, ticket status tags ("Alert").
// The alert rule is deterministic, not AI: counts over tickets that already passed the counting rule.

import type { QualityAlert, Ticket, TicketId } from "../contracts";
import { failureOrder } from "../data/catalog";
import { ALERT_MIN_COMPANIES, ALERT_MIN_TICKETS, ALERT_WINDOW_DAYS, EXAMPLE_TICKETS_SHOWN } from "../thresholds";
import { DEMO_NOW, dayNumber, isWithinDays, isoDaysBefore } from "../time";
import { dedupeTickets, isCountable, unconfirmedCount } from "./records";

/** Newest first, then highest ID, so example lists are stable. */
function newestFirst(a: Ticket, b: Ticket): number {
  return dayNumber(b.date) - dayNumber(a.date) || b.id.localeCompare(a.id);
}

// --- Alert rule (deterministic, not AI) ---

// >= ALERT_MIN_TICKETS distinct tickets, same canonical product + failure type, dated inside the rolling
// ALERT_WINDOW_DAYS window ending on DEMO_NOW, from >= ALERT_MIN_COMPANIES companies. Duplicates are
// collapsed first, so a customer calling three times is one ticket. View filters never apply here.
/** Every alert currently firing, largest first. */
export function selectAlerts(tickets: readonly Ticket[]): QualityAlert[] {
  const { unique, mergedInto } = dedupeTickets(tickets);
  const groups = new Map<string, Ticket[]>();
  for (const ticket of unique) {
    if (!isCountable(ticket) || !isWithinDays(ticket.date, ALERT_WINDOW_DAYS)) continue;
    const key = `${ticket.tags.productId}|${ticket.tags.failureType}`;
    groups.set(key, [...(groups.get(key) ?? []), ticket]);
  }

  const alerts: QualityAlert[] = [];
  for (const [key, group] of groups) {
    const companyIds = [...new Set(group.map((ticket) => ticket.companyId))];
    if (group.length < ALERT_MIN_TICKETS || companyIds.length < ALERT_MIN_COMPANIES) continue;
    const sorted = [...group].sort(newestFirst);
    const { productId, failureType } = sorted[0].tags;
    if (!productId || !failureType) continue;
    alerts.push({
      id: `alert:${key}`,
      productId,
      failureType,
      ticketIds: sorted.map((ticket) => ticket.id),
      companyIds,
      windowStart: isoDaysBefore(ALERT_WINDOW_DAYS - 1),
      windowEnd: DEMO_NOW,
      unconfirmedCount: unconfirmedCount(sorted),
      duplicatesMerged: sorted.reduce((sum, ticket) => sum + (mergedInto.get(ticket.id)?.length ?? 0), 0),
    });
  }
  return alerts.sort((a, b) => b.ticketIds.length - a.ticketIds.length || failureOrder(a.failureType) - failureOrder(b.failureType));
}

/** IDs of every ticket contributing to any alert (for the "Alert" status tag in the ticket list). */
export function alertTicketIds(alerts: readonly QualityAlert[]): Set<TicketId> {
  return new Set(alerts.flatMap((alert) => alert.ticketIds));
}

// --- Evidence ---

/** An alert's example tickets: the first few for the card, the full list behind "Show all N". */
export type AlertEvidence = { examples: Ticket[]; all: Ticket[]; hiddenCount: number; duplicatesMerged: number };

/** Example tickets for one alert, newest first, capped at EXAMPLE_TICKETS_SHOWN. */
export function alertEvidence(alert: QualityAlert, tickets: readonly Ticket[]): AlertEvidence {
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const all = alert.ticketIds.flatMap((id) => byId.get(id) ?? []);
  return {
    examples: all.slice(0, EXAMPLE_TICKETS_SHOWN),
    all,
    hiddenCount: Math.max(0, all.length - EXAMPLE_TICKETS_SHOWN),
    duplicatesMerged: alert.duplicatesMerged,
  };
}
