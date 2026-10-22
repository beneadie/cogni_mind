import {
  AUDIT_MODIFIED,
  REFRIGERANT_DEADLINE_LABEL,
  REFRIGERANT_YEAR,
} from "./dates";
import type { SubagentSpec } from "./flow";
import type { ChangeSummary } from "./types";

/** A file shown in the mock file explorer. */
export type AuditFile = {
  name: string;
  kind: "csv" | "pdf";
  size: string;
  modified: string;
  description: string;
  url?: string;
};

export const AUDIT_PAGE_COUNT = 6;

/** The uploaded engineering spec used to draft the data sheet. */
export const AUDIT_FILE: AuditFile = {
  name: "MAA-200_spec_revC.pdf",
  kind: "pdf",
  size: "2.4 MB",
  modified: AUDIT_MODIFIED,
  description: "Engineering spec · rev C",
  url: "/manuals/maa-200-spec.pdf",
};

export type AuditReviewKind =
  | "missing"
  | "conflict"
  | "low-confidence"
  | "carried-over";

export type AuditReviewField = {
  id: string;
  field: string;
  value: string;
  source: string;
  note: string;
  kind: AuditReviewKind;
  alternative?: {
    label: string;
    value: string;
    source: string;
  };
};

export type AuditReviewValues = Record<string, string>;

/** Draft values that need a human decision before publishing. */
export const AUDIT_REVIEW_FIELDS: AuditReviewField[] = [
  {
    id: "controlWiring",
    field: "Control wiring",
    value: "3-wire (R, C, G)",
    source: "Spec rev C · §7.2",
    note: "The spec and published rev B disagree. Choose the correct value.",
    kind: "conflict",
    alternative: {
      label: "Published value",
      value: "2-wire",
      source: "MAA-200_datasheet_2019.pdf · p.1",
    },
  },
  {
    id: "weight",
    field: "Weight",
    value: "184 lb",
    source: "ERP material master",
    note: "Not stated in the spec. Suggested from the ERP master.",
    kind: "missing",
  },
  {
    id: "warranty",
    field: "Warranty",
    value: "10 years",
    source: "Published data sheet rev B",
    note: "The spec is silent. This value comes from the last published sheet.",
    kind: "carried-over",
  },
  {
    id: "refrigerantCharge",
    field: "Refrigerant charge",
    value: "6.5 lb",
    source: "Spec rev C · §5",
    note: "The scan is ambiguous on the decimal. Check the extracted value.",
    kind: "low-confidence",
    alternative: {
      label: "Alternate OCR read",
      value: "5.6 lb",
      source: "Spec rev C · §5 scan",
    },
  },
];

export const DEFAULT_AUDIT_REVIEW_VALUES: AuditReviewValues = Object.fromEntries(
  AUDIT_REVIEW_FIELDS.map((field) => [field.id, field.value]),
);

/** What changes when the reviewed draft is published as rev D. */
export function buildAuditPublishChanges(
  values: AuditReviewValues,
): ChangeSummary[] {
  const valueFor = (id: string) =>
    values[id]?.trim() || DEFAULT_AUDIT_REVIEW_VALUES[id] || "";

  const controlWiring = valueFor("controlWiring");
  const weight = valueFor("weight");
  const warranty = valueFor("warranty");
  const refrigerantCharge = valueFor("refrigerantCharge");
  const defaultWeight = DEFAULT_AUDIT_REVIEW_VALUES.weight;
  const defaultWarranty = DEFAULT_AUDIT_REVIEW_VALUES.warranty;
  const defaultCharge = DEFAULT_AUDIT_REVIEW_VALUES.refrigerantCharge;

  return [
    {
      field: "Control wiring",
      from: "2-wire (published rev B)",
      to: controlWiring,
      kind: controlWiring === "2-wire" ? "kept" : "changed",
    },
    {
      field: "Weight",
      from: "—",
      to: weight === defaultWeight ? `${weight} (ERP)` : weight,
      kind: "set",
    },
    {
      field: "Warranty",
      from: "10 years (published rev B)",
      to: warranty,
      kind: warranty === defaultWarranty ? "kept" : "changed",
    },
    {
      field: "Refrigerant charge",
      from: `${defaultCharge} (OCR read)`,
      to: refrigerantCharge,
      kind: refrigerantCharge === defaultCharge ? "confirmed" : "changed",
    },
    { field: "Refrigerant", from: "R-410A", to: "R-410A", kind: "confirmed" },
  ];
}

export type ExtractedField = {
  field: string;
  value: string;
  source: string;
  note?: string;
  changed?: boolean;
};

