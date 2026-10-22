"use client";

import { useState } from "react";
import { Columns2, Rows3 } from "lucide-react";
import type { DiffLine, DocDiff, DocDiffHunk } from "../lib/types";

type Mode = "unified" | "split";
type SplitRow = { left?: DiffLine; right?: DiffLine };
type SplitSide = "old" | "new";

const MARKER: Record<DiffLine["kind"], string> = {
  context: " ",
  add: "+",
  remove: "-",
};

function toSplitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.kind === "context") {
      rows.push({ left: line, right: line });
      index += 1;
      continue;
    }
    const removes: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (index < lines.length && lines[index].kind === "remove") {
      removes.push(lines[index]);
      index += 1;
    }
    while (index < lines.length && lines[index].kind === "add") {
      adds.push(lines[index]);
      index += 1;
    }
    const count = Math.max(removes.length, adds.length);
    for (let i = 0; i < count; i += 1) {
      rows.push({ left: removes[i], right: adds[i] });
    }
  }
  return rows;
}

function emphasisClass(kind: DiffLine["kind"]) {
  if (kind === "add") return "bg-online/25";
  if (kind === "remove") return "bg-danger/20";
  return "";
}

function LineText({ line }: { line: DiffLine }) {
  const highlight = emphasisClass(line.kind);
  return (
    <span className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-[0.76rem] leading-relaxed">
      {line.segments.map((segment, index) =>
        segment.emphasis ? (
          <span key={index} className={`rounded-[2px] ${highlight}`}>
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}

const ROW_TONE: Record<DiffLine["kind"], string> = {
  context: "text-ink-soft",
  add: "bg-online/10 text-ink",
  remove: "bg-danger-soft/50 text-ink-soft",
};

function UnifiedLine({ line }: { line: DiffLine }) {
  return (
    <div className={`flex items-stretch ${ROW_TONE[line.kind]}`}>
      <span className="w-9 shrink-0 select-none border-r border-line/60 px-1.5 text-right font-mono text-[0.66rem] leading-relaxed text-muted">
        {line.oldLine ?? ""}
      </span>
      <span className="w-9 shrink-0 select-none border-r border-line/60 px-1.5 text-right font-mono text-[0.66rem] leading-relaxed text-muted">
        {line.newLine ?? ""}
      </span>
      <span
        className={`w-5 shrink-0 select-none text-center font-mono text-[0.76rem] leading-relaxed ${
          line.kind === "add"
            ? "text-online"
            : line.kind === "remove"
              ? "text-danger"
              : "text-muted"
        }`}
      >
        {MARKER[line.kind]}
      </span>
      <span className="flex min-w-0 flex-1 px-2">
        <LineText line={line} />
      </span>
    </div>
  );
}

const EMPTY_TONE = "bg-elevated/40";

function SplitLine({ line, side }: { line?: DiffLine; side: SplitSide }) {
  if (!line) {
    return (
      <div className={`flex items-stretch ${EMPTY_TONE}`}>
        <span className="w-9 shrink-0 border-r border-line/60 px-1.5 text-right font-mono text-[0.66rem] leading-relaxed text-muted">
          {" "}
        </span>
        <span className="min-w-0 flex-1 px-2" />
      </div>
    );
  }
  const number = side === "old" ? line.oldLine : line.newLine;
  return (
    <div className={`flex items-stretch ${ROW_TONE[line.kind]}`}>
      <span className="w-9 shrink-0 select-none border-r border-line/60 px-1.5 text-right font-mono text-[0.66rem] leading-relaxed text-muted">
        {number ?? ""}
      </span>
      <span className="flex min-w-0 flex-1 px-2">
        <LineText line={line} />
      </span>
    </div>
  );
}

function Hunk({ hunk, mode }: { hunk: DocDiffHunk; mode: Mode }) {
  const rows = mode === "split" ? toSplitRows(hunk.lines) : null;
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="bg-elevated/60 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
        @@ {hunk.heading}
        {hunk.context ? ` · ${hunk.context}` : ""} @@
      </div>
      <div className="divide-y divide-line/40">
        {mode === "unified"
          ? hunk.lines.map((line, index) => (
              <UnifiedLine key={index} line={line} />
            ))
          : rows?.map((row, index) => (
              <div key={index} className="grid grid-cols-2 divide-x divide-line/60">
                <SplitLine line={row.left} side="old" />
                <SplitLine line={row.right} side="new" />
              </div>
            ))}
      </div>
    </div>
  );
}

export function DocDiff({
  diff,
  applied = false,
  sent = false,
}: {
  diff: DocDiff;
  applied?: boolean;
  sent?: boolean;
}) {
  const [mode, setMode] = useState<Mode>("unified");

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/60 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate font-mono text-[0.72rem] font-medium text-ink">
            {diff.path}
          </span>
          <span className="shrink-0 rounded-full border border-online/40 bg-online/10 px-2 py-0.5 font-mono text-[0.58rem] text-online">
            +{diff.stats.added}
          </span>
          <span className="shrink-0 rounded-full border border-danger/40 bg-danger-soft px-2 py-0.5 font-mono text-[0.58rem] text-danger">
            −{diff.stats.removed}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {sent ? (
            <span className="rounded-full border border-amber/40 bg-amber-soft px-2.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-amber">
              Sent to owner
            </span>
          ) : applied ? (
            <span className="rounded-full border border-line-strong bg-canvas px-2.5 py-0.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-ink-soft">
              Applied
            </span>
          ) : null}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas p-0.5">
            {(
              [
                { id: "unified" as const, label: "Unified", icon: Rows3 },
                { id: "split" as const, label: "Split", icon: Columns2 },
              ]
            ).map((option) => {
              const Icon = option.icon;
              const active = mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                    active
                      ? "bg-accent-soft text-ink"
                      : "text-muted hover:text-ink-soft"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="scroll-soft max-h-[26rem] overflow-y-auto">
        {diff.hunks.map((hunk) => (
          <Hunk key={hunk.heading} hunk={hunk} mode={mode} />
        ))}
      </div>
    </div>
  );
}
