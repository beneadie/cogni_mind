"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import {
  AUDIT_FILE,
  AUDIT_REVIEW_FIELDS,
  EXTRACTED_FIELDS,
} from "../lib/audit-data";

export function ExtractedSheetCard({ onOpenFile }: { onOpenFile?: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-elevated/60 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-online/30 bg-online/10 text-online">
          <FileSpreadsheet className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.84rem] font-medium text-ink">
            Draft data sheet · MAA-200
          </p>
          <p className="mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
            {AUDIT_FILE.name} · template v2 · 2026
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-online/30 bg-online/10 px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-online">
            <CheckCircle2 className="h-3 w-3" />
            {EXTRACTED_FIELDS.length} fields
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber-soft px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-amber">
            <Sparkles className="h-3 w-3" />
            {AUDIT_REVIEW_FIELDS.length} need review
          </span>
        </div>
      </div>

      <ul className="divide-y divide-line">
        {EXTRACTED_FIELDS.map((row) => (
          <li
            key={row.field}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2"
          >
            <span className="w-32 shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
              {row.field}
            </span>
            <span className="min-w-0 flex-1 text-[0.78rem] font-medium text-ink">
              {row.value}
              {row.note ? (
                <span
                  className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0.5 align-middle font-mono text-[0.5rem] uppercase tracking-[0.06em] ${
                    row.changed
                      ? "border-amber/30 bg-amber-soft text-amber"
                      : "border-line bg-elevated text-muted"
                  }`}
                >
                  {row.changed ? (
                    <Sparkles className="mr-1 h-2.5 w-2.5" />
                  ) : null}
                  {row.note}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 font-mono text-[0.56rem] uppercase tracking-[0.06em] text-muted">
              {row.source}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-elevated/40 px-4 py-2.5">
        <p className="flex-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted">
          Source: {AUDIT_FILE.name}
        </p>
        {onOpenFile ? (
          <button
            type="button"
            onClick={onOpenFile}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <ArrowUpRight className="h-3 w-3" />
            View uploaded file
          </button>
        ) : null}
      </div>
    </div>
  );
}
