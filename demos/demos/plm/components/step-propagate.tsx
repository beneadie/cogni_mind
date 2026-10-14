import { affectedDocuments } from "../lib/demoData";
import type { DocumentStatus } from "../lib/types";
import { ArrowRight, FileWarning, GitBranch, RotateCcw } from "lucide-react";

const STATUS_STYLE: Record<DocumentStatus, { label: string; chip: string }> = {
  "needs-update": {
    label: "Needs update",
    chip: "border-amber/40 bg-amber-soft text-amber",
  },
  review: {
    label: "Review",
    chip: "border-line-strong bg-elevated text-muted",
  },
};

export function StepPropagate({
  onRestart,
  onReviewHealth,
}: {
  onRestart: () => void;
  onReviewHealth: () => void;
}) {
  const needsUpdate = affectedDocuments.filter(
    (row) => row.status === "needs-update",
  ).length;

  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
            Step 5 · Propagate
          </p>
          <h1 className="mt-1 font-serif text-[1.6rem] leading-tight text-ink">
            Publishing just flagged {needsUpdate} documents
          </h1>
          <p className="mt-1 text-[0.86rem] text-muted">
            The approved change ripples into everything that references these
            fields.
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3.5">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-amber">
          <GitBranch className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.86rem] font-medium text-ink">
            DL-2400 data sheet approved · 5 fields changed
          </p>
          <p className="mt-0.5 text-[0.8rem] text-ink-soft">
            Each document below references a changed attribute and is now out of
            date.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-elevated/50 text-left">
              <th className="px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Document
              </th>
              <th className="hidden px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted sm:table-cell">
                Triggered by
              </th>
              <th className="hidden px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted md:table-cell">
                Last Updated
              </th>
              <th className="px-4 py-2.5 text-right font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {affectedDocuments.map((row) => {
              const status = STATUS_STYLE[row.status];
              return (
                <tr
                  key={row.document}
                  className="border-b border-line/70 last:border-0 hover:bg-elevated/50"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2.5">
                      <FileWarning className="h-4 w-4 shrink-0 text-muted" />
                      <span className="text-[0.84rem] font-medium text-ink">
                        {row.document}
                      </span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[0.8rem] text-ink-soft sm:table-cell">
                    {row.trigger}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[0.76rem] text-muted md:table-cell">
                    {row.lastUpdated}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] ${status.chip}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-2.5">
        <p className="text-[0.82rem] text-ink">
          These documents are now stale. Fix them in one flow.
        </p>
        <button
          type="button"
          onClick={onReviewHealth}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Review documentation health
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
