// PURPOSE: Left rail "Tickets": New complaint button and every record grouped Today / Previous 7 days / Earlier.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Look-alike of Support's CaseHistory; groups are measured from DEMO_NOW, never the real clock.

import { MessageSquarePlus, PanelLeftClose } from "lucide-react";
import type { Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel } from "../lib/data/catalog";
import { DATE_GROUPS, dateGroup, dayNumber, formatDay } from "../lib/time";
import { BUTTON, StatusTag } from "./ui";

/** Row title: the failure tag when there is one, otherwise the start of the original words. */
function ticketTitle(ticket: Ticket): string {
  if (ticket.tags.failureType) return failureLabel(ticket.tags.failureType);
  return ticket.text.trim() || "Empty record";
}

/** Ticket list rail; the active row is the ticket open in the center. */
export function TicketRail({
  tickets,
  alertIds,
  activeTicketId,
  onSelect,
  onNewComplaint,
  onCollapse,
}: {
  tickets: readonly Ticket[];
  alertIds: ReadonlySet<TicketId>;
  activeTicketId: TicketId | null;
  onSelect: (id: TicketId) => void;
  onNewComplaint: () => void;
  onCollapse: () => void;
}) {
  const newestFirst = [...tickets].sort((a, b) => dayNumber(b.date) - dayNumber(a.date) || b.id.localeCompare(a.id));

  return (
    <aside className="flex h-full flex-col border-r border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">Tickets</span>
        <button type="button" onClick={onCollapse} aria-label="Hide tickets" className={BUTTON.icon}>
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-line px-3 py-3">
        <button
          type="button"
          onClick={onNewComplaint}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          New complaint
        </button>
      </div>

      <div className="scroll-soft flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {DATE_GROUPS.map((group) => {
          const rows = newestFirst.filter((ticket) => dateGroup(ticket.date) === group);
          if (rows.length === 0) return null;
          return (
            <div key={group} className="space-y-1.5">
              <p className="px-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">{group}</p>
              <ul className="space-y-1">
                {rows.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(ticket.id)}
                      aria-current={ticket.id === activeTicketId ? "true" : undefined}
                      className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                        ticket.id === activeTicketId ? "border-accent/40 bg-surface" : "border-transparent hover:bg-elevated"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[0.78rem] font-medium text-ink">{ticketTitle(ticket)}</span>
                        <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">{formatDay(ticket.date)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[0.72rem] text-muted">
                          {ticket.id} · {companyName(ticket.companyId)}
                        </span>
                        <StatusTag status={ticket.tags.status} inAlert={alertIds.has(ticket.id)} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
