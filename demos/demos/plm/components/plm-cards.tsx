"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  approvedChanges,
  dataSheetRows,
  affectedDocuments,
  manualChangeSummary,
  manualDraftRows,
  templateFields,
  unmappedAttributes,
  SPEC_FILE_NAME,
  SPEC_PAGES,
  SPEC_SIZE,
} from "../lib/demoData";
import { RESOLUTIONS } from "../lib/turns";
import type {
  ChangeKind,
  DataSheetRow,
  DocumentStatus,
  FieldState,
  ManualDraftRow,
  ManualState,
} from "../lib/types";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  FileWarning,
  GitBranch,
} from "lucide-react";
import { DataSheetTable } from "./data-sheet-table";
import { TemplateFields } from "./template-fields";
import { StateChip, STATE_META, StateLegend } from "./field-state";
import { ManualDraftTable } from "./manual-draft-table";
import { ManualStateChip, MANUAL_STATE_META, ManualStateLegend } from "./manual-state";
import { ScreenHealth } from "./screen-health";
import { ScreenRegulation } from "./screen-regulation";
import { ScreenLegacyParts } from "./screen-legacy-parts";

const STAGGER_MS = 240;
const START_MS = 300;

/* ------------------------------------------------------------------ */
/* Upload                                                              */
/* ------------------------------------------------------------------ */

export function UploadCard({ onOpen }: { onOpen?: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!onOpen}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-line-strong bg-surface p-4 text-left transition-colors enabled:hover:border-accent/40 enabled:hover:bg-elevated/40 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span className="relative inline-flex h-14 w-11 shrink-0 items-center justify-center rounded-md border border-line-strong bg-canvas">
        <FileText className="h-5 w-5 text-danger" />
        <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 rounded-sm bg-danger-soft px-1 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-danger">
          PDF
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.88rem] font-medium text-ink">
          {SPEC_FILE_NAME}
        </p>
        <p className="mt-0.5 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-muted">
          {SPEC_PAGES} pages · {SPEC_SIZE} · scanned at 300 dpi
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-online">
        <CheckCircle2 className="h-4 w-4" />
        Loaded
      </span>
      {onOpen ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] text-ink-soft">
          <FileText className="h-3 w-3" />
          Open
        </span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Data sheet                                                          */
/* ------------------------------------------------------------------ */

function useReveal(count: number) {
  const [revealed, setRevealed] = useState(0);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => {
    for (let index = 0; index < count; index += 1) {
      const id = window.setTimeout(
        () => setRevealed(index + 1),
        START_MS + index * STAGGER_MS,
      );
      timeoutsRef.current.push(id);
    }
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [count]);
  return revealed;
}

