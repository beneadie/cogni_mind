import type {
  AffectedDocumentRow,
  ChangeSummary,
  DataSheetRow,
  DocHealthRow,
  FlagDetail,
  LegacyPartRow,
  ManualDraftRow,
  RegulationRiskRow,
  SpecDoc,
  TemplateField,
  UnmappedAttribute,
  WalkthroughStep,
} from "./types";

export const SPEC_FILE_NAME = "DL-2400_revC.pdf";
export const SPEC_PAGES = 12;
export const SPEC_SIZE = "3.4 MB";

/** Left panel — a lean scan of the spec, line by line, with stable ids. */
export const specDoc: SpecDoc = {
  title: "DL-2400 HEAVY-DUTY BRASS DOOR LATCH",
  revision: "Revision C",
  date: "1987-03-12",
  file: SPEC_FILE_NAME,
  sections: [
    {
      id: "sec-materials",
      heading: "§2.1 MATERIALS",
      page: 1,
      lines: [
        { id: "mat-body", text: "Latch body: forged brass, alloy C36000" },
        { id: "mat-springs", text: "Springs: phosphor bronze" },
      ],
    },
    {
      id: "sec-dimensions",
      heading: "§3.2 DIMENSIONS",
      page: 2,
      lines: [
        { id: "dim-length", text: "Overall length: 4.5 in" },
        { id: "dim-backset", text: "Backset: 2.375 in" },
        { id: "dim-throw", text: "Throw: 0.75 in" },
      ],
    },
    {
      id: "sec-performance",
      heading: "§5.1 PERFORMANCE",
      page: 3,
      lines: [
        { id: "perf-cycles", text: "Cycle rating: 500,000 cycles minimum" },
        {
          id: "perf-corrosion",
          text: "Corrosion resistance: 96 hours salt spray",
        },
      ],
    },
    {
      id: "sec-notes",
      heading: "§7 NOTES",
      page: 4,
      lines: [
        { id: "note-finish", text: "Finish: US3 polished brass" },
        { id: "note-cert", text: "Certifications: ANSI/BHMA A156.13 Grade 1" },
      ],
    },
  ],
};

export const specTitleLineId = "spec-title";

const SRC = {
  title: { label: "revC title", section: "Title block", page: 1 },
  materials: { label: "revC §2.1", section: "§2.1 Materials", page: 1 },
  dimensions: { label: "revC §3.2", section: "§3.2 Dimensions", page: 2 },
  performance: { label: "revC §5.1", section: "§5.1 Performance", page: 3 },
  notes: { label: "revC §7", section: "§7 Notes", page: 4 },
};

/** Right panel — the extracted data sheet with state + provenance per row. */
export const dataSheetRows: DataSheetRow[] = [
  { id: "model", field: "Model Number", value: "DL-2400", state: "extracted", sourceLineIds: [specTitleLineId], source: SRC.title },
  { id: "type", field: "Product Type", value: "Door Latch", state: "extracted", note: "Derived from template" },
  { id: "mat-body", field: "Material (Body)", value: "Forged Brass, C36000", state: "extracted", sourceLineIds: ["mat-body"], source: SRC.materials },
  { id: "finish", field: "Finish", value: "US3 Polished Brass", state: "extracted", sourceLineIds: ["note-finish"], source: SRC.notes },
  { id: "length", field: "Overall Length", value: "4.5 in", state: "extracted", sourceLineIds: ["dim-length"], source: SRC.dimensions },
  { id: "throw", field: "Throw", value: "0.75 in", state: "conflict", sourceLineIds: ["dim-throw"], source: SRC.dimensions, flagId: "throw", note: "Published sheet says 0.625 in" },
  { id: "cycles", field: "Cycle Rating", value: "500,000 cycles", state: "low-confidence", sourceLineIds: ["perf-cycles"], source: SRC.performance, confidence: 0.62, flagId: "cycles", note: "OCR may have dropped a zero" },
  { id: "corrosion", field: "Corrosion Resistance", value: "96 hrs salt spray", state: "extracted", sourceLineIds: ["perf-corrosion"], source: SRC.performance },
  { id: "cert", field: "Certification", value: "ANSI/BHMA A156.13 Gr 1", state: "extracted", sourceLineIds: ["note-cert"], source: SRC.notes },
  { id: "weight", field: "Weight", value: "—", state: "missing", flagId: "weight" },
  { id: "fire", field: "Fire Rating", value: "—", state: "missing", flagId: "fire" },
  { id: "warranty", field: "Warranty", value: "10 years", state: "carried-over", flagId: "warranty", note: "Not stated in the spec" },
];

