"use client";

// PURPOSE: "Most common failures": By product / By company bar views over every counted complaint.
// ROLE: component. USED BY: dashboard.tsx.
// Client component for the view tabs. Bars and counts are selector output only; each bar splits confirmed from suggested.

import { useState } from "react";
import type { QualityAlert, Ticket } from "../lib/contracts";
import { type TrendScope } from "../lib/selectors/trends";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { DEFAULT_FILTERS } from "../lib/selectors/records";
import { type TrendRow, trendsByCompany, trendsByProduct } from "../lib/selectors/trends";
import { Chip, DATA_FILL, EmptyState } from "./ui";

/** The two trend views, in tab order. */
const VIEWS = [
  { id: "product", label: "By product" },
  { id: "company", label: "By company" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

/** Segmented-control button classes; the pressed state uses the primary pill look. */
function segment(active: boolean): string {
  const base = "rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  return `${base} ${active ? "bg-accent text-canvas" : "text-ink-soft hover:bg-elevated"}`;
}

/** "2 confirmed": opens exactly those records; a zero count is plain text, not a button. */
function CountLink({ value, label, onOpen }: { value: number; label: string; onOpen: () => void }) {
  if (value === 0) return <span className="text-muted/70">{`0 ${label}`}</span>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-sm text-ink-soft underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {`${value} ${label}`}
    </button>
  );
}

/** One ranked bar in a single color showing the total; the confirmed / suggested split is clickable text. Only rows
 *  the alert rule flags as recurring turn terracotta; a long bar alone never changes color. */
function TrendBar({
  row,
  label,
  max,
  inAlert,
  onOpen,
}: {
  row: { count: number; unconfirmed: number };
  label: string;
  max: number;
  inAlert?: boolean;
  onOpen: (status: TrendScope["status"]) => void;
}) {
  const confirmed = row.count - row.unconfirmed;
  return (
    <li className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[0.8rem]">
        <span className="min-w-0 truncate text-ink">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          {inAlert ? <Chip tone="recurring">Recurring</Chip> : null}
          <span className="font-mono text-[0.72rem] text-ink">{row.count}</span>
        </span>
      </div>
      <div className={`h-2.5 overflow-hidden rounded-full ${DATA_FILL.track}`} aria-hidden>
        <div className={`h-full rounded-full ${inAlert ? DATA_FILL.recurring : DATA_FILL.ranking}`} style={{ width: `${(row.count / max) * 100}%` }} />
      </div>
      <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-[0.64rem] text-muted">
        <CountLink value={confirmed} label="confirmed" onOpen={() => onOpen("confirmed")} />
        <span aria-hidden>·</span>
        <CountLink value={row.unconfirmed} label="suggested" onOpen={() => onOpen("suggested")} />
      </p>
    </li>
  );
}

/** Ranked bars for a list of trend rows, or an empty state when nothing is counted yet. */
function TrendList<K>({
  rows,
  labelOf,
  alertOf,
  onOpen,
}: {
  rows: TrendRow<K>[];
  labelOf: (row: TrendRow<K>) => string;
  alertOf?: (row: TrendRow<K>) => boolean;
  onOpen: (row: TrendRow<K>, status: TrendScope["status"]) => void;
}) {
  if (rows.length === 0) return <EmptyState>Nothing counted yet.</EmptyState>;
  const max = Math.max(...rows.map((row) => row.count));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <TrendBar key={labelOf(row)} row={row} label={labelOf(row)} max={max} inAlert={alertOf?.(row)} onOpen={(status) => onOpen(row, status)} />
      ))}
    </ul>
  );
}

/** Trend views over all records (no view filters: the dashboard always shows the whole picture). */
export function TrendsPanel({ tickets, alerts, onOpenScope }: { tickets: readonly Ticket[]; alerts: readonly QualityAlert[]; onOpenScope: (scope: TrendScope) => void }) {
  const [view, setView] = useState<ViewId>("product");
  const alertKeys = new Set(alerts.map((alert) => `${alert.productId}|${alert.failureType}`));

  return (
    <section aria-labelledby="trends-title" className="space-y-4 rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="trends-title" className="font-serif text-lg text-ink">
          Most common failures
        </h2>
        <div role="tablist" aria-label="Trend view" className="inline-flex rounded-full border border-line-strong p-0.5">
          {VIEWS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`trend-tab-${option.id}`}
              aria-selected={view === option.id}
              aria-controls="trend-view"
              onClick={() => setView(option.id)}
              className={segment(view === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-3 rounded-full ${DATA_FILL.ranking}`} /> Complaints
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-3 rounded-full ${DATA_FILL.recurring}`} /> Recurring failure
        </span>
      </div>

      <div id="trend-view" role="tabpanel" aria-labelledby={`trend-tab-${view}`}>
        {view === "product" ? (
          <TrendList
            rows={trendsByProduct(tickets, DEFAULT_FILTERS)}
            labelOf={(row) => `${productName(row.productId)} · ${failureLabel(row.failureType)}`}
            alertOf={(row) => alertKeys.has(`${row.productId}|${row.failureType}`)}
            onOpen={(row, status) => onOpenScope({ productId: row.productId, failureType: row.failureType, status })}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {trendsByCompany(tickets, DEFAULT_FILTERS).map((company) => (
              <div key={company.companyId} className="space-y-3 rounded-xl border border-line bg-canvas px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[0.84rem] font-medium text-ink">{companyName(company.companyId)}</p>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">{company.total}</span>
                </div>
                <TrendList
                  rows={company.rows}
                  labelOf={(row) => failureLabel(row.failureType)}
                  onOpen={(row, status) => onOpenScope({ companyId: company.companyId, failureType: row.failureType, status })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
