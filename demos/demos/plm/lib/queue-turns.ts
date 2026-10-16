import type { TurnPlan } from "./flow";
import type { ComplianceAction } from "./types";
import {
  BAN_EFFECTIVE,
  ECN_ID,
  REVIEW_DATE,
  complianceProducts,
  fieldReportChange,
} from "./queue-data";

function riskProduct(productId: string) {
  return complianceProducts.find((product) => product.product === productId);
}

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
        kind: "text",
        text: "That change leaves 3 documents referencing §7.2 stale — I've added a propagation task to your queue.",
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
        text: "Checking where the changed §7.2 content is referenced across the document set.",
      },
      {
        kind: "action",
        label: "Running where-used on §7.2",
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
        kind: "action",
        label: "Raising an authoring task",
        command: "task.create(doc='MAA-200 Data Sheet', team='Docs')",
        result: "TASK-7781",
        ms: 950,
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
        text: "I checked the ACS group catalog against the 2027 refrigerant ban and cross-referenced sales data. Two products are exposed.",
      },
      {
        kind: "card",
        message: { role: "agent", kind: "queue-regulation", queueItemId: "compliance-alert" },
      },
      {
        kind: "text",
        text: "MAA-200 is the largest exposure. Open a product to see what would need to change.",
      },
    ],
    onDone,
  };
}

export function queueComplianceViewTurn(
  productId: string,
  onDone: () => void,
): TurnPlan {
  const product = riskProduct(productId);
  const company = product?.company ?? "the group";
  const substance = product?.substance ?? "a restricted substance";
  const revenue = product?.annualRevenue ?? "material revenue";

  return {
    beats: [
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "finding",
          text: `${productId} (${company}) uses ${substance}, which is banned from 2027. That's ${revenue} in annual revenue exposed — this needs a mitigation decision, not just a note.`,
          emphasis: "banned from 2027",
        },
      },
      {
        kind: "card",
        message: {
          role: "agent",
          kind: "compliance-actions",
          queueItemId: "compliance-alert",
          productId,
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
  const product = riskProduct(productId);
  const company = product?.company ?? "the group";
  const owner = product?.owner ?? "the product owner";

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
          command: `cr.open('${productId}', type='refrigerant-swap')`,
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
          text: `Done — CR-118 is open and assigned to ${owner} at ${company}, with a review reminder for ${REVIEW_DATE}, ahead of the ${BAN_EFFECTIVE} ban. I'll track it to closure.`,
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
          command: `fmd.request('${productId}', substance='${product?.substance ?? "restricted"}')`,
          result: "requested",
          ms: 950,
        },
        {
          kind: "text",
          text: `Requested a full material declaration for ${productId} from the supplier. I'll attach it to the compliance file when it arrives, and track it against the ${BAN_EFFECTIVE} deadline in the meantime.`,
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
          text: "Scheduling a review reminder ahead of the ban.",
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
          text: `Reminder set for ${REVIEW_DATE}. I'll bring ${productId} back to you then — ahead of the ${BAN_EFFECTIVE} ban — unless a mitigation is opened sooner.`,
        },
      ],
      onDone,
    };
  }

  return {
    beats: [
      {
        kind: "text",
        text: `Noted — ${productId} is recorded as an accepted risk pending the ${BAN_EFFECTIVE} review, with the rationale on file. I'll flag it automatically if the exposure changes.`,
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
