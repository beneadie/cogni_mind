"use client";

// PURPOSE: The New Complaint view: one free-text box, then a compact suggested ticket a person edits or creates.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Client component for the unsent text and pending edits; classification and ticket creation happen in the reducer.

import { useState } from "react";
import { AlertTriangle, Check, PencilLine, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { companyName, failureLabel, modelById, productName } from "../lib/data/catalog";
import { SAMPLE_COMPLAINT } from "../lib/data/synthetic";
import type { Correction, Draft } from "../lib/state/reducer";
import { ClassificationSteps } from "./classification-steps";
import { CorrectionForm } from "./correction-form";
import { BUTTON, FIELD, HighlightedText, REVIEW_REASON_TEXT, SectionLabel } from "./ui";

/** One field of the suggested ticket; a missing value says "Needs review" instead of guessing. */
function Field({ label, value, note }: { label: string; value: string | null; note?: string }) {
  return (
    <div className="space-y-1 rounded-xl border border-line bg-canvas px-3 py-2.5">
      <SectionLabel>{label}</SectionLabel>
      {value ? (
        <p className="text-[0.9rem] font-medium text-ink">{value}</p>
      ) : (
        <p className="inline-flex items-center gap-1 text-[0.86rem] font-medium text-amber">
          <AlertTriangle className="h-3.5 w-3.5" />
          Needs review
        </p>
      )}
      {value && note ? <p className="text-[0.7rem] text-muted">{note}</p> : null}
    </div>
  );
}

/** The suggested ticket for the pending draft; `edits` (from Edit details) replace the classifier's values. */
function SuggestedTicket({ draft, onCreate, onDiscard }: { draft: Draft; onCreate: (correction?: Correction) => void; onDiscard: () => void }) {
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<Correction | null>(null);
  const { response } = draft;
  const productId = edits?.productId ?? response.productId;
  const modelId = edits ? edits.modelId : response.modelId;
  const failureType = edits?.failureType ?? response.failureType;
  const companyId = edits?.companyId ?? draft.companyId;
  const complete = Boolean(productId && failureType && companyId);
  // Company came from the model when the intake did not name it; say so, so it does not look like a guess.
  const companyNote = !edits?.companyId && draft.companyId && response.modelId ? `From model ${modelById(response.modelId).label}` : undefined;

  return (
    <section aria-labelledby="suggested-title" className="space-y-4 rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="suggested-title" className="font-serif text-xl text-ink">
          Suggested ticket
        </h2>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{edits ? "Edited by you" : "Rule-based demo suggestion"}</span>
      </div>

      <blockquote className="rounded-xl border border-line bg-canvas px-4 py-3">
        <HighlightedText text={draft.text} evidence={response.evidence} className="text-[0.86rem] leading-relaxed text-ink-soft" />
      </blockquote>

      {editing ? (
        <CorrectionForm
          tags={{ productId, modelId, failureType }}
          possibleFailureTypes={response.possibleFailureTypes}
          company={companyId}
          saveLabel="Save details"
          onCancel={() => setEditing(false)}
          onSave={(correction) => {
            setEdits(correction);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Product" value={productId ? productName(productId) : null} />
            <Field label="Model" value={modelId ? modelById(modelId).label : null} />
            <Field label="Company" value={companyId ? companyName(companyId) : null} note={companyNote} />
            <Field label="Failure type" value={failureType ? failureLabel(failureType) : null} />
          </div>

          {!complete ? (
            <p className="flex items-start gap-2 rounded-xl border border-amber/30 bg-amber-soft px-3 py-2.5 text-[0.8rem] leading-relaxed text-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {response.reviewReason && !edits ? `${REVIEW_REASON_TEXT[response.reviewReason]} ` : ""}
                Use Edit details to fill in what is missing before creating the ticket.
              </span>
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onDiscard} className={`${BUTTON.secondary} mr-auto`}>
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
            <button type="button" onClick={() => setEditing(true)} className={BUTTON.secondary}>
              <PencilLine className="h-3.5 w-3.5" />
              Edit details
            </button>
            <button type="button" onClick={() => onCreate(edits ?? undefined)} disabled={!complete} className={BUTTON.primary}>
              <Check className="h-3.5 w-3.5" />
              Create ticket
            </button>
          </div>
        </>
      )}

      <ClassificationSteps response={response} />
    </section>
  );
}

/** New Complaint view: the intake box, or the suggested ticket once a complaint has been analyzed. */
export function NewComplaint({
  draft,
  onAnalyze,
  onCreate,
  onDiscard,
}: {
  draft: Draft | null;
  onAnalyze: (text: string) => void;
  onCreate: (correction?: Correction) => void;
  onDiscard: () => void;
}) {
  const [text, setText] = useState("");

  if (draft) return <SuggestedTicket key={draft.ticketId} draft={draft} onCreate={onCreate} onDiscard={onDiscard} />;

  return (
    <section aria-labelledby="intake-title" className="space-y-4 rounded-2xl border border-line-strong bg-surface px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="intake-title" className="font-serif text-xl text-ink">
            New complaint
          </h2>
          <p className="text-[0.8rem] text-muted">Paste a warranty or quality complaint exactly as it arrived, messy wording and all.</p>
        </div>
        <button type="button" onClick={() => setText(SAMPLE_COMPLAINT.text)} className={BUTTON.secondary}>
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          Try sample
        </button>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim()) onAnalyze(text.trim());
        }}
      >
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={7}
          aria-label="Complaint text"
          placeholder="e.g. tech says freon leaking at the compressor, NF-3000S, 2nd callback this month"
          className={`${FIELD} resize-y text-[0.92rem] leading-relaxed`}
        />
        <div className="flex justify-end">
          <button type="submit" disabled={!text.trim()} className={BUTTON.primary}>
            <Wand2 className="h-3.5 w-3.5" />
            Analyze complaint
          </button>
        </div>
      </form>
    </section>
  );
}
