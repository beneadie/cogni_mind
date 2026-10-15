"use client";

// PURPOSE: "Recurring failure alerts": one card per alert from selectAlerts, expanding to its example tickets.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the expand / "Show all N" toggles. Renders selector output only; no counting happens here.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, Flag, Merge } from "lucide-react";
import type { QualityAlert, Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { alertEvidence } from "../lib/selectors/alerts";
import { ALERT_CAVEAT, ALERT_RULE_TEXT } from "../lib/thresholds";
import { formatDay } from "../lib/time";
import { BUTTON, Chip, EmptyState, HighlightedText, SectionLabel, StatusTag, UnconfirmedNote } from "./ui";

/** Headline for an alert: failure type on canonical product. */
export function alertTitle(alert: QualityAlert): string {
  return `${failureLabel(alert.failureType)} · ${productName(alert.productId)}`;
}

/** One example ticket as evidence: ID, date, company, original words with matches highlighted, tags. */
function EvidenceTicket({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full space-y-1.5 rounded-xl border border-line bg-canvas px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted">
          <span className="font-medium text-ink">{ticket.id}</span>
          <span>{formatDay(ticket.date, true)}</span>
          <span>{companyName(ticket.companyId)}</span>
          <span className="ml-auto">
            <StatusTag status={ticket.tags.status} />
          </span>
        </div>
        <HighlightedText text={ticket.text} evidence={ticket.classification?.evidence ?? []} className="line-clamp-3 text-[0.8rem] leading-relaxed text-ink-soft" />
        <div className="flex flex-wrap gap-1.5">
          {ticket.tags.productId ? <Chip>{productName(ticket.tags.productId)}</Chip> : null}
          {ticket.tags.failureType ? <Chip>{failureLabel(ticket.tags.failureType)}</Chip> : null}
          <Chip>{ticket.intake === "forced_choice" ? "Forced-choice form" : "Free text"}</Chip>
        </div>
      </button>
    </li>
  );
}

/** One alert: summary always visible; examples, rule caveat and the demo-only flag when expanded. */
function AlertCard({
  alert,
  tickets,
  expanded,
  flagged,
  onToggle,
  onFlag,
  onOpenTicket,
}: {
  alert: QualityAlert;
  tickets: readonly Ticket[];
  expanded: boolean;
  flagged: boolean;
  onToggle: () => void;
  onFlag: () => void;
  onOpenTicket: (id: TicketId) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const evidence = alertEvidence(alert, tickets);
  const shown = showAll ? evidence.all : evidence.examples;

  return (
    <motion.li layout="position" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-2xl border border-amber/40 bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-3 bg-amber-soft px-4 py-3 text-left transition-colors hover:bg-amber/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-[0.9rem] font-medium text-ink">{alertTitle(alert)}</span>
          <span className="block font-mono text-[0.64rem] uppercase tracking-[0.08em] text-ink-soft">
            {alert.ticketIds.length} tickets · {alert.companyIds.length} companies · {formatDay(alert.windowStart)} – {formatDay(alert.windowEnd, true)}
          </span>
          <span className="block text-[0.74rem] text-muted">{alert.companyIds.map(companyName).join(", ")}</span>
          <UnconfirmedNote count={alert.unconfirmedCount} />
        </span>
        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-amber/30 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SectionLabel>Example tickets · newest first</SectionLabel>
                {evidence.duplicatesMerged > 0 ? (
                  <Chip>
                    <Merge className="h-3 w-3" />
                    {evidence.duplicatesMerged} {evidence.duplicatesMerged === 1 ? "duplicate" : "duplicates"} merged
                  </Chip>
                ) : null}
              </div>
              <ul className="space-y-2">
                {shown.map((ticket) => (
                  <EvidenceTicket key={ticket.id} ticket={ticket} onOpen={() => onOpenTicket(ticket.id)} />
                ))}
              </ul>
              {evidence.hiddenCount > 0 ? (
                <button type="button" onClick={() => setShowAll((value) => !value)} className={BUTTON.secondary}>
                  {showAll ? "Show fewer" : `Show all ${evidence.all.length}`}
                </button>
              ) : null}
              <p className="text-[0.74rem] leading-relaxed text-muted">
                {ALERT_RULE_TEXT} {ALERT_CAVEAT}
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {/* DEMO-ONLY: no engineering ticket or PLM task is created; the flag only marks this card. */}
                <Chip tone="amber">Demo / not submitted</Chip>
                <button type="button" onClick={onFlag} disabled={flagged} className={BUTTON.primary}>
                  <Flag className="h-3.5 w-3.5" />
                  {flagged ? "Flagged for engineering review" : "Flag for engineering review"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

/** Alert list with its empty state; the selected alert is expanded and drives the Evidence rail. */
export function AlertsPanel({
  alerts,
  tickets,
  selectedAlertId,
  flaggedAlertIds,
  onSelect,
  onFlag,
  onOpenTicket,
}: {
  alerts: readonly QualityAlert[];
  tickets: readonly Ticket[];
  selectedAlertId: string | null;
  flaggedAlertIds: readonly string[];
  onSelect: (id: string | null) => void;
  onFlag: (id: string) => void;
  onOpenTicket: (id: TicketId) => void;
}) {
  return (
    <section className="space-y-2" aria-labelledby="alerts-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="alerts-title" className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
          Recurring failure alerts
        </h2>
        <span aria-live="polite" className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{alerts.length} active</span>
      </div>
      {alerts.length === 0 ? (
        <EmptyState>No failure is repeating across companies right now. Alerts appear here when one meets the rule: {ALERT_RULE_TEXT}</EmptyState>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                tickets={tickets}
                expanded={alert.id === selectedAlertId}
                flagged={flaggedAlertIds.includes(alert.id)}
                onToggle={() => onSelect(alert.id === selectedAlertId ? null : alert.id)}
                onFlag={() => onFlag(alert.id)}
                onOpenTicket={onOpenTicket}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
