"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  UserRound,
} from "lucide-react";
import { REFRIGERANT_YEAR, REVIEW_DATE_LABEL } from "../lib/dates";
import { COMPLIANCE_OPTIONS } from "../lib/queue-turns";
import { complianceProducts } from "../lib/queue-data";
import { riskRecord } from "../lib/risk-catalog";
import type {
  ComplianceAction,
  ComplianceOption,
  ComplianceOutcome,
} from "../lib/types";

function Fact({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof UserRound;
}) {
  return (
    <div className="rounded-xl border border-line bg-elevated/40 px-3.5 py-3">
      <p className="flex items-center gap-1.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.12em] text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className="mt-1 text-[0.86rem] font-medium text-ink">{value}</p>
    </div>
  );
}

export function ComplianceExposureCard({ productId }: { productId: string }) {
  const record = riskRecord(productId);
  if (!record) return null;

  const company = record.company ?? "ACS Group";
  const owner = record.owner ?? "Unassigned";

  return (
    <div className="overflow-hidden rounded-2xl border border-danger/40 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-danger/25 bg-danger-soft/60 px-4 py-3">
        <div>
          <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-danger">
            Compliance exposure
          </p>
          <p className="mt-0.5 text-[0.92rem] font-medium text-ink">
            {record.product} · {company}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-canvas px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] text-danger">
          <AlertTriangle className="h-3 w-3" />
          Mitigation required
        </span>
      </div>

      <div className="space-y-3.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-danger">
            {record.substance ?? "Restricted substance"}
          </span>
          <span className="text-[0.78rem] text-ink-soft">
            {record.regulation}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Fact
            label="Units shipped"
            value={record.unitsShipped}
            icon={FileText}
          />
          <Fact
            label="Open orders"
            value={record.openOrders}
            icon={FileText}
          />
          <Fact
            label="Deadline"
            value={record.deadline ?? "—"}
            icon={CalendarDays}
          />
          <Fact label="Review reminder" value={REVIEW_DATE_LABEL} icon={Clock} />
          <Fact label="Owner" value={owner} icon={UserRound} />
          <Fact label="Company" value={company} icon={Building2} />
        </div>

        <p className="rounded-xl border border-amber/40 bg-amber-soft px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-amber">
          This product needs a mitigation plan before the deadline, not just a
          note on the record.
        </p>
      </div>
    </div>
  );
}

