// PURPOSE: Right rail "Evidence": active view filters, the open alert's tickets, and the rules behind every count.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Look-alike of Support's ContextSidebar; all rule wording comes from thresholds.ts and selectors/records.ts.

import type { ReactNode } from "react";
import { PanelRightClose } from "lucide-react";
import type { Filters, QualityAlert, Ticket, TicketId } from "../lib/contracts";
import { companyName } from "../lib/data/catalog";
import { COUNTING_RULE_TEXT, DEFAULT_FILTERS, DUPLICATE_RULE_TEXT, TIME_RANGES } from "../lib/selectors/records";
import { ALERT_CAVEAT, ALERT_RULE_TEXT, ALERT_WINDOW_DAYS } from "../lib/thresholds";
import { DEMO_NOW, formatDay, isoDaysBefore } from "../lib/time";
import { alertTitle } from "./alerts-panel";
import { BUTTON, Chip, EmptyState, SectionLabel } from "./ui";

/** One titled rail section. */
function RailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

/** Evidence rail; the count badge is the number of alert tickets listed. */
export function EvidenceRail({
  filters,
  alerts,
  selectedAlert,
  alertTickets,
  onOpenTicket,
  onCollapse,
}: {
  filters: Filters;
  alerts: readonly QualityAlert[];
  selectedAlert: QualityAlert | null;
  alertTickets: readonly Ticket[];
  onOpenTicket: (id: TicketId) => void;
  onCollapse: () => void;
}) {
  const activeFilters = [
    filters.companyId !== DEFAULT_FILTERS.companyId ? `Company: ${companyName(filters.companyId as Exclude<Filters["companyId"], "all">)}` : null,
    filters.range !== DEFAULT_FILTERS.range ? TIME_RANGES.find((range) => range.id === filters.range)?.label : null,
  ].filter(Boolean);

  return (
    <aside className="flex h-full flex-col border-l border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">Evidence</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-line-strong px-1.5 font-mono text-[0.6rem] text-muted">{alertTickets.length}</span>
          <button type="button" onClick={onCollapse} aria-label="Hide evidence" className={BUTTON.icon}>
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="scroll-soft flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <RailSection title="Active filters">
          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map((label) => (
                <Chip key={label}>{label}</Chip>
              ))}
            </div>
          ) : (
            <EmptyState>No filters. Counts use every record.</EmptyState>
          )}
        </RailSection>

        <RailSection title="Alert tickets">
          {selectedAlert ? (
            <>
              <p className="text-[0.78rem] font-medium text-ink">{alertTitle(selectedAlert)}</p>
              <ul className="space-y-1">
                {alertTickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => onOpenTicket(ticket.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 text-left text-[0.76rem] transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      <span className="font-mono font-medium text-ink">{ticket.id}</span>
                      <span className="truncate text-muted">{companyName(ticket.companyId)}</span>
                      <span className="shrink-0 font-mono text-[0.6rem] uppercase text-muted">{formatDay(ticket.date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState>{alerts.length > 0 ? "Open an alert to list the tickets behind it." : "No alert yet. Tickets behind an alert will be listed here."}</EmptyState>
          )}
        </RailSection>

        <RailSection title="Rule applied">
          <div className="space-y-2 rounded-xl border border-line bg-surface px-3 py-3 text-[0.76rem] leading-relaxed text-ink-soft">
            <p>
              <span className="font-medium text-ink">Alert:</span> {ALERT_RULE_TEXT}
            </p>
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted">
              Window: {formatDay(isoDaysBefore(ALERT_WINDOW_DAYS - 1))} – {formatDay(DEMO_NOW, true)}
            </p>
            <p>
              <span className="font-medium text-ink">Duplicates:</span> {DUPLICATE_RULE_TEXT}
            </p>
            <p>
              <span className="font-medium text-ink">Counting:</span> {COUNTING_RULE_TEXT}
            </p>
            <p className="text-amber">{ALERT_CAVEAT}</p>
          </div>
        </RailSection>
      </div>
    </aside>
  );
}
