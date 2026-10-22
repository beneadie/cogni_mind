import { CURRENT_YEAR, REFRIGERANT_YEAR } from "./dates";
import type { TurnPlan } from "./flow";
import type {
  ComplianceAction,
  ComplianceOption,
  ComplianceOutcome,
  ImpactRow,
} from "./types";
import {
  BAN_EFFECTIVE,
  REVIEW_DATE,
  complianceProducts,
  fieldReportChange,
} from "./queue-data";
import { productDossiers, riskRecord } from "./risk-catalog";

/** Documentation mismatch → documentation change. The audit already did the work. */
export function queueDocumentationTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "text",
        text: "While auditing the drafted data sheet, I compared §7.2 of the MAA-200 installation manual against the draft and the current spec. The manual shows 2 wires; the draft and spec rev C require 3.",
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "finding",
          text: "I reviewed the manual and the reference drawings against the draft. The audit is right — the manual is two revisions behind the rev C spec.",
          emphasis: "The audit is right",
        },
      },
      {
        kind: "text",
        text: "Here's the proposed §7.2 amendment for the Docs team.",
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "change-proposal",
          queueItemId: "documentation-mismatch",
        },
      },
    ],
    onDone,
  };
}

export function queueFieldApproveTurn(
  onDone: () => void,
  proposal = fieldReportChange.proposed,
): TurnPlan {
  const { ecrId } = fieldReportChange;
  const proposed = proposal.trim() || fieldReportChange.proposed;
  return {
    beats: [
      {
        kind: "thought",
        text: "Sending the §7.2 proposal to the Docs team.",
      },
      {
        kind: "action",
        label: "Sending proposal to the Docs team",
        command: `proposal.send('${ecrId}', owner='Docs')`,
        result: "sent",
        ms: 900,
      },
      {
        kind: "text",
        text: `Proposal sent to the Docs team: “${proposed}” The manual stays rev A until they accept, and I'll track it to closure.`,
      },
    ],
    onDone,
  };
}

/** Change propagation → update downstream literature. */
export function queuePropagationTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Checking what else refers to §7.2.",
      },
      {
        kind: "action",
        label: "Finding every document that used §7.2",
        command: "whereused('§7.2')",
        result: "3 documents",
        ms: 1050,
      },
      {
        kind: "card",
        message: { role: "agent", kind: "queue-propagation", queueItemId: "propagation" },
      },
      {
        kind: "text",
        text: "Three related documents need the same §7.2 proposal. I can send it to each owner.",
      },
    ],
    onDone,
  };
}

export function queuePropagationApplyTurn(
  sentRows: ImpactRow[],
  remainingCount: number,
  onDone: () => void,
): TurnPlan {
  const count = sentRows.length;
  const owners = Array.from(new Set(sentRows.map((row) => row.owner)));
  const ownerText =
    owners.length === 0
      ? "the owners"
      : owners.length === 1
        ? owners[0]
        : `${owners.slice(0, -1).join(", ")} and ${owners[owners.length - 1]}`;

  return {
    beats: [
      {
        kind: "thought",
        text: "Sending the §7.2 proposal to the selected document owners.",
      },
      {
        kind: "action",
        label: `Sending proposals to ${ownerText}`,
        command: `proposal.send(docs=${count})`,
        result: `${count} sent`,
        ms: 900,
      },
      {
        kind: "text",
        text:
          remainingCount > 0
            ? `Sent ${count} proposal${count === 1 ? "" : "s"} to ${ownerText}. ${remainingCount} document${remainingCount === 1 ? "" : "s"} still need a proposal, so the alert stays open.`
            : `Proposals sent to ${ownerText}. Each owner will apply the change in their own system.`,
      },
    ],
    onDone,
  };
}

