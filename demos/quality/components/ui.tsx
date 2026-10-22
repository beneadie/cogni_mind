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
  alert: "Recurring",
};

/** Plain-language explanation for each reason the classifier left a ticket for a person. */
export const REVIEW_REASON_TEXT: Record<ReviewReason, string> = {
  no_failure_cue: "No failure was named clearly enough to pick a type.",
  negated: "The text rules the failure out (e.g. \"no leak found\"), so nothing was tagged.",
  competing_cues: "Words for more than one failure type appear. Pick the right one.",
  product_unresolved: "The model could not be matched to a known product.",
  empty_text: "The ticket has no text to read.",
};

/** Mono uppercase label tone shared by section headings. */
const LABEL = "font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em]";

/** Small mono section label. */
export function SectionLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`${LABEL} text-muted ${className}`}>{children}</p>;
}

// --- Chips and tags ---

// --- Data palette (QC only; the shared theme tokens stay untouched) ---
// Ranking bars are one muted blue on a light-gray track (length = total, nothing else). Status badges are soft
// fills: confirmed green, suggested blue, needs review orange. Muted terracotta only where the alert rule fired,
// never because a count is high. Every color sits next to a text label. Literal strings so Tailwind sees them.

/** Fills for bars and swatches. */
export const DATA_FILL = {
  ranking: "bg-[#5C83A3]",
  track: "bg-[#ECEAE5]",
  recurring: "bg-[#BB7468]",
} as const;

/** Text tone for needs-review counts (matches the "review" chip). */
export const REVIEW_TEXT = "text-[#B65E16]";

/** Text tone matching DATA_FILL.ranking, for icons. */
export const DATA_TEXT_RANKING = "text-[#4a6d8a]";

/** Recurring-failure alert surfaces (cards, highlight, icon). */
export const RECURRING = {
  card: "border-[#BB7468]/40 bg-[#BB7468]/[0.07]",
  hover: "hover:bg-[#BB7468]/[0.12]",
  highlight: "border-[#BB7468] ring-2 ring-[#BB7468]/35",
  icon: "text-[#9c5a4f]",
  text: "text-[#9c5a4f]",
} as const;

/** Visual tone of a chip. */
export type ChipTone = "neutral" | "amber" | "online" | "danger" | "suggested" | "review" | "recurring" | "gray";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "border-line-strong text-ink-soft",
  amber: "border-amber/30 bg-amber-soft text-amber",
  online: "border-[#2E7D32]/15 bg-[#E8F5E9] text-[#2E7D32]",
  danger: "border-danger/30 bg-danger-soft text-danger",
  suggested: "border-[#1565C0]/15 bg-[#E3F2FD] text-[#1565C0]",
  review: "border-[#B65E16]/20 bg-[#FFF3E0] text-[#B65E16]",
  recurring: "border-[#BB7468]/40 bg-[#BB7468]/10 text-[#8f4c41]",
  gray: "border-line-strong bg-elevated text-muted",
};

/** Compact rounded tag. */
export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] ${CHIP_TONES[tone]}`}>
      {children}
    </span>
  );
}

// The label always carries the status; color only reinforces it. "Recurring" follows the alert rule only.
const STATUS_TONE: Record<TagStatus | "alert", ChipTone> = {
  unclassified: "gray",
  suggested: "suggested",
  needs_review: "review",
  confirmed: "online",
  corrected: "online",
  alert: "recurring",
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
