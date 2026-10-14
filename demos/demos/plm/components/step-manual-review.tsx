"use client";

import { manualDraftRows } from "../lib/demoData";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MANUAL_STATE_META, ManualStateChip } from "./manual-state";

export function StepManualReview({
  resolvedFlagIds,
  onOpenFlag,
  onContinue,
}: {
  resolvedFlagIds: string[];
  onOpenFlag: (flagId: string) => void;
  onContinue: () => void;
}) {
  const changes = manualDraftRows.filter((row) => row.flagId);
  const openCount = changes.filter(
    (row) => row.flagId && !resolvedFlagIds.includes(row.flagId),
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="scroll-soft mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <div className="shrink-0">
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
            Manual Update · Review
          </p>
          <h1 className="mt-1 font-serif text-[1.6rem] leading-tight text-ink">
            Approve each change to the manual
          </h1>
          <p className="mt-1 text-[0.86rem] text-muted">
            {openCount > 0
              ? `${openCount} ${openCount === 1 ? "change needs" : "changes need"} a decision. Each shows the old and new text.`
              : "Every change has been reviewed."}
          </p>
        </div>

        <ul className="space-y-2.5">
          {changes.map((row) => {
            const resolved = Boolean(
              row.flagId && resolvedFlagIds.includes(row.flagId),
            );
            const meta = MANUAL_STATE_META[row.state];
            const Icon = meta.icon;
            return (
              <li
                key={row.id}
                className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-surface px-4 py-3.5 ${
                  resolved ? "border-line" : "border-line-strong"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.88rem] font-medium text-ink">
                      {row.field}
                    </p>
                    {resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-online/40 bg-online/10 px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-online">
                        <CheckCircle2 className="h-3 w-3" />
                        Accepted
                      </span>
                    ) : (
                      <ManualStateChip state={row.state} />
                    )}
                  </div>
                  <p className="mt-0.5 text-[0.78rem] text-ink-soft">
                    {row.source ? `${row.source.section} · ` : ""}
                    {row.note ?? meta.label}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.78rem] text-ink-soft">
                    {row.value}
                  </span>
                  {!resolved ? (
                    <button
                      type="button"
                      onClick={() => onOpenFlag(row.flagId as string)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Review
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-strong bg-surface px-4 py-2.5">
        <p className="text-[0.82rem] text-ink-soft">
          {openCount > 0
            ? "Review every change to publish the manual."
            : "All clear — nothing unresolved."}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={openCount > 0}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Publish manual
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
