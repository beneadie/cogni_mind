"use client";

import { manualChangeSummary } from "../lib/demoData";
import type { ChangeKind } from "../lib/types";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const KIND_STYLE: Record<ChangeKind, { label: string; chip: string }> = {
  set: { label: "Set", chip: "border-online/40 bg-online/10 text-online" },
  changed: { label: "Changed", chip: "border-amber/40 bg-amber-soft text-amber" },
  confirmed: { label: "Confirmed", chip: "border-line-strong bg-elevated text-ink-soft" },
  kept: { label: "Kept", chip: "border-line bg-elevated text-muted" },
};

export function StepManualPublish({
  onBackToHealth,
}: {
  onBackToHealth: () => void;
}) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="scroll-soft mx-auto flex h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto py-1">
      <div className="shrink-0">
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
          Manual Update · Publish
        </p>
        <h1 className="mt-1 font-serif text-[1.6rem] leading-tight text-ink">
          Manual republished
        </h1>
      </div>

      <div className="rounded-2xl border border-line-strong bg-surface px-5 py-6">
        <div className="flex items-start gap-3.5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-online/15 text-online">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-medium text-ink">
              DL-2400 Installation Manual — Revision C
            </p>
            <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
              Published by A. Reyes ·{" "}
              <span suppressHydrationWarning>{date}</span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Sections updated
          </p>
          <ul className="mt-2.5 divide-y divide-line rounded-xl border border-line">
            {manualChangeSummary.map((change) => {
              const style = KIND_STYLE[change.kind];
              return (
                <li
                  key={change.field}
                  className="flex flex-wrap items-center gap-2 px-3.5 py-2.5"
                >
                  <span className="w-36 shrink-0 text-[0.8rem] text-ink-soft">
                    {change.field}
                  </span>
                  <span className="text-[0.8rem] text-muted line-through">
                    {change.from}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted" />
                  <span className="text-[0.8rem] font-medium text-ink">
                    {change.to}
                  </span>
                  <span
                    className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.54rem] font-medium uppercase tracking-[0.08em] ${style.chip}`}
                  >
                    {style.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onBackToHealth}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Back to documentation health
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
