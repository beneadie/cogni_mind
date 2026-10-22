import { CURRENT_YEAR } from "./dates";
import type {
  PricingDecision,
  PricingOption,
  PricingOutcome,
  QueueItem,
} from "./types";

export const PRICING_ALERT_ITEM: QueueItem = {
  id: "parts-pricing-mismatch",
  severity: "amber",
  type: "Pricing Mismatch Escalation",
  scope: "CP-31K",
  summary:
    "Same compressor: $320 via Delta vs $400 via Summit — 2,400 units last year",
  action: "Review",
  status: "open",
};

export const PRICING_CASE = {
  partNumber: "CP-31K",
  partName: "Scroll compressor",
  products: ["MAA-200", "NA-1500"],
  volume: "2,400 units last year",
  priceGap: "$80/unit",
  annualGap: "~$192k last year",
  source: "SAP S/4HANA part master · 2 active vendor records",
  suppliers: [
    {
      id: "delta",
      name: "Delta Components",
      unitPrice: "$320",
      leadTime: "8-week lead",
      cover: "Covers ~65% of peak",
      usedIn: "MAA-200",
    },
    {
      id: "summit",
      name: "Summit HVAC Supply",
      unitPrice: "$400",
      leadTime: "4-week lead",
      cover: "Covers 100% of peak",
      usedIn: "NA-1500",
    },
  ],
};

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "keep-dual",
    label: "Keep both suppliers",
    description:
      "Retain Summit for peak coverage. The $80/unit gap stays in place.",
    result: "Acknowledged",
  },
  {
    id: "consolidate-delta",
    label: "Consolidate on Delta",
    description:
      "Move both units to $320/unit. Confirm the 8-week lead can cover peak.",
    result: "Tracking",
  },
  {
    id: "consolidate-summit",
    label: "Consolidate on Summit",
    description:
      "Move both units to $400/unit. Keep full peak coverage at the higher price.",
    result: "Tracking",
  },
];

export function pricingOutcomeFor(decision: PricingDecision): PricingOutcome {
  if (decision === "keep-dual") {
    return {
      decision,
      title: "Dual sourcing retained",
      referenceId: `DEC-${CURRENT_YEAR}-0214`,
      status: "acknowledged",
      summary:
        "Both suppliers stay active. The supply-cover rationale is recorded, and the $80/unit gap remains.",
      queueSummary: "Dual source retained — resolved",
      details: [
        { label: "Decision", value: "Keep both suppliers" },
        { label: "Supply cover", value: "Summit retained as second source" },
        { label: "Cost gap", value: "$80/unit · ~$192k last year" },
        { label: "Review", value: "Next quarterly price review" },
      ],
    };
  }

  if (decision === "consolidate-delta") {
    return {
      decision,
      title: "Consolidating on Delta",
      referenceId: `PR-${CURRENT_YEAR}-0117`,
      status: "tracking",
      summary:
        "Procurement will move both units to Delta at $320/unit. Capacity confirmation and the effective date are tracked.",
      queueSummary: "Consolidation to Delta — resolved",
      details: [
        { label: "Supplier", value: "Delta Components" },
        { label: "Unit price", value: "$320" },
        { label: "Lead time", value: "8-week lead" },
        { label: "Owner", value: "L. Chen · Procurement" },
        {
          label: "Effective",
          value: "Pending capacity confirmation",
        },
      ],
    };
  }

  return {
    decision,
    title: "Consolidating on Summit",
    referenceId: `PR-${CURRENT_YEAR}-0118`,
    status: "tracking",
    summary:
      "Procurement will move both units to Summit at $400/unit. The mismatch closes, and full peak coverage is retained.",
      queueSummary: "Consolidation to Summit — resolved",
    details: [
      { label: "Supplier", value: "Summit HVAC Supply" },
      { label: "Unit price", value: "$400" },
      { label: "Lead time", value: "4-week lead" },
      { label: "Owner", value: "L. Chen · Procurement" },
      {
        label: "Effective",
        value: "Pending supplier confirmation",
      },
    ],
  };
}
