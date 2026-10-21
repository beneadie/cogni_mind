"use client";

// PURPOSE: The Quality Dashboard view: headline counts, recurring failures, most common failures, historical complaints.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Every number is selector output over the store's tickets; nothing here is hardcoded.

import type { ReactNode } from "react";
import { CheckCircle2, ChevronRight, History } from "lucide-react";
import type { QualityAlert, Ticket, TicketId } from "../lib/contracts";
import { COMPANIES } from "../lib/data/catalog";
import { backfillProgress } from "../lib/selectors/records";
import type { TrendScope } from "../lib/selectors/trends";
import { AlertsPanel, alertTitle } from "./alerts-panel";
import { AskPanel } from "./ask-panel";
import { TrendsPanel } from "./trends-panel";
import { BUTTON, RECURRING, REVIEW_TEXT, SectionLabel } from "./ui";

/** Which records the drawer list opens on. */
export type RecordsFilter = "all" | "needs_review";

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

/** Dashboard; `created` is the ticket just created from the New Complaint view, if any. */
export function Dashboard({
  tickets,
  alerts,
  created,
  onOpenAlert,
  onOpenRecords,
  onOpenScope,
}: {
  tickets: readonly Ticket[];
  alerts: readonly QualityAlert[];
  created: TicketId | null;
  onOpenAlert: (id: string) => void;
  onOpenRecords: (filter: RecordsFilter, ticketId?: TicketId) => void;
  onOpenScope: (scope: TrendScope) => void;
}) {
  const analyzed = tickets.filter((ticket) => ticket.tags.status !== "unclassified");
  const confirmed = analyzed.filter((ticket) => ticket.tags.status === "confirmed" || ticket.tags.status === "corrected").length;
  const suggested = analyzed.filter((ticket) => ticket.tags.status === "suggested").length;
  const needsReview = analyzed.filter((ticket) => ticket.tags.status === "needs_review").length;
  const history = backfillProgress(tickets);
  const createdAlert = created ? (alerts.find((alert) => alert.ticketIds.includes(created)) ?? null) : null;

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

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Complaints analyzed"
          value={analyzed.length}
          detail={
            <>
              {confirmed} confirmed · {suggested} suggested · <span className={needsReview > 0 ? REVIEW_TEXT : ""}>{needsReview} need review</span>
            </>
          }
          onClick={() => onOpenRecords("all")}
        />
        <SummaryCard label="Recurring failure alerts" value={alerts.length} detail="Same failure, several companies" tone="recurring" />
        <SummaryCard label="Needing review" value={needsReview} detail="Details a person must fill in" tone="review" onClick={() => onOpenRecords("needs_review")} />
      </div>

      <AlertsPanel alerts={alerts} highlightedId={createdAlert?.id ?? null} onOpen={onOpenAlert} />

      <TrendsPanel tickets={tickets} alerts={alerts} onOpenScope={onOpenScope} />

      <AskPanel tickets={tickets} onOpenTicket={(id) => onOpenRecords("all", id)} />

      <section aria-labelledby="history-title" className="flex flex-wrap items-center gap-4 rounded-2xl border border-line-strong bg-surface px-5 py-5">
        <History className="h-5 w-5 shrink-0 text-gold" />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 id="history-title" className="font-serif text-lg text-ink">
            Historical complaints
          </h2>
          <p className="text-[0.8rem] leading-relaxed text-ink-soft">
            {history.total} older free-text complaints from {COMPANIES.length} companies, sorted by the rule-based demo classifier:{" "}
            {history.classified} given a product and failure type, {history.needsReview} left for review
            {history.pending > 0 ? `, ${history.pending} pending` : ""}.
          </p>
        </div>
        <button type="button" onClick={() => onOpenRecords("all")} className={BUTTON.secondary}>
          Browse records
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </section>
    </div>
  );
}
