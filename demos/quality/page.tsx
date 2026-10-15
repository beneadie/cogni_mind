"use client";

// PURPOSE: Quality Intelligence demo root: header, Tickets rail, center workspace (intake / review / alerts), Evidence rail.
// ROLE: component (demo root). USED BY: app/quality/page.tsx.
// Client component because it reads the store and owns view-only state (open ticket, open alert, rails, modal).

import { useCallback, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import { FileSearch, ListChecks, PanelLeftOpen, PanelRightOpen } from "lucide-react";
import type { Ticket, TicketId } from "./lib/contracts";
import { alertTicketIds, alertEvidence, selectAlerts } from "./lib/selectors/alerts";
import type { Correction, Draft } from "./lib/state/reducer";
import { dispatchQuality, useQualityState } from "./lib/state/store";
import { DEMO_NOW } from "./lib/time";
import { AlertsPanel } from "./components/alerts-panel";
import { BackfillCard } from "./components/backfill-card";
import { Composer } from "./components/composer";
import { EvidenceRail } from "./components/evidence-rail";
import { MobileDrawer } from "./components/mobile-drawer";
import { QualityHeader } from "./components/quality-header";
import { TicketModal } from "./components/ticket-modal";
import { TicketRail } from "./components/ticket-rail";
import { TicketReview } from "./components/ticket-review";
import { TrendsPanel } from "./components/trends-panel";
import { BUTTON } from "./components/ui";

/** What the center workspace shows: the intake flow (composer or pending draft) or one existing ticket. */
type Focus = { kind: "intake" } | { kind: "ticket"; id: TicketId };

/** The pending draft shaped as a ticket so one review component serves both; it is not in the records. */
function draftAsTicket(draft: Draft): Ticket {
  const { productId, modelId, failureType, status } = draft.response;
  return {
    id: draft.ticketId,
    companyId: draft.companyId,
    date: DEMO_NOW,
    kind: draft.kind,
    intake: "free_text",
    text: draft.text,
    modelRaw: draft.modelRaw,
    tags: { productId, modelId, failureType, status },
    classification: draft.response,
  };
}

const RAIL_REOPEN =
  "absolute top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/90 text-muted shadow-sm backdrop-blur transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:inline-flex";

/** The Quality demo. Every count, tag and alert on screen is selector output over the store's tickets. */
export function QualityDemo() {
  const state = useQualityState();
  const [focus, setFocus] = useState<Focus>({ kind: "intake" });
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [flaggedAlertIds, setFlaggedAlertIds] = useState<string[]>([]);
  const [modalTicketId, setModalTicketId] = useState<TicketId | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  // Below lg the rails are hidden; this drawer shows one of them on demand.
  const [mobileRail, setMobileRail] = useState<"tickets" | "evidence" | null>(null);

  // Selectors recompute from the records on every store change, so a confirm or correction updates every view.
  const alerts = useMemo(() => selectAlerts(state.tickets), [state.tickets]);
  const alertIds = useMemo(() => alertTicketIds(alerts), [alerts]);
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? null;
  const alertTickets = selectedAlert ? alertEvidence(selectedAlert, state.tickets).all : [];
  const focusedTicket = focus.kind === "ticket" ? (state.tickets.find((ticket) => ticket.id === focus.id) ?? null) : null;
  const modalTicket = state.tickets.find((ticket) => ticket.id === modalTicketId) ?? null;
  const closeModal = useCallback(() => setModalTicketId(null), []);
  const closeMobileRail = useCallback(() => setMobileRail(null), []);

  const reset = () => {
    dispatchQuality({ type: "reset" });
    setFocus({ kind: "intake" });
    setSelectedAlertId(null);
    setFlaggedAlertIds([]);
    setModalTicketId(null);
    setMobileRail(null);
  };

  // HUMAN-GATE: the draft joins the records only here; the center then shows the new ticket.
  const settleDraft = (draft: Draft, correction?: Correction) => {
    dispatchQuality(correction ? { type: "draft/correct", correction } : { type: "draft/confirm" });
    setFocus({ kind: "ticket", id: draft.ticketId });
  };

  const workspace = (() => {
    if (focusedTicket) {
      const canConfirm = focusedTicket.tags.status === "suggested" && Boolean(focusedTicket.tags.productId && focusedTicket.tags.failureType);
      return (
        <TicketReview
          key={focusedTicket.id}
          ticket={focusedTicket}
          pending={false}
          inAlert={alertIds.has(focusedTicket.id)}
          // HUMAN-GATE: confirming or correcting an existing ticket; alerts and counts recompute immediately.
          onConfirm={canConfirm ? () => dispatchQuality({ type: "ticket/confirm", ticketId: focusedTicket.id }) : undefined}
          onCorrect={(correction) => dispatchQuality({ type: "ticket/correct", ticketId: focusedTicket.id, correction })}
        />
      );
    }
    const { draft } = state;
    if (draft) {
      const ticket = draftAsTicket(draft);
      return (
        <TicketReview
          key={draft.ticketId}
          ticket={ticket}
          pending
          inAlert={false}
          onConfirm={ticket.tags.productId && ticket.tags.failureType ? () => settleDraft(draft) : undefined}
          onCorrect={(correction) => settleDraft(draft, correction)}
          onDiscard={() => dispatchQuality({ type: "draft/discard" })}
        />
      );
    }
    return <Composer onClassify={(complaint) => dispatchQuality({ type: "draft/classify", ...complaint })} />;
  })();

  // One builder per rail, so the desktop column and the mobile drawer render the same component.
  const ticketRail = (onCollapse: () => void) => (
    <TicketRail
      tickets={state.tickets}
      alertIds={alertIds}
      activeTicketId={focusedTicket?.id ?? null}
      onSelect={(id) => {
        setFocus({ kind: "ticket", id });
        setMobileRail(null);
      }}
      onNewComplaint={() => {
        setFocus({ kind: "intake" });
        setMobileRail(null);
      }}
      onCollapse={onCollapse}
    />
  );
  const evidenceRail = (onCollapse: () => void) => (
    <EvidenceRail
      filters={state.filters}
      alerts={alerts}
      selectedAlert={selectedAlert}
      alertTickets={alertTickets}
      onOpenTicket={setModalTicketId}
      onCollapse={onCollapse}
    />
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh flex-col bg-canvas">
        <QualityHeader onReset={reset} />

        <div className="relative flex min-h-0 flex-1">
          {leftOpen ? (
            <div className="hidden w-56 shrink-0 lg:block">{ticketRail(() => setLeftOpen(false))}</div>
          ) : null}

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2 lg:hidden">
              <button type="button" onClick={() => setMobileRail("tickets")} className={BUTTON.secondary}>
                <ListChecks className="h-3.5 w-3.5" />
                Tickets
              </button>
              <button type="button" onClick={() => setMobileRail("evidence")} className={BUTTON.secondary}>
                <FileSearch className="h-3.5 w-3.5" />
                Evidence · {alertTickets.length}
              </button>
            </div>
            <div className="scroll-soft flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="mx-auto w-full max-w-3xl space-y-6">
                {workspace}
                <AlertsPanel
                  alerts={alerts}
                  tickets={state.tickets}
                  selectedAlertId={selectedAlert?.id ?? null}
                  flaggedAlertIds={flaggedAlertIds}
                  onSelect={setSelectedAlertId}
                  onFlag={(id) => setFlaggedAlertIds((ids) => (ids.includes(id) ? ids : [...ids, id]))}
                  onOpenTicket={setModalTicketId}
                />
                <BackfillCard tickets={state.tickets} onRun={() => dispatchQuality({ type: "backfill/run" })} />
                {/* Filters change view state only; alerts keep their own rule regardless. */}
                <TrendsPanel tickets={state.tickets} filters={state.filters} alerts={alerts} onFilters={(filters) => dispatchQuality({ type: "filters/set", filters })} />
              </div>
            </div>
          </main>

          {rightOpen ? (
            <div className="hidden w-[30%] min-w-[18rem] max-w-md shrink-0 lg:block">{evidenceRail(() => setRightOpen(false))}</div>
          ) : null}

          {!leftOpen ? (
            <button type="button" onClick={() => setLeftOpen(true)} aria-label="Show tickets" className={`${RAIL_REOPEN} left-2`}>
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : null}
          {!rightOpen ? (
            <button type="button" onClick={() => setRightOpen(true)} aria-label="Show evidence" className={`${RAIL_REOPEN} right-2`}>
              <PanelRightOpen className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <MobileDrawer open={mobileRail === "tickets"} side="left" label="Tickets" onClose={closeMobileRail}>
          {ticketRail(closeMobileRail)}
        </MobileDrawer>
        <MobileDrawer open={mobileRail === "evidence"} side="right" label="Evidence" onClose={closeMobileRail}>
          {evidenceRail(closeMobileRail)}
        </MobileDrawer>

        <TicketModal ticket={modalTicket} onClose={closeModal} />
      </div>
    </MotionConfig>
  );
}
