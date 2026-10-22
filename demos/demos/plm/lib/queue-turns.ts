import type { TurnPlan } from "./flow";
import type { ComplianceAction, PromptOption } from "./types";
import { BAN_EFFECTIVE, REVIEW_DATE, fieldReportChange } from "./queue-data";
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

export function queueFieldApproveTurn(onDone: () => void): TurnPlan {
  const { ecrId } = fieldReportChange;
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
        text: "Proposal sent to the Docs team. The manual stays rev A until they accept, and I'll track it to closure.",
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

export function queuePropagationApplyTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "thought",
        text: "Sending the §7.2 proposal to each document owner.",
      },
      {
        kind: "action",
        label: "Sending proposals to the Web and Docs teams",
        command: "proposal.send(docs=3)",
        result: "3 sent",
        ms: 1050,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "queue-propagation",
          queueItemId: "propagation",
          sent: true,
        },
      },
      {
        kind: "text",
        text: "Proposals sent to the Web and Docs teams. Each owner will apply the change in their own system.",
      },
    ],
    onDone,
  };
}

/** Compliance alert → inspect an exposed product. The scan is already done. */
export function queueComplianceTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "text",
        text: "I checked the refrigerant on the new MAA-200 data sheet against the 2027 refrigerant ban, then cross-referenced the ACS group catalog, shipped units, and open orders. MAA-200 and NA-1500 are affected.",
      },
      {
        kind: "card",
        message: { role: "agent", kind: "queue-regulation", queueItemId: "compliance-alert" },
      },
      {
        kind: "text",
        text: "MAA-200 has the most volume affected. Open a product to pull everything we have on it.",
      },
    ],
    onDone,
  };
}

/** The three mitigation paths offered as suggested replies. */
export const MITIGATION_PROMPTS: PromptOption[] = [
  {
    id: "reminder",
    label: "Set a reminder",
    action: "compliance-act",
    payload: "reminder",
  },
  {
    id: "close",
    label: "Close issue",
    action: "compliance-act",
    payload: "close",
  },
  {
    id: "assign",
    label: "Send to responsible person",
    action: "compliance-act",
    payload: "assign",
  },
];

/**
 * Open a product: fetch everything on file into the workspace, then surface a
 * sourced finding (units, not revenue) and the resolution options.
 */
export function viewProductTurn(
  productId: string,
  onDone: () => void,
): TurnPlan {
  const record = riskRecord(productId);
  const company = record?.company ?? "the group";
  const substance = record?.substance ?? "a restricted substance";
  const regulation = record?.regulation ?? "the upcoming restriction";
  const deadline = record?.deadline ?? BAN_EFFECTIVE;
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
        result: `${units} shipped`,
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
          kind: "finding",
          text: `${productId} (${company}) carries ${substance}, restricted under ${regulation} from ${deadline}. ERP shows ${units} units shipped in the last 12 months with ${orders} on open orders — it needs a mitigation plan, not just a note.`,
          emphasis: `restricted under ${regulation}`,
        },
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "prompts",
          productId,
          prompts: MITIGATION_PROMPTS,
        },
      },
    ],
    onDone,
  };
}

/** Perform the committed mitigation: remind, close, or assign the owner. */
export function queueComplianceActTurn(
  productId: string,
  action: ComplianceAction,
  onDone: () => void,
): TurnPlan {
  const record = riskRecord(productId);
  const company = record?.company ?? "the group";
  const owner = record?.owner ?? "the product owner";
  const deadline = record?.deadline ?? BAN_EFFECTIVE;

  if (action === "reminder") {
    return {
      beats: [
        {
          kind: "thought",
          text: "Scheduling a review reminder ahead of the deadline.",
        },
        {
          kind: "action",
          label: "Setting a review reminder",
          command: `remind('${productId}', date='${REVIEW_DATE}')`,
          result: REVIEW_DATE,
          ms: 900,
        },
        {
          kind: "text",
          text: `Reminder set for ${REVIEW_DATE}. I'll bring ${productId} back to you then — ahead of the ${deadline} deadline — unless a mitigation is opened sooner.`,
        },
      ],
      onDone,
    };
  }

  if (action === "assign") {
    return {
      beats: [
        {
          kind: "thought",
          text: "Sending the exposure to the responsible owner.",
        },
        {
          kind: "action",
          label: `Sending to ${owner} at ${company}`,
          command: `assign('${productId}', owner='${owner}')`,
          result: "sent",
          ms: 900,
        },
        {
          kind: "text",
          text: `Sent to ${owner} at ${company}. They own the mitigation plan for ${productId}, and I'll track it to closure.`,
        },
      ],
      onDone,
    };
  }

  return {
    beats: [
      {
        kind: "thought",
        text: "Closing the compliance alert.",
      },
      {
        kind: "action",
        label: `Closing the ${productId} compliance alert`,
        command: `issue.close('${productId}')`,
        result: "closed",
        ms: 900,
      },
      {
        kind: "text",
        text: `Compliance alert closed. The risk record for ${productId} stays on file, and I'll flag it if the exposure changes.`,
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
