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

export type PlmFlowKind = "spec" | "docs" | "ingest" | "care";

export type PlmStage =
  | "launcher"
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
  | "finding"
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
  | "compliance-actions"
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
  /** Product id, for `kind: "compliance-actions"`. */
  productId?: string;
};

export type TurnBeat =
  | WorkBeat
  | { kind: "text"; text: string }
  | { kind: "card"; message: Omit<PlmMessage, "id"> };

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

/** Opening line for the Product Care inbox. */
export const QUEUE_GREETING =
  "Two items are waiting for you. Start with the field report?";

/** The prompt auto-filled into the composer when the user clicks the box,
 *  HVAC-style. Stages without an entry are driven by the cards instead. */
export const EXPECTED_INPUT: Partial<Record<PlmStage, string>> = {
  launcher: "Turn the DL-2400 spec into a data sheet.",
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
  done: "Turn the DL-2400 spec into a data sheet.",
};

export const PLACEHOLDERS: Record<PlmStage, string> = {
  launcher: "Ask about specs, documents, regulations, or suppliers…",
  upload: "Select a document to continue…",
  extract: "Review the extracted fields…",
  resolve: "Ask about any flagged field…",
  "resolve-confirm": "Confirm the value to apply…",
  approve: "Review the change set…",
  propagate: "Decide what to update next…",
  "manual-draft": "Review the drafted changes…",
  "manual-review": "Approve the changes to the manual…",
  "manual-publish": "Continue…",
  health: "Ask about documentation health…",
  regulation: "Ask about a product or regulation…",
  legacy: "Refine the legacy part search…",
  "ingest-connect": "Ask about the systems or the files…",
  "ingest-understand": "Ask about the dialects or the values…",
  "ingest-reconcile": "Ask about the master record…",
  "queue-review": "Review the item, or pick another…",
  "queue-apply": "Apply the change, or pick another item…",
  "queue-resolve": "Pick the next item, or review the change…",
  done: "Ask a follow-up…",
};

export type FlowStep = { id: string; label: string };

export const FLOW_STEPS: Record<PlmFlowKind, FlowStep[]> = {
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
