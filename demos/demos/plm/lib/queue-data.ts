import {
  CURRENT_YEAR,
  REFRIGERANT_DEADLINE_LABEL,
  REFRIGERANT_YEAR,
  REVIEW_DATE_LABEL,
} from "./dates";
import type { DocChange, ImpactRow, QueueItem } from "./types";
import { PRICING_ALERT_ITEM } from "./pricing-data";

export { acsRiskProducts as complianceProducts } from "./risk-catalog";
import {
  maa200DataSheetDiff,
  maa200ProductPageDiff,
  maa200QuickStartDiff,
  maa200WiringDiff,
} from "./demoData";

/**
 * Brand names are mocked. Swap these labels in one place if the demo needs a
 * different set of companies.
 */
export const ACS_GROUP = "ACS Group";

/** The inbox starts with the existing pricing escalation. */
export const INITIAL_QUEUE: QueueItem[] = [PRICING_ALERT_ITEM];

/** Created when the compliance subagent discovers the refrigerant exposure. */
export const COMPLIANCE_ALERT_ITEM: QueueItem = {
  id: "compliance-alert",
  severity: "red",
  type: "Compliance alert",
  scope: "MAA-200",
  summary: `Uses R-410A, banned from ${REFRIGERANT_YEAR} — 8,400 shipped, 1,200 open`,
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
  ecrId: `ECR-${CURRENT_YEAR}-0142`,
  whereUsed: 3,
  redline: {
    from: "§7.2 Wiring — 2-wire diagram (rev A)",
    to: "§7.2 Wiring — 3-wire diagram (rev C)",
  },
  diff: maa200WiringDiff,
};

export type ManualPageSpec = {
  page: number;
  firstLineNumber: number;
  path: string;
  heading: string;
  title: string;
  chapter: string;
  context: string;
  document: {
    title: string;
    id: string;
    revision: string;
    published: string;
    status: string;
    owner: string;
  };
  scope: string;
  source: { label: string; page: number; excerpt: string };
  terminals: {
    terminal: string;
    function: string;
    color: string;
    note: string;
  }[];
  terminalNote: string;
  notes: {
    tone: "warning" | "caution" | "note";
    title: string;
    text: string;
  }[];
  references: { label: string; value: string }[];
  revisionHistory: { revision: string; date: string; note: string }[];
  currentLines: string[];
  proposedLines: string[];
};

/** Page 14 of the MAA-200 manual, used by the page editor. */
export const MAA200_WIRING_PAGE: ManualPageSpec = {
  page: 14,
  firstLineNumber: 12,
  path: "MAA-200 Installation Manual · §7.2 Wiring",
  heading: "§7.2 Wiring",
  title: "7.2 Control Wiring",
  chapter: "Section 7 · Electrical",
  context: "rev A p.14 → rev C",
  document: {
    title: "MAA-200 Installation Manual",
    id: "MAA-200-IM-001",
    revision: "Rev A",
    published: "2019-06",
    status: "Controlled document",
    owner: "Docs team",
  },
  scope:
    "The MAA-200 uses a 24 VAC control circuit. Route field wiring from the thermostat to the low-voltage terminal block through the left-hand grommet. Keep control wiring separated from line-voltage conductors.",
  source: {
    label: "MAA-200 Engineering Specification (rev C) · §7.2",
    page: 3,
    excerpt:
      "The control circuit requires a three-wire connection to the indoor unit. Terminals R, C, and G must be wired. This supersedes the two-wire arrangement in earlier revisions.",
  },
  terminals: [
    {
      terminal: "R",
      function: "24 VAC hot",
      color: "Red",
      note: "Fused control power",
    },
    {
      terminal: "C",
      function: "24 VAC common",
      color: "Blue",
      note: "Do not bond to chassis",
    },
    {
      terminal: "G",
      function: "Indoor fan",
      color: "Green",
      note: "Continuous fan / low speed",
    },
  ],
  terminalNote:
    "Three-wire connection: R, C, and G. The W terminal is not used on the MAA-200.",
  notes: [
    {
      tone: "warning",
      title: "Electrical hazard",
      text: "Disconnect power at the service switch and confirm 0 VAC before opening the control box.",
    },
    {
      tone: "caution",
      title: "Control-board protection",
      text: "Verify 24 VAC between R and C before reconnecting the thermostat. A miswired common can damage the control board.",
    },
    {
      tone: "note",
      title: "Field wiring",
      text: "Use 18 AWG minimum. Maximum recommended run is 150 ft. Torque terminal screws to 0.5 N·m (4.4 in-lb).",
    },
  ],
  references: [
    { label: "§7.1", value: "Power wiring and disconnect" },
    { label: "§8.3", value: "Startup and checkout" },
    { label: "Spec rev C §7.2", value: "Three-wire requirement" },
    { label: "Data sheet rev B", value: "Published 2-wire configuration" },
  ],
  revisionHistory: [
    { revision: "Rev A", date: "2019-06", note: "Initial release." },
    {
      revision: "Draft",
      date: "Pending ECR",
      note: "Three-wire control update.",
    },
  ],
  currentLines: [
    "Control Wiring Diagram",
    "Two-wire control connection (rev A).",
    "Disconnect power at the service switch and confirm 0 VAC.",
    "Remove the control-box cover.",
    "Route the thermostat cable through the left-hand grommet.",
    "Strip 1/4 in (6 mm) of insulation from each conductor.",
    "Connect the thermostat to terminals R and C.",
    "Tighten the terminal screws to 0.5 N·m (4.4 in-lb).",
    "Diagram 7.2 shows a two-wire control connection.",
    "Label the thermostat cable and record the configuration in the startup checklist.",
    "Seal the grommet after routing.",
    "Restore power and verify 24 VAC between R and C.",
  ],
  proposedLines: [
    "Control Wiring Diagram",
    "Three-wire control connection (rev C).",
    "Disconnect power at the service switch and confirm 0 VAC.",
    "Remove the control-box cover.",
    "Route the thermostat cable through the left-hand grommet.",
    "Strip 1/4 in (6 mm) of insulation from each conductor.",
    "Connect the thermostat to terminals R, C, and G.",
    "Tighten the terminal screws to 0.5 N·m (4.4 in-lb).",
    "Diagram 7.2 shows a three-wire control connection.",
    "Label the thermostat cable and record the configuration in the startup checklist.",
    "Seal the grommet after routing.",
    "Restore power and verify 24 VAC between R and C.",
  ],
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
    document: "MAA-200 Installer Quick-Start Guide",
    type: "Guide",
    trigger: "§7.2 wiring",
    owner: "Field team",
    status: "Proposal ready",
    diff: maa200QuickStartDiff,
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
export const BAN_EFFECTIVE = REFRIGERANT_DEADLINE_LABEL;
export const REVIEW_DATE = REVIEW_DATE_LABEL;
