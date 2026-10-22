"use client";

// PURPOSE: "Ticket Trends": failure types per company with muted bars (default), or one summary card per product.
// ROLE: component. USED BY: dashboard.tsx.
// Client component for the view tabs. Counts come from the already-filtered tickets passed in; nothing is hardcoded.

import { useState } from "react";
import { AirVent, Building2, ChevronRight, Flame, type LucideIcon, ThermometerSun } from "lucide-react";
import type { FailureType, ProductId, QualityAlert, Ticket } from "../lib/contracts";
import { COMPANIES, FAILURE_TYPES, PRODUCTS, failureLabel, failureOrder } from "../lib/data/catalog";
import { Chip, DATA_FILL, EmptyState } from "./ui";

/** A small category icon per canonical product line. */
const PRODUCT_ICON: Record<ProductId, LucideIcon> = {
  "split-ac-3t": AirVent,
  "heat-pump-4t": ThermometerSun,
  "rtu-10t": Building2,
  "furnace-80k": Flame,
};

/** The two trend views, in tab order; company first. */
const VIEWS = [
  { id: "company", label: "By company" },
  { id: "product", label: "By product" },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

/** Segmented-control button classes; the pressed state uses the primary pill look. */
function segment(active: boolean): string {
  const base = "rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  return `${base} ${active ? "bg-accent text-canvas" : "text-ink-soft hover:bg-elevated"}`;
}

type ProductSummary = { id: ProductId; name: string; total: number; top: { failureType: FailureType; count: number } | null; recurring: FailureType[] };

/** Per product: analyzed tickets, the most common failure type, and recurring failures from the (filtered) alerts. */
function productSummaries(tickets: readonly Ticket[], alerts: readonly QualityAlert[]): ProductSummary[] {
  const analyzed = tickets.filter((ticket) => ticket.tags.status !== "unclassified");
  return PRODUCTS.map((product) => {
    const own = analyzed.filter((ticket) => ticket.tags.productId === product.id);
    const byFailure = FAILURE_TYPES.map((failure) => ({ failureType: failure.id, count: own.filter((ticket) => ticket.tags.failureType === failure.id).length }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count || failureOrder(a.failureType) - failureOrder(b.failureType));
    const recurring = alerts.filter((alert) => alert.productId === product.id).map((alert) => alert.failureType);
    return { id: product.id, name: product.name, total: own.length, top: byFailure[0] ?? null, recurring };
  })
    .filter((summary) => summary.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** One product summary card; opens the ticket records for that product under the current filters. */
function ProductCard({ summary, onOpen }: { summary: ProductSummary; onOpen: () => void }) {
  const Icon = PRODUCT_ICON[summary.id];
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex h-full w-full flex-col gap-3 rounded-xl border border-line bg-canvas px-4 py-4 text-left transition-colors hover:border-line-strong hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-[#4a6d8a]">
            <Icon className="h-[1.05rem] w-[1.05rem]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.88rem] font-medium leading-snug text-ink">{summary.name}</span>
            <span className="block font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted">
              {summary.total} {summary.total === 1 ? "ticket" : "tickets"}
            </span>
          </span>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="block border-t border-line pt-2.5">
          <span className="block font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">Most common failure</span>
          <span className="block text-[0.8rem] text-ink">
            {summary.top ? `${failureLabel(summary.top.failureType)} · ${summary.top.count}` : "No failure type identified yet"}
          </span>
        </span>
        {summary.recurring.length ? (
          <span className="flex flex-wrap gap-1.5">
            {summary.recurring.map((failureType) => (
              <Chip key={failureType} tone="recurring">
                Recurring · {failureLabel(failureType)}
              </Chip>
            ))}
          </span>
        ) : null}
      </button>
    </li>
  );
}

/** One count + bar row; the bar is relative to `max` (the largest row in the same list). */
function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-[0.84rem]">
        <span className="min-w-0 truncate text-ink">{label}</span>
        <span className="shrink-0 font-mono text-[0.76rem] text-ink">{count}</span>
      </div>
      <div className={`h-2.5 overflow-hidden rounded-full ${DATA_FILL.track}`} aria-hidden>
        <div className={`h-full rounded-full ${DATA_FILL.ranking}`} style={{ width: `${(count / max) * 100}%` }} />
      </div>
    </li>
  );
}

/** Per company: failure types with their ticket counts, largest first (tickets with no failure type yet are left out). */
function companyCards(tickets: readonly Ticket[]): { id: string; name: string; total: number; rows: { label: string; count: number }[] }[] {
  const analyzed = tickets.filter((ticket) => ticket.tags.status !== "unclassified" && ticket.tags.failureType);
  return COMPANIES.map((company) => {
    const own = analyzed.filter((ticket) => ticket.companyId === company.id);
    const rows = FAILURE_TYPES.map((failure) => ({ label: failure.label, count: own.filter((ticket) => ticket.tags.failureType === failure.id).length }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
    return { id: company.id, name: company.name, total: own.length, rows };
  }).filter((card) => card.total > 0);
}

/** Ticket Trends over the filtered tickets; `alerts` are the filtered alerts, used only for the recurring marker. */
export function TrendsPanel({ tickets, alerts, onOpenProduct }: { tickets: readonly Ticket[]; alerts: readonly QualityAlert[]; onOpenProduct: (productId: ProductId) => void }) {
  const [view, setView] = useState<ViewId>("company");
  const products = productSummaries(tickets, alerts);
  const cards = companyCards(tickets);

  return (
    <section aria-labelledby="trends-title" className="space-y-4 rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="trends-title" className="font-serif text-lg text-ink">
          Ticket Trends
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

      <div id="trend-view" role="tabpanel" aria-labelledby={`trend-tab-${view}`}>
        {view === "company" ? (
          cards.length === 0 ? (
            <EmptyState>No tickets for these filters.</EmptyState>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => {
                const cardMax = Math.max(1, ...card.rows.map((row) => row.count));
                return (
                  <div key={card.id} className="space-y-3 rounded-xl border border-line bg-canvas px-4 py-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[0.9rem] font-medium text-ink">{card.name}</p>
                      <span className="font-mono text-[0.7rem] text-muted">{card.total}</span>
                    </div>
                    <ul className="space-y-3">
                      {card.rows.map((row) => (
                        <BarRow key={row.label} label={row.label} count={row.count} max={cardMax} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )
        ) : products.length === 0 ? (
          <EmptyState>No tickets for these filters.</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((summary) => (
              <ProductCard key={summary.id} summary={summary} onOpen={() => onOpenProduct(summary.id)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
