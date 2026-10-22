"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Factory,
} from "lucide-react";
import {
  PRICING_CASE,
  PRICING_OPTIONS,
  pricingOutcomeFor,
} from "../lib/pricing-data";
import type { PricingDecision } from "../lib/types";

export function PricingCaseCard({
  decision,
  onDecide,
}: {
  decision: PricingDecision | null;
  onDecide: (decision: PricingDecision) => void;
}) {
  const outcome = decision ? pricingOutcomeFor(decision) : null;
  const tracking = outcome?.status === "tracking";

  return (
    <section className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <header className="flex items-start gap-3 border-b border-line bg-amber-soft/60 px-4 py-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber/30 bg-surface/70 text-amber">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-amber">
            Pricing Mismatch Escalation
          </p>
          <h3 className="mt-0.5 text-[0.92rem] font-medium text-ink">
            {PRICING_CASE.partNumber} · {PRICING_CASE.partName}
          </h3>
          <p className="mt-1 text-[0.74rem] leading-relaxed text-ink-soft">
            {PRICING_CASE.products.join(" + ")} · {PRICING_CASE.volume}
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full border border-line-strong bg-surface px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.08em] text-muted sm:inline-flex">
          {PRICING_CASE.source}
        </span>
      </header>

      <div className="space-y-3 px-4 py-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {PRICING_CASE.suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="rounded-xl border border-line bg-canvas/60 px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink">
                  <Factory className="h-3.5 w-3.5 text-muted" />
                  {supplier.name}
                </span>
                <span className="rounded-full border border-line-strong bg-surface px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-muted">
                  {supplier.usedIn}
                </span>
              </div>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-[1.35rem] font-medium leading-none text-ink">
                  {supplier.unitPrice}
                </span>
                <span className="pb-0.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted">
                  / unit
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-ink-soft">
                  {supplier.leadTime}
                </span>
                <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-ink-soft">
                  {supplier.cover}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-line bg-canvas/60 px-3.5 py-2.5">
          <span className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
            Price gap
          </span>
          <span className="text-[0.82rem] font-medium text-ink">
            {PRICING_CASE.priceGap}
          </span>
          <span className="text-[0.76rem] text-ink-soft">
            {PRICING_CASE.annualGap}
          </span>
          <span className="ml-auto text-[0.68rem] text-muted">
            Both vendor records are active; each BOM points to a different
            supplier.
          </span>
        </div>

        {outcome ? (
          <div
            className={`overflow-hidden rounded-xl border ${
              tracking ? "border-amber/40 bg-amber-soft/50" : "border-online/40 bg-online/5"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-line/60 px-3.5 py-2.5">
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.1em] ${
                  tracking ? "text-amber" : "text-online"
                }`}
              >
                {tracking ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {tracking ? "Tracking" : "Acknowledged"}
              </span>
              <span className="text-[0.82rem] font-medium text-ink">
                {outcome.title}
              </span>
              <span className="ml-auto font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
                {outcome.referenceId}
              </span>
            </div>
            <div className="space-y-3 px-3.5 py-3">
              <p className="text-[0.78rem] leading-relaxed text-ink-soft">
                {outcome.summary}
              </p>
              <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {outcome.details.map((detail) => (
                  <div key={detail.label} className="min-w-0">
                    <dt className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-muted">
                      {detail.label}
                    </dt>
                    <dd className="mt-0.5 text-[0.74rem] leading-snug text-ink">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.08em] text-muted">
                Decision logged in Workspace · no prices changed in the source
                system
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.14em] text-muted">
                Your call
              </p>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {PRICING_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onDecide(option.id)}
                  className="group flex h-full flex-col rounded-xl border border-line bg-canvas/60 px-3 py-3 text-left transition-colors hover:border-accent/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[0.76rem] font-medium leading-snug text-ink">
                      {option.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1.5 text-[0.68rem] leading-relaxed text-muted">
                    {option.description}
                  </span>
                  <span className="mt-auto pt-2 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-muted">
                    Result · {option.result}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
