import type { DocChange, ImpactRow, QueueItem } from "./types";

export { acsRiskProducts as complianceProducts } from "./risk-catalog";
import {
  maa200DataSheetDiff,
  maa200ProductPageDiff,
  maa200SellSheetDiff,
  maa200WiringDiff,
} from "./demoData";

/**
 * Brand names are mocked. Swap these labels in one place if the demo needs a
 * different set of companies.
 */
export const ACS_GROUP = "ACS Group";

export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "field-report",
    severity: "red",
    type: "Field report",
    scope: "MAA-200",
    summary: "Wiring diagram on §7.2 doesn't match the unit",
    action: "Review",
    status: "open",
  },
  {
    id: "compliance-alert",
    severity: "amber",
    type: "Compliance alert",
    scope: ACS_GROUP,
    summary: "2 products exposed to the 2027 refrigerant ban",
    action: "Review",
    status: "open",
  },
];

/** Injected when the field report resolves, to show the change cascade. */
export const PROPAGATION_ITEM: QueueItem = {
  id: "propagation",
  severity: "amber",
  type: "Change propagation",
  scope: "MAA-200",
  summary: "§7.2 change leaves 3 documents stale",
  action: "Review",
  status: "open",
};

export const ECN_ID = "ECN-2026-0088";

export const fieldReportChange: DocChange = {
  document: "MAA-200 Installation Manual",
  section: "§7.2 Wiring",
  currentManual: "2-wire diagram (rev A, 2019)",
  currentSpec: "3-wire (rev C, 2023)",
  reportedBy: "Field technician · case CS-4821",
  warning: "Manual contradicts the released spec.",
  proposed:
    "Update §7.2 to show the 3-wire configuration, matching spec rev C.",
  ecrId: "ECR-2026-0142",
  whereUsed: 3,
  redline: {
    from: "§7.2 Wiring — 2-wire diagram (rev A)",
    to: "§7.2 Wiring — 3-wire diagram (rev C)",
  },
  diff: maa200WiringDiff,
};

/** Where-used impact of the §7.2 change, with a disposition per document. */
export const impactRows: ImpactRow[] = [
  {
    document: "MAA-200 Product Page",
    type: "Web",
    trigger: "§7.2 wiring",
    disposition: "auto",
    owner: "Web team",
    status: "Auto-update ready",
    diff: maa200ProductPageDiff,
  },
  {
    document: "MAA-200 Sell Sheet",
    type: "Web",
    trigger: "§7.2 wiring",
    disposition: "auto",
    owner: "Web team",
    status: "Auto-update ready",
    diff: maa200SellSheetDiff,
  },
  {
    document: "MAA-200 Data Sheet",
    type: "Data sheet",
    trigger: "§7.2 wiring",
    disposition: "author",
    owner: "Docs team",
    status: "Needs authoring",
    pdfId: "maa-200-datasheet",
    page: 1,
    diff: maa200DataSheetDiff,
  },
];

/** The regulation's compliance deadline, used for reminders and change requests. */
export const BAN_EFFECTIVE = "1 Jan 2027";
export const REVIEW_DATE = "1 Sep 2026";
