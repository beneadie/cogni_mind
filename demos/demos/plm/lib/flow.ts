import type { DocDiff, PromptOption, QueueItem } from "./types";

export type Tone = "info" | "warn" | "good";
/** One visible unit of the agent's work in a turn. */
export type WorkBeat =
  | { kind: "thought"; text: string; ms?: number }
  | { kind: "observe"; text: string; ms?: number }
  | { kind: "note"; text: string; tone?: Tone; ms?: number }
  | {
      kind: "action";
      label: string;
      /** Command fragment shown while the action runs. */
      command?: string;
      /** Result chip shown once the action completes. */
      result: string;
      ms: number;
      ms2?: number;
    };

/** A file the user attached to the audit conversation. */
export type UploadedFile = {
  name: string;
  kind: "csv" | "pdf";
  size: string;
  /** Real file served from /public, or a blob URL for a dropped file. */
  url?: string;
};

/** One specialist the orchestrator delegates a data-sheet check to. */
export type SubagentSpec = {
  id: string;
  name: string;
  role: string;
  icon: "compliance" | "manual" | "sheet";
  beats: WorkBeat[];
  finding: string;
  /** Alert this agent contributes to once its research completes. */
  alert: "compliance" | "documentation";
};

export type PlmFlowKind = "audit" | "spec" | "docs" | "ingest" | "care";

export type PlmStage =
  | "launcher"
  | "audit-upload"
  | "audit-reading"
  | "audit-delegating"
  | "audit-review"
  | "alerts"
  | "upload"
  | "extract"
  | "resolve"
  | "resolve-confirm"
  | "approve"
  | "propagate"
  | "manual-draft"
  | "manual-review"
  | "manual-publish"
  | "health"
  | "regulation"
  | "legacy"
  | "ingest-connect"
  | "ingest-understand"
  | "ingest-reconcile"
  | "queue-review"
  | "queue-apply"
  | "queue-resolve"
  | "done";

export type PlmMessageKind =
  | "work"
  | "text"
  | "file"
  | "upload-request"
  | "uploaded"
  | "subagents"
  | "alert-created"
  | "audit-summary"
  | "audit-review"
  | "audit-published"
  | "extracted-sheet"
  | "finding"
  | "warning"
  | "upload"
  | "source"
  | "connections"
  | "ingest-notes"
  | "master"
  | "datasheet"
  | "exceptions"
  | "proposal"
  | "diff"
  | "manual-changes"
  | "approval"
  | "propagation"
  | "publish-summary"
  | "doc-health"
  | "regulation"
  | "legacy"
  | "change-proposal"
  | "queue-regulation"
  | "prompts"
  | "doc-diff"
  | "queue-propagation";

export type PlmMessage = {
  id: string;
  role: "user" | "agent";
  kind: PlmMessageKind;
  text?: string;
  /** Substring of `text` to emphasize, for `kind: "finding"`. */
  emphasis?: string;
  /** Work stream payload, for `kind: "work"`. */
  beats?: WorkBeat[];
  /** Index of the action currently running, or -1. */
  runningBeat?: number;
  streaming?: boolean;
  done?: boolean;
  seconds?: number;
  /** Payload keys for card messages. */
  sourceId?: string;
  proposalId?: string;
  /** Queue card that triggered this message, if any. */
  queueItemId?: string;
  /** Product id, for `kind: "prompts"`. */
  productId?: string;
  /** Suggested replies, for `kind: "prompts"`. */
  prompts?: PromptOption[];
  /** Heading for a `warning` callout (defaults to "Warning"). */
  title?: string;
  /** Fact chips shown under a `warning` callout. */
  items?: string[];
  /** Document diff, for `kind: "doc-diff"`. */
  diff?: DocDiff;
  /** Whether the diff has been applied (vs. proposed), for `kind: "doc-diff"`. */
  applied?: boolean;
  /** Whether the diff was sent to the document owner, for `kind: "doc-diff"`. */
  sent?: boolean;
  /** Attached file name, for `kind: "file"` and `kind: "upload-request"`. */
  fileName?: string;
  /** Attached file kind, for `kind: "file"`. */
  fileKind?: "csv" | "pdf";
  /** Attached file URL, for `kind: "file"`. */
  fileUrl?: string;
  /** Specialist agents, for `kind: "subagents"`. */
  subagents?: SubagentSpec[];
  /** Alert created by the audit, for `kind: "alert-created"`. */
  queueItem?: QueueItem;
};

export type TurnBeat =
  | WorkBeat
  | { kind: "text"; text: string }
  | { kind: "card"; message: Omit<PlmMessage, "id"> }
  | {
      kind: "subagents";
      agents: SubagentSpec[];
      ms: number;
      launchDelayMs?: number;
    };

export type TurnPlan = {
  beats: TurnBeat[];
  onDone?: () => void;
};

/** Starting points shown in the left rail. Selecting one launches its flow. */
export type PlmSession = {
  id: string;
  title: string;
  subtitle: string;
  query: string;
};

export const sessions: PlmSession[] = [
  {
    id: "spec",
    title: "Create / check a data sheet",
    subtitle: "DL-2400 rev C · 1987 spec",
    query: "Turn the DL-2400 spec into a data sheet.",
  },
  {
    id: "health",
    title: "Documentation Health",
    subtitle: "DL Series documents",
    query: "What documents are out of date?",
  },
  {
    id: "regulation",
    title: "Regulation Risk",
    subtitle: "RoHS 2027 · EU Chrome 2026",
    query: "Show regulation risk across the portfolio.",
  },
  {
    id: "legacy",
    title: "Legacy Part Search",
    subtitle: "Archived drawings",
    query: "Find a brass latch, 2-3/8 backset, 1980s.",
  },
  {
    id: "ingest",
    title: "Ingest & Connect",
    subtitle: "6 supplier catalogs → master",
    query: "Connect our supplier catalogs into one master.",
  },
];

