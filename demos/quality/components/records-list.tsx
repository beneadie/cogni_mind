"use client";

// PURPOSE: Modal body listing complaint records compactly; picking one opens its review (confirm / correct) in the same modal.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the filter tabs and the open record; decisions dispatch through callbacks to the store.

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { dayNumber, formatDay } from "../lib/time";
import type { Correction } from "../lib/state/reducer";
import { type TrendScope, trendTickets } from "../lib/selectors/trends";
import type { RecordsFilter } from "./dashboard";
import { TicketReview } from "./ticket-review";
import { BUTTON, EmptyState, StatusTag } from "./ui";

const FILTERS: readonly { id: RecordsFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs review" },
];

/** Records list, newest first, with a review view for the selected record. */
export function RecordsList({
  tickets,
  alertIds,
  initialFilter,
  initialOpenId = null,
  initialScope = null,
  onConfirm,
  onCorrect,
}: {
  tickets: readonly Ticket[];
  alertIds: ReadonlySet<TicketId>;
  initialFilter: RecordsFilter;
  /** Record to open straight away (e.g. a search result). */
  initialOpenId?: TicketId | null;
  /** Narrow the list to the tickets behind one "N confirmed / N suggested" trend label. */
  initialScope?: TrendScope | null;
  onConfirm: (id: TicketId) => void;
  onCorrect: (id: TicketId, correction: Correction) => void;
}) {
  const [filter, setFilter] = useState<RecordsFilter>(initialFilter);
  const [openId, setOpenId] = useState<TicketId | null>(initialOpenId);
  const [scope, setScope] = useState<TrendScope | null>(initialScope);
  const open = tickets.find((ticket) => ticket.id === openId) ?? null;

  if (open) {
    const canConfirm = open.tags.status === "suggested" && Boolean(open.tags.productId && open.tags.failureType);
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setOpenId(null)} className={BUTTON.secondary}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to records
        </button>
        <TicketReview
          key={open.id}
          ticket={open}
          pending={false}
          inAlert={alertIds.has(open.id)}
          // HUMAN-GATE: confirming or correcting an existing ticket; alerts and counts recompute immediately.
          onConfirm={canConfirm ? () => onConfirm(open.id) : undefined}
          onCorrect={(correction) => onCorrect(open.id, correction)}
        />
      </div>
    );
  }

  // A trend scope uses the chart's own counting (deduplicated, tagged), so the list length equals the clicked number.
  const shown = (scope ? trendTickets(tickets, scope) : tickets.filter((ticket) => filter === "all" || ticket.tags.status === "needs_review"))
    .slice()
    .sort((a, b) => dayNumber(b.date) - dayNumber(a.date) || b.id.localeCompare(a.id));

  return (
    <div className="space-y-3">
      {scope ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[0.8rem] text-ink">
          <span className="min-w-0 flex-1">
            {shown.length} {scope.status} · {failureLabel(scope.failureType)}
            {scope.productId ? ` · ${productName(scope.productId)}` : ""}
            {scope.companyId ? ` · ${companyName(scope.companyId)}` : ""}
          </span>
          <button type="button" onClick={() => setScope(null)} className={BUTTON.secondary}>
            <X className="h-3.5 w-3.5" />
            Clear filter
          </button>
        </div>
      ) : (
        <div role="group" aria-label="Filter records" className="inline-flex rounded-full border border-line-strong p-0.5">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                filter === option.id ? "bg-accent text-canvas" : "text-ink-soft hover:bg-elevated"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <EmptyState>{scope ? "No complaints match this filter any more." : "Nothing needs review right now."}</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {shown.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                onClick={() => setOpenId(ticket.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
              >
                <span className="w-12 shrink-0 font-mono text-[0.66rem] text-ink">{ticket.id}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8rem] text-ink">
                    {ticket.tags.productId && ticket.tags.failureType
                      ? `${failureLabel(ticket.tags.failureType)} · ${productName(ticket.tags.productId)}`
                      : ticket.text || "(empty record)"}
                  </span>
                  <span className="block font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
                    {companyName(ticket.companyId)} · {formatDay(ticket.date, true)}
                  </span>
                </span>
                <StatusTag status={ticket.tags.status} inAlert={alertIds.has(ticket.id)} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