export function DataSheetCard({
  resolvedFlagIds,
  resolvedValues,
  onOpenFlag,
  onOpenSource,
  onHoverSource,
}: {
  resolvedFlagIds: string[];
  resolvedValues: Record<string, string>;
  onOpenFlag: (flagId: string) => void;
  onOpenSource: (lineIds: string[]) => void;
  onHoverSource: (lineIds: string[]) => void;
}) {
  const revealed = useReveal(dataSheetRows.length);
  const [pinnedLineIds, setPinnedLineIds] = useState<string[]>([]);

  const togglePin = (lineIds: string[]) => {
    if (lineIds.length === 0) return;
    setPinnedLineIds((prev) => {
      const all = lineIds.every((id) => prev.includes(id));
      const next = all
        ? prev.filter((id) => !lineIds.includes(id))
        : [...new Set([...prev, ...lineIds])];
      return next;
    });
    onOpenSource(lineIds);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted">
          Draft Data Sheet · DL-2400
        </span>
        <StateLegend />
      </div>

      <div className="h-[22rem]">
        <DataSheetTable
          rows={dataSheetRows}
          revealedCount={revealed}
          resolvedFlagIds={resolvedFlagIds}
          resolvedValues={resolvedValues}
          pinnedLineIds={pinnedLineIds}
          onHoverLines={onHoverSource}
          onPinLines={togglePin}
          onOpenFlag={onOpenFlag}
        />
      </div>

      <TemplateFields
        fields={templateFields}
        rows={dataSheetRows}
        resolvedFlagIds={resolvedFlagIds}
        unmapped={unmappedAttributes}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review (exceptions + manual changes)                                */
/* ------------------------------------------------------------------ */

type ReviewItem = {
  id: string;
  title: string;
  value: string;
  note: string;
  resolved: boolean;
  flagId?: string;
  chip: ReactNode;
  iconWrap: string;
  icon: ReactNode;
};

function ReviewCard({
  title,
  items,
  onReview,
}: {
  title: string;
  items: ReviewItem[];
  onReview: (flagId: string) => void;
}) {
  const openCount = items.filter((item) => !item.resolved).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
        <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
          {title}
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
          {openCount > 0 ? `${openCount} open` : "All resolved"}
        </span>
      </div>

      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3.5"
          >
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconWrap}`}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.88rem] font-medium text-ink">
                  {item.title}
                </p>
                {item.resolved ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-online/40 bg-online/10 px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-online">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                ) : (
                  item.chip
                )}
              </div>
              <p className="mt-0.5 text-[0.78rem] text-ink-soft">{item.note}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.78rem] text-ink-soft">
                {item.value}
              </span>
              {!item.resolved && item.flagId ? (
                <button
                  type="button"
                  onClick={() => onReview(item.flagId as string)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Review
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fieldItem(
  row: DataSheetRow,
  resolvedFlagIds: string[],
  resolvedValues: Record<string, string>,
): ReviewItem {
  const meta = STATE_META[row.state as FieldState];
  const Icon = meta.icon;
  const resolved = Boolean(row.flagId && resolvedFlagIds.includes(row.flagId));
  return {
    id: row.id,
    title: row.field,
    value:
      resolved && row.flagId && resolvedValues[row.flagId]
        ? resolvedValues[row.flagId]
        : row.value,
    note: `${row.source ? `${row.source.section} · ` : ""}${
      row.note ?? meta.label
    }`,
    resolved,
    flagId: row.flagId,
    chip: <StateChip state={row.state as FieldState} />,
    iconWrap: meta.chip,
    icon: <Icon className="h-4 w-4" />,
  };
}

export function ExceptionsCard({
  resolvedFlagIds,
  resolvedValues,
  onReview,
}: {
  resolvedFlagIds: string[];
  resolvedValues: Record<string, string>;
  onReview: (flagId: string) => void;
}) {
  const items = dataSheetRows
    .filter((row) => row.flagId)
    .map((row) => fieldItem(row, resolvedFlagIds, resolvedValues));
  return (
    <ReviewCard
      title="Data sheet exceptions"
      items={items}
      onReview={onReview}
    />
  );
}

function manualItem(
  row: ManualDraftRow,
  resolvedFlagIds: string[],
  resolvedValues: Record<string, string>,
): ReviewItem {
  const meta = MANUAL_STATE_META[row.state as ManualState];
  const Icon = meta.icon;
  const resolved = Boolean(row.flagId && resolvedFlagIds.includes(row.flagId));
  return {
    id: row.id,
    title: row.field,
    value:
      resolved && row.flagId && resolvedValues[row.flagId]
        ? resolvedValues[row.flagId]
        : row.value,
    note: `${row.source ? `${row.source.section} · ` : ""}${
      row.note ?? meta.label
    }`,
    resolved,
    flagId: row.flagId,
    chip: <ManualStateChip state={row.state as ManualState} />,
    iconWrap: meta.chip,
    icon: <Icon className="h-4 w-4" />,
  };
}

export function ManualChangesCard({
  resolvedFlagIds,
  resolvedValues,
  onReview,
}: {
  resolvedFlagIds: string[];
  resolvedValues: Record<string, string>;
  onReview: (flagId: string) => void;
}) {
  const items = manualDraftRows
    .filter((row) => row.flagId)
    .map((row) => manualItem(row, resolvedFlagIds, resolvedValues));
  return (
    <ReviewCard
      title="Manual changes"
      items={items}
      onReview={onReview}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Manual diff                                                         */
/* ------------------------------------------------------------------ */

export function DiffCard({
  resolvedFlagIds,
  resolvedValues,
  onOpenFlag,
  onOpenSource,
  onHoverSource,
}: {
  resolvedFlagIds: string[];
  resolvedValues: Record<string, string>;
  onOpenFlag: (flagId: string) => void;
  onOpenSource: (lineIds: string[]) => void;
  onHoverSource: (lineIds: string[]) => void;
}) {
  const revealed = useReveal(manualDraftRows.length);
  const [pinnedLineIds, setPinnedLineIds] = useState<string[]>([]);

  const togglePin = (lineIds: string[]) => {
    if (lineIds.length === 0) return;
    setPinnedLineIds((prev) =>
      lineIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !lineIds.includes(id))
        : [...new Set([...prev, ...lineIds])],
    );
    onOpenSource(lineIds);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted">
          Installation Manual · rev A → rev C
        </span>
        <ManualStateLegend />
      </div>
      <div className="h-[22rem]">
        <ManualDraftTable
          rows={manualDraftRows}
          revealedCount={revealed}
          resolvedFlagIds={resolvedFlagIds}
          resolvedValues={resolvedValues}
          pinnedLineIds={pinnedLineIds}
          onHoverLines={onHoverSource}
          onPinLines={togglePin}
          onOpenFlag={onOpenFlag}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Change summary (approval + publish)                                 */
/* ------------------------------------------------------------------ */

const KIND_STYLE: Record<ChangeKind, { label: string; chip: string }> = {
  set: { label: "Set", chip: "border-online/40 bg-online/10 text-online" },
  changed: { label: "Changed", chip: "border-amber/40 bg-amber-soft text-amber" },
  confirmed: {
    label: "Confirmed",
    chip: "border-line-strong bg-elevated text-ink-soft",
  },
  kept: { label: "Kept", chip: "border-line bg-elevated text-muted" },
};

export function ChangeSummaryCard({
  title,
  subtitle,
  changes,
  source,
  actions,
}: {
  title: string;
  subtitle: string;
  changes: { field: string; from: string; to: string; kind: ChangeKind }[];
  source: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex items-start gap-3.5">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-online/15 text-online">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium text-ink">{title}</p>
          <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
            {subtitle}
          </p>
        </div>
      </div>

      <p className="mt-5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
        Changes in this revision
      </p>
      <ul className="mt-2.5 divide-y divide-line rounded-xl border border-line">
        {changes.map((change) => {
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
      <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
        Source: {source}
      </p>

      {actions ? <div className="mt-5">{actions}</div> : null}
    </div>
  );
}

export function ApprovalCard() {
  return (
    <ChangeSummaryCard
      title="DL-2400 Data Sheet"
      subtitle="Ready to approve"
      changes={approvedChanges}
      source={SPEC_FILE_NAME}
      actions={
        <button
          type="button"
          onClick={handleDownloadPlaceholder}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-canvas px-4 py-2.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </button>
      }
    />
  );
}

function handleDownloadPlaceholder() {
  /* mock download — no file is produced in this prototype. */
}

export function PublishSummaryCard() {
  return (
    <ChangeSummaryCard
      title="DL-2400 Installation Manual — Revision C"
      subtitle="Republished"
      changes={manualChangeSummary}
      source="DL-2400_revC.pdf · §3.2"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Propagation                                                         */
/* ------------------------------------------------------------------ */

const DOC_STATUS_STYLE: Record<
  DocumentStatus,
  { label: string; chip: string }
> = {
  "needs-update": {
    label: "Needs update",
    chip: "border-amber/40 bg-amber-soft text-amber",
  },
  review: {
    label: "Review",
    chip: "border-line-strong bg-elevated text-muted",
  },
};

function PropagationGraph() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-elevated/50 px-3.5 py-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink">
        <GitBranch className="h-3 w-3" />
        Data sheet rev D
      </span>
      <ArrowRight className="h-3.5 w-3.5 text-muted" />
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-danger">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
        Manual
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-danger">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
        Web page
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-danger">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
        Sell sheet
      </span>
      <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
        3 documents stale
      </span>
    </div>
  );
}

export function PropagationCard() {
  const needsUpdate = affectedDocuments.filter(
    (row) => row.status === "needs-update",
  ).length;

  return (
    <div className="space-y-3">
      <PropagationGraph />

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
          <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Documents affected by the change
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-amber">
            {needsUpdate} need updating
          </span>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {affectedDocuments.map((row) => {
              const status = DOC_STATUS_STYLE[row.status];
              return (
                <tr
                  key={row.document}
                  className="border-b border-line/70 last:border-0"
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wrapped screens                                                     */
/* ------------------------------------------------------------------ */

export function DocHealthCard({
  publishedDocIds,
}: {
  publishedDocIds: string[];
}) {
  return (
    <div className="h-[30rem]">
      <ScreenHealth publishedDocIds={publishedDocIds} />
    </div>
  );
}

export function RegulationCard({
  onViewProduct,
}: {
  onViewProduct?: (product: string) => void;
}) {
  return (
    <div className="h-[30rem]">
      <ScreenRegulation onViewProduct={onViewProduct} />
    </div>
  );
}

export function LegacyCard() {
  return (
    <div className="h-[26rem]">
      <ScreenLegacyParts />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fetched source                                                      */
/* ------------------------------------------------------------------ */

const SOURCE_META: Record<
  string,
  { title: string; meta: string; detail: string; pdfId?: string; page?: number }
> = {
  published: {
    title: "DL-2400_datasheet_2019.pdf",
    meta: "Published data sheet · rev B",
    detail: "2 pages · reference for cross-checks",
    pdfId: "dl-2400-datasheet",
    page: 1,
  },
  bom: {
    title: "DL-2400 · ERP bill of materials",
    meta: "SAP S/4HANA · live",
    detail: "14 components · used for regulation matching",
  },
};

export function SourceCard({
  sourceId,
  onOpen,
}: {
  sourceId: string;
  onOpen?: (docId: string, page: number) => void;
}) {
  const meta = SOURCE_META[sourceId];
  if (!meta) return null;
  const openable = Boolean(meta.pdfId && onOpen);
  return (
    <button
      type="button"
      disabled={!openable}
      onClick={() =>
        meta.pdfId && onOpen ? onOpen(meta.pdfId, meta.page ?? 1) : undefined
      }
      className="flex w-full items-center gap-3.5 rounded-2xl border border-line-strong bg-surface p-4 text-left transition-colors enabled:hover:border-accent/40 enabled:hover:bg-elevated/40 disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span className="relative inline-flex h-12 w-10 shrink-0 items-center justify-center rounded-md border border-line-strong bg-canvas">
        <FileText className="h-4.5 w-4.5 text-amber" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.86rem] font-medium text-ink">
          {meta.title}
        </p>
        <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-muted">
          {meta.meta}
        </p>
        <p className="mt-0.5 text-[0.74rem] text-ink-soft">{meta.detail}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-online">
        <CheckCircle2 className="h-4 w-4" />
        Fetched
      </span>
      {openable ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] text-ink-soft">
          <FileText className="h-3 w-3" />
          Open
        </span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Resolution proposal                                                 */
/* ------------------------------------------------------------------ */

export function ProposalCard({
  proposalId,
  resolvedFlagIds,
}: {
  proposalId: string;
  resolvedFlagIds: string[];
}) {
  const resolution = RESOLUTIONS[proposalId];
  if (!resolution) return null;
  const applied = resolvedFlagIds.includes(proposalId);

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/50 bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-gold/10 px-4 py-2.5">
        <span className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.14em] text-amber">
          Proposed resolution · {resolution.field}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] ${
            applied ? "text-online" : "text-amber"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {applied ? "Applied" : "Awaiting confirmation"}
        </span>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
            {resolution.field}
          </span>
          <span className="font-mono text-[1rem] font-semibold text-ink">
            {resolution.proposal.value}
          </span>
        </div>
        <p className="text-[0.84rem] leading-relaxed text-ink-soft">
          {resolution.proposal.rationale}
        </p>
        <p className="border-t border-line pt-2.5 font-mono text-[0.66rem] text-muted">
          Source: {resolution.proposal.source}
        </p>
      </div>
    </div>
  );
}
