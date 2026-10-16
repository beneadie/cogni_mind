"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { regulationRisks } from "../lib/demoData";
import type { RegulationRisk, RegulationRiskRow } from "../lib/types";

type SortKey =
  | "product"
  | "company"
  | "substance"
  | "regulation"
  | "risk"
  | "reason"
  | "units"
  | "openOrders";

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

export function ScreenRegulation({
  rows = regulationRisks,
  title = "Products at Risk from Upcoming Regulations",
  subtitle = "Ranked by units shipped so the products with the most affected volume surface first.",
  onViewProduct,
}: {
  rows?: RegulationRiskRow[];
  title?: string;
  subtitle?: string;
  onViewProduct?: (product: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("units");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("All regulations");

  const showCompany = rows.some((row) => row.company);
  const showSubstance = rows.some((row) => row.substance);

  const regulations = useMemo(
    () => ["All regulations", ...new Set(rows.map((row) => row.regulation))],
    [rows],
  );

  const sorted = useMemo(() => {
    const filtered = rows.filter(
      (row) => filter === "All regulations" || row.regulation === filter,
    );
    const compare = (a: RegulationRiskRow, b: RegulationRiskRow) => {
      if (sortKey === "units")
        return a.unitsShippedValue - b.unitsShippedValue;
      if (sortKey === "openOrders")
        return a.openOrdersValue - b.openOrdersValue;
      if (sortKey === "risk") return RISK_RANK[a.risk] - RISK_RANK[b.risk];
      const av = (a[sortKey] ?? "") as string;
      const bv = (b[sortKey] ?? "") as string;
      return av.localeCompare(bv);
    };
    return [...filtered].sort((a, b) => {
      const result = compare(a, b);
      return dir === "asc" ? result : -result;
    });
  }, [rows, filter, sortKey, dir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir(
        key === "units" || key === "openOrders" || key === "risk"
          ? "desc"
          : "asc",
      );
    }
  };

  const headers: { key: SortKey; label: string; className?: string }[] = [
    { key: "product", label: "Product" },
  ];
  if (showCompany) headers.push({ key: "company", label: "Company" });
  headers.push({ key: "risk", label: "Risk" });
  headers.push({ key: "reason", label: "Why" });
  if (showSubstance)
    headers.push({ key: "substance", label: "Restricted substance" });
  headers.push({ key: "units", label: "Units shipped", className: "text-right" });
  headers.push({ key: "openOrders", label: "Open orders", className: "text-right" });

  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[1.5rem] leading-tight text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-[0.88rem] text-ink-soft">{subtitle}</p>
        </div>

        {regulations.length > 2 ? (
          <label className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3 py-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
            <span className="sr-only">Filter by regulation</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="bg-transparent font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink focus:outline-none"
            >
              {regulations.map((regulation) => (
                <option key={regulation} value={regulation}>
                  {regulation}
                </option>
              ))}
            </select>
          </label>
        ) : null}
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
                key={`${row.product}-${row.regulation}`}
                className="border-b border-line/70 last:border-0 hover:bg-elevated/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[0.82rem] font-semibold tracking-[0.02em] text-ink">
                      {row.product}
                    </span>
                    {onViewProduct ? (
                      <button
                        type="button"
                        onClick={() => onViewProduct(row.product)}
                        className="rounded-full border border-line-strong px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        View product
                      </button>
                    ) : null}
                  </div>
                  {row.regulation ? (
                    <span className="mt-1 block font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                      {row.regulation}
                    </span>
                  ) : null}
                </td>
                {showCompany ? (
                  <td className="px-4 py-3 text-[0.82rem] text-ink-soft">
                    {row.company}
                  </td>
                ) : null}
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
                {showSubstance ? (
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-danger">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                      {row.substance}
                    </span>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right font-mono text-[0.82rem] font-medium text-ink">
                  {row.unitsShipped}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[0.82rem] text-ink-soft">
                  {row.openOrders}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-line bg-elevated/40 px-4 py-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            {sorted.length} {sorted.length === 1 ? "product" : "products"} ·
            sorted by{" "}
            {headers
              .find((header) => header.key === sortKey)
              ?.label.toLowerCase() ?? "units"}
          </p>
        </div>
      </div>
    </div>
  );
}
