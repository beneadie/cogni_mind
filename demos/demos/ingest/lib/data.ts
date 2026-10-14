import type {
  CanonicalField,
  ClusterMember,
  DownstreamTool,
  MasterRow,
  PayoffQuery,
  PlanPhase,
  ReviewCase,
  SourceProfile,
  SystemSource,
  ValueStat,
} from "./types";

export const TOTAL_RECORDS = 3873;
export const TOTAL_SOURCES = 6;
export const CANONICAL_PARTS = 1500;

/** The systems the coding agents connect to. Each one explains a quirk. */
export const systems: SystemSource[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM · CPQ",
    method: "REST / SOQL · OAuth",
    file: "apex_air.csv",
    records: 761,
    note: "Clean export — snake_case columns, near-perfect.",
  },
  {
    id: "sap",
    name: "SAP S/4HANA",
    category: "ERP",
    method: "OData",
    file: "delta_mechanical.csv",
    records: 683,
    note: "Internal material codes, cryptic descriptions.",
  },
  {
    id: "epicor",
    name: "Epicor Eclipse",
    category: "Distribution ERP",
    method: "ODBC",
    file: "blackwell_refrigeration.csv",
    records: 630,
    note: "Attributes split into columns; superseded flags.",
  },
  {
    id: "as400",
    name: "AS/400 · DB2",
    category: "Legacy ERP",
    method: "Direct SQL",
    file: "northfield_hvac.csv",
    records: 708,
    note: "ALL-CAPS legacy fields, name over two lines.",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    category: "Files · Excel",
    method: "Graph API",
    file: "cascade_comfort.csv",
    records: 521,
    note: "A hand-kept workbook with free-text lead times.",
  },
  {
    id: "edi",
    name: "Supplier EDI 832",
    category: "Supplier feed",
    method: "SFTP / EDI",
    file: "summit_climate.csv",
    records: 570,
    note: "German, semicolon-delimited, EUR, comma decimals.",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    category: "ERP · Finance",
    method: "RESTlet",
    records: 0,
    note: "Linked for finance context.",
    extra: true,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM · Sales",
    method: "REST",
    records: 0,
    note: "Linked for customer context.",
    extra: true,
  },
];


export const sources: SourceProfile[] = [
  {
    file: "apex_air.csv",
    label: "Apex Air",
    rows: 761,
    cols: 21,
    delimiter: "comma",
    language: "English",
    currency: "USD",
    decimals: "dot",
    headers: "snake_case",
    quirks: ["clean columns", "has last_updated"],
  },
  {
    file: "delta_mechanical.csv",
    label: "Delta Mechanical",
    rows: 683,
    cols: 10,
    delimiter: "comma",
    language: "English",
    currency: "USD",
    decimals: "dot",
    headers: "Title_Case",
    quirks: ["cryptic descriptions", "shouted specs"],
  },
  {
    file: "northfield_hvac.csv",
    label: "Northfield HVAC",
    rows: 708,
    cols: 19,
    delimiter: "comma",
    language: "English",
    currency: "USD",
    decimals: "dot",
    headers: "ALL-CAPS",
    quirks: ["name split over 2 lines", "legacy contract codes"],
  },
  {
    file: "blackwell_refrigeration.csv",
    label: "Blackwell Refrigeration",
    rows: 630,
    cols: 18,
    delimiter: "comma",
    language: "English",
    currency: "USD",
    decimals: "dot",
    headers: "ALL-CAPS",
    quirks: ["attrs split into columns", "SUPERSEDED_BY present"],
  },
  {
    file: "cascade_comfort.csv",
    label: "Cascade Comfort",
    rows: 521,
    cols: 7,
    delimiter: "comma",
    language: "English",
    currency: "USD",
    decimals: "dot",
    headers: "lowercase",
    quirks: ["free-text lead times", "almost no specs"],
  },
  {
    file: "summit_climate.csv",
    label: "Summit Climate",
    rows: 570,
    cols: 18,
    delimiter: "semicolon",
    language: "German",
    currency: "EUR",
    decimals: "comma",
    headers: "Title_Case (German)",
    quirks: ["dimensions in mm", "customs tariff codes"],
  },
];

export const canonicalSchema: CanonicalField[] = [
  { field: "part_id", type: "string", note: "new canonical key (RP-…)", confidence: 1 },
  { field: "category", type: "enum", note: "normalized to a closed list", confidence: 0.98 },
  { field: "brand", type: "string", note: "manufacturer", confidence: 0.96 },
  { field: "specs", type: "map", note: "typed key=value (voltage, amps…)", confidence: 0.94 },
  { field: "unit_price_usd", type: "float", note: "FX-converted, per EA", confidence: 0.92 },
  { field: "stock_qty", type: "int", note: "summed across warehouses", confidence: 0.97 },
  { field: "supplier", type: "string", note: "fulfilling vendor", confidence: 0.99 },
  { field: "lead_time_days", type: "int", note: "parsed from free text", confidence: 0.88 },
  { field: "provenance", type: "list", note: "every source row that fed this", confidence: 1 },
];

