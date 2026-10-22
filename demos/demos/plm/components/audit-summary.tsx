"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import {
  AUDIT_FILE,
  AUDIT_PAGE_COUNT,
  AUDIT_REVIEW_FIELDS,
  EXTRACTED_FIELDS,
  buildAuditPublishChanges,
  type AuditReviewKind,
  type AuditReviewValues,
} from "../lib/audit-data";
import { CURRENT_YEAR_LABEL } from "../lib/dates";
import { ChangeSummaryCard } from "./plm-cards";

const STATS = [
  { label: "pages read", value: AUDIT_PAGE_COUNT },
  { label: "fields drafted", value: EXTRACTED_FIELDS.length },
  { label: "need review", value: AUDIT_REVIEW_FIELDS.length },
];

const REVIEW_KIND_META: Record<
  AuditReviewKind,
  { label: string; chip: string }
> = {
  missing: {
    label: "Missing",
    chip: "border-amber/40 bg-amber-soft text-amber",
  },
  conflict: {
    label: "Conflict",
    chip: "border-danger/30 bg-danger-soft text-danger",
  },
  "low-confidence": {
    label: "Low confidence",
    chip: "border-gold/40 bg-gold/10 text-amber",
  },
  "carried-over": {
    label: "From last sheet",
    chip: "border-line-strong bg-elevated text-ink-soft",
  },
};