export const GREETING_TEXT =
  "Welcome. I work across product data — I can turn a scanned spec into a governed data sheet, keep documentation current, check regulation exposure, find legacy parts, and integrate messy supplier catalogs. Pick a starting point, or just ask.";

/** Opening line for the new data-sheet draft conversation. */
export const AUDIT_GREETING =
  "Hi — I'm your product-data copilot. Upload a new engineering spec and I'll draft the standard data sheet, flag missing or conflicting values, then check it against documentation and compliance. Want me to draft the MAA-200 sheet from the new spec?";

/** The default prompt auto-filled into the fresh conversation. */
export const AUDIT_PROMPT = "Draft the MAA-200 data sheet from the new spec.";

/** The prompt auto-filled into the composer when the user clicks the box,
 *  HVAC-style. Stages without an entry are driven by the cards instead. */
export const EXPECTED_INPUT: Partial<Record<PlmStage, string>> = {
  launcher: AUDIT_PROMPT,
  alerts: "Review the data sheet.",
  upload: "Extract attributes",
  resolve: "Let's go through the exceptions one by one.",
  "resolve-confirm": "Yes, apply that value.",
  approve: "Approve & publish",
  propagate: "Update the installation manual",
  health: "Update this manual",
  regulation: "Why is DL-2400 high risk?",
  legacy: "Check regulation risk for DL-2400",
  "ingest-connect": "Survey what you pulled.",
  "ingest-understand": "Reconcile the records into one master.",
};

export const PLACEHOLDERS: Record<PlmStage, string> = {
  launcher: "Ask about specs, documents, regulations, or suppliers…",
  "audit-upload": "Use the upload card to attach the spec…",
  "audit-reading": "Drafting the data sheet and flagging gaps…",
  "audit-delegating": "Checking compliance and documentation…",
  "audit-review": "Use the review card to continue…",
  alerts: "Review the data sheet, or ask about the findings…",
  upload: "Select a document to continue…",
  extract: "Review the extracted fields…",
  resolve: "Ask about any flagged field…",
  "resolve-confirm": "Confirm the value to apply…",
  approve: "Review the change set…",
  propagate: "Decide what to update next…",
  "manual-draft": "Review the drafted changes…",
  "manual-review": "Use the card to review the changes…",
  "manual-publish": "Continue…",
  health: "Ask about documentation health…",
  regulation: "Ask about a product or regulation…",
  legacy: "Refine the legacy part search…",
  "ingest-connect": "Ask about the systems or the files…",
  "ingest-understand": "Ask about the dialects or the values…",
  "ingest-reconcile": "Ask about the master record…",
  "queue-review": "Choose an action above…",
  "queue-apply": "Choose an action above…",
  "queue-resolve": "Open another alert, or type a follow-up…",
  done: "Flow complete — start another conversation or reset.",
};

export type FlowStep = { id: string; label: string };

export const FLOW_STEPS: Record<PlmFlowKind, FlowStep[]> = {
  audit: [
    { id: "upload", label: "Upload" },
    { id: "scan", label: "Scan" },
    { id: "delegate", label: "Delegate" },
    { id: "triage", label: "Review" },
  ],
  spec: [
    { id: "ingest", label: "Ingest" },
    { id: "extract", label: "Extract & Verify" },
    { id: "resolve", label: "Resolve" },
    { id: "approve", label: "Approve" },
    { id: "propagate", label: "Propagate" },
  ],
  docs: [
    { id: "health", label: "Health" },
    { id: "manual-draft", label: "Draft" },
    { id: "manual-review", label: "Review" },
    { id: "manual-publish", label: "Publish" },
  ],
  ingest: [
    { id: "connect", label: "Connect" },
    { id: "understand", label: "Understand" },
    { id: "reconcile", label: "Reconcile" },
    { id: "deliver", label: "Deliver" },
  ],
  care: [
    { id: "review", label: "Review" },
    { id: "apply", label: "Apply" },
    { id: "resolve", label: "Resolve" },
  ],
};

export const STAGE_FLOW: Partial<Record<PlmStage, PlmFlowKind>> = {
  "audit-upload": "audit",
  "audit-reading": "audit",
  "audit-delegating": "audit",
  "audit-review": "audit",
  alerts: "audit",
  upload: "spec",
  extract: "spec",
  resolve: "spec",
  "resolve-confirm": "spec",
  approve: "spec",
  propagate: "spec",
  health: "docs",
  "manual-draft": "docs",
  "manual-review": "docs",
  "manual-publish": "docs",
  "ingest-connect": "ingest",
  "ingest-understand": "ingest",
  "ingest-reconcile": "ingest",
  "queue-review": "care",
  "queue-apply": "care",
  "queue-resolve": "care",
};

export const STAGE_STEP: Partial<Record<PlmStage, string>> = {
  "audit-upload": "upload",
  "audit-reading": "scan",
  "audit-delegating": "delegate",
  "audit-review": "triage",
  alerts: "triage",
  upload: "ingest",
  extract: "extract",
  resolve: "resolve",
  "resolve-confirm": "resolve",
  approve: "approve",
  propagate: "propagate",
  health: "health",
  "manual-draft": "manual-draft",
  "manual-review": "manual-review",
  "manual-publish": "manual-publish",
  "ingest-connect": "connect",
  "ingest-understand": "understand",
  "ingest-reconcile": "reconcile",
  "queue-review": "review",
  "queue-apply": "apply",
  "queue-resolve": "resolve",
};
