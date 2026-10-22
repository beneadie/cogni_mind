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

/** The inbox starts empty. Alerts are created by the spec audit. */
export const INITIAL_QUEUE: QueueItem[] = [];

/** Created when the compliance subagent discovers the refrigerant exposure. */
export const COMPLIANCE_ALERT_ITEM: QueueItem = {
  id: "compliance-alert",
  severity: "red",
  type: "Compliance alert",
  scope: "MAA-200",
  summary: "Uses R-410A, banned from 2027 — 8,400 shipped, 1,200 open",
  action: "Review",
  status: "open",
};

/** Created when the manual and published-sheet subagents compare wiring. */
export const DOCUMENTATION_ALERT_ITEM: QueueItem = {
  id: "documentation-mismatch",
  severity: "amber",
  type: "Documentation mismatch",
  scope: "MAA-200",
  summary: "New sheet requires 3-wire; manual §7.2 and published sheet show 2-wire",
  action: "Review",
  status: "open",
};

/** Injected when the documentation mismatch resolves, to show the cascade. */
export const PROPAGATION_ITEM: QueueItem = {
  id: "propagation",
  severity: "amber",
  type: "Document updates",
  scope: "MAA-200",
  summary: "3 documents need the §7.2 update",
  action: "Review",
  status: "open",
};

export const fieldReportChange: DocChange = {
  document: "MAA-200 Installation Manual",
  section: "§7.2 Wiring",
  currentManual: "2-wire diagram (rev A, 2019)",
  currentSpec: "3-wire (rev C, 2023)",
  reportedBy: "Detected by the data-sheet audit · MAA-200",
  warning: "The drafted data sheet and spec rev C contradict the manual.",
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

/** Documents affected by the §7.2 change, each owned by a team. */
export const impactRows: ImpactRow[] = [
  {
    document: "MAA-200 Product Page",
    type: "Web",
    trigger: "§7.2 wiring",
    owner: "Web team",
    status: "Proposal ready",
    diff: maa200ProductPageDiff,
  },
  {
    document: "MAA-200 Sell Sheet",
    type: "Web",
    trigger: "§7.2 wiring",
    owner: "Web team",
    status: "Proposal ready",
    diff: maa200SellSheetDiff,
  },
  {
    document: "MAA-200 Data Sheet",
    type: "Data sheet",
    trigger: "§7.2 wiring",
    owner: "Docs team",
    status: "Proposal ready",
    pdfId: "maa-200-datasheet",
    page: 1,
    diff: maa200DataSheetDiff,
  },
];

/** The regulation's compliance deadline, used for reminders and change requests. */
export const BAN_EFFECTIVE = "1 Jan 2027";
export const REVIEW_DATE = "1 Sep 2026";