/** The standard-template rows the agent drafts from the uploaded spec. */
export const EXTRACTED_FIELDS: ExtractedField[] = [
  { field: "Model", value: "MAA-200", source: "spec rev C · p.1" },
  { field: "Product type", value: "Split system", source: "spec rev C · p.1" },
  {
    field: "Nominal capacity",
    value: "24,000 BTU/h",
    source: "spec rev C · p.1",
  },
  {
    field: "Refrigerant",
    value: "R-410A",
    source: "spec rev C · p.1",
    note: `Restricted from ${REFRIGERANT_YEAR}`,
  },
  {
    field: "Control wiring",
    value: "3-wire (R, C, G)",
    source: "spec rev C · §7.2",
    note: "Conflicts with published rev B",
    changed: true,
  },
  {
    field: "Electrical",
    value: "208/230 V · 1φ · 60 Hz",
    source: "spec rev C · §6",
  },
  { field: "MCA / MOP", value: "14.5 A / 20 A", source: "spec rev C · §6" },
  { field: "Airflow", value: "800 CFM", source: "spec rev C · §9" },
  {
    field: "Weight",
    value: "184 lb",
    source: "ERP material master",
    note: "Missing from spec — suggested from ERP",
    changed: true,
  },
  {
    field: "Warranty",
    value: "10 years",
    source: "Published sheet rev B",
    note: "Missing from spec — reused from last sheet",
    changed: true,
  },
  {
    field: "Refrigerant charge",
    value: "6.5 lb",
    source: "spec rev C · §5",
    note: "OCR uncertain",
    changed: true,
  },
  {
    field: "Certifications",
    value: "AHRI 210/240 · UL 60335-2-40",
    source: "spec rev C · §10",
  },
];

function action(
  label: string,
  command: string,
  result: string,
  ms = 700,
): SubagentSpec["beats"][number] {
  return { kind: "action", label, command, result, ms };
}

function observe(text: string): SubagentSpec["beats"][number] {
  return { kind: "observe", text };
}

/** The three specialists the orchestrator launches after the initial scan. */
export const AUDIT_SUBAGENTS: SubagentSpec[] = [
  {
    id: "compliance",
    name: "Compliance agent",
    role: `Checks the draft against ${REFRIGERANT_YEAR} refrigerant rules and the ERP.`,
    icon: "compliance",
    alert: "compliance",
    beats: [
      action(
        "Reading refrigerant and electrical fields",
        "pdf.read('MAA-200_spec_revC.pdf')",
        "R-410A",
      ),
      action(
        `Loading the ${REFRIGERANT_YEAR} refrigerant ban`,
        `regulation.load('${REFRIGERANT_YEAR}_refrigerant_ban')`,
        "R-410A · R-32",
      ),
      action(
        "Matching the ERP bill of materials",
        "bom.match('MAA-200')",
        "1 product",
      ),
      action(
        "Checking shipped units and open orders",
        "sales.units('MAA-200')",
        "8,400 shipped",
      ),
      action(
        "Scanning the ACS product group",
        "group.scan('ACS')",
        "2 products",
      ),
      observe(
        `R-410A is banned from ${REFRIGERANT_DEADLINE_LABEL}. MAA-200 has 8,400 units shipped and 1,200 on open orders; NA-1500 adds 6,000 shipped and 900 open.`,
      ),
    ],
    finding: `MAA-200 and NA-1500 are exposed to the ${REFRIGERANT_YEAR} refrigerant ban.`,
  },
  {
    id: "manual",
    name: "Manuals & drawings agent",
    role: "Compares the draft to the installation manual and reference drawings.",
    icon: "manual",
    alert: "documentation",
    beats: [
      action(
        "Opening the installation manual",
        "vault.get('MAA-200_installation_revA.pdf')",
        "rev A",
      ),
      action(
        "Reading §7.2 control wiring",
        "manual.section('§7.2')",
        "2-wire",
      ),
      action(
        "Comparing to the drafted sheet",
        "diff(manual.wiring, draft.wiring)",
        "3-wire required",
      ),
      action(
        "Checking the reference drawings",
        "drawings.match('thermostat')",
        "2-wire diagram",
      ),
      observe(
        "The manual and drawing still show a two-wire connection; the spec rev C draft requires three wires.",
      ),
    ],
    finding: "Manual §7.2 contradicts the draft and spec rev C.",
  },
  {
    id: "datasheet",
    name: "Published data sheet agent",
    role: "Checks which published version customers currently see.",
    icon: "sheet",
    alert: "documentation",
    beats: [
      action(
        "Opening the published data sheet",
        "vault.get('MAA-200_datasheet_2019.pdf')",
        "rev B",
      ),
      action(
        "Comparing control wiring",
        "diff(published, spec)",
        "2-wire vs 3-wire",
      ),
      action(
        "Checking the revision history",
        "revision.history('MAA-200')",
        "2 revisions behind",
      ),
      observe(
        "The published rev B sheet is still the version customers see. It predates spec rev C and the draft rev D.",
      ),
    ],
    finding: "Customers still see rev B; the new draft is rev D.",
  },
];
