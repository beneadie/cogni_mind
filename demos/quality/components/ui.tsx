// PURPOSE: Small presentational pieces every Quality component shares: labels, chips, status tags, notes, highlights.
// ROLE: component (server-safe leaves, no state). USED BY: every component in demos/quality/components.
// Look-alikes of Support's label/badge styling, rebuilt locally so Support's files stay untouched.

import type { ReactNode } from "react";
import type { Evidence, ReviewReason, TagStatus } from "../lib/contracts";

// --- Labels (one place for every status and reason wording) ---

/** Rail and card wording for each tag status; "Alert" is added on top by the alert selector. */
export const STATUS_LABEL: Record<TagStatus | "alert", string> = {
  unclassified: "Unclassified",
  suggested: "Suggested",
  needs_review: "Needs review",
  confirmed: "Confirmed",
  corrected: "Corrected",
  alert: "Alert",
};

/** Plain-language explanation for each reason the classifier left a ticket for a person. */
export const REVIEW_REASON_TEXT: Record<ReviewReason, string> = {
  no_failure_cue: "No failure was named clearly enough to pick a type.",
  negated: "The text rules the failure out (e.g. \"no leak found\"), so nothing was tagged.",
  competing_cues: "Words for more than one failure type appear. Pick the right one.",
  product_unresolved: "The model could not be matched to a known product.",
  empty_text: "The complaint has no text to read.",
};

/** Mono uppercase label tone shared by section headings. */
const LABEL = "font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em]";

/** Small mono section label. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`${LABEL} text-muted ${className}`}>{children}</p>;
}

// --- Chips and tags ---

/** Visual tone of a chip; each maps to existing palette tokens only. */
export type ChipTone = "neutral" | "amber" | "online" | "danger";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "border-line-strong text-ink-soft",
  amber: "border-amber/30 bg-amber-soft text-amber",
  online: "border-online/40 text-online",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

/** Compact rounded tag. */
export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] ${CHIP_TONES[tone]}`}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<TagStatus | "alert", ChipTone> = {
  unclassified: "neutral",
  suggested: "neutral",
  needs_review: "amber",
  confirmed: "online",
  corrected: "online",
  alert: "danger",
};

/** Status tag for a ticket; pass inAlert to show "Alert" instead of the review status. */
export function StatusTag({ status, inAlert = false }: { status: TagStatus; inAlert?: boolean }) {
  const key = inAlert ? "alert" : status;
  return <Chip tone={STATUS_TONE[key]}>{STATUS_LABEL[key]}</Chip>;
}

/** The counting-rule disclosure: shown wherever counts include suggestions no person has confirmed yet. */
export function UnconfirmedNote({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <p className="font-mono text-[0.62rem] tracking-[0.04em] text-amber">
      includes {count} unconfirmed {count === 1 ? "suggestion" : "suggestions"}
    </p>
  );
}

/** Friendly placeholder for an empty list or section. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line-strong px-3 py-3 text-[0.76rem] leading-relaxed text-muted">{children}</p>;
}

// --- Highlighted original text ---

/** Splits text into plain and matched segments; every occurrence of every evidence span is marked, case-insensitively. */
function highlightSegments(text: string, evidence: readonly Evidence[]): { text: string; hit: boolean }[] {
  const spans = [...new Set(evidence.map((item) => item.span.toLowerCase()).filter(Boolean))];
  const marked = new Array<boolean>(text.length).fill(false);
  const lower = text.toLowerCase();
  for (const span of spans) {
    for (let at = lower.indexOf(span); at !== -1; at = lower.indexOf(span, at + span.length)) {
      marked.fill(true, at, at + span.length);
    }
  }
  const segments: { text: string; hit: boolean }[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const last = segments[segments.length - 1];
    if (last && last.hit === marked[index]) last.text += text[index];
    else segments.push({ text: text[index], hit: marked[index] });
  }
  return segments;
}

/** A ticket's original words, never rewritten, with the classifier's matched spans highlighted. */
export function HighlightedText({ text, evidence, className = "" }: { text: string; evidence: readonly Evidence[]; className?: string }) {
  if (!text.trim()) return <p className={`italic text-muted ${className}`}>(empty record: no text was entered)</p>;
  return (
    <p className={`whitespace-pre-wrap break-words ${className}`}>
      {highlightSegments(text, evidence).map((segment, index) =>
        segment.hit ? (
          <mark key={index} className="rounded-sm bg-gold/20 px-0.5 text-ink">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  );
}

// --- Buttons ---

/** Shared button classes: primary is the near-black pill, secondary the outlined pill. */
export const BUTTON = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 font-mono text-[0.64rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
  icon: "inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
} as const;

/** Shared input/select classes. */
export const FIELD =
  "w-full rounded-xl border border-line-strong bg-surface px-3 py-2 text-[0.8rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
