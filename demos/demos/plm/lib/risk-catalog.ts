import {
  CHROME_DEADLINE_LABEL,
  CHROME_YEAR,
  REFRIGERANT_DEADLINE_LABEL,
  REFRIGERANT_YEAR,
  ROHS_YEAR,
} from "./dates";
import type { RegulationRiskRow } from "./types";

export type RiskGroup = "acs" | "dl";

export type RiskProduct = RegulationRiskRow & { group: RiskGroup };

/**
 * One list of products exposed to an upcoming restriction.
 * `acs` = the cross-company refrigerant group surfaced by the Product Care
 * inbox; `dl` = the DL Series portfolio surfaced by the Ask-side scan.
 * Figures are mocked; no revenue is stated — only units shipped and open
 * orders, which are ordinary ERP facts.
 */
export const riskProducts: RiskProduct[] = [
  {
    product: "MAA-200",
    group: "acs",
    company: "Marvair",
    substance: "R-410A",
    regulation: `${REFRIGERANT_YEAR} Refrigerant Ban`,
    deadline: REFRIGERANT_DEADLINE_LABEL,
    risk: "High",
    reason: `Uses R-410A, banned from ${REFRIGERANT_YEAR}`,
    unitsShipped: "8,400",
    unitsShippedValue: 8400,
    openOrders: "1,200",
    openOrdersValue: 1200,
    owner: "J. Alvarez",
  },
  {
    product: "NA-1500",
    group: "acs",
    company: "Northern Air",
    substance: "R-410A",
    regulation: `${REFRIGERANT_YEAR} Refrigerant Ban`,
    deadline: REFRIGERANT_DEADLINE_LABEL,
    risk: "High",
    reason: `Uses R-410A, banned from ${REFRIGERANT_YEAR}`,
    unitsShipped: "6,000",
    unitsShippedValue: 6000,
    openOrders: "900",
    openOrdersValue: 900,
    owner: "M. Okafor",
  },
  {
    product: "DL-2400",
    group: "dl",
    company: "Above Air",
    substance: "Lead (Pb)",
    regulation: `RoHS ${ROHS_YEAR}`,
    deadline: REFRIGERANT_DEADLINE_LABEL,
    risk: "High",
    reason: "Lead in C36000 brass body",
    unitsShipped: "5,200",
    unitsShippedValue: 5200,
    openOrders: "780",
    openOrdersValue: 780,
    owner: "R. Patel",
  },
  {
    product: "DL-1800",
    group: "dl",
    company: "Above Air",
    substance: "Chromium (Cr6)",
    regulation: `EU Chrome Restriction ${CHROME_YEAR}`,
    deadline: CHROME_DEADLINE_LABEL,
    risk: "High",
    reason: "Chrome finish detected",
    unitsShipped: "3,900",
    unitsShippedValue: 3900,
    openOrders: "410",
    openOrdersValue: 410,
    owner: "S. Nguyen",
  },
  {
    product: "DL-3200",
    group: "dl",
    company: "Above Air",
    substance: "Lead (Pb)",
    regulation: `RoHS ${ROHS_YEAR}`,
    deadline: REFRIGERANT_DEADLINE_LABEL,
    risk: "Medium",
    reason: "Lead content above threshold",
    unitsShipped: "2,100",
    unitsShippedValue: 2100,
    openOrders: "260",
    openOrdersValue: 260,
    owner: "R. Patel",
  },
  {
    product: "DL-2200",
    group: "dl",
    company: "Above Air",
    substance: "Chromium (Cr6)",
    regulation: `EU Chrome Restriction ${CHROME_YEAR}`,
    deadline: CHROME_DEADLINE_LABEL,
    risk: "Medium",
    reason: "Chrome in strike plate",
    unitsShipped: "1,400",
    unitsShippedValue: 1400,
    openOrders: "180",
    openOrdersValue: 180,
    owner: "S. Nguyen",
  },
  {
    product: "DL-1500",
    group: "dl",
    company: "Above Air",
    substance: "Lead (Pb)",
    regulation: `RoHS ${ROHS_YEAR}`,
    deadline: REFRIGERANT_DEADLINE_LABEL,
    risk: "Low",
    reason: "No restricted substances",
    unitsShipped: "600",
    unitsShippedValue: 600,
    openOrders: "40",
    openOrdersValue: 40,
    owner: "R. Patel",
  },
  {
    product: "DL-900",
    group: "dl",
    company: "Above Air",
    substance: "Chromium (Cr6)",
    regulation: `EU Chrome Restriction ${CHROME_YEAR}`,
    deadline: CHROME_DEADLINE_LABEL,
    risk: "Low",
    reason: "Discontinued",
    unitsShipped: "0",
    unitsShippedValue: 0,
    openOrders: "0",
    openOrdersValue: 0,
    owner: "S. Nguyen",
  },
];