/** Fields the data sheet template expects. */
export const templateFields: TemplateField[] = [
  { field: "Model Number", required: true },
  { field: "Product Type", required: true },
  { field: "Material (Body)", required: true },
  { field: "Finish", required: true },
  { field: "Overall Length", required: true },
  { field: "Throw", required: true },
  { field: "Cycle Rating", required: true },
  { field: "Corrosion Resistance", required: true },
  { field: "Certification", required: true },
  { field: "Weight", required: true },
  { field: "Fire Rating", required: true },
  { field: "Warranty", required: true },
];

/** Attributes found in the spec that don't map to a template field. */
export const unmappedAttributes: UnmappedAttribute[] = [
  { attribute: "Springs: phosphor bronze", sourceLineId: "mat-springs" },
  { attribute: "Backset: 2.375 in", sourceLineId: "dim-backset" },
];

/** Screen: flag detail drawer, keyed by flagId. */
export const flagDetails: Record<string, FlagDetail> = {
  weight: {
    id: "weight",
    kind: "missing",
    field: "Weight",
    body: "This field is required in the data sheet template, but no value was found in the engineering spec.",
    sources: [
      "ERP material master (last updated 2023)",
      "Previous data sheet (2019) — says 1.2 lbs",
      "CAD file metadata",
    ],
    actions: [
      { label: "Enter value", primary: true },
      { label: "Mark N/A" },
      { label: "Defer", outcome: "defer" },
    ],
  },
  fire: {
    id: "fire",
    kind: "missing",
    field: "Fire Rating",
    body: "This field is required in the data sheet template, but no value was found in the engineering spec.",
    sources: [
      "Certification records",
      "Previous data sheet — no value found",
      "ANSI/BHMA test reports",
    ],
    actions: [
      { label: "Enter value", primary: true },
      { label: "Mark N/A" },
      { label: "Defer", outcome: "defer" },
    ],
  },
  throw: {
    id: "throw",
    kind: "conflict",
    field: "Throw",
    body: "The spec and the published data sheet disagree. Decide which value is authoritative.",
    published: {
      value: "0.625 in",
      source: "DL-2400_datasheet_2019.pdf, p.1 §3.2",
    },
    spec: {
      value: "0.75 in",
      source: "DL-2400_revC.pdf, §3.2 p.2",
    },
    actions: [
      { label: "Keep spec (0.75 in)", primary: true },
      { label: "Keep published (0.625 in)" },
      { label: "Enter value" },
      { label: "Defer", outcome: "defer" },
    ],
  },
  cycles: {
    id: "cycles",
    kind: "low-confidence",
    field: "Cycle Rating",
    body: "The scan is low quality. The extraction is uncertain — confirm the value before publishing.",
    candidates: [
      { value: "500,000 cycles", confidence: 0.62, source: "revC §5.1 p.3" },
      { value: "50,000 cycles", confidence: 0.31, source: "OCR alternate read" },
      { value: "5,000,000 cycles", confidence: 0.07, source: "OCR alternate read" },
    ],
    actions: [
      { label: "Confirm 500,000", primary: true },
      { label: "Use 50,000" },
      { label: "Enter value" },
      { label: "Defer", outcome: "defer" },
    ],
  },
  warranty: {
    id: "warranty",
    kind: "carried-over",
    field: "Warranty",
    body: "The spec does not mention warranty. The published data sheet carries a value. Confirm whether it still applies.",
    published: {
      value: "10 years",
      source: "DL-2400_datasheet_2019.pdf, p.2",
    },
    actions: [
      { label: "Keep 10 years", primary: true },
      { label: "Enter new value" },
      { label: "Defer", outcome: "defer" },
    ],
  },
  "throw-manual": {
    id: "throw-manual",
    kind: "manual-change",
    changeType: "changed",
    field: "Latch Throw",
    body: "The spec revision changes the latch throw. The installation manual still documents the old value.",
    from: { value: "0.625 in", source: "Rev A §3 Install Latch, p.6" },
    to: { value: "0.75 in", source: "DL-2400_revC §3.2" },
    actions: [
      { label: "Accept change", primary: true },
      { label: "Keep old value" },
      { label: "Edit", outcome: "defer" },
    ],
  },
  "strike-manual": {
    id: "strike-manual",
    kind: "manual-change",
    changeType: "changed",
    field: "Strike Plate",
    body: "The strike opening must be widened to match the new throw.",
    from: { value: "Standard strike opening", source: "Rev A §4 Strike Plate, p.7" },
    to: { value: "Widened to 0.75 in throw", source: "DL-2400_revC §3.2" },
    actions: [
      { label: "Accept change", primary: true },
      { label: "Keep old value" },
      { label: "Edit", outcome: "defer" },
    ],
  },
  "adjust-added": {
    id: "adjust-added",
    kind: "manual-change",
    changeType: "added",
    field: "Throw Adjustment",
    body: "A new adjustment step is drafted to set the throw after installation.",
    to: { value: "Rotate the cam to set throw", source: "DL-2400_revC §3.2" },
    actions: [
      { label: "Accept addition", primary: true },
      { label: "Remove" },
      { label: "Edit", outcome: "defer" },
    ],
  },
  "torque-removed": {
    id: "torque-removed",
    kind: "manual-change",
    changeType: "removed",
    field: "Torque Spec (legacy)",
    body: "The legacy torque step is superseded by the rev C fastener spec and can be removed.",
    from: { value: "Torque fasteners to 15 in-lb", source: "Rev A §6 Fasteners, p.9" },
    actions: [
      { label: "Accept removal", primary: true },
      { label: "Keep step" },
      { label: "Edit", outcome: "defer" },
    ],
  },
};