export function ComplianceOptionsCard({
  productId,
  options,
  onSelect,
}: {
  productId: string;
  options: ComplianceOption[];
  onSelect: (action: ComplianceAction) => void;
}) {
  const [chosen, setChosen] = useState<ComplianceAction | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="border-b border-line bg-elevated/50 px-4 py-3">
        <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
          Choose a mitigation · {productId}
        </p>
        <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
          One option only. The alert stays open until the work is tracked or the
          risk is acknowledged. Reset the demo to choose again.
        </p>
      </div>

      <div className="space-y-2 p-3">
        {options.map((option) => {
          const active = chosen === option.id;
          const disabled = chosen !== null && !active;
          return (
            <button
              key={option.id}
              type="button"
              disabled={chosen !== null}
              onClick={() => {
                setChosen(option.id);
                onSelect(option.id);
              }}
              className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default ${
                active
                  ? "border-accent/50 bg-accent-soft"
                  : disabled
                    ? "border-line bg-surface opacity-55"
                    : option.primary
                      ? "border-gold/50 bg-gold/10 hover:border-gold"
                      : "border-line bg-surface hover:border-line-strong hover:bg-elevated/50"
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active
                    ? "border-accent bg-accent text-canvas"
                    : "border-line-strong bg-canvas text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.86rem] font-medium text-ink">
                    {option.label}
                  </span>
                  <span
                    className={`font-mono text-[0.52rem] uppercase tracking-[0.08em] ${
                      option.result === "Tracking" ? "text-amber" : "text-muted"
                    }`}
                  >
                    {option.result}
                  </span>
                </span>
                <span className="mt-1 block text-[0.78rem] leading-relaxed text-muted">
                  {option.description}
                </span>
              </span>

              <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ComplianceOutcomeCard({
  outcome,
}: {
  outcome: ComplianceOutcome;
}) {
  const tracking = outcome.status === "tracking";
  const StatusIcon = tracking ? Clock : CheckCircle2;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
              tracking
                ? "bg-amber-soft text-amber"
                : "bg-online/15 text-online"
            }`}
          >
            <StatusIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[0.9rem] font-medium text-ink">
              {outcome.title}
            </p>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
              {outcome.product} · {outcome.referenceId}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${
            tracking
              ? "border-amber/40 bg-amber-soft text-amber"
              : "border-online/40 bg-online/10 text-online"
          }`}
        >
          <StatusIcon className="h-3 w-3" />
          {tracking ? "Tracking" : "Acknowledged"}
        </span>
      </div>

      <div className="space-y-3.5 px-4 py-4">
        <p className="text-[0.84rem] leading-relaxed text-ink-soft">
          {outcome.summary}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {outcome.details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-xl border border-line bg-elevated/40 px-3.5 py-2.5"
            >
              <p className="font-mono text-[0.54rem] font-medium uppercase tracking-[0.12em] text-muted">
                {detail.label}
              </p>
              <p className="mt-1 text-[0.8rem] font-medium text-ink">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function statusMeta(outcome?: ComplianceOutcome) {
  if (!outcome) {
    return {
      label: "Open",
      className: "border-line-strong bg-canvas text-muted",
    };
  }
  if (outcome.status === "tracking") {
    return {
      label: "Tracking",
      className: "border-amber/40 bg-amber-soft text-amber",
    };
  }
  return {
    label: "Acknowledged",
    className: "border-line-strong bg-elevated text-ink-soft",
  };
}

function optionDescription(option: ComplianceOption, product: string): string {
  const record = riskRecord(product);
  const owner = record?.owner ?? "the owner";
  const company = record?.company ?? "the group";

  if (option.id === "change-request") {
    return `Assign ${owner} · reminder ${REVIEW_DATE_LABEL} in ${company} compliance queue`;
  }
  if (option.id === "request-declaration") {
    return `Ask ${owner} for an updated declaration · due ${REVIEW_DATE_LABEL}`;
  }
  return "Record the risk · no mitigation work opened";
}

export function ComplianceCaseCard({
  activeProductId,
  outcomes,
  onSelectProduct,
  onAction,
}: {
  activeProductId: string | null;
  outcomes: Record<string, ComplianceOutcome>;
  onSelectProduct: (product: string) => void;
  onAction: (product: string, action: ComplianceAction) => void;
}) {
  const products = complianceProducts;
  const topProduct = [...products].sort(
    (a, b) => b.unitsShippedValue - a.unitsShippedValue,
  )[0]?.product;
  const active =
    products.find((product) => product.product === activeProductId) ??
    products[0];
  if (!active) return null;

  const outcome = outcomes[active.product];
  const decided = products.filter((product) => outcomes[product.product]).length;
  const allDecided = decided === products.length;
  const remaining = products.find(
    (product) =>
      product.product !== active.product && !outcomes[product.product],
  );
  const company = active.company ?? "ACS Group";
  const owner = active.owner ?? "the product owner";
  const caseStatus = allDecided
    ? products.every(
        (product) => outcomes[product.product]?.status === "acknowledged",
      )
      ? "Acknowledged"
      : "Tracking"
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/50 px-4 py-3">
        <div>
          <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Compliance case
          </p>
          <p className="mt-0.5 text-[0.92rem] font-medium text-ink">
            {REFRIGERANT_YEAR} Refrigerant Ban
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${
            allDecided
              ? "border-online/40 bg-online/10 text-online"
              : "border-line-strong bg-canvas text-ink-soft"
          }`}
        >
          {allDecided
            ? `Case complete · ${caseStatus}`
            : `${decided} of ${products.length} decided`}
        </span>
      </div>

      <div className="grid gap-2 border-b border-line bg-elevated/30 px-3 py-3 sm:grid-cols-2">
        {products.map((product) => {
          const productOutcome = outcomes[product.product];
          const status = statusMeta(productOutcome);
          const isActive = product.product === active.product;
          return (
            <button
              key={product.product}
              type="button"
              onClick={() => onSelectProduct(product.product)}
              aria-pressed={isActive}
              className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                isActive
                  ? "border-accent/50 bg-surface"
                  : "border-line bg-surface/60 hover:border-line-strong hover:bg-surface"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="font-mono text-[0.8rem] font-semibold tracking-[0.02em] text-ink">
                    {product.product}
                  </span>
                  {product.product === topProduct ? (
                    <span className="inline-flex items-center rounded-full border border-danger/40 bg-danger-soft px-1.5 py-0.5 font-mono text-[0.46rem] font-medium uppercase tracking-[0.06em] text-danger">
                      Highest
                    </span>
                  ) : null}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-mono text-[0.5rem] font-medium uppercase tracking-[0.08em] ${status.className}`}
                >
                  {status.label}
                </span>
              </span>
              <span className="mt-1 block text-[0.72rem] text-muted">
                {product.company} · {product.unitsShipped} shipped ·{" "}
                {product.openOrders} open
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-danger/40 bg-danger-soft px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-danger">
            {active.substance ?? "Restricted substance"}
          </span>
          <span className="text-[0.78rem] text-ink-soft">
            {active.regulation}
          </span>
          <span className="ml-auto font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
            Owner · {owner}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Fact
            label="Units shipped"
            value={active.unitsShipped}
            icon={FileText}
          />
          <Fact
            label="Open orders"
            value={active.openOrders}
            icon={FileText}
          />
          <Fact
            label="Deadline"
            value={active.deadline ?? "—"}
            icon={CalendarDays}
          />
          <Fact
            label="Review reminder"
            value={REVIEW_DATE_LABEL}
            icon={Clock}
          />
        </div>

        <p className="text-[0.8rem] leading-relaxed text-muted">
          {active.reason}. {active.unitsShipped} units shipped and{" "}
          {active.openOrders} open orders need a mitigation plan before the
          deadline.
        </p>

        {outcome ? (
          <div className="rounded-xl border border-line bg-elevated/40 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[0.84rem] font-medium text-ink">
                  {outcome.title}
                </p>
                <p className="font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
                  {outcome.referenceId}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.52rem] font-medium uppercase tracking-[0.08em] ${statusMeta(outcome).className}`}
              >
                {statusMeta(outcome).label}
              </span>
            </div>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-soft">
              {outcome.summary}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {outcome.details.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-lg border border-line bg-surface px-2.5 py-2"
                >
                  <p className="font-mono text-[0.5rem] font-medium uppercase tracking-[0.1em] text-muted">
                    {detail.label}
                  </p>
                  <p className="mt-0.5 text-[0.76rem] font-medium text-ink">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
            {remaining ? (
              <button
                type="button"
                onClick={() => onSelectProduct(remaining.product)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Review {remaining.product}
                <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <p className="mt-2 font-mono text-[0.54rem] uppercase tracking-[0.08em] text-online">
                Both products have a decision · {caseStatus}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gold/50 bg-gold/10 px-3.5 py-2.5">
              <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.12em] text-amber">
                Recommended
              </p>
              <p className="mt-0.5 text-[0.82rem] leading-relaxed text-ink-soft">
                Open a change request for {owner}. It assigns the work and sends
                the {REVIEW_DATE_LABEL} review reminder to the {company}{" "}
                compliance queue.
              </p>
            </div>

            <div className="space-y-2">
              {COMPLIANCE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onAction(active.product, option.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                    option.primary
                      ? "border-gold/50 bg-gold/10 hover:border-gold"
                      : "border-line bg-surface hover:border-line-strong hover:bg-elevated/50"
                  }`}
                >
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.82rem] font-medium text-ink">
                        {option.label}
                      </span>
                      {option.primary ? (
                        <span className="inline-flex items-center rounded-full border border-gold/50 bg-canvas px-1.5 py-0.5 font-mono text-[0.46rem] font-medium uppercase tracking-[0.06em] text-amber">
                          Recommended
                        </span>
                      ) : null}
                      <span
                        className={`font-mono text-[0.48rem] uppercase tracking-[0.06em] ${
                          option.result === "Tracking"
                            ? "text-amber"
                            : "text-muted"
                        }`}
                      >
                        {option.result}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.74rem] leading-relaxed text-muted">
                      {optionDescription(option, active.product)}
                    </span>
                  </span>
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted" />
                </button>
              ))}
            </div>

            <p className="font-mono text-[0.52rem] uppercase tracking-[0.08em] text-muted">
              One option per product · reset the demo to choose again
            </p>
          </>
        )}
      </div>
    </div>
  );
}
