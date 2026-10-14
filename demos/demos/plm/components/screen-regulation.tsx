"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { regulationRisks } from "../lib/demoData";
import type { RegulationRisk } from "../lib/types";

type SortKey = "product" | "regulation" | "risk" | "reason" | "revenue";

const RISK_RANK: Record<RegulationRisk, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const RISK_STYLE: Record<RegulationRisk, { dot: string; chip: string }> = {
  High: { dot: "bg-danger", chip: "border-danger/40 bg-danger-soft text-danger" },
  Medium: { dot: "bg-amber", chip: "border-amber/40 bg-amber-soft text-amber" },
  Low: { dot: "bg-online", chip: "border-online/40 bg-online/10 text-online" },
};

const REGULATIONS = [
  "All regulations",
  "EU Chrome Restriction 2026",
  "RoHS 2027",
];

export function ScreenRegulation() {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState(REGULATIONS[0]);

  const sorted = useMemo(() => {
    const rows = regulationRisks.filter(
      (row) => filter === REGULATIONS[0] || row.regulation === filter,
    );
    const compare = (a: (typeof rows)[number], b: (typeof rows)[number]) => {
      if (sortKey === "revenue")
        return a.annualRevenueValue - b.annualRevenueValue;
      if (sortKey === "risk") return RISK_RANK[a.risk] - RISK_RANK[b.risk];
      return a[sortKey].localeCompare(b[sortKey]);
    };
    return [...rows].sort((a, b) => {
      const result = compare(a, b);
      return dir === "asc" ? result : -result;
    });
  }, [sortKey, dir, filter]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir(key === "revenue" || key === "risk" ? "desc" : "asc");
    }
  };

  const headers: { key: SortKey; label: string; className?: string }[] = [
    { key: "product", label: "Product" },
    { key: "regulation", label: "Regulation" },
    { key: "risk", label: "Risk" },
    { key: "reason", label: "Reason" },
    { key: "revenue", label: "Annual Revenue", className: "text-right" },
  ];

  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[1.5rem] leading-tight text-ink">
            Products at Risk from Upcoming Regulations
          </h1>
          <p className="mt-1.5 text-[0.88rem] text-ink-soft">
            Ranked by annual revenue so the biggest exposure surfaces first.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
          <span className="sr-only">Filter by regulation</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="bg-transparent font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink focus:outline-none"
          >
            {REGULATIONS.map((regulation) => (
              <option key={regulation} value={regulation}>
                {regulation}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-elevated/50 text-left">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-2.5 ${header.className ?? ""}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(header.key)}
                    className={`inline-flex items-center gap-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      sortKey === header.key
                        ? "text-ink"
                        : "text-muted hover:text-ink-soft"
                    }`}
                  >
                    {header.label}
                    {sortKey === header.key ? (
                      dir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.product}
                className="border-b border-line/70 last:border-0 hover:bg-elevated/50"
              >
                <td className="px-4 py-3 font-mono text-[0.82rem] font-semibold tracking-[0.02em] text-ink">
                  {row.product}
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-ink-soft">
                  {row.regulation}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] ${RISK_STYLE[row.risk].chip}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${RISK_STYLE[row.risk].dot}`}
                    />
                    {row.risk}
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-ink-soft">
                  {row.reason}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[0.82rem] font-medium text-ink">
                  {row.annualRevenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-line bg-elevated/40 px-4 py-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            {sorted.length} {sorted.length === 1 ? "product" : "products"} ·
            sorted by{" "}
            {headers.find((header) => header.key === sortKey)?.label.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
