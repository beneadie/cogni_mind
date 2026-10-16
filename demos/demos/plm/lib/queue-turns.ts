import type { TurnPlan } from "./flow";
import type { ComplianceAction, PromptOption } from "./types";
import {
  BAN_EFFECTIVE,
  ECN_ID,
  REVIEW_DATE,
  fieldReportChange,
} from "./queue-data";
import {
  maa200DataSheetDiff,
  maa200ProductPageDiff,
  maa200SellSheetDiff,
  maa200WiringDiff,
} from "./demoData";
import { productDossiers, riskRecord } from "./risk-catalog";

/** Field report → documentation change. The work is already done. */
export function queueFieldReportTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "text",
        text: "A technician reported a mismatch: the wiring diagram in §7.2 of the MAA-200 manual shows 2 wires, but the unit actually has 3.",
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "finding",
          text: "I reviewed the manual against the current spec. The technician is right — the manual is two revisions behind the rev C spec.",
          emphasis: "The technician is right",
        },
      },
      {
        kind: "text",
        text: "I've drafted the amendment to §7.2. It's waiting on your approval.",
      },
      {
        kind: "card",
        message: { role: "agent", kind: "change-proposal", queueItemId: "field-report" },
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
        text: "Publishing the revised manual and closing out the change request.",
      },
      {
        kind: "action",
        label: "Publishing MAA-200 Installation Manual",
        command: "publish(manual, rev='C')",
        result: "rev C",
        ms: 1100,
      },
      {
        kind: "action",
        label: "Closing the change request",
        command: `eco.approve('${ecrId}')`,
        result: ECN_ID,
        ms: 1000,
      },
      {
        kind: "text",
        text: `Manual published to rev C under ${ECN_ID}. Case CS-4821 is notified and closed, and the change is logged for audit.`,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "doc-diff",
          diff: maa200WiringDiff,
          applied: true,
        },
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "warning",
          title: "Warning · Downstream impact",
          text: "That change leaves 3 documents referencing §7.2 stale — review before they drift further.",
          emphasis: "3 documents referencing §7.2 stale",
          items: ["2 can auto-update", "1 needs authoring"],
        },
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
        text: "Checking what else used the changed §7.2 wiring.",
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
        text: "Two are single-sourced and can auto-update; the data sheet needs an authoring pass. Propagate the change?",
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
        text: "Publishing the reusable updates and raising the remaining task.",
      },
      {
        kind: "action",
        label: "Auto-updating single-sourced documents",
        command: "publish(reuse)",
        result: "2 updated",
        ms: 1100,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "doc-diff",
          diff: maa200ProductPageDiff,
          applied: true,
        },
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "doc-diff",
          diff: maa200SellSheetDiff,
          applied: true,
        },
      },
      {
        kind: "action",
        label: "Raising an authoring task",
        command: "task.create(doc='MAA-200 Data Sheet', team='Docs')",
        result: "TASK-7781",
        ms: 950,
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "doc-diff",
          diff: maa200DataSheetDiff,
        },
      },
      {
        kind: "text",
        text: "Done — the product page and sell sheet are updated, and the data sheet is assigned to the Docs team under TASK-7781. Owners have been notified.",
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
        text: "I checked the ACS group catalog against the 2027 refrigerant ban and cross-referenced shipped units and open orders. Two products are affected.",
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

/** The four mitigation paths offered as suggested replies. */
export const MITIGATION_PROMPTS: PromptOption[] = [
  {
    id: "open-cr",
    label: "Open change request",
    action: "compliance-act",
    payload: "open-cr",
  },
  {
    id: "declaration",
    label: "Request declaration",
    action: "compliance-act",
    payload: "declaration",
  },
  {
    id: "reminder",
    label: "Set a reminder",
    action: "compliance-act",
    payload: "reminder",
  },
  {
    id: "acknowledge",
    label: "Acknowledge risk",
    action: "compliance-act",
    payload: "acknowledge",
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

/** Perform the committed mitigation: open a CR, set a reminder, or accept the risk. */
export function queueComplianceActTurn(
  productId: string,
  action: ComplianceAction,
  onDone: () => void,
): TurnPlan {
  const record = riskRecord(productId);
  const company = record?.company ?? "the group";
  const owner = record?.owner ?? "the product owner";
  const deadline = record?.deadline ?? BAN_EFFECTIVE;

  if (action === "open-cr") {
    return {
      beats: [
        {
          kind: "thought",
          text: "Opening a change request, assigning an owner, and scheduling a review.",
        },
        {
          kind: "action",
          label: `Opening a change request for ${productId}`,
          command: `cr.open('${productId}', type='material-swap')`,
          result: "CR-118",
          ms: 1100,
        },
        {
          kind: "action",
          label: `Assigning ${owner} (${company})`,
          command: `assign(CR-118, owner='${owner}')`,
          result: "assigned",
          ms: 900,
        },
        {
          kind: "action",
          label: "Setting a review reminder",
          command: `remind(CR-118, date='${REVIEW_DATE}')`,
          result: REVIEW_DATE,
          ms: 900,
        },
        {
          kind: "text",
          text: `Done — CR-118 is open and assigned to ${owner} at ${company}, with a review reminder for ${REVIEW_DATE}, ahead of the ${deadline} deadline. I'll track it to closure.`,
        },
      ],
      onDone,
    };
  }

  if (action === "declaration") {
    return {
      beats: [
        {
          kind: "thought",
          text: "Requesting a full material declaration from the supplier.",
        },
        {
          kind: "action",
          label: "Requesting a substance declaration",
          command: `fmd.request('${productId}', substance='${record?.substance ?? "restricted"}')`,
          result: "requested",
          ms: 950,
        },
        {
          kind: "text",
          text: `Requested a full material declaration for ${productId} from the supplier. I'll attach it to the compliance file when it arrives, and track it against the ${deadline} deadline in the meantime.`,
        },
      ],
      onDone,
    };
  }

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

  return {
    beats: [
      {
        kind: "text",
        text: `Noted — ${productId} is recorded as an accepted risk pending the ${deadline} review, with the rationale on file. I'll flag it automatically if the exposure changes.`,
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
  "field-report": queueFieldReportTurn,
  "compliance-alert": queueComplianceTurn,
  propagation: queuePropagationTurn,
};
