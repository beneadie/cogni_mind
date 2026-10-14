"use client";

import { motion } from "framer-motion";
import { sources } from "@/demos/ingest/lib/data";
import type { SourceProfile } from "@/demos/ingest/lib/types";

const columns: {
  key: string;
  label: string;
  get: (source: SourceProfile) => string;
}[] = [
  { key: "delimiter", label: "Delimiter", get: (source) => source.delimiter },
  { key: "language", label: "Language", get: (source) => source.language },
  { key: "currency", label: "Currency", get: (source) => source.currency },
  { key: "decimals", label: "Decimals", get: (source) => source.decimals },
  { key: "headers", label: "Headers", get: (source) => source.headers },
];

function majority(values: string[]): string {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  let best = values[0];
  let bestCount = 0;
  counts.forEach((count, value) => {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  });
  return best;
}

export function DiffMatrix() {
  const majorities = columns.map((column) =>
    majority(sources.map(column.get)),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="scroll-soft overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-3 py-2 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted">
                Source
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-3 py-2 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((source, rowIndex) => {
              const odd = source.language === "German";
              return (
                <motion.tr
                  key={source.file}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.04 }}
                  className={odd ? "bg-amber-soft/50" : ""}
                >
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[0.62rem] text-ink">
                    {source.file}
                  </td>
                  {columns.map((column, columnIndex) => {
                    const value = column.get(source);
                    const differs = value !== majorities[columnIndex];
                    return (
                      <td key={column.key} className="px-3 py-2">
                        <span
                          className={`font-mono text-[0.62rem] ${
                            differs ? "font-medium text-amber" : "text-ink-soft"
                          }`}
                        >
                          {value}
                          {differs ? " •" : ""}
                        </span>
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 border-t border-line px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-amber-soft ring-1 ring-amber/40" />
        <p className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
          differs from the majority
        </p>
      </div>
    </div>
  );
}
