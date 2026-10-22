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
import { ScreenRegulation } from "./screen-regulation";
import { DocDiff } from "./doc-diff";
import {
  complianceProducts,
  fieldReportChange,
  impactRows,
} from "../lib/queue-data";
import type { ImpactRow } from "../lib/types";

export function ChangeProposalCard({
  onApprove,
  onReject,
  onOpenDoc,
}: {
  onApprove: () => void;
  onReject: () => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  const change = fieldReportChange;
  const [status, setStatus] = useState<"idle" | "sent" | "rejected">("idle");
  const [editing, setEditing] = useState(false);
  const [proposal, setProposal] = useState(change.proposed);
  const [draft, setDraft] = useState(change.proposed);

  const startEditing = () => {
    if (status !== "idle") return;
    setDraft(proposal);
    setEditing(true);
  };

  const saveEdit = () => {
    const next = draft.trim();
    if (!next) return;
    setProposal(next);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(proposal);
    setEditing(false);
  };

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
          <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Document changes
          </p>
          {change.diff ? (
            <div className="mt-1.5">
              <DocDiff diff={change.diff} />
            </div>
          ) : (
            <div className="mt-1.5 space-y-1.5 font-mono text-[0.76rem]">
              <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-muted line-through">
                {change.redline.from}
              </p>
              <p className="rounded-lg border border-online/40 bg-online/10 px-3 py-2 text-ink">
                {change.redline.to}
              </p>
            </div>
          )}
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
        </div>

        <div>
          <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Proposed change
          </p>
          {editing ? (
            <div className="mt-1.5 space-y-2">
              <textarea
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-xl border border-line-strong bg-canvas px-3 py-2.5 text-[0.86rem] leading-relaxed text-ink focus:border-accent/40 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 flex items-start gap-2 text-[0.86rem] leading-relaxed text-ink">
              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-amber" />
              {proposal}
            </p>
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
            Editing proposal…
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                setStatus("sent");
                onApprove();
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
              Edit
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
    </div>
  );
}

const UPDATE_CHIP = "border-amber/40 bg-amber-soft text-amber";
const SENT_CHIP = "border-online/40 bg-online/10 text-online";

function ImpactRowItem({
  row,
  chip,
  label,
  onOpenDoc,
}: {
  row: ImpactRow;
  chip: string;
  label: string;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[0.82rem] font-medium text-ink">
            {row.document}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
            {row.type} · {row.owner}
          </p>
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
            className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${chip}`}
          >
            {label}
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
  chip,
  label,
  rows,
  onOpenDoc,
}: {
  title: string;
  hint: string;
  chip: string;
  label: string;
  rows: ImpactRow[];
  onOpenDoc: (docId: string, page: number) => void;
}) {
  return (
    <div className="border-t border-line first:border-t-0">
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <p className="text-[0.82rem] font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-[0.74rem] leading-snug text-muted">{hint}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] ${chip}`}
        >
          {rows.length}
        </span>
      </div>
      <ul className="mt-2.5 pb-3">
        {rows.map((row) => (
          <ImpactRowItem
            key={row.document}
            row={row}
            chip={chip}
            label={label}
            onOpenDoc={onOpenDoc}
          />
        ))}
      </ul>
    </div>
  );
}

export function ChangePropagationCard({
  onPropagate,
  onOpenDoc,
  sent = false,
}: {
  onPropagate: () => void;
  onOpenDoc: (docId: string, page: number) => void;
  sent?: boolean;
}) {
  const change = fieldReportChange;
  const found = impactRows.length;
  const from = change.redline.from.replace(`${change.section} — `, "");
  const to = change.redline.to.replace(`${change.section} — `, "");
  const [hasSent, setHasSent] = useState(sent);
  const isSent = sent || hasSent;

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
          {isSent
            ? `The same §7.2 proposal went to each owner of the ${found} related documents. They apply it in their own system.`
            : `The §7.2 proposal affects ${found} other documents. I'll send each owner the proposal so they can apply it.`}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
          <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
            {isSent ? "Proposals sent to the owners" : "Documents affected by this change"}
          </span>
          <span
            className={`font-mono text-[0.62rem] uppercase tracking-[0.1em] ${
              isSent ? "text-online" : "text-amber"
            }`}
          >
            {isSent ? `${found} sent` : `${found} to update`}
          </span>
        </div>

        <ImpactGroup
          title={isSent ? "Sent to the document owners" : "Send these proposals to the owners"}
          hint={
            isSent
              ? "Each owner has the proposed §7.2 change for their own system."
              : "Each owner will get the proposed §7.2 change to apply in their own system."
          }
          chip={isSent ? SENT_CHIP : UPDATE_CHIP}
          label={isSent ? "Sent" : "Proposal"}
          rows={impactRows}
          onOpenDoc={onOpenDoc}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-elevated/40 px-4 py-3">
          <p className="text-[0.76rem] text-ink-soft">
            {isSent
              ? `${found} proposals sent to their owners`
              : `${found} documents need the same proposal`}
          </p>
          {isSent ? null : (
            <button
              type="button"
              onClick={() => {
                setHasSent(true);
                onPropagate();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Send {found} proposals
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function QueueRegulationCard({
  onViewProduct,
}: {
  onViewProduct: (product: string) => void;
}) {
  return (
    <div className="h-[26rem] rounded-2xl border border-line-strong bg-surface p-4">
      <ScreenRegulation
        rows={complianceProducts}
        title="Products at Risk — 2027 Refrigerant Ban"
        subtitle="Across the ACS group, ranked by units shipped."
        onViewProduct={onViewProduct}
      />
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
