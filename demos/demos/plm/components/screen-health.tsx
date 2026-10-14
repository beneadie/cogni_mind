import { docHealthRows, manualTargetDocId } from "../lib/demoData";
import type { DocHealthRow, DocStatus } from "../lib/types";
import { Archive, ArrowRight, CheckCircle2, FileWarning, XCircle } from "lucide-react";

const STATUS_META: Record<
  DocStatus,
  { label: string; icon: typeof CheckCircle2; chip: string }
> = {
  "out-of-date": {
    label: "Out of date",
    icon: XCircle,
    chip: "border-danger/40 bg-danger-soft text-danger",
  },
  current: {
    label: "Current",
    icon: CheckCircle2,
    chip: "border-online/40 bg-online/10 text-online",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    chip: "border-line-strong bg-elevated text-muted",
  },
};

function effectiveStatus(row: DocHealthRow, published: string[]): DocStatus {
  return published.includes(row.id) ? "current" : row.status;
}

export function ScreenHealth({
  publishedDocIds,
  onUpdate,
}: {
  publishedDocIds: string[];
  onUpdate: () => void;
}) {
  const rows = docHealthRows.map((row) => {
    const status = effectiveStatus(row, publishedDocIds);
    return {
      ...row,
      status,
      revisionsBehind: status === "out-of-date" ? row.revisionsBehind : 0,
    };
  });

  const outOfDate = rows.filter((row) => row.status === "out-of-date").length;
  const current = rows.filter((row) => row.status === "current").length;
  const archived = rows.filter((row) => row.status === "archived").length;

  const tiles = [
    { label: "Documents out of date", value: outOfDate, tone: "danger" as const, icon: XCircle },
    { label: "Documents current", value: current, tone: "online" as const, icon: CheckCircle2 },
    { label: "Documents archived", value: archived, tone: "muted" as const, icon: Archive },
  ];

  const toneClass = {
    danger: "text-danger",
    online: "text-online",
    muted: "text-muted",
  };

  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <div>
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
          Documentation Health
        </p>
        <h1 className="mt-1 font-serif text-[1.5rem] leading-tight text-ink">
          Documentation Health — DL Series
        </h1>
        <p className="mt-1 text-[0.86rem] text-muted">
          {outOfDate > 0
            ? `${outOfDate} ${outOfDate === 1 ? "document needs" : "documents need"} updating. Oldest trails 4 spec revisions.`
            : "Every document is current. The loop is closed."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className="rounded-2xl border border-line-strong bg-surface px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${toneClass[tile.tone]}`} />
                <span className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.12em] text-muted">
                  {tile.label}
                </span>
              </div>
              <p
                className={`mt-2 font-serif text-[2rem] leading-none ${toneClass[tile.tone]}`}
              >
                {tile.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-elevated/50 text-left">
              <th className="px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Document
              </th>
              <th className="hidden px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted sm:table-cell">
                Last Updated
              </th>
              <th className="hidden px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted md:table-cell">
                Behind
              </th>
              <th className="px-4 py-2.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Status
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = STATUS_META[row.status];
              const Icon = meta.icon;
              const actionable = row.status === "out-of-date";
              return (
                <tr
                  key={row.id}
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
                  <td className="hidden px-4 py-3 font-mono text-[0.76rem] text-muted sm:table-cell">
                    {row.lastUpdated}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[0.76rem] text-muted md:table-cell">
                    {row.revisionsBehind > 0 ? `${row.revisionsBehind} rev` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] ${meta.chip}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {actionable ? (
                      <button
                        type="button"
                        onClick={onUpdate}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        {row.id === manualTargetDocId
                          ? "Update this manual"
                          : "Update"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
