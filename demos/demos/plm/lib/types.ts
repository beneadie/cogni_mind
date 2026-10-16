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
  /** Value applied when this action resolves the field. */
  value?: string;
  /** Prompt the user for a value before resolving. */
  input?: boolean;
};

/** Resolved values per flag id, overriding the seeded data-sheet value. */
export type ResolvedValues = Record<string, string>;

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
  /** Owning company, shown for cross-company (ACS group) views. */
  company?: string;
  /** Refrigerant or restricted substance under review. */
  substance?: string;
  /** Person accountable for the mitigation. */
  owner?: string;
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

/* ------------------------------------------------------------------ */
/* Product Care Inbox — cross-conversation work queue                  */
/* ------------------------------------------------------------------ */

export type QueueSeverity = "red" | "amber" | "green";

export type QueueStatus =
  | "open"
  | "tracking"
  | "resolved"
  | "declined"
  | "acknowledged";

export type QueueActionVerb = "Review" | "Search" | "Draft";

export type QueueItem = {
  id: string;
  severity: QueueSeverity;
  /** Small uppercase label, e.g. "FIELD REPORT". */
  type: string;
  /** Product or scope the item applies to. */
  scope: string;
  summary: string;
  action: QueueActionVerb;
  status: QueueStatus;
};

/** Actions emitted from queue cards, handled centrally by the page. */
export type QueueCardAction =
  | "field-approve"
  | "field-edit"
  | "field-reject"
  | "compliance-view"
  | "compliance-act"
  | "propagation-apply";

/** A committed mitigation path for a regulation-exposed product. */
export type ComplianceAction =
  | "open-cr"
  | "declaration"
  | "reminder"
  | "acknowledge";

/** One proposed documentation change, governed by an engineering change request. */
export type DocChange = {
  document: string;
  section: string;
  currentManual: string;
  currentSpec: string;
  reportedBy: string;
  warning?: string;
  proposed: string;
  /** Engineering change request raised for this change. */
  ecrId: string;
  /** How many documents reference the changed section. */
  whereUsed: number;
  /** Before/after summary shown as a redline. */
  redline: { from: string; to: string };
};

/** How a downstream document is handled when upstream content changes. */
export type ImpactDisposition = "auto" | "author" | "review" | "none";

export type ImpactRow = {
  document: string;
  type: string;
  /** The changed section/attribute that affects this document. */
  trigger: string;
  disposition: ImpactDisposition;
  owner: string;
  status: string;
  /** Sample PDF to open for this document, if one is available. */
  pdfId?: string;
  page?: number;
};