export const walkthroughSteps: WalkthroughStep[] = [
  { id: "ingest", label: "Ingest" },
  { id: "extract", label: "Extract & Verify" },
  { id: "resolve", label: "Resolve" },
  { id: "approve", label: "Approve" },
  { id: "propagate", label: "Propagate" },
];

/** What changed once the operator resolved the exceptions. */
export const approvedChanges: ChangeSummary[] = [
  { field: "Weight", from: "—", to: "1.2 lbs", kind: "set" },
  { field: "Throw", from: "0.625 in (published)", to: "0.75 in", kind: "changed" },
  { field: "Cycle Rating", from: "500,000 cycles", to: "500,000 cycles", kind: "confirmed" },
  { field: "Warranty", from: "10 years", to: "10 years", kind: "kept" },
  { field: "Fire Rating", from: "—", to: "N/A", kind: "set" },
];

export const legacyQuery = "brass latch 2-3/8 backset 1980s";

/** Detour — sorted by annual revenue descending by default. */
export const regulationRisks: RegulationRiskRow[] = [
  { product: "DL-2400", regulation: "RoHS 2027", risk: "High", reason: "Lead in C36000 brass body", annualRevenue: "$1.2M", annualRevenueValue: 1200000 },
  { product: "DL-1800", regulation: "EU Chrome Restriction 2026", risk: "High", reason: "Chrome finish detected", annualRevenue: "$890K", annualRevenueValue: 890000 },
  { product: "DL-3200", regulation: "RoHS 2027", risk: "Medium", reason: "Lead content above threshold", annualRevenue: "$450K", annualRevenueValue: 450000 },
  { product: "DL-2200", regulation: "EU Chrome Restriction 2026", risk: "Medium", reason: "Chrome in strike plate", annualRevenue: "$310K", annualRevenueValue: 310000 },
  { product: "DL-1500", regulation: "RoHS 2027", risk: "Low", reason: "No restricted substances", annualRevenue: "$120K", annualRevenueValue: 120000 },
  { product: "DL-900", regulation: "EU Chrome Restriction 2026", risk: "Low", reason: "Discontinued", annualRevenue: "$0", annualRevenueValue: 0 },
];

export const legacyParts: LegacyPartRow[] = [
  { partNumber: "DL-2400", description: 'Heavy-Duty Brass Door Latch, 2-3/8" backset', matchPct: 96, year: "1987", matchedOn: ["material=brass", "backset 2.375 in", "1980s"] },
  { partNumber: "DL-2150", description: 'Brass Door Latch, 1-3/4" backset', matchPct: 84, year: "1982", matchedOn: ["material=brass", "backset 1.75 in", "1980s"] },
  { partNumber: "BL-400", description: 'Brass Latch Assembly, 2" backset', matchPct: 71, year: "1979", matchedOn: ["material=brass", "backset ≈2 in", "late 1970s"] },
];

/** Detour — documents made stale by the approved change. */
export const affectedDocuments: AffectedDocumentRow[] = [
  { document: "DL-2400 Installation Manual", type: "Manual", lastUpdated: "2019-06", status: "needs-update", trigger: "Throw dimension" },
  { document: "DL-2400 Product Page", type: "Web", lastUpdated: "2021-02", status: "needs-update", trigger: "Throw · Weight" },
  { document: "DL-2400 Data Sheet", type: "Data Sheet", lastUpdated: "2019-06", status: "needs-update", trigger: "Throw · Weight · Warranty" },
  { document: "DL-2400 Sell Sheet", type: "Web", lastUpdated: "2020-11", status: "needs-update", trigger: "Throw dimension" },
  { document: "DL Series Catalog", type: "Manual", lastUpdated: "2018-09", status: "needs-update", trigger: "Weight" },
  { document: "DL-2400 FAQ", type: "Web", lastUpdated: "2022-04", status: "review", trigger: "Warranty wording" },
];

/* ------------------------------------------------------------------ */
/* Flow B — Documentation Health / Manual Update                       */
/* ------------------------------------------------------------------ */

export const flowSteps: Record<"spec" | "docs", WalkthroughStep[]> = {
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
};

/** The document this flow remediates. Publishing flips it to current. */
export const manualTargetDocId = "install";