/** The agent's plan, which visibly revises itself as it learns. */
export const plan: PlanPhase[] = [
  {
    id: "connect",
    title: "Connect",
    tasks: [
      { id: "c1", text: "Authenticate with each source system" },
      { id: "c2", text: "Pull every catalog into one raw landing zone" },
    ],
  },
  {
    id: "survey",
    title: "Survey",
    tasks: [
      { id: "s1", text: "List the incoming files" },
      { id: "s2", text: "Detect each source's dialect" },
    ],
  },
  {
    id: "understand",
    title: "Understand",
    tasks: [
      { id: "u1", text: "Randomly sample rows to verify meaning" },
      {
        id: "u2",
        text: "Translate & normalise the surface values",
        revisedFrom: "Assume the headers are honest",
      },
    ],
  },
  {
    id: "adapt",
    title: "Adapt",
    tasks: [
      {
        id: "a1",
        text: "Write one adapter per source",
        revisedFrom: "One parser for all six files",
      },
    ],
  },
  {
    id: "reconcile",
    title: "Reconcile",
    tasks: [
      { id: "r1", text: "Match records across sources" },
      { id: "r2", text: "Escalate low-confidence matches to a human" },
    ],
  },
  {
    id: "expand",
    title: "Deliver",
    tasks: [{ id: "e1", text: "Publish one queryable master" }],
  },
];

/** One real cluster: the 64 MFD / 370V start capacitor seen across all 6 files. */
export const capacitorMembers: ClusterMember[] = [
  {
    source: "apex_air.csv",
    rowId: "APX-100001",
    raw: "Start Capacitor, 64 MFD, 370V · Baltimo · $16.45",
    parsed: "capacitance=64, voltage=370",
  },
  {
    source: "delta_mechanical.csv",
    rowId: "4000001",
    raw: "CAP START 64MFD 370V · Proton Supply · $12.97",
    parsed: "capacitance=64, voltage=370",
  },
  {
    source: "northfield_hvac.csv",
    rowId: "NF00001",
    raw: "CAP START / 64 MFD 370V · Keystone · cost $10.83",
    parsed: "capacitance=64, voltage=370",
  },
  {
    source: "blackwell_refrigeration.csv",
    rowId: "BLK-000001",
    raw: "START CAPACITOR 64 MFD 370 VOLTS · VOLTS=370 · $13.54",
    parsed: "capacitance=64, voltage=370",
  },
  {
    source: "cascade_comfort.csv",
    rowId: "C0001",
    raw: "start capacitor 64 370v · Cascade Wholesale · $15.52",
    parsed: "capacitance=64, voltage=370",
  },
  {
    source: "summit_climate.csv",
    rowId: "SU-2024-00001",
    raw: "Anlaufkondensator – 64 µF, 370 V. Marke: Baltimo. · 17,14 EUR",
    parsed: "capacitance=64, voltage=370",
  },
];

export const sampleRows = [
  { source: "summit_climate.csv", text: "Anlaufkondensator – 64 µF, 370 V … 17,14 EUR" },
  { source: "summit_climate.csv", text: "Schütz – 30A, 3-polig, 24V coil … 59,48 EUR" },
  { source: "delta_mechanical.csv", text: "CAP START 64MFD 370V … 12.97 USD" },
];

export const germanVocab = [
  { term: "Anlaufkondensator", canonical: "Start Capacitor" },
  { term: "Betriebskondensator", canonical: "Run Capacitor" },
  { term: "Schütz", canonical: "Contactor" },
  { term: "Lüfterrad", canonical: "Fan Blade" },
  { term: "Flammenfühler", canonical: "Flame Sensor" },
  { term: "Kondensatorlüftermotor", canonical: "Condenser Fan Motor" },
  { term: "Kompressor", canonical: "Compressor" },
  { term: "Lager", canonical: "Bearing" },
  { term: "Klappe", canonical: "Damper" },
];

export const columnMapping: {
  source: string;
  pairs: { from: string; to: string }[];
}[] = [
  {
    source: "apex_air.csv",
    pairs: [
      { from: "part_id", to: "provenance" },
      { from: "manufacturer", to: "brand" },
      { from: "unit_price", to: "unit_price_usd" },
    ],
  },
  {
    source: "delta_mechanical.csv",
    pairs: [
      { from: "Material", to: "provenance" },
      { from: "Description", to: "specs" },
      { from: "List_Price", to: "unit_price_usd" },
    ],
  },
  {
    source: "northfield_hvac.csv",
    pairs: [
      { from: "STK_NO", to: "provenance" },
      { from: "NAME_LINE_1 + 2", to: "specs" },
      { from: "COST", to: "unit_price_usd" },
    ],
  },
  {
    source: "blackwell_refrigeration.csv",
    pairs: [
      { from: "ITEM_CODE", to: "provenance" },
      { from: "VOLTS / AMPS / HP", to: "specs" },
      { from: "UNIT_COST", to: "unit_price_usd" },
    ],
  },
  {
    source: "cascade_comfort.csv",
    pairs: [
      { from: "sku", to: "provenance" },
      { from: "product", to: "specs" },
      { from: "lead_time", to: "lead_time_days" },
    ],
  },
  {
    source: "summit_climate.csv",
    pairs: [
      { from: "SKU", to: "provenance" },
      { from: "Artikelbeschreibung", to: "specs" },
      { from: "Einzelpreis (EUR)", to: "unit_price_usd" },
    ],
  },
];

