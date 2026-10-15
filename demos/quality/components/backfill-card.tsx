// PURPOSE: "Historical records" card: runs the intake classifier over old free-text tickets and reports progress.
// ROLE: component (server-safe leaf; the click handler comes from the demo root). USED BY: demos/quality/page.tsx.
// Every figure is backfillProgress output over the records, so it stays true after corrections and resets.

import { History } from "lucide-react";
import type { Ticket } from "../lib/contracts";
import { backfillProgress } from "../lib/selectors/records";
import { BUTTON, Chip, SectionLabel } from "./ui";

/** Backfill card; the button runs once per seed, then reports that every historical record has been read. */
export function BackfillCard({ tickets, onRun }: { tickets: readonly Ticket[]; onRun: () => void }) {
  const progress = backfillProgress(tickets);
  const done = progress.pending === 0;
  const figures = [
    { label: "Total", value: progress.total },
    { label: "Suggested", value: progress.classified },
    { label: "Needs review", value: progress.needsReview },
    { label: "Not yet read", value: progress.pending },
  ];

  return (
    <section aria-labelledby="backfill-title" className="space-y-3 rounded-2xl border border-line-strong bg-surface px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 id="backfill-title" className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
            Historical records
          </h2>
          <p className="text-[0.8rem] leading-relaxed text-ink-soft">
            Old tickets from the free-text form, read by the same classifier as new complaints. Each one lands as Suggested or Needs review, never confirmed; the original words are kept.
          </p>
        </div>
        <Chip>Demo classification</Chip>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {figures.map((figure) => (
          <div key={figure.label} className="rounded-xl border border-line bg-canvas px-3 py-2">
            <dt>
              <SectionLabel>{figure.label}</SectionLabel>
            </dt>
            <dd className="mt-1 font-serif text-[1.25rem] leading-none text-ink">{figure.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.74rem] text-muted" aria-live="polite">
          {done ? "Every historical record has been read. Open a ticket in the list to confirm or correct it." : `${progress.pending} of ${progress.total} historical tickets have not been read yet.`}
        </p>
        <button type="button" onClick={onRun} disabled={done} className={BUTTON.primary}>
          <History className="h-3.5 w-3.5" />
          {done ? "Historical tickets classified" : "Classify historical tickets"}
        </button>
      </div>
    </section>
  );
}
