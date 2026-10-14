export type Tone = "info" | "warn" | "good";

export type PlayerStep =
  | { kind: "thought"; text: string; ms?: number }
  | { kind: "note"; text: string; tone?: Tone; ms?: number }
  | { kind: "observe"; text: string; ms?: number }
  | {
      kind: "action";
      label: string;
      /** Tiny command fragment that flashes while the action runs. */
      flash?: string;
      result: string;
      ms: number;
      ms2?: number;
    };

export type PlayStatus = "idle" | "playing" | "done";

export type SourceProfile = {
  file: string;
  label: string;
  rows: number;
  cols: number;
  delimiter: string;
  language: "English" | "German";
  currency: "USD" | "EUR" | "Mixed";
  decimals: "dot" | "comma";
  headers: string;
  quirks: string[];
};

export type SystemSource = {
  id: string;
  name: string;
  category: string;
  method: string;
  /** The raw file this system lands, once pulled. */
  file?: string;
  records: number;
  note: string;
  /** Linked for context only — carries no catalog. */
  extra?: boolean;
};

export type CanonicalField = {
  field: string;
  type: string;
  note: string;
  confidence: number;
};

export type ClusterMember = {
  source: string;
  rowId: string;
  raw: string;
  parsed: string;
};

export type MasterRow = {
  id: string;
  category: string;
  brand: string;
  specs: string;
  suppliers: number;
  low: number;
  high: number;
  provenance: string;
};

export type ReviewCandidate = {
  id: string;
  label: string;
  confidence: number;
};

export type ReviewCase = {
  subject: { source: string; rowId: string; text: string };
  question: string;
  candidates: ReviewCandidate[];
};

export type ValueStat = {
  key: "capability" | "cost" | "speed" | "quality";
  label: string;
  metric: string;
  detail: string;
};

export type PayoffQuery = {
  id: string;
  question: string;
  answer: string;
  detail: string;
};

export type PlanTask = { id: string; text: string; revisedFrom?: string };

export type PlanPhase = { id: string; title: string; tasks: PlanTask[] };

export type DownstreamTool = {
  id: string;
  name: string;
  blurb: string;
};
