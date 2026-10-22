"use client";

// PURPOSE: The Quality Dashboard view: filters, headline counts, recurring failures, Ticket Trends, Quality Agent.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Every number is computed from the records passed in (already filtered by the page); nothing here is hardcoded.

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ProductId, QualityAlert, Ticket, TicketId } from "../lib/contracts";
import { AlertsPanel, alertTitle } from "./alerts-panel";
import { AskPanel } from "./ask-panel";
import type { DashboardFilters } from "../lib/selectors/dashboard";
import { FilterBar } from "./dashboard-filters";
import { TrendsPanel } from "./trends-panel";
import { RECURRING, REVIEW_TEXT, SectionLabel } from "./ui";

/** Which records the drawer list opens on. */
export type RecordsFilter = "recurring" | "needs_review" | "all";

/** One headline number; clickable when it leads somewhere. Colored only when it needs action: review (ochre) or recurring (terracotta). */
function SummaryCard({
  label,
  value,
  detail,
  tone = "neutral",
  onClick,
}: {
  label: string;
  value: number;
  detail: ReactNode;
  tone?: "neutral" | "review" | "recurring";
  onClick?: () => void;
}) {
  const body = (
    <>
      <SectionLabel>{label}</SectionLabel>
      <p className={`font-serif text-3xl leading-none ${value > 0 && tone === "recurring" ? RECURRING.text : value > 0 && tone === "review" ? REVIEW_TEXT : "text-ink"}`}>{value}</p>
      <div className="text-[0.74rem] text-muted">{detail}</div>
    </>
  );
  const frame = "space-y-2 rounded-2xl border border-line-strong bg-surface px-4 py-4 text-left";
  return onClick ? (
    <button type="button" onClick={onClick} className={`${frame} transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}>
      {body}
    </button>
  ) : (
    <div className={frame}>{body}</div>
  );
}

/** Dashboard. `tickets` and `alerts` are already filtered; `allTickets` feeds the Quality Agent, which searches every record. */
export function Dashboard({
  tickets,
  allTickets,
  alerts,
  filters,
  created,
  createdAlert,
  onFilters,
  onOpenAlert,
  onOpenRecords,
  onOpenProduct,
}: {
  tickets: readonly Ticket[];
  allTickets: readonly Ticket[];
  alerts: readonly QualityAlert[];
  filters: DashboardFilters;
  created: TicketId | null;
  /** The alert the just-created ticket belongs to, from the unfiltered alerts. */
  createdAlert: QualityAlert | null;
  onFilters: (filters: DashboardFilters) => void;
  onOpenAlert: (id: string) => void;
  onOpenRecords: (filter: RecordsFilter, ticketId?: TicketId) => void;
  onOpenProduct: (productId: ProductId) => void;
}) {
  // Unclassified tickets are never counted as analyzed.
  const analyzed = tickets.filter((ticket) => ticket.tags.status !== "unclassified");
  const confirmed = analyzed.filter((ticket) => ticket.tags.status === "confirmed" || ticket.tags.status === "corrected").length;
  const suggested = analyzed.filter((ticket) => ticket.tags.status === "suggested").length;
  const needsReview = analyzed.filter((ticket) => ticket.tags.status === "needs_review").length;

  return (
    <div className="space-y-6">
      {created ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-online/40 bg-surface px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-online" />
          <p className="text-[0.84rem] leading-relaxed text-ink">
            Ticket <span className="font-medium">{created}</span> created.{" "}
            {createdAlert ? (
              <>
                It matches a recurring failure: <span className="font-medium">{alertTitle(createdAlert)}</span>.
              </>
            ) : (
              "It does not match a recurring failure yet."
            )}
          </p>
        </div>
      ) : null}

      <FilterBar filters={filters} onChange={onFilters} />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Tickets Analyzed"
          value={analyzed.length}
          detail={
            <>
              {confirmed} confirmed · {suggested} suggested · <span className={needsReview > 0 ? REVIEW_TEXT : ""}>{needsReview} need review</span>
            </>
          }
          onClick={() => onOpenRecords("all")}
        />
        <SummaryCard label="Recurring Failures" value={alerts.length} detail="Same failure, several companies" tone="recurring" onClick={() => onOpenRecords("recurring")} />
        <SummaryCard label="Needs Review" value={needsReview} detail="Details a person must fill in" tone="review" onClick={() => onOpenRecords("needs_review")} />
      </div>

      <AlertsPanel alerts={alerts} highlightedId={createdAlert?.id ?? null} onOpen={onOpenAlert} />

      <TrendsPanel tickets={tickets} alerts={alerts} onOpenProduct={onOpenProduct} />

      <AskPanel tickets={allTickets} onOpenTicket={(id) => onOpenRecords("all", id)} />
    </div>
  );
}
