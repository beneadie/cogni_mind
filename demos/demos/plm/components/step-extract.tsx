"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  dataSheetRows,
  specDoc,
  templateFields,
  unmappedAttributes,
} from "../lib/demoData";
import { ArrowRight } from "lucide-react";
import { SpecDocument } from "./spec-document";
import { DataSheetTable } from "./data-sheet-table";
import { TemplateFields } from "./template-fields";
import { StateLegend } from "./field-state";

const STAGGER_MS = 300;
const START_MS = 500;

export function StepExtract({
  resolvedFlagIds,
  onOpenFlag,
  onContinue,
}: {
  resolvedFlagIds: string[];
  onOpenFlag: (flagId: string) => void;
  onContinue: () => void;
}) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [revealLineIds, setRevealLineIds] = useState<string[]>([]);
  const [hoveredLineIds, setHoveredLineIds] = useState<string[]>([]);
  const [pinnedLineIds, setPinnedLineIds] = useState<string[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const after = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };

    dataSheetRows.forEach((row, index) => {
      after(START_MS + index * STAGGER_MS, () => {
        setRevealedCount(index + 1);
        setRevealLineIds(row.sourceLineIds ?? []);
      });
    });
    after(START_MS + dataSheetRows.length * STAGGER_MS + 600, () =>
      setRevealLineIds([]),
    );

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const openCount = useMemo(
    () =>
      dataSheetRows.filter(
        (row) => row.flagId && !resolvedFlagIds.includes(row.flagId),
      ).length,
    [resolvedFlagIds],
  );

  const highlightedLineIds = useMemo(
    () => [
      ...new Set([...revealLineIds, ...hoveredLineIds, ...pinnedLineIds]),
    ],
    [revealLineIds, hoveredLineIds, pinnedLineIds],
  );

  const togglePin = (lineIds: string[]) => {
    if (lineIds.length === 0) return;
    setPinnedLineIds((prev) =>
      lineIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !lineIds.includes(id))
        : [...new Set([...prev, ...lineIds])],
    );
  };

  const extracting = revealedCount < dataSheetRows.length;

  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
            Step 2 · Extract &amp; Verify
          </p>
          <h1 className="mt-0.5 font-serif text-[1.5rem] leading-tight text-ink">
            Every field traces back to the source
          </h1>
          <p className="mt-0.5 text-[0.84rem] text-muted">
            {extracting
              ? "Reading the scan and filling the template…"
              : "Hover a row to trace it; click a source chip to pin it. Click a flagged row to review."}
          </p>
        </div>
        <StateLegend />
      </div>

      <div className="grid min-h-0 gap-3 lg:flex-1 lg:grid-cols-2">
        <div className="h-[56vh] min-h-0 lg:h-full">
          <SpecDocument doc={specDoc} highlightedLineIds={highlightedLineIds} />
        </div>
        <div className="h-[56vh] min-h-0 lg:h-full">
          <DataSheetTable
            rows={dataSheetRows}
            revealedCount={revealedCount}
            resolvedFlagIds={resolvedFlagIds}
            pinnedLineIds={pinnedLineIds}
            onHoverLines={setHoveredLineIds}
            onPinLines={togglePin}
            onOpenFlag={onOpenFlag}
          />
        </div>
      </div>

      <div className="shrink-0">
        <TemplateFields
          fields={templateFields}
          rows={dataSheetRows}
          unmapped={unmappedAttributes}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-strong bg-surface px-4 py-2.5">
        <p className="text-[0.82rem] text-ink-soft">
          {openCount > 0
            ? `${openCount} ${openCount === 1 ? "exception needs" : "exceptions need"} a human decision before publishing.`
            : "All exceptions resolved. Ready to approve."}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={extracting}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {openCount > 0 ? `Review ${openCount} exceptions` : "Continue"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
