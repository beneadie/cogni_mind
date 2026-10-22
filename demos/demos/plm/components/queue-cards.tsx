"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  GitBranch,
} from "lucide-react";
import { DocDiff } from "./doc-diff";
import { ManualPageEditor } from "./manual-page-editor";
import {
  fieldReportChange,
  impactRows,
  MAA200_WIRING_PAGE,
} from "../lib/queue-data";
import { buildPageDiff } from "../lib/page-diff";
import type { ImpactRow } from "../lib/types";

export function ChangeProposalCard({
  onApprove,
  onReject,
  onOpenDoc,
}: {
  onApprove: (proposal: string) => void;
  onReject: () => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  const change = fieldReportChange;
  const page = MAA200_WIRING_PAGE;
  const [status, setStatus] = useState<"idle" | "sent" | "rejected">("idle");
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [savedLines, setSavedLines] = useState<string[]>([
    ...page.proposedLines,
  ]);
  const [draft, setDraft] = useState(page.proposedLines.join("\n"));
  const [diff, setDiff] = useState(() =>
    buildPageDiff({
      path: page.path,
      heading: page.heading,
      context: page.context,
      oldLines: page.currentLines,
      newLines: page.proposedLines,
    }),
  );

  const startEditing = () => {
    if (status !== "idle") return;
    setDraft(savedLines.join("\n"));
    setEditing(true);
  };

  const saveEdit = () => {
    if (!draft.trim()) return;
    const nextLines = draft
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd());
    while (nextLines.length > 0 && !nextLines[nextLines.length - 1].trim()) {
      nextLines.pop();
    }
    if (nextLines.length === 0) return;
    setSavedLines(nextLines);
    setDiff(
      buildPageDiff({
        path: page.path,
        heading: page.heading,
        context: page.context,
        oldLines: page.currentLines,
        newLines: nextLines,
      }),
    );
    setEdited(
      nextLines.length !== page.proposedLines.length ||
        nextLines.some((line, index) => line !== page.proposedLines[index]),
    );
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(savedLines.join("\n"));
    setEditing(false);
  };

  const sendSummary = edited
    ? `edited §7.2 page (${diff.stats.added} added, ${diff.stats.removed} removed)`
    : change.proposed;

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/50 bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-gold/10 px-4 py-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[0.64rem] font-medium uppercase tracking-[0.14em] text-amber">
            Proposed change · {change.ecrId}
          </p>
          <p className="mt-0.5 truncate text-[0.82rem] font-medium text-ink">
            {change.document} · {change.section}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted sm:inline-flex">
          Also affects {change.whereUsed} documents
        </span>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <ul className="divide-y divide-line rounded-xl border border-line">
          <li className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
            <span className="w-32 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
              Current manual
            </span>
            <span className="text-[0.82rem] text-ink-soft">{change.currentManual}</span>
          </li>
          <li className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
            <span className="w-32 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
              Current spec
            </span>
            <span className="text-[0.82rem] text-ink-soft">{change.currentSpec}</span>
          </li>
          <li className="flex flex-wrap items-center gap-2 px-3.5 py-2.5">
            <span className="w-32 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted">
              Reported by
            </span>
            <span className="text-[0.82rem] text-ink-soft">{change.reportedBy}</span>
          </li>
        </ul>

        {change.warning ? (
          <p className="inline-flex items-center gap-2 rounded-lg border border-amber/40 bg-amber-soft px-3 py-2 font-mono text-[0.68rem] text-amber">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {change.warning}
          </p>
        ) : null}

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
              Document changes
            </p>
            <span className="font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
              Page {page.page}
            </span>
          </div>
          <div className="mt-1.5">
            <DocDiff diff={diff} />
          </div>
          {editing ? null : (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onOpenDoc("maa-200-manual", 14)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <FileText className="h-3 w-3" />
                Open manual §7.2
              </button>
              <button
                type="button"
                onClick={() => onOpenDoc("maa-200-spec", 3)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <FileText className="h-3 w-3" />
                Open spec §7.2
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line bg-elevated/40 px-4 py-3.5">
        {status === "sent" ? (
          <span className="inline-flex items-center rounded-full border border-amber/40 bg-amber-soft px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-amber">
            Proposal sent
          </span>
        ) : status === "rejected" ? (
          <span className="inline-flex items-center rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-muted">
            Rejected
          </span>
        ) : editing ? (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
            Editing page {page.page}…
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStatus("sent");
                onApprove(sendSummary);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Send proposal
            </button>
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Edit page
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("rejected");
                onReject();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              Reject
            </button>
          </>
        )}
      </footer>

      <ManualPageEditor
        open={editing}
        page={page}
        change={change}
        draft={draft}
        onDraftChange={setDraft}
        onSave={saveEdit}
        onCancel={cancelEdit}
        onOpenSource={onOpenDoc}
      />
    </div>
  );
}

const UPDATE_CHIP = "border-amber/40 bg-amber-soft text-amber";
const SENT_CHIP = "border-online/40 bg-online/10 text-online";

function ImpactRowItem({
  row,
  sent,
  selected,
  disabled,
  onToggle,
  onOpenDoc,
}: {
  row: ImpactRow;
  sent: boolean;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className={`px-4 py-2 ${sent ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            checked={sent || selected}
            disabled={sent || disabled}
            onChange={onToggle}
            aria-label={`${sent ? "Sent" : selected ? "Deselect" : "Select"} ${row.document}`}
            className="h-3.5 w-3.5 shrink-0 accent-accent disabled:opacity-60"
          />
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-medium text-ink">
              {row.document}
            </p>
            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
              {row.type} · {row.owner}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {row.diff ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
              />
              {open ? "Hide changes" : "Show changes"}
            </button>
          ) : null}
          {row.pdfId ? (
            <button
              type="button"
              onClick={() => onOpenDoc(row.pdfId as string, row.page ?? 1)}
              className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <FileText className="h-3 w-3" />
              Open file
            </button>
          ) : null}
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${
              sent ? SENT_CHIP : UPDATE_CHIP
            }`}
          >
            {sent ? "Sent" : "Proposal"}
          </span>
        </div>
      </div>
      {open && row.diff ? (
        <div className="mt-2">
          <DocDiff diff={row.diff} />
        </div>
      ) : null}
    </li>
  );
}

function ImpactGroup({
  title,
  hint,
  count,
  rows,
  selected,
  sentSet,
  disabled,
  onToggle,
  onOpenDoc,
}: {
  title: string;
  hint: string;
  count: string;
  rows: ImpactRow[];
  selected: Set<string>;
  sentSet: Set<string>;
  disabled: boolean;
  onToggle: (document: string) => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <p className="text-[0.82rem] font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-[0.74rem] leading-snug text-muted">{hint}</p>
        </div>
        <span className="shrink-0 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-muted">
          {count}
        </span>
      </div>
      <ul className="mt-2.5 pb-3">
        {rows.map((row) => (
          <ImpactRowItem
            key={row.document}
            row={row}
            sent={sentSet.has(row.document)}
            selected={selected.has(row.document)}
            disabled={disabled}
            onToggle={() => onToggle(row.document)}
            onOpenDoc={onOpenDoc}
          />
        ))}
      </ul>
    </div>
  );
}

export function ChangePropagationCard({
  onPropagate,
  onCancel,
  onOpenDoc,
  sentIds = [],
  rememberedOwners = [],
}: {
  onPropagate: (ids: string[]) => boolean;
  onCancel: () => void;
  onOpenDoc: (docId: string, page: number) => void;
  sentIds?: string[];
  rememberedOwners?: string[];
}) {
  const change = fieldReportChange;
  const found = impactRows.length;
  const from = change.redline.from.replace(`${change.section} — `, "");
  const to = change.redline.to.replace(`${change.section} — `, "");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(impactRows.map((row) => row.document)),
  );
  const [canceled, setCanceled] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const sentSet = new Set(sentIds);
  const remainingRows = impactRows.filter(
    (row) => !sentSet.has(row.document),
  );
  const selectedRows = remainingRows.filter((row) =>
    selected.has(row.document),
  );
  const sentCount = found - remainingRows.length;
  const allSent = remainingRows.length === 0;
  const sending =
    pendingIds.length > 0 &&
    !pendingIds.every((document) => sentSet.has(document));
  const locked = canceled || allSent;
  const selectedOwners = Array.from(
    new Set(selectedRows.map((row) => row.owner)),
  );
  const rememberedSelected = selectedOwners.filter((owner) =>
    rememberedOwners.includes(owner),
  );

  const toggle = (document: string) => {
    if (locked || sending || sentSet.has(document)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(document)) next.delete(document);
      else next.add(document);
      return next;
    });
  };

  const send = () => {
    if (selectedRows.length === 0 || sending) return;
    const ids = selectedRows.map((row) => row.document);
    const started = onPropagate(ids);
    if (started) setPendingIds(ids);
  };

  const cancel = () => {
    if (locked || sending) return;
    setCanceled(true);
    setSelected(new Set());
    onCancel();
  };

  const countLabel = canceled
    ? `${remainingRows.length} not sent`
    : allSent
      ? `${found} sent`
      : sentCount > 0
        ? `${sentCount} sent · ${remainingRows.length} remaining`
        : `${selectedRows.length} of ${found} selected`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-elevated/50 px-3.5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink">
            <GitBranch className="h-3 w-3" />
            {change.section}
          </span>
          <span className="font-mono text-[0.68rem] text-muted line-through">
            {from}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted" />
          <span className="font-mono text-[0.68rem] font-medium text-online">
            {to}
          </span>
        </div>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">
          {canceled
            ? "Nothing further was sent. The Document updates alert stays open for the remaining documents."
            : allSent
              ? `Proposals went to all ${found} document owners. They apply the change in their own system.`
              : sentCount > 0
                ? `${sentCount} proposal${sentCount === 1 ? "" : "s"} sent. ${remainingRows.length} document${remainingRows.length === 1 ? "" : "s"} still need a proposal.`
                : `These teams own the affected documents. All ${found} are selected by default; deselect any you don't want to notify.`}
        </p>
        {!allSent && !canceled && rememberedSelected.length > 0 ? (
          <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-online">
            Permission remembered for {rememberedSelected.join(", ")}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
          <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
            {allSent
              ? "Proposals sent to the owners"
              : "Documents affected by this change"}
          </span>
          <span
            className={`font-mono text-[0.62rem] uppercase tracking-[0.1em] ${
              allSent ? "text-online" : canceled ? "text-muted" : "text-amber"
            }`}
          >
            {countLabel}
          </span>
        </div>

        <ImpactGroup
          title={allSent ? "Sent to the document owners" : "Suggested recipients"}
          hint={
            allSent
              ? "Each owner has the proposed §7.2 change for their own system."
              : canceled
                ? "The alert stays open; no further proposals will be sent from this card."
                : "These are the teams that need to approve the change. Deselect any you don't want to notify."
          }
          count={countLabel}
          rows={impactRows}
          selected={selected}
          sentSet={sentSet}
          disabled={locked || sending}
          onToggle={toggle}
          onOpenDoc={onOpenDoc}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-elevated/40 px-4 py-3">
          <p className="text-[0.76rem] text-ink-soft">
            {canceled
              ? `${remainingRows.length} document${remainingRows.length === 1 ? "" : "s"} still need a proposal`
              : allSent
                ? `${found} proposals sent to their owners`
                : `${selectedRows.length} of ${remainingRows.length} remaining selected`}
          </p>
          {locked ? null : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={cancel}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={send}
                disabled={selectedRows.length === 0 || sending}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {sending
                  ? "Sending…"
                  : `Send ${selectedRows.length} proposal${selectedRows.length === 1 ? "" : "s"}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QueueSummaryCard({
  rows,
  onNew,
}: {
  rows: string[];
  onNew: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex items-center gap-3.5">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-online/15 text-online">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <p className="text-[0.95rem] font-medium text-ink">Audit complete</p>
          <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
            Alerts handled
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li key={row} className="flex items-center gap-2 text-[0.86rem] text-ink-soft">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-online" />
            {row}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onNew}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-4 py-2.5 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Start a new conversation
      </button>
    </div>
  );
}
