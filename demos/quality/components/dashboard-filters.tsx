"use client";

// PURPOSE: The dashboard's compact top filter row: product, company, date range (with custom dates).
// ROLE: component. USED BY: dashboard.tsx.
// Controlled: the page owns the filters; lib/selectors/dashboard.ts applies them.

import { COMPANIES, PRODUCTS } from "../lib/data/catalog";
import type { DashboardFilters } from "../lib/selectors/dashboard";
import { DEMO_NOW } from "../lib/time";
import { FIELD, SectionLabel } from "./ui";

const RANGES: readonly { id: DashboardFilters["range"]; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom" },
];

function segment(active: boolean): string {
  const base = "rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  return `${base} ${active ? "bg-accent text-canvas" : "text-ink-soft hover:bg-elevated"}`;
}

/** Compact filter row: product first (the main lens), then company and dates. */
export function FilterBar({ filters, onChange }: { filters: DashboardFilters; onChange: (filters: DashboardFilters) => void }) {
  const set = (patch: Partial<DashboardFilters>) => onChange({ ...filters, ...patch });
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line-strong bg-surface px-4 py-3">
      <label className="min-w-[12rem] flex-1 space-y-1">
        <SectionLabel>Product</SectionLabel>
        <select value={filters.productId} onChange={(event) => set({ productId: event.target.value as DashboardFilters["productId"] })} className={`${FIELD} font-medium`}>
          <option value="all">All products</option>
          {PRODUCTS.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-[10rem] flex-1 space-y-1 sm:flex-none">
        <SectionLabel>Company</SectionLabel>
        <select value={filters.companyId} onChange={(event) => set({ companyId: event.target.value as DashboardFilters["companyId"] })} className={FIELD}>
          <option value="all">All companies</option>
          {COMPANIES.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-1">
        <SectionLabel>Date range</SectionLabel>
        <div role="group" aria-label="Date range" className="inline-flex rounded-full border border-line-strong p-0.5">
          {RANGES.map((range) => (
            <button key={range.id} type="button" aria-pressed={filters.range === range.id} onClick={() => set({ range: range.id })} className={segment(filters.range === range.id)}>
              {range.label}
            </button>
          ))}
        </div>
      </div>
      {filters.range === "custom" ? (
        <div className="flex items-end gap-2">
          <label className="space-y-1">
            <SectionLabel>From</SectionLabel>
            <input type="date" value={filters.from} max={filters.to || DEMO_NOW} onChange={(event) => set({ from: event.target.value })} className={FIELD} />
          </label>
          <label className="space-y-1">
            <SectionLabel>To</SectionLabel>
            <input type="date" value={filters.to} min={filters.from} max={DEMO_NOW} onChange={(event) => set({ to: event.target.value })} className={FIELD} />
          </label>
        </div>
      ) : null}
    </div>
  );
}