export const acsRiskProducts: RiskProduct[] = riskProducts.filter(
  (product) => product.group === "acs",
);

export const dlRiskProducts: RiskProduct[] = riskProducts.filter(
  (product) => product.group === "dl",
);

/** Look up a risk record for any product, on either surface. */
export function riskRecord(productId: string): RiskProduct | undefined {
  return riskProducts.find((product) => product.product === productId);
}

/** A record dropped into the workspace when a product is opened. */
export type DossierDoc = {
  id: string;
  title: string;
  meta: string;
  status?: string;
  tone?: "online" | "danger" | "muted";
  /** Product the record belongs to, used to group the workspace. */
  group: string;
  /** Mock PDF to open for this record, if one exists. */
  pdfId?: string;
  page?: number;
};

/** Controlled documents we can actually open for a product. */
const dossierFiles: Record<string, DossierDoc[]> = {
  "MAA-200": [
    {
      id: "MAA-200-spec",
      title: "MAA-200 engineering spec",
      meta: "rev C · §7.2 wiring",
      group: "MAA-200",
      pdfId: "maa-200-spec",
      page: 3,
    },
    {
      id: "MAA-200-datasheet",
      title: "MAA-200 data sheet",
      meta: "Published · rev B",
      group: "MAA-200",
      pdfId: "maa-200-datasheet",
      page: 1,
    },
    {
      id: "MAA-200-manual",
      title: "MAA-200 installation manual",
      meta: "rev A · §7.2 wiring",
      group: "MAA-200",
      pdfId: "maa-200-manual",
      page: 14,
    },
  ],
  "DL-2400": [
    {
      id: "DL-2400-spec",
      title: "DL-2400 engineering spec",
      meta: "rev C · §2.1 materials",
      group: "DL-2400",
      pdfId: "dl-2400-spec",
      page: 1,
    },
    {
      id: "DL-2400-datasheet",
      title: "DL-2400 data sheet",
      meta: "Published · rev B",
      group: "DL-2400",
      pdfId: "dl-2400-datasheet",
      page: 1,
    },
    {
      id: "DL-2400-manual",
      title: "DL-2400 installation manual",
      meta: "rev C",
      group: "DL-2400",
      pdfId: "dl-2400-manual",
      page: 4,
    },
  ],
};

function dossierFor(product: RiskProduct): DossierDoc[] {
  const id = product.product;
  const records: DossierDoc[] = [
    {
      id: `${id}-master`,
      title: `${id} · product record`,
      meta: "SAP S/4HANA · live record",
      group: id,
    },
    {
      id: `${id}-bom`,
      title: `${id} · parts list`,
      meta: "SAP S/4HANA · 14 components",
      group: id,
    },
    {
      id: `${id}-fmd`,
      title: `${id} · material declaration`,
      meta: `Material declaration · ${product.substance ?? "—"}`,
      status: "On file",
      tone: "muted",
      group: id,
    },
    {
      id: `${id}-sales`,
      title: `${id} · units shipped & open orders`,
      meta: `ERP · ${product.unitsShipped} shipped · ${product.openOrders} open`,
      group: id,
    },
    {
      id: `${id}-compliance`,
      title: `${id} · compliance file`,
      meta: `${product.regulation} · due ${product.deadline ?? "—"}`,
      status: "Open",
      tone: "danger",
      group: id,
    },
    ...(dossierFiles[id] ?? []),
    {
      id: `${id}-cases`,
      title: `${id} · open field cases`,
      meta: "Support · 2 open",
      group: id,
    },
  ];
  return records;
}

/** Everything we have on file for each product, keyed by product id. */
export const productDossiers: Record<string, DossierDoc[]> = Object.fromEntries(
  riskProducts.map((product) => [product.product, dossierFor(product)]),
);
