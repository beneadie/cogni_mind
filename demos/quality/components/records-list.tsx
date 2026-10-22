"use client";

// PURPOSE: Modal body listing ticket records compactly; picking one opens its review (confirm / correct) in the same modal.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the filter tabs and the open record; decisions dispatch through callbacks to the store.

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { dayNumber, formatDay } from "../lib/time";
import type { Correction } from "../lib/state/reducer";
import type { RecordsFilter } from "./dashboard";
import { TicketReview } from "./ticket-review";
import { BUTTON, EmptyState, StatusTag } from "./ui";

// Tabs in order of urgency: recurring failures first, then tickets waiting on a person, then everything.
const FILTERS: readonly { id: RecordsFilter; label: string }[] = [
  { id: "recurring", label: "Recurring" },
  { id: "needs_review", label: "Needs review" },
  { id: "all", label: "All" },
];

const EMPTY_TEXT: Record<RecordsFilter, string> = {
  recurring: "No recurring-failure tickets for these filters.",
  needs_review: "Nothing needs review for these filters.",
  all: "No tickets for these filters.",
};

/** Sort rank: recurring, then needs review, then the rest. */
function urgency(ticket: Ticket, alertIds: ReadonlySet<TicketId>): number {
  if (alertIds.has(ticket.id)) return 0;
  return ticket.tags.status === "needs_review" ? 1 : 2;
}

/** Records list (recurring first, then needs review, then newest first), with a review view for the selected record. */
export function RecordsList({
  tickets,
  alertIds,
  initialFilter,
  listed,
  scopeLabel,
  onClearScope,
  initialOpenId = null,
  onConfirm,
  onCorrect,
}: {
  /** Every record, so any ticket (e.g. a Quality Agent result) can be opened. */
  tickets: readonly Ticket[];
  /** The records the list shows: the dashboard's filtered tickets. */
  listed: readonly Ticket[];
  /** Set when the list is narrowed to one product (from a Ticket Trends card); shown with a clear button. */
  scopeLabel?: string;
  onClearScope?: () => void;
  alertIds: ReadonlySet<TicketId>;
  initialFilter: RecordsFilter;
  /** Record to open straight away (e.g. a search result). */
  initialOpenId?: TicketId | null;
  onConfirm: (id: TicketId) => void;
  onCorrect: (id: TicketId, correction: Correction) => void;
}) {
  const [filter, setFilter] = useState<RecordsFilter>(initialFilter);
  const [openId, setOpenId] = useState<TicketId | null>(initialOpenId);
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

  // Same rule as the "Tickets Analyzed" card: unclassified tickets are not listed as analyzed.
  const shown = listed
    .filter(
      (ticket) =>
        ticket.tags.status !== "unclassified" &&
        (filter === "all" || (filter === "needs_review" ? ticket.tags.status === "needs_review" : alertIds.has(ticket.id))),
    )
    .sort((a, b) => urgency(a, alertIds) - urgency(b, alertIds) || dayNumber(b.date) - dayNumber(a.date) || b.id.localeCompare(a.id));

  return (
    <div className="space-y-3">
      {scopeLabel ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[0.8rem] text-ink">
          <span className="min-w-0 flex-1">
            Product: <span className="font-medium">{scopeLabel}</span>
          </span>
          {onClearScope ? (
            <button type="button" onClick={onClearScope} className={BUTTON.secondary}>
              <X className="h-3.5 w-3.5" />
              All products
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
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
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">{shown.length} tickets · dashboard filters applied</span>
      </div>
      {shown.length === 0 ? (
        <EmptyState>{EMPTY_TEXT[filter]}</EmptyState>
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
