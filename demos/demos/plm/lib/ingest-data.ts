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
  file?: string;
  records: number;
  note: string;
  extra?: boolean;
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

export type ReviewCandidate = { id: string; label: string; confidence: number };

export type ReviewCase = {
  subject: { source: string; rowId: string; text: string };
  question: string;
  candidates: ReviewCandidate[];
};

export const TOTAL_RECORDS = 3873;
export const CANONICAL_PARTS = 1500;

/** The systems the agent connects to. Each one explains a quirk. */
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

export const germanVocab = [
  { term: "Anlaufkondensator", canonical: "Start Capacitor" },
  { term: "Betriebskondensator", canonical: "Run Capacitor" },
  { term: "Schütz", canonical: "Contactor" },
  { term: "Lüfterrad", canonical: "Fan Blade" },
  { term: "Flammenfühler", canonical: "Flame Sensor" },
  { term: "Kompressor", canonical: "Compressor" },
  { term: "Lager", canonical: "Bearing" },
  { term: "Klappe", canonical: "Damper" },
];

export const formatTraps = [
  "Category vocabulary is German — Schütz is a Contactor.",
  "Decimals are commas, dimensions in mm, prices in EUR.",
  "µF, MFD and “micro-farad” are the same unit.",
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
