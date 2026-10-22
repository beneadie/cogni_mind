import { REFRIGERANT_YEAR } from "./dates";
import type { TurnPlan } from "./flow";
import {
  AUDIT_PAGE_COUNT,
  AUDIT_REVIEW_FIELDS,
  AUDIT_SUBAGENTS,
  EXTRACTED_FIELDS,
  type AuditReviewValues,
} from "./audit-data";

/** Ask for the engineering spec. The upload card is posted once the turn settles. */
export function auditIntroTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "text",
        text: `Attach the new MAA-200 engineering spec and I'll draft the standard data sheet. I'll flag missing or conflicting values for you, then compare the draft to the installation manual, the published sheet, and the ${REFRIGERANT_YEAR} refrigerant rules.`,
      },
    ],
    onDone,
  };
}

/** Read the uploaded spec and draft the standard data-sheet fields. */
export function auditScanTurn(
  fileName: string,
  kind: "csv" | "pdf",
  onDone: () => void,
): TurnPlan {
  const readLabel =
    kind === "csv"
      ? "Opening the uploaded spec"
      : "Reading the uploaded engineering spec";
  const readCommand = `${kind}.open('${fileName}')`;
  const readResult = kind === "csv" ? "18 rows" : `${AUDIT_PAGE_COUNT} pages`;
  return {
    beats: [
      {
        kind: "text",
        text: `Got it — reading ${fileName} now.`,
      },
      {
        kind: "thought",
        text: "I'll read the scan, fill the standard HVAC data-sheet template, and flag anything missing, conflicting, or uncertain instead of guessing.",
      },
      {
        kind: "action",
        label: readLabel,
        command: readCommand,
        result: readResult,
        ms: 750,
      },
      {
        kind: "action",
        label: "Running OCR + layout analysis",
        command: "ocr(layout=True, dpi=300)",
        result: readResult,
        ms: 900,
      },
      {
        kind: "action",
        label: "Drafting the standard data sheet",
        command: "extract(template='hvac_datasheet_v2')",
        result: `${EXTRACTED_FIELDS.length} fields`,
        ms: 1000,
      },
      {
        kind: "action",
        label: "Cross-checking against published rev B",
        command: "diff(spec, published)",
        result: "1 conflict",
        ms: 850,
      },
      {
        kind: "observe",
        text: "Control wiring conflicts: spec rev C requires 3-wire, but published rev B still shows 2-wire.",
      },
      {
        kind: "observe",
        text: "Weight and warranty are missing from the spec, and the refrigerant charge is an uncertain OCR read.",
      },
      {
        kind: "action",
        label: "Flagging values that need a human",
        command: "flag(missing, conflict, uncertain)",
        result: `${AUDIT_REVIEW_FIELDS.length} fields`,
        ms: 900,
      },
      {
        kind: "card",
        message: { role: "agent", kind: "extracted-sheet" },
      },
      {
        kind: "text",
        text: `I drafted the ${EXTRACTED_FIELDS.length}-field sheet from the spec and flagged ${AUDIT_REVIEW_FIELDS.length} values for review. Now I'll have specialists check it against compliance, the manual, and the published data sheet.`,
      },
    ],
    onDone,
  };
}

/** Run the three specialists and let them create alerts as they finish. */
export function auditSubagentsTurn(
  onDone: () => void,
  permissionRemembered = false,
): TurnPlan {
  return {
    beats: [
      {
        kind: "subagents",
        agents: AUDIT_SUBAGENTS,
        ms: 9000,
        launchDelayMs: 1500,
        permissionRemembered,
      },
      {
        kind: "text",
        text: `I read the spec, drafted ${EXTRACTED_FIELDS.length} fields, and flagged ${AUDIT_REVIEW_FIELDS.length} values for a human. I created two alerts above; the draft is ready for review below.`,
      },
      { kind: "card", message: { role: "agent", kind: "audit-summary" } },
    ],
    onDone,
  };
}

/** The user declined the specialist checks; keep the draft review path open. */
export function auditSkippedTurn(onDone: () => void): TurnPlan {
  return {
    beats: [
      {
        kind: "text",
        text: "Okay — I won't run the specialist checks. I'll leave the draft ready for review and won't create downstream alerts.",
      },
      { kind: "card", message: { role: "agent", kind: "audit-summary" } },
    ],
    onDone,
  };
}

/** Publish the reviewed drafted data sheet. */
export function auditPublishTurn(
  values: AuditReviewValues,
  onDone: () => void,
): TurnPlan {
  const reviewed = Object.keys(values).length;
  return {
    beats: [
      {
        kind: "thought",
        text: "Recording the reviewed values and publishing the drafted sheet as rev D.",
      },
      {
        kind: "action",
        label: "Applying the reviewed values",
        command: "sheet.apply(reviewed_values)",
        result: `${reviewed} applied`,
        ms: 850,
      },
      {
        kind: "action",
        label: "Publishing MAA-200 Data Sheet",
        command: "publish(sheet, rev='D')",
        result: "rev D",
        ms: 950,
      },
      {
        kind: "card",
        message: { role: "agent", kind: "audit-published" },
      },
      {
        kind: "text",
        text: "Published as rev D. The documentation alert now has a clear target revision, and the compliance exposure is still waiting in the panel.",
      },
    ],
    onDone,
  };
}