/** Compliance alert → review both exposed products in one case. */
export function queueComplianceTurn(onDone: () => void): TurnPlan {
  const topProduct = [...complianceProducts].sort(
    (a, b) => b.unitsShippedValue - a.unitsShippedValue,
  )[0];

  return {
    beats: [
      {
        kind: "text",
        text: `I checked the refrigerant on the new MAA-200 data sheet against the ${REFRIGERANT_YEAR} refrigerant ban, then cross-referenced the ACS group catalog, shipped units, and open orders. MAA-200 and NA-1500 are affected.`,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "compliance-case",
          queueItemId: "compliance-alert",
        },
      },
      {
        kind: "text",
        text: `${topProduct?.product ?? "MAA-200"} has the most volume affected. Review each product in the case, then choose one mitigation per product.`,
      },
    ],
    onDone,
  };
}

/** The three mitigation paths offered on the decision card. */
export const COMPLIANCE_OPTIONS: ComplianceOption[] = [
  {
    id: "change-request",
    label: "Open change request",
    description:
      "Assign the mitigation to the product owner and set a future review reminder.",
    result: "Tracking",
    primary: true,
  },
  {
    id: "request-declaration",
    label: "Request declaration",
    description:
      "Ask the owner for an updated material declaration for the restricted substance.",
    result: "Tracking",
  },
  {
    id: "acknowledge",
    label: "Acknowledge risk",
    description:
      "Record the exposure without opening mitigation work.",
    result: "Acknowledged",
  },
];

function ownerSystemFor(company: string): string {
  return `${company} compliance queue`;
}

/** Build the structured record shown after a mitigation choice. */
export function complianceOutcomeFor(
  productId: string,
  action: ComplianceAction,
): ComplianceOutcome {
  const record = riskRecord(productId);
  const company = record?.company ?? "ACS Group";
  const owner = record?.owner ?? "the product owner";
  const deadline = record?.deadline ?? BAN_EFFECTIVE;
  const ownerSystem = ownerSystemFor(company);

  if (action === "change-request") {
    return {
      action,
      product: productId,
      title: "Change request opened",
      referenceId: `CR-${CURRENT_YEAR}-0143`,
      status: "tracking",
      summary: `The mitigation is assigned to ${owner} with a review reminder for ${REVIEW_DATE}. The alert stays in Tracking until the change is resolved.`,
      details: [
        { label: "Owner", value: `${owner} · ${company}` },
        { label: "Review reminder", value: REVIEW_DATE },
        { label: "Reminder sent to", value: ownerSystem },
        { label: "Mitigation due", value: deadline },
      ],
    };
  }

  if (action === "request-declaration") {
    return {
      action,
      product: productId,
      title: "Declaration requested",
      referenceId: `REQ-${CURRENT_YEAR}-0088`,
      status: "tracking",
      summary: `I asked ${owner} for an updated material declaration on ${productId}. The request is in their compliance queue and the alert stays in Tracking.`,
      details: [
        { label: "Requested from", value: `${owner} · ${company}` },
        { label: "Response due", value: REVIEW_DATE },
        { label: "Request sent to", value: ownerSystem },
        { label: "Restricted substance", value: record?.substance ?? "—" },
      ],
    };
  }

  return {
    action,
    product: productId,
    title: "Risk acknowledged",
    referenceId: `ACK-${CURRENT_YEAR}-0031`,
    status: "acknowledged",
    summary: `You acknowledged the ${productId} exposure. No mitigation work was opened; the risk record stays on file and I'll flag it if the exposure changes.`,
    details: [
      { label: "Recorded by", value: "You" },
      { label: "Product", value: `${productId} · ${company}` },
      { label: "Mitigation work", value: "None opened" },
      { label: "Deadline", value: deadline },
    ],
  };
}

/**
 * Open a product: fetch everything on file into the workspace, then surface a
 * sourced finding (units, not revenue) and the resolution options.
 */