export const reviewCase: ReviewCase = {
  subject: {
    source: "cascade_comfort.csv",
    rowId: "C0412",
    text: "fan blade 18in 5 blade",
  },
  question:
    "Two parts share the size and blade count but differ by rotation, which this record omits. Which does it belong to?",
  candidates: [
    { id: "RP-000004", label: "Fan Blade · 18 in · 5 blades · CW", confidence: 0.62 },
    { id: "RP-005118", label: "Fan Blade · 18 in · 5 blades · CCW", confidence: 0.58 },
  ],
};

export const masterRows: MasterRow[] = [
  {
    id: "RP-000001",
    category: "Start Capacitor",
    brand: "Baltimo",
    specs: "capacitance=64, voltage=370",
    suppliers: 6,
    low: 12.97,
    high: 18.5,
    provenance: "6 rows · 6 files",
  },
  {
    id: "RP-000002",
    category: "Contactor",
    brand: "KlimaTech",
    specs: "amps=30, poles=3, coil_voltage=24",
    suppliers: 6,
    low: 30.1,
    high: 65.2,
    provenance: "6 rows · 6 files",
  },
  {
    id: "RP-000006",
    category: "Condenser Fan Motor",
    brand: "KlimaTech",
    specs: "horsepower=5, voltage=120, phase=3, rpm=825",
    suppliers: 4,
    low: 118.51,
    high: 166.9,
    provenance: "4 rows · 4 files",
  },
  {
    id: "RP-000008",
    category: "Compressor",
    brand: "Vortec",
    specs: "tonnage=3, voltage=230, refrigerant=R-22",
    suppliers: 3,
    low: 762.87,
    high: 1014.2,
    provenance: "3 rows · 3 files",
  },
  {
    id: "RP-01497",
    category: "Inducer Motor",
    brand: "Northwind",
    specs: "horsepower=3/4, voltage=240, rpm=1075",
    suppliers: 1,
    low: 289.0,
    high: 289.0,
    provenance: "1 row · 1 file",
  },
];

export const downstreamTools: DownstreamTool[] = [
  {
    id: "search",
    name: "Catalog search",
    blurb: "One search box across every supplier, by spec or plain English.",
  },
  {
    id: "procure",
    name: "Procurement copilot",
    blurb: "Compare like-for-like and buy the cheapest in-stock source.",
  },
  {
    id: "risk",
    name: "Supply-risk radar",
    blurb: "Surface single-sourced and stale parts before they become stockouts.",
  },
  {
    id: "watch",
    name: "Regulatory watch",
    blurb: "Flag parts a new regulation puts at risk, with the reason.",
  },
];

export const valueStats: ValueStat[] = [
  {
    key: "capability",
    label: "Capability",
    metric: "1 machine-readable master",
    detail:
      "The substrate every AI agent needs. Search, quoting, procurement, and risk — none of them run on six incompatible files.",
  },
  {
    key: "cost",
    label: "Cost",
    metric: "24% price spread surfaced",
    detail:
      "The same 64 MFD/370V capacitor costs $12.97 at Delta and $17.14 at Summit. Only a harmonized master makes like-for-like buying possible.",
  },
  {
    key: "speed",
    label: "Speed",
    metric: "6 schemas in 42 seconds",
    detail:
      "Vendor onboarding drops from weeks of schema mapping to a single run — and the agent adapts to whatever new format arrives.",
  },
  {
    key: "quality",
    label: "Quality",
    metric: "3,873 → 1,500 parts",
    detail:
      "Deduplicated to one canonical part with full provenance and a confidence score on every match. One source of truth, with a paper trail.",
  },
];

export const payoffQueries: PayoffQuery[] = [
  {
    id: "cheapest",
    question: "Cheapest source for a 64 MFD / 370V start capacitor?",
    answer: "Delta Mechanical — $12.97 / EA",
    detail:
      "Matched across 6 catalogs · 24% below Summit’s $17.14 equivalent · in stock.",
  },
  {
    id: "risk",
    question: "Which parts are single-sourced (supply risk)?",
    answer: "32 parts, including RP-01497",
    detail:
      "Inducer Motor · 3/4 hp · 240V — appears in one catalog only. Flag before it becomes a stockout.",
  },
  {
    id: "describe",
    question: "Find “3-pole, 30-amp contactor, 24-volt coil”",
    answer: "RP-000002 — matched",
    detail:
      "Resolved to KlimaTech from plain-English. 6 source rows, $30.10–$65.20 across vendors.",
  },
];
