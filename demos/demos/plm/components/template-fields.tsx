"use client";

import { useState } from "react";
import type { DataSheetRow, TemplateField, UnmappedAttribute } from "../lib/types";
import { Check, ChevronDown, Info, Layers, X } from "lucide-react";

export function TemplateFields({
  fields,
  rows,
  resolvedFlagIds,
  unmapped,
}: {
  fields: TemplateField[];
  rows: DataSheetRow[];
  resolvedFlagIds: string[];
  unmapped: UnmappedAttribute[];
}) {
  const [open, setOpen] = useState(false);

  const missing = new Set(
    rows
      .filter(
        (row) =>
          row.state === "missing" &&
          !(row.flagId && resolvedFlagIds.includes(row.flagId)),
      )
      .map((row) => row.field),
  );
  const requiredCount = fields.filter((field) => field.required).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Layers className="h-4 w-4 shrink-0 text-amber" />
        <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
          Data sheet template v3
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
          {requiredCount} required · {missing.size} missing · {unmapped.length}{" "}
          unmapped
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
          {open ? "Hide" : "Details"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <div className="border-t border-line px-4 py-3">
          <ul className="flex flex-wrap gap-1.5">
            {fields.map((field) => {
              const isMissing = field.required && missing.has(field.field);
              return (
                <li
                  key={field.field}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[0.58rem] tracking-[0.02em] ${
                    isMissing
                      ? "border-danger/40 bg-danger-soft text-danger"
                      : field.required
                        ? "border-line-strong bg-elevated text-ink-soft"
                        : "border-line text-muted"
                  }`}
                >
                  {isMissing ? (
                    <X className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3 text-online" />
                  )}
                  {field.field}
                  {field.required ? null : (
                    <span className="text-muted/70">· optional</span>
                  )}
                </li>
              );
            })}
          </ul>

          {unmapped.length > 0 ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-elevated/50 px-3 py-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
              <p className="text-[0.74rem] leading-snug text-ink-soft">
                Found in the spec but not mapped to a template field:{" "}
                {unmapped.map((item) => item.attribute).join("; ")}.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
