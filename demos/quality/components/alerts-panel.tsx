"use client";

// PURPOSE: "Recurring failure alerts": one card per alert from selectAlerts, plus the supporting-complaints detail for the modal.
// ROLE: component. USED BY: dashboard.tsx (cards), demos/quality/page.tsx (detail in the modal).
// Client component for the "Show all N" and flag toggles. Renders selector output only; no counting happens here.

import { useState } from "react";
import { AlertTriangle, ArrowRight, Flag, Merge } from "lucide-react";
import type { QualityAlert, Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { alertEvidence } from "../lib/selectors/alerts";
import { DUPLICATE_RULE_TEXT } from "../lib/selectors/records";
import { ALERT_CAVEAT, ALERT_RULE_TEXT, ALERT_WINDOW_DAYS } from "../lib/thresholds";
import { formatDay } from "../lib/time";
import { BUTTON, Chip, EmptyState, HighlightedText, RECURRING, SectionLabel, StatusTag, UnconfirmedNote } from "./ui";

/** Headline for an alert: failure type on canonical product. */
export function alertTitle(alert: QualityAlert): string {
  return `${failureLabel(alert.failureType)} · ${productName(alert.productId)}`;
}

/** The alert rule, tucked away for anyone who asks. */
function RuleDisclosure() {
  return (
    <details className="group text-[0.74rem] leading-relaxed text-muted">
      <summary className="cursor-pointer list-none font-mono text-[0.62rem] uppercase tracking-[0.1em] hover:text-ink">How alerts work</summary>
      <p className="mt-1.5">
        {ALERT_RULE_TEXT} {DUPLICATE_RULE_TEXT} {ALERT_CAVEAT}
      </p>
    </details>
  );
}

/** One supporting complaint: ID, date, company, product, original words, failure type and review status. Opens the full record. */
function SupportingTicket({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full space-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong hover:bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted">
          <span className="font-medium text-ink">{ticket.id}</span>
          <span>{companyName(ticket.companyId)}</span>
          <span>{formatDay(ticket.date, true)}</span>
          <span className="ml-auto">
            <StatusTag status={ticket.tags.status} />
          </span>
        </span>
        <HighlightedText text={ticket.text} evidence={ticket.classification?.evidence ?? []} className="text-[0.86rem] leading-relaxed text-ink" />
        <span className="flex flex-wrap gap-1.5">
          {ticket.tags.productId ? <Chip>{productName(ticket.tags.productId)}</Chip> : null}
          {ticket.tags.failureType ? <Chip>{failureLabel(ticket.tags.failureType)}</Chip> : null}
          <Chip>{ticket.intake === "forced_choice" ? "Structured form" : "Free text"}</Chip>
        </span>
      </button>
    </li>
  );
}

/** Drawer body for one alert: summary, supporting complaints (newest first) and the demo-only flag. */
export function AlertDetail({
  alert,
  tickets,
  flagged,
  onFlag,
  onOpenTicket,
}: {
  alert: QualityAlert;
  tickets: readonly Ticket[];
  flagged: boolean;
  onFlag: () => void;
  onOpenTicket: (id: TicketId) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const evidence = alertEvidence(alert, tickets);
  const shown = showAll ? evidence.all : evidence.examples;

  return (
    <div className="space-y-4">
      <div className={`space-y-1.5 rounded-2xl border px-4 py-3 ${RECURRING.card}`}>
        <p className="text-[0.95rem] font-medium text-ink">{alertTitle(alert)}</p>
        <p className="font-mono text-[0.64rem] uppercase tracking-[0.08em] text-ink-soft">
          {alert.ticketIds.length} tickets · {alert.companyIds.length} companies · {formatDay(alert.windowStart)} – {formatDay(alert.windowEnd, true)}
        </p>
        <p className="text-[0.78rem] text-ink-soft">{alert.companyIds.map(companyName).join(", ")}</p>
        <UnconfirmedNote count={alert.unconfirmedCount} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Supporting tickets · newest first</SectionLabel>
        {evidence.duplicatesMerged > 0 ? (
          <Chip>
            <Merge className="h-3 w-3" />
            {evidence.duplicatesMerged} {evidence.duplicatesMerged === 1 ? "duplicate" : "duplicates"} merged
          </Chip>
        ) : null}
      </div>
      <ul className="space-y-2">
        {shown.map((ticket) => (
          <SupportingTicket key={ticket.id} ticket={ticket} onOpen={() => onOpenTicket(ticket.id)} />
        ))}
      </ul>
      {evidence.hiddenCount > 0 ? (
        <button type="button" onClick={() => setShowAll((value) => !value)} className={BUTTON.secondary}>
          {showAll ? "Show fewer" : `Show all ${evidence.all.length}`}
        </button>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
        <span className="mr-auto">
          <RuleDisclosure />
        </span>
        {/* DEMO-ONLY: no engineering ticket or PLM task is created; the flag only marks this alert. */}
        <Chip tone="amber">Demo · not submitted</Chip>
        <button type="button" onClick={onFlag} disabled={flagged} className={BUTTON.primary}>
          <Flag className="h-3.5 w-3.5" />
          {flagged ? "Flagged for engineering" : "Flag for engineering review"}
        </button>
      </div>
    </div>
  );
}

/** Alert cards with their empty state; `highlightedId` rings the alert a just-created ticket belongs to. */
export function AlertsPanel({ alerts, highlightedId, onOpen }: { alerts: readonly QualityAlert[]; highlightedId: string | null; onOpen: (id: string) => void }) {
  return (
    <section className="space-y-3" aria-labelledby="alerts-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="alerts-title" className="font-serif text-lg text-ink">
          Recurring failures
        </h2>
        <span aria-live="polite" className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
          {alerts.length} active
        </span>
      </div>
      {alerts.length === 0 ? (
        <EmptyState>No failure is repeating across companies for these filters.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <button
                type="button"
                onClick={() => onOpen(alert.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${RECURRING.card} ${RECURRING.hover} ${
                  alert.id === highlightedId ? RECURRING.highlight : ""
                }`}
              >
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${RECURRING.icon}`} />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-[1rem] font-medium text-ink">{alertTitle(alert)}</span>
                  <span className="block text-[0.8rem] text-ink-soft">
                    {alert.ticketIds.length} tickets from {alert.companyIds.length} companies in the last {ALERT_WINDOW_DAYS} days · {alert.companyIds.map(companyName).join(", ")}
                  </span>
                  <UnconfirmedNote count={alert.unconfirmedCount} />
                </span>
                <span className="hidden shrink-0 items-center gap-1 self-center font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink sm:inline-flex">
                  View tickets
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
