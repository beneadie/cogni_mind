"use client";

// PURPOSE: One ticket (or the incoming draft) in the center: original words beside the suggested tags, the
//          classification steps, and the human Confirm / Correct actions.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component because the correction form opens inline; all decisions dispatch through callbacks to the store.

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, PencilLine, X } from "lucide-react";
import type { Ticket } from "../lib/contracts";
import { companyName, failureLabel, modelById, productName } from "../lib/data/catalog";
import type { Correction } from "../lib/state/reducer";
import { formatDay } from "../lib/time";
import { ClassificationSteps } from "./classification-steps";
import { CorrectionForm } from "./correction-form";
import { BUTTON, Chip, HighlightedText, REVIEW_REASON_TEXT, SectionLabel, StatusTag } from "./ui";

/** Tag row value; missing values say "Unknown" rather than guessing. */
function TagRow({ label, value, raw }: { label: string; value: string | null; raw?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <SectionLabel>{label}</SectionLabel>
      <span className={`text-right text-[0.8rem] ${value ? "font-medium text-ink" : "italic text-muted"}`}>
        {value ?? (raw ? `Unknown ("${raw}")` : "Unknown")}
      </span>
    </div>
  );
}

/** Review card. `pending` marks the incoming draft, which is not in the records until confirmed or corrected. */
export function TicketReview({
  ticket,
  pending,
  inAlert,
  onConfirm,
  onCorrect,
  onDiscard,
}: {
  ticket: Ticket;
  pending: boolean;
  inAlert: boolean;
  /** Present only when the tags are complete and still awaiting a person. */
  onConfirm?: () => void;
  onCorrect: (correction: Correction) => void;
  onDiscard?: () => void;
}) {
  const [correcting, setCorrecting] = useState(false);
  const { tags, classification } = ticket;
  const reason = classification?.reviewReason;
  const awaitingPerson = pending || tags.status === "suggested" || tags.status === "needs_review";

  return (
    <motion.section
      key={ticket.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 rounded-2xl border border-line-strong bg-surface px-4 py-4"
      aria-label={`Ticket ${ticket.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-serif text-lg text-ink">{pending ? "Incoming complaint" : ticket.id}</h2>
        <Chip>{pending ? `${ticket.id} · not yet in records` : formatDay(ticket.date, true)}</Chip>
        <Chip>{companyName(ticket.companyId)}</Chip>
        <Chip>{ticket.kind}</Chip>
        <Chip>{ticket.intake === "forced_choice" ? "Forced-choice form" : "Free text"}</Chip>
        <span className="ml-auto">
          <StatusTag status={tags.status} inAlert={inAlert} />
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <SectionLabel>Original complaint</SectionLabel>
          <div className="rounded-xl border border-line bg-canvas px-3 py-3">
            <HighlightedText text={ticket.text} evidence={classification?.evidence ?? []} className="text-[0.84rem] leading-relaxed text-ink-soft" />
            {ticket.modelRaw ? <p className="mt-2 font-mono text-[0.66rem] text-muted">Model field: {ticket.modelRaw}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <SectionLabel>{classification ? "Suggested tags · rule-based demo classifier" : "Tags"}</SectionLabel>
          <div className="rounded-xl border border-line px-3 py-1">
            <TagRow label="Product" value={tags.productId ? productName(tags.productId) : null} />
            <TagRow label="Model" value={tags.modelId ? modelById(tags.modelId).label : null} raw={ticket.modelRaw} />
            <TagRow label="Failure type" value={tags.failureType ? failureLabel(tags.failureType) : null} />
          </div>
          {reason && awaitingPerson ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber/30 bg-amber-soft px-3 py-2.5 text-[0.78rem] leading-relaxed text-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="space-y-1.5">
                <p>
                  <span className="font-medium">Needs review:</span> {REVIEW_REASON_TEXT[reason]}
                </p>
                {classification.possibleFailureTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {classification.possibleFailureTypes.map((failure) => (
                      <Chip key={failure} tone="amber">
                        {failureLabel(failure)}
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {!classification ? (
            <p className="text-[0.74rem] leading-relaxed text-muted">
              {ticket.intake === "forced_choice"
                ? "Captured on the new forced-choice form, so the tags came from the form. No classification step."
                : "Not classified yet. Old free-text records are sorted by the historical backfill; you can also set tags by hand."}
            </p>
          ) : null}
        </div>
      </div>

      {classification ? <ClassificationSteps response={classification} /> : null}

      {correcting ? (
        <CorrectionForm
          tags={tags}
          possibleFailureTypes={classification?.possibleFailureTypes ?? []}
          onCancel={() => setCorrecting(false)}
          onSave={(correction) => {
            setCorrecting(false);
            onCorrect(correction);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {pending ? (
            <p className="mr-auto text-[0.74rem] text-muted">Review the details, then create the ticket.</p>
          ) : null}
          {onDiscard ? (
            <button type="button" onClick={onDiscard} className={BUTTON.secondary}>
              <X className="h-3.5 w-3.5" />
              Discard
            </button>
          ) : null}
          <button type="button" onClick={() => setCorrecting(true)} className={BUTTON.secondary}>
            <PencilLine className="h-3.5 w-3.5" />
            {tags.productId && tags.failureType ? "Correct" : "Set tags"}
          </button>
          {onConfirm ? (
            <button type="button" onClick={onConfirm} className={BUTTON.primary}>
              <Check className="h-3.5 w-3.5" />
              Confirm
            </button>
          ) : null}
        </div>
      )}
    </motion.section>
  );
}