export function AuditSummaryCard({
  fileName,
  published,
  onReview,
}: {
  fileName: string;
  published: boolean;
  onReview: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-start gap-3 border-b border-line bg-elevated/60 px-4 py-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-online/30 bg-online/10 text-online">
          <FileSpreadsheet className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.14em] text-muted">
            Draft ready for review
          </p>
          <p className="mt-0.5 truncate text-[0.9rem] font-medium text-ink">
            {fileName}
          </p>
          <p className="mt-0.5 text-[0.72rem] text-muted">
            MAA-200 split system · draft rev D · {CURRENT_YEAR_LABEL}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${
            published
              ? "border-online/30 bg-online/10 text-online"
              : "border-amber/40 bg-amber-soft text-amber"
          }`}
        >
          {published ? (
            <>
              <Check className="h-3 w-3" />
              Rev D published
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {AUDIT_REVIEW_FIELDS.length} values need review
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-3.5 py-2.5">
            <p className="font-serif text-[1.35rem] leading-none text-ink">
              {stat.value}
            </p>
            <p className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-line">
        <li className="flex flex-wrap items-start gap-3 px-4 py-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-canvas text-ink-soft">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.82rem] font-medium text-ink">
              Data sheet · {EXTRACTED_FIELDS.length} fields drafted
            </p>
            <p className="mt-0.5 text-[0.74rem] leading-relaxed text-ink-soft">
              The spec left missing and conflicting values. Weight and warranty
              were filled from other sources, control wiring conflicts with rev
              B, and the refrigerant charge needs a second read.
            </p>
          </div>
          {published ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-online/30 bg-online/10 px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-online">
              <Check className="h-3 w-3" />
              Published
            </span>
          ) : (
            <button
              type="button"
              onClick={onReview}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Review data sheet
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </li>
      </ul>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-line bg-elevated/40 px-4 py-2">
        <AlertTriangle className="h-3 w-3 text-muted" />
        <p className="font-mono text-[0.54rem] uppercase tracking-[0.08em] text-muted">
          Sources: uploaded spec rev C · ERP material master · manual rev A ·
          published sheet rev B
        </p>
      </div>
    </div>
  );
}

export function AuditReviewCard({
  published,
  values,
  onValueChange,
  onPublish,
}: {
  published: boolean;
  values: AuditReviewValues;
  onValueChange: (id: string, value: string) => void;
  onPublish: (values: AuditReviewValues) => void;
}) {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const count = AUDIT_REVIEW_FIELDS.filter((field) => confirmed[field.id]).length;
  const all = count === AUDIT_REVIEW_FIELDS.length;
  const valueFor = (field: (typeof AUDIT_REVIEW_FIELDS)[number]) =>
    values[field.id] ?? field.value;
  const kindCount = (kind: AuditReviewKind) =>
    AUDIT_REVIEW_FIELDS.filter((field) => field.kind === kind).length;

  const handleChange = (id: string, value: string) => {
    onValueChange(id, value);
    setConfirmed((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const confirm = (id: string) => {
    const value = (values[id] ?? "").trim();
    if (!value) return;
    if (value !== values[id]) onValueChange(id, value);
    setConfirmed((prev) => ({ ...prev, [id]: true }));
  };

  const publish = () => {
    onPublish(
      Object.fromEntries(
        AUDIT_REVIEW_FIELDS.map((field) => {
          const value = valueFor(field).trim();
          return [field.id, value || field.value];
        }),
      ),
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-elevated/60 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber/30 bg-amber-soft text-amber">
          <FileSpreadsheet className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.56rem] font-medium uppercase tracking-[0.14em] text-muted">
            Review draft data sheet
          </p>
          <p className="mt-0.5 text-[0.84rem] font-medium text-ink">
            MAA-200 · draft rev D
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] ${
            published
              ? "border-online/30 bg-online/10 text-online"
              : "border-line bg-canvas text-muted"
          }`}
        >
          {published ? (
            <>
              <Check className="h-3 w-3" />
              Published
            </>
          ) : (
            `${count}/${AUDIT_REVIEW_FIELDS.length} confirmed`
          )}
        </span>
      </div>

      <div className="border-b border-line bg-amber-soft/40 px-4 py-2.5 text-[0.74rem] leading-relaxed text-amber">
        The spec left {AUDIT_REVIEW_FIELDS.length} values for a human:{" "}
        {kindCount("missing")} missing, {kindCount("conflict")} conflicting,{" "}
        {kindCount("low-confidence")} uncertain, {kindCount("carried-over")}{" "}
        reused from the last sheet. Review or change them before publishing rev
        D.
      </div>

      <ul className="divide-y divide-line">
        {AUDIT_REVIEW_FIELDS.map((field) => {
          const done = published || confirmed[field.id];
          const value = valueFor(field);
          const kind = REVIEW_KIND_META[field.kind];
          return (
            <li
              key={field.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                  done
                    ? "border-online/30 bg-online/10 text-online"
                    : "border-line-strong bg-canvas text-muted"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.82rem] font-medium text-ink">
                    {field.field}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.06em] ${kind.chip}`}
                  >
                    {kind.label}
                  </span>
                  {done ? (
                    <span className="font-mono text-[0.8rem] text-ink-soft">
                      {value}
                    </span>
                  ) : (
                    <input
                      value={value}
                      onChange={(event) =>
                        handleChange(field.id, event.target.value)
                      }
                      aria-label={`Set ${field.field}`}
                      className="w-40 rounded-lg border border-line-strong bg-canvas px-2.5 py-1.5 font-mono text-[0.78rem] text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
                    />
                  )}
                </div>
                <p className="mt-0.5 text-[0.72rem] leading-relaxed text-muted">
                  {field.note} Source: {field.source}
                </p>
                {field.alternative ? (
                  <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">
                    {field.alternative.label}:{" "}
                    <span className="font-mono text-ink-soft">
                      {field.alternative.value}
                    </span>{" "}
                    · {field.alternative.source}
                  </p>
                ) : null}
              </div>
              {done ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-online/30 bg-online/10 px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-online">
                    <Check className="h-3 w-3" />
                    Confirmed
                  </span>
                  {!published ? (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmed((prev) => ({
                          ...prev,
                          [field.id]: false,
                        }))
                      }
                      className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Change
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => confirm(field.id)}
                  disabled={!value.trim()}
                  className="rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Confirm
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-elevated/40 px-4 py-3">
        <p className="min-w-0 flex-1 text-[0.72rem] leading-relaxed text-muted">
          {published
            ? "Published as rev D. The alerts now point at the revision that needs to catch up."
            : all
              ? `All ${AUDIT_REVIEW_FIELDS.length} values are confirmed. The draft is ready to publish.`
              : `Confirm or change all ${AUDIT_REVIEW_FIELDS.length} values to enable publishing.`}
        </p>
        {published ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-online/30 bg-online/10 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-online">
            <Check className="h-3 w-3" />
            Rev D published
          </span>
        ) : (
          <button
            type="button"
            onClick={publish}
            disabled={!all}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Publish rev D
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AuditPublishedCard({ values }: { values: AuditReviewValues }) {
  return (
    <ChangeSummaryCard
      title="MAA-200 Data Sheet"
      subtitle="Published · revision D"
      changes={buildAuditPublishChanges(values)}
      source={`${AUDIT_FILE.name} · draft rev D`}
    />
  );
}
