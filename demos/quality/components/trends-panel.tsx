"use client";

// PURPOSE: "Most common failures": By product / By company bar views with company and time-range filters.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the view tabs. Bars, counts and notes are selector output only; filters live in the store.

import { useState } from "react";
import { Merge } from "lucide-react";
import type { CompanyId, Filters, QualityAlert, Ticket } from "../lib/contracts";
import { COMPANIES, companyName, failureLabel, productName } from "../lib/data/catalog";
import { TIME_RANGES, ticketCounters } from "../lib/selectors/records";
import { type TrendRow, trendsByCompany, trendsByProduct } from "../lib/selectors/trends";
import { ALERT_WINDOW_DAYS } from "../lib/thresholds";
import { Chip, EmptyState, FIELD, SectionLabel, UnconfirmedNote } from "./ui";

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

/** One ranked bar; width is relative to the largest bar in the same list. */
function TrendBar({ row, label, max, inAlert }: { row: { count: number; unconfirmed: number }; label: string; max: number; inAlert?: boolean }) {
  return (
    <li className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-[0.78rem]">
        <span className="min-w-0 truncate text-ink">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          {inAlert ? <Chip tone="danger">Alert</Chip> : null}
          <span className="font-mono text-[0.7rem] text-ink">{row.count}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated" aria-hidden>
        <div className={`h-full rounded-full ${inAlert ? "bg-amber" : "bg-accent/70"}`} style={{ width: `${(row.count / max) * 100}%` }} />
      </div>
      <UnconfirmedNote count={row.unconfirmed} />
    </li>
  );
}

/** Ranked bars for a list of trend rows, or an empty state when the filters leave nothing to count. */
function TrendList<K>({ rows, labelOf, alertOf }: { rows: TrendRow<K>[]; labelOf: (row: TrendRow<K>) => string; alertOf?: (row: TrendRow<K>) => boolean }) {
  if (rows.length === 0) return <EmptyState>Nothing counted for these filters yet. Classify historical tickets or confirm a complaint.</EmptyState>;
  const max = Math.max(...rows.map((row) => row.count));
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <TrendBar key={labelOf(row)} row={row} label={labelOf(row)} max={max} inAlert={alertOf?.(row)} />
      ))}
    </ul>
  );
}

/** Trend views over the records; changing a filter dispatches to the store so the Evidence rail shows it too. */
export function TrendsPanel({
  tickets,
  filters,
  alerts,
  onFilters,
}: {
  tickets: readonly Ticket[];
  filters: Filters;
  alerts: readonly QualityAlert[];
  onFilters: (filters: Partial<Filters>) => void;
}) {
  const [view, setView] = useState<ViewId>("product");
  const counters = ticketCounters(tickets, filters);
  // Unknown = no product or no failure type yet (needs review or unclassified); shown, never counted.
  const unknown = counters.needsReview + counters.unclassified;
  const alertKeys = new Set(alerts.map((alert) => `${alert.productId}|${alert.failureType}`));

  return (
    <section aria-labelledby="trends-title" className="space-y-4 rounded-2xl border border-line-strong bg-surface px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="trends-title" className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
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

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[12rem] flex-1 space-y-1 sm:flex-none">
          <SectionLabel>Company</SectionLabel>
          <select value={filters.companyId} onChange={(event) => onFilters({ companyId: event.target.value as CompanyId | "all" })} className={FIELD}>
            <option value="all">All companies</option>
            {COMPANIES.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-1">
          <SectionLabel>Time range</SectionLabel>
          <div role="group" aria-label="Time range" className="inline-flex rounded-full border border-line-strong p-0.5">
            {TIME_RANGES.map((range) => (
              <button key={range.id} type="button" aria-pressed={filters.range === range.id} onClick={() => onFilters({ range: range.id })} className={segment(filters.range === range.id)}>
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5" aria-live="polite">
        <Chip>{counters.counted} counted</Chip>
        <Chip tone={unknown > 0 ? "amber" : "neutral"}>{unknown} unknown, not counted</Chip>
        {counters.duplicatesMerged > 0 ? (
          <Chip>
            <Merge className="h-3 w-3" />
            {counters.duplicatesMerged} {counters.duplicatesMerged === 1 ? "duplicate" : "duplicates"} merged
          </Chip>
        ) : null}
        <UnconfirmedNote count={counters.unconfirmed} />
      </div>

      <div id="trend-view" role="tabpanel" aria-labelledby={`trend-tab-${view}`}>
        {view === "product" ? (
          <TrendList
            rows={trendsByProduct(tickets, filters)}
            labelOf={(row) => `${productName(row.productId)} · ${failureLabel(row.failureType)}`}
            alertOf={(row) => alertKeys.has(`${row.productId}|${row.failureType}`)}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {trendsByCompany(tickets, filters).map((company) => (
              <div key={company.companyId} className="space-y-2 rounded-xl border border-line bg-canvas px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[0.8rem] font-medium text-ink">{companyName(company.companyId)}</p>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">{company.total} counted</span>
                </div>
                <TrendList rows={company.rows} labelOf={(row) => failureLabel(row.failureType)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[0.72rem] leading-relaxed text-muted">
        Legacy model names from each company resolve to one product line. Time ranges count back from today in the demo clock. Alerts always use their own {ALERT_WINDOW_DAYS}-day rule, whatever the filters.
      </p>
    </section>
  );
}
