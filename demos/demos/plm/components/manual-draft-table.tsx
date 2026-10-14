import type { ManualDraftRow } from "../lib/types";
import { CheckCircle2, Crosshair } from "lucide-react";
import { ManualStateChip } from "./manual-state";

function sourceIsPinned(row: ManualDraftRow, pinnedLineIds: string[]) {
  return Boolean(row.sourceLineIds?.some((id) => pinnedLineIds.includes(id)));
}

function SkeletonRow() {
  return (
    <tr className="border-b border-line/70">
      <td className="px-4 py-3">
        <span className="block h-3 w-24 animate-pulse rounded bg-line" />
      </td>
      <td className="px-4 py-3">
        <span className="block h-3 w-32 animate-pulse rounded bg-line" />
      </td>
      <td className="px-4 py-3" />
      <td className="px-4 py-3">
        <span className="ml-auto block h-3 w-16 animate-pulse rounded bg-line" />
      </td>
    </tr>
  );
}

export function ManualDraftTable({
  rows,
  revealedCount,
  resolvedFlagIds,
  pinnedLineIds,
  onHoverLines,
  onPinLines,
  onOpenFlag,
}: {
  rows: ManualDraftRow[];
  revealedCount: number;
  resolvedFlagIds: string[];
  pinnedLineIds: string[];
  onHoverLines: (lineIds: string[]) => void;
  onPinLines: (lineIds: string[]) => void;
  onOpenFlag: (flagId: string) => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <header className="flex items-center gap-2.5 border-b border-line bg-elevated/60 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.82rem] font-medium text-ink">
            Draft Manual — Revision C
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            Auto-drafted · {rows.length} sections
          </p>
        </div>
      </header>

      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Section
              </th>
              <th className="px-4 py-2 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Draft
              </th>
              <th className="px-4 py-2 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Source
              </th>
              <th className="px-4 py-2 text-right font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              if (index >= revealedCount) return <SkeletonRow key={row.id} />;

              const resolved = Boolean(
                row.flagId && resolvedFlagIds.includes(row.flagId),
              );
              const pinned = sourceIsPinned(row, pinnedLineIds);
              const flagged = row.state !== "unchanged" && !resolved;

              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => onHoverLines(row.sourceLineIds ?? [])}
                  onMouseLeave={() => onHoverLines([])}
                  onClick={() => {
                    if (!row.flagId || resolved) return;
                    onOpenFlag(row.flagId);
                  }}
                  className={`border-b border-line/70 transition-colors ${
                    flagged ? "cursor-pointer" : ""
                  } ${
                    pinned
                      ? "bg-gold/10"
                      : row.sourceLineIds?.length
                        ? "hover:bg-elevated/70"
                        : ""
                  }`}
                >
                  <td className="px-4 py-2 align-middle text-[0.8rem] text-ink-soft">
                    {row.field}
                  </td>
                  <td className="px-4 py-2 align-middle text-[0.82rem] font-medium text-ink">
                    {row.value}
                  </td>
                  <td className="px-4 py-2 align-middle">
                    {row.source ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPinLines(row.sourceLineIds ?? []);
                        }}
                        title={`${row.source.section} · pin source`}
                        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.58rem] tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          pinned
                            ? "border-gold/60 bg-gold/15 text-amber"
                            : "border-line-strong text-muted hover:bg-elevated hover:text-ink-soft"
                        }`}
                      >
                        <Crosshair className="h-3 w-3" />
                        {row.source.label}
                      </button>
                    ) : (
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                        {row.note ?? "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right align-middle">
                    <div className="flex justify-end">
                      {resolved ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-online/40 bg-online/10 px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-online">
                          <CheckCircle2 className="h-3 w-3" />
                          Accepted
                        </span>
                      ) : (
                        <ManualStateChip state={row.state} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-line bg-elevated/40 px-4 py-2.5">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
          {revealedCount < rows.length
            ? `Drafting… ${revealedCount} / ${rows.length}`
            : "Draft ready — review the flagged changes"}
        </p>
      </footer>
    </section>
  );
}