export const docHealthRows: DocHealthRow[] = [
  { id: "install", document: "DL-2400 Installation Manual", type: "Manual", lastUpdated: "2019-06", status: "out-of-date", revisionsBehind: 4 },
  { id: "product", document: "DL-2400 Product Page", type: "Web", lastUpdated: "2021-02", status: "out-of-date", revisionsBehind: 2 },
  { id: "sell", document: "DL-2400 Sell Sheet", type: "Web", lastUpdated: "2020-11", status: "out-of-date", revisionsBehind: 1 },
  { id: "datasheet", document: "DL-2400 Data Sheet", type: "Data Sheet", lastUpdated: "2025-01", status: "current", revisionsBehind: 0 },
  { id: "legacy", document: "DL-900 Legacy Datasheet", type: "Data Sheet", lastUpdated: "2011-03", status: "archived", revisionsBehind: 0 },
];

/** Left panel of the manual draft — the old manual, mapped line by line. */
export const manualCurrentContent: SpecDoc = {
  title: "DL-2400 INSTALLATION MANUAL",
  revision: "Revision A",
  date: "2019-06",
  file: "DL-2400_installation_2019.pdf",
  sections: [
    {
      id: "man-tools",
      heading: "§1 TOOLS REQUIRED",
      page: 4,
      lines: [
        { id: "man-tools-1", text: "Drill with 1 in spade bit" },
        { id: "man-tools-2", text: "Phillips screwdriver" },
      ],
    },
    {
      id: "man-rough",
      heading: "§2 ROUGH OPENING",
      page: 5,
      lines: [
        { id: "man-rough-1", text: "Backset: 2-3/8 in (60 mm)" },
        { id: "man-rough-2", text: "Bore diameter: 2-1/8 in (54 mm)" },
      ],
    },
    {
      id: "man-install",
      heading: "§3 INSTALL LATCH",
      page: 6,
      lines: [
        { id: "man-install-1", text: "Insert the latch into the bore." },
        { id: "man-install-2", text: "Throw: 0.625 in standard." },
      ],
    },
    {
      id: "man-strike",
      heading: "§4 STRIKE PLATE",
      page: 7,
      lines: [{ id: "man-strike-1", text: "Align the strike with the latch bolt." }],
    },
    {
      id: "man-fasteners",
      heading: "§6 FASTENERS",
      page: 9,
      lines: [{ id: "man-fasteners-1", text: "Torque fasteners to 15 in-lb." }],
    },
  ],
};

const MSRC = {
  tools: { label: "Rev A §1", section: "§1 Tools Required", page: 4 },
  rough: { label: "Rev A §2", section: "§2 Rough Opening", page: 5 },
  install: { label: "Rev A §3", section: "§3 Install Latch", page: 6 },
  strike: { label: "Rev A §4", section: "§4 Strike Plate", page: 7 },
  spec: { label: "revC §3.2", section: "§3.2 Dimensions", page: 2 },
};

/** Right panel of the manual draft — the revised sections with change flags. */
export const manualDraftRows: ManualDraftRow[] = [
  { id: "d-tools", field: "Tools Required", value: "No change", state: "unchanged", sourceLineIds: ["man-tools-1"], source: MSRC.tools },
  { id: "d-rough", field: "Rough Opening", value: "Backset 2-3/8 in · bore 2-1/8 in", state: "unchanged", sourceLineIds: ["man-rough-1", "man-rough-2"], source: MSRC.rough },
  { id: "d-throw", field: "Latch Throw", value: "0.75 in (was 0.625 in)", state: "changed", sourceLineIds: ["man-install-2"], source: MSRC.spec, flagId: "throw-manual", note: "Spec §3.2" },
  { id: "d-strike", field: "Strike Plate", value: "Widened to match 0.75 in throw", state: "changed", sourceLineIds: ["man-strike-1"], source: MSRC.spec, flagId: "strike-manual", note: "Spec §3.2" },
  { id: "d-adjust", field: "Throw Adjustment", value: "New: rotate cam to set throw", state: "added", source: MSRC.spec, flagId: "adjust-added", note: "New section" },
  { id: "d-torque", field: "Torque Spec (legacy)", value: "Removed — superseded", state: "removed", sourceLineIds: ["man-fasteners-1"], source: MSRC.strike, flagId: "torque-removed", note: "Legacy step" },
];

/** Publish confirmation summary. */
export const manualChangeSummary: ChangeSummary[] = [
  { field: "Latch Throw", from: "0.625 in", to: "0.75 in", kind: "changed" },
  { field: "Strike Plate", from: "Standard opening", to: "Widened", kind: "changed" },
  { field: "Throw Adjustment", from: "—", to: "New step", kind: "set" },
  { field: "Torque Spec", from: "15 in-lb", to: "Removed", kind: "set" },
];
