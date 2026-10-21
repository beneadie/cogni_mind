"use client";

// PURPOSE: Quality Control demo root: header, two views (New Complaint, Quality Dashboard) and a detail modal.
// ROLE: component (demo root). USED BY: app/quality/page.tsx.
// Client component because it reads the store and owns view-only state (current view, open modal, last created ticket).

import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import { FilePlus2, LayoutDashboard } from "lucide-react";
import type { TicketId } from "./lib/contracts";
import { alertTicketIds, selectAlerts } from "./lib/selectors/alerts";
import { isHistoricalFreeText } from "./lib/selectors/records";
import type { TrendScope } from "./lib/selectors/trends";
import type { Correction } from "./lib/state/reducer";
import { dispatchQuality, useQualityState } from "./lib/state/store";
import { AlertDetail, alertTitle } from "./components/alerts-panel";
import { Dashboard, type RecordsFilter } from "./components/dashboard";
import { NewComplaint } from "./components/new-complaint";
import { Modal } from "./components/modal";
import { QualityHeader } from "./components/quality-header";
import { RecordsList } from "./components/records-list";

type View = "complaint" | "dashboard";

/** What the modal shows: one alert's supporting complaints, or the complaint records (list or one record). */
type DrawerState = { kind: "alert"; id: string } | { kind: "records"; filter: RecordsFilter; ticketId?: TicketId; scope?: TrendScope } | null;

const VIEWS: readonly { id: View; label: string; icon: typeof FilePlus2 }[] = [
  { id: "complaint", label: "New Complaint", icon: FilePlus2 },
  { id: "dashboard", label: "Quality Dashboard", icon: LayoutDashboard },
];

/** The Quality demo. Every count, tag and alert on screen is selector output over the store's tickets. */
export function QualityDemo() {
  const state = useQualityState();
  const [view, setView] = useState<View>("complaint");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [created, setCreated] = useState<TicketId | null>(null);
  const [flaggedAlertIds, setFlaggedAlertIds] = useState<string[]>([]);

  // Selectors recompute from the records on every store change, so a confirm or correction updates every view.
  const alerts = useMemo(() => selectAlerts(state.tickets), [state.tickets]);
  const alertIds = useMemo(() => alertTicketIds(alerts), [alerts]);
  const drawerAlert = drawer?.kind === "alert" ? (alerts.find((alert) => alert.id === drawer.id) ?? null) : null;
  const closeDrawer = useCallback(() => setDrawer(null), []);

  // Historical free-text records are classified as soon as the demo loads (and again after Reset Demo), with
  // the same classifier as new complaints. Only still-unclassified records are touched, so reviewed ones stay put.
  const historyPending = state.tickets.some((ticket) => isHistoricalFreeText(ticket) && ticket.tags.status === "unclassified");
  useEffect(() => {
    if (historyPending) dispatchQuality({ type: "backfill/run" });
  }, [historyPending]);

  const reset = () => {
    dispatchQuality({ type: "reset" });
    setView("complaint");
    setDrawer(null);
    setCreated(null);
    setFlaggedAlertIds([]);
  };

  // HUMAN-GATE: the reviewed draft becomes a ticket only here, then the dashboard shows where it landed.
  const createTicket = (correction?: Correction) => {
    const ticketId = state.draft?.ticketId;
    if (!ticketId) return;
    dispatchQuality(correction ? { type: "draft/correct", correction } : { type: "draft/confirm" });
    setCreated(ticketId);
    setView("dashboard");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-dvh flex-col bg-canvas">
        <QualityHeader onReset={reset} />

        <nav aria-label="Quality views" className="border-b border-line bg-surface/60 px-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl gap-1">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={view === id ? "page" : undefined}
                onClick={() => setView(id)}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[0.84rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 ${
                  view === id ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {id === "dashboard" && alerts.length > 0 ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BB7468] px-1.5 font-mono text-[0.6rem] text-canvas">{alerts.length}</span>
                ) : null}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-4xl">
            {view === "complaint" ? (
              <div className="mx-auto max-w-2xl">
                <NewComplaint
                  draft={state.draft}
                  onAnalyze={(text) => {
                    setCreated(null);
                    dispatchQuality({ type: "draft/classify", text });
                  }}
                  onCreate={createTicket}
                  onDiscard={() => dispatchQuality({ type: "draft/discard" })}
                />
              </div>
            ) : (
              <Dashboard
                tickets={state.tickets}
                alerts={alerts}
                created={created}
                onOpenAlert={(id) => setDrawer({ kind: "alert", id })}
                onOpenRecords={(filter, ticketId) => setDrawer({ kind: "records", filter, ticketId })}
                onOpenScope={(scope) => setDrawer({ kind: "records", filter: "all", scope })}
              />
            )}
          </div>
        </main>

        <Modal open={drawer !== null} title={drawerAlert ? alertTitle(drawerAlert) : "Complaint records"} onClose={closeDrawer}>
          {drawerAlert ? (
            <AlertDetail
              key={drawerAlert.id}
              alert={drawerAlert}
              tickets={state.tickets}
              flagged={flaggedAlertIds.includes(drawerAlert.id)}
              onFlag={() => setFlaggedAlertIds((ids) => (ids.includes(drawerAlert.id) ? ids : [...ids, drawerAlert.id]))}
              // Same modal, no nesting: the record replaces the alert view and "Back to records" leads to the list.
              onOpenTicket={(ticketId) => setDrawer({ kind: "records", filter: "all", ticketId })}
            />
          ) : drawer?.kind === "records" ? (
            <RecordsList
              key={`${drawer.filter}:${drawer.ticketId ?? ""}:${drawer.scope ? JSON.stringify(drawer.scope) : ""}`}
              tickets={state.tickets}
              alertIds={alertIds}
              initialFilter={drawer.filter}
              initialOpenId={drawer.ticketId ?? null}
              initialScope={drawer.scope ?? null}
              onConfirm={(ticketId) => dispatchQuality({ type: "ticket/confirm", ticketId })}
              onCorrect={(ticketId, correction) => dispatchQuality({ type: "ticket/correct", ticketId, correction })}
            />
          ) : null}
        </Modal>
      </div>
    </MotionConfig>
  );
}