export function viewProductTurn(
  productId: string,
  onDone: () => void,
): TurnPlan {
  const record = riskRecord(productId);
  const substance = record?.substance ?? "a restricted substance";
  const units = record?.unitsShipped ?? "0";
  const orders = record?.openOrders ?? "0";
  const count = productDossiers[productId]?.length ?? 0;

  return {
    beats: [
      {
        kind: "thought",
        text: `Pulling everything we have on ${productId} — the product record, the parts list, the material declaration, shipped units and open orders, the spec and data sheet, and open cases.`,
      },
      {
        kind: "action",
        label: `Fetching the ${productId} product record`,
        command: `erp.item('${productId}')`,
        result: "1 record",
        ms: 850,
      },
      {
        kind: "action",
        label: "Fetching the parts list",
        command: `bom.get('${productId}')`,
        result: "14 components",
        ms: 800,
      },
      {
        kind: "action",
        label: "Fetching the material declaration",
        command: `fmd.get('${productId}')`,
        result: substance,
        ms: 800,
      },
      {
        kind: "action",
        label: "Fetching shipped units and open orders",
        command: `sales.units('${productId}')`,
        result: `${units} shipped · ${orders} open`,
        ms: 850,
      },
      {
        kind: "action",
        label: "Fetching the current spec and data sheet",
        command: `vault.get('${productId}')`,
        result: "2 files",
        ms: 800,
      },
      {
        kind: "note",
        text: `${count} records added to the workspace.`,
        tone: "info",
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "compliance-exposure",
          productId,
        },
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "compliance-options",
          productId,
          complianceOptions: COMPLIANCE_OPTIONS,
        },
      },
    ],
    onDone,
  };
}

/** Perform the committed mitigation and show the resulting record. */
export function queueComplianceActTurn(
  productId: string,
  action: ComplianceAction,
  onDone: () => void,
): TurnPlan {
  const record = riskRecord(productId);
  const company = record?.company ?? "ACS Group";
  const owner = record?.owner ?? "the product owner";
  const outcome = complianceOutcomeFor(productId, action);

  if (action === "change-request") {
    return {
      beats: [
        {
          kind: "thought",
          text: "Opening a change request and assigning the mitigation owner.",
        },
        {
          kind: "action",
          label: `Assigning the change request to ${owner}`,
          command: `changeRequest.open('${productId}', owner='${owner}')`,
          result: outcome.referenceId,
          ms: 900,
        },
        {
          kind: "action",
          label: `Sending the review reminder to ${company}`,
          command: `remind('${outcome.referenceId}', date='${REVIEW_DATE}')`,
          result: REVIEW_DATE,
          ms: 800,
        },
        {
          kind: "card",
          message: {
            role: "agent",
            kind: "compliance-outcome",
            complianceOutcome: outcome,
          },
        },
      ],
      onDone,
    };
  }

  if (action === "request-declaration") {
    return {
      beats: [
        {
          kind: "thought",
          text: `Requesting an updated material declaration from ${owner}.`,
        },
        {
          kind: "action",
          label: `Sending the declaration request to ${owner}`,
          command: `declaration.request('${productId}', owner='${owner}')`,
          result: outcome.referenceId,
          ms: 900,
        },
        {
          kind: "card",
          message: {
            role: "agent",
            kind: "compliance-outcome",
            complianceOutcome: outcome,
          },
        },
      ],
      onDone,
    };
  }

  return {
    beats: [
      {
        kind: "thought",
        text: "Recording the risk acknowledgement.",
      },
      {
        kind: "action",
        label: `Acknowledging the ${productId} exposure`,
        command: `risk.acknowledge('${productId}')`,
        result: outcome.referenceId,
        ms: 900,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "compliance-outcome",
          complianceOutcome: outcome,
        },
      },
    ],
    onDone,
  };
}

/** Convenience: the beat list for a queue item's opening turn, keyed by id. */
export const QUEUE_TURNS: Record<
  string,
  (onDone: () => void) => TurnPlan
> = {
  "documentation-mismatch": queueDocumentationTurn,
  "compliance-alert": queueComplianceTurn,
  propagation: queuePropagationTurn,
};
