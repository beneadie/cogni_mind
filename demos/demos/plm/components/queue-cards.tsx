"use client";

import {
  AlertTriangle,
  ArrowRight,
  BellPlus,
  CheckCircle2,
  FileCheck,
  FileText,
  GitBranch,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { ScreenRegulation } from "./screen-regulation";
import {
  BAN_EFFECTIVE,
  complianceProducts,
  fieldReportChange,
  impactRows,
} from "../lib/queue-data";
import type {
  ComplianceAction,
  ImpactDisposition,
} from "../lib/types";

export function ChangeProposalCard({
  onApprove,
  onEdit,
  onReject,
  onOpenDoc,
}: {
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  const change = fieldReportChange;
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
          Where-used · {change.whereUsed}
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
            Redline
          </p>
          <div className="mt-1.5 space-y-1.5 font-mono text-[0.76rem]">
            <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-muted line-through">
              {change.redline.from}
            </p>
            <p className="rounded-lg border border-online/40 bg-online/10 px-3 py-2 text-ink">
              {change.redline.to}
            </p>
          </div>
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
          <p className="mt-1 flex items-start gap-2 text-[0.86rem] leading-relaxed text-ink">
            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-amber" />
            {change.proposed}
          </p>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line bg-elevated/40 px-4 py-3.5">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Approve and apply
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onReject}
          className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
        >
          Reject
        </button>
      </footer>
    </div>
  );
}

const DISPOSITION_STYLE: Record<
  ImpactDisposition,
  { label: string; chip: string }
> = {
  auto: { label: "Auto-update", chip: "border-online/40 bg-online/10 text-online" },
  author: { label: "Author", chip: "border-amber/40 bg-amber-soft text-amber" },
  review: { label: "Review", chip: "border-line-strong bg-elevated text-ink-soft" },
  none: { label: "No impact", chip: "border-line bg-elevated text-muted" },
};

export function ChangePropagationCard({
  onPropagate,
  onOpenDoc,
}: {
  onPropagate: () => void;
  onOpenDoc: (docId: string, page: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-elevated/50 px-3.5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink">
          <GitBranch className="h-3 w-3" />
          §7.2 change
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted" />
        {impactRows.map((row) => (
          <span
            key={row.document}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] ${DISPOSITION_STYLE[row.disposition].chip}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {row.type}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
          <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
            Where-used · MAA-200 §7.2
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-amber">
            {impactRows.length} affected
          </span>
        </div>
        <table className="w-full border-collapse">
          <tbody>
            {impactRows.map((row) => {
              const style = DISPOSITION_STYLE[row.disposition];
              return (
                <tr
                  key={row.document}
                  className="border-b border-line/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="text-[0.84rem] font-medium text-ink">
                      {row.document}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                      {row.type} · {row.owner}
                    </p>
                    {row.pdfId ? (
                      <button
                        type="button"
                        onClick={() => onOpenDoc(row.pdfId as string, row.page ?? 1)}
                        className="mt-1.5 inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:text-ink"
                      >
                        <FileText className="h-3 w-3" />
                        Open file
                      </button>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-[0.78rem] text-ink-soft sm:table-cell">
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${style.chip}`}
                    >
                      {style.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-line bg-elevated/40 px-4 py-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            2 auto-update · 1 authoring task
          </p>
          <button
            type="button"
            onClick={onPropagate}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Propagate updates
          </button>
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
        subtitle="Across the ACS group, ranked by annual revenue."
        onViewProduct={onViewProduct}
      />
    </div>
  );
}

export function ComplianceActionCard({
  productId,
  onAction,
}: {
  productId: string;
  onAction: (action: ComplianceAction) => void;
}) {
  const product = complianceProducts.find((row) => row.product === productId);
  const owner = product?.owner ?? "the product owner";
  const company = product?.company ?? "";

  const actions: {
    id: ComplianceAction;
    label: string;
    hint: string;
    icon: typeof Send;
    primary?: boolean;
  }[] = [
    {
      id: "open-cr",
      label: "Open change request & assign owner",
      hint: `Start the refrigerant swap on ${productId}.`,
      icon: UserCheck,
      primary: true,
    },
    {
      id: "declaration",
      label: "Request substance declaration",
      hint: "Ask the supplier for a full material declaration.",
      icon: FileCheck,
    },
    {
      id: "reminder",
      label: "Set a review reminder",
      hint: "Bring this back before the ban.",
      icon: BellPlus,
    },
    {
      id: "acknowledge",
      label: "Acknowledge risk",
      hint: "Accept for now, with the rationale on file.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-danger/40 bg-surface">
      <div className="border-b border-line bg-danger-soft/60 px-4 py-3">
        <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-danger">
          Mitigation · {productId}
        </p>
        <p className="mt-1 text-[0.82rem] text-ink-soft">
          {company ? `${company} · ` : ""}Owner {owner} · banned {BAN_EFFECTIVE}
        </p>
      </div>

      <ul className="divide-y divide-line">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => onAction(action.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    action.primary
                      ? "bg-accent-soft text-ink"
                      : "bg-elevated text-ink-soft"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.84rem] font-medium text-ink">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block text-[0.74rem] text-muted">
                    {action.hint}
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
              </button>
            </li>
          );
        })}
      </ul>
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
          <p className="text-[0.95rem] font-medium text-ink">Today</p>
          <p className="mt-0.5 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
            Queue cleared
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
