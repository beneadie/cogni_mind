export type PlmFlow = "spec" | "docs";

export type PlmScreen =
  | "frame"
  | "ingest"
  | "extract"
  | "resolve"
  | "approve"
  | "propagate"
  | "health"
  | "manual-draft"
  | "manual-review"
  | "manual-publish"
  | "regulation"
  | "legacy";

export type WalkthroughStepId =
  | "ingest"
  | "extract"
  | "resolve"
  | "approve"
  | "propagate"
  | "health"
  | "manual-draft"
  | "manual-review"
  | "manual-publish";

export type WalkthroughStep = {
  id: WalkthroughStepId;
  label: string;
};

export type FieldState =
  | "extracted"
  | "low-confidence"
  | "conflict"
  | "missing"
  | "carried-over";

export type SourceRef = {
  /** Short chip label, e.g. "revC §3.2". */
  label: string;
  /** Full section name for the tooltip. */
  section: string;
  page: number;
};

export type SpecLine = {
  /** Stable id used to map a data-sheet row back to its source text. */
  id: string;
  text: string;
};

export type SpecSection = {
  id: string;
  heading: string;
  page: number;
  lines: SpecLine[];
};

export type SpecDoc = {
  title: string;
  revision: string;
  date: string;
  file: string;
  sections: SpecSection[];
};

export type DataSheetRow = {
  id: string;
  field: string;
  value: string;
  state: FieldState;
  /** Spec line ids highlighted when this row is hovered or pinned. */
  sourceLineIds?: string[];
  source?: SourceRef;
  /** OCR/extraction confidence, 0–1, for low-confidence rows. */
  confidence?: number;
  /** Short human note shown in the row. */
  note?: string;
  /** Key into `flagDetails` when state is not "extracted". */
  flagId?: string;
};

export type TemplateField = {
  field: string;
  required: boolean;
};

export type UnmappedAttribute = {
  attribute: string;
  sourceLineId: string;
};

export type FlagActionOutcome = "resolve" | "defer";

export type FlagAction = {
  label: string;
  primary?: boolean;
  outcome?: FlagActionOutcome;
};

export type MissingFlagDetail = {
  id: string;
  kind: "missing";
  field: string;
  body: string;
  sources: string[];
  actions: FlagAction[];
};

export type ConflictFlagDetail = {
  id: string;
  kind: "conflict";
  field: string;
  body: string;
  published: { value: string; source: string };
  spec: { value: string; source: string };
  actions: FlagAction[];
};

export type LowConfidenceCandidate = {
  value: string;
  confidence: number;
  source: string;
};

export type LowConfidenceFlagDetail = {
  id: string;
  kind: "low-confidence";
  field: string;
  body: string;
  candidates: LowConfidenceCandidate[];
  actions: FlagAction[];
};

export type CarriedOverFlagDetail = {
  id: string;
  kind: "carried-over";
  field: string;
  body: string;
  published: { value: string; source: string };
  actions: FlagAction[];
};

export type ManualState = "unchanged" | "changed" | "added" | "removed";

export type ManualChangeFlagDetail = {
  id: string;
  kind: "manual-change";
  field: string;
  changeType: ManualState;
  body: string;
  from?: { value: string; source: string };
  to?: { value: string; source: string };
  actions: FlagAction[];
};

export type FlagDetail =
  | MissingFlagDetail
  | ConflictFlagDetail
  | LowConfidenceFlagDetail
  | CarriedOverFlagDetail
  | ManualChangeFlagDetail;

export type RegulationRisk = "High" | "Medium" | "Low";

export type RegulationRiskRow = {
  product: string;
  regulation: string;
  risk: RegulationRisk;
  reason: string;
  annualRevenue: string;
  annualRevenueValue: number;
};

export type LegacyPartRow = {
  partNumber: string;
  description: string;
  matchPct: number;
  year: string;
  matchedOn: string[];
};

export type DocumentStatus = "needs-update" | "review";

export type AffectedDocumentRow = {
  document: string;
  type: string;
  lastUpdated: string;
  status: DocumentStatus;
  /** Which approved change makes this document stale. */
  trigger: string;
};

export type ChangeKind = "set" | "changed" | "confirmed" | "kept";

export type ChangeSummary = {
  field: string;
  from: string;
  to: string;
  kind: ChangeKind;
};

/* ------------------------------------------------------------------ */
/* Flow B — Documentation Health / Manual Update                       */
/* ------------------------------------------------------------------ */

export type DocStatus = "out-of-date" | "current" | "archived";

export type DocHealthRow = {
  id: string;
  document: string;
  type: string;
  lastUpdated: string;
  status: DocStatus;
  /** How many spec revisions this document trails. */
  revisionsBehind: number;
};

export type ManualDraftRow = {
  id: string;
  field: string;
  value: string;
  state: ManualState;
  /** Line ids in the old manual that this section maps to. */
  sourceLineIds?: string[];
  source?: SourceRef;
  flagId?: string;
  note?: string;
};
